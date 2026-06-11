"use client";

import { cn } from "@/lib/utils";
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

type NullifierStatus = "unused" | "consumed" | "invalid" | "validating";

interface NullifierStatusBadgeProps {
  status: NullifierStatus;
  className?: string;
  showLabel?: boolean;
}

const config = {
  unused: {
    icon: Shield,
    color: "text-zinc-500",
    dot: "bg-zinc-500",
    label: "Unused",
  },
  consumed: {
    icon: ShieldCheck,
    color: "text-emerald-400",
    dot: "bg-emerald-500",
    label: "Consumed",
  },
  invalid: {
    icon: ShieldX,
    color: "text-red-400",
    dot: "bg-red-500",
    label: "Invalid",
  },
  validating: {
    icon: ShieldAlert,
    color: "text-cyan-400",
    dot: "bg-cyan-500",
    label: "Validating",
  },
};

export function NullifierStatusBadge({
  status,
  className,
  showLabel = true,
}: NullifierStatusBadgeProps) {
  const c = config[status] || config.unused;
  const Icon = c.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/5 bg-zinc-900/60 shadow-inner",
        c.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot, status === "validating" && "animate-pulse")} />
      {showLabel && (
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {c.label}
        </span>
      )}
    </div>
  );
}
