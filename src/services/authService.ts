import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function escucharSesion(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export async function iniciarSesion(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function cerrarSesion() {
  await signOut(auth)
}

export function mensajeErrorAuth(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contraseña incorrectos'
    case 'auth/invalid-email':
      return 'El email no es válido'
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y probá de nuevo'
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisá tu internet'
    case 'auth/user-disabled':
      return 'Este usuario está deshabilitado'
    default:
      return 'No se pudo iniciar sesión'
  }
}
