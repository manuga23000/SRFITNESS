import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { IconFile, IconHome, IconLogout, IconPlus, IconSettings, IconUserOff, IconUsers } from '../ui/icons'
import { Logo } from './Logo'

const items = [
  { to: '/', label: 'Inicio', Icon: IconHome, end: true },
  { to: '/socios', label: 'Socios', Icon: IconUsers, end: true },
  { to: '/socios/nuevo', label: 'Agregar socio', Icon: IconPlus, end: true },
  { to: '/inactivos', label: 'Inactivos', Icon: IconUserOff, end: true },
  { to: '/resumen', label: 'Resumen PDF', Icon: IconFile, end: true },
  { to: '/ajustes', label: 'Ajustes', Icon: IconSettings, end: true },
]

/** Navegación lateral para pantallas grandes (en el celu se usa la barra inferior). */
export function SideNav() {
  const { cerrarSesion, user } = useAuth()
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-ink-800 bg-ink-900/60 p-5 md:flex">
      <Logo />
      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-lime-neon/15 text-lime-neon ring-1 ring-lime-neon/40 ring-inset'
                  : 'text-ink-300 hover:bg-ink-800 hover:text-white'
              }`
            }
          >
            <Icon className="text-lg" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-ink-800 pt-4">
        <p className="mb-2 truncate px-1 text-xs text-ink-400">{user?.email}</p>
        <button
          onClick={() => cerrarSesion()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-ink-300 transition hover:bg-ink-800 hover:text-white"
        >
          <IconLogout className="text-lg" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
