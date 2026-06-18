import type { AttestationSecret, WitnessInputs, PublicInputs } from '../../types/zk.types';
import { computeNullifier } from '../merkle/merklePath';

export function buildWitnessInputs(
  attestation: AttestationSecret,
  merkleRoot: string
): { witnessInputs: WitnessInputs; publicInputs: PublicInputs } {
  const currentTimestamp = Math.floor(Date.now() / 1000).toString();
  const nullifier = computeNullifier(attestation.secretSalt, currentTimestamp);

  const paddedPath = padArray(attestation.merklePath, 8, '0');
  const paddedIndices = padArray(
    attestation.merklePathIndices.map(String),
    8,
    '0'
  );

  const witnessInputs: WitnessInputs = {
    secret_salt: attestation.secretSalt,
    kyc_passed: '1',
    sanctions_clear: '1',
    country_eligible: '1',
    age_over_18: '1',
    expiry_timestamp: attestation.expiryTimestamp.toString(),
    merkle_path: paddedPath,
    merkle_path_indices: paddedIndices,
    merkle_root: merkleRoot,
    current_timestamp: currentTimestamp,
    nullifier,
  };

  const publicInputs: PublicInputs = {
    merkleRoot,
    currentTimestamp,
    nullifier,
  };

  return { witnessInputs, publicInputs };
}

function padArray(arr: string[], length: number, fill: string): string[] {
  const result = [...arr];
  while (result.length < length) result.push(fill);
  return result.slice(0, length);
}
