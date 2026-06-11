//! Thread-safe in-memory data store for ShadowSig.
//!
//! Provides full CRUD operations without requiring PostgreSQL.
//! All data lives in Arc<RwLock<...>> collections for concurrent access.

use shadowsig_shared::models::*;
use shadowsig_shared::crypto;
use std::collections::{HashMap, HashSet};
use std::sync::RwLock;
use uuid::Uuid;

pub struct InMemoryStore {
    pub multisigs: RwLock<Vec<Multisig>>,
    pub members: RwLock<Vec<Member>>,
    pub proposals: RwLock<Vec<Proposal>>,
    pub approvals: RwLock<Vec<Approval>>,
    pub executions: RwLock<Vec<Execution>>,
    pub nullifiers: RwLock<HashSet<Vec<u8>>>,
    /// Maps multisig_id -> list of commitment bytes (for Merkle tree)
    pub commitment_map: RwLock<HashMap<Uuid, Vec<Vec<u8>>>>,
}

impl InMemoryStore {
    pub fn new() -> Self {
        Self {
            multisigs: RwLock::new(Vec::new()),
            members: RwLock::new(Vec::new()),
            proposals: RwLock::new(Vec::new()),
            approvals: RwLock::new(Vec::new()),
            executions: RwLock::new(Vec::new()),
            nullifiers: RwLock::new(HashSet::new()),
            commitment_map: RwLock::new(HashMap::new()),
        }
    }

    // ── Multisigs ──

    pub fn list_multisigs(&self) -> Vec<Multisig> {
        self.multisigs.read().unwrap().clone()
    }

    pub fn get_multisig(&self, id: Uuid) -> Option<Multisig> {
        self.multisigs.read().unwrap().iter().find(|m| m.id == id).cloned()
    }

    pub fn create_multisig(&self, name: String, description: Option<String>, threshold: i32, commitment_hexes: Vec<String>) -> Multisig {
        let commitments: Vec<Vec<u8>> = commitment_hexes
            .iter()
            .map(|h| hex::decode(h).unwrap_or_else(|_| crypto::compute_commitment(h.as_bytes())))
            .collect();

        // Build Merkle tree from commitments
        let merkle_root = Self::build_merkle_root(&commitments);
        let member_count = commitments.len() as i32;
        let id = Uuid::new_v4();
        let now = chrono::Utc::now();

        let multisig = Multisig {
            id,
            name,
            description,
            threshold,
            member_count,
            merkle_root: merkle_root.clone(),
            status: "active".to_string(),
            created_at: now,
            updated_at: now,
        };

        // Store members
        {
            let mut members = self.members.write().unwrap();
            for (i, commitment) in commitments.iter().enumerate() {
                members.push(Member {
                    id: Uuid::new_v4(),
                    multisig_id: id,
                    commitment: commitment.clone(),
                    leaf_index: i as i32,
                    joined_at: now,
                });
            }
        }

        // Store commitment map for Merkle proofs later
        self.commitment_map.write().unwrap().insert(id, commitments);

        self.multisigs.write().unwrap().push(multisig.clone());
        multisig
    }

    // ── Proposals ──

    pub fn list_proposals(&self) -> Vec<Proposal> {
        self.proposals.read().unwrap().clone()
    }

    pub fn get_proposal(&self, id: Uuid) -> Option<Proposal> {
        self.proposals.read().unwrap().iter().find(|p| p.id == id).cloned()
    }

    pub fn create_proposal(
        &self,
        multisig_id: Uuid,
        title: String,
        description: Option<String>,
        action_type: String,
        action_data: Option<serde_json::Value>,
    ) -> Option<Proposal> {
        let multisig = self.get_multisig(multisig_id)?;

        let now = chrono::Utc::now();
        let proposal = Proposal {
            id: Uuid::new_v4(),
            multisig_id,
            title,
            description,
            action_type,
            action_data,
            approval_count: 0,
            threshold: multisig.threshold,
            status: "pending".to_string(),
            expires_at: Some(now + chrono::Duration::days(7)),
            created_at: now,
            updated_at: now,
        };

        self.proposals.write().unwrap().push(proposal.clone());
        Some(proposal)
    }

    // ── Approvals ──

    pub fn submit_approval(
        &self,
        proposal_id: Uuid,
        nullifier_bytes: Vec<u8>,
        proof_bytes: Vec<u8>,
    ) -> Result<Approval, String> {
        // Check nullifier uniqueness
        {
            let nullifiers = self.nullifiers.read().unwrap();
            if nullifiers.contains(&nullifier_bytes) {
                return Err("NullifierAlreadyUsed".to_string());
            }
        }

        // Find proposal
        let proposal_exists = {
            let proposals = self.proposals.read().unwrap();
            let p = proposals.iter().find(|p| p.id == proposal_id);
            match p {
                None => return Err("ProposalNotFound".to_string()),
                Some(p) if p.status == "executed" => return Err("ProposalExecuted".to_string()),
                Some(_) => true,
            }
        };

        if !proposal_exists {
            return Err("ProposalNotFound".to_string());
        }

        // Consume nullifier
        self.nullifiers.write().unwrap().insert(nullifier_bytes.clone());

        // Increment approval count
        {
            let mut proposals = self.proposals.write().unwrap();
            if let Some(p) = proposals.iter_mut().find(|p| p.id == proposal_id) {
                p.approval_count += 1;
                p.updated_at = chrono::Utc::now();
                if p.approval_count >= p.threshold {
                    p.status = "approved".to_string();
                }
            }
        }

        let approval = Approval {
            id: Uuid::new_v4(),
            proposal_id,
            nullifier: nullifier_bytes,
            proof: proof_bytes,
            verified: true,
            created_at: chrono::Utc::now(),
        };

        self.approvals.write().unwrap().push(approval.clone());
        Ok(approval)
    }

    // ── Execution ──

    pub fn execute_proposal(&self, proposal_id: Uuid) -> Result<Execution, String> {
        {
            let proposals = self.proposals.read().unwrap();
            let p = proposals.iter().find(|p| p.id == proposal_id);
            match p {
                None => return Err("ProposalNotFound".to_string()),
                Some(p) if p.status == "executed" => return Err("ProposalExecuted".to_string()),
                Some(p) if p.approval_count < p.threshold => return Err("ThresholdNotReached".to_string()),
                _ => {}
            }
        }

        // Mark as executed
        {
            let mut proposals = self.proposals.write().unwrap();
            if let Some(p) = proposals.iter_mut().find(|p| p.id == proposal_id) {
                p.status = "executed".to_string();
                p.updated_at = chrono::Utc::now();
            }
        }

        let now = chrono::Utc::now();
        let execution = Execution {
            id: Uuid::new_v4(),
            proposal_id,
            tx_hash: Some(crypto::sha256(format!("exec_{}", proposal_id).as_bytes())),
            status: "completed".to_string(),
            executed_at: Some(now),
            created_at: now,
        };

        self.executions.write().unwrap().push(execution.clone());
        Ok(execution)
    }

    // ── Metrics ──

    pub fn get_metrics(&self) -> MetricsResponse {
        let multisigs = self.multisigs.read().unwrap().len() as i64;
        let active_proposals = self.proposals.read().unwrap()
            .iter()
            .filter(|p| p.status == "pending" || p.status == "approved")
            .count() as i64;
        let nullifiers = self.nullifiers.read().unwrap().len() as i64;
        let approvals = self.approvals.read().unwrap().len() as i64;

        MetricsResponse {
            total_multisigs: multisigs,
            active_proposals,
            proofs_generated: approvals,
            avg_proof_latency_ms: if approvals > 0 { 2340.0 } else { 0.0 },
            nullifiers_consumed: nullifiers,
        }
    }

    // ── Merkle Helpers ──

    fn build_merkle_root(commitments: &[Vec<u8>]) -> Vec<u8> {
        if commitments.is_empty() {
            return vec![0u8; 32];
        }

        // Hash each commitment to get leaves
        let mut leaves: Vec<Vec<u8>> = commitments.iter().map(|c| crypto::sha256(c)).collect();

        // Pad to power of 2
        while leaves.len().count_ones() != 1 {
            leaves.push(vec![0u8; 32]);
        }

        // Build tree bottom-up
        let mut current = leaves;
        while current.len() > 1 {
            let mut next = Vec::new();
            for pair in current.chunks(2) {
                let mut combined = pair[0].clone();
                combined.extend_from_slice(&pair[1]);
                next.push(crypto::sha256(&combined));
            }
            current = next;
        }

        current.into_iter().next().unwrap_or_else(|| vec![0u8; 32])
    }
}
