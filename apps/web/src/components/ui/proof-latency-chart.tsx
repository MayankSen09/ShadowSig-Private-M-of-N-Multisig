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
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] p-3 rounded-lg shadow-sm text-[12px]">
      <p className="text-[var(--color-text-secondary)] mb-0.5 font-medium">Latency</p>
      <p className="font-semibold text-[var(--color-text-primary)]">
        {(payload[0].value / 1000).toFixed(2)}s
      </p>
      {payload[1] && (
        <>
          <p className="text-[var(--color-text-secondary)] mb-0.5 mt-2 font-medium">Compute</p>
          <p className="font-semibold text-[var(--color-text-primary)]">
            {(payload[1].value / 1000).toFixed(1)}k CU
          </p>
        </>
      )}
    </div>
  );
}

export function ProofLatencyChart({ data, className }: ProofLatencyChartProps) {
  const formattedData = (data || []).map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  }));

  return (
    <div className={cn("p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm", className)}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[15px] font-semibold">Proof Latency</h3>
          <p className="text-[12px] text-[var(--color-text-secondary)]">Last 24 hours</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#007AFF]" />
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Latency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">Compute</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formattedData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#007AFF" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="computeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34C759" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(0,0,0,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: "#86868B" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#86868B" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="latencyMs"
            stroke="#007AFF"
            strokeWidth={2}
            fill="url(#latencyGradient)"
          />
          <Area
            type="monotone"
            dataKey="computeUnits"
            stroke="#34C759"
            strokeWidth={1.5}
            fill="url(#computeGradient)"
            yAxisId={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
