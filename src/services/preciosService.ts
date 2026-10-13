import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { PLANES, type Precios } from '../types'
import { confirmarEscritura } from './escrituras'

const preciosRef = doc(db, 'config', 'precios')

export const PRECIOS_VACIOS: Precios = { '2 veces': 0, '3 veces': 0, libre: 0 }

export function escucharPrecios(onData: (precios: Precios) => void, onError: (error: Error) => void) {
  return onSnapshot(
    preciosRef,
    (snap) => {
      const d = snap.data() ?? {}
      const precios = { ...PRECIOS_VACIOS }
      for (const plan of PLANES) if (typeof d[plan] === 'number') precios[plan] = d[plan]
      onData(precios)
    },
    onError,
  )
}

export async function guardarPrecios(precios: Precios): Promise<void> {
  await confirmarEscritura(setDoc(preciosRef, { ...precios, actualizadoEn: serverTimestamp() }, { merge: true }))
}
