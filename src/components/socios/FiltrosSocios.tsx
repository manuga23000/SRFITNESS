import type { ReactNode } from 'react'
import { PLANES, type EstadoCuota, type Filtros } from '../../types'
import { IconSearch, IconX } from '../ui/icons'
import { ESTADO_LABEL } from '../../lib/etiquetas'
import { PLAN_LABEL } from '../../lib/etiquetas'

interface Props {
  filtros: Filtros
  onChange: (cambios: Partial<Filtros>) => void
  conteoEstados: Record<EstadoCuota, number>
}

const ESTADOS: EstadoCuota[] = ['vencido', 'por-vencer', 'al-dia']

const chipEstado: Record<EstadoCuota, string> = {
  vencido: 'border-danger bg-danger/15 text-danger',
  'por-vencer': 'border-warn bg-warn/15 text-warn',
  'al-dia': 'border-ok bg-ok/15 text-ok',
}

function Chip({
  activo,
  onClick,
  children,
  claseActiva = 'border-lime-neon bg-lime-neon/15 text-lime-neon',
}: {
  activo: boolean
  onClick: () => void
  children: ReactNode
  claseActiva?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition active:scale-95 ${
        activo ? claseActiva : 'border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600'
      }`}
    >
      {children}
    </button>
  )
}

export function FiltrosSocios({ filtros, onChange, conteoEstados }: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-ink-400" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          placeholder="Buscar por nombre, apellido o celular"
          className="field !rounded-full pr-11 pl-11"
          value={filtros.busqueda}
          onChange={(e) => onChange({ busqueda: e.target.value })}
        />
        {filtros.busqueda && (
          <button
            type="button"
            onClick={() => onChange({ busqueda: '' })}
            aria-label="Borrar búsqueda"
            className="absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-400 hover:bg-ink-800"
          >
            <IconX />
          </button>
        )}
      </div>

      <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        <Chip activo={filtros.estado === null} onClick={() => onChange({ estado: null })}>
          Todos
        </Chip>
        {ESTADOS.map((e) => (
          <Chip
            key={e}
            activo={filtros.estado === e}
            claseActiva={chipEstado[e]}
            onClick={() => onChange({ estado: filtros.estado === e ? null : e })}
          >
            {ESTADO_LABEL[e]} <span className="ml-0.5 opacity-70">{conteoEstados[e]}</span>
          </Chip>
        ))}
      </div>

      <div className="-mx-4 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {PLANES.map((p) => (
          <Chip key={p} activo={filtros.plan === p} onClick={() => onChange({ plan: filtros.plan === p ? null : p })}>
            {PLAN_LABEL[p]}
          </Chip>
        ))}
        <span className="mx-1 h-6 w-px shrink-0 bg-ink-700" />
        <Chip
          activo={false}
          onClick={() => onChange({ orden: filtros.orden === 'vencimiento' ? 'nombre' : 'vencimiento' })}
        >
          ⇅ {filtros.orden === 'vencimiento' ? 'Por vencimiento' : 'A–Z'}
        </Chip>
      </div>
    </div>
  )
}
