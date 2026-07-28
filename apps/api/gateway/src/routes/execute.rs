use crate::AppState;
use axum::{extract::State, Json};
use chrono::Utc;
use shadowsig_event_service::{Event, EventType};
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

    // Write treasury action audit record if the proposal carried a transfer payload
    if let Some(action_data) = &proposal.action_data {
        let asset = action_data.get("asset").and_then(|v| v.as_str()).unwrap_or("LGS");
        let amount_str = action_data.get("amount").map(|v| v.to_string());
        let recipient_hex = action_data.get("recipient").and_then(|v| v.as_str());
        let recipient_bytes: Option<Vec<u8>> = recipient_hex
            .and_then(|h| hex::decode(h.trim_start_matches("0x")).ok());

        if let Err(e) = sqlx::query(
            "INSERT INTO treasury_actions (id, multisig_id, action_type, asset, amount, recipient, execution_id, created_at) \
             VALUES ($1, $2, $3, $4, $5::numeric, $6, $7, $8)"
        )
        .bind(Uuid::new_v4())
        .bind(proposal.multisig_id)
        .bind(&proposal.action_type)
        .bind(asset)
        .bind(amount_str.as_deref())
        .bind(recipient_bytes.as_deref())
        .bind(execution.id)
        .bind(now)
        .execute(&state.db_pool)
        .await {
            tracing::warn!("Failed to insert treasury_action: {:?}", e);
        }
    }


    let tx_hex = execution
        .tx_hash
        .as_deref()
        .map(|h| hex::encode(&h[..8.min(h.len())]))
        .unwrap_or_else(|| "none".to_string());

    tracing::info!(
        "🚀 Proposal {} executed — tx: {} (multisig: {})",
        req.proposal_id,
        tx_hex,
        proposal.multisig_id,
    );

    // Publish real-time execution event to WebSocket subscribers
    state.event_bus.publish(Event::new(
        EventType::ExecutionCompleted,
        serde_json::json!({
            "proposal_id": req.proposal_id,
            "multisig_id": proposal.multisig_id,
            "execution_id": execution.id,
            "tx_hash": &tx_hex,
        }),
    ));

    // Relay to LEZ Node (On-Chain)
    let payload = serde_json::json!({
        "proposal_id": hex::encode(req.proposal_id.as_bytes())
    });

    match state.http_client.post(&format!("{}/lez/execute", state.lez_rpc_url))
        .json(&payload)
        .send()
        .await {
        Ok(res) if res.status().is_success() => tracing::info!("✅ Successfully relayed Execution to LEZ Blockchain"),
        Ok(res) => tracing::error!("❌ LEZ Node rejected execution: {:?}", res.text().await),
        Err(e) => tracing::error!("❌ Failed to reach LEZ Node: {}", e),
    }

    Json(ApiResponse::ok(execution))
}
