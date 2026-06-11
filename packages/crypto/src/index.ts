// ShadowSig Client-Side Crypto Utilities
// Used for local proof preparation and Merkle tree construction

/**
 * Compute SHA-256 hash
 */
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/**
 * Compute commitment from a secret key
 */
export async function computeCommitment(secret: Uint8Array): Promise<Uint8Array> {
  return sha256(secret);
}

/**
 * Derive a nullifier from secret + proposal ID
 * Deterministic: same inputs always produce same nullifier
 */
export async function computeNullifier(
  secret: Uint8Array,
  proposalId: Uint8Array
): Promise<Uint8Array> {
  const combined = new Uint8Array(secret.length + proposalId.length);
  combined.set(secret);
  combined.set(proposalId, secret.length);
  return sha256(combined);
}

/**
 * Build a Merkle tree from leaf commitments
 * Returns the root and all intermediate nodes
 */
export async function buildMerkleTree(
  leaves: Uint8Array[]
): Promise<{ root: Uint8Array; layers: Uint8Array[][] }> {
  // Pad to power of 2
  const paddedLeaves = [...leaves];
  while (paddedLeaves.length & (paddedLeaves.length - 1)) {
    paddedLeaves.push(new Uint8Array(32)); // empty leaf
  }

  // Hash leaves
  const hashedLeaves = await Promise.all(paddedLeaves.map((l) => sha256(l)));
  const layers: Uint8Array[][] = [hashedLeaves];

  // Build tree bottom-up
  let currentLayer = hashedLeaves;
  while (currentLayer.length > 1) {
    const nextLayer: Uint8Array[] = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      const combined = new Uint8Array(64);
      combined.set(currentLayer[i]);
      combined.set(currentLayer[i + 1], 32);
      nextLayer.push(await sha256(combined));
    }
    layers.push(nextLayer);
    currentLayer = nextLayer;
  }

  return { root: currentLayer[0], layers };
}

/**
 * Generate Merkle proof for a leaf at given index
 */
export function getMerkleProof(
  layers: Uint8Array[][],
  leafIndex: number
): Uint8Array[] {
  const proof: Uint8Array[] = [];
  let idx = leafIndex;

  for (let i = 0; i < layers.length - 1; i++) {
    const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
    if (siblingIdx < layers[i].length) {
      proof.push(layers[i][siblingIdx]);
    }
    idx = Math.floor(idx / 2);
  }

  return proof;
}

/**
 * Verify a Merkle proof
 */
export async function verifyMerkleProof(
  leaf: Uint8Array,
  proof: Uint8Array[],
  root: Uint8Array,
  leafIndex: number
): Promise<boolean> {
  let current = await sha256(leaf);
  let idx = leafIndex;

  for (const sibling of proof) {
    const combined = new Uint8Array(64);
    if (idx % 2 === 0) {
      combined.set(current);
      combined.set(sibling, 32);
    } else {
      combined.set(sibling);
      combined.set(current, 32);
    }
    current = await sha256(combined);
    idx = Math.floor(idx / 2);
  }

  return arraysEqual(current, root);
}

/**
 * Convert bytes to hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Zeroize sensitive data
 */
export function zeroize(data: Uint8Array): void {
  data.fill(0);
}

function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
