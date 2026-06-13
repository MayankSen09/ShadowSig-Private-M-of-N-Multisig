"use client";

import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { useProposals, useMetrics } from "@/hooks/useApi";
import { formatCurrency } from "@/lib/utils";
import { Shield, ArrowUpRight, Copy, Activity, Zap, Layers, Wallet, Lock } from "lucide-react";
import { ThresholdRing } from "@/components/ui/threshold-ring";
import { ProposalCard } from "@/components/ui/proposal-card";
import { ActivityFeed } from "@/components/ui/activity-feed";

export default function DashboardOverview() {
  const { activityEvents } = useDashboardStore();
  const { data: proposals, isLoading: loadingProps } = useProposals();
  const { data: metrics, isLoading: loadingMetrics } = useMetrics();

  if (loadingProps || loadingMetrics) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading dashboard...</div>;
  }

  const safeProposals = proposals || [];
  const activeProposals = safeProposals.filter((p: any) => p.status === "pending").length;

  const m = metrics || {
    proofs_generated: 0,
    avg_proof_latency_ms: 0,
    total_multisigs: 0,
    active_proposals: 0,
    nullifiers_consumed: 0
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--color-border-primary)]">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">Overview</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)]">Secure multisig operations enclave</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-sm">
            <Shield className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">Verifier Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--color-system-green)]" />
            <span className="text-[12px] font-semibold text-[var(--color-text-primary)]">LEZ Mainnet</span>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {/* Bento: Treasury Hero (Spans 2 columns) */}
        <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 rounded-[24px] overflow-hidden relative group shadow-sm border border-[var(--color-border-primary)]">
          {/* Subtle gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8f8fb] to-[#ffffff] z-0" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/10 blur-[60px] rounded-full z-0 pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:bg-blue-400/15" />
          
          <div className="relative z-10 p-7 h-full flex flex-col justify-between min-h-[220px]">
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[var(--color-border-primary)] shadow-sm mb-4">
                <Wallet className="h-3 w-3 text-[var(--color-accent)]" />
                <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Treasury Value</span>
              </div>
              <button className="p-2 rounded-full bg-white border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors shadow-sm text-[var(--color-text-secondary)]">
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  ${(100000000 / 1000000).toFixed(2)}M
                </h2>
                <span className="text-[14px] font-semibold text-[var(--color-system-green)] flex items-center">
                  +3.7% <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <p className="text-[13px] text-[var(--color-text-secondary)] mt-2 font-medium">Secured by 12 active shielded multisigs</p>
            </div>
          </div>
        </motion.div>

        {/* Bento: Action Required */}
        <motion.div variants={itemVariants} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[var(--color-system-orange)] opacity-[0.04] blur-[30px] rounded-full z-0 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 mb-4 shadow-sm">
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Pending Signatures</p>
            <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{activeProposals}</h3>
          </div>
          <button className="relative z-10 w-full mt-4 py-2.5 rounded-xl bg-white border border-[var(--color-border-primary)] text-[13px] font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-colors shadow-sm">
            Review Proposals
          </button>
        </motion.div>

        {/* Bento: ZK Proofs Stat */}
        <motion.div variants={itemVariants} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 mb-4 shadow-sm">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-[12px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-1">Proofs Generated</p>
            <h3 className="text-3xl font-bold text-[var(--color-text-primary)]">{(m.proofs_generated / 1000).toFixed(1)}K</h3>
          </div>
          <div className="mt-auto pt-4 border-t border-[var(--color-border-primary)]">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)] flex items-center justify-between">
              <span>Avg Latency</span>
              <span className="font-semibold text-[var(--color-text-primary)]">{(m.avg_proof_latency_ms / 1000).toFixed(1)}s</span>
            </p>
          </div>
        </motion.div>

        {/* Row 2 */}
        
        {/* Bento: Quorum States (Spans 2 columns) */}
        <motion.div variants={itemVariants} className="md:col-span-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Quorum Health</h3>
            <button className="text-[12px] font-medium text-[var(--color-accent)] hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="flex flex-col items-center justify-center text-center group">
              <ThresholdRing label="" current={3} required={5} size={70} strokeWidth={4} />
              <p className="text-[11px] font-semibold text-[var(--color-text-primary)] mt-3">Treasury</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">3/5 Signers</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center group">
              <ThresholdRing label="" current={4} required={7} size={70} strokeWidth={4} />
              <p className="text-[11px] font-semibold text-[var(--color-text-primary)] mt-3">Grants</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">4/7 Signers</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center group">
              <ThresholdRing label="" current={5} required={9} size={70} strokeWidth={4} />
              <p className="text-[11px] font-semibold text-[var(--color-text-primary)] mt-3">Security</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">5/9 Signers</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center group">
              <ThresholdRing label="" current={2} required={3} size={70} strokeWidth={4} />
              <p className="text-[11px] font-semibold text-[var(--color-text-primary)] mt-3">R&D Fund</p>
              <p className="text-[10px] text-[var(--color-text-secondary)]">2/3 Signers</p>
            </div>
          </div>
        </motion.div>

        {/* Bento: Active Proposals List (Spans 2 columns vertically, 1 horizontally on lg, 2 horizontally on md) */}
        <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-2 row-span-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-[24px] p-0 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[var(--color-border-primary)] flex items-center justify-between bg-white">
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--color-text-tertiary)]" /> Recent Proposals
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[10px] font-semibold text-[var(--color-text-secondary)]">{safeProposals.length} Total</span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar bg-[var(--color-bg-primary)]/30">
            {safeProposals.slice(0, 4).map((proposal: any) => (
              <ProposalCard key={proposal.id} proposal={proposal} className="bg-white hover:shadow-md transition-shadow duration-300 border-[var(--color-border-primary)] rounded-xl" />
            ))}
          </div>
        </motion.div>

        {/* Row 3 */}
        {/* Bento: Activity Feed */}
        <motion.div variants={itemVariants} className="md:col-span-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-[24px] shadow-sm overflow-hidden flex flex-col h-[350px]">
          <div className="p-6 border-b border-[var(--color-border-primary)] flex items-center justify-between bg-white shrink-0">
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[var(--color-text-tertiary)]" /> Shielded Activity Log
            </h3>
          </div>
          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar bg-[var(--color-bg-primary)]/30">
            <ActivityFeed events={activityEvents} maxItems={10} />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

// Ensure lucide icon import is present
import { FileText } from "lucide-react";
