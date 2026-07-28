use axum::{
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

pub async fn auth_middleware<B>(
    State(state): State<Arc<AppState>>,
    mut req: Request<B>,
    next: Next<B>,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|header| header.to_str().ok())
        .filter(|header| header.starts_with("Bearer "));

    let token = match auth_header {
        Some(header) => header.trim_start_matches("Bearer "),
        None => {
            tracing::warn!("Missing or invalid Authorization header");
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    let validation = Validation::default();
    let token_data = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_ref()),
        &validation,
    ) {
        Ok(data) => data,
        Err(e) => {
            tracing::warn!("Invalid JWT token: {}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    // Insert claims into request extensions so handlers can access them
    req.extensions_mut().insert(token_data.claims);

    Ok(next.run(req).await)
}
