use axum::{
    extract::State,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use shadowsig_verifier::{ProofJournal, VerifierState};
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;

#[derive(Clone)]
struct AppState {
    state: Arc<Mutex<VerifierState>>,
}

#[derive(Debug, Deserialize)]
struct CreateMultisigPayload {
    multisig_id: String,
    merkle_root: String,
    threshold: u8,
    member_count: u8,
}

#[derive(Debug, Deserialize)]
struct CreateProposalPayload {
    proposal_id: String,
    multisig_id: String,
    action_hash: String,
}

#[derive(Debug, Deserialize)]
struct SubmitApprovalPayload {
    journal: ProofJournal,
    receipt_bytes: String, // hex encoded
}

#[derive(Debug, Deserialize)]
struct ExecuteProposalPayload {
    proposal_id: String,
}

#[derive(Debug, Serialize)]
struct LezResponse<T> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

fn hex_to_32(h: &str) -> Result<[u8; 32], String> {
    let bytes = hex::decode(h).map_err(|e| e.to_string())?;
    bytes.try_into().map_err(|_| "Invalid length".to_string())
}

async fn create_multisig(
    State(state): State<AppState>,
    Json(payload): Json<CreateMultisigPayload>,
) -> Json<LezResponse<()>> {
    let Ok(id) = hex_to_32(&payload.multisig_id) else {
        return Json(LezResponse { success: false, data: None, error: Some("Invalid ID".into()) });
    };
    let Ok(root) = hex_to_32(&payload.merkle_root) else {
        return Json(LezResponse { success: false, data: None, error: Some("Invalid root".into()) });
    };

    let mut lock = state.state.lock().unwrap();
    match lock.create_multisig(id, root, payload.threshold, payload.member_count) {
        Ok(_) => Json(LezResponse { success: true, data: Some(()), error: None }),
        Err(e) => Json(LezResponse { success: false, data: None, error: Some(e.to_string()) }),
    }
}

async fn create_proposal(
    State(state): State<AppState>,
    Json(payload): Json<CreateProposalPayload>,
) -> Json<LezResponse<()>> {
    let Ok(pid) = hex_to_32(&payload.proposal_id) else {
        return Json(LezResponse { success: false, data: None, error: Some("Invalid ID".into()) });
    };
    let Ok(mid) = hex_to_32(&payload.multisig_id) else {
        return Json(LezResponse { success: false, data: None, error: Some("Invalid ID".into()) });
    };
    let Ok(ahash) = hex_to_32(&payload.action_hash) else {
        return Json(LezResponse { success: false, data: None, error: Some("Invalid Hash".into()) });
    };

    let mut lock = state.state.lock().unwrap();
    match lock.create_proposal(pid, mid, ahash) {
        Ok(_) => Json(LezResponse { success: true, data: Some(()), error: None }),
        Err(e) => Json(LezResponse { success: false, data: None, error: Some(e.to_string()) }),
    }
}

async fn submit_approval(
    State(state): State<AppState>,
    Json(payload): Json<SubmitApprovalPayload>,
) -> Json<LezResponse<u32>> {
    let receipt = hex::decode(&payload.receipt_bytes).unwrap_or_default();
    let mut lock = state.state.lock().unwrap();
    match lock.submit_approval(&payload.journal, &receipt) {
        Ok(count) => Json(LezResponse { success: true, data: Some(count), error: None }),
        Err(e) => Json(LezResponse { success: false, data: None, error: Some(e.to_string()) }),
    }
}

async fn execute_proposal(
    State(state): State<AppState>,
    Json(payload): Json<ExecuteProposalPayload>,
) -> Json<LezResponse<String>> {
    let Ok(pid) = hex_to_32(&payload.proposal_id) else {
        return Json(LezResponse { success: false, data: None, error: Some("Invalid ID".into()) });
    };

    let mut lock = state.state.lock().unwrap();
    match lock.execute_proposal(pid) {
        Ok(action_hash) => Json(LezResponse { success: true, data: Some(hex::encode(action_hash)), error: None }),
        Err(e) => Json(LezResponse { success: false, data: None, error: Some(e.to_string()) }),
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Starting LEZ Blockchain Mock Node on port 9090...");
    let state = AppState {
        state: Arc::new(Mutex::new(VerifierState::new())),
    };

    let app = Router::new()
        .route("/lez/multisig", post(create_multisig))
        .route("/lez/proposal", post(create_proposal))
        .route("/lez/approve", post(submit_approval))
        .route("/lez/execute", post(execute_proposal))
        .with_state(state);

    let listener = TcpListener::bind("0.0.0.0:9090").await?;
    axum::serve(listener, app).await?;
    Ok(())
}
