"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";
import {
  Shield,
  Zap,
  ArrowUpRight,
  FileCheck,
  UserPlus,
} from "lucide-react";

interface ActivityFeedProps {
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

const statusColors = {
  success: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
  pending: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
  error: "text-red-400 border-red-500/20 bg-red-950/20",
};

export function ActivityFeed({ events, className, maxItems = 6 }: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className={cn("glass-card p-5 bg-zinc-900/30 border border-white/5 shadow-md", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Audit Activity
        </h3>
        <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
            Live Trace
          </span>
        </div>
      </div>

      <div className="relative pl-4 border-l border-white/5 space-y-5 ml-2">
        {displayEvents.map((event, index) => {
          const EventIcon = eventIcons[event.type] || Shield;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              {/* Timeline marker */}
              <div
                className={cn(
                  "absolute -left-[25px] top-0.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center shadow-sm shrink-0 transition-colors z-10",
                  statusColors[event.status] || "text-zinc-400 border-zinc-700 bg-zinc-800"
                )}
              >
                <EventIcon className="h-2.5 w-2.5" />
              </div>

              {/* Event Content */}
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate group-hover:text-cyan-400 transition-colors">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <span className="text-[9px] text-[var(--color-text-tertiary)] font-mono whitespace-nowrap pt-0.5">
                  {new Date(event.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
