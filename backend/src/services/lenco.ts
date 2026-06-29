import { fiatMode, fiatModeError } from './fiatMode';

/**
 * Lenco Business Banking outward NGN payouts.
 *
 * Mock payouts are only enabled when FIAT_MODE=mock. In live mode, the Lenco key
 * and account id are required so real deployments cannot silently simulate fiat.
 */

const LENCO_API_KEY = process.env.LENCO_API_KEY || '';
const LENCO_API_URL = process.env.LENCO_API_URL || 'https://api.lenco.co/access/v1';
const LENCO_ACCOUNT_ID = process.env.LENCO_ACCOUNT_ID || '';

export interface LencoTransferInput {
  amountNaira: number;
  accountNumber: string;
  bankName: string;
  accountName: string;
  bankCode?: string;
  reference: string;
}

export interface LencoTransferResult {
  ok: boolean;
  transferId: string;
  status: 'successful' | 'pending' | 'failed';
  error?: string;
}

export async function initiateTransfer(input: LencoTransferInput): Promise<LencoTransferResult> {
  if (!(input.amountNaira > 0)) return { ok: false, transferId: '', status: 'failed', error: 'Amount must be positive.' };
  if (!input.accountNumber) return { ok: false, transferId: '', status: 'failed', error: 'accountNumber is required.' };

  const mode = fiatMode();
  if (!mode) return { ok: false, transferId: '', status: 'failed', error: fiatModeError('Lenco') };

  if (mode === 'mock') {
    const transferId = `mock_lenco_${input.reference}_${Date.now()}`;
    console.log(`[lenco] MOCK transfer NGN ${input.amountNaira} -> ${input.bankName} ${input.accountNumber} (${input.accountName})`);
    return { ok: true, transferId, status: 'successful' };
  }

  if (!LENCO_API_KEY || !LENCO_ACCOUNT_ID) {
    return { ok: false, transferId: '', status: 'failed', error: 'LENCO_API_KEY and LENCO_ACCOUNT_ID are required when FIAT_MODE=live.' };
  }

  try {
    const res = await fetch(`${LENCO_API_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LENCO_API_KEY}` },
      body: JSON.stringify({
        accountId: LENCO_ACCOUNT_ID,
        amount: input.amountNaira,
        currency: 'NGN',
        narration: `ShieldPass swap ${input.reference}`,
        reference: input.reference,
        recipient: {
          accountNumber: input.accountNumber,
          bankCode: input.bankCode,
          accountName: input.accountName,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, transferId: '', status: 'failed', error: data?.message || `Lenco error ${res.status}` };
    }
    const tx = data?.data ?? data;
    const status = (tx?.status as LencoTransferResult['status']) || 'pending';
    return { ok: status !== 'failed', transferId: String(tx?.id || tx?.reference || input.reference), status };
  } catch (err) {
    return { ok: false, transferId: '', status: 'failed', error: err instanceof Error ? err.message : String(err) };
  }
}
