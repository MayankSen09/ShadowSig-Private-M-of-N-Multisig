"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store";
import {
  LayoutDashboard, Layers, FileText, Shield, Wallet,
  Users, BarChart3, Settings, BookOpen, ChevronLeft,
  Menu, Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/multisigs", icon: Layers, label: "Multisigs" },
  { href: "/dashboard/proposals", icon: FileText, label: "Proposals" },
  { href: "/dashboard/proofs", icon: Shield, label: "Proofs" },
  { href: "/dashboard/treasury", icon: Wallet, label: "Treasury" },
  { href: "/dashboard/members", icon: Users, label: "Members" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  { href: "#", icon: BookOpen, label: "Documentation" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={toggleSidebar} className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg glass">
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]",
          "max-md:translate-x-0",
          !sidebarOpen && "max-md:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--color-border-primary)]">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-900/80 border border-white/10 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-semibold tracking-tight text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden"
                >
                  ShadowSig
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button onClick={toggleSidebar} className="hidden md:flex p-1.5 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors border border-transparent hover:border-white/5">
            <ChevronLeft className={cn("h-4 w-4 text-[var(--color-text-tertiary)] transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto relative">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href) && item.href !== "/dashboard";
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative group",
                  isActive
                    ? "text-[var(--color-text-primary)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-white/5 border border-white/5 rounded-lg"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-colors",
                    isActive ? "text-cyan-400" : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)]"
                  )}
                />
                <AnimatePresence mode="popLayout">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[var(--color-border-primary)]">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              <span className="text-[10px] font-bold font-mono text-cyan-400">SS</span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">Protocol Treasury</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">3-of-5 Multisig</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
