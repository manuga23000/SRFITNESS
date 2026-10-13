import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconChevronLeft } from '../ui/icons'
import { Logo } from './Logo'

interface Props {
  titulo?: string
  subtitulo?: string
  volver?: boolean
  acciones?: ReactNode
}

/** Encabezado de cada pantalla. Sin título muestra el logo grande del gym. */
export function PageHeader({ titulo, subtitulo, volver, acciones }: Props) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 border-b border-ink-800/80 bg-ink-950/85 pt-safe backdrop-blur-xl md:static md:border-0 md:bg-transparent md:backdrop-blur-none">
      <div className="flex min-h-16 items-center gap-3 px-4 py-3 md:px-6 md:pt-8">
        {volver && (
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
            className="-ml-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-2xl text-ink-300 transition hover:bg-ink-800 active:scale-90"
            aria-label="Volver"
          >
            <IconChevronLeft />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {titulo ? (
            <>
              <h1 className="truncate font-display text-3xl leading-none tracking-wide md:text-4xl">{titulo}</h1>
              {subtitulo && <p className="mt-1 truncate text-xs font-medium text-ink-400">{subtitulo}</p>}
            </>
          ) : (
            <div className="md:hidden">
              <Logo />
            </div>
          )}
        </div>
        {acciones && <div className="flex shrink-0 items-center gap-2">{acciones}</div>}
      </div>
    </header>
  )
}
