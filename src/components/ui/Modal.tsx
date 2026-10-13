import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from './icons'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
}

/** En el celu se abre como hoja desde abajo; en pantallas grandes, centrado. */
export function Modal({ abierto, onCerrar, titulo, children }: Props) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-[fade-up_0.2s_ease-out_both] bg-black/70 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative flex max-h-[92dvh] w-full animate-slide-up flex-col rounded-t-3xl border-t border-ink-700 bg-ink-900 shadow-2xl sm:max-w-md sm:animate-pop sm:rounded-3xl sm:border"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-ink-700 sm:hidden" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="font-display text-3xl tracking-wide">{titulo}</h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-full text-xl text-ink-400 transition hover:bg-ink-800 hover:text-white active:scale-90"
          >
            <IconX />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pt-2 pb-safe">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
