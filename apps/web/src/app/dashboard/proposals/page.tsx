"use client";

import { motion } from "framer-motion";
import { useProposals, useApproveProposal, useExecuteProposal } from "@/hooks/useApi";
import { ProposalCard } from "@/components/ui/proposal-card";
import { ApprovalModal } from "@/components/ui/approval-modal";
import { Plus, Search, Shield, Zap } from "lucide-react";
import { useState } from "react";
import type { ProposalStatus, Proposal } from "@/lib/types";

const statusFilters: { label: string; value: ProposalStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Executed", value: "executed" },
  { label: "Expired", value: "expired" },
];

export default function ProposalsPage() {
  const { data: proposals, isLoading } = useProposals();
  const approveMutation = useApproveProposal();
  const executeMutation = useExecuteProposal();
  const [filter, setFilter] = useState<ProposalStatus | "all">("all");
  const [approvalTarget, setApprovalTarget] = useState<Proposal | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading proposals...</div>;
  }

  const safeProposals = proposals || [];
  const filtered = filter === "all" ? safeProposals : safeProposals.filter((p: Proposal) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--color-border-primary)]">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text-primary)] mb-1">Proposals</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)]">Manage governance proposals and approvals</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg bg-white border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm transition-all">
          <Plus className="h-4 w-4" /> Create Proposal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search proposals by title or ID..."
            className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl bg-white border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-[10px] bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] w-fit shadow-inner">
          {statusFilters.map((sf) => {
            const isActive = filter === sf.value;
            return (
              <button
                key={sf.value}
                onClick={() => setFilter(sf.value)}
                className={`px-3.5 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                  isActive
                    ? "bg-white text-[var(--color-text-primary)] border border-[var(--color-border-primary)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] border border-transparent"
                }`}
              >
                {sf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filtered.map((proposal, i) => (
          <motion.div key={proposal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="relative">
              <ProposalCard proposal={proposal} />
              {/* Approve button overlay */}
              {proposal.status === "pending" && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setApprovalTarget(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all shadow-sm"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    Approve
                  </button>
                </div>
              )}
              {proposal.status === "approved" && (
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => executeMutation.mutate({ proposal_id: proposal.id })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Execute
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[var(--color-border-primary)] p-16 text-center shadow-sm">
            <p className="text-[14px] font-medium text-[var(--color-text-tertiary)]">No proposals found matching the criteria</p>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={!!approvalTarget}
        onClose={() => setApprovalTarget(null)}
        proposalId={approvalTarget?.id ?? ""}
        proposalTitle={approvalTarget?.title ?? ""}
        onApproved={() => {
          if (approvalTarget) {
            approveMutation.mutate({
              proposal_id: approvalTarget.id,
              // Sending mock nullifier/proof for testing purposes if UI doesn't provide them yet
              nullifier: "0000000000000000000000000000000000000000000000000000000000000000",
              proof: "00",
            });
          }
          setApprovalTarget(null);
        }}
      />
    </div>
  );
}
