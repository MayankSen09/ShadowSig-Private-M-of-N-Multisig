import { create } from "zustand";
import type { ActivityEvent } from "./types";

// ============================================================
// DASHBOARD STORE
// ============================================================

interface DashboardState {
  // Pure UI state and transient activity
  activityEvents: ActivityEvent[];
  sidebarOpen: boolean;
  selectedMultisigId: string | null;
  isAuthenticated: boolean;
  identityCommitment: string | null;
  identityPrivateKey: string | null;
  identityPublicKey: string | null;

  // Actions
  login: (commitment: string, privateKey: string, publicKey: string) => void;
  logout: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  selectMultisig: (id: string | null) => void;
  addActivity: (event: ActivityEvent) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activityEvents: [],
  sidebarOpen: true,
  selectedMultisigId: null,
  isAuthenticated: false,
  identityCommitment: null,
  identityPrivateKey: null,
  identityPublicKey: null,

  login: (commitment, privateKey, publicKey) => set({ 
    isAuthenticated: true,
    identityCommitment: commitment,
    identityPrivateKey: privateKey,
    identityPublicKey: publicKey
  }),
  logout: () => set({ 
    isAuthenticated: false,
    identityCommitment: null,
    identityPrivateKey: null,
    identityPublicKey: null
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectMultisig: (id) => set({ selectedMultisigId: id }),

  addActivity: (event) =>
    set((s) => ({ activityEvents: [event, ...s.activityEvents].slice(0, 50) })),
}));
