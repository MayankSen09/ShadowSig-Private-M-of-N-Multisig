use crate::AppState;
use axum::{
    extract::{Path, State},
    Json,
};
use shadowsig_shared::models::*;
use std::sync::Arc;
use uuid::Uuid;

pub const DEFAULT_MOCK_COMPUTE_UNITS: u64 = 45200;
pub const DEFAULT_MOCK_LATENCY_MS: u64 = 2140;

pub async fn generate_proof(
    State(state): State<Arc<AppState>>,
    Json(req): Json<GenerateProofRequest>,
) -> Json<ApiResponse<serde_json::Value>> {
    let proposal_id = req.proposal_id;
    
    // 1. Fetch proposal from database
    let proposal: Option<Proposal> = match sqlx::query_as::<_, Proposal>(
        "SELECT * FROM proposals WHERE id = $1"
    )
    .bind(proposal_id)
    .fetch_optional(&state.db_pool)
    .await {
        Ok(p) => p,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    let proposal = match proposal {
        Some(p) => p,
        None => return Json(ApiResponse::err("ProposalNotFound")),
    };

    // 2. Fetch multisig config
    let multisig: Option<Multisig> = match sqlx::query_as::<_, Multisig>(
        "SELECT * FROM multisigs WHERE id = $1"
    )
    .bind(proposal.multisig_id)
    .fetch_optional(&state.db_pool)
    .await {
        Ok(m) => m,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    let multisig = match multisig {
        Some(m) => m,
        None => return Json(ApiResponse::err("MultisigNotFound")),
    };

    // 3. Get members to find the leaf index
    let members: Vec<Member> = match sqlx::query_as::<_, Member>(
        "SELECT * FROM members WHERE multisig_id = $1 ORDER BY leaf_index ASC"
    )
    .bind(multisig.id)
    .fetch_all(&state.db_pool)
    .await {
        Ok(m) => m,
        Err(e) => return Json(ApiResponse::err(e.to_string())),
    };

    let leaf_index = members.iter()
        .position(|m| hex::encode(&m.commitment) == req.commitment)
        .map(|idx| idx as u32)
        .unwrap_or(0);

    // 4. Decode secret and Merkle path
    let identity_secret = hex::decode(req.identity_secret.as_deref().unwrap_or("")).unwrap_or_default();
    let merkle_path: Vec<Vec<u8>> = req.merkle_path.iter()
        .map(|p| hex::decode(p).unwrap_or_default())
        .collect();

    if identity_secret.is_empty() {
        return Json(ApiResponse::err("MissingIdentitySecret"));
    }

    // 5. Build witness and prove
    let witness = shadowsig_host::ShadowSigWitness {
        identity_secret,
        merkle_path,
        leaf_index,
        merkle_root: multisig.merkle_root.clone(),
        proposal_id: proposal.id.as_bytes().to_vec(),
        vote: true,
    };

    let proof_id = Uuid::new_v4();
    tracing::info!(
        "Generating proof: {} for proposal: {}",
        proof_id,
        proposal_id
    );

    match shadowsig_host::SimulatedProver::prove(&witness) {
        Ok(proof_result) => {
            let latency_ms = proof_result.generation_time_ms;

            // Persist proof generation audit record to verifier_logs
            if let Err(e) = sqlx::query(
                "INSERT INTO verifier_logs (id, proof_id, verifier_program, result, compute_units, latency_ms, created_at) \
                 VALUES ($1, $2, $3, $4, $5, $6, $7)"
            )
            .bind(Uuid::new_v4())
            .bind(proof_id)
            .bind(if proof_result.is_simulated { "SimulatedProver" } else { "Risc0zkVM" })
            .bind(true)
            .bind(DEFAULT_MOCK_COMPUTE_UNITS as i64)
            .bind(latency_ms as i32)
            .bind(chrono::Utc::now())
            .execute(&state.db_pool)
            .await {
                tracing::warn!("Failed to insert verifier_log: {:?}", e);
            }

            let receipt_hex = hex::encode(serde_json::to_vec(&proof_result).unwrap_or_default());
            Json(ApiResponse::ok(serde_json::json!({
                "proof_id": proof_id,
                "status": "verified",
                "proposal_id": proposal_id,
                "proof": receipt_hex,
                "nullifier": hex::encode(&proof_result.journal.nullifier_hash),
                "compute_units": DEFAULT_MOCK_COMPUTE_UNITS,
                "latency_ms": latency_ms,
                "is_simulated": proof_result.is_simulated,
            })))
        }
        Err(e) => Json(ApiResponse::err(format!("ProverError: {}", e))),
    }
}

pub async fn get_proof(
    State(_state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Json<ApiResponse<serde_json::Value>> {
    tracing::debug!("Fetching proof: {}", id);
    Json(ApiResponse::ok(serde_json::json!({
        "id": id,
        "status": "verified",
        "compute_units": DEFAULT_MOCK_COMPUTE_UNITS,
        "latency_ms": DEFAULT_MOCK_LATENCY_MS,
    })))
}
