"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Zap, Lock, Eye, Globe, Cpu, RotateCcw, RefreshCw,
  AlertTriangle, Wallet, ArrowRight, GitBranch, Layers,
} from "lucide-react";

const features = [
  { icon: Shield, title: "Anonymous Approvals", desc: "Submit votes without revealing signer identity. Shielded accounts protect all participant data." },
  { icon: Zap, title: "zk Threshold Proofs", desc: "Risc0 zkVM generates STARK proofs that M-of-N approval was reached without revealing who approved." },
  { icon: Lock, title: "Nullifier Protection", desc: "Cryptographic nullifiers prevent double-voting while maintaining complete signer anonymity." },
  { icon: Eye, title: "Shielded Governance", desc: "Only proof of quorum completion is visible on-chain. Signer identities are never revealed." },
  { icon: Globe, title: "LEZ Native Integration", desc: "Built natively for the Logos Execution Zone with SPEL smart contracts and LEZ verifier programs." },
  { icon: Cpu, title: "Risc0 zkVM Verification", desc: "Arbitrary Rust programs run inside the zkVM. STARK receipts verify computation integrity." },
  { icon: RotateCcw, title: "Replay Protection", desc: "Deterministic nullifier derivation ensures no approval can be submitted twice to any proposal." },
  { icon: RefreshCw, title: "Resumable Sessions", desc: "Proof generation survives interruptions. Resume proving from the last checkpoint." },
  { icon: AlertTriangle, title: "Deterministic Errors", desc: "Every error state is typed and deterministic. No ambiguous failures in proof verification." },
  { icon: Wallet, title: "Treasury Coordination", desc: "Execute threshold-approved treasury actions with unlinkable execution traces." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-sidebar)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">ShadowSig</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Features</a>
            <a href="#architecture" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Architecture</a>
            <a href="https://github.com/MayankSen09/ShadowSig-Private-M-of-N-Multisig" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
            <Link href="/dashboard" className="px-3.5 py-1.5 text-[13px] font-medium rounded-full bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen pt-20 px-6 flex flex-col items-center justify-center">
        <div className="relative z-10 max-w-3xl mx-auto text-center mt-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] mb-6 text-[12px] font-medium text-[var(--color-text-secondary)] shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-system-green)]" />
              Powered by Risc0 zkVM
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
            Private Multisig for the Logos Execution Zone
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Anonymous approvals. Shielded governance. Threshold proofs secured by zero-knowledge cryptography.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="btn-primary">
              Launch App <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="https://github.com/MayankSen09/ShadowSig-Private-M-of-N-Multisig" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <GitBranch className="h-4 w-4" /> View Source
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[var(--color-bg-secondary)] border-y border-[var(--color-border-primary)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Built for privacy-first governance
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto text-[15px]">
              Every component is designed to protect signer privacy while maintaining cryptographic verifiability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="bg-[var(--color-bg-primary)] p-6 rounded-2xl border border-[var(--color-border-primary)] shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-[var(--color-accent)]" />
                </div>
                <h3 className="text-[15px] font-semibold mb-2 text-[var(--color-text-primary)]">{f.title}</h3>
                <p className="text-[14px] text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto text-[15px]">
              From proposal creation to treasury execution — every step is shielded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create Proposal", desc: "Define a treasury action. Merkle root validates membership." },
              { step: "2", title: "Generate Proof", desc: "Risc0 zkVM proves membership and vote without revealing identity." },
              { step: "3", title: "Submit Approval", desc: "Anonymous approval with nullifier. Replay protection is enforced." },
              { step: "4", title: "Validate Nullifier", desc: "On-chain nullifier registry prevents double-voting." },
              { step: "5", title: "Reach Threshold", desc: "M-of-N threshold reached. Quorum proof is generated." },
              { step: "6", title: "Execute Action", desc: "Treasury action executed. Unlinkable to approving members." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="p-6 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mb-4 text-[13px] font-bold text-[var(--color-text-secondary)]">
                  {s.step}
                </div>
                <h3 className="text-[15px] font-semibold mb-2">{s.title}</h3>
                <p className="text-[14px] text-[var(--color-text-secondary)]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-primary)] py-8 px-6 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
              <Shield className="h-3 w-3 text-white" />
            </div>
            <span className="text-[14px] font-semibold">ShadowSig</span>
          </div>
          <p className="text-[13px] text-[var(--color-text-secondary)]">Privacy-preserving multisig infrastructure for the Logos Execution Zone</p>
        </div>
      </footer>
    </div>
  );
}
