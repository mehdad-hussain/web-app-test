import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  email: string
  name: string | null
}

type AuthState = {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  actions: {
    setTokens: (tokens: { accessToken: string; refreshToken: string }) => void
    setUser: (user: User) => void
    logout: () => void
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      actions: {
        setTokens: (tokens) =>
          set({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }),
        setUser: (user) => set({ user }),
        logout: () =>
          set({ user: null, accessToken: null, refreshToken: null }),
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)

export const useAuthActions = () => useAuthStore((state) => state.actions)
