import { useQuery } from '@tanstack/react-query';
import { getComplianceRoot } from '../lib/api/complianceApi';
import { useAttestationStore } from '../store/useAttestationStore';
import { isAttestationExpired } from '../lib/merkle/merklePath';

export function useComplianceAttestation() {
  const { attestation, merkleRoot } = useAttestationStore();

  const rootQuery = useQuery({
    queryKey: ['compliance-root'],
    queryFn: getComplianceRoot,
    refetchInterval: 60_000,
  });

  const isExpired = attestation ? isAttestationExpired(attestation.expiryTimestamp) : false;
  const hasValidAttestation = !!attestation && !isExpired;

  return {
    attestation,
    merkleRoot: rootQuery.data?.rootHash ?? merkleRoot,
    rootVersion: rootQuery.data?.version,
    hasValidAttestation,
    isExpired,
  };
}
