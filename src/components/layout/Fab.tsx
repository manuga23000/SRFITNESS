import { Link } from 'react-router-dom'
import { IconPlus } from '../ui/icons'

/** Botón flotante para agregar un socio (solo en el celu; en desktop está en el menú lateral). */
export function Fab() {
  return (
    <Link
      to="/socios/nuevo"
      aria-label="Agregar socio"
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+84px)] z-30 grid h-16 w-16 animate-pop place-items-center rounded-2xl bg-lime-neon text-4xl text-ink-950 shadow-[0_10px_40px_-6px] shadow-lime-neon/70 transition hover:bg-lime-soft active:scale-90 md:hidden"
    >
      <IconPlus strokeWidth={2.75} />
    </Link>
  )
}
