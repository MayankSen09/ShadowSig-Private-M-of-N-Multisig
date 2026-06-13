"use client";

import { motion } from "framer-motion";
import { Shield, Bell, Key } from "lucide-react";
import { useState } from "react";

type SettingItem = {
  id: string;
  label: string;
  desc: string;
  enabled: boolean;
};

type SettingSection = {
  icon: typeof Shield;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  items: SettingItem[];
};

const initialSections: SettingSection[] = [
  {
    icon: Shield,
    iconBg: "bg-[var(--color-accent)]",
    iconColor: "text-white",
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
    iconBg: "bg-[var(--color-system-red)]",
    iconColor: "text-white",
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
    iconBg: "bg-[var(--color-system-orange)]",
    iconColor: "text-white",
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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="px-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-[14px] text-[var(--color-text-secondary)] mt-1">Configure platform security and preferences</p>
      </div>

      <div className="space-y-8">
        {sections.map((section, si) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.05 }}
          >
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${section.iconBg}`}>
                <section.icon className={`h-4 w-4 ${section.iconColor}`} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)] tracking-tight">{section.title}</h3>
                <p className="text-[12px] text-[var(--color-text-secondary)]">{section.desc}</p>
              </div>
            </div>

            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl shadow-sm overflow-hidden">
              <div className="flex flex-col divide-y divide-[var(--color-border-primary)]">
                {section.items.map((item, ii) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-bg-tertiary)] transition-colors duration-150"
                  >
                    <div className="pr-6">
                      <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{item.label}</p>
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleSetting(si, ii)}
                      className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 ease-in-out shrink-0 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-subtle)] ${
                        item.enabled ? "bg-[var(--color-system-green)]" : "bg-[#e9e9ea]"
                      }`}
                    >
                      <div
                        className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-all duration-200 ease-in-out shadow-[0_2px_4px_rgba(0,0,0,0.15)] ${
                          item.enabled ? "left-[22px]" : "left-[2px]"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
