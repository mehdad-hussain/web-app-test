import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { secureStorage } from '../lib/secure-storage'

type User = {
  id: string
  email: string
  name: string | null
}

export type AuthState = {
  user: User | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'session_expired'
  actions: {
    setAccessToken: (tokens: { accessToken: string; status?: string }) => void
    setUser: (user: User) => void
    logout: () => void
    setSessionExpired: () => void
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      status: 'idle',
      actions: {
        setAccessToken: (tokens) =>
          set({ 
            accessToken: tokens.accessToken, 
            status: tokens.status as AuthState['status'] || 'authenticated' 
          }),
        setUser: (user) => set((state) => ({ ...state, user })),
        logout: () =>
          set({ user: null, accessToken: null, status: 'unauthenticated' }),
        setSessionExpired: () =>
          set({ user: null, accessToken: null, status: 'session_expired' }),
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        status: state.status,
      }),
      onRehydrateStorage: (state) => {
        if (!state.accessToken) {
          state.status = 'unauthenticated'
        }
      },
    }
  )
)

export const useAuthActions = () => useAuthStore((state) => state.actions)