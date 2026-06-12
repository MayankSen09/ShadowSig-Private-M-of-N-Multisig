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
    <div className="bg-[var(--color-bg-primary)] border border-[var(--color-border-secondary)] p-2.5 rounded-lg shadow-xl text-[10px] font-mono">
      <p className="text-[var(--color-text-muted)] mb-0.5 font-medium uppercase tracking-wider">Latency</p>
      <p className="font-semibold text-[var(--color-text-primary)]">
        {(payload[0].value / 1000).toFixed(2)}s
      </p>
      {payload[1] && (
        <>
          <p className="text-[var(--color-text-muted)] mb-0.5 mt-1.5 font-medium uppercase tracking-wider">Compute</p>
          <p className="font-semibold text-[var(--color-text-primary)]">
            {(payload[1].value / 1000).toFixed(1)}k CU
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
    <div className={cn("p-4 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)]", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-medium">Proof Latency</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">Last 24 hours</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
            <span className="text-[10px] text-[var(--color-text-muted)]">Latency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-[var(--color-text-muted)]">Compute</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.03)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: "#3e3e41" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#3e3e41" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="latencyMs"
            stroke="#6366f1"
            strokeWidth={1.5}
            fill="url(#latencyGradient)"
          />
          <Area
            type="monotone"
            dataKey="computeUnits"
            stroke="#34d399"
            strokeWidth={1}
            fill="url(#computeGradient)"
            yAxisId={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
