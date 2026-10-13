import { PLAN_DETALLE, PLAN_LABEL } from '../../lib/etiquetas'
import { formatearMonto } from '../../lib/format'
import { PLANES, type Plan, type Precios } from '../../types'

interface Props {
  valor: Plan
  onChange: (plan: Plan) => void
  precios?: Precios
}

/** Selector de plan con botones grandes (más cómodo que un desplegable en el celu). */
export function PlanSelector({ valor, onChange, precios }: Props) {
  return (
    <div role="radiogroup" aria-label="Plan" className="grid grid-cols-3 gap-2">
      {PLANES.map((plan) => {
        const activo = plan === valor
        return (
          <button
            key={plan}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onChange(plan)}
            className={`flex min-h-20 flex-col items-center justify-center rounded-2xl border-2 px-2 py-3 transition duration-150 active:scale-95 ${
              activo
                ? 'border-lime-neon bg-lime-neon/10 text-white shadow-[0_0_24px_-8px] shadow-lime-neon'
                : 'border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600'
            }`}
          >
            <span className={`font-display text-2xl leading-none tracking-wide ${activo ? 'text-lime-neon' : ''}`}>
              {PLAN_LABEL[plan]}
            </span>
            <span className="mt-1 text-[11px] text-ink-400">{PLAN_DETALLE[plan]}</span>
            {precios && precios[plan] > 0 && (
              <span className="mt-1 text-xs font-semibold text-ink-300">{formatearMonto(precios[plan])}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
