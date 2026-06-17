export interface AuthChallengeResponse {
  nonce: string;
}

export interface AuthVerifyResponse {
  token: string;
}

export interface KycSubmitPayload {
  fullName: string;
  dateOfBirth: string;
  countryCode: string;
}

export interface KycStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
}

export interface AttestationResponse {
  leafIndex: number;
  leafCommitment: string;
  secretSalt: string;
  merklePath: string[];
  merklePathIndices: number[];
  expiryTimestamp: number;
}

export interface ComplianceRootResponse {
  rootHash: string;
  version: number;
}

export interface ProofSubmitPayload {
  proof: string;
  publicInputs: {
    merkleRoot: string;
    currentTimestamp: string;
    nullifier: string;
  };
}

export interface ProofSubmitResponse {
  verified: boolean;
  txHash: string;
}

export interface PaymentInitiatePayload {
  recipientWallet: string;
  amount: string;
  asset: string;
  nullifierHash: string;
}

export interface PaymentInitiateResponse {
  id: string;
  status: 'pending' | 'verified' | 'settled' | 'failed';
}

export interface PaymentStatusResponse {
  id: string;
  status: 'pending' | 'verified' | 'settled' | 'failed';
  txHash?: string;
  recipientWallet: string;
  amount: string;
  asset: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
