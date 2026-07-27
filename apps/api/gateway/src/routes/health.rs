use crate::AppState;
use axum::{extract::State, Json};
use shadowsig_shared::models::HealthResponse;
use std::sync::Arc;

pub async fn health_check(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    let db_connected = sqlx::query("SELECT 1")
        .execute(&state.db_pool)
        .await
        .is_ok();

    Json(HealthResponse {
        status: if db_connected { "healthy" } else { "degraded" }.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime_seconds: state.start_time.elapsed().as_secs(),
        db_connected,
    })
}
