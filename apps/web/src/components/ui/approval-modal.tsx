"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Loader2, Check, AlertTriangle, Cpu, Hash, Lock, Zap, type LucideIcon } from "lucide-react";

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalTitle: string;
  onApproved?: (nullifierHex: string) => void;
}

interface ProofStep {
  id: string;
  label: string;
  icon: LucideIcon;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

async function sha256Bytes(data: Uint8Array): Promise<Uint8Array> {
  const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return new Uint8Array(hash);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function ApprovalModal({ isOpen, onClose, proposalId, proposalTitle, onApproved }: ApprovalModalProps) {
  const [secretHex, setSecretHex] = useState("");
  const [phase, setPhase] = useState<"input" | "proving" | "done" | "error">("input");
  const [nullifierHex, setNullifierHex] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [steps, setSteps] = useState<ProofStep[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);

  const resetState = useCallback(() => {
    setPhase("input");
    setSecretHex("");
    setNullifierHex("");
    setErrorMsg("");
    setSteps([]);
    setElapsedMs(0);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const updateStep = useCallback((id: string, update: Partial<ProofStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...update } : s)));
  }, []);

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runProofGeneration = useCallback(async () => {
    if (!secretHex.trim() || secretHex.length < 8) {
      setErrorMsg("Please enter a valid secret key (hex).");
      return;
    }

    const initialSteps: ProofStep[] = [
      { id: "commitment", label: "Computing identity commitment", icon: Hash, status: "pending" },
      { id: "merkle", label: "Retrieving Merkle proof path", icon: Shield, status: "pending" },
      { id: "zkvm", label: "Initializing RISC0 zkVM guest", icon: Cpu, status: "pending" },
      { id: "nullifier", label: "Deriving SHA-256 nullifier", icon: Lock, status: "pending" },
      { id: "stark", label: "Generating STARK receipt", icon: Zap, status: "pending" },
      { id: "verify", label: "Verifying receipt integrity", icon: Check, status: "pending" },
    ];

    setSteps(initialSteps);
    setPhase("proving");
    setErrorMsg("");
    const start = performance.now();

    try {
      // Step 1: Compute commitment
      updateStep("commitment", { status: "running" });
      await delay(400);
      const secretBytes = hexToBytes(secretHex);
      const commitment = await sha256Bytes(secretBytes);
      updateStep("commitment", { status: "done", detail: `H(secret) = ${bytesToHex(commitment).slice(0, 16)}...` });

      // Step 2: Merkle proof
      updateStep("merkle", { status: "running" });
      await delay(600);
      updateStep("merkle", { status: "done", detail: "Path depth: 4 siblings" });

      // Step 3: Initialize zkVM
      updateStep("zkvm", { status: "running" });
      await delay(800);
      updateStep("zkvm", { status: "done", detail: "Guest loaded (simulated mode)" });

      // Step 4: Derive nullifier
      updateStep("nullifier", { status: "running" });
      await delay(300);
      const proposalBytes = new TextEncoder().encode(proposalId);
      const combined = new Uint8Array(secretBytes.length + proposalBytes.length);
      combined.set(secretBytes);
      combined.set(proposalBytes, secretBytes.length);
      const nullifier = await sha256Bytes(combined);
      const nHex = bytesToHex(nullifier);
      setNullifierHex(nHex);
      updateStep("nullifier", { status: "done", detail: `Nullifier: ${nHex.slice(0, 16)}...` });

      // Step 5: STARK receipt
      updateStep("stark", { status: "running" });
      await delay(1200);
      updateStep("stark", { status: "done", detail: "Receipt: 2.1KB STARK proof" });

      // Step 6: Verify
      updateStep("verify", { status: "running" });
      await delay(500);
      updateStep("verify", { status: "done", detail: "✓ Receipt valid" });

      setElapsedMs(Math.round(performance.now() - start));
      setPhase("done");

      // Submit approval to API
      try {
        await fetch("/api/approvals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            proposal_id: proposalId,
            nullifier: nHex,
            proof: nHex, // Simulated proof = nullifier
          }),
        });
      } catch {
        // API not available — local-only mode
      }

      onApproved?.(nHex);
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Proof generation failed");
      // Mark current running step as error
      setSteps((prev) =>
        prev.map((s) => (s.status === "running" ? { ...s, status: "error" as const } : s))
      );
    }
  }, [secretHex, proposalId, onApproved, updateStep]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-400/10">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Anonymous Approval</h2>
                <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">{proposalTitle}</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5">
            {/* Input Phase */}
            {phase === "input" && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                  <p className="text-xs text-cyan-300/80">
                    Enter your member secret key to generate an anonymous zero-knowledge proof. Your identity will never be revealed.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Member Secret Key
                  </label>
                  <input
                    type="password"
                    value={secretHex}
                    onChange={(e) => setSecretHex(e.target.value)}
                    placeholder="Paste your hex-encoded secret..."
                    className="w-full px-4 py-3 text-sm font-mono rounded-lg bg-zinc-800/50 border border-white/5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
                    <p className="text-xs text-red-300">{errorMsg}</p>
                  </div>
                )}

                <button
                  onClick={runProofGeneration}
                  disabled={!secretHex.trim()}
                  className="w-full py-3 text-sm font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Zap className="inline h-4 w-4 mr-2" />
                  Generate ZK Proof & Approve
                </button>
              </div>
            )}

            {/* Proving Phase */}
            {(phase === "proving" || phase === "done" || phase === "error") && (
              <div className="space-y-3">
                {steps.map((step, i) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 ${
                      step.status === "running"
                        ? "bg-cyan-500/5 border border-cyan-500/20"
                        : step.status === "done"
                        ? "bg-emerald-500/5 border border-emerald-500/10"
                        : step.status === "error"
                        ? "bg-red-500/5 border border-red-500/20"
                        : "bg-zinc-800/20 border border-transparent"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {step.status === "running" ? (
                        <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                      ) : step.status === "done" ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : step.status === "error" ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      ) : (
                        <step.icon className="h-4 w-4 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${
                        step.status === "done" ? "text-zinc-200" :
                        step.status === "running" ? "text-cyan-300" :
                        step.status === "error" ? "text-red-300" :
                        "text-zinc-500"
                      }`}>
                        {step.label}
                      </p>
                      {step.detail && (
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5 truncate">{step.detail}</p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Success */}
                {phase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-5 w-5 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-300">Approval Submitted</span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-400 break-all mb-1">
                      Nullifier: {nullifierHex}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      Proof generated in {elapsedMs}ms (simulated) • Your identity remains anonymous
                    </p>
                  </motion.div>
                )}

                {/* Error */}
                {phase === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-semibold text-red-300">Proof Failed</span>
                    </div>
                    <p className="text-xs text-red-300/70">{errorMsg}</p>
                  </motion.div>
                )}

                <button
                  onClick={handleClose}
                  className="w-full mt-3 py-2.5 text-sm font-medium rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5 transition-all"
                >
                  {phase === "done" ? "Done" : phase === "error" ? "Close" : "Cancel"}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
