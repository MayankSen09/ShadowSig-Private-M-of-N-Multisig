"use client";

import { motion } from "framer-motion";
import { cn, formatNumber } from "@/lib/utils";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  className?: string;
  suffix?: string;
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = "text-cyan-400",
  className,
  suffix,
  delay = 0,
}: MetricCardProps) {
  const formattedValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "glass-card p-5 group flex flex-col justify-between min-h-[120px]",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {title}
          </span>
          <div className="w-7 h-7 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-center shadow-inner group-hover:border-white/20 transition-all duration-300">
            <Icon className={cn("h-3.5 w-3.5 transition-colors", iconColor)} />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-[var(--color-text-primary)] tracking-tight">
          {formattedValue}
          {suffix && (
            <span className="text-xs font-normal text-[var(--color-text-tertiary)] ml-1">
              {suffix}
            </span>
          )}
        </p>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-white/[0.02]">
          <div
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium",
              change >= 0
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                : "bg-red-500/10 text-red-400 border border-red-500/10"
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-tertiary)]">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
