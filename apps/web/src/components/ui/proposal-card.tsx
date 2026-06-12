import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/types";
import { FileText, ChevronRight } from "lucide-react";
import { ThresholdRing } from "./threshold-ring";

interface ProposalCardProps {
  proposal: Proposal;
  className?: string;
}

const statusColors = {
  pending: "text-[var(--color-system-orange)]",
  executed: "text-[var(--color-system-green)]",
  rejected: "text-[var(--color-system-red)]",
};

export function ProposalCard({ proposal, className }: ProposalCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm hover:shadow-[var(--shadow-card)] transition-all duration-200 cursor-pointer",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", proposal.status === 'pending' ? 'bg-[var(--color-system-orange)]' : proposal.status === 'executed' ? 'bg-[var(--color-system-green)]' : 'bg-[var(--color-system-red)]')} />
          <span className={cn("text-[11px] font-semibold uppercase tracking-wide", statusColors[proposal.status])}>
            {proposal.status}
          </span>
          <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
            {proposal.id}
          </span>
        </div>

        <h4 className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1 truncate">
          {proposal.title}
        </h4>
        <p className="text-[13px] text-[var(--color-text-secondary)] line-clamp-1 mb-3">
          {proposal.description}
        </p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
            <span className="text-[11px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              {(proposal.type || "Unknown").replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-[var(--color-border-primary)] pt-4 sm:pt-0">
        <div className="shrink-0">
          <ThresholdRing
            current={proposal.currentApprovals}
            required={proposal.requiredApprovals}
            size={44}
            strokeWidth={3.5}
            showLabel={false}
          />
        </div>
        
        <div className="flex items-center gap-1 text-[12px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
          Details
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
