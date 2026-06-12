use crate::AppState;
use axum::{extract::State, Json};
use chrono::Utc;
use shadowsig_shared::models::*;
use std::sync::Arc;
use uuid::Uuid;

pub async fn execute_action(
    State(state): State<Arc<AppState>>,
    Json(req): Json<ExecuteRequest>,
) -> Json<ApiResponse<Execution>> {
    let mut tx = match state.db_pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    let proposal: Option<Proposal> =
        match sqlx::query_as::<_, Proposal>("SELECT * FROM proposals WHERE id = $1 FOR UPDATE")
            .bind(req.proposal_id)
            .fetch_optional(&mut *tx)
            .await
        {
            Ok(p) => p,
            Err(e) => return Json(ApiResponse::err(e.to_string())),
        };

    let proposal = match proposal {
        None => return Json(ApiResponse::err("ProposalNotFound")),
        Some(p) if p.status == "executed" => return Json(ApiResponse::err("ProposalExecuted")),
        Some(p) if p.approval_count < p.threshold => {
            return Json(ApiResponse::err("ThresholdNotReached"))
        }
        Some(p) => p,
    };

    // Update proposal status
    if let Err(e) =
        sqlx::query("UPDATE proposals SET status = 'executed', updated_at = $1 WHERE id = $2")
            .bind(Utc::now())
            .bind(req.proposal_id)
            .execute(&mut *tx)
            .await
    {
        return Json(ApiResponse::err(e.to_string()));
    }

    let now = Utc::now();
    let tx_hash = shadowsig_shared::crypto::sha256(format!("exec_{}", req.proposal_id).as_bytes());

    let execution = Execution {
        id: Uuid::new_v4(),
        proposal_id: req.proposal_id,
        tx_hash: Some(tx_hash),
        status: "completed".to_string(),
        executed_at: Some(now),
        created_at: now,
    };

    if let Err(e) = sqlx::query(
        "INSERT INTO executions (id, proposal_id, tx_hash, status, executed_at, created_at) VALUES ($1, $2, $3, $4, $5, $6)"
    )
    .bind(execution.id)
    .bind(execution.proposal_id)
    .bind(&execution.tx_hash)
    .bind(&execution.status)
    .bind(execution.executed_at)
    .bind(execution.created_at)
    .execute(&mut *tx)
    .await {
        return Json(ApiResponse::err(e.to_string()));
    }

    if let Err(e) = tx.commit().await {
        return Json(ApiResponse::err(e.to_string()));
    }

    tracing::info!(
        "🚀 Proposal {} executed — tx: {}",
        req.proposal_id,
        execution
            .tx_hash
            .as_ref()
            .map(|h| hex::encode(&h[..8]))
            .unwrap_or_default(),
    );

    Json(ApiResponse::ok(execution))
}
