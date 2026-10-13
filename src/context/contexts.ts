import type { User } from 'firebase/auth'
import { createContext } from 'react'
import type { Socio, SocioConEstado } from '../types'

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

export interface SociosState {
  socios: Socio[]
  cargando: boolean
  error: Error | null
}

export const SociosContext = createContext<SociosState>({ socios: [], cargando: true, error: null })

export interface PagoModalApi {
  abrirPago: (socio: SocioConEstado) => void
}

export const PagoModalContext = createContext<PagoModalApi>({ abrirPago: () => {} })
