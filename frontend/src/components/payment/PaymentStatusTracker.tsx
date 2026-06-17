import { Badge } from '../common/Badge';
import { Spinner } from '../common/Spinner';
import { TransactionExplorerLink } from './TransactionExplorerLink';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { formatAmount } from '../../utils/formatters';
import type { BadgeVariant } from '../common/Badge';

interface PaymentStatusTrackerProps {
  paymentId: string;
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: 'yellow',
  verified: 'blue',
  settled: 'green',
  failed: 'red',
};

export function PaymentStatusTracker({ paymentId }: PaymentStatusTrackerProps) {
  const { data, isLoading, isError } = usePaymentStatus(paymentId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Spinner size="sm" /> Waiting for confirmation…
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">Failed to load payment status.</p>;
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700">
          {formatAmount(data.amount, data.asset)}
        </span>
        <Badge variant={STATUS_VARIANT[data.status] ?? 'gray'}>
          {data.status}
        </Badge>
      </div>
      {data.txHash && (
        <TransactionExplorerLink txHash={data.txHash} />
      )}
    </div>
  );
}
