import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { IconChevronLeft, IconChevronRight, IconDownload, IconShare } from '../components/ui/icons'
import { Skeleton } from '../components/ui/Skeleton'
import { useSocios } from '../hooks/useSocios'
import { useToast } from '../hooks/useToast'
import { formatearFecha } from '../lib/dates'
import { PLAN_LABEL } from '../lib/etiquetas'
import { formatearMonto } from '../lib/format'
import { armarResumen, finDeMes, inicioDeMes, nombreMes } from '../lib/resumen'
import { obtenerPagosEntre } from '../services/pagosService'
import type { Pago } from '../types'

export function ResumenPage() {
  const { todos, cargando: cargandoSocios } = useSocios()
  const toast = useToast()
  const [hoy] = useState(() => new Date())
  const [mes, setMes] = useState(() => inicioDeMes(hoy))
  const [pagos, setPagos] = useState<{ clave: string; porSocio: Map<string, Pago[]> } | null>(null)
  const [error, setError] = useState(false)
  const [generando, setGenerando] = useState<'descargar' | 'compartir' | null>(null)

  const esMesActual = mes.getTime() === inicioDeMes(hoy).getTime()
  const idsSocios = useMemo(() => todos.map((s) => s.id).join(','), [todos])
  const clave = `${mes.getTime()}|${idsSocios}`

  // Trae los pagos del mes de cada socio (activos e inactivos: alguien pudo pagar y después darse de baja).
  useEffect(() => {
    if (cargandoSocios) return
    let cancelado = false
    const ids = idsSocios ? idsSocios.split(',') : []
    Promise.all(ids.map(async (id) => [id, await obtenerPagosEntre(id, mes, finDeMes(mes))] as const))
      .then((lista) => {
        if (!cancelado) setPagos({ clave, porSocio: new Map(lista) })
      })
      .catch((e) => {
        console.error(e)
        if (!cancelado) setError(true)
      })
    return () => {
      cancelado = true
    }
  }, [cargandoSocios, idsSocios, mes, clave])

  const listo = pagos?.clave === clave
  const resumen = useMemo(
    () => (listo && pagos ? armarResumen(todos, pagos.porSocio, mes, hoy) : null),
    [listo, pagos, todos, mes, hoy],
  )

  function cambiarMes(delta: number) {
    setError(false)
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))
  }

  async function crearPdf() {
    const { generarPdfResumen, nombreArchivoResumen } = await import('../lib/pdfResumen')
    const doc = generarPdfResumen(resumen!)
    return { doc, nombre: nombreArchivoResumen(resumen!) }
  }

  async function descargar() {
    setGenerando('descargar')
    try {
      const { doc, nombre } = await crearPdf()
      doc.save(nombre)
      toast.ok('Resumen descargado')
    } catch (e) {
      console.error(e)
      toast.error('No se pudo generar el PDF')
    } finally {
      setGenerando(null)
    }
  }

  // En el celu abre el menú de compartir (WhatsApp, mail…) con el PDF adjunto.
  const puedeCompartir = typeof navigator.canShare === 'function'
  async function compartir() {
    setGenerando('compartir')
    try {
      const { doc, nombre } = await crearPdf()
      const archivo = new File([doc.output('blob')], nombre, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], title: `Resumen ${nombreMes(mes)} - SR Fitness Gym` })
      } else {
        doc.save(nombre)
        toast.info('Tu navegador no permite compartir: se descargó el PDF')
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.error(e)
        toast.error('No se pudo compartir el PDF')
      }
    } finally {
      setGenerando(null)
    }
  }

  return (
    <>
      <PageHeader titulo="Resumen" subtitulo="Reporte mensual en PDF" volver />
      <section className="space-y-5 px-4 pt-4 md:px-6">
        {/* Selector de mes */}
        <div className="flex items-center justify-between rounded-2xl border border-ink-800 bg-ink-900 p-2">
          <button
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
            className="grid h-11 w-11 place-items-center rounded-xl text-xl text-ink-300 transition hover:bg-ink-800 active:scale-90"
          >
            <IconChevronLeft />
          </button>
          <div className="font-display text-3xl tracking-wide">{nombreMes(mes)}</div>
          <button
            onClick={() => cambiarMes(1)}
            disabled={esMesActual}
            aria-label="Mes siguiente"
            className="grid h-11 w-11 place-items-center rounded-xl text-xl text-ink-300 transition hover:bg-ink-800 active:scale-90 disabled:opacity-30"
          >
            <IconChevronRight />
          </button>
        </div>

        {error ? (
          <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            No se pudieron cargar los pagos. Revisá la conexión y volvé a entrar.
          </p>
        ) : !resumen ? (
          <div className="space-y-3">
            <Skeleton className="h-28 !rounded-3xl" />
            <Skeleton className="h-40 !rounded-3xl" />
          </div>
        ) : (
          <>
            <div className="animate-fade-up rounded-3xl border border-lime-neon/30 bg-gradient-to-br from-lime-neon/15 via-ink-900 to-ink-900 p-5">
              <p className="text-xs font-bold tracking-wider text-ink-300 uppercase">Cobrado en {nombreMes(mes)}</p>
              <p className="font-display text-5xl leading-tight tracking-wide text-lime-neon">
                {formatearMonto(resumen.totalCobrado)}
              </p>
              <p className="text-sm text-ink-400">
                {resumen.pagos.length} {resumen.pagos.length === 1 ? 'pago registrado' : 'pagos registrados'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Dato label="Activos" valor={resumen.activos} />
              <Dato label="Al día" valor={resumen.alDia} clase="text-ok" />
              <Dato label="Por vencer" valor={resumen.porVencer} clase="text-warn" />
              <Dato label="Vencidos" valor={resumen.vencidos} clase="text-danger" />
              <Dato label="Altas del mes" valor={resumen.altas.length} />
              <Dato label="Bajas del mes" valor={resumen.bajas.length} />
            </div>

            <div className="rounded-3xl border border-ink-800 bg-ink-900 p-4">
              <p className="mb-2 text-xs font-bold tracking-wider text-ink-300 uppercase">Cobrado por plan</p>
              <ul className="divide-y divide-ink-800">
                {resumen.porPlan.map((p) => (
                  <li key={p.plan} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-semibold">
                      {PLAN_LABEL[p.plan]}{' '}
                      <span className="font-normal text-ink-400">
                        · {p.cantidad} {p.cantidad === 1 ? 'pago' : 'pagos'}
                      </span>
                    </span>
                    <span className="font-bold">{formatearMonto(p.total)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-ink-400">
              El PDF incluye además el detalle de cada pago, los socios vencidos y por vencer, las altas y bajas, y el
              listado completo de socios activos. El estado de las cuotas es el del {formatearFecha(hoy)}.
            </p>

            <div className={`grid gap-3 ${puedeCompartir ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <Button
                icono={<IconDownload />}
                cargando={generando === 'descargar'}
                disabled={generando !== null}
                onClick={descargar}
                className="min-h-14"
              >
                Descargar PDF
              </Button>
              {puedeCompartir && (
                <Button
                  variante="secondary"
                  icono={<IconShare />}
                  cargando={generando === 'compartir'}
                  disabled={generando !== null}
                  onClick={compartir}
                  className="min-h-14"
                >
                  Compartir
                </Button>
              )}
            </div>
          </>
        )}
      </section>
    </>
  )
}

function Dato({ label, valor, clase = '' }: { label: string; valor: number; clase?: string }) {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900 px-4 py-3">
      <div className="text-[11px] font-semibold tracking-wider text-ink-400 uppercase">{label}</div>
      <div className={`font-display text-3xl leading-tight tracking-wide ${clase}`}>{valor}</div>
    </div>
  )
}
