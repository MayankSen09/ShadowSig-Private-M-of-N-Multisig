// ShadowSig Nullifier Service
//
// Manages the nullifier registry for double-vote prevention.
// Each nullifier is derived as SHA-256(identity_secret || proposal_id)
// and stored once — enforced by a UNIQUE constraint in Postgres.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NullifierRecord {
    pub hash: Vec<u8>,
    pub proposal_id: String,
    pub consumed_at: DateTime<Utc>,
}

/// Compute a nullifier hash from a raw secret and proposal ID.
/// Matches the derivation used inside the ZK guest program.
pub fn compute_nullifier(secret: &[u8], proposal_id: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(secret);
    hasher.update(proposal_id);
    hasher.finalize().to_vec()
}

/// Validate nullifier format (must be 32 bytes — SHA-256 output).
pub fn validate_nullifier(nullifier: &[u8]) -> bool {
    nullifier.len() == 32
}

/// Check whether a nullifier has already been consumed.
/// Returns `true` if the nullifier is in the registry (i.e. double-vote).
///
/// # Arguments
/// * `pool` — live sqlx Postgres pool
/// * `nullifier_hash` — 32-byte nullifier
pub async fn is_consumed(
    pool: &sqlx::PgPool,
    nullifier_hash: &[u8],
) -> Result<bool, sqlx::Error> {
    let exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM nullifiers WHERE nullifier_hash = $1)",
    )
    .bind(nullifier_hash)
    .fetch_one(pool)
    .await?;
    Ok(exists)
}

/// Atomically mark a nullifier as consumed.
/// The UNIQUE constraint on `nullifiers.nullifier_hash` guarantees that
/// concurrent submissions for the same nullifier will fail with a conflict
/// error rather than silently inserting a duplicate row.
///
/// Returns `Err` if the nullifier was already consumed (unique violation)
/// or if any other database error occurs.
pub async fn consume(
    pool: &sqlx::PgPool,
    nullifier_hash: &[u8],
    proposal_id: uuid::Uuid,
) -> Result<NullifierRecord, sqlx::Error> {
    let now = Utc::now();
    let id = uuid::Uuid::new_v4();

    sqlx::query(
        "INSERT INTO nullifiers (id, nullifier_hash, proposal_id, consumed_at) \
         VALUES ($1, $2, $3, $4)",
    )
    .bind(id)
    .bind(nullifier_hash)
    .bind(proposal_id)
    .bind(now)
    .execute(pool)
    .await?;

    Ok(NullifierRecord {
        hash: nullifier_hash.to_vec(),
        proposal_id: proposal_id.to_string(),
        consumed_at: now,
    })
}

/// Count total consumed nullifiers (for metrics).
pub async fn count_consumed(pool: &sqlx::PgPool) -> Result<i64, sqlx::Error> {
    sqlx::query_scalar("SELECT COUNT(*) FROM nullifiers")
        .fetch_one(pool)
        .await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nullifier_format_validation() {
        assert!(validate_nullifier(&[0u8; 32]));
        assert!(!validate_nullifier(&[0u8; 31]));
        assert!(!validate_nullifier(&[]));
    }

    #[test]
    fn test_nullifier_deterministic() {
        let secret = b"member_alpha_secret";
        let proposal = b"proposal_001";
        let n1 = compute_nullifier(secret, proposal);
        let n2 = compute_nullifier(secret, proposal);
        assert_eq!(n1, n2);
        assert_eq!(n1.len(), 32);
    }

    #[test]
    fn test_nullifier_unique_per_proposal() {
        let secret = b"member_alpha_secret";
        let n1 = compute_nullifier(secret, b"proposal_001");
        let n2 = compute_nullifier(secret, b"proposal_002");
        assert_ne!(n1, n2);
    }

    #[test]
    fn test_nullifier_unique_per_member() {
        let p = b"proposal_001";
        let n1 = compute_nullifier(b"member_alpha", p);
        let n2 = compute_nullifier(b"member_bravo", p);
        assert_ne!(n1, n2);
    }
}
