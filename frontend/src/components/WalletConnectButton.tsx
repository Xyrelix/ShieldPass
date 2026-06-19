import { useState } from "react";
import { isConnected, isAllowed, setAllowed, getAddress } from "@stellar/freighter-api";

interface WalletConnectButtonProps {
  connectedAddress: string | null;
  onConnect: (address: string | null) => void;
}

export default function WalletConnectButton({
  connectedAddress,
  onConnect,
}: WalletConnectButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleToggleConnect() {
    if (connectedAddress) {
      onConnect(null);
      return;
    }

    setIsConnecting(true);
    try {
      if (await isConnected()) {
        const allowed = await isAllowed();
        if (!allowed) {
          await setAllowed();
        }
        const publicKey = await getAddress();
        onConnect(publicKey.address || null);
      } else {
        alert("Please install the Freighter wallet extension to connect.");
      }
    } catch (err) {
      console.error("Wallet connection rejected:", err);
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <button
      onClick={handleToggleConnect}
      disabled={isConnecting}
      className={`outline-btn font-mono text-[10px] sm:text-xs uppercase tracking-widest px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
        connectedAddress ? "opacity-70 hover:opacity-100" : "primary"
      }`}
    >
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
      {isConnecting && "Connecting Wallet…"}
      {!isConnecting &&
        connectedAddress &&
        `Disconnect: ${connectedAddress.slice(0, 6)}…${connectedAddress.slice(-4)}`}
      {!isConnecting && !connectedAddress && "Connect Stellar Wallet"}
    </button>
  );
}
