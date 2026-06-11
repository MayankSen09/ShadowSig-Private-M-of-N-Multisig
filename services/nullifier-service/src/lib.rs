// ShadowSig Nullifier Service
// Manages nullifier registry for double-vote prevention

use serde::{Deserialize, Serialize};
use sha2::{Sha256, Digest};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NullifierRecord {
    pub hash: Vec<u8>,
    pub proposal_id: String,
    pub consumed_at: chrono::DateTime<chrono::Utc>,
}

/// Check if a nullifier has already been consumed
pub fn is_consumed(_nullifier_hash: &[u8]) -> bool {
    // TODO: Query PostgreSQL nullifiers table
    false
}

/// Consume a nullifier (mark as used)
pub fn consume(_nullifier_hash: &[u8], _proposal_id: &str) -> Result<(), String> {
    // TODO: Insert into PostgreSQL with UNIQUE constraint
    // The UNIQUE constraint on nullifier_hash provides atomic replay protection
    Ok(())
}

/// Validate nullifier format
pub fn validate_nullifier(nullifier: &[u8]) -> bool {
    nullifier.len() == 32 // SHA-256 output is 32 bytes
}
