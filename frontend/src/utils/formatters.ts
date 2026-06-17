import { STELLAR_EXPERT_BASE_URL } from './constant';

export function truncateAddress(address: string, chars = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatAmount(amount: string, asset = 'USDC'): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `— ${asset}`;
  return `${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 7 })} ${asset}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatExpiry(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function stellarExpertUrl(txHash: string): string {
  return `${STELLAR_EXPERT_BASE_URL}/${txHash}`;
}

export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}
