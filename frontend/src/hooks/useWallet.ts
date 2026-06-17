import { useState } from 'react';
import { openWalletModal, signMessageForAuth, disconnectWallet } from '../lib/stellar/walletKit';
import { getChallenge, verifySignature } from '../lib/api/authApi';
import { useAuthStore } from '../store/useAuthStore';

export function useWallet() {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { walletAddress, token, setWalletAddress, setToken, logout } = useAuthStore();

  async function connect() {
    setConnecting(true);
    setError(null);
    try {
      const address = await openWalletModal();
      setWalletAddress(address);

      const { nonce } = await getChallenge(address);
      const signedNonce = await signMessageForAuth(nonce, address);
      const { token } = await verifySignature(address, signedNonce);
      setToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  }

  async function disconnect() {
    try {
      await disconnectWallet();
    } finally {
      logout();
    }
  }

  return {
    walletAddress,
    token,
    connected: !!walletAddress && !!token,
    connecting,
    error,
    connect,
    disconnect,
  };
}
