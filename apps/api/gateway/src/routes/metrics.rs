use crate::AppState;
use axum::{extract::State, Json};
use shadowsig_shared::models::*;
use std::sync::Arc;

pub async fn get_metrics(State(state): State<Arc<AppState>>) -> Json<ApiResponse<MetricsResponse>> {
    let total_multisigs: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM multisigs")
        .fetch_one(&state.db_pool)
        .await
        .unwrap_or(0);

    let active_proposals: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM proposals WHERE status IN ('pending', 'approved')",
    )
    .fetch_one(&state.db_pool)
    .await
    .unwrap_or(0);

    let proofs_generated: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM approvals")
        .fetch_one(&state.db_pool)
        .await
        .unwrap_or(0);

    let nullifiers_consumed: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM nullifiers")
        .fetch_one(&state.db_pool)
        .await
        .unwrap_or(0);

    // Use real measured latency from verifier_logs; fall back to 0.0 if no data yet.
    let avg_proof_latency_ms: f64 = sqlx::query_scalar(
        "SELECT COALESCE(AVG(latency_ms::float8), 0.0) FROM verifier_logs WHERE result = true",
    )
    .fetch_one(&state.db_pool)
    .await
    .unwrap_or(0.0);

    let metrics = MetricsResponse {
        total_multisigs,
        active_proposals,
        proofs_generated,
        avg_proof_latency_ms,
        nullifiers_consumed,
    };

    Json(ApiResponse::ok(metrics))
}
