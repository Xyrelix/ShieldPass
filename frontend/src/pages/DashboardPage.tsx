import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { getTradeHistory } from "../lib/api";
import { getAccountBalances } from "../lib/stellar";
import WalletConnectButton from "../components/WalletConnectButton";
import type { Balance, TradeHistoryItem } from "../types";

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

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [balances, setBalances] = useState<Balance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balancesError, setBalancesError] = useState<string | null>(null);

  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    setBalancesLoading(true);
    setBalancesError(null);
    getAccountBalances(walletAddress)
      .then(setBalances)
      .catch((err) =>
        setBalancesError(
          err instanceof Error ? err.message : "Failed to load balances",
        ),
      )
      .finally(() => setBalancesLoading(false));

    setHistoryLoading(true);
    setHistoryError(null);
    getTradeHistory(walletAddress)
      .then(setHistory)
      .catch((err) =>
        setHistoryError(
          err instanceof Error ? err.message : "Failed to load trade history",
        ),
      )
      .finally(() => setHistoryLoading(false));
  }, [walletAddress]);

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
          className="flex flex-col md:flex-row md:items-baseline justify-between mb-10 gap-4"
        >
          <h1 className="geist-heading text-4xl md:text-5xl">Dashboard</h1>
          <Link
            to="/marketplace"
            className="outline-btn px-5 py-2.5 rounded-full font-mono text-xs flex items-center gap-2 group"
          >
            Marketplace
            <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-12">
          <WalletConnectButton
            connectedAddress={walletAddress}
            onConnect={setWalletAddress}
          />
        </motion.div>

        {!walletAddress && (
          <motion.div
            variants={fadeUp}
            className="outline-card rounded-[2rem] p-12 text-center"
          >
            <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="opacity-60">
              Connect your Stellar wallet to view on-chain balances and escrow history.
            </p>
          </motion.div>
        )}

        {walletAddress && (
          <>
            <motion.section variants={fadeUp} className="mb-12">
              <h2 className="geist-heading text-2xl mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg> 
                Balances
              </h2>

              {balancesLoading && (
                <div className="flex items-center gap-3 opacity-60 text-sm outline-card p-6 rounded-2xl">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Querying Horizon node…
                </div>
              )}
              {balancesError && (
                <p className="text-red-400 text-sm outline-card border-red-500/30 p-6 rounded-2xl">{balancesError}</p>
              )}

              {!balancesLoading && !balancesError && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {balances.length === 0 ? (
                    <div className="outline-card rounded-2xl p-8 text-center col-span-2">
                      <p className="opacity-60">
                        No balances on this account yet.
                      </p>
                    </div>
                  ) : (
                    balances.map((b) => (
                      <motion.div
                        key={b.assetCode}
                        variants={fadeUp}
                        className="outline-card rounded-2xl p-8"
                      >
                        <p className="font-mono text-xs opacity-50 mb-3 uppercase tracking-widest">
                          {b.assetCode}
                        </p>
                        <p className="geist-heading text-4xl">
                          {b.balance}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </motion.section>

            <motion.section variants={fadeUp}>
              <h2 className="geist-heading text-2xl mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Trade History
              </h2>

              {historyLoading && (
                <div className="flex items-center gap-3 opacity-60 text-sm outline-card p-6 rounded-2xl">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading trade history…
                </div>
              )}
              {historyError && (
                <p className="text-red-400 text-sm outline-card border-red-500/30 p-6 rounded-2xl">{historyError}</p>
              )}

              {!historyLoading && !historyError && history.length === 0 && (
                <div className="outline-card rounded-2xl p-8 text-center">
                  <p className="opacity-60">
                    No trades yet. Your escrow interactions will appear here.
                  </p>
                </div>
              )}

              {!historyLoading && !historyError && history.length > 0 && (
                <div className="outline-card rounded-2xl overflow-hidden divide-y divide-white/5">
                  {history.map((trade, i) => (
                    <motion.div
                      key={trade.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-white/[0.02] transition-colors gap-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-6 w-full">
                        <span className="font-mono text-xs uppercase tracking-widest opacity-50 w-16">
                          {trade.role}
                        </span>
                        <span className="geist-heading text-xl">
                          {trade.cryptoAmount} {trade.assetType}
                        </span>
                        <span className="font-mono text-sm opacity-60">
                          ₦{trade.nairaAmount}
                        </span>
                      </div>
                      <span
                        className={`font-mono text-xs px-3 py-1 rounded-full outline-style shadow-none ${
                          trade.status === "completed"
                            ? "text-green-400 border-green-400/20 bg-green-400/5"
                            : "opacity-60"
                        }`}
                      >
                        {trade.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </>
        )}
      </div>
    </motion.div>
  );
}
