import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { EstadoBadge } from '../components/socios/EstadoBadge'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { EmptyState } from '../components/ui/EmptyState'
import { IconCash, IconCheck, IconChevronRight, IconPhone, IconWhatsapp } from '../components/ui/icons'
import { Skeleton } from '../components/ui/Skeleton'
import { usePagoModal } from '../hooks/usePagoModal'
import { useSocios } from '../hooks/useSocios'
import { formatearFecha } from '../lib/dates'
import { PLAN_LABEL } from '../lib/etiquetas'
import { iniciales, nombreCompleto } from '../lib/format'
import { linkTelefono, linkWhatsapp, mensajeRecordatorio } from '../lib/whatsapp'
import { ordenarSocios } from '../lib/filtros'
import type { EstadoCuota } from '../types'

type Grupo = Extract<EstadoCuota, 'vencido' | 'por-vencer'>

const CLAVE = 'sr-recordatorios'

/** Recordados en el día: se guardan en sessionStorage para no perder el lugar al volver de WhatsApp. */
function leerRecordados(): string[] {
  try {
    const data = JSON.parse(sessionStorage.getItem(CLAVE) ?? 'null') as { dia: string; ids: string[] } | null
    return data && data.dia === new Date().toDateString() ? data.ids : []
  } catch {
    return []
  }
}

function guardarRecordados(ids: string[]) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ dia: new Date().toDateString(), ids }))
  } catch {
    // sin storage disponible: el progreso solo vive en memoria
  }
}

export function RecordatoriosPage() {
  const { activos, cargando } = useSocios()
  const { abrirPago } = usePagoModal()
  const [grupo, setGrupo] = useState<Grupo>('vencido')
  const [recordados, setRecordados] = useState<string[]>(leerRecordados)

  const cola = useMemo(
    () =>
      ordenarSocios(
        activos.filter((s) => s.estado === grupo),
        'vencimiento',
      ),
    [activos, grupo],
  )
  const pendientes = cola.filter((s) => !recordados.includes(s.id))
  const actual = pendientes[0]
  const hechos = cola.length - pendientes.length
  const conteo = {
    vencido: activos.filter((s) => s.estado === 'vencido').length,
    'por-vencer': activos.filter((s) => s.estado === 'por-vencer').length,
  }

  function marcar(id: string) {
    const nuevos = [...recordados, id]
    setRecordados(nuevos)
    guardarRecordados(nuevos)
  }

  function reiniciar() {
    const ids = new Set(cola.map((s) => s.id))
    const nuevos = recordados.filter((id) => !ids.has(id))
    setRecordados(nuevos)
    guardarRecordados(nuevos)
  }

  return (
    <>
      <PageHeader titulo="Recordatorios" subtitulo="Mandá los WhatsApp uno por uno" volver />

      <section className="space-y-5 px-4 pt-4 md:px-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-ink-900 p-1.5">
          {(['vencido', 'por-vencer'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGrupo(g)}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                grupo === g
                  ? g === 'vencido'
                    ? 'bg-danger text-white'
                    : 'bg-warn text-ink-950'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              {g === 'vencido' ? 'Vencidos' : 'Por vencer'} ({conteo[g]})
            </button>
          ))}
        </div>

        {cargando ? (
          <Skeleton className="h-80 !rounded-3xl" />
        ) : cola.length === 0 ? (
          <EmptyState
            icono={<IconCheck />}
            titulo={grupo === 'vencido' ? 'No hay vencidos' : 'Nadie por vencer'}
            texto="No hay a quién recordarle nada por ahora."
            accion={<ButtonLink to="/">Volver al inicio</ButtonLink>}
          />
        ) : (
          <>
            {/* Progreso */}
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-ink-400">
                <span>
                  {hechos} de {cola.length} recordados
                </span>
                {hechos > 0 && (
                  <button onClick={reiniciar} className="text-ink-300 underline-offset-2 hover:underline">
                    Empezar de nuevo
                  </button>
                )}
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full bg-[#25d366] transition-all duration-500"
                  style={{ width: `${(hechos / cola.length) * 100}%` }}
                />
              </div>
            </div>

            {actual ? (
              <article key={actual.id} className="animate-pop rounded-3xl border border-ink-800 bg-ink-900 p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink-800 font-display text-3xl tracking-wide text-lime-neon">
                    {iniciales(actual)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/socios/${actual.id}`} className="flex items-center gap-1 text-xl font-bold">
                      <span className="truncate">{nombreCompleto(actual)}</span>
                      <IconChevronRight className="shrink-0 text-ink-600" />
                    </Link>
                    <p className="text-xs text-ink-400">
                      Plan {PLAN_LABEL[actual.plan]} · venc. {formatearFecha(actual.fechaVencimiento)}
                    </p>
                    <EstadoBadge
                      estado={actual.estado}
                      diasRestantes={actual.diasRestantes}
                      detallado
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl rounded-tl-sm bg-[#005c4b] px-4 py-3 text-[15px] leading-relaxed text-white shadow-inner">
                  {mensajeRecordatorio(actual)}
                </div>

                <a
                  href={linkWhatsapp(actual.celular, mensajeRecordatorio(actual))}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => marcar(actual.id)}
                  className="mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25d366] text-base font-bold text-ink-950 transition active:scale-[0.97]"
                >
                  <IconWhatsapp className="text-2xl" /> Enviar y pasar al siguiente
                </a>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Button variante="secondary" className="!px-2 text-sm" onClick={() => marcar(actual.id)}>
                    Saltear
                  </Button>
                  <a
                    href={linkTelefono(actual.celular)}
                    className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border border-ink-700 bg-ink-800 text-sm font-bold"
                  >
                    <IconPhone /> Llamar
                  </a>
                  <Button
                    variante="secondary"
                    className="!px-2 text-sm"
                    icono={<IconCash />}
                    onClick={() => abrirPago(actual)}
                  >
                    Pagó
                  </Button>
                </div>

                {pendientes.length > 1 && (
                  <p className="mt-4 text-center text-xs text-ink-400">
                    Sigue: {nombreCompleto(pendientes[1])}
                    {pendientes.length > 2 && ` y ${pendientes.length - 2} más`}
                  </p>
                )}
              </article>
            ) : (
              <EmptyState
                icono={<IconCheck />}
                titulo="¡Listo!"
                texto={`Ya les recordaste a todos los ${grupo === 'vencido' ? 'vencidos' : 'que están por vencer'}.`}
                accion={
                  <div className="flex gap-2">
                    <Button variante="secondary" onClick={reiniciar}>
                      Repetir
                    </Button>
                    <ButtonLink to="/">Ir al inicio</ButtonLink>
                  </div>
                }
              />
            )}
          </>
        )}
      </section>
    </>
  )
}
