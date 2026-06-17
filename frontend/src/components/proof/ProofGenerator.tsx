import { Button } from '../common/Button';
import { ProofProgressIndicator } from './ProofProgressIndicator';
import { VerificationStepTracker } from './VerificationStepTracker';
import { useProofGeneration } from '../../hooks/useProofGeneration';

export function ProofGenerator() {
  const { stage, error, generate, cancel } = useProofGeneration();

  const isRunning = stage !== 'idle' && stage !== 'confirmed' && stage !== 'error';

  return (
    <div className="space-y-4">
      <VerificationStepTracker stage={stage} />
      <ProofProgressIndicator stage={stage} />

      {stage === 'error' && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? 'Proof generation failed. Please try again.'}
        </p>
      )}

      {stage === 'idle' || stage === 'error' ? (
        <Button size="lg" className="w-full" onClick={generate}>
          Generate proof &amp; send payment
        </Button>
      ) : isRunning ? (
        <Button variant="secondary" size="lg" className="w-full" onClick={cancel}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}
