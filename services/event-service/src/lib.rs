// ShadowSig Event Service
// Handles WebSocket connections and real-time event broadcasting

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    pub event_type: EventType,
    pub payload: serde_json::Value,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EventType {
    ProposalCreated,
    ApprovalSubmitted,
    ProofGenerated,
    ProofVerified,
    ThresholdReached,
    ExecutionStarted,
    ExecutionCompleted,
    MemberAdded,
}

/// Broadcast an event to all connected WebSocket clients
pub fn broadcast(_event: Event) {
    // TODO: Implement WebSocket broadcasting via tokio broadcast channel
    // In production:
    // 1. Serialize event
    // 2. Send to all connected clients via broadcast channel
    // 3. Also publish to NATS for inter-service communication
}
