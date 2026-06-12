"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThresholdRingProps {
  current: number;
  required: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  showLabel?: boolean;
}

export function ThresholdRing({
  current,
  required,
  size = 64,
  strokeWidth = 4,
  label,
  className,
  showLabel = true,
}: ThresholdRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(current / required, 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-border-primary)"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="transition-colors duration-200"
          />
          {/* Progress */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
            {current}
          </span>
          <span className="text-[9px] text-[var(--color-text-tertiary)] -mt-1 font-medium">
            of {required}
          </span>
        </div>
      </div>

      {showLabel && label && (
        <div className="mt-3 text-center">
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
            {label}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            {current}-of-{required}
          </p>
        </div>
      )}
    </div>
  );
}
