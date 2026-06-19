import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { submitBvn, issueAttestation } from "../lib/api";
import type { ComplianceAttestation } from "../types";

type Stage = "form" | "submitting" | "issuing" | "done" | "error";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as any },
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
    <div className="flex items-center justify-center w-full py-12">
      <motion.div
        className="w-full max-w-lg outline-style rounded-[2rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-widest text-blue-400 mb-4"
        >
          Step 1 of 1
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="geist-heading text-3xl md:text-4xl mb-4"
        >
          Verify your identity
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="opacity-60 text-sm mb-10 leading-relaxed font-light"
        >
          This demo uses a mock BVN check. Enter any 10-digit number — in
          production this step calls a licensed provider like Paystack or Mono.
        </motion.p>

        {stage !== "done" && (
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="bvn"
                className="block text-sm opacity-80 mb-3"
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
                className="font-mono w-full outline-style rounded-xl px-5 py-4 text-white placeholder:text-white/30 focus:border-white/40 transition-colors outline-none"
              />
            </div>

            {stage === "error" && errorMessage && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm text-red-400"
              >
                {errorMessage}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={
                !isValidBvn || stage === "submitting" || stage === "issuing"
              }
              className="outline-btn primary w-full font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {(stage === "submitting" || stage === "issuing") && (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {stage === "submitting" && "Checking BVN…"}
              {stage === "issuing" && "Issuing attestation…"}
              {(stage === "form" || stage === "error") && "Continue to Protocol"}
            </button>
          </motion.form>
        )}

        {stage === "done" && attestation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="outline-card rounded-2xl p-6"
          >
            <p className="text-green-400 text-sm font-medium mb-6 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified — attestation issued
            </p>
            <dl className="space-y-4 font-mono text-xs opacity-80">
              <div>
                <dt className="mb-2 opacity-60">Merkle root</dt>
                <dd className="break-all outline-style p-3 rounded-lg bg-white/[0.02]">
                  {attestation.merkleRoot}
                </dd>
              </div>
              <div>
                <dt className="mb-2 opacity-60">Secret salt (kept on this device only)</dt>
                <dd className="break-all outline-style p-3 rounded-lg bg-white/[0.02]">
                  {attestation.secretSalt}
                </dd>
              </div>
            </dl>
            <button
              onClick={() => navigate("/marketplace")}
              className="outline-btn success mt-8 w-full font-semibold px-6 py-4 rounded-xl"
            >
              Enter Marketplace
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
