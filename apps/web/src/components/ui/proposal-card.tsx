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
    color: "text-amber-400",
    dot: "bg-amber-400",
    label: "Pending",
  },
  approved: {
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "Approved",
  },
  rejected: {
    color: "text-red-400",
    dot: "bg-red-400",
    label: "Rejected",
  },
  executed: {
    color: "text-[var(--color-accent-hover)]",
    dot: "bg-[var(--color-accent)]",
    label: "Executed",
  },
  expired: {
    color: "text-[var(--color-text-muted)]",
    dot: "bg-[var(--color-text-muted)]",
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] cursor-pointer hover:border-[var(--color-border-secondary)] transition-colors",
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
              <span className={cn("text-[10px] font-medium uppercase tracking-wider", config.color)}>
                {config.label}
              </span>
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)] font-mono">
              {proposal.id}
            </span>
          </div>
          <h3 className="text-[13px] font-medium truncate">
            {proposal.title}
          </h3>
          <p className="text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {proposal.description}
          </p>
        </div>
        <ThresholdRing
          current={proposal.approvalCount}
          threshold={proposal.threshold}
          size={36}
          strokeWidth={2.5}
        />
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-border-primary)]">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3 w-3 text-[var(--color-text-muted)]" />
          <span className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
            {actionTypeLabels[proposal.actionType] || proposal.actionType}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
          <span className="font-medium uppercase tracking-wider">Details</span>
          <ArrowUpRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  );
}
