"use client";

import { motion } from "framer-motion";
import { mockMembers } from "@/lib/mock-data";
import { ShieldedIdentityAvatar } from "@/components/ui/shielded-identity-avatar";
import { NullifierStatusBadge } from "@/components/ui/nullifier-status-badge";
import { formatDate } from "@/lib/utils";
import { Users, Search, Plus, TreePine } from "lucide-react";

export default function MembersPage() {
  const members = mockMembers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Members</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Shielded member commitments and Merkle tree</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-zinc-50 hover:bg-zinc-200 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="flex-1 relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search by commitment hash..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-zinc-900/50 border border-white/5 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
        />
      </div>

      {/* Merkle Tree Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-zinc-900/30 border border-white/5 shadow-md"
      >
        <div className="flex items-center gap-2 mb-4">
          <TreePine className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Merkle Membership Tree</h3>
        </div>
        <div className="flex items-center justify-center py-8 bg-zinc-950/20 rounded-lg border border-white/[0.01]">
          {/* Simplified tree visualization */}
          <div className="flex flex-col items-center gap-3">
            <div className="px-3 py-1 rounded bg-zinc-900 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-[10px] font-semibold text-cyan-400 font-mono">Root</div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-8">
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="px-2.5 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] font-mono text-[var(--color-text-secondary)]">H{i}</div>
                  <div className="w-px h-3 bg-zinc-800" />
                  <div className="flex items-center gap-4">
                    {[0, 1].map((j) => (
                      <div key={j} className="flex flex-col items-center gap-2">
                        <div className="px-1.5 py-0.5 rounded bg-zinc-950 text-[8px] font-mono text-[var(--color-text-tertiary)] border border-white/[0.01]">L{i * 2 + j}</div>
                        <div className="w-px h-2 bg-zinc-800" />
                        <ShieldedIdentityAvatar commitment={members[i * 2 + j]?.commitment || "0x0"} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Members Table */}
      <div className="glass-card overflow-hidden bg-zinc-900/30 border border-white/5 shadow-md">
        <div className="px-5 py-4 border-b border-white/[0.03] flex items-center gap-2 bg-zinc-950/20">
          <Users className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Shielded Members</h3>
          <span className="ml-auto text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">{members.length} members</span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.01] transition-colors"
            >
              <ShieldedIdentityAvatar commitment={member.commitment} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-[var(--color-text-secondary)] truncate">{member.commitment.slice(0, 24)}...{member.commitment.slice(-8)}</p>
                <p className="text-[9px] text-[var(--color-text-tertiary)] font-medium">Leaf index: {member.leafIndex}</p>
              </div>
              <NullifierStatusBadge status="consumed" showLabel={true} />
              <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono whitespace-nowrap">{formatDate(member.joinedAt)}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
