import axios from "axios";

// Default to localhost:8080 for development, or the injected env var.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const handleRequest = async <T>(request: Promise<any>): Promise<T> => {
  try {
    const response = await request;
    if (!response.data.success) {
      throw new ApiError(response.status, response.data.error || "Unknown API Error");
    }
    return response.data.data;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.error || error.message
    );
  }
};

export const apiService = {
  // Auth
  getToken: (clientId: string, clientSecret: string) =>
    handleRequest<{ token: string; expires_in: number }>(
      api.post("/auth/token", { client_id: clientId, client_secret: clientSecret })
    ),

  // Multisigs
  createMultisig: (data: any) =>
    handleRequest<any>(api.post("/multisigs", data)),
  listMultisigs: () =>
    handleRequest<any[]>(api.get("/multisigs")),
  getMultisig: (id: string) =>
    handleRequest<any>(api.get(`/multisigs/${id}`)),
  getMembers: (id: string) =>
    handleRequest<any[]>(api.get(`/multisigs/${id}/members`)),

  // Proposals
  createProposal: (data: any) =>
    handleRequest<any>(api.post("/proposals", data)),
  listProposals: (multisigId?: string) =>
    handleRequest<any[]>(api.get("/proposals", { params: { multisig_id: multisigId } })),
  getProposal: (id: string) =>
    handleRequest<any>(api.get(`/proposals/${id}`)),

  // Approvals & Proofs
  generateProof: (data: any) =>
    handleRequest<any>(api.post("/proofs/generate", data)),
  submitApproval: (data: any) =>
    handleRequest<any>(api.post("/approvals", data)),
  
  // Execution & Treasury
  executeProposal: (data: any) =>
    handleRequest<any>(api.post("/execute", data)),
  getTreasuryActions: (multisigId: string) =>
    handleRequest<any[]>(api.get(`/treasury/${multisigId}`)),
  listAllTreasuryActions: () =>
    handleRequest<any[]>(api.get("/treasury")),
  
  // Metrics
  getMetrics: () =>
    handleRequest<any>(api.get("/metrics")),
};
