"use client";

import { motion } from "framer-motion";
import { Settings as SettingsIcon, Shield, Bell, Key } from "lucide-react";
import { useState } from "react";

type SettingItem = {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
};

type SettingSection = {
  icon: typeof Shield;
  title: string;
  desc: string;
  items: SettingItem[];
};

const initialSections: SettingSection[] = [
  {
    icon: Shield,
    title: "Security",
    desc: "Proof generation and verification settings",
    items: [
      { id: "local_gen", label: "Local Proof Generation", desc: "Generate proofs locally before submission", enabled: true },
      { id: "secret_zero", label: "Secret Zeroization", desc: "Automatically zero sensitive data from memory", enabled: true },
      { id: "encrypted_storage", label: "Encrypted Storage", desc: "Encrypt all local storage data", enabled: true },
      { id: "audit_log", label: "Audit Logging", desc: "Log all proof and approval operations", enabled: false },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Configure alert preferences",
    items: [
      { id: "prop_created", label: "Proposal Created", desc: "Notify when new proposals are created", enabled: true },
      { id: "threshold_reached", label: "Threshold Reached", desc: "Alert when approval threshold is met", enabled: true },
      { id: "proof_verified", label: "Proof Verified", desc: "Notify on proof verification completion", enabled: false },
      { id: "exec_complete", label: "Execution Complete", desc: "Alert on treasury action execution", enabled: true },
    ],
  },
  {
    icon: Key,
    title: "Access Control",
    desc: "Manage authentication and permissions",
    items: [
      { id: "two_factor", label: "Two-Factor Auth", desc: "Require 2FA for sensitive operations", enabled: true },
      { id: "session_timeout", label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", enabled: true },
      { id: "ip_allow", label: "IP Allowlist", desc: "Restrict access to specified IP ranges", enabled: false },
    ],
  },
];

export default function SettingsPage() {
  const [sections, setSections] = useState<SettingSection[]>(initialSections);

  const toggleSetting = (sectionIndex: number, itemIndex: number) => {
    setSections((prev) =>
      prev.map((sec, si) => {
        if (si !== sectionIndex) return sec;
        return {
          ...sec,
          items: sec.items.map((item, ii) => {
            if (ii !== itemIndex) return item;
            return { ...item, enabled: !item.enabled };
          }),
        };
      })
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Configure platform security and preferences</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.08 }}
            className="glass-card overflow-hidden bg-zinc-900/30 border border-white/5 shadow-md"
          >
            <div className="px-5 py-4 border-b border-white/[0.03] flex items-center gap-3 bg-zinc-950/20">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shadow-inner">
                <section.icon className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{section.title}</h3>
                <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">{section.desc}</p>
              </div>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {section.items.map((item, ii) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.01] transition-colors"
                >
                  <div className="pr-4">
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleSetting(si, ii)}
                    className={`relative w-9 h-5 rounded-full transition-all border shrink-0 ${
                      item.enabled
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-zinc-950/60 border-white/5 text-zinc-500"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-3.5 h-3.5 rounded-full transition-all ${
                        item.enabled
                          ? "left-[18px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                          : "left-0.5 bg-zinc-500"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
