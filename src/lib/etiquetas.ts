import type { EstadoCuota, Plan } from '../types'

export const PLAN_LABEL: Record<Plan, string> = {
  '2 veces': '2 veces',
  '3 veces': '3 veces',
  libre: 'Libre',
}

export const PLAN_DETALLE: Record<Plan, string> = {
  '2 veces': 'por semana',
  '3 veces': 'por semana',
  libre: 'todos los días',
}

export const ESTADO_LABEL: Record<EstadoCuota, string> = {
  'al-dia': 'Al día',
  'por-vencer': 'Por vencer',
  vencido: 'Vencido',
}
