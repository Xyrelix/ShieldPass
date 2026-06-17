import { Horizon } from '@stellar/stellar-sdk';
import { HORIZON_URL } from '../../utils/constant';

const server = new Horizon.Server(HORIZON_URL);

export async function getAccountInfo(address: string) {
  return server.loadAccount(address);
}

export async function getTransactionDetails(txHash: string) {
  return server.transactions().transaction(txHash).call();
}

export async function pollTransactionStatus(
  txHash: string,
  maxAttempts = 20,
  intervalMs = 3000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const tx = await getTransactionDetails(txHash);
      if (tx.successful) return true;
    } catch {
      // transaction not yet indexed — keep polling
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}
