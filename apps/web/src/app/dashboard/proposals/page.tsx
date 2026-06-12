"use client";

import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
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
  const { proposals, updateProposalApproval } = useDashboardStore();
  const [filter, setFilter] = useState<ProposalStatus | "all">("all");
  const [approvalTarget, setApprovalTarget] = useState<Proposal | null>(null);
  const filtered = filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Proposals</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage governance proposals and approvals</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all">
          <Plus className="h-4 w-4" /> Create Proposal
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search proposals by title or ID..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-zinc-900/50 border border-white/5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900/80 border border-white/5 w-fit">
          {statusFilters.map((sf) => {
            const isActive = filter === sf.value;
            return (
              <button
                key={sf.value}
                onClick={() => setFilter(sf.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 border border-white/5 shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.02]"
                }`}
              >
                {sf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {filtered.map((proposal, i) => (
          <motion.div key={proposal.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="relative">
              <ProposalCard proposal={proposal} />
              {/* Approve button overlay */}
              {proposal.status === "pending" && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setApprovalTarget(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 transition-all"
                  >
                    <Shield className="h-3 w-3" />
                    Approve
                  </button>
                </div>
              )}
              {proposal.status === "approved" && (
                <div className="absolute top-4 right-4">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/30 transition-all">
                    <Zap className="h-3 w-3" />
                    Execute
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">No proposals found</p>
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
            updateProposalApproval(approvalTarget.id);
          }
          setApprovalTarget(null);
        }}
      />
    </div>
  );
}
