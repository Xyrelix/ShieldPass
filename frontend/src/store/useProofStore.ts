import { create } from 'zustand';
import type { ProofStage, PublicInputs } from '../types/zk.types';

interface ProofState {
  stage: ProofStage;
  publicInputs: PublicInputs | null;
  proofHex: string | null;
  txHash: string | null;
  error: string | null;
  setStage: (stage: ProofStage) => void;
  setProofReady: (proofHex: string, publicInputs: PublicInputs) => void;
  setTxHash: (hash: string) => void;
  setError: (err: string) => void;
  reset: () => void;
}

export const useProofStore = create<ProofState>()((set) => ({
  stage: 'idle',
  publicInputs: null,
  proofHex: null,
  txHash: null,
  error: null,
  setStage: (stage) => set({ stage }),
  setProofReady: (proofHex, publicInputs) => set({ proofHex, publicInputs }),
  setTxHash: (txHash) => set({ txHash }),
  setError: (error) => set({ error, stage: 'error' }),
  reset: () =>
    set({ stage: 'idle', publicInputs: null, proofHex: null, txHash: null, error: null }),
}));
