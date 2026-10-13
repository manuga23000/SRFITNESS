import { useContext } from 'react'
import { AuthContext } from '../context/contexts'
import { cerrarSesion, iniciarSesion } from '../services/authService'

export function useAuth() {
  const { user, cargando } = useContext(AuthContext)
  return { user, cargando, iniciarSesion, cerrarSesion }
}
