"use client";

import { cn } from "@/lib/utils";
import type { ProofLatencyDataPoint } from "@/lib/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ProofLatencyChartProps {
  data: ProofLatencyDataPoint[];
  className?: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }> }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl text-[10px] font-mono">
      <p className="text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Proof Latency</p>
      <p className="font-bold text-cyan-400">
        {(payload[0].value / 1000).toFixed(2)}s
      </p>
      {payload[1] && (
        <>
          <p className="text-zinc-500 mb-1 mt-2 font-semibold uppercase tracking-wider">Compute Units</p>
          <p className="font-bold text-purple-400">
            {(payload[1].value / 1000).toFixed(1)}k
          </p>
        </>
      )}
    </div>
  );
}

export function ProofLatencyChart({ data, className }: ProofLatencyChartProps) {
  const formattedData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));

  return (
    <div className={cn("glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Proof Latency
          </h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
            Last 24 hours
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
              Latency
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
              Compute
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.02)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--color-text-tertiary)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="latencyMs"
            stroke="#06b6d4"
            strokeWidth={1.5}
            fill="url(#latencyGradient)"
          />
          <Area
            type="monotone"
            dataKey="computeUnits"
            stroke="#a855f7"
            strokeWidth={1.2}
            fill="url(#computeGradient)"
            yAxisId={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
