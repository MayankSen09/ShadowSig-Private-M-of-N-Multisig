import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus, Layers, FileText,
  Shield, Clock, Wallet, Zap, Hash, Cpu
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: "layers" | "file" | "shield" | "clock" | "wallet" | "zap" | "hash" | "cpu";
  className?: string;
}

const iconMap = {
  layers: Layers,
  file: FileText,
  shield: Shield,
  clock: Clock,
  wallet: Wallet,
  zap: Zap,
  hash: Hash,
  cpu: Cpu,
};

export function MetricCard({ title, value, trend, icon, className }: MetricCardProps) {
  const Icon = iconMap[icon];
  const isPositive = trend && trend > 0;
  const isNeutral = trend === 0 || trend === undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm hover:shadow-[var(--shadow-card)] transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
          {title}
        </h3>
        <Icon className="h-4 w-4 text-[var(--color-text-tertiary)]" />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {value}
        </span>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-3.5 w-3.5 text-[var(--color-system-green)]" />
          ) : isNeutral ? (
            <Minus className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-[var(--color-system-red)]" />
          )}
          <span
            className={cn(
              "text-[12px] font-medium",
              isPositive ? "text-[var(--color-system-green)]" : isNeutral ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-system-red)]"
            )}
          >
            {isPositive ? "+" : ""}
            {trend}%
          </span>
          <span className="text-[12px] text-[var(--color-text-tertiary)] ml-1">vs last period</span>
        </div>
      )}
    </motion.div>
  );
}
