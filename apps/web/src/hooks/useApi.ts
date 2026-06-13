import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// --- Types mapping to Rust models ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Multisig {
  id: string;
  name: string;
  description: string | null;
  threshold: number;
  member_count: number;
  merkle_root: number[]; // Vec<u8> mapped to number[]
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  multisig_id: string;
  commitment: number[];
  leaf_index: number;
  joined_at: string;
}

export interface Proposal {
  id: string;
  multisig_id: string;
  title: string;
  description: string | null;
  action_type: string;
  action_data: any | null;
  approval_count: number;
  threshold: number;
  status: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Metrics {
  total_multisigs: number;
  active_proposals: number;
  proofs_generated: number;
  avg_proof_latency_ms: number;
  nullifiers_consumed: number;
}

// --- Hooks ---

// Multisigs
export function useMultisigs() {
  return useQuery({
    queryKey: ["multisigs"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Multisig[]>>("/multisigs");
      if (!data.success) throw new Error(data.error);
      return data.data || [];
    },
  });
}

// Proposals
export function useProposals() {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Proposal[]>>("/proposals");
      if (!data.success) throw new Error(data.error);
      return data.data || [];
    },
  });
}

// Metrics
export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Metrics>>("/metrics");
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    refetchInterval: 10000,
  });
}

// Members
export function useMembers(multisigId: string | null) {
  return useQuery({
    queryKey: ["members", multisigId],
    queryFn: async () => {
      if (!multisigId) return [];
      const { data } = await api.get<ApiResponse<Member[]>>(`/multisigs/${multisigId}/members`);
      if (!data.success) throw new Error(data.error);
      return data.data || [];
    },
    enabled: !!multisigId,
  });
}

// Create Multisig
export function useCreateMultisig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string; threshold: number; member_commitments: string[] }) => {
      const { data } = await api.post<ApiResponse<Multisig>>("/multisigs", payload);
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["multisigs"] });
    },
  });
}

// Create Proposal
export function useCreateProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { multisig_id: string; title: string; description?: string; action_type: string; action_data?: any }) => {
      const { data } = await api.post<ApiResponse<Proposal>>("/proposals", payload);
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
}

// Approve Proposal
export function useApproveProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { proposal_id: string; nullifier: string; proof: string }) => {
      const { data } = await api.post<ApiResponse<any>>("/approvals", payload);
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}

// Execute Proposal
export function useExecuteProposal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { proposal_id: string; trigger_payload?: any }) => {
      const { data } = await api.post<ApiResponse<any>>("/execute", payload);
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
}
