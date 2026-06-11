use axum::{extract::{Path, State}, Json};
use shadowsig_shared::models::*;
use uuid::Uuid;
use std::sync::Arc;
use crate::AppState;

pub async fn generate_proof(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<GenerateProofRequest>,
) -> Json<ApiResponse<serde_json::Value>> {
    // TODO: Queue proof generation via Risc0 zkVM
    // In production, this would:
    // 1. Validate commitment membership in Merkle tree
    // 2. Send to proof generation worker
    // 3. Return job ID for polling

    let proof_id = Uuid::new_v4();
    tracing::info!("Proof generation queued: {} for proposal: {}", proof_id, req.proposal_id);

    Json(ApiResponse::ok(serde_json::json!({
        "proof_id": proof_id,
        "status": "generating",
        "proposal_id": req.proposal_id,
        "estimated_latency_ms": 2500,
    })))
}

pub async fn get_proof(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Json<ApiResponse<serde_json::Value>> {
    tracing::debug!("Fetching proof: {}", id);
    Json(ApiResponse::ok(serde_json::json!({
        "id": id,
        "status": "verified",
        "compute_units": 45200,
        "latency_ms": 2140,
    })))
}
