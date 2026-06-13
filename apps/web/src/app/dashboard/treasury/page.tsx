"use client";

import { motion } from "framer-motion";
import { useMetrics } from "@/hooks/useApi";
import { TreasuryPanel } from "@/components/ui/treasury-panel";
import { ExecutionStatusCard } from "@/components/ui/execution-status-card";
import { MetricCard } from "@/components/ui/metric-card";
import { Wallet, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";

export default function TreasuryPage() {
  const { data: metrics, isLoading } = useMetrics();

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading treasury...</div>;
  }

  // Fallback for UI while no endpoint exists
  const m = metrics || {
    proofs_generated: 0,
    avg_proof_latency_ms: 0,
    total_multisigs: 0,
    active_proposals: 0,
    nullifiers_consumed: 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Treasury</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Shielded treasury assets and execution history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Value" value={`$${(100000000 / 1_000_000).toFixed(1)}M`} icon="wallet" trend={3.7} />
        <MetricCard title="Inflows (30d)" value="$2.1M" icon="zap" />
        <MetricCard title="Outflows (30d)" value="$890K" icon="hash" />
        <MetricCard title="Executions" value="0" icon="layers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TreasuryPanel assets={[]} />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Recent Executions</h3>
          <div className="bg-white rounded-2xl border border-[var(--color-border-primary)] p-16 text-center shadow-sm">
            <p className="text-[14px] font-medium text-[var(--color-text-tertiary)]">No recent executions found</p>
          </div>
        </div>
      </div>
    </div>
  );
}
