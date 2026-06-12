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
    <div className={cn("p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold">Treasury</h3>
        <div className="text-right">
          <p className="text-[17px] font-semibold tracking-tight">
            {formatCurrency(total)}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wide font-medium mt-0.5">
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
              className="flex items-center justify-between py-2 px-2.5 -mx-2.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[var(--color-border-secondary)] shadow-sm flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">
                    {asset.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-text-primary)]">{asset.symbol}</p>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">{asset.name}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[14px] font-medium">
                  {formatCurrency(asset.value)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  {isNeutral ? (
                    <Minus className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                  ) : isPositive ? (
                    <TrendingUp className="h-3 w-3 text-[var(--color-system-green)]" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-[var(--color-system-red)]" />
                  )}
                  <span
                    className={cn(
                      "text-[12px] font-medium",
                      isNeutral
                        ? "text-[var(--color-text-tertiary)]"
                        : isPositive
                        ? "text-[var(--color-system-green)]"
                        : "text-[var(--color-system-red)]"
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
