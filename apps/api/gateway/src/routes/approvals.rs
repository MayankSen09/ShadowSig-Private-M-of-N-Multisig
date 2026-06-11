use axum::{extract::State, Json};
use shadowsig_shared::models::*;
use std::sync::Arc;
use crate::AppState;
use uuid::Uuid;
use chrono::Utc;

pub async fn submit_approval(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SubmitApprovalRequest>,
) -> Json<ApiResponse<Approval>> {
    let nullifier_bytes = hex::decode(&req.nullifier).unwrap_or_default();
    let proof_bytes = hex::decode(&req.proof).unwrap_or_default();

    if nullifier_bytes.len() != 32 {
        tracing::warn!("Invalid nullifier length: {} bytes", nullifier_bytes.len());
        return Json(ApiResponse::err("InvalidWitness: nullifier must be 32 bytes"));
    }

    // Begin database transaction
    let mut tx = match state.db_pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    // Check if nullifier has already been used
    let nullifier_exists: bool = match sqlx::query_scalar::<_, bool>(
        "SELECT EXISTS(SELECT 1 FROM nullifiers WHERE nullifier_hash = $1)"
    )
    .bind(&nullifier_bytes)
    .fetch_one(&mut *tx)
    .await {
        Ok(exists) => exists,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    if nullifier_exists {
        return Json(ApiResponse::err("NullifierAlreadyUsed"));
    }

    // Retrieve and lock proposal for update
    let proposal: Option<Proposal> = match sqlx::query_as::<_, Proposal>(
        "SELECT * FROM proposals WHERE id = $1 FOR UPDATE"
    )
    .bind(req.proposal_id)
    .fetch_optional(&mut *tx)
    .await {
        Ok(p) => p,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    let proposal = match proposal {
        None => return Json(ApiResponse::err("ProposalNotFound")),
        Some(p) if p.status == "executed" => return Json(ApiResponse::err("ProposalExecuted")),
        Some(p) => p,
    };

    // Insert nullifier
    if let Err(e) = sqlx::query(
        "INSERT INTO nullifiers (id, nullifier_hash, proposal_id, consumed_at) VALUES ($1, $2, $3, $4)"
    )
    .bind(Uuid::new_v4())
    .bind(&nullifier_bytes)
    .bind(req.proposal_id)
    .bind(Utc::now())
    .execute(&mut *tx)
    .await {
        return Json(ApiResponse::err(e.to_string()));
    }

    // Create approval record
    let approval = Approval {
        id: Uuid::new_v4(),
        proposal_id: req.proposal_id,
        nullifier: nullifier_bytes,
        proof: proof_bytes,
        verified: true,
        created_at: Utc::now(),
    };

    if let Err(e) = sqlx::query(
        "INSERT INTO approvals (id, proposal_id, nullifier, proof, verified, created_at) VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(approval.id)
    .bind(approval.proposal_id)
    .bind(&approval.nullifier)
    .bind(&approval.proof)
    .bind(approval.verified)
    .bind(approval.created_at)
    .execute(&mut *tx)
    .await {
        return Json(ApiResponse::err(e.to_string()));
    }

    // Update proposal approval count and check threshold
    let new_approval_count = proposal.approval_count + 1;
    let new_status = if new_approval_count >= proposal.threshold {
        "approved"
    } else {
        &proposal.status
    };

    if let Err(e) = sqlx::query(
        "UPDATE proposals SET approval_count = $1, status = $2, updated_at = $3 WHERE id = $4"
    )
    .bind(new_approval_count)
    .bind(new_status)
    .bind(Utc::now())
    .bind(req.proposal_id)
    .execute(&mut *tx)
    .await {
        return Json(ApiResponse::err(e.to_string()));
    }

    // Commit transaction
    if let Err(e) = tx.commit().await {
        return Json(ApiResponse::err(e.to_string()));
    }

    tracing::info!(
        "✅ Approval submitted for proposal {} — nullifier: {}",
        req.proposal_id,
        &req.nullifier[..16],
    );

    Json(ApiResponse::ok(approval))
}
