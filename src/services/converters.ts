import { Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'
import { PLANES, type Pago, type Plan, type Socio } from '../types'

function aFecha(valor: unknown): Date | undefined {
  if (valor instanceof Timestamp) return valor.toDate()
  if (valor instanceof Date) return valor
  return undefined
}

function aPlan(valor: unknown): Plan {
  return PLANES.includes(valor as Plan) ? (valor as Plan) : 'libre'
}

export function socioDesdeDoc(
  snap: QueryDocumentSnapshot<DocumentData> | { id: string; data: () => DocumentData },
): Socio {
  const d = snap.data()
  const fechaUltimoPago = aFecha(d.fechaUltimoPago) ?? new Date(0)
  return {
    id: snap.id,
    nombre: d.nombre ?? '',
    apellido: d.apellido ?? '',
    celular: d.celular ?? '',
    email: d.email || undefined,
    plan: aPlan(d.plan),
    fechaUltimoPago,
    fechaVencimiento: aFecha(d.fechaVencimiento) ?? fechaUltimoPago,
    montoUltimoPago: typeof d.montoUltimoPago === 'number' ? d.montoUltimoPago : undefined,
    notas: d.notas || undefined,
    activo: d.activo !== false,
    // Mientras el serverTimestamp está pendiente (escritura local) llega como null.
    creadoEn: aFecha(d.creadoEn),
    actualizadoEn: aFecha(d.actualizadoEn),
    fechaBaja: aFecha(d.fechaBaja),
  }
}

export function pagoDesdeDoc(snap: QueryDocumentSnapshot<DocumentData>): Pago {
  const d = snap.data()
  return {
    id: snap.id,
    fecha: aFecha(d.fecha) ?? new Date(0),
    monto: typeof d.monto === 'number' ? d.monto : 0,
    plan: aPlan(d.plan),
    creadoEn: aFecha(d.creadoEn),
  }
}
