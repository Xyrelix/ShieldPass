import { create } from 'zustand';
import type { AttestationSecret } from '../types/zk.types';

interface AttestationState {
  attestation: AttestationSecret | null;
  merkleRoot: string | null;
  setAttestation: (a: AttestationSecret) => void;
  setMerkleRoot: (root: string) => void;
  clearAttestation: () => void;
}

// Attestation data is stored only in memory — never persisted or logged.
// secret_salt exists here only for the duration of the user's session.
export const useAttestationStore = create<AttestationState>()((set) => ({
  attestation: null,
  merkleRoot: null,
  setAttestation: (attestation) => set({ attestation }),
  setMerkleRoot: (merkleRoot) => set({ merkleRoot }),
  clearAttestation: () => set({ attestation: null, merkleRoot: null }),
}));
