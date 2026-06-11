"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Execution } from "@/lib/types";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface ExecutionStatusCardProps {
  execution: Execution;
  className?: string;
}

const statusConfig = {
  pending: {
    color: "text-zinc-500",
    dot: "bg-zinc-500",
    label: "Pending Execution",
    step: 0,
  },
  executing: {
    color: "text-cyan-400",
    dot: "bg-cyan-500",
    label: "Executing",
    step: 1,
  },
  completed: {
    color: "text-emerald-400",
    dot: "bg-emerald-500",
    label: "Completed",
    step: 2,
  },
  failed: {
    color: "text-red-400",
    dot: "bg-red-500",
    label: "Failed",
    step: -1,
  },
};

const steps = ["Submit", "Execute", "Confirm"];

export function ExecutionStatusCard({
  execution,
  className,
}: ExecutionStatusCardProps) {
  const config = statusConfig[execution.status] || statusConfig.failed;
  const activeStep = config.step;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-950/40 border border-white/5 flex items-center justify-center shadow-inner">
            {execution.status === "executing" ? (
              <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            ) : execution.status === "completed" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : execution.status === "failed" ? (
              <XCircle className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-zinc-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                config.dot,
                execution.status === "executing" && "animate-pulse"
              )} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono block mt-0.5">
              {execution.id}
            </span>
          </div>
        </div>
      </div>

      {/* Step Progress indicators */}
      <div className="space-y-2 mb-4 bg-zinc-950/20 p-2.5 rounded-lg border border-white/[0.02]">
        <div className="flex items-center gap-1.5">
          {steps.map((step, index) => {
            const isCompleted = index <= activeStep;
            return (
              <div
                key={step}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  isCompleted ? "bg-cyan-500" : "bg-white/5"
                )}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-semibold">
          {steps.map((step, index) => {
            const isActive = index <= activeStep;
            return (
              <span
                key={step}
                className={isActive ? "text-cyan-400" : "text-[var(--color-text-tertiary)]"}
              >
                {step}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tx Hash */}
      {execution.txHash && (
        <div className="pt-2.5 border-t border-white/[0.03] flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-4">
            <span className="text-[9px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold block mb-0.5">
              Transaction Hash
            </span>
            <span className="text-[10px] font-mono text-[var(--color-text-secondary)] block truncate bg-zinc-950/40 px-2 py-1 rounded border border-white/[0.01]">
              {execution.txHash}
            </span>
          </div>
          <a
            href={`https://explorer.logos.execution.zone/tx/${execution.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-cyan-400 transition-colors shadow-inner shrink-0"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
