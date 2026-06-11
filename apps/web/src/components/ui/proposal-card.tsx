"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/types";
import { ThresholdRing } from "./threshold-ring";
import { ArrowUpRight, FileText } from "lucide-react";

interface ProposalCardProps {
  proposal: Proposal;
  className?: string;
  onClick?: () => void;
}

const statusConfig = {
  pending: {
    color: "text-cyan-400",
    dot: "bg-cyan-500",
    label: "Pending",
  },
  approved: {
    color: "text-emerald-400",
    dot: "bg-emerald-500",
    label: "Approved",
  },
  rejected: {
    color: "text-red-400",
    dot: "bg-red-500",
    label: "Rejected",
  },
  executed: {
    color: "text-purple-400",
    dot: "bg-purple-500",
    label: "Executed",
  },
  expired: {
    color: "text-zinc-500",
    dot: "bg-zinc-500",
    label: "Expired",
  },
};

const actionTypeLabels: Record<string, string> = {
  transfer: "Treasury Transfer",
  config_change: "Config Change",
  member_add: "Add Member",
  member_remove: "Remove Member",
  custom: "Custom Action",
};

export function ProposalCard({ proposal, className, onClick }: ProposalCardProps) {
  const config = statusConfig[proposal.status] || statusConfig.expired;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: "rgba(255,255,255,0.12)" }}
      onClick={onClick}
      className={cn(
        "glass-card p-5 cursor-pointer group relative overflow-hidden bg-zinc-900/30 border border-white/5 shadow-md hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300",
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex items-center gap-1.5 bg-zinc-950/40 px-2 py-0.5 rounded-full border border-white/[0.02]">
              <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono bg-zinc-800/40 px-1.5 py-0.5 rounded border border-white/[0.01]">
              {proposal.id}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-cyan-400 transition-colors truncate">
            {proposal.title}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
            {proposal.description}
          </p>
        </div>
        <div className="shrink-0 bg-zinc-950/40 p-1.5 rounded-full border border-white/[0.03] shadow-inner flex items-center justify-center">
          <ThresholdRing
            current={proposal.approvalCount}
            threshold={proposal.threshold}
            size={40}
            strokeWidth={3}
          />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-[var(--color-text-tertiary)]" />
          <span className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
            {actionTypeLabels[proposal.actionType] || proposal.actionType}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] group-hover:text-cyan-400 transition-colors">
          <span className="text-[10px] font-medium uppercase tracking-wider">Details</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}
