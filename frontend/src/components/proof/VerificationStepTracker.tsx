import { clsx } from 'clsx';
import type { ProofStage } from '../../types/zk.types';

interface VerificationStepTrackerProps {
  stage: ProofStage;
}

const STEPS: { key: ProofStage[]; label: string }[] = [
  { key: ['building_witness'], label: 'Prepare inputs' },
  { key: ['generating_proof'], label: 'Generate proof locally' },
  { key: ['submitting'], label: 'Submit to Stellar' },
  { key: ['confirmed'], label: 'Confirmed on-chain' },
];

function getStepStatus(
  stepKeys: ProofStage[],
  currentStage: ProofStage
): 'done' | 'active' | 'pending' {
  const order: ProofStage[] = [
    'idle',
    'building_witness',
    'generating_proof',
    'submitting',
    'confirmed',
  ];
  const currentIdx = order.indexOf(currentStage);
  const stepIdx = Math.max(...stepKeys.map((k) => order.indexOf(k)));

  if (currentIdx > stepIdx) return 'done';
  if (stepKeys.includes(currentStage)) return 'active';
  return 'pending';
}

export function VerificationStepTracker({ stage }: VerificationStepTrackerProps) {
  if (stage === 'idle' || stage === 'error') return null;

  return (
    <ol className="flex items-center gap-1 text-xs">
      {STEPS.map((step, i) => {
        const status = getStepStatus(step.key, stage);
        return (
          <li key={i} className="flex items-center gap-1">
            <span
              className={clsx('flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold', {
                'bg-green-500 text-white': status === 'done',
                'bg-indigo-600 text-white': status === 'active',
                'bg-gray-200 text-gray-500': status === 'pending',
              })}
            >
              {status === 'done' ? '✓' : i + 1}
            </span>
            <span
              className={clsx({
                'text-green-700': status === 'done',
                'font-semibold text-indigo-700': status === 'active',
                'text-gray-400': status === 'pending',
              })}
            >
              {step.label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 text-gray-300">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
