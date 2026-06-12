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
  className,
  suffix,
  delay = 0,
}: MetricCardProps) {
  const formattedValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "p-4 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] flex flex-col justify-between min-h-[110px]",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wide">
            {title}
          </span>
          <Icon className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        </div>
        <p className="text-xl font-semibold font-mono tracking-tight">
          {formattedValue}
          {suffix && (
            <span className="text-xs font-normal text-[var(--color-text-tertiary)] ml-1">
              {suffix}
            </span>
          )}
        </p>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[var(--color-border-primary)]">
          <div
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-medium",
              change >= 0
                ? "text-emerald-400"
                : "text-red-400"
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
