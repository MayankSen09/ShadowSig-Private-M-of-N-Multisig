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
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">Privacy-preserving multisig operations overview</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-accent-subtle)] border border-[var(--color-accent-muted)] text-[11px] font-medium text-[var(--color-accent-hover)]">
            <Shield className="h-3 w-3" />
            Verifier Active
          </div>
          <div className="network-status">
            <span className="dot" />
            LEZ Mainnet
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Total Multisigs" value={metrics.totalMultisigs} icon={Layers} change={8.2} delay={0} />
        <MetricCard title="Active Proposals" value={metrics.activeProposals} icon={FileText} change={12.5} delay={0.03} />
        <MetricCard title="Proofs Generated" value={metrics.proofsGenerated} icon={Shield} change={23.1} delay={0.06} />
        <MetricCard title="Avg Proof Latency" value={`${(metrics.avgProofLatency / 1000).toFixed(1)}s`} icon={Clock} change={-5.3} delay={0.09} />
      </div>

      {/* Second metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Treasury Value" value={`$${(metrics.treasuryValue / 1_000_000).toFixed(1)}M`} icon={Wallet} change={3.7} delay={0.12} />
        <MetricCard title="Executions" value={metrics.executionsCompleted} icon={Zap} delay={0.15} />
        <MetricCard title="Nullifiers Used" value={metrics.nullifiersConsumed} icon={Hash} delay={0.18} />
        <MetricCard title="Compute Units" value={`${(metrics.computeUnitsUsed / 1000).toFixed(0)}k`} icon={Cpu} delay={0.21} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Proposals + Chart */}
        <div className="lg:col-span-2 space-y-5">
          {/* Multisig Health */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)]"
          >
            <h3 className="text-[13px] font-medium mb-3">Multisig Quorum States</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {multisigs.map((ms) => (
                <div
                  key={ms.id}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]"
                >
                  <ThresholdRing current={ms.threshold} threshold={ms.memberCount} size={40} strokeWidth={2.5} />
                  <p className="text-[12px] font-medium text-center truncate w-full px-2 mt-0.5">{ms.name}</p>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-mono">{ms.threshold}-of-{ms.memberCount}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Proposals */}
          <div>
            <h3 className="text-[13px] font-medium mb-2.5">Active Proposals</h3>
            <div className="space-y-2">
              {activeProposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>

          {/* Chart */}
          <ProofLatencyChart data={mockProofLatency} />
        </div>

        {/* Right: Treasury + Activity */}
        <div className="space-y-5">
          <TreasuryPanel assets={treasuryAssets} />
          <ActivityFeed events={activity} />
        </div>
      </div>
    </div>
  );
}
