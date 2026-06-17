import { apiClient } from './apiClient';
import type {
  PaymentInitiatePayload,
  PaymentInitiateResponse,
  PaymentStatusResponse,
} from '../../types/api.types';

export async function initiatePayment(
  payload: PaymentInitiatePayload
): Promise<PaymentInitiateResponse> {
  const { data } = await apiClient.post<PaymentInitiateResponse>('/payments/initiate', payload);
  return data;
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  const { data } = await apiClient.get<PaymentStatusResponse>(`/payments/${paymentId}/status`);
  return data;
}
