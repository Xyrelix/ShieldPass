import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { listOffers, acceptOffer, submitProof } from "../lib/api";
import { generateKycProof } from "../lib/proof";
import type { ComplianceAttestation, P2POffer } from "../types";

type AcceptingState = {
  offerId: string;
  phase: "proving" | "verifying";
} | null;

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
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<AcceptingState>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    listOffers()
      .then((data) => setOffers(data.filter((o) => o.status === "open")))
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : "Failed to load offers",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleAccept(offer: P2POffer) {
    setAcceptError(null);

    const stored = localStorage.getItem("shieldpass_attestation");
    if (!stored) {
      setAcceptError(
        "No attestation found on this device. Complete verification first.",
      );
      return;
    }
    const attestation: ComplianceAttestation = JSON.parse(stored);

    try {
      setAccepting({ offerId: offer.id, phase: "proving" });
      const proof = await generateKycProof({
        attestation,
        flags: { isHuman: 1, bvnVerified: 1, goodStanding: 1 },
      });

      setAccepting({ offerId: offer.id, phase: "verifying" });
      const verification = await submitProof(proof);
      if (!verification.verified) {
        throw new Error("Proof rejected by relayer.");
      }

      const { bankDetails } = await acceptOffer(
        offer.id,
        verification.nullifier,
      );

      const tradeData = { offer, nullifier: verification.nullifier, bankDetails };
      localStorage.setItem(`shieldpass_trade_${offer.id}`, JSON.stringify(tradeData));

      navigate(`/trade/${offer.id}`, {
        state: tradeData,
      });
    } catch (err) {
      setAcceptError(
        err instanceof Error ? err.message : "Failed to accept offer",
      );
    } finally {
      setAccepting(null);
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center w-full pt-4 sm:pt-6 pb-20 relative z-10"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-4xl">
        <motion.div
          variants={fadeUp}
          className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-4"
        >
          <div>
            <h1 className="geist-heading text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent font-medium">
              Marketplace
            </h1>
            <p className="text-white/40 text-sm mt-2 font-light">
              Accept private trustless trading offers using your locally stored ZK attestation.
            </p>
          </div>
          <p className="font-mono text-xs opacity-60 bg-white/[0.08] border border-white/10 px-4 py-2 rounded-full self-start md:self-auto">
            {offers.length} OPEN OFFERS
          </p>
        </motion.div>

        {loading && (
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 opacity-60 text-sm border border-white/5 bg-white/[0.01] p-6 rounded-2xl"
          >
            <svg className="w-5 h-5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Synchronizing order book…
          </motion.div>
        )}

        {loadError && (
          <motion.div variants={fadeUp} className="border border-red-500/20 bg-red-500/[0.02] p-6 rounded-2xl">
            <p className="text-red-400 text-sm font-medium">{loadError}</p>
          </motion.div>
        )}

        {acceptError && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="border border-red-500/20 bg-red-500/[0.02] p-6 rounded-2xl mb-6 flex items-center justify-between"
          >
            <p className="text-red-400 text-sm font-medium">{acceptError}</p>
            {!localStorage.getItem("shieldpass_attestation") && (
              <button
                onClick={() => navigate("/onboarding")}
                className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-all font-mono"
              >
                Go to Onboarding
              </button>
            )}
          </motion.div>
        )}

        {!loading && !loadError && offers.length === 0 && (
          <motion.div variants={fadeUp} className="glass-panel p-12 rounded-[2rem] text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white/50 text-sm">
              No open offers right now. Liquidity providers are inactive.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col gap-5">
          {offers.map((offer) => {
            const isBusy = accepting?.offerId === offer.id;
            return (
              <motion.div
                key={offer.id}
                variants={fadeUp}
                className="glass-panel glass-panel-interactive rounded-2xl flex flex-col md:flex-row items-center justify-between p-5 sm:p-6 md:p-8 gap-6"
              >
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full md:w-auto text-center sm:text-left">
                  {/* Styled crypto asset badge */}
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-indigo-400">
                      {offer.assetType.slice(0, 3)}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                      <span className="geist-heading text-3xl font-light">
                        {offer.cryptoAmount}
                      </span>
                      <span className="text-sm font-semibold text-white/55">
                        {offer.assetType}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-white/40 mt-1">
                      Rate: ₦{parseFloat(offer.nairaRate).toLocaleString()} / {offer.assetType}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="text-center sm:text-right font-mono text-xs text-white/50">
                    <div>Total Value</div>
                    <div className="text-white text-lg font-semibold mt-0.5">
                      ₦{(parseFloat(offer.cryptoAmount) * parseFloat(offer.nairaRate)).toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAccept(offer)}
                    disabled={isBusy || accepting !== null}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-white/10 transition-all duration-300 ${accepting !== null
                      ? "bg-white/5 text-white/40 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      }`}
                  >
                    Accept Offer
                    <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Cryptographic ZK Proof Modal ── */}
      <AnimatePresence>
        {accepting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-[#0d1117] border border-white/10 rounded-[2rem] p-8 text-center relative overflow-hidden shadow-2xl"
            >
              {/* Spinning technical vector background inside modal */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="w-64 h-64 border-2 border-dashed border-indigo-500 rounded-full animate-[spin_60s_linear_infinite]" />
              </div>

              {/* Glowing decorative background orb */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10">
                {/* Big custom animated shield circle */}
                <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-ping opacity-25" />
                  <svg className="w-10 h-10 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <h3 className="geist-heading text-2xl mb-3 text-white font-medium">
                  Zero-Knowledge Proof
                </h3>

                <p className="text-white/40 text-sm font-mono tracking-wider uppercase mb-8">
                  {accepting.phase === "proving" ? "Phase 1: Generating Proof" : "Phase 2: Verifying Relayer"}
                </p>

                {/* Progress message cards */}
                <div className="space-y-3 text-left font-mono text-xs border border-white/5 bg-white/[0.01] p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Local Identity Read</span>
                    <span className="text-green-400 font-semibold">SUCCESS</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Generate ZK Snark Proof</span>
                    {accepting.phase === "proving" ? (
                      <span className="text-indigo-400 animate-pulse font-semibold">COMPUTING…</span>
                    ) : (
                      <span className="text-green-400 font-semibold">SUCCESS</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Relayer On-chain Verify</span>
                    {accepting.phase === "proving" ? (
                      <span className="text-white/20">PENDING</span>
                    ) : (
                      <span className="text-indigo-400 animate-pulse font-semibold">VERIFYING…</span>
                    )}
                  </div>
                </div>

                <p className="text-white/50 text-xs mt-6 leading-relaxed font-light">
                  Your private credentials (BVN root & secret salt) never leave your browser. We are constructing a zero-knowledge membership proof locally to submit to the Stellar contract.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
