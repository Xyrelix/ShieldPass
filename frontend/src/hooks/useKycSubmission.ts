import { useState } from 'react';
import { submitKyc } from '../lib/api/kycApi';
import { issueAttestation } from '../lib/api/complianceApi';
import { getComplianceRoot } from '../lib/api/complianceApi';
import { attestationToSecret } from '../lib/merkle/merklePath';
import { useAttestationStore } from '../store/useAttestationStore';
import type { KycSubmitPayload } from '../types/api.types';

type KycStage = 'idle' | 'submitting_kyc' | 'issuing_attestation' | 'complete' | 'error';

export function useKycSubmission() {
  const [stage, setStage] = useState<KycStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const { setAttestation, setMerkleRoot } = useAttestationStore();

  async function submit(payload: KycSubmitPayload) {
    setStage('submitting_kyc');
    setError(null);
    try {
      await submitKyc(payload);

      setStage('issuing_attestation');
      const attestationResponse = await issueAttestation();
      const secret = attestationToSecret(attestationResponse);
      setAttestation(secret);

      const { rootHash } = await getComplianceRoot();
      setMerkleRoot(rootHash);

      setStage('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'KYC submission failed');
      setStage('error');
    }
  }

  return { stage, error, submit };
}
