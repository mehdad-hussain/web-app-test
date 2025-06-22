import { StateStorage } from 'zustand/middleware'
import { AES, enc } from 'crypto-js'
import { env } from './env'

// This is a simplified wrapper and assumes the state can be stringified.
export const secureStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const data = localStorage.getItem(name)
    if (!data) return null

    try {
      const decrypted = AES.decrypt(data, env.VITE_STORAGE_ENCRYPTION_KEY).toString(enc.Utf8)
      if (decrypted) {
        return decrypted
      }
      return null
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    const encrypted = AES.encrypt(value, env.VITE_STORAGE_ENCRYPTION_KEY).toString()
    localStorage.setItem(name, encrypted)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
} 