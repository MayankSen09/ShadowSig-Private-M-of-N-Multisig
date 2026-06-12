"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ActivityEvent } from "@/lib/types";
import {
  Shield, Zap, ArrowUpRight, FileCheck, UserPlus,
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
  success: "text-[var(--color-system-green)]",
  pending: "text-[var(--color-system-orange)]",
  error: "text-[var(--color-system-red)]",
};

export function ActivityFeed({ events, className, maxItems = 6 }: ActivityFeedProps) {
  const displayEvents = (events || []).slice(0, maxItems);

  return (
    <div className={cn("p-5 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm", className)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[15px] font-semibold">Activity Feed</h3>
        <div className="flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded bg-green-50 text-[var(--color-system-green)] border border-green-100 dark:bg-green-500/10 dark:border-green-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-system-green)] animate-pulse" />
          Live
        </div>
      </div>

      <div className="space-y-4">
        {displayEvents.map((event, index) => {
          const EventIcon = eventIcons[event.type] || Shield;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-start gap-3 group"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[var(--color-border-secondary)] transition-colors">
                <EventIcon className={cn("h-4 w-4", statusColors[event.status] || "text-[var(--color-text-secondary)]")} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                    {event.title}
                  </p>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] whitespace-nowrap ml-2">
                    {new Date(event.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-snug line-clamp-2">
                  {event.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
