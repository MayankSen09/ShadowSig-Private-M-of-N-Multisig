"use client";

import { motion } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { TreasuryPanel } from "@/components/ui/treasury-panel";
import { ExecutionStatusCard } from "@/components/ui/execution-status-card";
import { mockExecutions } from "@/lib/mock-data";
import { MetricCard } from "@/components/ui/metric-card";
import { Wallet, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";

export default function TreasuryPage() {
  const { treasuryAssets, metrics } = useDashboardStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Treasury</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Shielded treasury assets and execution history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Value" value={`$${(metrics.treasuryValue / 1_000_000).toFixed(1)}M`} icon={Wallet} change={3.7} delay={0} iconColor="text-purple-400" iconBg="bg-purple-400/10" />
        <MetricCard title="Inflows (30d)" value="$2.1M" icon={ArrowDownRight} delay={0.05} iconColor="text-emerald-400" iconBg="bg-emerald-400/10" />
        <MetricCard title="Outflows (30d)" value="$890K" icon={ArrowUpRight} delay={0.1} iconColor="text-red-400" iconBg="bg-red-400/10" />
        <MetricCard title="Executions" value={metrics.executionsCompleted} icon={BarChart3} delay={0.15} iconColor="text-cyan-400" iconBg="bg-cyan-400/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TreasuryPanel assets={treasuryAssets} />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Recent Executions</h3>
          {mockExecutions.map((exec, i) => (
            <motion.div key={exec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <ExecutionStatusCard execution={exec} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
