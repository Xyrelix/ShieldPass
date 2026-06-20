import type { ComplianceAttestation, P2POffer, TradeHistoryItem, BankDetails } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `API error: ${res.status}`);
  }
  return res.json();
}

// ── Local Mock Storage Engine Helpers ──
const isOfflineError = (err: any): boolean => {
  return err instanceof TypeError || (err instanceof Error && err.message.includes('Failed to fetch'));
};

const getMockOffers = (): P2POffer[] => {
  const stored = localStorage.getItem('shieldpass_mock_offers');
  if (stored) return JSON.parse(stored);

  // Default offers
  const defaults: P2POffer[] = [
    {
      id: 'offer-1-usdc-stellar',
      sellerId: 'seller-1',
      sellerAddress: 'GD3B24F7N...XLM2USDC',
      cryptoAmount: '80.00',
      assetType: 'USDC',
      nairaRate: '1720.00',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'offer-2-xlm-stellar',
      sellerId: 'seller-2',
      sellerAddress: 'GA4N39DL8...XLM5NATIVE',
      cryptoAmount: '250.00',
      assetType: 'XLM',
      nairaRate: '1450.00',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'offer-3-usdc-stellar',
      sellerId: 'seller-3',
      sellerAddress: 'GC7P15BK9...XLM9USDC',
      cryptoAmount: '35.00',
      assetType: 'USDC',
      nairaRate: '1700.00',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem('shieldpass_mock_offers', JSON.stringify(defaults));
  return defaults;
};

const saveMockOffers = (offers: P2POffer[]) => {
  localStorage.setItem('shieldpass_mock_offers', JSON.stringify(offers));
};

const getMockTradeHistory = (): TradeHistoryItem[] => {
  const stored = localStorage.getItem('shieldpass_mock_trade_history');
  if (stored) return JSON.parse(stored);

  // Initialize with one completed default trade so it isn't completely empty
  const defaults: TradeHistoryItem[] = [
    {
      id: 'trade-init-1',
      role: 'buyer',
      cryptoAmount: '20.00',
      assetType: 'USDC',
      nairaAmount: '34400',
      status: 'completed',
    },
  ];
  localStorage.setItem('shieldpass_mock_trade_history', JSON.stringify(defaults));
  return defaults;
};

const addMockTrade = (trade: TradeHistoryItem) => {
  const history = getMockTradeHistory();
  // Filter out any duplicates
  const updated = [trade, ...history.filter(h => h.id !== trade.id)];
  localStorage.setItem('shieldpass_mock_trade_history', JSON.stringify(updated));
};

const updateMockTradeStatus = (tradeId: string, status: 'open' | 'locked' | 'completed') => {
  const history = getMockTradeHistory();
  const updated = history.map(t => t.id === tradeId ? { ...t, status } : t);
  localStorage.setItem('shieldpass_mock_trade_history', JSON.stringify(updated));
};


// 1. Onboarding & KYC Endpoints
export async function submitBvn(bvn: string): Promise<{ accepted: boolean }> {
  try {
    return await request<{ accepted: boolean }>('/kyc/submit-bvn', {
      method: 'POST',
      body: JSON.stringify({ bvn }),
    });
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock BVN validation.');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { accepted: true };
    }
    throw err;
  }
}

export async function issueAttestation(): Promise<ComplianceAttestation> {
  try {
    return await request<ComplianceAttestation>('/compliance/issue-attestation', {
      method: 'POST',
    });
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock compliance attestation.');
      await new Promise((resolve) => setTimeout(resolve, 800));
      return {
        merkleRoot: '0x3f5c9e2b1d8a4f6e8c9d0b2a7f5e3d1c4b8a2f9c5d0e7a1b3c5e8f0a2d4f6b8c',
        secretSalt: '0x8f7c9b0a1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
      };
    }
    throw err;
  }
}

// 2. ZK Relayer Endpoints
export async function submitProof(proof: string): Promise<{ verified: boolean; nullifier: string }> {
  try {
    return await request<{ verified: boolean; nullifier: string }>('/verify/submit-proof', {
      method: 'POST',
      body: JSON.stringify({ proof }),
    });
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock proof verification.');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const mockNullifier = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return { verified: true, nullifier: mockNullifier };
    }
    throw err;
  }
}

// 3. P2P Core Orderbook Endpoints
export async function listOffers(): Promise<P2POffer[]> {
  try {
    return await request<P2POffer[]>('/p2p/offers');
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock orderbook offers.');
      return getMockOffers();
    }
    throw err;
  }
}

export async function acceptOffer(offerId: string, nullifier: string): Promise<{ bankDetails: BankDetails }> {
  try {
    return await request<{ bankDetails: BankDetails }>(`/p2p/offers/${offerId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ nullifier }),
    });
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock offer acceptance.');
      const offers = getMockOffers();
      const updated = offers.map(o => o.id === offerId ? { ...o, status: 'locked' as const } : o);
      saveMockOffers(updated);

      const acceptedOffer = offers.find(o => o.id === offerId);
      if (acceptedOffer) {
        addMockTrade({
          id: offerId,
          role: 'buyer',
          cryptoAmount: acceptedOffer.cryptoAmount,
          assetType: acceptedOffer.assetType,
          nairaAmount: (parseFloat(acceptedOffer.cryptoAmount) * parseFloat(acceptedOffer.nairaRate)).toString(),
          status: 'locked',
        });
      }

      return {
        bankDetails: {
          bankName: 'Moniepoint Microfinance Bank',
          accountName: 'ShieldPass Escrow Node #49',
          accountNumber: '5049382103',
        },
      };
    }
    throw err;
  }
}

export async function markPaymentSent(offerId: string): Promise<{ success: boolean }> {
  try {
    return await request<{ success: boolean }>(`/p2p/offers/${offerId}/pay`, {
      method: 'POST',
    });
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock payment notification.');
      updateMockTradeStatus(offerId, 'locked'); // Remains locked verification by seller
      return { success: true };
    }
    throw err;
  }
}

export async function getTradeHistory(walletAddress: string): Promise<TradeHistoryItem[]> {
  try {
    return await request<TradeHistoryItem[]>(`/p2p/history?address=${walletAddress}`);
  } catch (err) {
    if (isOfflineError(err)) {
      console.warn('API offline. Falling back to local mock trade ledger.');
      return getMockTradeHistory();
    }
    throw err;
  }
}