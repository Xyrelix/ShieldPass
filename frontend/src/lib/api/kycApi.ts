import { apiClient } from './apiClient';
import type { KycSubmitPayload, KycStatusResponse } from '../../types/api.types';

export async function submitKyc(payload: KycSubmitPayload): Promise<void> {
  await apiClient.post('/kyc/submit', payload);
}

export async function getKycStatus(): Promise<KycStatusResponse> {
  const { data } = await apiClient.get<KycStatusResponse>('/kyc/status');
  return data;
}
