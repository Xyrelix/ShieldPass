import { useCallback, useRef } from 'react';
import { createProofWorker, generateProofInWorker, proofToHex } from '../lib/zk/proverClient';
import { buildWitnessInputs } from '../lib/zk/witnessBuilder';
import { submitProof } from '../lib/api/complianceApi';
import { useProofStore } from '../store/useProofStore';
import { useAttestationStore } from '../store/useAttestationStore';

export function useProofGeneration() {
  const workerRef = useRef<Worker | null>(null);
  const { stage, txHash, error, setStage, setProofReady, setTxHash, setError, reset } =
    useProofStore();
  const { attestation, merkleRoot } = useAttestationStore();

  const generate = useCallback(async () => {
    if (!attestation || !merkleRoot) {
      setError('No valid compliance attestation found. Complete KYC first.');
      return;
    }

    reset();
    setStage('building_witness');

    try {
      const { witnessInputs, publicInputs } = buildWitnessInputs(attestation, merkleRoot);

      setStage('generating_proof');
      workerRef.current = createProofWorker();
      const { proof } = await generateProofInWorker(workerRef.current, witnessInputs);
      const proofHex = proofToHex(proof);
      setProofReady(proofHex, publicInputs);

      setStage('submitting');
      const { txHash } = await submitProof({ proof: proofHex, publicInputs });
      setTxHash(txHash);
      setStage('confirmed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Proof generation failed');
    } finally {
      workerRef.current?.terminate();
      workerRef.current = null;
    }
  }, [attestation, merkleRoot, setStage, setProofReady, setTxHash, setError, reset]);

  function cancel() {
    workerRef.current?.terminate();
    workerRef.current = null;
    reset();
  }

  return { stage, txHash, error, generate, cancel };
}
