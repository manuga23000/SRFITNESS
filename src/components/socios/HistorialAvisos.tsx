import { useEffect, useState } from 'react'
import { formatearFecha } from '../../lib/dates'
import { AVISO_LABEL, escucharAvisos, type Aviso } from '../../services/recordatoriosService'
import { IconBell } from '../ui/icons'

/** Emails de recordatorio que se le mandaron al socio. No muestra nada si nunca se le mandó uno. */
export function HistorialAvisos({ socioId }: { socioId: string }) {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  useEffect(() => escucharAvisos(socioId, setAvisos), [socioId])

  if (avisos.length === 0) return null
  return (
    <div>
      <h2 className="mb-3 font-display text-2xl tracking-wide">Recordatorios enviados</h2>
      <ul className="space-y-2">
        {avisos.slice(0, 8).map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-4 py-3">
            <IconBell className="shrink-0 text-lg text-ink-400" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{AVISO_LABEL[a.tipo] ?? a.tipo}</div>
              <div className="truncate text-xs text-ink-400">Email a {a.para}</div>
            </div>
            <span className="text-xs text-ink-400">{formatearFecha(a.enviadoEn)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
