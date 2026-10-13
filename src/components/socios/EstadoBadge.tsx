import { textoVencimiento } from '../../lib/dates'
import { ESTADO_LABEL } from '../../lib/etiquetas'
import type { EstadoCuota } from '../../types'

const estilos: Record<EstadoCuota, string> = {
  'al-dia': 'bg-ok/15 text-ok ring-ok/30',
  'por-vencer': 'bg-warn/15 text-warn ring-warn/30',
  vencido: 'bg-danger/15 text-danger ring-danger/40',
}

const puntos: Record<EstadoCuota, string> = {
  'al-dia': 'bg-ok',
  'por-vencer': 'bg-warn',
  vencido: 'bg-danger animate-pulse',
}

interface Props {
  estado: EstadoCuota
  diasRestantes: number
  /** Muestra "vencido hace X días" / "vence en X días" en lugar de la etiqueta corta. */
  detallado?: boolean
  className?: string
}

export function EstadoBadge({ estado, diasRestantes, detallado = false, className = '' }: Props) {
  const texto = detallado || estado !== 'al-dia' ? textoVencimiento(diasRestantes) : ESTADO_LABEL[estado]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ring-1 ring-inset ${estilos[estado]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${puntos[estado]}`} />
      {texto}
    </span>
  )
}
