use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofResult {
    pub journal: ShadowSigJournal,
    pub receipt_bytes: Vec<u8>,
    pub is_simulated: bool,
    pub generation_time_ms: u64,
}

pub struct SimulatedProver;

impl SimulatedProver {
    pub fn prove(witness: &ShadowSigWitness) -> Result<ProofResult, ProofError> {
        let start = std::time::Instant::now();

        let commitment = sha256(&witness.identity_secret);
        let leaf = sha256(&commitment);
        if !verify_merkle_path(
            &leaf,
            &witness.merkle_path,
            &witness.merkle_root,
            witness.leaf_index,
        ) {
            return Err(ProofError::InvalidMerkleRoot);
        }

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

        let receipt_bytes = serde_json::to_vec(&journal).unwrap_or_default();

        Ok(ProofResult {
            journal,
            receipt_bytes,
            is_simulated: true,
            generation_time_ms: elapsed,
        })
    }

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

pub fn build_merkle_tree(commitments: &[Vec<u8>]) -> (Vec<u8>, Vec<Vec<Vec<u8>>>) {
    let mut leaves: Vec<Vec<u8>> = commitments.iter().map(|c| sha256(c)).collect();
    while leaves.len().count_ones() != 1 {
        leaves.push(vec![0u8; 32]);
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

pub fn compute_commitment(secret: &[u8]) -> Vec<u8> {
    sha256(secret)
}

pub fn compute_nullifier(secret: &[u8], proposal_id: &[u8]) -> Vec<u8> {
    let mut pre = Vec::with_capacity(secret.len() + proposal_id.len());
    pre.extend_from_slice(secret);
    pre.extend_from_slice(proposal_id);
    sha256(&pre)
}
