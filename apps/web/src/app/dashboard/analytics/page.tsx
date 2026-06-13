"use client";

import { motion } from "framer-motion";
import { useMetrics } from "@/hooks/useApi";
import { MetricCard } from "@/components/ui/metric-card";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const proposalsByType = [
  { name: "Transfer", value: 45, color: "#007AFF" },
  { name: "Config", value: 20, color: "#5856D6" },
  { name: "Member", value: 15, color: "#34C759" },
  { name: "Custom", value: 20, color: "#FF9500" },
];

const weeklyActivity = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  proofs: Math.floor(20 + Math.random() * 60),
  proposals: Math.floor(5 + Math.random() * 15),
}));

const mockProofLatency = Array.from({ length: 24 }, (_, i) => ({
  timestamp: Date.now() - (24 - i) * 3600000,
  latencyMs: 1200 + Math.random() * 800,
}));

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: string | number;
    color?: string;
    fill?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] px-3 py-2 rounded-lg shadow-sm text-[12px]">
        <p className="text-[var(--color-text-secondary)] mb-1 font-medium">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color || p.fill }} className="font-semibold">
            {p.name.toUpperCase()}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: metrics, isLoading } = useMetrics();

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading analytics...</div>;
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
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">System performance and governance metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Proofs Generated" value={m.proofs_generated.toString()} icon="shield" />
        <MetricCard title="Avg Latency" value={`${(m.avg_proof_latency_ms / 1000).toFixed(1)}s`} icon="zap" />
        <MetricCard title="Total Multisigs" value={m.total_multisigs.toString()} icon="users" />
        <MetricCard title="Active Proposals" value={m.active_proposals.toString()} icon="cpu" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm">
          <h3 className="text-[15px] font-semibold mb-5 text-[var(--color-text-primary)]">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="proofs" name="Proofs Generated" fill="#007AFF" radius={[4, 4, 0, 0]} opacity={0.9} />
              <Bar dataKey="proposals" name="Proposals Submitted" fill="#5856D6" radius={[4, 4, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Proposal Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm flex flex-col">
          <h3 className="text-[15px] font-semibold mb-2 text-[var(--color-text-primary)]">Proposal Distribution</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={proposalsByType} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {proposalsByType.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-2">
              {proposalsByType.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[12px] text-[var(--color-text-secondary)] font-medium">{p.name} ({p.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Proof Latency Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm">
        <h3 className="text-[15px] font-semibold mb-5 text-[var(--color-text-primary)]">Proof Generation Timeline (24h)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={mockProofLatency.map((d) => ({ ...d, time: new Date(d.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) }))}>
            <defs>
              <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#007AFF" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="latencyMs" name="Proving Latency" stroke="#007AFF" strokeWidth={2} fill="url(#analyticsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
