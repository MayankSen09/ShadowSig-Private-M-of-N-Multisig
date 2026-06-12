"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";


interface ThresholdRingProps {
  current: number;
  threshold: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  animated?: boolean;
}

export function ThresholdRing({
  current,
  threshold,
  size = 120,
  strokeWidth = 6,
  className,
  label,
  animated = true,
}: ThresholdRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(current / threshold, 1);
  const isComplete = current >= threshold;

  const strokeDashoffset = circumference * (1 - percentage);
  const showText = size >= 60;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? "#10b981" : "#6366f1"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: animated ? 1.2 : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
        />

      </svg>

      {/* Center content */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn(
              "font-bold font-mono leading-none tracking-tight",
              isComplete ? "text-emerald-400" : "text-[var(--color-text-primary)]"
            )}
            style={{ fontSize: size * 0.16 }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {current}/{threshold}
          </motion.span>
          {label && (
            <span
              className="text-[var(--color-text-tertiary)] uppercase tracking-wider font-semibold"
              style={{ fontSize: Math.max(size * 0.08, 8), marginTop: size * 0.04 }}
            >
              {label}
            </span>
          )}
        </div>
      )}

      {/* Completion glow */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
          }}
        />
      )}
    </div>
  );
}
