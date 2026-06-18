import { create } from 'zustand';
import type { PaymentStatusResponse } from '../types/api.types';

interface PaymentState {
  activePaymentId: string | null;
  paymentStatus: PaymentStatusResponse | null;
  setActivePaymentId: (id: string | null) => void;
  setPaymentStatus: (status: PaymentStatusResponse) => void;
  clearPayment: () => void;
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  activePaymentId: null,
  paymentStatus: null,
  setActivePaymentId: (activePaymentId) => set({ activePaymentId }),
  setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
  clearPayment: () => set({ activePaymentId: null, paymentStatus: null }),
}));
