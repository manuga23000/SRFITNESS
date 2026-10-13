import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Tono = 'lime' | 'ok' | 'warn' | 'danger'

const tonos: Record<Tono, { numero: string; icono: string; brillo: string; borde: string }> = {
  lime: {
    numero: 'text-lime-neon',
    icono: 'bg-lime-neon text-ink-950',
    brillo: 'bg-lime-neon/20',
    borde: 'hover:border-lime-neon/50',
  },
  ok: { numero: 'text-ok', icono: 'bg-ok/15 text-ok', brillo: 'bg-ok/15', borde: 'hover:border-ok/50' },
  warn: { numero: 'text-warn', icono: 'bg-warn/15 text-warn', brillo: 'bg-warn/15', borde: 'hover:border-warn/50' },
  danger: {
    numero: 'text-danger',
    icono: 'bg-danger/15 text-danger',
    brillo: 'bg-danger/20',
    borde: 'hover:border-danger/50',
  },
}

interface Props {
  to: string
  label: string
  valor: number
  icono: ReactNode
  tono: Tono
  detalle?: string
  cargando?: boolean
  indice?: number
}

/** Tarjeta con contador grande; al tocarla lleva al listado ya filtrado. */
export function StatCard({ to, label, valor, icono, tono, detalle, cargando, indice = 0 }: Props) {
  const t = tonos[tono]
  return (
    <Link
      to={to}
      className={`group relative animate-fade-up overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 p-4 transition duration-200 active:scale-[0.97] ${t.borde}`}
      style={{ animationDelay: `${indice * 60}ms` }}
    >
      <div className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl ${t.brillo}`} />
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-ink-300 uppercase">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl text-lg ${t.icono}`}>{icono}</span>
      </div>
      <div className="relative mt-3">
        {cargando ? (
          <div className="skeleton h-14 w-20" />
        ) : (
          <div className={`font-display text-6xl leading-none tracking-wide tabular-nums ${t.numero}`}>{valor}</div>
        )}
        {detalle && <div className="mt-1 text-xs text-ink-400">{detalle}</div>}
      </div>
    </Link>
  )
}
