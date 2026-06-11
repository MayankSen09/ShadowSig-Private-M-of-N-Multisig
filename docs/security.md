# Security Model

## Threat Model

ShadowSig protects against:

1. **Identity Exposure** — Signers are never revealed, even to other multisig members
2. **Vote Linkage** — Approvals cannot be linked to specific members
3. **Replay Attacks** — Nullifiers prevent submitting the same approval twice
4. **Proof Forgery** — Only members with valid secret keys can generate valid proofs
5. **Front-Running** — Approval order is not meaningful and cannot be exploited

## Privacy Guarantees

### What IS visible on-chain:
- Proposal details (title, action, threshold)
- Number of approvals received
- Whether threshold was reached
- Execution transaction

### What is NEVER visible:
- Which members approved
- Approval order
- Member activity patterns
- Linkage between approvals and members
- Secret keys or private Merkle paths

## Cryptographic Primitives

| Primitive | Usage | Security Level |
|-----------|-------|---------------|
| SHA-256 | Commitments, Merkle tree, nullifiers | 128-bit |
| STARK Proofs | zk proof of membership + vote | Post-quantum |
| Merkle Trees | Membership verification | Collision-resistant |
| Nullifiers | Double-vote prevention | Deterministic |

## Operational Security

### Secret Management
- Secret keys are generated and stored client-side only
- Secrets are zeroized from memory after proof generation
- No secret material is ever transmitted to the backend

### Proof Generation
- Proofs are generated locally on the client
- The proving process runs inside the Risc0 zkVM
- Only the receipt (public output) is submitted

### Nullifier Registry
- Nullifiers are stored in PostgreSQL with unique constraints
- Each nullifier is derived from `H(secret || proposal_id)`
- The same member produces different nullifiers for different proposals
- A consumed nullifier immediately rejects duplicate submissions

### Audit Trail
- All verification operations are logged in `verifier_logs`
- Logs contain timing, compute units, and verification results
- Logs do NOT contain any information that could identify signers
