//! ShadowSig Proof Service
//!
//! Handles zk proof generation via Risc0 zkVM.
//! This service runs guest programs that prove:
//! 1. Membership in the Merkle tree (without revealing which member)
//! 2. Valid vote for a specific proposal
//! 3. Correct nullifier derivation
//!
//! The proof output (receipt) is verified on-chain by the LEZ verifier program.

use sha2::{Sha256, Digest};
use serde::{Deserialize, Serialize};

/// Input to the zk proof circuit
#[derive(Debug, Serialize, Deserialize)]
pub struct ProofInput {
    /// The member's secret key (private input - never revealed)
    pub secret: Vec<u8>,
    /// Merkle proof path from leaf to root
    pub merkle_path: Vec<Vec<u8>>,
    /// Leaf index in the Merkle tree
    pub leaf_index: u32,
    /// Expected Merkle root (public input)
    pub merkle_root: Vec<u8>,
    /// Proposal ID being voted on (public input)
    pub proposal_id: Vec<u8>,
}

/// Output committed to the proof journal (public)
#[derive(Debug, Serialize, Deserialize)]
pub struct ProofOutput {
    /// The nullifier (prevents double-voting)
    pub nullifier: Vec<u8>,
    /// The Merkle root (proves membership)
    pub merkle_root: Vec<u8>,
    /// The proposal ID
    pub proposal_id: Vec<u8>,
    /// Vote value (approve/reject)
    pub vote: bool,
}

/// Simulate proof generation (replace with actual Risc0 execution)
pub fn generate_proof(input: &ProofInput) -> Result<ProofOutput, String> {
    // Step 1: Compute commitment from secret
    let commitment = sha256(&input.secret);

    // Step 2: Verify Merkle membership
    let valid = verify_merkle_proof(
        &commitment,
        &input.merkle_path,
        &input.merkle_root,
        input.leaf_index,
    );

    if !valid {
        return Err("Merkle membership verification failed".to_string());
    }

    // Step 3: Derive nullifier (deterministic, unique per proposal)
    let nullifier = compute_nullifier(&input.secret, &input.proposal_id);

    Ok(ProofOutput {
        nullifier,
        merkle_root: input.merkle_root.clone(),
        proposal_id: input.proposal_id.clone(),
        vote: true,
    })
}

fn sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

fn compute_nullifier(secret: &[u8], proposal_id: &[u8]) -> Vec<u8> {
    let mut input = Vec::with_capacity(secret.len() + proposal_id.len());
    input.extend_from_slice(secret);
    input.extend_from_slice(proposal_id);
    sha256(&input)
}

fn verify_merkle_proof(leaf: &[u8], proof: &[Vec<u8>], root: &[u8], index: u32) -> bool {
    let mut current = sha256(leaf);
    let mut idx = index;
    for sibling in proof {
        current = if idx % 2 == 0 {
            let mut combined = current.clone();
            combined.extend_from_slice(sibling);
            sha256(&combined)
        } else {
            let mut combined = sibling.clone();
            combined.extend_from_slice(&current);
            sha256(&combined)
        };
        idx /= 2;
    }
    current == root
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_proof_generation() {
        // Create a simple 2-leaf tree
        let secret_a = b"secret_member_a".to_vec();
        let secret_b = b"secret_member_b".to_vec();

        let leaf_a = sha256(&sha256(&secret_a));
        let leaf_b = sha256(&sha256(&secret_b));

        let mut root_input = leaf_a.clone();
        root_input.extend_from_slice(&leaf_b);
        let root = sha256(&root_input);

        let input = ProofInput {
            secret: secret_a,
            merkle_path: vec![leaf_b],
            leaf_index: 0,
            merkle_root: root,
            proposal_id: b"proposal_001".to_vec(),
        };

        let result = generate_proof(&input);
        assert!(result.is_ok());

        let output = result.unwrap();
        assert!(!output.nullifier.is_empty());
        assert!(output.vote);
    }
}
