# Threat Model

## Scope

ShadowSig is designed to protect the anonymity of multisig members and the unlinkability of their approvals. This document defines what the system protects against and what it does NOT protect against.

## Protected Properties

### 1. Member Anonymity
- **Guarantee**: No observer (including other multisig members) can determine which specific members approved a proposal.
- **Mechanism**: Semaphore-style identity commitments stored as Merkle leaves. Only the Merkle root is public.

### 2. Approval Anonymity
- **Guarantee**: Approvals cannot be linked to specific member identities.
- **Mechanism**: ZK proofs prove membership without revealing the identity. The prover demonstrates knowledge of a secret whose commitment is in the tree.

### 3. Replay Prevention
- **Guarantee**: A member cannot vote twice on the same proposal.
- **Mechanism**: Deterministic nullifiers: `nullifier = H(identity_secret || proposal_id)`. Same member + same proposal always produces the same nullifier. The contract rejects duplicate nullifiers.

### 4. Cross-Proposal Unlinkability
- **Guarantee**: An observer cannot determine if the same member approved two different proposals.
- **Mechanism**: Different `proposal_id` values produce different nullifiers for the same member. Nullifiers are unlinkable across proposals.

### 5. Execution Unlinkability
- **Guarantee**: The executor of a proposal cannot be linked to any specific approver.
- **Mechanism**: Any party (including a relayer) can trigger execution once the threshold is met. No approval-specific information is needed.

### 6. Proof Forgery Prevention
- **Guarantee**: Only legitimate members can generate valid proofs.
- **Mechanism**: The ZK circuit verifies `commitment = H(identity_secret)` and Merkle membership. Without the secret, no valid proof can be generated.

## NOT Protected

### 1. Timing Correlation
- **Risk**: An observer monitoring network traffic may correlate approval submission times with known member activity patterns.
- **Mitigation**: Use Tor, VPNs, or time-delayed submission relayers.

### 2. Proposal Privacy
- **Risk**: Proposal contents (title, action, amount) are public.
- **Rationale**: This is intentional — governance transparency requires visible proposals.

### 3. Threshold Visibility
- **Risk**: The threshold value (M of N) is public.
- **Rationale**: Required for verifiable quorum checking.

### 4. Approval Count
- **Risk**: The number of approvals received is visible.
- **Rationale**: Required for threshold verification. However, *who* approved is hidden.

### 5. Network Metadata
- **Risk**: IP addresses, request timing, and other network metadata are visible to the API server.
- **Mitigation**: Deploy with Tor hidden services or privacy-preserving relayers.

### 6. Merkle Root Updates
- **Risk**: When members are added/removed, the Merkle root changes, which is observable.
- **Mitigation**: Batch membership changes and use periodic root rotation.

## Attack Vectors

| Attack | Protected? | Notes |
|--------|-----------|-------|
| Identify who voted | ✅ Yes | ZK proofs hide voter identity |
| Vote twice | ✅ Yes | Nullifier uniqueness prevents replay |
| Forge a vote | ✅ Yes | ZK proof requires valid secret + membership |
| Link votes across proposals | ✅ Yes | Different nullifiers per proposal |
| Timing analysis | ❌ No | Use delayed submission as mitigation |
| Bribe a member to reveal vote | ❌ No | Secret key holder can always prove they voted |
| Collude to de-anonymize | ⚠️ Partial | If M-1 members collude, the Mth vote is identifiable by elimination |

## Assumptions

1. Members store their identity secrets securely (not on compromised devices).
2. The SHA-256 hash function is collision-resistant and preimage-resistant.
3. The RISC0 zkVM STARK proof system is sound (no false proofs).
4. The Merkle tree is constructed correctly at multisig creation time.
5. The API server does not log request bodies containing proofs in a way that enables correlation.
