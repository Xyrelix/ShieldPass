import { useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { markPaymentSent } from "../lib/api";
import { releaseCrypto } from "../lib/stellar";
import WalletConnectButton from "../components/WalletConnectButton";
import type { BankDetails, P2POffer } from "../types";

type LocationState = {
  offer: P2POffer;
  nullifier: string;
  bankDetails: BankDetails;
};

type ReleaseStage = "idle" | "releasing" | "released" | "error";

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
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

export default function TradeRoomPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [paymentSent, setPaymentSent] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [markError, setMarkError] = useState<string | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [releaseStage, setReleaseStage] = useState<ReleaseStage>("idle");
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  if (!state) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <motion.div
          className="max-w-md w-full text-center outline-card rounded-3xl p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-blue-400 mb-3">
            Trade #{id}
          </p>
          <h1 className="geist-heading text-2xl md:text-3xl mb-4">
            Session Expired
          </h1>
          <p className="opacity-60 text-sm mb-8 leading-relaxed">
            Trade details live in this browser tab only for the demo. Head back to the
            marketplace and accept the offer again to open a new session.
          </p>
          <Link
            to="/marketplace"
            className="outline-btn w-full font-semibold px-6 py-4 rounded-xl inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </motion.div>
      </div>
    );
  }

  const { offer, nullifier, bankDetails } = state;
  const isSeller =
    walletAddress !== null && walletAddress === offer.sellerAddress;
  const nairaAmount = (
    parseFloat(offer.cryptoAmount) * parseFloat(offer.nairaRate)
  ).toLocaleString("en-NG", { maximumFractionDigits: 2 });

  async function handleMarkPaid() {
    setMarkError(null);
    setMarkingPaid(true);
    try {
      await markPaymentSent(offer.id);
      setPaymentSent(true);
    } catch (err) {
      setMarkError(
        err instanceof Error ? err.message : "Could not record payment.",
      );
    } finally {
      setMarkingPaid(false);
    }
  }

  async function handleRelease() {
    if (!walletAddress) return;
    setReleaseError(null);
    setReleaseStage("releasing");
    try {
      const { hash } = await releaseCrypto(offer.id, walletAddress);
      setTxHash(hash);
      setReleaseStage("released");
    } catch (err) {
      setReleaseStage("error");
      setReleaseError(err instanceof Error ? err.message : "Release failed.");
    }
  }

  return (
    <motion.div
      className="flex flex-col items-center w-full pb-20"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-3xl">
        <motion.div variants={fadeUp} className="mb-8">
          <Link
            to="/marketplace"
            className="outline-btn px-5 py-2.5 rounded-full font-mono text-xs inline-flex items-center gap-2 group"
          >
            <svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to marketplace
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-10 gap-4"
        >
          <h1 className="geist-heading text-4xl md:text-5xl">Trade Escrow</h1>
          <span className="font-mono text-xs opacity-50 outline-style px-3 py-1.5 rounded-md">
            ID: {offer.id}
          </span>
        </motion.div>

        {/* ── Escrow Details Card ── */}
        <motion.div
          variants={fadeUp}
          className="outline-card rounded-[2rem] p-8 mb-8"
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 font-mono text-sm">
            <div>
              <dt className="opacity-50 mb-1 uppercase tracking-widest text-[10px]">Crypto in escrow</dt>
              <dd className="geist-heading text-2xl">
                {offer.cryptoAmount} {offer.assetType}
              </dd>
            </div>
            <div className="sm:text-right">
              <dt className="opacity-50 mb-1 uppercase tracking-widest text-[10px]">Amount to pay</dt>
              <dd className="geist-heading text-2xl text-blue-400">₦{nairaAmount}</dd>
            </div>
            <div className="sm:col-span-2 pt-4 border-t border-white/10">
              <dt className="opacity-50 mb-2 uppercase tracking-widest text-[10px]">ZK Proof Nullifier</dt>
              <dd className="break-all opacity-80 bg-white/5 p-3 rounded-lg">
                {nullifier}
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* ── Send Naira Section ── */}
        <motion.section
          variants={fadeUp}
          className="outline-card rounded-[2rem] p-8 mb-8"
        >
          <h2 className="geist-heading text-2xl mb-2 flex items-center gap-3">
            <svg className="w-6 h-6 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Transfer Funds
          </h2>
          <p className="opacity-60 text-sm mb-8 leading-relaxed">
            Transfer <strong className="text-white">₦{nairaAmount}</strong> to the seller's account below, then confirm
            it's sent. Include trade <strong className="text-white">#{offer.id}</strong> as your transfer narration so
            the seller can match it.
          </p>
          
          <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
            <dl className="space-y-4 font-mono text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="opacity-50 text-[10px] uppercase tracking-widest">Bank</dt>
                <dd className="text-lg">{bankDetails.bankName}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="opacity-50 text-[10px] uppercase tracking-widest">Account name</dt>
                <dd className="text-lg">{bankDetails.accountName}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="opacity-50 text-[10px] uppercase tracking-widest">Account number</dt>
                <dd className="text-lg text-blue-400 tracking-wider">{bankDetails.accountNumber}</dd>
              </div>
            </dl>
          </div>

          {markError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-6 outline-style border-red-500/30 p-4 rounded-xl"
            >
              {markError}
            </motion.p>
          )}

          {!paymentSent ? (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className="outline-btn primary w-full font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {markingPaid ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Recording on-chain…
                </>
              ) : (
                "I've Sent the Payment"
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="outline-style border-green-500/30 bg-green-500/5 p-4 rounded-xl flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-400 text-sm font-medium">
                Marked as paid. Awaiting seller release.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* ── Release Crypto Section ── */}
        <motion.section
          variants={fadeUp}
          className="outline-card rounded-[2rem] p-8"
        >
          <h2 className="geist-heading text-2xl mb-2 flex items-center gap-3">
            <svg className="w-6 h-6 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Release Crypto
          </h2>
          <p className="opacity-60 text-sm mb-8 leading-relaxed">
            Seller only. Connect the wallet that created this offer once you've
            confirmed the Naira landed in your account. This is a one-way
            action with no dispute step in this demo.
          </p>

          <div className="mb-6">
            <WalletConnectButton
              connectedAddress={walletAddress}
              onConnect={setWalletAddress}
            />
          </div>

          {walletAddress && !isSeller && (
            <p className="opacity-60 text-sm outline-style p-4 rounded-xl">
              This wallet isn't the seller on this offer. Release controls disabled.
            </p>
          )}

          {releaseError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-6 outline-style border-red-500/30 p-4 rounded-xl"
            >
              {releaseError}
            </motion.p>
          )}

          {isSeller && releaseStage !== "released" && (
            <button
              onClick={handleRelease}
              disabled={releaseStage === "releasing"}
              className="outline-btn success w-full font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2"
            >
              {releaseStage === "releasing" ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Executing release contract…
                </>
              ) : (
                "Release Crypto to Buyer"
              )}
            </button>
          )}

          {releaseStage === "released" && txHash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 outline-style border-green-500/30 p-6 rounded-2xl"
            >
              <p className="text-green-400 text-sm font-medium mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Crypto successfully released
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="outline-btn px-4 py-2 rounded-lg font-mono text-xs opacity-80 hover:opacity-100"
                >
                  View on Stellar Expert
                </a>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="font-mono text-xs opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                >
                  Go to dashboard →
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}
