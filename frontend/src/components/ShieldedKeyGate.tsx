import { useState } from "react";
import { useSession } from "../lib/session";

/**
 * Inline unlock for the in-memory shielded key. After a page refresh the shielded
 * identity is gone (it is never persisted — see session.tsx), so spending/shielding is
 * disabled until the user re-derives it from their PIN. This re-runs the same PIN+email
 * derivation as login — NO passkey prompt — and self-hides once the key is unlocked.
 *
 * Drop it anywhere a flow needs the shielded key; it renders nothing when unlocked.
 */
export default function ShieldedKeyGate() {
  const session = useSession();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session.identity) return null;

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await session.unlockIdentityWithPin(pin);
      setPin("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock your shielded key.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={unlock} className="border border-amber-400/20 bg-amber-400/5 rounded-xl px-4 py-3 space-y-2">
      <p className="text-amber-400/80 text-xs">
        Shielded key locked — enter your PIN to unlock it (no passkey needed).
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="PIN"
          disabled={busy}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/40"
        />
        <button
          type="submit"
          disabled={busy || pin.length < 4}
          className="px-4 py-2 rounded-lg bg-amber-500/90 text-black text-sm font-medium hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? "Unlocking…" : "Unlock"}
        </button>
      </div>
      {error && <p className="text-red-400/80 text-xs">{error}</p>}
    </form>
  );
}
