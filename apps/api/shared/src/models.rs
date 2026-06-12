use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// ============================================================
// DOMAIN MODELS
// ============================================================

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "lowercase")]
pub enum MultisigStatus {
    Active,
    Paused,
    Archived,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "lowercase")]
pub enum ProposalStatus {
    Pending,
    Approved,
    Rejected,
    Executed,
    Expired,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "lowercase")]
pub enum ProofStatus {
    Generating,
    Verified,
    Failed,
    Cached,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "lowercase")]
pub enum ExecutionStatus {
    Pending,
    Executing,
    Completed,
    Failed,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Multisig {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub threshold: i32,
    pub member_count: i32,
    pub merkle_root: Vec<u8>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Member {
    pub id: Uuid,
    pub multisig_id: Uuid,
    pub commitment: Vec<u8>,
    pub leaf_index: i32,
    pub joined_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Proposal {
    pub id: Uuid,
    pub multisig_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub action_type: String,
    pub action_data: Option<serde_json::Value>,
    pub approval_count: i32,
    pub threshold: i32,
    pub status: String,
    pub expires_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Approval {
    pub id: Uuid,
    pub proposal_id: Uuid,
    pub nullifier: Vec<u8>,
    pub proof: Vec<u8>,
    pub verified: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Execution {
    pub id: Uuid,
    pub proposal_id: Uuid,
    pub tx_hash: Option<Vec<u8>>,
    pub status: String,
    pub executed_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

// ============================================================
// API REQUEST / RESPONSE TYPES
// ============================================================

#[derive(Debug, Deserialize)]
pub struct CreateMultisigRequest {
    pub name: String,
    pub description: Option<String>,
    pub threshold: i32,
    pub member_commitments: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateProposalRequest {
    pub multisig_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub action_type: String,
    pub action_data: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
pub struct SubmitApprovalRequest {
    pub proposal_id: Uuid,
    pub nullifier: String,
    pub proof: String,
}

#[derive(Debug, Deserialize)]
pub struct GenerateProofRequest {
    pub proposal_id: Uuid,
    pub commitment: String,
    pub merkle_path: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct ExecuteRequest {
    pub proposal_id: Uuid,
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(message: impl Into<String>) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message.into()),
        }
    }
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub uptime_seconds: u64,
}

#[derive(Debug, Serialize)]
pub struct MetricsResponse {
    pub total_multisigs: i64,
    pub active_proposals: i64,
    pub proofs_generated: i64,
    pub avg_proof_latency_ms: f64,
    pub nullifiers_consumed: i64,
}
