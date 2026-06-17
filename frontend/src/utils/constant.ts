export const STELLAR_NETWORK = (import.meta.env.VITE_STELLAR_NETWORK ?? 'TESTNET') as 'TESTNET' | 'MAINNET';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

export const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';

export const COMPLIANCE_REGISTRY_CONTRACT_ID =
  import.meta.env.VITE_COMPLIANCE_REGISTRY_CONTRACT_ID ?? '';

export const PAYMENT_GATEWAY_CONTRACT_ID =
  import.meta.env.VITE_PAYMENT_GATEWAY_CONTRACT_ID ?? '';

export const STELLAR_EXPERT_BASE_URL = 'https://stellar.expert/explorer/testnet/tx';

export const ELIGIBLE_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'NL', 'SE',
  'NO', 'DK', 'FI', 'CH', 'NZ', 'IE', 'AT', 'BE', 'ES', 'IT',
  'PT', 'PL', 'CZ', 'HU', 'RO', 'GR', 'AR', 'BR', 'MX', 'CO',
  'CL', 'PE', 'ZA', 'NG', 'KE', 'GH', 'IN', 'PH', 'TH', 'MY',
  'ID', 'VN', 'KR', 'TW', 'HK',
];

export const MERKLE_TREE_DEPTH = 8;

export const PROOF_POLLING_INTERVAL_MS = 3000;
