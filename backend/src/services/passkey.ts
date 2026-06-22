import { ChannelsClient } from '@openzeppelin/relayer-plugin-channels';
import { Keypair, Transaction, TransactionBuilder, hash, rpc, xdr } from '@stellar/stellar-sdk';

const NETWORK = process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';

// passkey-kit builds its transactions with this deterministic, PUBLIC placeholder as the source
// account: Keypair.fromRawEd25519Seed(hash('kalepail')). We re-sign with it after rewriting fees.
const WALLET_KEYPAIR = Keypair.fromRawEd25519Seed(hash(Buffer.from('kalepail')));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** True if the tx is a Soroban contract creation (wallet deploy) rather than a contract invoke. */
function isContractCreate(tx: Transaction): boolean {
  try {
    if (tx.operations.length !== 1) return false;
    const op = tx.operations[0] as any;
    if (op.type !== 'invokeHostFunction') return false;
    return op.func.switch().name.toLowerCase().includes('createcontract');
  } catch {
    return false;
  }
}

/**
 * Channels requires a Soroban tx's `fee` to equal EXACTLY its resource fee (it covers the
 * inclusion fee). stellar-sdk assembles fee = resourceFee + inclusion (~2×), so we rewrite the
 * fee down to the resource fee and re-sign. Used only for the (cheap) gasless invoke path.
 */
function matchFeeToResourceFee(signedXdr: string): string {
  const env = new Transaction(signedXdr, NETWORK).toEnvelope();
  if (env.switch() !== xdr.EnvelopeType.envelopeTypeTx()) return signedXdr;
  const v1 = env.v1();
  const inner = v1.tx();
  if (inner.ext().switch() !== 1) return signedXdr; // 1 === SorobanTransactionData present

  const resourceFee = Number(inner.ext().sorobanData().resourceFee().toString());
  if (!Number.isSafeInteger(resourceFee) || resourceFee > 0xffffffff) return signedXdr;
  if (inner.fee() === resourceFee) return signedXdr;

  inner.fee(resourceFee);
  v1.signatures([]);
  const rebuilt = new Transaction(env, NETWORK);
  rebuilt.sign(WALLET_KEYPAIR);
  return rebuilt.toXDR();
}

/** Gasless invoke (trades): submit via OpenZeppelin Channels (cheap, under the relayer fee cap). */
async function submitViaChannels(signedXdr: string): Promise<string> {
  const baseUrl = process.env.CHANNELS_URL;
  const apiKey = process.env.CHANNELS_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('Channels relayer not configured (set CHANNELS_URL and CHANNELS_API_KEY).');
  }
  const client = new ChannelsClient({ baseUrl, apiKey });
  const res: any = await client.submitTransaction({ xdr: matchFeeToResourceFee(signedXdr) });
  return res?.hash ?? res?.txHash ?? res?.id ?? String(res);
}

/**
 * Wallet deploy: the Soroban resource fee (~108 XLM, mostly persistent-entry rent) exceeds the
 * Channels per-tx fee cap, and it can't be trimmed. So we fee-bump the deploy with our own funded
 * account (STELLAR_RELAYER_SECRET) and submit directly to RPC. The inner tx is untouched — its
 * `kalepail` source (which determines the contract address) and signature stay intact — so the
 * deployed contractId still matches what the client computed.
 */
async function submitDeployViaRelayer(inner: Transaction): Promise<string> {
  const secret = process.env.STELLAR_RELAYER_SECRET;
  if (!secret) throw new Error('STELLAR_RELAYER_SECRET not set — required to fund wallet deploys.');
  const relayer = Keypair.fromSecret(secret);

  // fee-bump base fee per inner op; total = baseFee × (innerOps + 1) ≥ inner.fee. The unused
  // Soroban resource fee is refunded to the fee-bump source, so over-provisioning is safe.
  const feeBump = TransactionBuilder.buildFeeBumpTransaction(relayer, inner.fee, inner, NETWORK);
  feeBump.sign(relayer);

  const server = new rpc.Server(RPC_URL);
  const sent = await server.sendTransaction(feeBump);
  if (sent.status === 'ERROR') {
    throw new Error(`deploy submit rejected: ${JSON.stringify(sent.errorResult ?? sent)}`);
  }

  let result = await server.getTransaction(sent.hash);
  for (let i = 0; i < 15 && result.status === rpc.Api.GetTransactionStatus.NOT_FOUND; i++) {
    await sleep(1000);
    result = await server.getTransaction(sent.hash);
  }
  if (result.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
    throw new Error(`deploy did not succeed (status: ${result.status})`);
  }
  return sent.hash;
}

/**
 * Submit a passkey-signed transaction XDR. Wallet deploys are fee-bumped + paid by our funded
 * account (the deploy's resource fee exceeds the Channels cap); everything else goes gaslessly
 * through Channels. We call ChannelsClient directly because passkey-kit ships raw TypeScript that
 * crashes under plain Node (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING).
 */
export async function submitSigned(signedXdr: string): Promise<string> {
  const tx = new Transaction(signedXdr, NETWORK);
  return isContractCreate(tx) ? submitDeployViaRelayer(tx) : submitViaChannels(signedXdr);
}
