import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { STELLAR_NETWORK } from '../../utils/constant';

const network = STELLAR_NETWORK === 'TESTNET' ? Networks.TESTNET : Networks.PUBLIC;

StellarWalletsKit.init({
  modules: [new FreighterModule()],
  network,
  selectedWalletId: FREIGHTER_ID,
});

export async function openWalletModal(): Promise<string> {
  const { address } = await StellarWalletsKit.authModal();
  return address;
}

export async function getWalletAddress(): Promise<string> {
  const { address } = await StellarWalletsKit.getAddress();
  return address;
}

export async function signTransactionXdr(unsignedXdr: string, address: string): Promise<string> {
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(unsignedXdr, {
    address,
    networkPassphrase: network,
  });
  return signedTxXdr;
}

export async function signMessageForAuth(message: string, address: string): Promise<string> {
  const { signedMessage } = await StellarWalletsKit.signMessage(message, { address });
  return signedMessage;
}

export async function disconnectWallet(): Promise<void> {
  await StellarWalletsKit.disconnect();
}
