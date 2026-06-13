"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ZkProof } from "@/lib/types";
import {
  Shield,
  Clock,
  Cpu,
  CheckCircle2,
  Loader2,
  XCircle,
  Database,
} from "lucide-react";

interface ProofCardProps {
  proof: ZkProof;
  className?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    color: "text-[var(--color-system-green)]",
    dot: "bg-[var(--color-system-green)]",
    label: "Verified",
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
  generating: {
    icon: Loader2,
    color: "text-[var(--color-accent)]",
    dot: "bg-[var(--color-accent)]",
    label: "Generating",
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  failed: {
    icon: XCircle,
    color: "text-[var(--color-system-red)]",
    dot: "bg-[var(--color-system-red)]",
    label: "Failed",
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  cached: {
    icon: Database,
    color: "text-purple-600",
    dot: "bg-purple-500",
    label: "Cached",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50",
  },
};

export function ProofCard({ proof, className }: ProofCardProps) {
  const config = statusConfig[proof.status] || statusConfig.failed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-[16px] p-5 border border-[var(--color-border-primary)] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden",
        className
      )}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-[var(--color-border-primary)]", config.iconBg)}>
            <Shield className={cn("h-4 w-4", config.iconColor)} />
          </div>
          <div>
            <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono font-medium block">
              {proof.id}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                config.dot,
                proof.status === "generating" && "animate-pulse"
              )} />
              <span className={cn("text-[11px] font-bold uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {proof.status === "generating" && (
          <Loader2 className="h-4 w-4 text-[var(--color-accent)] animate-spin" />
        )}
      </div>

      {/* Grid for Latency and Compute */}
      <div className="grid grid-cols-2 gap-4 bg-[var(--color-bg-primary)] p-3 rounded-xl border border-[var(--color-border-primary)] shadow-inner mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="h-4 w-4 text-[var(--color-text-tertiary)] shrink-0" />
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-bold">
              Latency
            </p>
            <p className="text-[13px] font-mono text-[var(--color-text-primary)] font-semibold mt-0.5">
              {proof.latencyMs > 0
                ? `${(proof.latencyMs / 1000).toFixed(2)}s`
                : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Cpu className="h-4 w-4 text-[var(--color-text-tertiary)] shrink-0" />
          <div>
            <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-bold">
              Compute
            </p>
            <p className="text-[13px] font-mono text-[var(--color-text-primary)] font-semibold mt-0.5">
              {proof.computeUnits > 0
                ? `${(proof.computeUnits / 1000).toFixed(1)}k`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Program field */}
      <div className="pt-3.5 border-t border-[var(--color-border-primary)]">
        <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-bold block mb-1.5">
          Verifier Program
        </span>
        <span className="text-[11px] font-mono text-[var(--color-text-secondary)] font-medium block truncate bg-[var(--color-bg-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border-primary)]">
          {proof.verifierProgram}
        </span>
      </div>
    </motion.div>
  );
}
