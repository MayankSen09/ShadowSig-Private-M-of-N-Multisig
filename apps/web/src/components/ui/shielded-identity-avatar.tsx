"use client";

import { cn } from "@/lib/utils";

interface ShieldedIdentityAvatarProps {
  commitment: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-[9px]",
  md: "w-9 h-9 text-[10px]",
  lg: "w-12 h-12 text-xs",
};

function commitmentToGradient(commitment: string): string {
  const hash = commitment.replace("0x", "").slice(0, 12);
  const h1 = parseInt(hash.slice(0, 3), 16) % 360;
  const h2 = (h1 + 60 + (parseInt(hash.slice(3, 6), 16) % 120)) % 360;
  return `linear-gradient(135deg, hsl(${h1}, 35%, 25%), hsl(${h2}, 25%, 15%))`;
}

function commitmentToInitials(commitment: string): string {
  const hex = commitment.replace("0x", "");
  const c1 = String.fromCharCode(65 + (parseInt(hex.slice(0, 2), 16) % 26));
  const c2 = String.fromCharCode(65 + (parseInt(hex.slice(2, 4), 16) % 26));
  return `${c1}${c2}`;
}

export function ShieldedIdentityAvatar({
  commitment,
  size = "md",
  className,
}: ShieldedIdentityAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-mono font-medium text-zinc-300 ring-1 ring-white/10 shadow-inner",
        sizeClasses[size],
        className
      )}
      style={{ background: commitmentToGradient(commitment) }}
      title={`Shielded: ${commitment.slice(0, 10)}...`}
    >
      {commitmentToInitials(commitment)}
    </div>
  );
}
