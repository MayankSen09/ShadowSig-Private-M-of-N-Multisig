"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { ThresholdRing } from "@/components/ui/threshold-ring";
import { VerificationPulse } from "@/components/ui/verification-pulse";
import { CreateMultisigModal } from "@/components/ui/create-multisig-modal";
import { formatCurrency } from "@/lib/utils";
import { Plus, Search, Filter, ArrowUpRight } from "lucide-react";

export default function MultisigsPage() {
  const { multisigs } = useDashboardStore();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Multisigs</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage shielded multisig wallets</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all"
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
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-zinc-900/50 border border-white/5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <button className="p-2 rounded-lg border border-white/5 bg-zinc-900/50 hover:bg-zinc-900 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all">
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Multisig Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {multisigs.map((ms, i) => (
          <motion.div
            key={ms.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-6 group cursor-pointer bg-zinc-900/30 border border-white/5 shadow-md hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] truncate">{ms.name}</h3>
                  <VerificationPulse isVerified={ms.status === "active"} label="active" size="sm" />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">{ms.description}</p>
              </div>
              <div className="shrink-0 bg-zinc-950/40 p-1.5 rounded-full border border-white/[0.03] shadow-inner flex items-center justify-center">
                <ThresholdRing current={ms.threshold} threshold={ms.memberCount} size={48} strokeWidth={3} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/[0.03] bg-zinc-950/10 rounded-lg px-3 mb-4">
              <div>
                <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">Treasury</p>
                <p className="text-xs font-mono font-bold text-[var(--color-text-primary)] mt-0.5">{formatCurrency(ms.treasuryBalance)}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">Active</p>
                <p className="text-xs font-mono font-bold text-[var(--color-text-primary)] mt-0.5">{ms.activeProposals} prop</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">Members</p>
                <p className="text-xs font-mono font-bold text-[var(--color-text-primary)] mt-0.5">{ms.memberCount} M-N</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-[var(--color-text-tertiary)] font-mono truncate bg-zinc-950/40 px-2 py-1 rounded border border-white/[0.01]">
                Root: {ms.merkleRoot.slice(0, 16)}...
              </span>
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] group-hover:text-cyan-400 transition-colors">
                <span className="text-[10px] font-medium uppercase tracking-wider">Manage</span>
                <ArrowUpRight className="h-3 w-3" />
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
