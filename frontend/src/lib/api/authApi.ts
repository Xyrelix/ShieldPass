import { apiClient } from './apiClient';
import type { AuthChallengeResponse, AuthVerifyResponse } from '../../types/api.types';

export async function getChallenge(walletAddress: string): Promise<AuthChallengeResponse> {
  const { data } = await apiClient.post<AuthChallengeResponse>('/auth/challenge', {
    walletAddress,
  });
  return data;
}

export async function verifySignature(
  walletAddress: string,
  signedNonce: string
): Promise<AuthVerifyResponse> {
  const { data } = await apiClient.post<AuthVerifyResponse>('/auth/verify', {
    walletAddress,
    signedNonce,
  });
  return data;
}
