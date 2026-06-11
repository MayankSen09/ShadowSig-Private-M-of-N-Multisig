"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { TreasuryAsset } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus, Wallet } from "lucide-react";

interface TreasuryPanelProps {
  assets: TreasuryAsset[];
  totalValue?: number;
  className?: string;
}

export function TreasuryPanel({ assets, totalValue, className }: TreasuryPanelProps) {
  const total = totalValue || assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className={cn("glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md", className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner">
            <Wallet className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Treasury
            </h3>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
              Shielded assets
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-bold font-mono text-[var(--color-text-primary)] tracking-tight">
            {formatCurrency(total)}
          </p>
          <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
            Total Value
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {assets.map((asset, index) => {
          const isPositive = asset.change24h > 0;
          const isNeutral = Math.abs(asset.change24h) < 0.05;

          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between py-2 px-2.5 rounded-lg bg-zinc-950/20 border border-white/[0.02] hover:bg-zinc-900/50 hover:border-white/5 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center shadow-inner">
                  <span className="text-[9px] font-bold font-mono text-zinc-400">
                    {asset.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    {asset.symbol}
                  </p>
                  <p className="text-[9px] text-[var(--color-text-tertiary)]">
                    {asset.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-mono font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(asset.value)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  {isNeutral ? (
                    <Minus className="h-2.5 w-2.5 text-[var(--color-text-tertiary)]" />
                  ) : isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 text-red-400" />
                  )}
                  <span
                    className={cn(
                      "text-[9px] font-mono",
                      isNeutral
                        ? "text-[var(--color-text-tertiary)]"
                        : isPositive
                        ? "text-emerald-400"
                        : "text-red-400"
                    )}
                  >
                    {isPositive ? "+" : ""}
                    {asset.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
