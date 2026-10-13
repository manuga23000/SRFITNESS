import { NavLink } from 'react-router-dom'
import { IconHome, IconPlus, IconSettings, IconUsers } from '../ui/icons'

const items = [
  { to: '/', label: 'Inicio', Icon: IconHome, end: true },
  { to: '/socios', label: 'Socios', Icon: IconUsers, end: false },
  { to: '/socios/nuevo', label: 'Agregar', Icon: IconPlus, end: true },
  { to: '/ajustes', label: 'Ajustes', Icon: IconSettings, end: false },
]

export function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink-800 bg-ink-950/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `group flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold tracking-wide uppercase transition ${
                  isActive ? 'text-lime-neon' : 'text-ink-400 active:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-8 w-14 place-items-center rounded-full text-[22px] transition-all duration-200 ${
                      isActive ? 'bg-lime-neon/15' : ''
                    }`}
                  >
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
