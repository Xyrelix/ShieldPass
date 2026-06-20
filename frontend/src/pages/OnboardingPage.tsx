import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { submitBvn, issueAttestation } from "../lib/api";
import type { ComplianceAttestation } from "../types";

type Stage = "form" | "submitting" | "issuing" | "done" | "error";

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)", scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [bvn, setBvn] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attestation, setAttestation] = useState<ComplianceAttestation | null>(
    null,
  );

  const isValidBvn = /^\d{10}$/.test(bvn);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidBvn) return;

    setErrorMessage(null);
    setStage("submitting");

    try {
      const { accepted } = await submitBvn(bvn);
      if (!accepted) {
        setStage("error");
        setErrorMessage(
          "BVN could not be verified. Check the number and try again.",
        );
        return;
      }

      setStage("issuing");
      const result = await issueAttestation();
      localStorage.setItem("shieldpass_attestation", JSON.stringify(result));

      setAttestation(result);
      setStage("done");
    } catch (err) {
      setStage("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong during verification.",
      );
    }
  }

  return (
    <div className="flex items-center justify-center w-full py-12 relative z-10">
      <motion.div
        className="w-full max-w-lg glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative Internal Glow Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        <motion.p
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-widest text-indigo-400 mb-4 font-semibold"
        >
          Verification Protocol
        </motion.p>
        
        <motion.h1
          variants={fadeUp}
          className="geist-heading text-3xl md:text-4xl mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent font-medium"
        >
          Verify identity
        </motion.h1>
        
        <motion.p
          variants={fadeUp}
          className="text-white/60 text-sm mb-10 leading-relaxed font-light"
        >
          This demo uses a mock BVN check. Enter any 10-digit number — in
          production this step calls a licensed provider like Paystack or Mono.
        </motion.p>

        {stage !== "done" && (
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="space-y-6 relative z-10"
          >
            <div>
              <label
                htmlFor="bvn"
                className="block text-sm text-white/80 mb-3 font-medium"
              >
                Bank Verification Number
              </label>
              <input
                id="bvn"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={bvn}
                onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
                placeholder="2211XXXXXX"
                disabled={stage === "submitting" || stage === "issuing"}
                className="font-mono w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
              />
            </div>

            {stage === "error" && errorMessage && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-400 font-medium"
              >
                {errorMessage}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={
                !isValidBvn || stage === "submitting" || stage === "issuing"
              }
              className={`w-full font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-all duration-300 ${
                isValidBvn && stage !== "submitting" && stage !== "issuing"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  : "bg-white/5 text-white/40 cursor-not-allowed"
              }`}
            >
              {(stage === "submitting" || stage === "issuing") && (
                <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {stage === "submitting" && "Verifying BVN Record…"}
              {stage === "issuing" && "Computing ZK Attestation…"}
              {(stage === "form" || stage === "error") && "Continue to Protocol"}
            </button>
          </motion.form>
        )}

        {stage === "done" && attestation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="border border-green-500/20 bg-green-500/[0.02] rounded-2xl p-6 relative overflow-hidden"
          >
            {/* Ambient success glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <p className="text-green-400 text-sm font-semibold mb-6 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Verified — ZK Attestation Issued
            </p>
            <dl className="space-y-4 font-mono text-xs text-white/70">
              <div>
                <dt className="mb-2 text-white/40 uppercase tracking-wider text-[10px]">Merkle root</dt>
                <dd className="break-all border border-white/5 bg-white/[0.01] p-3.5 rounded-lg text-white font-mono select-all">
                  {attestation.merkleRoot}
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-white/40 uppercase tracking-wider text-[10px]">Secret salt (device-only)</dt>
                <dd className="break-all border border-white/5 bg-white/[0.01] p-3.5 rounded-lg text-white font-mono select-all">
                  {attestation.secretSalt}
                </dd>
              </div>
            </dl>
            <button
              onClick={() => navigate("/marketplace")}
              className="mt-8 w-full font-semibold px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Enter Marketplace
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
