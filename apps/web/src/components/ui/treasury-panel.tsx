"use client";

import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { TreasuryAsset } from "@/lib/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TreasuryPanelProps {
  assets: TreasuryAsset[];
  totalValue?: number;
  className?: string;
}

export function TreasuryPanel({ assets, totalValue, className }: TreasuryPanelProps) {
  const total = totalValue || assets.reduce((sum, a) => sum + a.value, 0);

  return (
    <div className={cn("p-4 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)]", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium">Treasury</h3>
        <div className="text-right">
          <p className="text-sm font-semibold font-mono tracking-tight">
            {formatCurrency(total)}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Total Value
          </p>
        </div>
      </div>

      <div className="space-y-1">
        {assets.map((asset, index) => {
          const isPositive = asset.change24h > 0;
          const isNeutral = Math.abs(asset.change24h) < 0.05;

          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center justify-between py-2.5 px-2 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] flex items-center justify-center">
                  <span className="text-[9px] font-semibold font-mono text-[var(--color-text-secondary)]">
                    {asset.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-medium">{asset.symbol}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{asset.name}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[12px] font-mono font-medium">
                  {formatCurrency(asset.value)}
                </p>
                <div className="flex items-center justify-end gap-0.5">
                  {isNeutral ? (
                    <Minus className="h-2.5 w-2.5 text-[var(--color-text-muted)]" />
                  ) : isPositive ? (
                    <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5 text-red-400" />
                  )}
                  <span
                    className={cn(
                      "text-[10px] font-mono",
                      isNeutral
                        ? "text-[var(--color-text-muted)]"
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
