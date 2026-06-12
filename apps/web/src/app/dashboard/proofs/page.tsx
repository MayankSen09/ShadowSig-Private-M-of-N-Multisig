"use client";

import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { ProofCard } from "@/components/ui/proof-card";
import { ProofLatencyChart } from "@/components/ui/proof-latency-chart";
import { MetricCard } from "@/components/ui/metric-card";
import { mockProofLatency } from "@/lib/mock-data";
import { Shield, Clock, Cpu, Database } from "lucide-react";

export default function ProofsPage() {
  const { proofs, metrics } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">zk Proofs</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Risc0 zkVM proof generation and verification</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Proofs" value={metrics.proofsGenerated} icon={Shield} delay={0} iconColor="text-cyan-400" iconBg="bg-cyan-400/10" />
        <MetricCard title="Avg Latency" value={`${(metrics.avgProofLatency / 1000).toFixed(1)}s`} icon={Clock} delay={0.05} iconColor="text-purple-400" iconBg="bg-purple-400/10" />
        <MetricCard title="Compute Used" value={`${(metrics.computeUnitsUsed / 1000).toFixed(0)}k`} icon={Cpu} delay={0.1} iconColor="text-emerald-400" iconBg="bg-emerald-400/10" />
        <MetricCard title="Cache Hit Rate" value="73.2%" icon={Database} delay={0.15} iconColor="text-cyan-400" iconBg="bg-cyan-400/10" />
      </div>

      {/* Chart */}
      <ProofLatencyChart data={mockProofLatency} />

      {/* Proof Cards */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Recent Proofs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proofs.map((proof, i) => (
            <motion.div key={proof.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <ProofCard proof={proof} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
