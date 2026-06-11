import { create } from "zustand";
import type {
  Multisig,
  Proposal,
  ZkProof,
  DashboardMetrics,
  ActivityEvent,
  TreasuryAsset,
} from "./types";
import {
  mockMetrics,
  mockMultisigs,
  mockProposals,
  mockProofs,
  mockActivity,
  mockTreasuryAssets,
} from "./mock-data";

// ============================================================
// DASHBOARD STORE
// ============================================================

interface DashboardState {
  metrics: DashboardMetrics;
  multisigs: Multisig[];
  proposals: Proposal[];
  proofs: ZkProof[];
  activity: ActivityEvent[];
  treasuryAssets: TreasuryAsset[];
  sidebarOpen: boolean;
  selectedMultisigId: string | null;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  selectMultisig: (id: string | null) => void;
  addActivity: (event: ActivityEvent) => void;
  updateProposalApproval: (proposalId: string) => void;
  updateProofStatus: (proofId: string, status: ZkProof["status"]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: mockMetrics,
  multisigs: mockMultisigs,
  proposals: mockProposals,
  proofs: mockProofs,
  activity: mockActivity,
  treasuryAssets: mockTreasuryAssets,
  sidebarOpen: true,
  selectedMultisigId: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectMultisig: (id) => set({ selectedMultisigId: id }),

  addActivity: (event) =>
    set((s) => ({ activity: [event, ...s.activity].slice(0, 50) })),

  updateProposalApproval: (proposalId) =>
    set((s) => ({
      proposals: s.proposals.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              approvalCount: p.approvalCount + 1,
              status:
                p.approvalCount + 1 >= p.threshold ? "approved" : p.status,
            }
          : p
      ),
    })),

  updateProofStatus: (proofId, status) =>
    set((s) => ({
      proofs: s.proofs.map((p) =>
        p.id === proofId ? { ...p, status } : p
      ),
    })),
}));
