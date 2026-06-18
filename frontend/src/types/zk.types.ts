export interface WitnessInputs {
  secret_salt: string;
  kyc_passed: string;
  sanctions_clear: string;
  country_eligible: string;
  age_over_18: string;
  expiry_timestamp: string;
  merkle_path: string[];
  merkle_path_indices: string[];
  merkle_root: string;
  current_timestamp: string;
  nullifier: string;
}

export interface ProofResult {
  proof: Uint8Array;
  publicInputs: string[];
}

export interface PublicInputs {
  merkleRoot: string;
  currentTimestamp: string;
  nullifier: string;
}

export type ProofStage =
  | 'idle'
  | 'building_witness'
  | 'generating_proof'
  | 'submitting'
  | 'confirmed'
  | 'error';

export interface AttestationSecret {
  secretSalt: string;
  merklePath: string[];
  merklePathIndices: number[];
  leafIndex: number;
  expiryTimestamp: number;
}
