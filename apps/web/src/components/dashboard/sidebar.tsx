"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store";
import {
  LayoutDashboard, Layers, FileText, Shield, Wallet,
  Users, BarChart3, Settings, BookOpen, ChevronLeft,
  Menu,
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
  { href: "#", icon: BookOpen, label: "Docs" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useDashboardStore();

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={toggleSidebar} className="fixed top-3.5 left-3.5 z-50 md:hidden p-1.5 rounded-md border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
        <Menu className="h-4 w-4 text-[var(--color-text-secondary)]" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleSidebar} className="fixed inset-0 bg-black/60 z-40 md:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]",
          "max-md:translate-x-0",
          !sidebarOpen && "max-md:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border-primary)]">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center shrink-0">
              <Shield className="h-3.5 w-3.5 text-white" />
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
          <button onClick={toggleSidebar} className="hidden md:flex p-1 rounded-md hover:bg-[var(--color-bg-tertiary)] transition-colors">
            <ChevronLeft className={cn("h-3.5 w-3.5 text-[var(--color-text-muted)] transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href) && item.href !== "/dashboard";
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors relative",
                  isActive
                    ? "text-[var(--color-text-primary)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-muted)] rounded-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"
                  )}
                />
                <AnimatePresence mode="popLayout">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.12 }}
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
        <div className="p-3 border-t border-[var(--color-border-primary)] space-y-2">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--color-bg-tertiary)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[11px] text-[var(--color-text-secondary)]">LEZ Mainnet</span>
                  <span className="ml-auto text-[10px] text-[var(--color-text-muted)] font-mono">v0.1</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border-primary)] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-semibold font-mono text-[var(--color-text-secondary)]">SS</span>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-[12px] font-medium text-[var(--color-text-primary)] truncate">Protocol Treasury</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] truncate">3-of-5 Multisig</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
