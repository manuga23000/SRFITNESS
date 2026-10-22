export const PLANES = ['2 veces', '3 veces', 'libre'] as const
export type Plan = (typeof PLANES)[number]

export type EstadoCuota = 'al-dia' | 'por-vencer' | 'vencido'

export interface Socio {
  id: string
  nombre: string
  apellido: string
  /** Opcional (vacío si no se cargó). 10 dígitos: código de área sin 0 + número sin 15. Ej: 3364123456 */
  celular: string
  /** Opcional: para los recordatorios automáticos por email. */
  email?: string
  plan: Plan
  fechaUltimoPago: Date
  fechaVencimiento: Date
  montoUltimoPago?: number
  notas?: string
  activo: boolean
  creadoEn?: Date
  actualizadoEn?: Date
  /** Cuándo se lo dio de baja (solo si está inactivo). */
  fechaBaja?: Date
}

/** Datos que se cargan desde el formulario de alta/edición. */
export interface SocioInput {
  nombre: string
  apellido: string
  celular: string
  email?: string
  plan: Plan
  fechaUltimoPago: Date
  fechaVencimiento: Date
  montoUltimoPago?: number
  notas?: string
}

export interface Pago {
  id: string
  fecha: Date
  monto: number
  plan: Plan
  creadoEn?: Date
}

export interface PagoInput {
  fecha: Date
  monto: number
  plan: Plan
  /** Vencimiento resultante (por defecto, fecha + 1 mes). */
  fechaVencimiento: Date
}

export type Precios = Record<Plan, number>

/** Socio con el estado de la cuota ya calculado para mostrar. */
export interface SocioConEstado extends Socio {
  estado: EstadoCuota
  /** Días hasta el vencimiento (negativo si está vencido). */
  diasRestantes: number
}

export type Orden = 'vencimiento' | 'nombre'

export interface Filtros {
  busqueda: string
  plan: Plan | null
  estado: EstadoCuota | null
  orden: Orden
}
