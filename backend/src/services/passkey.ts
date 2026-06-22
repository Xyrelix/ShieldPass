import { ChannelsClient } from '@openzeppelin/relayer-plugin-channels';

/**
 * Submit a passkey-signed transaction XDR gaslessly via the OpenZeppelin Channels relayer.
 *
 * We call ChannelsClient directly rather than going through passkey-kit's `PasskeyServer`:
 * passkey-kit ships raw TypeScript (`main: src/index.ts`, no compiled build) meant for a
 * bundler, so importing it under plain Node throws ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING.
 * `PasskeyServer.send()` is just a wrapper that calls `channelsClient.submitTransaction({ xdr })`,
 * and `@openzeppelin/relayer-plugin-channels` IS a compiled package, so we use it directly.
 *
 * Requires CHANNELS_URL / CHANNELS_API_KEY (OpenZeppelin Channels — the relayer that replaced
 * the discontinued Launchtube). Mercury is not involved in submission, so it's dropped here.
 */
export async function submitSigned(signedXdr: string): Promise<string> {
  const baseUrl = process.env.CHANNELS_URL;
  const apiKey = process.env.CHANNELS_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error('Channels relayer not configured (set CHANNELS_URL and CHANNELS_API_KEY).');
  }

  const client = new ChannelsClient({ baseUrl, apiKey });
  const res: any = await client.submitTransaction({ xdr: signedXdr });
  return res?.hash ?? res?.txHash ?? res?.id ?? String(res);
}
