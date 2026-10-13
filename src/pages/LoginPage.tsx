import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Logo } from '../components/layout/Logo'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { mensajeErrorAuth } from '../services/authService'

export function LoginPage() {
  const { user, iniciarSesion } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (user) {
    const destino = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={destino} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Completá email y contraseña')
      return
    }
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(email, password)
    } catch (err) {
      setError(mensajeErrorAuth(err))
      setEnviando(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-lime-neon/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 -bottom-48 h-80 w-80 rounded-full bg-lime-neon/10 blur-[110px]" />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="mb-10 flex justify-center">
          <Logo size="lg" />
        </div>

        <h1 className="font-display text-4xl tracking-wide">Entrá al panel</h1>
        <p className="mb-8 text-sm text-ink-400">Control de cuotas de los socios</p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              className="field"
              placeholder="profe@srfitness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="animate-pop rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              {error}
            </p>
          )}

          <Button type="submit" bloque cargando={enviando} className="mt-2 min-h-14 text-base tracking-wide uppercase">
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  )
}
