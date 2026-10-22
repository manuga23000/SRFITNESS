import {
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Pago, PagoInput } from '../types'
import { pagoDesdeDoc } from './converters'
import { confirmarEscritura } from './escrituras'
import { pagosRef, socioRef } from './sociosService'

export function escucharPagos(socioId: string, onData: (pagos: Pago[]) => void, onError: (error: Error) => void) {
  const q = query(pagosRef(socioId), orderBy('fecha', 'desc'))
  return onSnapshot(q, (snap) => onData(snap.docs.map(pagoDesdeDoc)), onError)
}

/**
 * Registra un pago: lo guarda en el historial y actualiza en el socio la fecha del
 * último pago, el monto, el plan y el nuevo vencimiento, todo en una sola operación.
 * Si el socio estaba dado de baja, lo reactiva.
 */
export async function registrarPago(socioId: string, pago: PagoInput): Promise<void> {
  const batch = writeBatch(db)
  batch.set(doc(pagosRef(socioId)), {
    fecha: Timestamp.fromDate(pago.fecha),
    monto: pago.monto,
    plan: pago.plan,
    creadoEn: serverTimestamp(),
  })
  batch.update(socioRef(socioId), {
    fechaUltimoPago: Timestamp.fromDate(pago.fecha),
    fechaVencimiento: Timestamp.fromDate(pago.fechaVencimiento),
    montoUltimoPago: pago.monto,
    plan: pago.plan,
    activo: true,
    fechaBaja: deleteField(),
    actualizadoEn: serverTimestamp(),
  })
  await confirmarEscritura(batch.commit())
}

/** Pagos de un socio entre dos fechas (desde inclusive, hasta exclusive). */
export async function obtenerPagosEntre(socioId: string, desde: Date, hasta: Date): Promise<Pago[]> {
  const q = query(
    pagosRef(socioId),
    where('fecha', '>=', Timestamp.fromDate(desde)),
    where('fecha', '<', Timestamp.fromDate(hasta)),
  )
  const snap = await getDocs(q)
  return snap.docs.map(pagoDesdeDoc)
}
