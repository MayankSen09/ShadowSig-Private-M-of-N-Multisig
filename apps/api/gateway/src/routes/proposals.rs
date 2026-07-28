use crate::AppState;
use axum::{
    extract::{Path, State},
    Json,
};
use chrono::Utc;
use redis::AsyncCommands;
use shadowsig_shared::models::*;
use std::sync::Arc;
use uuid::Uuid;

pub async fn list_proposals(
    State(state): State<Arc<AppState>>,
) -> Json<ApiResponse<Vec<Proposal>>> {
    match sqlx::query_as::<_, Proposal>("SELECT * FROM proposals ORDER BY created_at DESC")
        .fetch_all(&state.db_pool)
        .await
    {
        Ok(list) => {
            tracing::debug!("Listing {} proposals from DB", list.len());
            Json(ApiResponse::ok(list))
        }
        Err(e) => {
            tracing::error!("Failed to list proposals: {:?}", e);
            Json(ApiResponse::err(e.to_string()))
        }
    }
}

pub async fn create_proposal(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateProposalRequest>,
) -> Json<ApiResponse<Proposal>> {
    // Check if multisig exists and get its threshold
    let multisig = match sqlx::query_as::<_, Multisig>("SELECT * FROM multisigs WHERE id = $1")
        .bind(req.multisig_id)
        .fetch_optional(&state.db_pool)
        .await
    {
        Ok(Some(m)) => m,
        Ok(None) => {
            tracing::warn!(
                "Failed to create proposal: multisig {} not found",
                req.multisig_id
            );
            return Json(ApiResponse::err("MultisigNotFound"));
        }
        Err(e) => {
            tracing::error!("Database error finding multisig: {:?}", e);
            return Json(ApiResponse::err(e.to_string()));
        }
    };

    let now = Utc::now();
    let proposal = Proposal {
        id: Uuid::new_v4(),
        multisig_id: req.multisig_id,
        title: req.title,
        description: req.description,
        action_type: req.action_type,
        action_data: req.action_data,
        approval_count: 0,
        threshold: multisig.threshold,
        status: "pending".to_string(),
        expires_at: Some(now + chrono::Duration::days(req.expires_in_days)),
        created_at: now,
        updated_at: now,
    };

    if let Err(e) = sqlx::query(
        "INSERT INTO proposals (id, multisig_id, title, description, action_type, action_data, approval_count, threshold, status, expires_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)"
    )
    .bind(proposal.id)
    .bind(proposal.multisig_id)
    .bind(&proposal.title)
    .bind(&proposal.description)
    .bind(&proposal.action_type)
    .bind(&proposal.action_data)
    .bind(proposal.approval_count)
    .bind(proposal.threshold)
    .bind(&proposal.status)
    .bind(proposal.expires_at)
    .bind(proposal.created_at)
    .bind(proposal.updated_at)
    .execute(&state.db_pool)
    .await
    {
        tracing::error!("Failed to insert proposal: {:?}", e);
        return Json(ApiResponse::err(e.to_string()));
    }

    tracing::info!(
        "Created proposal: {} ({}) for multisig {} — threshold: {}",
        proposal.title,
        proposal.id,
        proposal.multisig_id,
        proposal.threshold,
    );

    // Relay to LEZ Node (On-Chain)
    let payload = serde_json::json!({
        "proposal_id": hex::encode(proposal.id.as_bytes()),
        "multisig_id": hex::encode(proposal.multisig_id.as_bytes()),
        "action_hash": hex::encode(shadowsig_shared::crypto::sha256(proposal.action_data.as_ref().map(|v| serde_json::to_string(v).unwrap_or_default()).unwrap_or_default().as_bytes()))
    });
    
    match state.http_client.post(&format!("{}/lez/proposal", state.lez_rpc_url))
        .json(&payload)
        .send()
        .await {
        Ok(res) if res.status().is_success() => tracing::info!("✅ Successfully relayed Proposal to LEZ Blockchain"),
        Ok(res) => tracing::error!("❌ LEZ Node rejected proposal: {:?}", res.text().await),
        Err(e) => tracing::error!("❌ Failed to reach LEZ Node: {}", e),
    }

    Json(ApiResponse::ok(proposal))
}

pub async fn get_proposal(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Json<ApiResponse<Proposal>> {
    let cache_key = format!("proposal:{}", id);

    // 1. Try fetching from Redis cache first
    if let Ok(mut redis_conn) = state.redis_pool.get().await {
        if let Ok(cached_data) = redis_conn.get::<_, Option<String>>(&cache_key).await {
            if let Some(data) = cached_data {
                if let Ok(proposal) = serde_json::from_str(&data) {
                    tracing::debug!("Cache hit for {}", cache_key);
                    return Json(ApiResponse::ok(proposal));
                }
            }
        }
    }

    // 2. Cache miss — fetch from PostgreSQL
    tracing::debug!("Cache miss for {} — fetching from DB", cache_key);
    match sqlx::query_as::<_, Proposal>("SELECT * FROM proposals WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db_pool)
        .await
    {
        Ok(Some(proposal)) => {
            // 3. Write back to cache with 5 minute (300s) TTL
            if let Ok(mut redis_conn) = state.redis_pool.get().await {
                if let Ok(json_data) = serde_json::to_string(&proposal) {
                    let _: Result<(), _> = redis_conn.set_ex(&cache_key, json_data, 300).await;
                }
            }
            Json(ApiResponse::ok(proposal))
        }
        Ok(None) => Json(ApiResponse::err("ProposalNotFound")),
        Err(e) => {
            tracing::error!("Database error fetching proposal: {:?}", e);
            Json(ApiResponse::err(e.to_string()))
        }
    }
}
