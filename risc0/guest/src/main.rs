//! ShadowSig zkVM Guest Program
//!
//! This program runs inside the RISC0 zkVM and proves:
//! 1. The prover knows an `identity_secret` whose commitment is in the Merkle tree
//! 2. The nullifier is correctly derived from `H(identity_secret || proposal_id)`
//! 3. The vote is bound to a specific `proposal_id`
//!
//! Public outputs (journal):
//!   - nullifier_hash  (32 bytes)
//!   - merkle_root     (32 bytes)
//!   - proposal_id     (32 bytes)
//!   - vote            (1 byte: 0x01 = approve)
//!
//! Private inputs (never revealed):
//!   - identity_secret
//!   - merkle_path
//!   - leaf_index

// When building for risc0 guest target, uncomment:
// #![no_main]
// #![no_std]
// risc0_zkvm::guest::entry!(main);

use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};

/// Witness provided by the host (private inputs + public parameters)
#[derive(Debug, Serialize, Deserialize)]
pub struct ShadowSigWitness {
    // ── Private inputs ──
    pub identity_secret: Vec<u8>,
    pub merkle_path: Vec<Vec<u8>>,
    pub leaf_index: u32,

    // ── Public inputs ──
    pub merkle_root: Vec<u8>,
    pub proposal_id: Vec<u8>,
    pub vote: bool,
}

/// Journal output committed to the proof receipt (public)
#[derive(Debug, Serialize, Deserialize, PartialEq, Eq)]
pub struct ShadowSigJournal {
    pub nullifier_hash: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub proposal_id: Vec<u8>,
    pub vote: bool,
}

// ─────────────────────────────────────────────────────────
// Core guest logic — can run on host for testing or inside zkVM
// ─────────────────────────────────────────────────────────

pub fn execute(witness: &ShadowSigWitness) -> Result<ShadowSigJournal, &'static str> {
    // Step 1: Compute identity commitment = H(identity_secret)
    let commitment = sha256(&witness.identity_secret);

    // Step 2: Verify Merkle membership
    //   Hash the commitment (leaf = H(commitment)) to match tree construction
    let leaf = sha256(&commitment);
    if !verify_merkle_path(
        &leaf,
        &witness.merkle_path,
        &witness.merkle_root,
        witness.leaf_index,
    ) {
        return Err("InvalidMerkleRoot");
    }

    // Step 3: Derive nullifier = H(identity_secret || proposal_id)
    let mut nullifier_preimage = Vec::with_capacity(
        witness.identity_secret.len() + witness.proposal_id.len(),
    );
    nullifier_preimage.extend_from_slice(&witness.identity_secret);
    nullifier_preimage.extend_from_slice(&witness.proposal_id);
    let nullifier_hash = sha256(&nullifier_preimage);

    // Step 4: Construct journal (public output)
    Ok(ShadowSigJournal {
        nullifier_hash,
        merkle_root: witness.merkle_root.clone(),
        proposal_id: witness.proposal_id.clone(),
        vote: witness.vote,
    })
}

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

fn sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

fn verify_merkle_path(
    leaf: &[u8],
    path: &[Vec<u8>],
    expected_root: &[u8],
    mut index: u32,
) -> bool {
    let mut current = leaf.to_vec();
    for sibling in path {
        let mut combined = Vec::with_capacity(64);
        if index % 2 == 0 {
            // current is left child
            combined.extend_from_slice(&current);
            combined.extend_from_slice(sibling);
        } else {
            // current is right child
            combined.extend_from_slice(sibling);
            combined.extend_from_slice(&current);
        }
        current = sha256(&combined);
        index /= 2;
    }
    current == expected_root
}

// ─────────────────────────────────────────────────────────
// Entry point — works on host, swap to risc0 guest::entry! for zkVM
// ─────────────────────────────────────────────────────────

fn main() {
    // When running inside risc0 zkVM, replace with:
    //   let witness: ShadowSigWitness = risc0_zkvm::guest::env::read();
    //   let journal = execute(&witness).expect("guest execution failed");
    //   risc0_zkvm::guest::env::commit(&journal);

    // For standalone testing:
    eprintln!("ShadowSig guest program — run via risc0 host, not directly.");
    std::process::exit(1);
}

// ─────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn build_two_leaf_tree(secret_a: &[u8], secret_b: &[u8]) -> (Vec<u8>, Vec<u8>, Vec<u8>) {
        let commit_a = sha256(secret_a);
        let commit_b = sha256(secret_b);
        let leaf_a = sha256(&commit_a);
        let leaf_b = sha256(&commit_b);
        let mut root_pre = Vec::with_capacity(64);
        root_pre.extend_from_slice(&leaf_a);
        root_pre.extend_from_slice(&leaf_b);
        let root = sha256(&root_pre);
        (root, leaf_a, leaf_b)
    }

    #[test]
    fn test_valid_approval() {
        let secret_a = b"member_alpha_secret_key_32bytes!";
        let secret_b = b"member_bravo_secret_key_32bytes!";
        let (root, _leaf_a, leaf_b) = build_two_leaf_tree(secret_a, secret_b);

        let witness = ShadowSigWitness {
            identity_secret: secret_a.to_vec(),
            merkle_path: vec![leaf_b.clone()],
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: b"proposal_treasury_transfer_001".to_vec(),
            vote: true,
        };

        let journal = execute(&witness).expect("should succeed");
        assert!(journal.vote);
        assert_eq!(journal.merkle_root, root);
        assert!(!journal.nullifier_hash.is_empty());
        assert_eq!(journal.nullifier_hash.len(), 32);
    }

    #[test]
    fn test_different_proposals_produce_different_nullifiers() {
        let secret = b"member_alpha_secret_key_32bytes!";
        let other = b"member_bravo_secret_key_32bytes!";
        let (root, _la, lb) = build_two_leaf_tree(secret, other);

        let w1 = ShadowSigWitness {
            identity_secret: secret.to_vec(),
            merkle_path: vec![lb.clone()],
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: b"proposal_001".to_vec(),
            vote: true,
        };
        let w2 = ShadowSigWitness {
            identity_secret: secret.to_vec(),
            merkle_path: vec![lb.clone()],
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: b"proposal_002".to_vec(),
            vote: true,
        };

        let j1 = execute(&w1).unwrap();
        let j2 = execute(&w2).unwrap();
        assert_ne!(j1.nullifier_hash, j2.nullifier_hash, "nullifiers must differ across proposals");
    }

    #[test]
    fn test_same_proposal_produces_same_nullifier() {
        let secret = b"member_alpha_secret_key_32bytes!";
        let other = b"member_bravo_secret_key_32bytes!";
        let (root, _la, lb) = build_two_leaf_tree(secret, other);

        let w1 = ShadowSigWitness {
            identity_secret: secret.to_vec(),
            merkle_path: vec![lb.clone()],
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: b"proposal_001".to_vec(),
            vote: true,
        };
        let w2 = ShadowSigWitness {
            identity_secret: secret.to_vec(),
            merkle_path: vec![lb.clone()],
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: b"proposal_001".to_vec(),
            vote: true,
        };

        let j1 = execute(&w1).unwrap();
        let j2 = execute(&w2).unwrap();
        assert_eq!(j1.nullifier_hash, j2.nullifier_hash, "same member+proposal must produce same nullifier");
    }

    #[test]
    fn test_invalid_merkle_path_rejected() {
        let secret = b"member_alpha_secret_key_32bytes!";
        let other = b"member_bravo_secret_key_32bytes!";
        let (_root, _la, _lb) = build_two_leaf_tree(secret, other);

        let witness = ShadowSigWitness {
            identity_secret: secret.to_vec(),
            merkle_path: vec![vec![0u8; 32]], // wrong sibling
            leaf_index: 0,
            merkle_root: vec![0xFFu8; 32], // wrong root
            proposal_id: b"proposal_001".to_vec(),
            vote: true,
        };

        let result = execute(&witness);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "InvalidMerkleRoot");
    }

    #[test]
    fn test_non_member_rejected() {
        let secret_a = b"member_alpha_secret_key_32bytes!";
        let secret_b = b"member_bravo_secret_key_32bytes!";
        let (root, _la, lb) = build_two_leaf_tree(secret_a, secret_b);

        // Impersonator uses wrong secret
        let witness = ShadowSigWitness {
            identity_secret: b"impersonator_not_a_real_member!!".to_vec(),
            merkle_path: vec![lb.clone()],
            leaf_index: 0,
            merkle_root: root,
            proposal_id: b"proposal_001".to_vec(),
            vote: true,
        };

        assert!(execute(&witness).is_err(), "non-member must be rejected");
    }
}
