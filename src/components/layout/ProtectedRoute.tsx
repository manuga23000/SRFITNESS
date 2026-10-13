import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Logo } from './Logo'

export function ProtectedRoute() {
  const { user, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="animate-pulse">
          <Logo size="lg" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}
