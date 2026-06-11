# Protocol Specification

## Overview

ShadowSig implements a Semaphore-inspired anonymous multisig protocol adapted for the Logos Execution Zone (LEZ). The protocol enables M-of-N threshold governance where approvals are anonymous and unlinkable.

## Cryptographic Primitives

| Primitive | Usage | Security Level |
|-----------|-------|---------------|
| SHA-256 | Commitments, Merkle tree, nullifiers | 128-bit |
| STARK Proofs (RISC0) | ZK proof of membership + vote | Post-quantum |
| Merkle Trees | Membership verification | Collision-resistant |
| Nullifiers | Double-vote prevention | Deterministic |

## Protocol Steps

### Step 1: Identity Generation

Each member generates an identity locally:

```
identity_secret ← CSPRNG(32 bytes)
identity_commitment ← SHA256(identity_secret)
```

- `identity_secret` is NEVER shared or transmitted
- `identity_commitment` is the public representation

### Step 2: Multisig Creation

The creator collects commitments and builds a Merkle tree:

```
leaves = [SHA256(commitment_0), SHA256(commitment_1), ..., SHA256(commitment_n)]
pad leaves to next power of 2 (empty leaves = 0x00...00)
build binary Merkle tree bottom-up using SHA256(left || right)
merkle_root = root of tree
```

On-chain state stored:
```
MultisigConfig {
    multisig_id:  SHA256("unique_identifier"),
    merkle_root:  merkle_root,
    threshold:    M,
    member_count: N,
}
```

### Step 3: Proposal Creation

Any participant creates a proposal:

```
Proposal {
    proposal_id:  UUID,
    multisig_id:  reference to MultisigConfig,
    action_hash:  SHA256(action_data),
    approvals:    0,
    executed:     false,
}
```

### Step 4: Anonymous Approval

A member generates a ZK proof locally:

**Private inputs (witness):**
```
identity_secret
merkle_path      (sibling hashes from leaf to root)
leaf_index       (position in tree)
```

**Public inputs:**
```
merkle_root      (from MultisigConfig)
proposal_id      (from Proposal)
```

**ZK Circuit execution:**
```
1. commitment = SHA256(identity_secret)
2. leaf = SHA256(commitment)
3. verify_merkle_path(leaf, merkle_path, merkle_root, leaf_index)
4. nullifier = SHA256(identity_secret || proposal_id)
5. commit_to_journal(nullifier, merkle_root, proposal_id, vote=true)
```

**Output (public journal):**
```
ShadowSigJournal {
    nullifier_hash: [u8; 32],
    merkle_root:    [u8; 32],
    proposal_id:    [u8; 32],
    vote:           bool,
}
```

### Step 5: On-Chain Verification

The LEZ verifier program validates:

```
1. Verify STARK receipt against METHOD_ID
2. Extract journal from receipt
3. Assert journal.merkle_root == config.merkle_root
4. Assert journal.proposal_id == proposal.proposal_id
5. Assert !nullifier_registry.contains(journal.nullifier_hash)
6. Insert journal.nullifier_hash into nullifier_registry
7. proposal.approvals += 1
```

### Step 6: Threshold Execution

When `proposal.approvals >= config.threshold`:

```
1. Any party calls execute_proposal(proposal_id)
2. Verifier checks threshold is met
3. Proposal is marked as executed
4. Action is dispatched to LEZ runtime (treasury transfer, governance change, etc.)
```

## Nullifier Properties

The nullifier formula `H(identity_secret || proposal_id)` guarantees:

1. **Deterministic**: Same member + same proposal → same nullifier (prevents double voting)
2. **Unlinkable**: Different proposals → different nullifiers (prevents cross-proposal tracking)
3. **Binding**: The nullifier is bound to both the member's identity and the specific proposal
4. **Hidden**: The nullifier reveals nothing about `identity_secret` (preimage resistance)

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 6000 | InvalidProof | STARK receipt verification failed |
| 6001 | NullifierAlreadyUsed | Member has already voted on this proposal |
| 6002 | ProposalExpired | Voting period has ended |
| 6003 | ProposalExecuted | Proposal has already been executed |
| 6004 | ThresholdNotReached | Not enough approvals to execute |
| 6005 | InvalidMerkleRoot | Proof's Merkle root doesn't match config |
| 6006 | InvalidWitness | Malformed witness data |
| 6007 | MultisigNotFound | Referenced multisig doesn't exist |
| 6008 | ProposalNotFound | Referenced proposal doesn't exist |
| 6009 | InvalidThreshold | Threshold must be > 0 and ≤ member count |

## Benchmarks (Simulated Mode)

| Operation | Estimated Time | Compute Units |
|-----------|---------------|---------------|
| Proof generation (simulated) | ~5 ms | N/A |
| Proof generation (STARK) | ~2-5 sec | ~45,000 CU |
| Proof verification | ~1 ms | ~5,000 CU |
| Proposal creation | ~1 ms | ~2,000 CU |
| Approval submission | ~2 ms | ~8,000 CU |
| Execution | ~1 ms | ~3,000 CU |
