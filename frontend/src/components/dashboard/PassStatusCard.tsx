import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { useComplianceAttestation } from '../../hooks/useComplianceAttestation';
import { formatExpiry } from '../../utils/formatters';

export function PassStatusCard() {
  const { hasValidAttestation, attestation, isExpired } = useComplianceAttestation();

  if (!attestation) {
    return (
      <Card>
        <p className="text-sm text-gray-500">No compliance pass found.</p>
        <p className="mt-1 text-xs text-gray-400">Complete onboarding to get your pass.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Compliance Pass</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Expires {formatExpiry(attestation.expiryTimestamp)}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            Leaf #{attestation.leafIndex} — Your identity was checked once and never stored on-chain.
          </p>
        </div>
        <Badge variant={hasValidAttestation ? 'green' : isExpired ? 'red' : 'yellow'}>
          {hasValidAttestation ? 'Active' : isExpired ? 'Expired' : 'Pending'}
        </Badge>
      </div>
    </Card>
  );
}
