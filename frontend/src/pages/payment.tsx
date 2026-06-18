import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/common/Card';
import { PaymentForm } from '../components/payment/PaymentForm';
import { ProofGenerator } from '../components/proof/ProofGenerator';
import { TransactionExplorerLink } from '../components/payment/TransactionExplorerLink';
import { PaymentStatusTracker } from '../components/payment/PaymentStatusTracker';
import { useComplianceAttestation } from '../hooks/useComplianceAttestation';
import { useProofStore } from '../store/useProofStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { initiatePayment } from '../lib/api/paymentApi';
import type { PaymentInput } from '../utils/validators';
import { Button } from '../components/common/Button';

export default function PaymentPage() {
  const { hasValidAttestation } = useComplianceAttestation();
  const { stage, txHash } = useProofStore();
  const { activePaymentId, setActivePaymentId } = usePaymentStore();
  const navigate = useNavigate();
  const [pendingPayment, setPendingPayment] = useState<PaymentInput | null>(null);
  const [initiating, setInitiating] = useState(false);

  // Once proof is confirmed, initiate the payment automatically
  useEffect(() => {
    if (stage === 'confirmed' && txHash && pendingPayment && !activePaymentId && !initiating) {
      setInitiating(true);
      initiatePayment({
        recipientWallet: pendingPayment.recipientWallet,
        amount: pendingPayment.amount,
        asset: pendingPayment.asset,
        nullifierHash: txHash,
      })
        .then(({ id }) => setActivePaymentId(id))
        .finally(() => setInitiating(false));
    }
  }, [stage, txHash, pendingPayment, activePaymentId, initiating, setActivePaymentId]);

  if (!hasValidAttestation) {
    return (
      <PageContainer narrow>
        <Card className="text-center py-8 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">No compliance pass found</h2>
          <p className="text-gray-600 text-sm">
            You need a valid compliance pass before sending a payment.
          </p>
          <Button onClick={() => navigate('/onboarding')}>Get your pass</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer narrow>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Payment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your zero-knowledge proof will be generated in your browser before the payment is
            released.
          </p>
        </div>

        <Card>
          <PaymentForm
            onSubmit={(data) => setPendingPayment(data)}
            disabled={!!pendingPayment || stage !== 'idle'}
          />
        </Card>

        {pendingPayment && stage !== 'confirmed' && (
          <Card>
            <ProofGenerator />
          </Card>
        )}

        {stage === 'confirmed' && txHash && (
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-green-700">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">Proof verified on Stellar</span>
            </div>
            <TransactionExplorerLink txHash={txHash} />
            <p className="text-xs text-gray-500">
              Only a nullifier hash was recorded on-chain. No personal data was ever sent to the
              network.
            </p>
          </Card>
        )}

        {activePaymentId && (
          <Card>
            <PaymentStatusTracker paymentId={activePaymentId} />
          </Card>
        )}

        {stage === 'confirmed' && (
          <Button variant="secondary" className="w-full" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
