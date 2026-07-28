use crate::AppState;
use axum::{extract::State, Json};
use jsonwebtoken::{encode, EncodingKey, Header};
use shadowsig_shared::models::ApiResponse;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::middleware::auth::Claims;

#[derive(serde::Deserialize)]
pub struct TokenRequest {
    pub client_id: String,
    pub client_secret: String,
}

#[derive(serde::Serialize)]
pub struct TokenResponse {
    pub token: String,
    pub expires_in: u64,
}

pub async fn generate_token(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<TokenRequest>,
) -> Json<ApiResponse<TokenResponse>> {
    // In a real application, validate client_id and client_secret against a database
    // For this demonstration, we accept a hardcoded valid client credentials pair
    if payload.client_id != "shadowsig-dashboard" || payload.client_secret != "demo-secret" {
        return Json(ApiResponse::err("Invalid client credentials"));
    }

    let exp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + 3600; // 1 hour expiration

    let claims = Claims {
        sub: payload.client_id,
        role: "admin".to_string(),
        exp: exp as usize,
    };

    let token = match encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    ) {
        Ok(t) => t,
        Err(e) => {
            tracing::error!("Failed to generate token: {}", e);
            return Json(ApiResponse::err("Failed to generate token"));
        }
    };

    Json(ApiResponse::ok(TokenResponse {
        token,
        expires_in: 3600,
    }))
}
