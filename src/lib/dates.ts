import type { EstadoCuota } from '../types'

export const DIAS_AVISO = 5
const MS_DIA = 24 * 60 * 60 * 1000

export function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
}

export function hoy(): Date {
  return inicioDelDia(new Date())
}

/** Suma meses respetando fin de mes (31/01 + 1 mes = 28/02 o 29/02). */
export function sumarMeses(fecha: Date, meses: number): Date {
  const d = inicioDelDia(fecha)
  const dia = d.getDate()
  const destino = new Date(d.getFullYear(), d.getMonth() + meses, 1)
  const ultimoDia = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate()
  destino.setDate(Math.min(dia, ultimoDia))
  return destino
}

export function vencimientoPorDefecto(fechaPago: Date): Date {
  return sumarMeses(fechaPago, 1)
}

/** Días de calendario entre hoy y la fecha (negativo si ya pasó). */
export function diasHasta(fecha: Date, desde: Date = new Date()): number {
  return Math.round((inicioDelDia(fecha).getTime() - inicioDelDia(desde).getTime()) / MS_DIA)
}

export function estadoCuota(diasRestantes: number): EstadoCuota {
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= DIAS_AVISO) return 'por-vencer'
  return 'al-dia'
}

/** dd/mm/aaaa */
export function formatearFecha(fecha: Date | undefined | null): string {
  if (!fecha) return '—'
  const dd = String(fecha.getDate()).padStart(2, '0')
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${fecha.getFullYear()}`
}

/** Valor para <input type="date"> (aaaa-mm-dd, en hora local). */
export function aInputDate(fecha: Date): string {
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mm}-${dd}`
}

/** Lee un <input type="date"> como fecha local (new Date('aaaa-mm-dd') la toma en UTC). */
export function desdeInputDate(valor: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor)
  if (!m) return null
  const fecha = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

/** Texto corto del estado: "vence hoy", "vence en 3 días", "vencido hace 2 días". */
export function textoVencimiento(dias: number): string {
  if (dias < -1) return `Vencido hace ${-dias} días`
  if (dias === -1) return 'Vencido hace 1 día'
  if (dias === 0) return 'Vence hoy'
  if (dias === 1) return 'Vence mañana'
  return `Vence en ${dias} días`
}
