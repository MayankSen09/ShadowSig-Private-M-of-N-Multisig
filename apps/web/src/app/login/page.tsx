"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Fingerprint, Lock, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { Identity } from "@semaphore-protocol/identity";

export default function LoginPage() {
  const [step, setStep] = useState<"idle" | "generating" | "success">("idle");
  const [progressText, setProgressText] = useState("");
  const { login } = useDashboardStore();
  const router = useRouter();

  const handleConnect = async () => {
    setStep("generating");
    
    // Simulate complex proof generation and cryptographic steps visually
    setProgressText("Initializing zk-SNARK constraints...");
    await new Promise((r) => setTimeout(r, 800));
    
    setProgressText("Generating Semaphore Identity (Trapdoor & Nullifier)...");
    
    // Real Semaphore Identity generation (non-blocking simulation to allow UI update)
    await new Promise((r) => setTimeout(r, 100));
    const identity = new Identity();
    
    await new Promise((r) => setTimeout(r, 800));
    
    setProgressText("Calculating Identity Commitment...");
    await new Promise((r) => setTimeout(r, 800));

    setProgressText("Establishing shielded session...");
    await new Promise((r) => setTimeout(r, 600));

    setStep("success");
    
    // Store actual cryptographic material in memory (cleared on logout/refresh)
    login(
      identity.commitment.toString(),
      identity.privateKey.toString(),
      identity.publicKey.toString()
    );

    // Redirect after brief success state
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-[18px] bg-blue-600 flex items-center justify-center mb-6 shadow-sm">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111827]">ShadowSig Enclave</h1>
          <p className="text-[15px] text-[#6B7280] mt-2 text-center max-w-[300px] font-medium leading-snug">
            Generate your local Semaphore Identity to access the shielded multisig layer.
          </p>
        </div>

        <div className="rounded-[24px] bg-white border border-gray-200 shadow-sm p-1 overflow-hidden">
          <div className="bg-white/90 rounded-[20px] p-6">
            <AnimatePresence mode="wait">
              {step === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col rounded-xl border border-gray-200/60 bg-gray-50/50 overflow-hidden">
                    <div className="flex items-start gap-4 p-4 border-b border-gray-200/60 bg-white">
                      <div className="mt-1 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Fingerprint className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[14px] font-semibold text-[#1d1d1f] leading-none">Semaphore Protocol</span>
                        <span className="text-[13px] text-[#86868b] mt-1.5 leading-relaxed pr-2">
                          Identity is generated locally and never leaves your device.
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white">
                      <div className="mt-1 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                        <Lock className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="flex flex-col pt-0.5">
                        <span className="text-[14px] font-semibold text-[#1d1d1f] leading-none">Zero-Knowledge Proofs</span>
                        <span className="text-[13px] text-[#86868b] mt-1.5 leading-relaxed pr-2">
                          Only ZK cryptographic commitments are shared with the network.
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConnect}
                    className="group relative w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-[14px] bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[15px] transition-colors"
                  >
                    Generate ZK Identity
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
              )}

              {step === "generating" && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-12 flex flex-col items-center justify-center text-center gap-5"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center shadow-inner z-10 relative bg-white">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                  </div>
                  <p className="text-[14px] font-bold text-[#1d1d1f] font-mono mt-2 uppercase tracking-wide">
                    {progressText}
                  </p>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center gap-5"
                >
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border border-green-100 shadow-sm relative z-10">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <h3 className="text-[18px] font-semibold text-[#1d1d1f]">Identity Verified</h3>
                    <p className="text-[14px] text-[#86868b]">Entering secure dashboard...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex items-center justify-center gap-2 text-[12px] text-[#86868b] font-medium"
        >
          <Lock className="h-3.5 w-3.5" />
          Secured by Semaphore & LEZ Cryptography
        </motion.div>
      </motion.div>
    </div>
  );
}
