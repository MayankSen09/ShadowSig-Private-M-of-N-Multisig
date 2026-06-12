"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Zap, Lock, Eye, Globe, Cpu, RotateCcw, RefreshCw,
  AlertTriangle, Wallet, ArrowRight, GitBranch, Layers,
  ChevronRight,
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
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
            <Link href="/dashboard" className="px-3.5 py-1.5 text-[13px] font-medium rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        <div className="hero-gradient-mesh" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border-secondary)] bg-[var(--color-bg-secondary)] mb-8 text-[12px] text-[var(--color-text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Powered by Risc0 zkVM
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] mb-5">
            Private Multisig for the Logos Execution Zone
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="text-base md:text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto mb-8 leading-relaxed">
            Anonymous approvals. Shielded governance. Threshold proofs secured by zero-knowledge cryptography.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="btn-primary">
              Launch App <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#architecture" className="btn-secondary">
              <Layers className="h-4 w-4" /> Architecture
            </a>
            <a href="https://github.com/MayankSen09/ShadowSig-Private-M-of-N-Multisig" target="_blank" rel="noopener noreferrer" className="btn-secondary">
              <GitBranch className="h-4 w-4" /> Source
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] rotate-90" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Built for privacy-first governance
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto text-sm">
              Every component is designed to protect signer privacy while maintaining cryptographic verifiability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[var(--color-border-primary)] rounded-xl overflow-hidden border border-[var(--color-border-primary)]">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="bg-[var(--color-bg-secondary)] p-6 hover:bg-[var(--color-bg-tertiary)] transition-colors">
                <f.icon className="h-5 w-5 text-[var(--color-text-tertiary)] mb-4" />
                <h3 className="text-sm font-medium mb-1.5 text-[var(--color-text-primary)]">{f.title}</h3>
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 px-6 border-t border-[var(--color-border-primary)]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              How it works
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto text-sm">
              From proposal creation to treasury execution — every step is shielded.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Create Proposal", desc: "Define a treasury action. Merkle root validates membership." },
              { step: "02", title: "Generate Proof", desc: "Risc0 zkVM proves membership and vote without revealing identity." },
              { step: "03", title: "Submit Approval", desc: "Anonymous approval with nullifier. Replay protection is enforced." },
              { step: "04", title: "Validate Nullifier", desc: "On-chain nullifier registry prevents double-voting." },
              { step: "05", title: "Reach Threshold", desc: "M-of-N threshold reached. Quorum proof is generated." },
              { step: "06", title: "Execute Action", desc: "Treasury action executed. Unlinkable to approving members." },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="p-5 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-card)] hover:border-[var(--color-border-secondary)] transition-colors">
                <span className="text-[11px] font-mono text-[var(--color-text-muted)] uppercase tracking-widest">Step {s.step}</span>
                <h3 className="text-sm font-medium mt-2 mb-1.5">{s.title}</h3>
                <p className="text-[13px] text-[var(--color-text-secondary)]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-primary)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[var(--color-accent)] flex items-center justify-center">
              <Shield className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[13px] font-medium">ShadowSig</span>
          </div>
          <p className="text-[12px] text-[var(--color-text-muted)]">Privacy-preserving multisig infrastructure for the Logos Execution Zone</p>
        </div>
      </footer>
    </div>
  );
}
