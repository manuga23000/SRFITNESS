import { PLANES, type Pago, type Plan, type SocioConEstado } from '../types'
import { nombreCompleto, normalizarTexto } from './format'

export interface PagoDelMes extends Pago {
  socioId: string
  socioNombre: string
}

export interface ResumenMensual {
  /** Primer día del mes del resumen. */
  mes: Date
  generadoEn: Date
  activos: number
  alDia: number
  porVencer: number
  vencidos: number
  pagos: PagoDelMes[]
  totalCobrado: number
  porPlan: { plan: Plan; cantidad: number; total: number }[]
  /** Socios activos por plan (para ver la composición del gym). */
  sociosPorPlan: Record<Plan, number>
  altas: SocioConEstado[]
  bajas: SocioConEstado[]
  /** Activos vencidos o por vencer, del más atrasado al más próximo. */
  pendientes: SocioConEstado[]
  sociosActivos: SocioConEstado[]
}

export function inicioDeMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1)
}

export function finDeMes(mes: Date): Date {
  return new Date(mes.getFullYear(), mes.getMonth() + 1, 1)
}

const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })

/** "Octubre 2026" */
export function nombreMes(mes: Date): string {
  const t = fmtMes.format(mes).replace(' de ', ' ')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function enMes(fecha: Date | undefined, desde: Date, hasta: Date): boolean {
  return fecha !== undefined && fecha >= desde && fecha < hasta
}

const porNombre = (a: SocioConEstado, b: SocioConEstado) =>
  normalizarTexto(nombreCompleto(a)).localeCompare(normalizarTexto(nombreCompleto(b)), 'es')

export function armarResumen(
  todos: SocioConEstado[],
  pagosPorSocio: Map<string, Pago[]>,
  mes: Date,
  generadoEn = new Date(),
): ResumenMensual {
  const desde = inicioDeMes(mes)
  const hasta = finDeMes(desde)
  const activos = todos.filter((s) => s.activo)
  const nombres = new Map(todos.map((s) => [s.id, nombreCompleto(s)]))

  const pagos: PagoDelMes[] = []
  for (const [socioId, lista] of pagosPorSocio) {
    for (const p of lista) {
      if (enMes(p.fecha, desde, hasta)) pagos.push({ ...p, socioId, socioNombre: nombres.get(socioId) ?? '—' })
    }
  }
  pagos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime() || a.socioNombre.localeCompare(b.socioNombre, 'es'))

  const porPlan = PLANES.map((plan) => {
    const delPlan = pagos.filter((p) => p.plan === plan)
    return { plan, cantidad: delPlan.length, total: delPlan.reduce((acc, p) => acc + p.monto, 0) }
  })
  const sociosPorPlan = Object.fromEntries(
    PLANES.map((plan) => [plan, activos.filter((s) => s.plan === plan).length]),
  ) as Record<Plan, number>

  return {
    mes: desde,
    generadoEn,
    activos: activos.length,
    alDia: activos.filter((s) => s.estado === 'al-dia').length,
    porVencer: activos.filter((s) => s.estado === 'por-vencer').length,
    vencidos: activos.filter((s) => s.estado === 'vencido').length,
    pagos,
    totalCobrado: pagos.reduce((acc, p) => acc + p.monto, 0),
    porPlan,
    sociosPorPlan,
    altas: todos.filter((s) => enMes(s.creadoEn, desde, hasta)).sort(porNombre),
    bajas: todos.filter((s) => !s.activo && enMes(s.fechaBaja, desde, hasta)).sort(porNombre),
    pendientes: activos
      .filter((s) => s.estado !== 'al-dia')
      .sort((a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime()),
    sociosActivos: [...activos].sort(porNombre),
  }
}
