# Zero-Knowledge Proof Flow

## Overview

ShadowSig uses Risc0 zkVM to generate STARK proofs that verify:
1. A member belongs to the multisig (Merkle membership)
2. The member has voted on a specific proposal
3. A unique nullifier was correctly derived (replay protection)

**Without revealing which member voted.**

## Proof Circuit

```
┌─────────────────────────────────────────────────────┐
│                 RISC0 GUEST PROGRAM                  │
│                                                      │
│  Private Inputs:              Public Inputs:         │
│  ┌─────────────┐             ┌──────────────┐       │
│  │ secret_key   │             │ merkle_root  │       │
│  │ merkle_path  │             │ proposal_id  │       │
│  │ leaf_index   │             │              │       │
│  └─────────────┘             └──────────────┘       │
│                                                      │
│  Step 1: commitment = H(secret_key)                  │
│  Step 2: verify_merkle(commitment, path, root)       │
│  Step 3: nullifier = H(secret_key || proposal_id)    │
│  Step 4: commit(nullifier, merkle_root, proposal_id) │
│                                                      │
│  Public Output (Journal):                            │
│  ┌─────────────────────────────────────────┐        │
│  │ nullifier     (prevents double-voting)   │        │
│  │ merkle_root   (proves membership)        │        │
│  │ proposal_id   (links to proposal)        │        │
│  │ vote          (approve/reject)           │        │
│  └─────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  STARK Receipt   │
              │  (verifiable by  │
              │   anyone)        │
              └──────────────────┘
```

## Flow Steps

### 1. Member Preparation (Client-Side)
- Member has a `secret_key` (never shared)
- `commitment = SHA256(secret_key)` was added to the Merkle tree at creation time

### 2. Proof Generation (Client-Side)
- Member constructs proof input with secret, Merkle path, and proposal ID
- Risc0 zkVM executes the guest program
- A STARK receipt is generated containing the public journal

### 3. Submission (Anonymous)
- Member submits the receipt + nullifier to the API
- No information about the member's identity is transmitted
- The submission is unlinkable to the member

### 4. Verification (On-Chain)
- The LEZ verifier program checks the STARK receipt
- Nullifier uniqueness is verified against the registry
- Approval count is incremented if valid

### 5. Threshold Completion
- When `approval_count >= threshold`, the proposal is marked as approved
- A quorum proof is generated to bundle all approvals
- Treasury action is executed

## Security Properties

| Property | Guarantee |
|----------|-----------|
| **Anonymity** | Signer identity is never revealed |
| **Unlinkability** | Approvals cannot be linked to specific members |
| **Soundness** | Only valid members can generate valid proofs |
| **Replay Protection** | Nullifiers prevent double-voting |
| **Non-forgeability** | Proofs cannot be forged without the secret key |
