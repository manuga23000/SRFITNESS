import type { User } from 'firebase/auth'
import { createContext } from 'react'

export interface AuthState {
  user: User | null
  cargando: boolean
}

export const AuthContext = createContext<AuthState>({ user: null, cargando: true })

export interface ToastApi {
  ok: (mensaje: string) => void
  error: (mensaje: string) => void
  info: (mensaje: string) => void
}

export const ToastContext = createContext<ToastApi>({ ok: () => {}, error: () => {}, info: () => {} })
