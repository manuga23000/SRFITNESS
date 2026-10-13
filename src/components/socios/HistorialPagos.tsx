import { usePagos } from '../../hooks/usePagos'
import { formatearFecha } from '../../lib/dates'
import { formatearMonto } from '../../lib/format'
import { IconCash } from '../ui/icons'
import { Skeleton } from '../ui/Skeleton'
import { PLAN_LABEL } from '../../lib/etiquetas'

export function HistorialPagos({ socioId }: { socioId: string }) {
  const { pagos, cargando, error } = usePagos(socioId)
  const total = pagos.reduce((acc, p) => acc + p.monto, 0)

  return (
    <div>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-2xl tracking-wide">Historial de pagos</h2>
        {pagos.length > 0 && (
          <span className="text-xs font-semibold text-ink-400">
            {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'} · {formatearMonto(total)}
          </span>
        )}
      </div>

      {cargando ? (
        <div className="space-y-2">
          <Skeleton className="h-16 !rounded-2xl" />
          <Skeleton className="h-16 !rounded-2xl" />
        </div>
      ) : error ? (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">No se pudo cargar el historial.</p>
      ) : pagos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-700 px-4 py-6 text-center text-sm text-ink-400">
          Todavía no hay pagos registrados.
        </p>
      ) : (
        <ol className="relative space-y-2">
          {pagos.map((p, i) => (
            <li
              key={p.id}
              className="animate-fade-up flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-4 py-3"
              style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${
                  i === 0 ? 'bg-lime-neon text-ink-950' : 'bg-ink-800 text-ink-300'
                }`}
              >
                <IconCash />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{formatearFecha(p.fecha)}</div>
                <div className="text-xs text-ink-400">Plan {PLAN_LABEL[p.plan]}</div>
              </div>
              <div className="font-display text-xl tracking-wide">{formatearMonto(p.monto)}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
