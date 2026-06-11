//! ShadowSig LEZ Verifier Program
//!
//! This module simulates a SPEL smart contract deployed on the Logos Execution Zone.
//! In production, this would be compiled to RISC-V and executed inside the LEZ runtime.
//!
//! The verifier program manages:
//! - MultisigConfig accounts (Merkle root, threshold, member count)
//! - Proposal accounts (action hash, approval tracking)
//! - NullifierRegistry (consumed nullifiers for replay protection)
//! - Execution authorization (threshold gating)

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{HashMap, HashSet};
use thiserror::Error;

// ============================================================
// ERROR CODES
// ============================================================

#[derive(Debug, Clone, Error, Serialize, Deserialize, PartialEq, Eq)]
pub enum VerifierError {
    #[error("InvalidProof: the zk proof receipt failed verification")]
    InvalidProof,

    #[error("NullifierAlreadyUsed: this member has already voted on this proposal")]
    NullifierAlreadyUsed,

    #[error("ProposalExpired: the proposal voting period has ended")]
    ProposalExpired,

    #[error("ProposalExecuted: the proposal has already been executed")]
    ProposalExecuted,

    #[error("ThresholdNotReached: insufficient approvals to execute")]
    ThresholdNotReached,

    #[error("InvalidMerkleRoot: the proof's merkle root does not match the multisig config")]
    InvalidMerkleRoot,

    #[error("InvalidWitness: the witness data is malformed")]
    InvalidWitness,

    #[error("MultisigNotFound: multisig with given ID does not exist")]
    MultisigNotFound,

    #[error("ProposalNotFound: proposal with given ID does not exist")]
    ProposalNotFound,

    #[error("InvalidThreshold: threshold must be > 0 and <= member_count")]
    InvalidThreshold,
}

// ============================================================
// ON-CHAIN ACCOUNT STRUCTURES
// ============================================================

/// MultisigConfig — stored on-chain, defines the multisig parameters
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MultisigConfig {
    pub multisig_id: [u8; 32],
    pub merkle_root: [u8; 32],
    pub threshold: u8,
    pub member_count: u8,
}

/// Proposal — stored on-chain, tracks a governance action
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proposal {
    pub proposal_id: [u8; 32],
    pub multisig_id: [u8; 32],
    pub action_hash: [u8; 32],
    pub approvals: u32,
    pub executed: bool,
}

/// Journal output from the ZK proof (public)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofJournal {
    pub nullifier_hash: Vec<u8>,
    pub merkle_root: Vec<u8>,
    pub proposal_id: Vec<u8>,
    pub vote: bool,
}

// ============================================================
// VERIFIER STATE
// ============================================================

/// In-memory state simulating LEZ on-chain storage
#[derive(Debug, Default)]
pub struct VerifierState {
    pub multisigs: HashMap<[u8; 32], MultisigConfig>,
    pub proposals: HashMap<[u8; 32], Proposal>,
    pub nullifiers: HashSet<Vec<u8>>,
}

impl VerifierState {
    pub fn new() -> Self {
        Self::default()
    }

    // ── Instruction: Create Multisig ──

    pub fn create_multisig(
        &mut self,
        multisig_id: [u8; 32],
        merkle_root: [u8; 32],
        threshold: u8,
        member_count: u8,
    ) -> Result<(), VerifierError> {
        if threshold == 0 || threshold > member_count {
            return Err(VerifierError::InvalidThreshold);
        }

        let config = MultisigConfig {
            multisig_id,
            merkle_root,
            threshold,
            member_count,
        };
        self.multisigs.insert(multisig_id, config);
        Ok(())
    }

    // ── Instruction: Create Proposal ──

    pub fn create_proposal(
        &mut self,
        proposal_id: [u8; 32],
        multisig_id: [u8; 32],
        action_hash: [u8; 32],
    ) -> Result<(), VerifierError> {
        if !self.multisigs.contains_key(&multisig_id) {
            return Err(VerifierError::MultisigNotFound);
        }

        let proposal = Proposal {
            proposal_id,
            multisig_id,
            action_hash,
            approvals: 0,
            executed: false,
        };
        self.proposals.insert(proposal_id, proposal);
        Ok(())
    }

    // ── Instruction: Submit Approval ──
    //
    // Validates the proof journal, checks nullifier uniqueness,
    // and increments the approval count.

    pub fn submit_approval(
        &mut self,
        journal: &ProofJournal,
        _receipt_bytes: &[u8],  // In production: verify STARK receipt
    ) -> Result<u32, VerifierError> {
        // 1. Parse proposal_id from journal
        let proposal_id: [u8; 32] = journal
            .proposal_id
            .clone()
            .try_into()
            .map_err(|_| VerifierError::InvalidWitness)?;

        // 2. Look up proposal
        let proposal = self
            .proposals
            .get(&proposal_id)
            .ok_or(VerifierError::ProposalNotFound)?;

        if proposal.executed {
            return Err(VerifierError::ProposalExecuted);
        }

        // 3. Look up multisig config
        let config = self
            .multisigs
            .get(&proposal.multisig_id)
            .ok_or(VerifierError::MultisigNotFound)?;

        // 4. Verify merkle root matches config
        let journal_root: [u8; 32] = journal
            .merkle_root
            .clone()
            .try_into()
            .map_err(|_| VerifierError::InvalidWitness)?;

        if journal_root != config.merkle_root {
            return Err(VerifierError::InvalidMerkleRoot);
        }

        // 5. Check nullifier uniqueness
        if self.nullifiers.contains(&journal.nullifier_hash) {
            return Err(VerifierError::NullifierAlreadyUsed);
        }

        // 6. In production: verify the STARK receipt against METHOD_ID
        //    risc0_zkvm::Receipt::verify(receipt_bytes, METHOD_ID)?;
        //    For now, we trust the journal from the simulated prover.

        // 7. Consume nullifier
        self.nullifiers.insert(journal.nullifier_hash.clone());

        // 8. Increment approvals
        let proposal = self.proposals.get_mut(&proposal_id).unwrap();
        proposal.approvals += 1;

        Ok(proposal.approvals)
    }

    // ── Instruction: Execute Proposal ──

    pub fn execute_proposal(
        &mut self,
        proposal_id: [u8; 32],
    ) -> Result<[u8; 32], VerifierError> {
        let proposal = self
            .proposals
            .get(&proposal_id)
            .ok_or(VerifierError::ProposalNotFound)?;

        if proposal.executed {
            return Err(VerifierError::ProposalExecuted);
        }

        let config = self
            .multisigs
            .get(&proposal.multisig_id)
            .ok_or(VerifierError::MultisigNotFound)?;

        if proposal.approvals < config.threshold as u32 {
            return Err(VerifierError::ThresholdNotReached);
        }

        let action_hash = proposal.action_hash;

        // Mark executed
        let proposal = self.proposals.get_mut(&proposal_id).unwrap();
        proposal.executed = true;

        // Return the action hash for the LEZ runtime to dispatch
        Ok(action_hash)
    }

    // ── Query Helpers ──

    pub fn get_proposal(&self, id: &[u8; 32]) -> Option<&Proposal> {
        self.proposals.get(id)
    }

    pub fn get_multisig(&self, id: &[u8; 32]) -> Option<&MultisigConfig> {
        self.multisigs.get(id)
    }

    pub fn is_nullifier_used(&self, nullifier: &[u8]) -> bool {
        self.nullifiers.contains(nullifier)
    }
}

// ============================================================
// HELPERS
// ============================================================

/// Hash arbitrary data to a 32-byte ID
pub fn hash_to_id(data: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    let mut id = [0u8; 32];
    id.copy_from_slice(&result);
    id
}

// ============================================================
// TESTS
// ============================================================

#[cfg(test)]
mod tests {
    use super::*;

    fn setup_2of3() -> (VerifierState, [u8; 32], [u8; 32]) {
        let mut state = VerifierState::new();
        let multisig_id = hash_to_id(b"test_multisig");
        let merkle_root = hash_to_id(b"fake_merkle_root_for_testing");

        state
            .create_multisig(multisig_id, merkle_root, 2, 3)
            .unwrap();

        let proposal_id = hash_to_id(b"test_proposal");
        let action_hash = hash_to_id(b"transfer_100_eth");

        state
            .create_proposal(proposal_id, multisig_id, action_hash)
            .unwrap();

        (state, multisig_id, proposal_id)
    }

    fn make_journal(
        nullifier: &[u8],
        merkle_root: &[u8; 32],
        proposal_id: &[u8; 32],
    ) -> ProofJournal {
        ProofJournal {
            nullifier_hash: nullifier.to_vec(),
            merkle_root: merkle_root.to_vec(),
            proposal_id: proposal_id.to_vec(),
            vote: true,
        }
    }

    #[test]
    fn test_full_lifecycle() {
        let (mut state, multisig_id, proposal_id) = setup_2of3();
        let config = state.get_multisig(&multisig_id).unwrap();
        let root = config.merkle_root;

        // First approval
        let journal1 = make_journal(b"nullifier_member_0_prop_test____", &root, &proposal_id);
        let count = state.submit_approval(&journal1, &[]).unwrap();
        assert_eq!(count, 1);

        // Second approval (different nullifier)
        let journal2 = make_journal(b"nullifier_member_1_prop_test____", &root, &proposal_id);
        let count = state.submit_approval(&journal2, &[]).unwrap();
        assert_eq!(count, 2);

        // Execute
        let action = state.execute_proposal(proposal_id).unwrap();
        assert_eq!(action, hash_to_id(b"transfer_100_eth"));

        // Double execute fails
        assert_eq!(
            state.execute_proposal(proposal_id).unwrap_err(),
            VerifierError::ProposalExecuted
        );
    }

    #[test]
    fn test_double_vote_prevention() {
        let (mut state, multisig_id, proposal_id) = setup_2of3();
        let root = state.get_multisig(&multisig_id).unwrap().merkle_root;

        let journal = make_journal(b"nullifier_member_0_prop_test____", &root, &proposal_id);
        state.submit_approval(&journal, &[]).unwrap();

        // Same nullifier again
        assert_eq!(
            state.submit_approval(&journal, &[]).unwrap_err(),
            VerifierError::NullifierAlreadyUsed,
        );
    }

    #[test]
    fn test_threshold_not_reached() {
        let (mut state, multisig_id, proposal_id) = setup_2of3();
        let root = state.get_multisig(&multisig_id).unwrap().merkle_root;

        // Only 1 approval
        let journal = make_journal(b"nullifier_member_0_prop_test____", &root, &proposal_id);
        state.submit_approval(&journal, &[]).unwrap();

        // Try to execute with only 1 of 2 required
        assert_eq!(
            state.execute_proposal(proposal_id).unwrap_err(),
            VerifierError::ThresholdNotReached
        );
    }

    #[test]
    fn test_wrong_merkle_root() {
        let (mut state, _multisig_id, proposal_id) = setup_2of3();
        let wrong_root = hash_to_id(b"completely_wrong_root");

        let journal = make_journal(b"nullifier_member_0_prop_test____", &wrong_root, &proposal_id);
        assert_eq!(
            state.submit_approval(&journal, &[]).unwrap_err(),
            VerifierError::InvalidMerkleRoot,
        );
    }

    #[test]
    fn test_invalid_threshold() {
        let mut state = VerifierState::new();
        let id = hash_to_id(b"bad");
        let root = hash_to_id(b"root");

        assert_eq!(
            state.create_multisig(id, root, 0, 3).unwrap_err(),
            VerifierError::InvalidThreshold,
        );
        assert_eq!(
            state.create_multisig(id, root, 5, 3).unwrap_err(),
            VerifierError::InvalidThreshold,
        );
    }
}
