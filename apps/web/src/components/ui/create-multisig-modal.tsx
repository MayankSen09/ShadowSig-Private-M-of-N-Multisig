"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Copy, Check, Shield, Key, Users, Loader2, AlertTriangle } from "lucide-react";

interface MemberIdentity {
  index: number;
  secretHex: string;
  commitmentHex: string;
  copied: boolean;
}

interface CreateMultisigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (multisig: { id: string; name: string; memberCount: number; threshold: number }) => void;
}

async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function CreateMultisigModal({ isOpen, onClose, onCreated }: CreateMultisigModalProps) {
  const [step, setStep] = useState<"config" | "identities" | "confirm">("config");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberCount, setMemberCount] = useState(3);
  const [threshold, setThreshold] = useState(2);
  const [members, setMembers] = useState<MemberIdentity[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const generateIdentities = useCallback(async () => {
    const identities: MemberIdentity[] = [];
    for (let i = 0; i < memberCount; i++) {
      const secretHex = generateSecret();
      const commitmentHex = await sha256Hex(secretHex);
      identities.push({ index: i, secretHex, commitmentHex, copied: false });
    }
    setMembers(identities);
    setStep("identities");
  }, [memberCount]);

  const copySecret = useCallback((index: number) => {
    const member = members[index];
    if (member) {
      navigator.clipboard.writeText(member.secretHex);
      setMembers((prev) =>
        prev.map((m, i) => (i === index ? { ...m, copied: true } : m))
      );
      setTimeout(() => {
        setMembers((prev) =>
          prev.map((m, i) => (i === index ? { ...m, copied: false } : m))
        );
      }, 2000);
    }
  }, [members]);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    try {
      const commitments = members.map((m) => m.commitmentHex);

      // Try API first, fall back to local
      try {
        const res = await fetch("/api/multisigs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description: description || undefined,
            threshold,
            member_commitments: commitments,
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            onCreated?.(json.data);
          }
        }
      } catch {
        // API not available
      }

      onCreated?.({
        id: crypto.randomUUID(),
        name,
        memberCount: members.length,
        threshold,
      });
    } finally {
      setIsCreating(false);
      onClose();
      setStep("config");
      setName("");
      setDescription("");
      setMembers([]);
    }
  }, [name, description, threshold, members, onClose, onCreated]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg mx-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-2xl shadow-[var(--shadow-elevated)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center shadow-sm">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] tracking-tight">Create Multisig</h2>
                <p className="text-[12px] text-[var(--color-text-secondary)]">
                  {step === "config" && "Configure your shielded vault"}
                  {step === "identities" && "Save member secrets securely"}
                  {step === "confirm" && "Review and deploy"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step: Config */}
          {step === "config" && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Vault Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Treasury Council"
                  className="w-full px-3 py-2 text-[13px] rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose of this multisig..."
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] resize-none transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Members (N)
                  </label>
                  <select
                    value={memberCount}
                    onChange={(e) => {
                      const n = parseInt(e.target.value);
                      setMemberCount(n);
                      if (threshold > n) setThreshold(n);
                    }}
                    className="w-full px-3 py-2 text-[13px] rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] transition-all shadow-sm"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>{n} members</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" /> Threshold (M)
                  </label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] transition-all shadow-sm"
                  >
                    {Array.from({ length: memberCount }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n} of {memberCount}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={generateIdentities}
                  disabled={!name.trim()}
                  className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                  Generate {memberCount} Identities
                </button>
              </div>
            </div>
          )}

          {/* Step: Identities */}
          {step === "identities" && (
            <div className="p-6 space-y-4 bg-[var(--color-bg-secondary)]">
              <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                <p className="text-[12px] text-orange-800 font-medium">
                  Save each member&apos;s secret key securely. These are the private keys used to generate anonymous approval proofs. They cannot be recovered.
                </p>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {members.map((member) => (
                  <motion.div
                    key={member.index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: member.index * 0.05 }}
                    className="p-3.5 rounded-xl bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">Member {member.index + 1}</span>
                      <button
                        onClick={() => copySecret(member.index)}
                        className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] transition-colors shadow-sm"
                      >
                        {member.copied ? <Check className="h-3 w-3 text-[var(--color-system-green)]" /> : <Copy className="h-3 w-3" />}
                        {member.copied ? "Copied!" : "Copy Secret"}
                      </button>
                    </div>
                    <div className="space-y-1.5 bg-[var(--color-bg-secondary)] p-2.5 rounded-lg border border-[var(--color-border-primary)]">
                      <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Secret Key</p>
                      <p className="text-[11px] font-mono text-[var(--color-text-primary)] break-all leading-relaxed select-all">{member.secretHex}</p>
                      <div className="h-px w-full bg-[var(--color-border-primary)] my-2" />
                      <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold">Commitment</p>
                      <p className="text-[11px] font-mono text-[var(--color-text-secondary)] break-all leading-relaxed select-all">{member.commitmentHex}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("config")}
                  className="btn-secondary flex-1 justify-center"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="btn-primary flex-1 justify-center disabled:opacity-60"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Deploy Multisig
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
