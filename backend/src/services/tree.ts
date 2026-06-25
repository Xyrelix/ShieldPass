import path from 'path';
import { Networks, Keypair } from '@stellar/stellar-sdk';
import {
    IncrementalMerkleTree, buildInsertInput, prove, ShieldedPoolClient, fieldToBytes32,
} from '@shieldpass/sdk';
import { prisma } from '../db';

const CONTRACT_ID = process.env.STELLAR_CONTRACT_ID || '';
const RELAYER_SECRET = process.env.STELLAR_RELAYER_SECRET || '';
const RPC_URL = process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK = process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;

const INSERT_WASM = path.join(__dirname, '../../circuits/merkle_insert.wasm');
const INSERT_ZKEY = path.join(__dirname, '../../circuits/merkle_insert_final.zkey');
const DEPTH = 20;

/**
 * Server-side mirror of the on-chain commitment tree. It is the source of truth
 * for membership paths the browser needs (to build confidential_swap proofs) and
 * it advances the on-chain root by generating merkle_insert proofs — which the
 * contract verifies, so the backend cannot forge the tree.
 */
class TreeService {
    private tree = new IncrementalMerkleTree(DEPTH);
    private loaded = false;
    // Serializes all tree-advancing ops so concurrent requests can't race the
    // shared tree / leaf index (critical on a single Render instance).
    private chain: Promise<unknown> = Promise.resolve();

    private serialize<T>(fn: () => Promise<T>): Promise<T> {
        const run = this.chain.then(() => fn());
        this.chain = run.then(() => undefined, () => undefined); // keep the chain alive on error
        return run;
    }

    /** Rebuild the in-memory tree from persisted leaves (idempotent). */
    private async ensureLoaded(): Promise<void> {
        if (this.loaded) return;
        const leaves = await prisma.treeLeaf.findMany({ orderBy: { index: 'asc' } });
        for (const l of leaves) this.tree.setLeaf(l.index, BigInt(l.commitment));
        // restore the append cursor
        (this.tree as unknown as { count: number }).count = leaves.length;
        this.loaded = true;
    }

    async state(): Promise<{ root: string; nextIndex: number }> {
        await this.ensureLoaded();
        return { root: this.tree.root().toString(), nextIndex: this.tree.nextIndex };
    }

    /** Sibling path + index bits for the leaf at `index` (for membership proofs). */
    async pathFor(index: number): Promise<{ siblings: string[]; indices: string[]; root: string }> {
        await this.ensureLoaded();
        const siblings = this.tree.path(index).map(String);
        const indices: string[] = [];
        let idx = index;
        for (let i = 0; i < DEPTH; i++) { indices.push(String(idx & 1)); idx = Math.floor(idx / 2); }
        return { siblings, indices, root: this.tree.root().toString() };
    }

    /** Look up the index of a known commitment (so the client can fetch its path). */
    async indexOf(commitment: string): Promise<number | null> {
        const row = await prisma.treeLeaf.findFirst({ where: { commitment }, select: { index: true } });
        return row ? row.index : null;
    }

    /**
     * Append a commitment that has ALREADY been queued on-chain (deposit/faucet_seed/
     * confidential_swap change note). Saves to DB immediately and returns the leaf index.
     * The expensive on-chain insert() proof runs in the background to avoid OOM on
     * memory-constrained hosts (Render free tier = 512 MB; snarkjs can spike 300+ MB).
     */
    async appendAndInsert(commitment: bigint): Promise<{ index: number; root: string }> {
        return this.serialize(() => this._appendDb(commitment));
    }

    /** Fast path: mutate in-memory tree + write to DB. Returns immediately. */
    private async _appendDb(commitment: bigint): Promise<{ index: number; root: string }> {
        await this.ensureLoaded();
        const index = this.tree.nextIndex;
        const input = buildInsertInput(this.tree, commitment); // mutates tree
        const root = this.tree.root().toString();
        await prisma.treeLeaf.create({ data: { index, commitment: commitment.toString() } });

        // Run the expensive ZK proof + on-chain insert AFTER the HTTP response has been sent.
        // Fire-and-forget with one retry so transient failures don't silently drop inserts.
        if (CONTRACT_ID && RELAYER_SECRET) {
            setImmediate(() => this._submitInsertProof(input, commitment, index).catch(() => {}));
        }

        return { index, root };
    }

    /** Background: generate Groth16 proof and call pool.insert() on-chain. */
    private async _submitInsertProof(
        input: unknown, commitment: bigint, index: number, attempt = 1,
    ): Promise<void> {
        try {
            const { proof, publicSignals } = await prove(input as any, INSERT_WASM, INSERT_ZKEY);
            const pool = new ShieldedPoolClient(RPC_URL, NETWORK, CONTRACT_ID);
            const txHash = await pool.insert(proof, publicSignals, Keypair.fromSecret(RELAYER_SECRET));
            console.log(`[tree] on-chain insert ok commitment=${commitment} index=${index} tx=${txHash}`);
        } catch (err: any) {
            console.error(`[tree] on-chain insert attempt ${attempt} FAILED index=${index}:`, err?.message);
            if (attempt < 3) {
                // Retry after a short back-off so a temporary node hiccup doesn't drop the leaf.
                setTimeout(() => this._submitInsertProof(input, commitment, index, attempt + 1).catch(() => {}), 15_000 * attempt);
            } else {
                console.error(`[tree] giving up on on-chain insert for index=${index} after 3 attempts.`);
            }
        }
    }

    /**
     * Seed a faucet note: queue the commitment on-chain (faucet_seed, admin) and then
     * advance the tree (insert) — atomically, so the on-chain queue and tree stay in step.
     * Returns the leaf index the client uses to fetch its path.
     */
    async seedNote(commitment: bigint): Promise<{ index: number; root: string }> {
        return this.serialize(async () => {
            await this.ensureLoaded();
            if (CONTRACT_ID && RELAYER_SECRET) {
                const pool = new ShieldedPoolClient(RPC_URL, NETWORK, CONTRACT_ID);
                await pool.faucetSeed(fieldToBytes32(commitment), Keypair.fromSecret(RELAYER_SECRET));
            }
            const { index, root } = await this._append(commitment);
            return { index, root };
        });
    }
}

export const treeService = new TreeService();
