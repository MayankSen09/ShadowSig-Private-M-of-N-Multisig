"use client";

import { useDashboardStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Shield, ArrowUpRight, Copy, Activity } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { ProposalCard } from "@/components/ui/proposal-card";
import { ThresholdRing } from "@/components/ui/threshold-ring";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { TreasuryPanel } from "@/components/ui/treasury-panel";
import { ProofLatencyChart } from "@/components/ui/proof-latency-chart";

export default function DashboardOverview() {
  const { proposals, treasuryAssets, proofLatencyHistory, activityEvents } = useDashboardStore();

  const activeProposals = proposals.filter((p) => p.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--color-border-primary)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-[var(--color-text-primary)]">Dashboard</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)]">Privacy-preserving multisig operations overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-sm">
            <Shield className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <span className="text-[12px] font-medium text-[var(--color-accent)]">Verifier Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[var(--color-system-green)]" />
            <span className="text-[12px] font-medium text-[var(--color-system-green)]">LEZ Mainnet</span>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Multisigs" value="12" icon="layers" trend={8.2} />
        <MetricCard title="Active Proposals" value={activeProposals.toString()} icon="file" trend={12.5} />
        <MetricCard title="Proofs Generated" value="1.8K" icon="shield" trend={23.1} />
        <MetricCard title="Avg Proof Latency" value="2.3s" icon="clock" trend={-5.3} />
        <MetricCard title="Treasury Value" value={formatCurrency(14500000)} icon="wallet" trend={3.7} />
        <MetricCard title="Executions" value="342" icon="zap" />
        <MetricCard title="Nullifiers Used" value="3.3K" icon="hash" />
        <MetricCard title="Compute Units" value="892k" icon="cpu" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quorum States */}
          <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-primary)] p-5 shadow-sm">
            <h3 className="text-[15px] font-semibold mb-5">Multisig Quorum States</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ThresholdRing label="Protocol Treasury" current={3} required={5} size={80} />
              <ThresholdRing label="Grants Committee" current={4} required={7} size={80} />
              <ThresholdRing label="Security Council" current={5} required={9} size={80} />
              <ThresholdRing label="R&D Fund" current={2} required={3} size={80} />
            </div>
          </div>

          {/* Active Proposals */}
          <div>
            <h3 className="text-[15px] font-semibold mb-4">Active Proposals</h3>
            <div className="space-y-3">
              {proposals.slice(0, 3).map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          </div>

          {/* Proof Latency Chart */}
          <ProofLatencyChart data={proofLatencyHistory} />
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6">
          <TreasuryPanel assets={treasuryAssets} />
          <ActivityFeed events={activityEvents} maxItems={8} />
        </div>
      </div>
    </div>
  );
}
