import { Spinner } from '../common/Spinner';

type IssuanceStage = 'submitting_kyc' | 'issuing_attestation';

interface IssuanceLoadingStateProps {
  stage: IssuanceStage;
}

const STAGE_LABELS: Record<IssuanceStage, string> = {
  submitting_kyc: 'Checking your details…',
  issuing_attestation: 'Generating your compliance pass…',
};

const STAGE_DESCRIPTIONS: Record<IssuanceStage, string> = {
  submitting_kyc: 'Our issuer is verifying your information against the sanctions list.',
  issuing_attestation:
    'Creating a cryptographic commitment. Your details are checked once and will never touch the blockchain.',
};

export function IssuanceLoadingState({ stage }: IssuanceLoadingStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <Spinner size="lg" />
      <h3 className="text-lg font-semibold text-gray-900">{STAGE_LABELS[stage]}</h3>
      <p className="max-w-sm text-sm text-gray-600">{STAGE_DESCRIPTIONS[stage]}</p>
    </div>
  );
}
