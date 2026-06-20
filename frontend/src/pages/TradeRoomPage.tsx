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
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

export default function TradeRoomPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try loading trade details from router state, fallback to localStorage
  const state = (location.state as LocationState | null) || (() => {
    if (!id) return null;
    const stored = localStorage.getItem(`shieldpass_trade_${id}`);
    return stored ? JSON.parse(stored) as LocationState : null;
  })();

  const [paymentSent, setPaymentSent] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [markError, setMarkError] = useState<string | null>(null);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [releaseStage, setReleaseStage] = useState<ReleaseStage>("idle");
  const [releaseError, setReleaseError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  function copyToClipboard(text: string, fieldName: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center w-full py-12 relative z-10">
        <motion.div
          className="max-w-md w-full text-center glass-panel rounded-3xl p-12 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          <p className="font-mono text-xs uppercase tracking-widest text-indigo-400 mb-3 font-semibold">
            Escrow Session #{id ? id.slice(0, 8) : "Invalid"}
          </p>
          <h1 className="geist-heading text-2xl md:text-3xl mb-4 text-white font-medium">
            Session Expired
          </h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed font-light">
            Trade details live in this browser tab only for the demo. Head back to the
            marketplace and accept the offer again to open a new session.
          </p>
          <Link
            to="/marketplace"
            className="w-full font-semibold px-6 py-4 rounded-xl inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
          >
            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      className="flex flex-col items-center w-full pt-4 sm:pt-6 pb-20 relative z-10"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      <div className="w-full max-w-3xl">
        <motion.div variants={fadeUp} className="mb-8">
          <Link
            to="/marketplace"
            className="px-5 py-2.5 rounded-full font-mono text-xs border border-white/10 bg-white/5 hover:bg-white/10 transition-all inline-flex items-center gap-2 group text-white/70 hover:text-white"
          >
            <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 sm:mb-10 gap-4"
        >
          <div>
            <h1 className="geist-heading text-3xl sm:text-4xl md:text-5xl bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent font-medium">
              Escrow Portal
            </h1>
            <p className="text-white/40 text-sm mt-2 font-light">
              Trustless cryptographic exchange of Naira for Stellar digital assets.
            </p>
          </div>
          <span className="font-mono text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-lg self-start sm:self-auto font-semibold">
            OFFER ID: {offer.id.slice(0, 8)}…
          </span>
        </motion.div>

        {/* ── Visual Escrow Stepper ── */}
        <motion.div variants={fadeUp} className="w-full mb-8">
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4">
              {/* Step 1 */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/35 flex items-center justify-center text-green-400 font-mono text-xs font-bold shadow shadow-green-500/15">
                  ✓
                </div>
                <div>
                  <h4 className="text-white text-sm font-medium">1. ZK Identity Verified</h4>
                  <p className="text-white/40 text-[10px] font-mono mt-0.5">PROOF VERIFIED</p>
                </div>
              </div>

              <div className="hidden md:block flex-1 h-[2px] bg-gradient-to-r from-green-500 to-indigo-500/40 opacity-30 mx-2" />

              {/* Step 2 */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {paymentSent ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/35 flex items-center justify-center text-green-400 font-mono text-xs font-bold shadow shadow-green-500/15">
                    ✓
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold animate-pulse shadow shadow-emerald-500/15">
                    2
                  </div>
                )}
                <div>
                  <h4 className="text-white text-sm font-medium">2. Naira Transfer</h4>
                  <p className="text-white/40 text-[10px] font-mono mt-0.5 uppercase">
                    {paymentSent ? "Settled / Sent" : "Pending Action"}
                  </p>
                </div>
              </div>

              <div className={`hidden md:block flex-1 h-[2px] mx-2 ${paymentSent ? "bg-gradient-to-r from-green-500 to-indigo-500/40 opacity-30" : "bg-white/5"}`} />

              {/* Step 3 */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {releaseStage === "released" ? (
                  <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/35 flex items-center justify-center text-green-400 font-mono text-xs font-bold shadow shadow-green-500/15">
                    ✓
                  </div>
                ) : paymentSent ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold animate-pulse shadow shadow-indigo-500/15">
                    3
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 font-mono text-xs font-bold">
                    3
                  </div>
                )}
                <div>
                  <h4 className="text-white text-sm font-medium">3. Escrow Released</h4>
                  <p className="text-white/40 text-[10px] font-mono mt-0.5 uppercase">
                    {releaseStage === "released" ? "Released" : "Escrow Locked"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Escrow Details Card ── */}
        <motion.div
          variants={fadeUp}
          className="glass-panel rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 mb-8 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.02] pointer-events-none">
            <svg className="w-48 h-48 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-green-500" />

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 font-mono text-sm relative z-10">
            <div>
              <dt className="text-white/45 mb-1.5 uppercase tracking-wider text-[10px] font-semibold">Crypto Locked in Escrow</dt>
              <dd className="geist-heading text-3xl font-light text-white">
                {offer.cryptoAmount} <span className="text-lg font-semibold text-white/50">{offer.assetType}</span>
              </dd>
            </div>
            <div className="sm:text-right">
              <dt className="text-white/45 mb-1.5 uppercase tracking-wider text-[10px] font-semibold">Fiat Settlement Amount</dt>
              <dd className="geist-heading text-3xl font-light text-emerald-400">₦{nairaAmount}</dd>
            </div>
            <div className="sm:col-span-2 pt-5 border-t border-white/5">
              <dt className="text-white/45 mb-2.5 uppercase tracking-wider text-[10px] font-semibold">Local ZK Proof Nullifier</dt>
              <dd className="break-all text-xs font-mono bg-white/[0.02] border border-white/5 p-3.5 rounded-xl text-white/80 select-all">
                {nullifier}
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* ── Send Naira Section ── */}
        <motion.section
          variants={fadeUp}
          className="glass-panel rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 mb-8 shadow-xl border border-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="geist-heading text-xl sm:text-2xl text-white font-medium">
              1. Transfer Settlement
            </h2>
          </div>
          
          <p className="text-white/60 text-sm mb-6 leading-relaxed font-light">
            Transfer <strong className="text-emerald-400">₦{nairaAmount}</strong> to the seller's verified bank account. 
            Ensure you include trade id <strong className="text-white font-mono">#{offer.id.slice(0, 8)}</strong> in your bank narration to prevent delays.
          </p>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 sm:p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            <dl className="space-y-4 font-mono text-sm relative z-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-3">
                <dt className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Receiving Institution</dt>
                <dd className="text-base text-white flex items-center gap-2">
                  {bankDetails.bankName}
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName, "bankName")}
                    className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white relative cursor-pointer"
                    title="Copy Bank Name"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-5 4h3" />
                    </svg>
                    {copiedField === "bankName" && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-[9px] bg-emerald-500 text-white rounded font-sans font-semibold shadow">
                        Copied!
                      </span>
                    )}
                  </button>
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-white/5 pb-3">
                <dt className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Account Holder</dt>
                <dd className="text-base text-white flex items-center gap-2">
                  {bankDetails.accountName}
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountName, "accountName")}
                    className="p-1 hover:bg-white/5 rounded transition-colors text-white/40 hover:text-white relative cursor-pointer"
                    title="Copy Account Name"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-5 4h3" />
                    </svg>
                    {copiedField === "accountName" && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 text-[9px] bg-emerald-500 text-white rounded font-sans font-semibold shadow">
                        Copied!
                      </span>
                    )}
                  </button>
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                <dt className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Account Number</dt>
                <dd className="text-lg text-emerald-400 tracking-widest font-semibold flex items-center gap-2">
                  {bankDetails.accountNumber}
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber, "accountNumber")}
                    className="p-1.5 hover:bg-white/5 rounded transition-colors text-emerald-400/70 hover:text-emerald-300 relative cursor-pointer"
                    title="Copy Account Number"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-5 4h5m-5 4h5m-5 4h3" />
                    </svg>
                    {copiedField === "accountNumber" && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 text-[9px] bg-emerald-500 text-white rounded font-sans font-semibold shadow tracking-normal">
                        Copied!
                      </span>
                    )}
                  </button>
                </dd>
              </div>
            </dl>
          </div>

          {markError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-6 border border-red-500/25 bg-red-500/[0.02] p-4 rounded-xl"
            >
              {markError}
            </motion.p>
          )}

          {!paymentSent ? (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              className={`w-full font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-all duration-300 ${
                markingPaid
                  ? "bg-white/5 text-white/40 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              }`}
            >
              {markingPaid ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Broadcasting status…
                </>
              ) : (
                "Confirm Payment Sent"
              )}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border border-green-500/20 bg-green-500/[0.02] p-5 rounded-2xl flex items-center gap-3.5"
            >
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
              </span>
              <p className="text-green-400 text-sm font-semibold">
                Naira payment flag set. Escrow awaits seller confirmation & key release.
              </p>
            </motion.div>
          )}
        </motion.section>

        {/* ── Release Crypto Section ── */}
        <motion.section
          variants={fadeUp}
          className="glass-panel rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 shadow-xl border border-white/5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="geist-heading text-xl sm:text-2xl text-white font-medium">
              2. Escrow Asset Release
            </h2>
          </div>
          
          <p className="text-white/60 text-sm mb-6 leading-relaxed font-light">
            <strong>Seller Action Only:</strong> Connect the Stellar address that created this escrow. 
            Once you confirm the Naira transfer has settled in your account, release the assets. This is cryptographically final.
          </p>

          <div className="mb-6">
            <WalletConnectButton
              connectedAddress={walletAddress}
              onConnect={setWalletAddress}
            />
          </div>

          {walletAddress && !isSeller && (
            <p className="text-white/50 text-xs border border-white/5 bg-white/[0.01] p-4 rounded-xl font-mono">
              Notice: The currently connected wallet address is not the registered owner of this offer. Release functions disabled.
            </p>
          )}

          {releaseError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-6 border border-red-500/25 bg-red-500/[0.02] p-4 rounded-xl"
            >
              {releaseError}
            </motion.p>
          )}

          {isSeller && releaseStage !== "released" && (
            <button
              onClick={handleRelease}
              disabled={releaseStage === "releasing"}
              className={`w-full font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-all duration-300 ${
                releaseStage === "releasing"
                  ? "bg-white/5 text-white/40 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              }`}
            >
              {releaseStage === "releasing" ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Executing Release Transaction…
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
              className="border border-green-500/25 bg-green-500/[0.01] p-6 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <p className="text-green-400 text-sm font-semibold mb-4 flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </span>
                Settlement Completed — Assets Released
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-mono text-xs text-white/80 hover:text-white text-center"
                >
                  Explorer Transaction Details
                </a>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="font-mono text-xs text-indigo-400 hover:text-indigo-300 transition-colors text-center py-2"
                >
                  Go to Dashboard →
                </button>
              </div>
            </motion.div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}
