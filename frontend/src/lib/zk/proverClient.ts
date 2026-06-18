import type { WitnessInputs, ProofResult } from '../../types/zk.types';

export function createProofWorker(): Worker {
  return new Worker(new URL('../../workers/proof.worker.ts', import.meta.url), {
    type: 'module',
  });
}

export function generateProofInWorker(
  worker: Worker,
  inputs: WitnessInputs
): Promise<ProofResult> {
  return new Promise((resolve, reject) => {
    worker.postMessage({ type: 'GENERATE_PROOF', inputs });

    worker.onmessage = (e: MessageEvent) => {
      const { type, result, error } = e.data;
      if (type === 'PROOF_READY') {
        resolve(result as ProofResult);
      } else if (type === 'PROOF_ERROR') {
        reject(new Error(error));
      }
    };

    worker.onerror = (e) => reject(new Error(e.message));
  });
}

export function proofToHex(proof: Uint8Array): string {
  return Array.from(proof)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
