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
    color: "text-emerald-400",
    dot: "bg-emerald-500",
    label: "Verified",
  },
  generating: {
    icon: Loader2,
    color: "text-cyan-400",
    dot: "bg-cyan-500",
    label: "Generating",
  },
  failed: {
    icon: XCircle,
    color: "text-red-400",
    dot: "bg-red-500",
    label: "Failed",
  },
  cached: {
    icon: Database,
    color: "text-purple-400",
    dot: "bg-purple-500",
    label: "Cached",
  },
};

export function ProofCard({ proof, className }: ProofCardProps) {
  const config = statusConfig[proof.status] || statusConfig.failed;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-5 relative overflow-hidden bg-zinc-900/30 border border-white/5 shadow-md hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300",
        className
      )}
    >
      {/* Top Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-950/40 border border-white/5 flex items-center justify-center shadow-inner">
            <Shield className={cn("h-3.5 w-3.5", config.color)} />
          </div>
          <div>
            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono block">
              {proof.id}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                config.dot,
                proof.status === "generating" && "animate-pulse"
              )} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {proof.status === "generating" && (
          <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
        )}
      </div>

      {/* Grid for Latency and Compute */}
      <div className="grid grid-cols-2 gap-4 bg-zinc-950/20 p-2.5 rounded-lg border border-white/[0.02] mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] shrink-0" />
          <div>
            <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
              Latency
            </p>
            <p className="text-xs font-mono text-[var(--color-text-primary)] font-medium">
              {proof.latencyMs > 0
                ? `${(proof.latencyMs / 1000).toFixed(2)}s`
                : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cpu className="h-3.5 w-3.5 text-[var(--color-text-tertiary)] shrink-0" />
          <div>
            <p className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold">
              Compute
            </p>
            <p className="text-xs font-mono text-[var(--color-text-primary)] font-medium">
              {proof.computeUnits > 0
                ? `${(proof.computeUnits / 1000).toFixed(1)}k`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Program field */}
      <div className="pt-2.5 border-t border-white/[0.03]">
        <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold block mb-1">
          Verifier Program
        </span>
        <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block truncate bg-zinc-950/40 px-2 py-1 rounded border border-white/[0.01]">
          {proof.verifierProgram}
        </span>
      </div>
    </motion.div>
  );
}
