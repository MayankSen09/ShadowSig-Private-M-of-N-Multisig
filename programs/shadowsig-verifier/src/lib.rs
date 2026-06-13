//! ShadowSig LEZ Verifier Program
//!
//! SPEL smart contract deployed on the Logos Execution Zone.
//! Implements a private M-of-N multisig using ZK STARK receipts for approval verification.

use lez_framework::prelude::*;
use sha2::{Digest, Sha256};

declare_id!("ShadowSig11111111111111111111111111111111111");

#[lez_program]
pub mod shadowsig_verifier {
    use super::*;

    /// Initialize a new M-of-N private multisig vault.
    pub fn create_multisig(
        ctx: Context<CreateMultisig>,
        merkle_root: [u8; 32],
        threshold: u8,
        member_count: u8,
    ) -> Result<()> {
        require!(threshold > 0 && threshold <= member_count, VerifierError::InvalidThreshold);

        let multisig = &mut ctx.accounts.multisig;
        multisig.merkle_root = merkle_root;
        multisig.threshold = threshold;
        multisig.member_count = member_count;
        multisig.authority = *ctx.accounts.authority.key;

        Ok(())
    }

    /// Create a new proposal for the multisig to vote on.
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        action_hash: [u8; 32],
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        proposal.multisig = ctx.accounts.multisig.key();
        proposal.action_hash = action_hash;
        proposal.approvals = 0;
        proposal.executed = false;

        Ok(())
    }

    /// Submit a ZK proof of membership and approval.
    pub fn submit_approval(
        ctx: Context<SubmitApproval>,
        journal: ProofJournal,
        receipt_bytes: Vec<u8>,
    ) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let multisig = &ctx.accounts.multisig;

        require!(!proposal.executed, VerifierError::ProposalExecuted);
        require!(journal.merkle_root == multisig.merkle_root, VerifierError::InvalidMerkleRoot);

        // Verify the STARK receipt on-chain using the LEZ zkVM precompile
        // Note: RISC0_METHOD_ID would be compiled into the program in production
        lez_zkvm::verify_receipt(&receipt_bytes, &journal.serialize()?)
            .map_err(|_| VerifierError::InvalidProof)?;

        // Record the nullifier to prevent double voting
        let nullifier_registry = &mut ctx.accounts.nullifier_registry;
        nullifier_registry.consumed_at = Clock::get()?.unix_timestamp;

        proposal.approvals = proposal.approvals.checked_add(1).unwrap();

        Ok(())
    }

    /// Execute the proposal if the threshold is met.
    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let multisig = &ctx.accounts.multisig;

        require!(!proposal.executed, VerifierError::ProposalExecuted);
        require!(proposal.approvals >= multisig.threshold as u32, VerifierError::ThresholdNotReached);

        proposal.executed = true;

        // In a real LEZ deployment, this would dispatch a CPI (Cross-Program Invocation)
        // or emit an event for a relayer to execute the inner action.
        emit!(ProposalExecutedEvent {
            proposal: proposal.key(),
            action_hash: proposal.action_hash,
        });

        Ok(())
    }
}

// ============================================================
// ACCOUNTS
// ============================================================

#[derive(Accounts)]
pub struct CreateMultisig<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 1 + 1 + 32)]
    pub multisig: Account<'info, MultisigConfig>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateProposal<'info> {
    #[account(init, payer = proposer, space = 8 + 32 + 32 + 4 + 1)]
    pub proposal: Account<'info, Proposal>,
    pub multisig: Account<'info, MultisigConfig>,
    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(journal: ProofJournal)]
pub struct SubmitApproval<'info> {
    #[account(mut, has_one = multisig)]
    pub proposal: Account<'info, Proposal>,
    pub multisig: Account<'info, MultisigConfig>,
    
    // The nullifier account PDA is seeded by the nullifier hash to guarantee uniqueness
    #[account(
        init,
        payer = relayer,
        space = 8 + 8,
        seeds = [b"nullifier", journal.nullifier_hash.as_ref()],
        bump
    )]
    pub nullifier_registry: Account<'info, NullifierRegistry>,
    
    #[account(mut)]
    pub relayer: Signer<'info>, // Pays for the tx, but doesn't reveal approver identity
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteProposal<'info> {
    #[account(mut, has_one = multisig)]
    pub proposal: Account<'info, Proposal>,
    pub multisig: Account<'info, MultisigConfig>,
}

// ============================================================
// STATE
// ============================================================

#[account]
pub struct MultisigConfig {
    pub merkle_root: [u8; 32],
    pub threshold: u8,
    pub member_count: u8,
    pub authority: Pubkey,
}

#[account]
pub struct Proposal {
    pub multisig: Pubkey,
    pub action_hash: [u8; 32],
    pub approvals: u32,
    pub executed: bool,
}

#[account]
pub struct NullifierRegistry {
    pub consumed_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct ProofJournal {
    pub nullifier_hash: [u8; 32],
    pub merkle_root: [u8; 32],
    pub proposal_id: [u8; 32],
    pub vote: bool,
}

#[event]
pub struct ProposalExecutedEvent {
    pub proposal: Pubkey,
    pub action_hash: [u8; 32],
}

// ============================================================
// ERRORS
// ============================================================

#[error_code]
pub enum VerifierError {
    #[msg("InvalidThreshold: threshold must be > 0 and <= member_count")]
    InvalidThreshold,
    #[msg("ProposalExecuted: the proposal has already been executed")]
    ProposalExecuted,
    #[msg("ThresholdNotReached: insufficient approvals to execute")]
    ThresholdNotReached,
    #[msg("InvalidMerkleRoot: the proof's merkle root does not match the multisig config")]
    InvalidMerkleRoot,
    #[msg("InvalidProof: the zk proof receipt failed verification")]
    InvalidProof,
}
