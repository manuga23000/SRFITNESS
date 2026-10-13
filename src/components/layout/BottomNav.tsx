import { NavLink, useLocation } from 'react-router-dom'
import { IconHome, IconPlus, IconSettings, IconUsers } from '../ui/icons'

const items = [
  { to: '/', label: 'Inicio', Icon: IconHome },
  { to: '/socios', label: 'Socios', Icon: IconUsers },
  { to: '/socios/nuevo', label: 'Agregar', Icon: IconPlus },
  { to: '/ajustes', label: 'Ajustes', Icon: IconSettings },
]

/** "Socios" también queda marcado en el detalle de un socio, pero no en "Agregar". */
function esActivo(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/'
  if (to === '/socios')
    return (
      (pathname.startsWith('/socios') && pathname !== '/socios/nuevo') ||
      pathname === '/inactivos' ||
      pathname === '/recordatorios'
    )
  return pathname === to || pathname.startsWith(to + '/')
}

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/90 pb-safe backdrop-blur-xl md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ to, label, Icon }) => {
          const isActive = esActivo(to, pathname)
          return (
            <li key={to}>
              <NavLink
                to={to}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide uppercase transition ${
                  isActive ? 'text-lime-neon' : 'text-ink-400 active:text-white'
                }`}
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full text-[22px] transition-all duration-200 ${
                    isActive ? 'bg-lime-neon/15' : ''
                  }`}
                >
                  <Icon />
                </span>
                {label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
