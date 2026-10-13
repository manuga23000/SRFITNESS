import { useEffect, useState, type ReactNode } from 'react'
import { escucharSesion } from '../services/authService'
import { AuthContext, type AuthState } from './contexts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, cargando: true })

  useEffect(() => escucharSesion((user) => setState({ user, cargando: false })), [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
