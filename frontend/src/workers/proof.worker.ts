// bb.js v4 API: UltraHonkBackend.generateProof takes a compressed witness Uint8Array.
// To produce it, run the Noir circuit with @noir-lang/noir_js (Noir class), which returns
// the compressed witness. Install: npm install @noir-lang/noir_js @noir-lang/noirc_abi
// Then: const noir = new Noir(circuit); const { witness } = await noir.execute(inputs);

import { UltraHonkBackend, Barretenberg } from '@aztec/bb.js';
import circuit from '../circuits/kyc_proof.json';
import type { WitnessInputs, ProofResult } from '../types/zk.types';

type CircuitJson = { bytecode: string; abi: unknown };

let backend: UltraHonkBackend | null = null;

async function getBackend(): Promise<UltraHonkBackend> {
  if (!backend) {
    const api = await Barretenberg.new();
    const { bytecode } = circuit as CircuitJson;
    backend = new UltraHonkBackend(bytecode, api);
  }
  return backend;
}

// Placeholder: compresses named witness inputs into the binary format Noir expects.
// Replace with: const { witness } = await new Noir(circuit).execute(inputs);
// once @noir-lang/noir_js is installed and the compiled circuit JSON is in place.
function buildCompressedWitness(_inputs: WitnessInputs): Uint8Array {
  // TODO: wire up @noir-lang/noir_js here
  return new Uint8Array(0);
}

self.onmessage = async (e: MessageEvent) => {
  const { type, inputs } = e.data as { type: string; inputs: WitnessInputs };
  if (type !== 'GENERATE_PROOF') return;

  try {
    const b = await getBackend();
    const compressedWitness = buildCompressedWitness(inputs);
    const { proof, publicInputs } = await b.generateProof(compressedWitness);
    const result: ProofResult = { proof, publicInputs: publicInputs as unknown as string[] };
    self.postMessage({ type: 'PROOF_READY', result });
  } catch (err) {
    self.postMessage({
      type: 'PROOF_ERROR',
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
