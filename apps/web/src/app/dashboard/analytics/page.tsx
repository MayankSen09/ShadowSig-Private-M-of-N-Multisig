"use client";

import { motion } from "framer-motion";
import { mockProofLatency } from "@/lib/mock-data";
import { MetricCard } from "@/components/ui/metric-card";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { Shield, Cpu, Zap, Activity } from "lucide-react";

const proposalsByType = [
  { name: "Transfer", value: 45, color: "#06b6d4" },
  { name: "Config", value: 20, color: "#a855f7" },
  { name: "Member", value: 15, color: "#10b981" },
  { name: "Custom", value: 20, color: "#f59e0b" },
];

const weeklyActivity = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  proofs: Math.floor(20 + Math.random() * 60),
  proposals: Math.floor(5 + Math.random() * 15),
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
      <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-lg shadow-xl text-[10px] font-mono">
        <p className="text-zinc-500 mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color || p.fill }} className="font-bold">
            {p.name.toUpperCase()}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">System performance and governance metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Proofs / Day" value="76" icon={Shield} change={14.2} delay={0} iconColor="text-cyan-400" />
        <MetricCard title="Avg Throughput" value="2.4 tx/s" icon={Zap} change={8.1} delay={0.05} iconColor="text-purple-400" />
        <MetricCard title="Uptime" value="99.97%" icon={Activity} delay={0.1} iconColor="text-emerald-400" />
        <MetricCard title="Compute Efficiency" value="92.3%" icon={Cpu} change={3.2} delay={0.15} iconColor="text-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
              <Bar dataKey="proofs" name="Proofs Generated" fill="#06b6d4" radius={[3, 3, 0, 0]} opacity={0.85} />
              <Bar dataKey="proposals" name="Proposals Submitted" fill="#a855f7" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Proposal Distribution */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Proposal Distribution</h3>
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={proposalsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4} strokeWidth={0}>
                  {proposalsByType.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4">
              {proposalsByType.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">{p.name} ({p.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Proof Latency Timeline */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md">
        <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Proof Generation Timeline (24h)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mockProofLatency.map((d) => ({ ...d, time: new Date(d.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) }))}>
            <defs>
              <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="latencyMs" name="Proving Latency" stroke="#06b6d4" strokeWidth={1.5} fill="url(#analyticsGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
