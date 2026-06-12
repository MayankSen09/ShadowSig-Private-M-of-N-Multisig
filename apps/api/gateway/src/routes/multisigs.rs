use crate::AppState;
use axum::{
    extract::{Path, State},
    Json,
};
use chrono::Utc;
use shadowsig_shared::models::*;
use std::sync::Arc;
use uuid::Uuid;

fn build_merkle_root(commitments: &[Vec<u8>]) -> Vec<u8> {
    if commitments.is_empty() {
        return vec![0u8; 32];
    }

    // Hash each commitment to get leaves
    let mut leaves: Vec<Vec<u8>> = commitments
        .iter()
        .map(|c| shadowsig_shared::crypto::sha256(c))
        .collect();

    // Pad to power of 2
    while leaves.len().count_ones() != 1 {
        leaves.push(vec![0u8; 32]);
    }

    // Build tree bottom-up
    let mut current = leaves;
    while current.len() > 1 {
        let mut next = Vec::new();
        for pair in current.chunks(2) {
            let mut combined = pair[0].clone();
            combined.extend_from_slice(&pair[1]);
            next.push(shadowsig_shared::crypto::sha256(&combined));
        }
        current = next;
    }

    current.into_iter().next().unwrap_or_else(|| vec![0u8; 32])
}

pub async fn list_multisigs(
    State(state): State<Arc<AppState>>,
) -> Json<ApiResponse<Vec<Multisig>>> {
    match sqlx::query_as::<_, Multisig>("SELECT * FROM multisigs ORDER BY created_at DESC")
        .fetch_all(&state.db_pool)
        .await
    {
        Ok(list) => {
            tracing::debug!("Listing {} multisigs from DB", list.len());
            Json(ApiResponse::ok(list))
        }
        Err(e) => {
            tracing::error!("Failed to list multisigs: {:?}", e);
            Json(ApiResponse::err(e.to_string()))
        }
    }
}

pub async fn create_multisig(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreateMultisigRequest>,
) -> Json<ApiResponse<Multisig>> {
    let commitments: Vec<Vec<u8>> = req
        .member_commitments
        .iter()
        .map(|h| {
            hex::decode(h)
                .unwrap_or_else(|_| shadowsig_shared::crypto::compute_commitment(h.as_bytes()))
        })
        .collect();

    let merkle_root = build_merkle_root(&commitments);
    let now = Utc::now();
    let id = Uuid::new_v4();

    let multisig = Multisig {
        id,
        name: req.name,
        description: req.description,
        threshold: req.threshold,
        member_count: commitments.len() as i32,
        merkle_root: merkle_root.clone(),
        status: "active".to_string(),
        created_at: now,
        updated_at: now,
    };

    let mut tx = match state.db_pool.begin().await {
        Ok(tx) => tx,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    if let Err(e) = sqlx::query(
        "INSERT INTO multisigs (id, name, description, threshold, member_count, merkle_root, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)"
    )
    .bind(multisig.id)
    .bind(&multisig.name)
    .bind(&multisig.description)
    .bind(multisig.threshold)
    .bind(multisig.member_count)
    .bind(&multisig.merkle_root)
    .bind(&multisig.status)
    .bind(multisig.created_at)
    .bind(multisig.updated_at)
    .execute(&mut *tx)
    .await {
        tracing::error!("Failed to insert multisig: {:?}", e);
        return Json(ApiResponse::err(e.to_string()));
    }

    for (i, commitment) in commitments.iter().enumerate() {
        if let Err(e) = sqlx::query(
            "INSERT INTO members (id, multisig_id, commitment, leaf_index, joined_at) VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(Uuid::new_v4())
        .bind(multisig.id)
        .bind(commitment)
        .bind(i as i32)
        .bind(now)
        .execute(&mut *tx)
        .await {
            tracing::error!("Failed to insert member: {:?}", e);
            return Json(ApiResponse::err(e.to_string()));
        }
    }

    if let Err(e) = tx.commit().await {
        tracing::error!("Failed to commit transaction: {:?}", e);
        return Json(ApiResponse::err(e.to_string()));
    }

    tracing::info!(
        "Created multisig: {} ({}) — {}/{} threshold, root: {}",
        multisig.name,
        multisig.id,
        multisig.threshold,
        multisig.member_count,
        hex::encode(&multisig.merkle_root[..8]),
    );

    Json(ApiResponse::ok(multisig))
}

pub async fn get_multisig(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Json<ApiResponse<Option<Multisig>>> {
    match sqlx::query_as::<_, Multisig>("SELECT * FROM multisigs WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db_pool)
        .await
    {
        Ok(result) => {
            tracing::debug!("Fetching multisig: {} — found: {}", id, result.is_some());
            Json(ApiResponse::ok(result))
        }
        Err(e) => {
            tracing::error!("Failed to get multisig: {:?}", e);
            Json(ApiResponse::err(e.to_string()))
        }
    }
}
