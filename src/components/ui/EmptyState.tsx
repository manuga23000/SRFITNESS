import type { ReactNode } from 'react'

interface Props {
  icono: ReactNode
  titulo: string
  texto?: string
  accion?: ReactNode
}

export function EmptyState({ icono, titulo, texto, accion }: Props) {
  return (
    <div className="flex animate-fade-up flex-col items-center rounded-3xl border border-dashed border-ink-700 px-6 py-12 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-ink-800 text-3xl text-lime-neon">
        {icono}
      </div>
      <h3 className="font-display text-2xl tracking-wide">{titulo}</h3>
      {texto && <p className="mt-1 max-w-xs text-sm text-ink-400">{texto}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
