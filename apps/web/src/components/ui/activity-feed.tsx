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
  success: "text-emerald-400",
  pending: "text-amber-400",
  error: "text-red-400",
};

export function ActivityFeed({ events, className, maxItems = 6 }: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems);

  return (
    <div className={cn("p-4 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)]", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium">Activity</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      <div className="space-y-3">
        {displayEvents.map((event, index) => {
          const EventIcon = eventIcons[event.type] || Shield;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-start gap-2.5"
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] flex items-center justify-center shrink-0 mt-0.5",
                )}
              >
                <EventIcon className={cn("h-3 w-3", statusColors[event.status] || "text-[var(--color-text-muted)]")} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate">
                  {event.title}
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed line-clamp-2">
                  {event.description}
                </p>
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)] font-mono whitespace-nowrap pt-0.5">
                {new Date(event.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
