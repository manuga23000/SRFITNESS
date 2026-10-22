import {
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Socio, SocioInput } from '../types'
import { socioDesdeDoc } from './converters'
import { confirmarEscritura } from './escrituras'

export const sociosRef = collection(db, 'socios')

export function socioRef(id: string) {
  return doc(db, 'socios', id)
}

export function pagosRef(socioId: string) {
  return collection(db, 'socios', socioId, 'pagos')
}

/** Escucha en tiempo real todos los socios (activos e inactivos), ordenados por vencimiento. */
export function escucharSocios(onData: (socios: Socio[]) => void, onError: (error: Error) => void) {
  const q = query(sociosRef, orderBy('fechaVencimiento', 'asc'))
  return onSnapshot(q, (snap) => onData(snap.docs.map(socioDesdeDoc)), onError)
}

/**
 * Da de alta un socio y, en la misma operación, registra el primer pago en su historial.
 * Devuelve el id del socio nuevo.
 */
export async function crearSocio(datos: SocioInput): Promise<string> {
  const nuevoRef = doc(sociosRef)
  const batch = writeBatch(db)
  batch.set(nuevoRef, {
    nombre: datos.nombre,
    apellido: datos.apellido,
    celular: datos.celular,
    ...(datos.email && { email: datos.email }),
    plan: datos.plan,
    fechaUltimoPago: Timestamp.fromDate(datos.fechaUltimoPago),
    fechaVencimiento: Timestamp.fromDate(datos.fechaVencimiento),
    ...(datos.montoUltimoPago !== undefined && { montoUltimoPago: datos.montoUltimoPago }),
    ...(datos.notas && { notas: datos.notas }),
    activo: true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  })
  batch.set(doc(pagosRef(nuevoRef.id)), {
    fecha: Timestamp.fromDate(datos.fechaUltimoPago),
    monto: datos.montoUltimoPago ?? 0,
    plan: datos.plan,
    creadoEn: serverTimestamp(),
  })
  await confirmarEscritura(batch.commit())
  return nuevoRef.id
}

export async function actualizarSocio(id: string, datos: SocioInput): Promise<void> {
  await confirmarEscritura(
    updateDoc(socioRef(id), {
      nombre: datos.nombre,
      apellido: datos.apellido,
      celular: datos.celular,
      email: datos.email || deleteField(),
      plan: datos.plan,
      fechaUltimoPago: Timestamp.fromDate(datos.fechaUltimoPago),
      fechaVencimiento: Timestamp.fromDate(datos.fechaVencimiento),
      montoUltimoPago: datos.montoUltimoPago ?? deleteField(),
      notas: datos.notas || deleteField(),
      actualizadoEn: serverTimestamp(),
    }),
  )
}

export async function cambiarActivo(id: string, activo: boolean): Promise<void> {
  await confirmarEscritura(
    updateDoc(socioRef(id), {
      activo,
      fechaBaja: activo ? deleteField() : serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    }),
  )
}

/** Borra el socio y todo su historial de pagos. */
export async function eliminarSocio(id: string): Promise<void> {
  const [pagos, avisos] = await Promise.all([getDocs(pagosRef(id)), getDocs(collection(db, 'socios', id, 'avisos'))])
  const batch = writeBatch(db)
  pagos.docs.forEach((p) => batch.delete(p.ref))
  avisos.docs.forEach((a) => batch.delete(a.ref))
  batch.delete(socioRef(id))
  await confirmarEscritura(batch.commit())
}
