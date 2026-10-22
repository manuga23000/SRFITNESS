/**
 * Recordatorios de cuota por email (EmailJS).
 *
 * Vercel Cron lo llama una vez por día (ver vercel.json). También se puede disparar desde
 * Ajustes en la app (con la sesión del profe) para enviar ya, simular o mandar un email de prueba.
 *
 * Avisos: 1 día antes del vencimiento y 1, 3 y 7 días después. Cada aviso se manda una sola
 * vez por vencimiento; si un día no corre, al siguiente se manda el que corresponda.
 */
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

const TZ = 'America/Argentina/Buenos_Aires'
const GYM = 'SR Fitness Gym'
/** Tope por ejecución: EmailJS acepta ~1 envío por segundo y la función tiene un tiempo máximo. */
const MAX_POR_EJECUCION = 40

export type TipoAviso = 'previo' | 'vencido1' | 'vencido3' | 'vencido7'

const PLAN_LABEL: Record<string, string> = {
  '2 veces': '2 veces por semana',
  '3 veces': '3 veces por semana',
  libre: 'Libre',
}

// ---------- Fechas en hora de Argentina (el servidor corre en UTC)

const fmtYmd = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })

/** 'aaaa-mm-dd' del día en Argentina. */
export function ymd(fecha: Date): string {
  return fmtYmd.format(fecha)
}

export function diasEntre(desde: string, hasta: string): number {
  const [a, b] = [desde, hasta].map((s) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  })
  return Math.round((b - a) / 86_400_000)
}

function ddmmaaaa(ymdStr: string): string {
  const [y, m, d] = ymdStr.split('-')
  return `${d}/${m}/${y}`
}

// ---------- Qué aviso corresponde

/** Según los días que faltan para el vencimiento (negativo = vencido). Las ventanas cubren días sin ejecución. */
export function tipoSegunDias(dias: number): TipoAviso | null {
  if (dias === 1 || dias === 0) return 'previo'
  if (dias <= -1 && dias >= -2) return 'vencido1'
  if (dias <= -3 && dias >= -6) return 'vencido3'
  if (dias <= -7 && dias >= -10) return 'vencido7'
  return null
}

export interface DatosEmail {
  to_email: string
  to_name: string
  asunto: string
  titulo: string
  mensaje: string
  fecha_vencimiento: string
  plan: string
  monto: string
  gym: string
}

export function armarEmail(
  s: { nombre: string; apellido: string; email: string; plan: string },
  vencimiento: string,
  dias: number,
  monto: string,
): DatosEmail {
  const nombre = (s.nombre || s.apellido).split(' ')[0]
  const fecha = ddmmaaaa(vencimiento)
  let asunto: string
  let titulo: string
  let mensaje: string
  if (dias >= 1) {
    asunto = 'Tu cuota vence mañana'
    titulo = '¡Tu cuota vence mañana!'
    mensaje = `Te recordamos que tu cuota de ${GYM} vence mañana, ${fecha}. Acercate a renovarla y seguí entrenando sin cortes.`
  } else if (dias === 0) {
    asunto = 'Tu cuota vence hoy'
    titulo = '¡Tu cuota vence hoy!'
    mensaje = `Te recordamos que tu cuota de ${GYM} vence hoy, ${fecha}. Acercate a renovarla y seguí entrenando sin cortes.`
  } else if (dias === -1) {
    asunto = 'Tu cuota venció ayer'
    titulo = 'Tu cuota venció ayer'
    mensaje = `Tu cuota de ${GYM} venció ayer, ${fecha}. Cuando puedas, acercate a renovarla.`
  } else if (dias >= -6) {
    asunto = `Tu cuota está vencida hace ${-dias} días`
    titulo = `Tu cuota está vencida hace ${-dias} días`
    mensaje = `Tu cuota de ${GYM} venció el ${fecha}. Te esperamos para renovarla y volver a entrenar.`
  } else {
    asunto = dias === -7 ? 'Tu cuota está vencida hace una semana' : `Tu cuota está vencida hace ${-dias} días`
    titulo = asunto
    mensaje = `Tu cuota de ${GYM} venció el ${fecha}. ¡Te extrañamos! Acercate a renovarla cuando puedas. Si ya pagaste, ignorá este mensaje.`
  }
  return {
    to_email: s.email,
    to_name: nombre,
    asunto: `${asunto} - ${GYM}`,
    titulo,
    mensaje,
    fecha_vencimiento: fecha,
    plan: PLAN_LABEL[s.plan] ?? s.plan,
    monto,
    gym: GYM,
  }
}

// ---------- Servicios externos

function db() {
  if (!getApps().length && process.env.FIRESTORE_EMULATOR_HOST) {
    // Desarrollo local con los emulators de Firebase.
    initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-srfitness' })
  }
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT
    if (!raw) throw new Error('Falta la variable FIREBASE_SERVICE_ACCOUNT')
    const cuenta = JSON.parse(raw)
    cuenta.private_key = String(cuenta.private_key).replace(/\\n/g, '\n')
    initializeApp({ credential: cert(cuenta) })
  }
  return getFirestore()
}

async function enviarEmailJs(params: DatosEmail): Promise<void> {
  const faltan = ['EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID', 'EMAILJS_PUBLIC_KEY', 'EMAILJS_PRIVATE_KEY'].filter(
    (k) => !process.env[k],
  )
  if (faltan.length) throw new Error(`Faltan variables: ${faltan.join(', ')}`)
  const res = await fetch(process.env.EMAILJS_API_URL ?? 'https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: params,
    }),
  })
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`)
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Acepta el cron de Vercel (CRON_SECRET) o un usuario logueado en la app (token de Firebase). */
async function autorizado(request: Request): Promise<{ ok: boolean; email?: string }> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!token) return { ok: false }
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) return { ok: true }
  try {
    db()
    const user = await getAuth().verifyIdToken(token)
    return { ok: true, email: user.email }
  } catch {
    return { ok: false }
  }
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

// ---------- Handler

async function manejar(request: Request): Promise<Response> {
  const auth = await autorizado(request)
  if (!auth.ok) return json({ error: 'No autorizado' }, 401)

  const url = new URL(request.url)
  const simular = url.searchParams.get('simular') === '1'
  const prueba = url.searchParams.get('prueba') // email al que mandar un ejemplo

  try {
    if (prueba) {
      const vence = ymd(new Date(Date.now() + 86_400_000))
      await enviarEmailJs(
        armarEmail({ nombre: 'Profe', apellido: '', email: prueba, plan: '3 veces' }, vence, 1, '$ 30.000'),
      )
      return json({ prueba: true, enviadoA: prueba })
    }

    const firestore = db()
    const hoy = ymd(new Date())
    const [sociosSnap, preciosSnap] = await Promise.all([
      firestore.collection('socios').where('activo', '==', true).get(),
      firestore.doc('config/precios').get(),
    ])
    const precios = preciosSnap.data() ?? {}

    const enviados: { socio: string; email: string; tipo: TipoAviso }[] = []
    const errores: { socio: string; error: string }[] = []
    let pendientesPorTope = 0

    for (const doc of sociosSnap.docs) {
      const s = doc.data()
      const email = String(s.email ?? '').trim()
      if (!email || !(s.fechaVencimiento instanceof Timestamp)) continue

      const vencimiento = ymd(s.fechaVencimiento.toDate())
      const dias = diasEntre(hoy, vencimiento)
      const tipo = tipoSegunDias(dias)
      if (!tipo) continue

      // Los avisos se reinician cuando cambia el vencimiento (o sea, cuando paga).
      const yaEnviados: string[] = s.avisosVencimiento === vencimiento ? (s.avisosEnviados ?? []) : []
      if (yaEnviados.includes(tipo)) continue

      const nombreSocio = `${s.nombre ?? ''} ${s.apellido ?? ''}`.trim()
      if (enviados.length >= MAX_POR_EJECUCION) {
        pendientesPorTope++
        continue
      }
      if (simular) {
        enviados.push({ socio: nombreSocio, email, tipo })
        continue
      }

      const precio = typeof precios[s.plan] === 'number' && precios[s.plan] > 0 ? precios[s.plan] : s.montoUltimoPago
      const monto = typeof precio === 'number' ? pesos.format(precio).replace(/\s/g, ' ') : '—'
      try {
        await enviarEmailJs(
          armarEmail(
            { nombre: s.nombre ?? '', apellido: s.apellido ?? '', email, plan: s.plan },
            vencimiento,
            dias,
            monto,
          ),
        )
        const batch = firestore.batch()
        batch.update(doc.ref, {
          avisosVencimiento: vencimiento,
          avisosEnviados: s.avisosVencimiento === vencimiento ? FieldValue.arrayUnion(tipo) : [tipo],
        })
        batch.create(doc.ref.collection('avisos').doc(), {
          tipo,
          canal: 'email',
          para: email,
          vencimiento: s.fechaVencimiento,
          enviadoEn: FieldValue.serverTimestamp(),
        })
        await batch.commit()
        enviados.push({ socio: nombreSocio, email, tipo })
      } catch (e) {
        errores.push({ socio: nombreSocio, error: (e as Error).message })
      }
      await esperar(1100)
    }

    return json({ fecha: hoy, simulacion: simular, enviados, errores, pendientesPorTope })
  } catch (e) {
    console.error(e)
    return json({ error: (e as Error).message }, 500)
  }
}

export const GET = manejar
export const POST = manejar
