"use client";

import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { mockProofLatency } from "@/lib/mock-data";
import { MetricCard } from "@/components/ui/metric-card";
import { ProposalCard } from "@/components/ui/proposal-card";
import { ThresholdRing } from "@/components/ui/threshold-ring";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { TreasuryPanel } from "@/components/ui/treasury-panel";
import { ProofLatencyChart } from "@/components/ui/proof-latency-chart";
import {
  Layers, FileText, Shield, Clock, Wallet, Zap, Cpu, Hash,
} from "lucide-react";

export default function DashboardPage() {
  const { metrics, proposals, activity, treasuryAssets, multisigs } = useDashboardStore();
  const activeProposals = proposals.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
          >
            Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="text-sm text-[var(--color-text-secondary)] mt-1"
          >
            Privacy-preserving multisig operations overview
          </motion.p>
        </div>
        <div className="flex items-center gap-3">
          {/* On-chain verifier status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/5 border border-purple-500/15 text-[10px] font-semibold text-purple-300 uppercase tracking-wider"
          >
            <Shield className="h-3 w-3" />
            <span>Verifier: Active</span>
          </motion.div>
          {/* Network status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="network-status"
          >
            <span className="dot" />
            <span>LEZ Mainnet</span>
          </motion.div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Multisigs" value={metrics.totalMultisigs} icon={Layers} change={8.2} delay={0} iconColor="text-cyan-400" />
        <MetricCard title="Active Proposals" value={metrics.activeProposals} icon={FileText} change={12.5} delay={0.05} iconColor="text-purple-400" />
        <MetricCard title="Proofs Generated" value={metrics.proofsGenerated} icon={Shield} change={23.1} delay={0.1} iconColor="text-emerald-400" />
        <MetricCard title="Avg Proof Latency" value={`${(metrics.avgProofLatency / 1000).toFixed(1)}s`} icon={Clock} change={-5.3} delay={0.15} iconColor="text-cyan-400" />
      </div>

      {/* Second metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Treasury Value" value={`$${(metrics.treasuryValue / 1_000_000).toFixed(1)}M`} icon={Wallet} change={3.7} delay={0.2} iconColor="text-purple-400" />
        <MetricCard title="Executions" value={metrics.executionsCompleted} icon={Zap} delay={0.25} iconColor="text-emerald-400" />
        <MetricCard title="Nullifiers Consumed" value={metrics.nullifiersConsumed} icon={Hash} delay={0.3} iconColor="text-cyan-400" />
        <MetricCard title="Compute Units" value={`${(metrics.computeUnitsUsed / 1000).toFixed(0)}k`} icon={Cpu} delay={0.35} iconColor="text-purple-400" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Proposals + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multisig Health */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md"
          >
            <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Multisig Quorum States</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {multisigs.map((ms) => (
                <div
                  key={ms.id}
                  className="flex flex-col items-center gap-2 py-3 rounded-lg bg-zinc-950/20 border border-white/[0.01] shadow-inner"
                >
                  <ThresholdRing current={ms.threshold} threshold={ms.memberCount} size={44} strokeWidth={2.5} />
                  <p className="text-xs font-semibold text-center truncate w-full px-2 text-[var(--color-text-primary)] mt-1">{ms.name}</p>
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">{ms.threshold}-of-{ms.memberCount}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Proposals */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-[var(--color-text-primary)]">Active Proposals</h3>
            <div className="space-y-3">
              {activeProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>

          {/* Chart */}
          <ProofLatencyChart data={mockProofLatency} />
        </div>

        {/* Right: Treasury + Activity */}
        <div className="space-y-6">
          <TreasuryPanel assets={treasuryAssets} />
          <ActivityFeed events={activity} />
        </div>
      </div>
    </div>
  );
}
