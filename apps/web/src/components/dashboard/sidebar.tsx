"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/lib/store";
import {
  LayoutDashboard, Layers, FileText, Shield, Wallet,
  Users, BarChart3, Settings, BookOpen, ChevronLeft,
  Menu, LogOut,
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
  const { sidebarOpen, toggleSidebar, logout } = useDashboardStore();

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={toggleSidebar} className="fixed top-3.5 left-3.5 z-50 md:hidden p-1.5 rounded-md border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-sm">
        <Menu className="h-4 w-4 text-[var(--color-text-primary)]" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleSidebar} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[var(--color-border-primary)] bg-[var(--color-bg-sidebar)] backdrop-blur-xl",
          "max-md:translate-x-0",
          !sidebarOpen && "max-md:-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--color-border-primary)]">
          <Link href="/" className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center shrink-0 shadow-sm">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[14px] font-semibold tracking-tight text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden"
                >
                  ShadowSig
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button onClick={toggleSidebar} className="hidden md:flex p-1 rounded-md hover:bg-[var(--color-border-primary)] transition-colors">
            <ChevronLeft className={cn("h-4 w-4 text-[var(--color-text-secondary)] transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href) && item.href !== "/dashboard";
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors relative",
                  isActive
                    ? "text-white bg-[var(--color-accent)] shadow-sm"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-border-primary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive ? "text-white" : "text-[var(--color-text-secondary)]"
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
        <div className="p-4 border-t border-[var(--color-border-primary)] flex flex-col gap-4">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-system-green)] shrink-0" />
                  <span className="text-[12px] font-medium text-[var(--color-text-primary)]">LEZ Mainnet</span>
                  <span className="ml-auto text-[11px] text-[var(--color-text-secondary)] font-mono">v0.1</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3 px-1 mb-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <span className="text-[10px] font-bold font-mono text-indigo-700">0x4F</span>
              </div>
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden flex-1"
                >
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)] truncate">0x4F...a2B</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] truncate">Connected Identity</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Disconnect
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
