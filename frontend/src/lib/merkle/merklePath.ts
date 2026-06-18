import type { AttestationResponse } from '../../types/api.types';
import type { AttestationSecret } from '../../types/zk.types';

export function attestationToSecret(response: AttestationResponse): AttestationSecret {
  return {
    secretSalt: response.secretSalt,
    merklePath: response.merklePath,
    merklePathIndices: response.merklePathIndices,
    leafIndex: response.leafIndex,
    expiryTimestamp: response.expiryTimestamp,
  };
}

export function isAttestationExpired(expiryTimestamp: number): boolean {
  return Math.floor(Date.now() / 1000) >= expiryTimestamp;
}

/**
 * Placeholder nullifier computation matching the Noir circuit's poseidon hash.
 * Replace with the actual circomlibjs/noir poseidon binding once circuit is finalised.
 */
export function computeNullifier(secretSalt: string, currentTimestamp: string): string {
  // This is a temporary stand-in — replace with real Poseidon hash
  const combined = `${secretSalt}:${currentTimestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (Math.imul(31, hash) + combined.charCodeAt(i)) | 0;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
}
