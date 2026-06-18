import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  walletAddress: string | null;
  token: string | null;
  setWalletAddress: (address: string | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      walletAddress: null,
      token: null,
      setWalletAddress: (address) => set({ walletAddress: address }),
      setToken: (token) => {
        if (token) localStorage.setItem('shieldpass_jwt', token);
        else localStorage.removeItem('shieldpass_jwt');
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('shieldpass_jwt');
        set({ walletAddress: null, token: null });
      },
    }),
    {
      name: 'shieldpass-auth',
      partialize: (s) => ({ walletAddress: s.walletAddress }),
    }
  )
);
