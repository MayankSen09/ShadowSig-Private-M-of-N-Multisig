use crate::AppState;
use axum::{
    extract::{Path, State},
    Json,
};
use chrono::{DateTime, Utc};
use serde::Serialize;
use shadowsig_shared::models::ApiResponse;
use std::sync::Arc;
use uuid::Uuid;

/// A treasury action record returned by the API.
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct TreasuryAction {
    pub id: Uuid,
    pub multisig_id: Uuid,
    pub action_type: String,
    pub asset: Option<String>,
    /// Stored as NUMERIC in Postgres; we cast to TEXT for serde flexibility.
    pub amount: Option<String>,
    pub execution_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
}

/// `GET /api/treasury/:multisig_id`
///
/// Returns all treasury actions executed by a given multisig, ordered
/// newest first.  Used by the treasury panel on the frontend dashboard.
pub async fn list_treasury_actions(
    State(state): State<Arc<AppState>>,
    Path(multisig_id): Path<Uuid>,
) -> Json<ApiResponse<Vec<TreasuryAction>>> {
    match sqlx::query_as::<_, TreasuryAction>(
        "SELECT id, multisig_id, action_type, asset, amount::text, execution_id, created_at \
         FROM treasury_actions WHERE multisig_id = $1 ORDER BY created_at DESC",
    )
    .bind(multisig_id)
    .fetch_all(&state.db_pool)
    .await
    {
        Ok(actions) => {
            tracing::debug!(
                "Listing {} treasury actions for multisig {}",
                actions.len(),
                multisig_id
            );
            Json(ApiResponse::ok(actions))
        }
        Err(e) => {
            tracing::error!("Failed to list treasury actions: {:?}", e);
            Json(ApiResponse::err(e.to_string()))
        }
    }
}

/// `GET /api/treasury`
///
/// Returns all treasury actions across all multisigs (admin view).
pub async fn list_all_treasury_actions(
    State(state): State<Arc<AppState>>,
) -> Json<ApiResponse<Vec<TreasuryAction>>> {
    match sqlx::query_as::<_, TreasuryAction>(
        "SELECT id, multisig_id, action_type, asset, amount::text, execution_id, created_at \
         FROM treasury_actions ORDER BY created_at DESC LIMIT 100",
    )
    .fetch_all(&state.db_pool)
    .await
    {
        Ok(actions) => Json(ApiResponse::ok(actions)),
        Err(e) => {
            tracing::error!("Failed to list all treasury actions: {:?}", e);
            Json(ApiResponse::err(e.to_string()))
        }
    }
}
