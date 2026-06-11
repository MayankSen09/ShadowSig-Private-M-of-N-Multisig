// ============================================================
// SHADOWSIG TYPES
// Core type definitions for the platform
// ============================================================

export type MultisigStatus = "active" | "paused" | "archived";
export type ProposalStatus = "pending" | "approved" | "rejected" | "executed" | "expired";
export type ProofStatus = "generating" | "verified" | "failed" | "cached";
export type ExecutionStatus = "pending" | "executing" | "completed" | "failed";
export type ActionType = "transfer" | "config_change" | "member_add" | "member_remove" | "custom";

export interface Multisig {
  id: string;
  name: string;
  description: string;
  threshold: number;
  memberCount: number;
  merkleRoot: string;
  status: MultisigStatus;
  createdAt: string;
  updatedAt: string;
  activeProposals: number;
  treasuryBalance: number;
}

export interface Member {
  id: string;
  multisigId: string;
  commitment: string;
  leafIndex: number;
  joinedAt: string;
}

export interface Proposal {
  id: string;
  multisigId: string;
  title: string;
  description: string;
  actionType: ActionType;
  actionData: Record<string, unknown>;
  approvalCount: number;
  threshold: number;
  status: ProposalStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  proposalId: string;
  nullifier: string;
  proof: string;
  verified: boolean;
  createdAt: string;
}

export interface ZkProof {
  id: string;
  proposalId: string;
  status: ProofStatus;
  computeUnits: number;
  latencyMs: number;
  verifierProgram: string;
  receipt: string;
  createdAt: string;
}

export interface Execution {
  id: string;
  proposalId: string;
  txHash: string;
  status: ExecutionStatus;
  executedAt: string | null;
  createdAt: string;
}

export interface TreasuryAction {
  id: string;
  multisigId: string;
  actionType: ActionType;
  asset: string;
  amount: number;
  recipient: string;
  executionId: string;
  createdAt: string;
}

export interface VerifierLog {
  id: string;
  proofId: string;
  verifierProgram: string;
  result: boolean;
  computeUnits: number;
  latencyMs: number;
  createdAt: string;
}

export interface DashboardMetrics {
  totalMultisigs: number;
  activeProposals: number;
  proofsGenerated: number;
  avgProofLatency: number;
  treasuryValue: number;
  executionsCompleted: number;
  nullifiersConsumed: number;
  computeUnitsUsed: number;
}

export interface ActivityEvent {
  id: string;
  type: "approval" | "proof" | "execution" | "proposal" | "member";
  title: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "error";
}

export interface ProofLatencyDataPoint {
  timestamp: string;
  latencyMs: number;
  computeUnits: number;
}

export interface TreasuryAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  change24h: number;
}
