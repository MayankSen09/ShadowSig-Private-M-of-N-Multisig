// ShadowSig Event Service
//
// Provides a tokio broadcast channel for real-time event distribution.
// The gateway holds an Arc<EventBus> in AppState. Route handlers call
// EventBus::publish() after every state-changing operation.  The
// GET /api/ws WebSocket endpoint subscribes each client to the channel.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;

/// The capacity of the broadcast channel (number of buffered events).
/// If a slow subscriber falls more than this many events behind it will
/// receive a `RecvError::Lagged` and should reconnect.
const CHANNEL_CAPACITY: usize = 256;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum EventType {
    ProposalCreated,
    ApprovalSubmitted,
    ProofGenerated,
    ProofVerified,
    ThresholdReached,
    ExecutionStarted,
    ExecutionCompleted,
    MemberAdded,
    MultisigCreated,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub event_type: EventType,
    pub payload: serde_json::Value,
    pub timestamp: DateTime<Utc>,
}

impl Event {
    pub fn new(event_type: EventType, payload: serde_json::Value) -> Self {
        Self {
            event_type,
            payload,
            timestamp: Utc::now(),
        }
    }
}

/// Thread-safe event bus backed by a tokio broadcast channel.
///
/// Clone `Arc<EventBus>` into every route handler that needs to publish,
/// and subscribe each WebSocket connection with `EventBus::subscribe()`.
#[derive(Clone)]
pub struct EventBus {
    sender: broadcast::Sender<Event>,
}

impl EventBus {
    /// Create a new event bus.
    pub fn new() -> Arc<Self> {
        let (sender, _) = broadcast::channel(CHANNEL_CAPACITY);
        Arc::new(Self { sender })
    }

    /// Publish an event to all active subscribers.
    /// Returns the number of receivers that received the message, or 0 if
    /// there are no active subscribers (not an error).
    pub fn publish(&self, event: Event) -> usize {
        match self.sender.send(event) {
            Ok(n) => n,
            Err(_) => 0, // No subscribers — safe to ignore
        }
    }

    /// Subscribe a new WebSocket client to the event stream.
    pub fn subscribe(&self) -> broadcast::Receiver<Event> {
        self.sender.subscribe()
    }

    /// Number of currently active subscribers.
    pub fn subscriber_count(&self) -> usize {
        self.sender.receiver_count()
    }
}

impl Default for EventBus {
    fn default() -> Self {
        let (sender, _) = broadcast::channel(CHANNEL_CAPACITY);
        Self { sender }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_publish_and_receive() {
        let bus = EventBus::new();
        let mut rx = bus.subscribe();

        let event = Event::new(
            EventType::ProposalCreated,
            serde_json::json!({ "proposal_id": "test-123" }),
        );
        let sent = bus.publish(event.clone());
        assert_eq!(sent, 1);

        let received = rx.recv().await.expect("should receive event");
        assert!(matches!(received.event_type, EventType::ProposalCreated));
    }

    #[tokio::test]
    async fn test_no_subscribers_is_safe() {
        let bus = EventBus::new();
        let event = Event::new(EventType::ExecutionCompleted, serde_json::json!({}));
        // No subscriber — publish should return 0 without panicking
        assert_eq!(bus.publish(event), 0);
    }
}
