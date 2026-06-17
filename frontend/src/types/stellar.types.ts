export type StellarNetwork = 'TESTNET' | 'MAINNET';

export interface WalletState {
  address: string | null;
  connected: boolean;
}

export interface SignedTransaction {
  signedTxXdr: string;
}

export interface StellarTransaction {
  hash: string;
  ledger: number;
  createdAt: string;
  successful: boolean;
}

export interface PaymentRecord {
  id: string;
  recipientWallet: string;
  amount: string;
  asset: string;
  status: 'pending' | 'verified' | 'settled' | 'failed';
  txHash?: string;
  createdAt: string;
}
