"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { useMultisigs } from "@/hooks/useApi";
import { ThresholdRing } from "@/components/ui/threshold-ring";
import { VerificationPulse } from "@/components/ui/verification-pulse";
import { CreateMultisigModal } from "@/components/ui/create-multisig-modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Filter, ArrowUpRight } from "lucide-react";

export default function MultisigsPage() {
  const { data: multisigs, isLoading } = useMultisigs();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading multisigs...</div>;
  }

  const safeMultisigs = multisigs || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Multisigs</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage shielded multisig wallets</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> Create Multisig
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            placeholder="Search multisigs by name or ID..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] transition-all shadow-sm"
          />
        </div>
        <button className="p-2 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-all shadow-sm">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Multisig Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {safeMultisigs.map((ms: any, i: number) => (
          <motion.div
            key={ms.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-2xl group cursor-pointer bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm hover:shadow-[var(--shadow-card)] transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">{ms.name}</h3>
                  <VerificationPulse isVerified={ms.status === "active"} label="active" size="sm" />
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">{ms.description}</p>
              </div>
              <div className="shrink-0 flex items-center justify-center">
                <ThresholdRing current={ms.threshold} required={ms.member_count} size={48} strokeWidth={3} showLabel={false} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] rounded-lg px-3 mb-4">
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Treasury</p>
                <p className="text-[13px] font-mono font-semibold text-[var(--color-text-primary)] mt-0.5">{formatCurrency(ms.treasuryBalance)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Active</p>
                <p className="text-[13px] font-mono font-semibold text-[var(--color-text-primary)] mt-0.5">{ms.activeProposals} prop</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Members</p>
                <p className="text-[13px] font-mono font-semibold text-[var(--color-text-primary)] mt-0.5">{ms.member_count} M-N</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[var(--color-text-secondary)] font-mono truncate px-2 py-1 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] shadow-sm">
                Root: {ms.merkle_root.toString().slice(0, 16)}...
              </span>
              <div className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-accent)] transition-colors">
                <span>Manage</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <CreateMultisigModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(ms) => {
          console.log("Multisig created:", ms);
          setShowCreate(false);
        }}
      />
    </div>
  );
}
