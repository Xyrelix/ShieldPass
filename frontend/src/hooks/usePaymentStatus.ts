import { useQuery } from '@tanstack/react-query';
import { getPaymentStatus } from '../lib/api/paymentApi';
import { PROOF_POLLING_INTERVAL_MS } from '../utils/constant';
import { usePaymentStore } from '../store/usePaymentStore';

export function usePaymentStatus(paymentId: string | null) {
  const { setPaymentStatus } = usePaymentStore();

  return useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: async () => {
      const status = await getPaymentStatus(paymentId!);
      setPaymentStatus(status);
      return status;
    },
    enabled: !!paymentId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'settled' || status === 'failed') return false;
      return PROOF_POLLING_INTERVAL_MS;
    },
  });
}
