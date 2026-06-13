"use client";

import { motion } from "framer-motion";
import { useMembers } from "@/hooks/useApi";
import { useDashboardStore } from "@/lib/store";
import { ShieldedIdentityAvatar } from "@/components/ui/shielded-identity-avatar";
import { NullifierStatusBadge } from "@/components/ui/nullifier-status-badge";
import { formatDate } from "@/lib/utils";
import { Users, Search, Plus, TreePine } from "lucide-react";
import { MerkleTreeGraph } from "@/components/ui/merkle-tree-graph";

export default function MembersPage() {
  const { selectedMultisigId } = useDashboardStore();
  const { data: members, isLoading } = useMembers(selectedMultisigId);

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-secondary)]">Loading members...</div>;
  }

  const safeMembers = members || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--color-border-primary)]">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text-primary)] mb-1">Members</h1>
          <p className="text-[14px] text-[var(--color-text-secondary)]">Shielded member commitments and Merkle tree</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg bg-white border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] shadow-sm transition-all">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Search by commitment hash..."
          className="w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl bg-white border border-[var(--color-border-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent-subtle)] transition-all shadow-sm"
        />
      </div>

      {/* Merkle Tree Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-primary)] shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-[var(--color-border-primary)] flex items-center gap-2.5 bg-white">
          <TreePine className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Merkle Membership Tree</h3>
        </div>
        <MerkleTreeGraph members={safeMembers} />
      </motion.div>

      {/* Members Table */}
      <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-primary)] shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-4 border-b border-[var(--color-border-primary)] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-[var(--color-text-tertiary)]" />
            <h3 className="text-[15px] font-semibold text-[var(--color-text-primary)]">Shielded Members</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] text-[11px] font-semibold text-[var(--color-text-secondary)] tracking-wide">{safeMembers.length} Members</span>
        </div>
        <div className="divide-y divide-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
          {safeMembers.map((member: any, i: number) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-[var(--color-bg-tertiary)] transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <ShieldedIdentityAvatar commitment={member.commitment.toString()} size="md" />
                <div className="min-w-0">
                  <p className="text-[13px] font-mono font-medium text-[var(--color-text-primary)] truncate">{member.commitment.toString().slice(0, 24)}...</p>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">Leaf index: <span className="font-semibold">{member.leaf_index}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:justify-end shrink-0">
                <NullifierStatusBadge status="consumed" showLabel={true} />
                <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium whitespace-nowrap">{formatDate(member.joined_at)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
