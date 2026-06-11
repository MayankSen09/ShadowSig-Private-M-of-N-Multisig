"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerificationPulseProps {
  isVerified: boolean;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}

export function VerificationPulse({
  isVerified,
  size = "sm",
  className,
  label,
}: VerificationPulseProps) {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2.5 h-2.5";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/80 border border-white/5 shadow-inner",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-3 h-3">
        {isVerified && (
          <>
            <motion.div
              className="absolute rounded-full border border-emerald-400/40 w-3 h-3"
              animate={{
                scale: [1, 2.2],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          </>
        )}
        <motion.div
          className={cn(
            "rounded-full shrink-0",
            dotSize,
            isVerified ? "bg-emerald-400" : "bg-zinc-600"
          )}
          animate={
            isVerified
              ? {
                  boxShadow: [
                    "0 0 0px rgba(52,211,153,0.4)",
                    "0 0 8px rgba(52,211,153,0.6)",
                    "0 0 0px rgba(52,211,153,0.4)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      {label && (
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wider",
            isVerified ? "text-emerald-400" : "text-zinc-500"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
