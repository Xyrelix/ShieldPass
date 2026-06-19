import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { listOffers, acceptOffer, submitProof } from "../lib/api";
import { generateKycProof } from "../lib/proof";
import type { ComplianceAttestation, P2POffer } from "../types";

type AcceptingState = {
  offerId: string;
  phase: "proving" | "verifying";
} | null;

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

      navigate(`/trade/${offer.id}`, {
        state: { offer, nullifier: verification.nullifier, bankDetails },
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
      className="flex flex-col items-center w-full pb-20"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-4xl">
        <motion.div
          variants={fadeUp}
          className="flex flex-col md:flex-row md:items-baseline justify-between mb-12 gap-4"
        >
          <h1 className="geist-heading text-4xl md:text-5xl">Marketplace</h1>
          <p className="font-mono text-sm opacity-50 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md outline-style border-x-0 border-y-0 shadow-none">
            {offers.length} OPEN OFFERS
          </p>
        </motion.div>

        {loading && (
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 opacity-60 text-sm outline-style p-6 rounded-2xl"
          >
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Synchronizing order book…
          </motion.div>
        )}
        {loadError && (
          <motion.div variants={fadeUp} className="outline-style p-6 rounded-2xl border-red-500/30">
            <p className="text-red-400 text-sm">{loadError}</p>
          </motion.div>
        )}
        {acceptError && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="outline-style p-6 rounded-2xl border-red-500/30 mb-6"
          >
            <p className="text-red-400 text-sm">{acceptError}</p>
          </motion.div>
        )}

        {!loading && !loadError && offers.length === 0 && (
          <motion.div variants={fadeUp} className="outline-style p-10 rounded-3xl text-center">
            <p className="opacity-60">
              No open offers right now. Liquidity providers are inactive.
            </p>
          </motion.div>
        )}

        <div className="flex flex-col gap-4">
          {offers.map((offer) => {
            const isBusy = accepting?.offerId === offer.id;
            return (
              <motion.div
                key={offer.id}
                variants={fadeUp}
                className="outline-card interactive rounded-2xl flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6"
              >
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4 md:gap-8 w-full md:w-auto text-center md:text-left">
                  <span className="geist-heading text-3xl">
                    {offer.cryptoAmount} {offer.assetType}
                  </span>
                  <span className="font-mono text-sm opacity-60">
                    ₦{offer.nairaRate} / {offer.assetType}
                  </span>
                </div>
                <button
                  onClick={() => handleAccept(offer)}
                  disabled={isBusy || accepting !== null}
                  className="outline-btn primary w-full md:w-auto px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {isBusy && accepting?.phase === "proving" && (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating proof…
                    </>
                  )}
                  {isBusy && accepting?.phase === "verifying" && (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying on-chain…
                    </>
                  )}
                  {!isBusy && (
                    <>
                      Accept Offer
                      <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
