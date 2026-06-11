/**
 * ShadowSig SDK
 *
 * Client-side library for interacting with the ShadowSig private multisig protocol.
 * Handles identity generation, Merkle tree construction, proof preparation,
 * and API communication.
 */

// Re-export crypto utilities
export {
  sha256,
  computeCommitment,
  computeNullifier,
  buildMerkleTree,
  getMerkleProof,
  verifyMerkleProof,
  bytesToHex,
  hexToBytes,
  zeroize,
} from "@shadowsig/crypto";

// ============================================================
// IDENTITY
// ============================================================

export interface ShadowSigIdentity {
  /** The secret key — NEVER share this */
  secret: Uint8Array;
  /** The public commitment = SHA256(secret) */
  commitment: Uint8Array;
  /** Hex-encoded commitment for display/storage */
  commitmentHex: string;
}

/**
 * Generate a new ShadowSig identity (secret + commitment).
 * The secret is generated using the browser's CSPRNG.
 */
export async function generateIdentity(): Promise<ShadowSigIdentity> {
  const { computeCommitment, bytesToHex } = await import("@shadowsig/crypto");
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  const commitment = await computeCommitment(secret);
  return {
    secret,
    commitment,
    commitmentHex: bytesToHex(commitment),
  };
}

/**
 * Restore an identity from a hex-encoded secret.
 */
export async function restoreIdentity(secretHex: string): Promise<ShadowSigIdentity> {
  const { hexToBytes, computeCommitment, bytesToHex } = await import("@shadowsig/crypto");
  const secret = hexToBytes(secretHex);
  const commitment = await computeCommitment(secret);
  return {
    secret,
    commitment,
    commitmentHex: bytesToHex(commitment),
  };
}

// ============================================================
// PROOF PREPARATION
// ============================================================

export interface ProofRequest {
  identitySecret: Uint8Array;
  merklePath: Uint8Array[];
  leafIndex: number;
  merkleRoot: Uint8Array;
  proposalId: Uint8Array;
}

export interface ProofResult {
  nullifierHash: string;
  merkleRoot: string;
  proposalId: string;
  vote: boolean;
  receiptHex: string;
  isSimulated: boolean;
  generationTimeMs: number;
}

/**
 * Prepare a local proof (simulated on client-side).
 * In production, this would invoke the RISC0 prover.
 */
export async function generateLocalProof(req: ProofRequest): Promise<ProofResult> {
  const { sha256, computeNullifier, verifyMerkleProof, bytesToHex } = await import(
    "@shadowsig/crypto"
  );

  const start = performance.now();

  // Verify membership locally before sending to API
  const commitment = await sha256(req.identitySecret);
  const valid = await verifyMerkleProof(commitment, req.merklePath, req.merkleRoot, req.leafIndex);
  if (!valid) {
    throw new Error("InvalidMerkleRoot: membership verification failed locally");
  }

  // Compute nullifier
  const nullifier = await computeNullifier(req.identitySecret, req.proposalId);

  const elapsed = performance.now() - start;

  return {
    nullifierHash: bytesToHex(nullifier),
    merkleRoot: bytesToHex(req.merkleRoot),
    proposalId: bytesToHex(req.proposalId),
    vote: true,
    receiptHex: bytesToHex(nullifier), // Simulated receipt
    isSimulated: true,
    generationTimeMs: Math.round(elapsed),
  };
}

// ============================================================
// API CLIENT
// ============================================================

export interface ShadowSigClientConfig {
  apiUrl: string;
}

export class ShadowSigClient {
  private baseUrl: string;

  constructor(config: ShadowSigClientConfig) {
    this.baseUrl = config.apiUrl.replace(/\/$/, "");
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "API request failed");
    }
    return json.data;
  }

  // ── Health ──
  async health() {
    return this.request<{ status: string; version: string }>("GET", "/health");
  }

  // ── Multisigs ──
  async createMultisig(params: {
    name: string;
    description?: string;
    threshold: number;
    member_commitments: string[];
  }) {
    return this.request("POST", "/api/multisigs", params);
  }

  async listMultisigs() {
    return this.request("GET", "/api/multisigs");
  }

  async getMultisig(id: string) {
    return this.request("GET", `/api/multisigs/${id}`);
  }

  // ── Proposals ──
  async createProposal(params: {
    multisig_id: string;
    title: string;
    description?: string;
    action_type: string;
    action_data?: Record<string, unknown>;
  }) {
    return this.request("POST", "/api/proposals", params);
  }

  async listProposals() {
    return this.request("GET", "/api/proposals");
  }

  async getProposal(id: string) {
    return this.request("GET", `/api/proposals/${id}`);
  }

  // ── Approvals ──
  async submitApproval(params: {
    proposal_id: string;
    nullifier: string;
    proof: string;
  }) {
    return this.request("POST", "/api/approvals", params);
  }

  // ── Proofs ──
  async requestProofGeneration(params: {
    proposal_id: string;
    commitment: string;
    merkle_path: string[];
  }) {
    return this.request("POST", "/api/proofs/generate", params);
  }

  async getProofStatus(id: string) {
    return this.request("GET", `/api/proofs/${id}`);
  }

  // ── Execute ──
  async executeProposal(params: { proposal_id: string }) {
    return this.request("POST", "/api/execute", params);
  }

  // ── Metrics ──
  async getMetrics() {
    return this.request("GET", "/api/metrics");
  }
}
