"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Shield, Zap, Lock, Eye, Globe, Cpu, RotateCcw, RefreshCw,
  AlertTriangle, Wallet, ArrowRight, GitBranch, BookOpen, Layers
} from "lucide-react";

const HeroVisualization = dynamic(
  () => import("@/components/landing/hero-visualization").then((m) => m.HeroVisualization),
  { ssr: false }
);

const features = [
  { icon: Shield, title: "Anonymous Approvals", desc: "Submit votes without revealing signer identity. Shielded accounts protect all participant data.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { icon: Zap, title: "zk Threshold Proofs", desc: "Risc0 zkVM generates STARK proofs that M-of-N approval was reached without revealing who approved.", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: Lock, title: "Nullifier Protection", desc: "Cryptographic nullifiers prevent double-voting while maintaining complete signer anonymity.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Eye, title: "Shielded Governance", desc: "Only proof of quorum completion is visible on-chain. Signer identities are never revealed.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { icon: Globe, title: "LEZ Native Integration", desc: "Built natively for the Logos Execution Zone with SPEL smart contracts and LEZ verifier programs.", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: Cpu, title: "Risc0 zkVM Verification", desc: "Arbitrary Rust programs run inside the zkVM. STARK receipts verify computation integrity.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: RotateCcw, title: "Replay Protection", desc: "Deterministic nullifier derivation ensures no approval can be submitted twice to any proposal.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { icon: RefreshCw, title: "Resumable Sessions", desc: "Proof generation survives interruptions. Resume proving from the last checkpoint.", color: "text-purple-400", bg: "bg-purple-400/10" },
  { icon: AlertTriangle, title: "Deterministic Errors", desc: "Every error state is typed and deterministic. No ambiguous failures in proof verification.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Wallet, title: "Treasury Coordination", desc: "Execute threshold-approved treasury actions with unlinkable execution traces.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border-primary)] !rounded-none">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShadowSig</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Features</a>
            <a href="#architecture" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">Architecture</a>
            <a href="https://github.com" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">GitHub</a>
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-opacity">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <HeroVisualization />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-bg-primary)_70%)]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-secondary)] bg-[var(--color-bg-card)] mb-8">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
              <span className="text-xs text-[var(--color-text-secondary)]">Powered by Risc0 zkVM + LEZ</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Private Multisig{" "}
            <span className="gradient-text">Infrastructure</span>
            <br />for the Logos Execution Zone
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Anonymous approvals. Shielded governance. Threshold proofs secured by Risc0.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard" className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,225,255,0.25)]">
              Launch App <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="#architecture" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-[var(--color-border-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
              <Layers className="h-4 w-4" /> View Architecture
            </a>
            <a href="https://github.com" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
              <GitBranch className="h-4 w-4" /> GitHub
            </a>
            <a href="#docs" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl border border-[var(--color-border-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors">
              <BookOpen className="h-4 w-4" /> Documentation
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-5 h-8 rounded-full border-2 border-[var(--color-border-secondary)] flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-[var(--color-text-tertiary)]" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">Privacy-First</span> Governance
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              Every component designed to protect signer privacy while maintaining cryptographic verifiability.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="glass-card p-6 group">
                <div className={`p-2.5 rounded-xl ${f.bg} w-fit mb-4`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-semibold mb-2 text-[var(--color-text-primary)]">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-32 px-6 border-t border-[var(--color-border-primary)]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zero-Knowledge <span className="gradient-text">Architecture</span>
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
              From proposal creation to treasury execution — every step is shielded.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Create Proposal", desc: "Define treasury action. Merkle root validates membership.", color: "from-cyan-400/20 to-cyan-400/5" },
              { step: "02", title: "Generate zk Proof", desc: "Risc0 zkVM proves membership + vote without revealing identity.", color: "from-purple-400/20 to-purple-400/5" },
              { step: "03", title: "Submit Approval", desc: "Anonymous approval with nullifier. Replay protection enforced.", color: "from-cyan-400/20 to-purple-400/5" },
              { step: "04", title: "Validate Nullifier", desc: "On-chain nullifier registry prevents double-voting.", color: "from-emerald-400/20 to-emerald-400/5" },
              { step: "05", title: "Reach Threshold", desc: "M-of-N threshold reached. Quorum proof generated.", color: "from-purple-400/20 to-cyan-400/5" },
              { step: "06", title: "Execute Action", desc: "Treasury action executed. Unlinkable to approving members.", color: "from-emerald-400/20 to-cyan-400/5" },
            ].map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className={`glass-card p-6 bg-gradient-to-b ${s.color}`}>
                <span className="text-xs font-mono text-[var(--color-text-tertiary)] uppercase tracking-widest">Step {s.step}</span>
                <h3 className="text-base font-semibold mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border-primary)] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">ShadowSig</span>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)]">Privacy-preserving multisig infrastructure for the Logos Execution Zone</p>
        </div>
      </footer>
    </div>
  );
}
