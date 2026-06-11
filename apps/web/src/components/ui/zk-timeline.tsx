"use client";

import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";
import {
  Shield,
  Zap,
  FileCheck,
  UserPlus,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface ZkTimelineProps {
  events: ActivityEvent[];
  className?: string;
  maxItems?: number;
}

const eventIcons = {
  approval: Shield,
  proof: Zap,
  execution: ArrowUpRight,
  proposal: FileCheck,
  member: UserPlus,
};

const statusIcons = {
  success: CheckCircle2,
  pending: Clock,
  error: AlertCircle,
};

const statusColors = {
  success: "text-emerald-400 bg-emerald-950/20 border-emerald-500/20",
  pending: "text-cyan-400 bg-cyan-950/20 border-cyan-500/20",
  error: "text-red-400 bg-red-950/20 border-red-500/20",
};

const eventLineColors = {
  success: "bg-emerald-500/10",
  pending: "bg-cyan-500/10",
  error: "bg-red-500/10",
};

export function ZkTimeline({ events, className, maxItems = 8 }: ZkTimelineProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className={cn("relative", className)}>
      {displayEvents.map((event, index) => {
        const EventIcon = eventIcons[event.type] || Shield;
        const StatusIcon = statusIcons[event.status] || Clock;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            className="relative pl-8 pb-5 last:pb-0 group"
          >
            {/* Timeline line */}
            {index < displayEvents.length - 1 && (
              <div
                className={cn(
                  "absolute left-[10px] top-7 bottom-0 w-[1px]",
                  eventLineColors[event.status] || "bg-zinc-800"
                )}
              />
            )}

            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-0 top-0.5 w-[21px] h-[21px] rounded-full border flex items-center justify-center shadow-sm z-10",
                statusColors[event.status] || "text-zinc-400 bg-zinc-800 border-zinc-700"
              )}
            >
              <EventIcon className="h-2.5 w-2.5" />
            </div>

            {/* Content */}
            <div className="glass-card p-3.5 ml-1 bg-zinc-900/30 border border-white/5 shadow-md hover:bg-zinc-900/50 hover:border-white/10 transition-all duration-300 rounded-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <StatusIcon className={cn("h-3.5 w-3.5 shrink-0", statusColors[event.status].split(" ")[0])} />
                    <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                      {event.title}
                    </p>
                  </div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <span className="text-[9px] text-[var(--color-text-tertiary)] font-mono whitespace-nowrap shrink-0">
                  {formatDate(event.timestamp)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
