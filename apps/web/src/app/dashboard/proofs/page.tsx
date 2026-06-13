"use client";

import { motion } from "framer-motion";
import { useMetrics } from "@/hooks/useApi";
import { MetricCard } from "@/components/ui/metric-card";
import { Shield, Clock, Cpu, Database } from "lucide-react";

export default function ProofsPage() {
  const { data: metrics, isLoading } = useMetrics();

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading proofs...</div>;
  }

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
        <h1 className="text-2xl font-bold tracking-tight">zk Proofs</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Risc0 zkVM proof generation and verification</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Proofs" value={m.proofs_generated.toString()} icon="shield" />
        <MetricCard title="Avg Latency" value={`${(m.avg_proof_latency_ms / 1000).toFixed(1)}s`} icon="clock" />
        <MetricCard title="Compute Used" value="120k" icon="cpu" />
        <MetricCard title="Cache Hit Rate" value="73.2%" icon="layers" />
      </div>

      {/* Empty State for Proofs */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Proofs</h3>
        <div className="bg-white rounded-2xl border border-[var(--color-border-primary)] p-16 text-center shadow-sm">
          <p className="text-[14px] font-medium text-[var(--color-text-tertiary)]">No recent proofs found</p>
        </div>
      </div>
    </div>
  );
}
