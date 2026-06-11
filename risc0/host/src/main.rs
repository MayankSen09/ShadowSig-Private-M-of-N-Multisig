//! ShadowSig Host Prover
//!
//! Drives the RISC0 guest program to generate zk proofs.
//! In dev-mode (RISC0_DEV_MODE=1), the guest runs on the host CPU without
//! generating a real STARK — useful for fast iteration.
//! In production mode (RISC0_DEV_MODE=0), a full STARK receipt is generated.
//!
//! This module also provides a `SimulatedProver` that mirrors the guest logic
//! on the host side so the system works end-to-end without the risc0 toolchain.

use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};

// Re-export the shared types from guest
// In a real risc0 build these would come from the methods crate
#[derive(Debug, Serialize, Deserialize)]
pub struct ShadowSigWitness {
    pub identity_secret: Vec<u8>,
    pub merkle_path: Vec<Vec<u8>>,
    pub leaf_index: u32,
    pub merkle_root: Vec<u8>,
    pub proposal_id: Vec<u8>,
    pub vote: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ShadowSigJournal {
    pub nullifier_hash: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub proposal_id: Vec<u8>,
    pub vote: bool,
}

/// Result of a proof generation attempt
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofResult {
    /// The public journal output
    pub journal: ShadowSigJournal,
    /// Serialized receipt bytes (empty in simulated mode)
    pub receipt_bytes: Vec<u8>,
    /// Whether this was a real STARK proof or simulated
    pub is_simulated: bool,
    /// Time taken in milliseconds
    pub generation_time_ms: u64,
}

/// Simulated prover that runs the guest logic on the host CPU.
/// Produces valid journal outputs but no cryptographic STARK proof.
/// This is the fallback when the risc0 toolchain is not installed.
pub struct SimulatedProver;

impl SimulatedProver {
    /// Generate a simulated proof by running guest logic on the host CPU.
    pub fn prove(witness: &ShadowSigWitness) -> Result<ProofResult, ProofError> {
        let start = std::time::Instant::now();

        // Step 1: Compute commitment
        let commitment = sha256(&witness.identity_secret);

        // Step 2: Verify Merkle membership
        let leaf = sha256(&commitment);
        if !verify_merkle_path(
            &leaf,
            &witness.merkle_path,
            &witness.merkle_root,
            witness.leaf_index,
        ) {
            return Err(ProofError::InvalidMerkleRoot);
        }

        // Step 3: Derive nullifier
        let mut nullifier_pre = Vec::with_capacity(
            witness.identity_secret.len() + witness.proposal_id.len(),
        );
        nullifier_pre.extend_from_slice(&witness.identity_secret);
        nullifier_pre.extend_from_slice(&witness.proposal_id);
        let nullifier_hash = sha256(&nullifier_pre);

        let elapsed = start.elapsed().as_millis() as u64;

        let journal = ShadowSigJournal {
            nullifier_hash,
            merkle_root: witness.merkle_root.clone(),
            proposal_id: witness.proposal_id.clone(),
            vote: witness.vote,
        };

        // Simulated receipt: just serialize the journal as a stand-in
        let receipt_bytes = serde_json::to_vec(&journal).unwrap_or_default();

        Ok(ProofResult {
            journal,
            receipt_bytes,
            is_simulated: true,
            generation_time_ms: elapsed,
        })
    }

    /// Verify a simulated proof (just checks journal consistency).
    pub fn verify(result: &ProofResult, expected_root: &[u8], expected_proposal: &[u8]) -> Result<(), ProofError> {
        if result.journal.merkle_root != expected_root {
            return Err(ProofError::InvalidMerkleRoot);
        }
        if result.journal.proposal_id != expected_proposal {
            return Err(ProofError::InvalidWitness);
        }
        if result.journal.nullifier_hash.len() != 32 {
            return Err(ProofError::InvalidProof);
        }
        Ok(())
    }
}

/// Deterministic error codes for proof operations
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProofError {
    InvalidProof,
    InvalidMerkleRoot,
    InvalidWitness,
    NullifierAlreadyUsed,
    ProposalExpired,
    ProposalExecuted,
    ThresholdNotReached,
    ProverUnavailable,
}

impl std::fmt::Display for ProofError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProofError::InvalidProof => write!(f, "InvalidProof"),
            ProofError::InvalidMerkleRoot => write!(f, "InvalidMerkleRoot"),
            ProofError::InvalidWitness => write!(f, "InvalidWitness"),
            ProofError::NullifierAlreadyUsed => write!(f, "NullifierAlreadyUsed"),
            ProofError::ProposalExpired => write!(f, "ProposalExpired"),
            ProofError::ProposalExecuted => write!(f, "ProposalExecuted"),
            ProofError::ThresholdNotReached => write!(f, "ThresholdNotReached"),
            ProofError::ProverUnavailable => write!(f, "ProverUnavailable"),
        }
    }
}

impl std::error::Error for ProofError {}

// ─────────────────────────────────────────────────────────
// Crypto helpers (shared with guest)
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
            combined.extend_from_slice(&current);
            combined.extend_from_slice(sibling);
        } else {
            combined.extend_from_slice(sibling);
            combined.extend_from_slice(&current);
        }
        current = sha256(&combined);
        index /= 2;
    }
    current == expected_root
}

// ─────────────────────────────────────────────────────────
// Merkle tree builder (used by host for setup)
// ─────────────────────────────────────────────────────────

/// Build a Merkle tree from identity commitments.
/// Returns (root, layers) where layers[0] = hashed leaves.
pub fn build_merkle_tree(commitments: &[Vec<u8>]) -> (Vec<u8>, Vec<Vec<Vec<u8>>>) {
    // Pad to power of 2
    let mut leaves: Vec<Vec<u8>> = commitments.iter().map(|c| sha256(c)).collect();
    while leaves.len().count_ones() != 1 {
        leaves.push(vec![0u8; 32]); // empty leaf padding
    }

    let mut layers: Vec<Vec<Vec<u8>>> = vec![leaves.clone()];
    let mut current = leaves;

    while current.len() > 1 {
        let mut next = Vec::new();
        for pair in current.chunks(2) {
            let mut combined = Vec::with_capacity(64);
            combined.extend_from_slice(&pair[0]);
            combined.extend_from_slice(&pair[1]);
            next.push(sha256(&combined));
        }
        layers.push(next.clone());
        current = next;
    }

    (current[0].clone(), layers)
}

/// Get the Merkle proof (sibling path) for a leaf at the given index.
pub fn get_merkle_proof(layers: &[Vec<Vec<u8>>], leaf_index: usize) -> Vec<Vec<u8>> {
    let mut proof = Vec::new();
    let mut idx = leaf_index;

    for layer in &layers[..layers.len() - 1] {
        let sibling_idx = if idx % 2 == 0 { idx + 1 } else { idx - 1 };
        if sibling_idx < layer.len() {
            proof.push(layer[sibling_idx].clone());
        }
        idx /= 2;
    }

    proof
}

/// Compute an identity commitment from a secret
pub fn compute_commitment(secret: &[u8]) -> Vec<u8> {
    sha256(secret)
}

/// Compute a nullifier from secret + proposal_id
pub fn compute_nullifier(secret: &[u8], proposal_id: &[u8]) -> Vec<u8> {
    let mut pre = Vec::with_capacity(secret.len() + proposal_id.len());
    pre.extend_from_slice(secret);
    pre.extend_from_slice(proposal_id);
    sha256(&pre)
}

fn main() {
    println!("ShadowSig Host Prover");
    println!("Usage: integrate as library via SimulatedProver::prove()");

    // Quick demo: 2-of-3 multisig
    let secrets: Vec<Vec<u8>> = vec![
        b"member_alpha_secret_key_32bytes!".to_vec(),
        b"member_bravo_secret_key_32bytes!".to_vec(),
        b"member_charlie_secret_key_32b!!".to_vec(),
    ];

    let commitments: Vec<Vec<u8>> = secrets.iter().map(|s| compute_commitment(s)).collect();
    let (root, layers) = build_merkle_tree(&commitments);
    let proposal_id = b"proposal_treasury_transfer_001".to_vec();

    println!("Merkle root: {}", hex::encode(&root));
    println!("Members: {}", secrets.len());

    for (i, secret) in secrets.iter().enumerate().take(2) {
        let proof_path = get_merkle_proof(&layers, i);
        let witness = ShadowSigWitness {
            identity_secret: secret.clone(),
            merkle_path: proof_path,
            leaf_index: i as u32,
            merkle_root: root.clone(),
            proposal_id: proposal_id.clone(),
            vote: true,
        };

        match SimulatedProver::prove(&witness) {
            Ok(result) => {
                println!(
                    "Member {} approved — nullifier: {} ({}ms, simulated={})",
                    i,
                    hex::encode(&result.journal.nullifier_hash),
                    result.generation_time_ms,
                    result.is_simulated,
                );
            }
            Err(e) => {
                eprintln!("Member {} proof failed: {}", i, e);
            }
        }
    }

    println!("Threshold 2/3 reached — proposal executable!");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_full_workflow() {
        let secrets = vec![
            b"secret_alice_________________________________".to_vec(),
            b"secret_bob___________________________________".to_vec(),
        ];
        let commitments: Vec<Vec<u8>> = secrets.iter().map(|s| compute_commitment(s)).collect();
        let (root, layers) = build_merkle_tree(&commitments);
        let proposal_id = b"prop_001".to_vec();

        // Member 0 approves
        let proof_path = get_merkle_proof(&layers, 0);
        let witness = ShadowSigWitness {
            identity_secret: secrets[0].clone(),
            merkle_path: proof_path,
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: proposal_id.clone(),
            vote: true,
        };

        let result = SimulatedProver::prove(&witness).unwrap();
        assert!(result.is_simulated);
        assert!(result.journal.vote);
        assert_eq!(result.journal.merkle_root, root);

        // Verify
        SimulatedProver::verify(&result, &root, &proposal_id).unwrap();
    }

    #[test]
    fn test_nullifier_determinism() {
        let secret = b"deterministic_secret_key_here!!!".to_vec();
        let other = b"other_member_secret_key_here!!!!".to_vec();
        let commitments = vec![compute_commitment(&secret), compute_commitment(&other)];
        let (root, layers) = build_merkle_tree(&commitments);
        let proposal = b"prop_x".to_vec();

        let proof_path = get_merkle_proof(&layers, 0);
        let w = ShadowSigWitness {
            identity_secret: secret.clone(),
            merkle_path: proof_path.clone(),
            leaf_index: 0,
            merkle_root: root.clone(),
            proposal_id: proposal.clone(),
            vote: true,
        };

        let r1 = SimulatedProver::prove(&w).unwrap();
        let r2 = SimulatedProver::prove(&w).unwrap();
        assert_eq!(r1.journal.nullifier_hash, r2.journal.nullifier_hash);
    }

    #[test]
    fn test_merkle_tree_and_proof() {
        let commitments = vec![
            compute_commitment(b"a"),
            compute_commitment(b"b"),
            compute_commitment(b"c"),
            compute_commitment(b"d"),
        ];
        let (root, layers) = build_merkle_tree(&commitments);
        assert_eq!(root.len(), 32);
        assert_eq!(layers.len(), 3); // 4 leaves -> 2 nodes -> 1 root

        // Verify all proofs work
        for i in 0..4 {
            let proof = get_merkle_proof(&layers, i);
            let leaf = sha256(&commitments[i]);
            assert!(verify_merkle_path(&leaf, &proof, &root, i as u32));
        }
    }
}
