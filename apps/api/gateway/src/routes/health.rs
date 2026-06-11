use axum::{extract::State, Json};
use shadowsig_shared::models::HealthResponse;
use std::sync::Arc;
use crate::AppState;

pub async fn health_check(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime_seconds: state.start_time.elapsed().as_secs(),
    })
}
