import { UserProfile } from '@/lib/auth-types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { logout as apiLogout } from '../lib/api'
import { secureStorage } from '../lib/secure-storage'

export type AuthState = {
  user: UserProfile | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'session_expired'
  actions: {
    setAccessToken: (tokens: { accessToken: string; status?: string }) => void
    setUser: (user: UserProfile) => void
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
        logout: async () => {
          await apiLogout()
          set({ user: null, accessToken: null, status: 'unauthenticated' })
        },
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