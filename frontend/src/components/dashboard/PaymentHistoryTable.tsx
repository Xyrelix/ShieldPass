import { Badge } from '../common/Badge';
import { TransactionExplorerLink } from '../payment/TransactionExplorerLink';
import { formatAmount, formatDate, truncateAddress } from '../../utils/formatters';
import type { PaymentRecord } from '../../types/stellar.types';
import type { BadgeVariant } from '../common/Badge';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
}

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  pending: 'yellow',
  verified: 'blue',
  settled: 'green',
  failed: 'red',
};

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-gray-500">No payments yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Recipient', 'Amount', 'Status', 'Date', 'Transaction'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-mono text-xs text-gray-700">
                {truncateAddress(p.recipientWallet)}
              </td>
              <td className="px-4 py-3 text-gray-900">{formatAmount(p.amount, p.asset)}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[p.status] ?? 'gray'}>{p.status}</Badge>
              </td>
              <td className="px-4 py-3 text-gray-500">{formatDate(p.createdAt)}</td>
              <td className="px-4 py-3">
                {p.txHash ? <TransactionExplorerLink txHash={p.txHash} /> : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
