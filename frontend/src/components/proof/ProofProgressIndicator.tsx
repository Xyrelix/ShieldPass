import { Spinner } from '../common/Spinner';
import type { ProofStage } from '../../types/zk.types';

interface ProofProgressIndicatorProps {
  stage: ProofStage;
}

const STAGE_INFO: Record<Exclude<ProofStage, 'idle' | 'confirmed' | 'error'>, { label: string; description: string }> = {
  building_witness: {
    label: 'Preparing inputs…',
    description: 'Assembling your private compliance data locally.',
  },
  generating_proof: {
    label: 'Generating zero-knowledge proof locally',
    description:
      'This runs entirely in your browser. Your identity, documents, and compliance flags never leave your device.',
  },
  submitting: {
    label: 'Verifying on Stellar…',
    description: 'Sending only the cryptographic proof and a nullifier hash to the network.',
  },
};

export function ProofProgressIndicator({ stage }: ProofProgressIndicatorProps) {
  if (stage === 'idle' || stage === 'confirmed' || stage === 'error') return null;

  const info = STAGE_INFO[stage];

  return (
    <div className="flex items-start gap-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
      <Spinner size="sm" className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-indigo-800">{info.label}</p>
        <p className="mt-0.5 text-xs text-indigo-600">{info.description}</p>
      </div>
    </div>
  );
}
