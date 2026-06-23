import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { SmartAccountWalletClient } from '@shieldpass/sdk/dist/smartAccount'

interface SessionState {
  email: string
  name: string
  phone: string
  secretSalt: string | null
  merkleRoot: string | null
  wallet: SmartAccountWalletClient | null
  credentialId: string
  address: string | null // C-address smart wallet
  bvnVerified: boolean
}

export interface Session extends SessionState {
  onboarded: boolean
  set: (patch: Partial<SessionState>) => void
  reset: () => void
}

const EMPTY: SessionState = {
  email: '', name: '', phone: '',
  secretSalt: null, merkleRoot: null,
  wallet: null, credentialId: '', address: null,
  bvnVerified: false,
}

const STORAGE_KEY = 'shieldpass_session'

// Only serializable fields are persisted; the live `wallet` instance is re-created via
// SmartAccountWalletClient.connectWallet(credentialId) on reconnect.
type Persisted = Omit<SessionState, 'wallet'>

function loadPersisted(): SessionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const p = JSON.parse(raw) as Persisted
    return { ...EMPTY, ...p, wallet: null }
  } catch {
    return EMPTY
  }
}

function savePersisted(s: SessionState) {
  const { wallet: _wallet, ...rest } = s
  void _wallet
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rest)) } catch { /* ignore quota */ }
}

const SessionCtx = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(loadPersisted)

  // Re-hydrate + reconnect the wallet on page reload if a credentialId exists. Binding the kit to
  // the stored credential/contract is silent (no WebAuthn prompt) — the prompt happens at signing.
  useEffect(() => {
    if (state.credentialId && !state.wallet) {
      import('./smartAccount').then(({ makeWallet }) => {
        makeWallet().then(async w => {
          try { await w.connectWallet(state.credentialId, state.address ?? undefined) }
          catch (e) { console.error('[session] reconnect failed:', e) }
          setState(s => { const next = { ...s, wallet: w }; savePersisted(next); return next; })
        }).catch(console.error)
      }).catch(console.error)
    }
  }, [state.credentialId, state.wallet, state.address])

  const value: Session = {
    ...state,
    onboarded: !!(state.secretSalt && state.address),
    set: (patch) => setState((s) => { const next = { ...s, ...patch }; savePersisted(next); return next }),
    reset: () => { try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ } setState(EMPTY) },
  }
  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>
}

export function useSession(): Session {
  const ctx = useContext(SessionCtx)
  if (!ctx) throw new Error('useSession must be used within a SessionProvider')
  return ctx
}
