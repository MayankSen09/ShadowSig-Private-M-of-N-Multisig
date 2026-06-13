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
    color: "text-[var(--color-text-secondary)]",
    dot: "bg-gray-400",
    label: "Pending Execution",
    step: 0,
    iconColor: "text-gray-500",
    iconBg: "bg-gray-100",
  },
  executing: {
    color: "text-[var(--color-accent)]",
    dot: "bg-[var(--color-accent)]",
    label: "Executing",
    step: 1,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  completed: {
    color: "text-[var(--color-system-green)]",
    dot: "bg-[var(--color-system-green)]",
    label: "Completed",
    step: 2,
    iconColor: "text-green-600",
    iconBg: "bg-green-50",
  },
  failed: {
    color: "text-[var(--color-system-red)]",
    dot: "bg-[var(--color-system-red)]",
    label: "Failed",
    step: -1,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
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
        "bg-white rounded-[16px] p-5 border border-[var(--color-border-primary)] shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shadow-sm border border-[var(--color-border-primary)]", config.iconBg)}>
            {execution.status === "executing" ? (
              <Loader2 className={cn("h-4 w-4 animate-spin", config.iconColor)} />
            ) : execution.status === "completed" ? (
              <CheckCircle2 className={cn("h-4 w-4", config.iconColor)} />
            ) : execution.status === "failed" ? (
              <XCircle className={cn("h-4 w-4", config.iconColor)} />
            ) : (
              <Clock className={cn("h-4 w-4", config.iconColor)} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                config.dot,
                execution.status === "executing" && "animate-pulse"
              )} />
              <span className={cn("text-[11px] font-bold uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            </div>
            <span className="text-[12px] font-medium text-[var(--color-text-tertiary)] block mt-0.5">
              {execution.id}
            </span>
          </div>
        </div>
      </div>

      {/* Step Progress indicators */}
      <div className="space-y-2.5 mb-5 bg-[var(--color-bg-primary)] p-3 rounded-xl border border-[var(--color-border-primary)] shadow-inner">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isCompleted = index <= activeStep;
            return (
              <div
                key={step}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-all duration-500",
                  isCompleted ? "bg-[var(--color-accent)]" : "bg-gray-200"
                )}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-bold px-1">
          {steps.map((step, index) => {
            const isActive = index <= activeStep;
            return (
              <span
                key={step}
                className={isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"}
              >
                {step}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tx Hash */}
      {execution.txHash && (
        <div className="pt-4 border-t border-[var(--color-border-primary)] flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider font-bold block mb-1">
              Transaction Hash
            </span>
            <span className="text-[12px] font-mono text-[var(--color-text-secondary)] block truncate bg-[var(--color-bg-primary)] px-2.5 py-1.5 rounded-lg border border-[var(--color-border-primary)]">
              {execution.txHash}
            </span>
          </div>
          <a
            href={`https://explorer.logos.execution.zone/tx/${execution.txHash}`}
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-white border border-[var(--color-border-primary)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:shadow-sm transition-all shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
