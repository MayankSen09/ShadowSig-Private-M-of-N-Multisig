use sha2::{Digest, Sha256};

/// Compute SHA-256 hash of input bytes
pub fn sha256(data: &[u8]) -> Vec<u8> {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hasher.finalize().to_vec()
}

/// Generate a nullifier hash from a secret and proposal ID
pub fn compute_nullifier(secret: &[u8], proposal_id: &[u8]) -> Vec<u8> {
    let mut input = Vec::with_capacity(secret.len() + proposal_id.len());
    input.extend_from_slice(secret);
    input.extend_from_slice(proposal_id);
    sha256(&input)
}

/// Compute a commitment from a secret key
pub fn compute_commitment(secret: &[u8]) -> Vec<u8> {
    sha256(secret)
}

/// Verify a Merkle membership proof
pub fn verify_merkle_proof(leaf: &[u8], proof: &[Vec<u8>], root: &[u8], index: u32) -> bool {
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

/// Zero-fill sensitive data in memory
pub fn zeroize(data: &mut [u8]) {
    for byte in data.iter_mut() {
        *byte = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_nullifier_deterministic() {
        let secret = b"test_secret";
        let proposal_id = b"proposal_001";
        let n1 = compute_nullifier(secret, proposal_id);
        let n2 = compute_nullifier(secret, proposal_id);
        assert_eq!(n1, n2);
    }

    #[test]
    fn test_nullifier_unique_per_proposal() {
        let secret = b"test_secret";
        let n1 = compute_nullifier(secret, b"proposal_001");
        let n2 = compute_nullifier(secret, b"proposal_002");
        assert_ne!(n1, n2);
    }

    #[test]
    fn test_zeroize() {
        let mut data = vec![1, 2, 3, 4, 5];
        zeroize(&mut data);
        assert!(data.iter().all(|&b| b == 0));
    }
}
