import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocios } from '../hooks/useSocios'
import { useToast } from '../hooks/useToast'
import { AVISO_LABEL, llamarRecordatorios, type ResultadoRecordatorios } from '../services/recordatoriosService'
import { Button } from './ui/Button'

type Accion = 'prueba' | 'simular' | 'enviar'

const CLAVE_EMAIL_PRUEBA = 'sr-email-prueba'

function leerEmailPrueba(): string {
  try {
    return localStorage.getItem(CLAVE_EMAIL_PRUEBA) ?? ''
  } catch {
    return ''
  }
}

/** Sección de Ajustes para probar y disparar a mano los recordatorios por email. */
export function RecordatoriosEmail() {
  const { user } = useAuth()
  const { activos } = useSocios()
  const toast = useToast()
  const [accion, setAccion] = useState<Accion | null>(null)
  // A dónde mandar el email de prueba (se recuerda en este dispositivo).
  const [emailPrueba, setEmailPrueba] = useState(() => leerEmailPrueba() || user?.email || '')
  const emailPruebaValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPrueba.trim())
  const [resultado, setResultado] = useState<ResultadoRecordatorios | null>(null)
  const conEmail = activos.filter((s) => s.email).length

  async function ejecutar(a: Accion) {
    setAccion(a)
    if (a === 'prueba') {
      try {
        localStorage.setItem(CLAVE_EMAIL_PRUEBA, emailPrueba.trim().toLowerCase())
      } catch {
        // sin storage: no pasa nada, solo no se recuerda
      }
    }
    try {
      const r = await llamarRecordatorios(
        a === 'prueba' ? { prueba: emailPrueba.trim().toLowerCase() } : { simular: a === 'simular' },
      )
      setResultado(a === 'prueba' ? null : r)
      if (a === 'prueba') toast.ok(`Email de prueba enviado a ${r.enviadoA}`)
      else if (a === 'enviar') toast.ok(`${r.enviados?.length ?? 0} recordatorios enviados`)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setAccion(null)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-2xl tracking-wide">Recordatorios por email</h2>
        <p className="text-sm text-ink-400">
          Salen solos todos los días a la mañana: 1 día antes del vencimiento y a los 1, 3 y 7 días de vencida.{' '}
          {conEmail} de {activos.length} socios activos tienen email cargado.
        </p>
      </div>
      <div>
        <label htmlFor="email-prueba" className="label">
          Mandar el email de prueba a
        </label>
        <input
          id="email-prueba"
          type="email"
          inputMode="email"
          autoCapitalize="none"
          className="field"
          placeholder="tu@email.com"
          value={emailPrueba}
          onChange={(e) => setEmailPrueba(e.target.value)}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Button
          variante="secondary"
          cargando={accion === 'prueba'}
          disabled={accion !== null || !emailPruebaValido}
          onClick={() => ejecutar('prueba')}
        >
          Email de prueba
        </Button>
        <Button
          variante="secondary"
          cargando={accion === 'simular'}
          disabled={accion !== null}
          onClick={() => ejecutar('simular')}
        >
          ¿A quién le toca hoy?
        </Button>
        <Button cargando={accion === 'enviar'} disabled={accion !== null} onClick={() => ejecutar('enviar')}>
          Enviar ahora
        </Button>
      </div>

      {resultado && (
        <div className="animate-fade-up rounded-2xl border border-ink-800 bg-ink-900 p-4 text-sm">
          <p className="mb-2 font-semibold">
            {resultado.simulacion ? 'Hoy les toca a' : 'Enviados'}: {resultado.enviados?.length ?? 0}
          </p>
          {resultado.enviados && resultado.enviados.length > 0 ? (
            <ul className="space-y-1 text-ink-300">
              {resultado.enviados.map((e, i) => (
                <li key={i}>
                  {e.socio} <span className="text-ink-400">· {AVISO_LABEL[e.tipo]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-400">Nadie para avisar por ahora.</p>
          )}
          {resultado.errores && resultado.errores.length > 0 && (
            <ul className="mt-2 space-y-1 text-danger">
              {resultado.errores.map((e, i) => (
                <li key={i}>
                  {e.socio}: {e.error}
                </li>
              ))}
            </ul>
          )}
          {(resultado.pendientesPorTope ?? 0) > 0 && (
            <p className="mt-2 text-warn">{resultado.pendientesPorTope} quedan para la próxima ejecución.</p>
          )}
        </div>
      )}
    </div>
  )
}
