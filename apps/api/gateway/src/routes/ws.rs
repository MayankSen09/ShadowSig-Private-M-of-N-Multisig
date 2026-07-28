use crate::AppState;
use axum::{
    extract::{
        ws::{Message, WebSocket},
        State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use std::sync::Arc;

/// `GET /api/ws`
///
/// Upgrades the connection to a WebSocket. The client will receive a
/// JSON-serialized `Event` for every state change that happens in the
/// gateway (proposal created, approval submitted, threshold reached, etc.).
///
/// The connection is read-only from the server's perspective — clients
/// cannot send commands over this channel.
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(mut socket: WebSocket, state: Arc<AppState>) {
    let mut rx = state.event_bus.subscribe();

    tracing::debug!(
        "WebSocket client connected — {} active subscribers",
        state.event_bus.subscriber_count()
    );

    loop {
        tokio::select! {
            // Forward broadcast events to the WebSocket client
            result = rx.recv() => {
                match result {
                    Ok(event) => {
                        let json = match serde_json::to_string(&event) {
                            Ok(j) => j,
                            Err(e) => {
                                tracing::warn!("Failed to serialize event: {}", e);
                                continue;
                            }
                        };
                        if socket.send(Message::Text(json.into())).await.is_err() {
                            // Client disconnected
                            break;
                        }
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                        tracing::warn!("WebSocket subscriber lagged by {} events", n);
                        // Send a lag notice so the client knows it missed events
                        let notice = serde_json::json!({
                            "event_type": "lag_notice",
                            "missed": n,
                        });
                        if socket.send(Message::Text(notice.to_string().into())).await.is_err() {
                            break;
                        }
                    }
                    Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                }
            }
            // Handle incoming client messages (ping/close only)
            msg = socket.recv() => {
                match msg {
                    Some(Ok(Message::Close(_))) | None => break,
                    Some(Ok(Message::Ping(data))) => {
                        if socket.send(Message::Pong(data)).await.is_err() {
                            break;
                        }
                    }
                    _ => {} // Ignore other client messages
                }
            }
        }
    }

    tracing::debug!("WebSocket client disconnected");
}
