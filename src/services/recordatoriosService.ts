import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export type TipoAviso = 'previo' | 'vencido1' | 'vencido3' | 'vencido7'

export const AVISO_LABEL: Record<TipoAviso, string> = {
  previo: 'Vence mañana',
  vencido1: 'Vencido hace 1 día',
  vencido3: 'Vencido hace 3 días',
  vencido7: 'Vencido hace 7 días',
}

export interface Aviso {
  id: string
  tipo: TipoAviso
  canal: string
  para: string
  enviadoEn?: Date
}

export interface ResultadoRecordatorios {
  fecha?: string
  simulacion?: boolean
  enviados?: { socio: string; email: string; tipo: TipoAviso }[]
  errores?: { socio: string; error: string }[]
  pendientesPorTope?: number
  prueba?: boolean
  enviadoA?: string
  error?: string
}

/** Llama a la función de Vercel que manda los emails (la misma que corre el cron diario). */
export async function llamarRecordatorios(params: {
  simular?: boolean
  prueba?: string
}): Promise<ResultadoRecordatorios> {
  const token = await auth.currentUser?.getIdToken()
  const qs = new URLSearchParams()
  if (params.simular) qs.set('simular', '1')
  if (params.prueba) qs.set('prueba', params.prueba)
  let res: Response
  try {
    res = await fetch(`/api/recordatorios?${qs}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  } catch {
    throw new Error('Sin conexión con el servidor')
  }
  const texto = await res.text()
  let data: ResultadoRecordatorios | null = null
  try {
    data = JSON.parse(texto) as ResultadoRecordatorios
  } catch {
    // La respuesta no es de nuestra función: o estamos en `npm run dev` o la función falló en Vercel.
  }
  if (!data) {
    if (import.meta.env.DEV)
      throw new Error('En la compu (npm run dev) no funciona: probalo en la app publicada en Vercel')
    if (res.status === 404)
      throw new Error('No se encontró la función de recordatorios en Vercel (404). Revisá el último deploy')
    throw new Error(`Error del servidor (${res.status}): ${texto.slice(0, 120)}. Revisá Vercel > Logs`)
  }
  if (!res.ok || data.error) throw new Error(data.error ?? `Error ${res.status}`)
  return data
}

export function escucharAvisos(socioId: string, onData: (avisos: Aviso[]) => void) {
  const q = query(collection(db, 'socios', socioId, 'avisos'), orderBy('enviadoEn', 'desc'))
  return onSnapshot(
    q,
    (snap) =>
      onData(
        snap.docs.map((d) => {
          const a = d.data()
          return {
            id: d.id,
            tipo: a.tipo,
            canal: a.canal ?? 'email',
            para: a.para ?? '',
            enviadoEn: a.enviadoEn instanceof Timestamp ? a.enviadoEn.toDate() : undefined,
          }
        }),
      ),
    (e) => console.error(e),
  )
}
