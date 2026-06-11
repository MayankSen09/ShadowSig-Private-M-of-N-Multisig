"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Copy, Check, Shield, Key, Users, Loader2 } from "lucide-react";

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
        // API not available — local-only mode
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg mx-4 bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-400/10">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Create Multisig</h2>
                <p className="text-xs text-zinc-400">
                  {step === "config" && "Configure your shielded vault"}
                  {step === "identities" && "Save member secrets securely"}
                  {step === "confirm" && "Review and deploy"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step: Config */}
          {step === "config" && (
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Vault Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Treasury Council"
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-800/50 border border-white/5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose of this multisig..."
                  rows={2}
                  className="w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-800/50 border border-white/5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    <Users className="inline h-3 w-3 mr-1" />Members (N)
                  </label>
                  <select
                    value={memberCount}
                    onChange={(e) => {
                      const n = parseInt(e.target.value);
                      setMemberCount(n);
                      if (threshold > n) setThreshold(n);
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-800/50 border border-white/5 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <option key={n} value={n}>{n} members</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    <Key className="inline h-3 w-3 mr-1" />Threshold (M)
                  </label>
                  <select
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-800/50 border border-white/5 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
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
                  className="w-full py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="inline h-4 w-4 mr-2" />
                  Generate {memberCount} Identities
                </button>
              </div>
            </div>
          )}

          {/* Step: Identities */}
          {step === "identities" && (
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  ⚠️ Save each member&apos;s secret key securely. These are the private keys used to generate anonymous approval proofs. They cannot be recovered.
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {members.map((member) => (
                  <motion.div
                    key={member.index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: member.index * 0.08 }}
                    className="p-3 rounded-lg bg-zinc-800/50 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-zinc-300">Member {member.index + 1}</span>
                      <button
                        onClick={() => copySecret(member.index)}
                        className="flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 transition-colors"
                      >
                        {member.copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {member.copied ? "Copied!" : "Copy Secret"}
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Secret Key</p>
                      <p className="text-[10px] font-mono text-cyan-300/80 break-all leading-relaxed">{member.secretHex}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-2">Commitment</p>
                      <p className="text-[10px] font-mono text-purple-300/60 break-all leading-relaxed">{member.commitmentHex}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("config")}
                  className="flex-1 py-2.5 text-sm font-medium rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-cyan-500/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
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
