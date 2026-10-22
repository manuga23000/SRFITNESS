import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { EstadoBadge } from '../components/socios/EstadoBadge'
import { HistorialAvisos } from '../components/socios/HistorialAvisos'
import { HistorialPagos } from '../components/socios/HistorialPagos'
import { PLAN_LABEL } from '../lib/etiquetas'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { IconCash, IconEdit, IconTrash, IconUserCheck, IconUserOff, IconWhatsapp } from '../components/ui/icons'
import { Skeleton } from '../components/ui/Skeleton'
import { usePagoModal } from '../hooks/usePagoModal'
import { useSocio } from '../hooks/useSocios'
import { useToast } from '../hooks/useToast'
import { formatearFecha } from '../lib/dates'
import { formatearCelular, formatearMonto, iniciales, nombreCompleto } from '../lib/format'
import { linkWhatsapp, mensajeRecordatorio } from '../lib/whatsapp'
import { cambiarActivo, eliminarSocio } from '../services/sociosService'
import { SocioNoEncontrado } from './SocioNoEncontrado'

const fondoEstado = {
  'al-dia': 'from-ok/25',
  'por-vencer': 'from-warn/25',
  vencido: 'from-danger/30',
} as const

export function DetalleSocioPage() {
  const { id } = useParams()
  const { socio, cargando } = useSocio(id)
  const toast = useToast()
  const { abrirPago } = usePagoModal()
  const navigate = useNavigate()
  const [dialogo, setDialogo] = useState<'baja' | 'eliminar' | null>(null)
  const [eliminado, setEliminado] = useState(false)

  if (!cargando && !socio && !eliminado) return <SocioNoEncontrado />

  async function darDeBaja() {
    if (!socio) return
    try {
      await cambiarActivo(socio.id, false)
      toast.ok(`${socio.nombre} quedó dado de baja`)
      setDialogo(null)
    } catch {
      toast.error('No se pudo dar de baja')
    }
  }

  async function reactivar() {
    if (!socio) return
    try {
      await cambiarActivo(socio.id, true)
      toast.ok(`${socio.nombre} volvió a estar activo`)
    } catch {
      toast.error('No se pudo reactivar')
    }
  }

  async function eliminar() {
    if (!socio) return
    try {
      setEliminado(true)
      await eliminarSocio(socio.id)
      toast.ok('Socio eliminado')
      navigate('/socios', { replace: true })
    } catch {
      setEliminado(false)
      toast.error('No se pudo eliminar el socio')
    }
  }

  return (
    <>
      <PageHeader
        titulo={socio ? nombreCompleto(socio) : 'Socio'}
        volver
        acciones={
          socio && (
            <Link
              to={`/socios/${socio.id}/editar`}
              aria-label="Editar socio"
              className="grid h-11 w-11 place-items-center rounded-full bg-ink-800 text-lg text-ink-300 transition hover:text-white active:scale-90"
            >
              <IconEdit />
            </Link>
          )
        }
      />

      {!socio ? (
        <section className="space-y-4 px-4 pt-4 md:px-6">
          <Skeleton className="h-48 !rounded-3xl" />
          <Skeleton className="h-14" />
          <Skeleton className="h-32 !rounded-3xl" />
        </section>
      ) : (
        <section className="space-y-6 px-4 pt-4 md:px-6">
          {/* Tarjeta principal */}
          <div
            className={`relative overflow-hidden rounded-3xl border border-ink-800 bg-gradient-to-br ${
              socio.activo ? fondoEstado[socio.estado] : 'from-ink-800'
            } via-ink-900 to-ink-900 p-5`}
          >
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink-950/60 font-display text-3xl tracking-wide text-lime-neon">
                {iniciales(socio)}
              </div>
              <div className="min-w-0 flex-1">
                {socio.activo ? (
                  <EstadoBadge estado={socio.estado} diasRestantes={socio.diasRestantes} detallado />
                ) : (
                  <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs font-bold text-ink-300">De baja</span>
                )}
                <p className="mt-2 text-xs font-semibold tracking-wider text-ink-400 uppercase">Vence el</p>
                <p className="font-display text-4xl leading-none tracking-wide">
                  {formatearFecha(socio.fechaVencimiento)}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Dato label="Plan" valor={PLAN_LABEL[socio.plan]} />
              <Dato label="Celular" valor={socio.celular ? formatearCelular(socio.celular) : '—'} />
              <Dato label="Último pago" valor={formatearFecha(socio.fechaUltimoPago)} />
              <Dato label="Monto" valor={formatearMonto(socio.montoUltimoPago)} />
              {socio.email && (
                <div className="col-span-2">
                  <Dato label="Email" valor={socio.email} />
                </div>
              )}
            </dl>

            {socio.notas && (
              <p className="mt-4 rounded-2xl bg-ink-950/50 px-4 py-3 text-sm whitespace-pre-line text-ink-300">
                {socio.notas}
              </p>
            )}
          </div>

          <Button
            bloque
            icono={<IconCash className="text-xl" />}
            onClick={() => abrirPago(socio)}
            className="min-h-14 text-base tracking-wide uppercase"
          >
            Registrar pago
          </Button>

          {socio.celular && (
            <a
              href={linkWhatsapp(socio.celular, mensajeRecordatorio(socio))}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#25d366] font-bold text-ink-950 transition active:scale-[0.97]"
            >
              <IconWhatsapp className="text-xl" /> WhatsApp
            </a>
          )}

          <HistorialPagos socioId={socio.id} />
          <HistorialAvisos socioId={socio.id} />

          {/* Zona de baja / eliminación */}
          <div className="grid grid-cols-2 gap-3 border-t border-ink-800 pt-6">
            {socio.activo ? (
              <Button variante="secondary" icono={<IconUserOff />} onClick={() => setDialogo('baja')}>
                Dar de baja
              </Button>
            ) : (
              <Button variante="secondary" icono={<IconUserCheck />} onClick={reactivar}>
                Reactivar
              </Button>
            )}
            <Button variante="danger" icono={<IconTrash />} onClick={() => setDialogo('eliminar')}>
              Eliminar
            </Button>
          </div>

          <ConfirmDialog
            abierto={dialogo === 'baja'}
            titulo="Dar de baja"
            mensaje={
              <>
                <strong className="text-white">{nombreCompleto(socio)}</strong> va a pasar a la lista de inactivos. No
                se borra nada: podés reactivarlo cuando vuelva.
              </>
            }
            textoConfirmar="Dar de baja"
            onConfirmar={darDeBaja}
            onCerrar={() => setDialogo(null)}
          />
          <ConfirmDialog
            abierto={dialogo === 'eliminar'}
            titulo="Eliminar socio"
            peligroso
            mensaje={
              <>
                Se van a borrar <strong className="text-white">{nombreCompleto(socio)}</strong> y todo su historial de
                pagos. <strong className="text-danger">No se puede deshacer.</strong> Si solo dejó de venir, mejor dalo
                de baja.
              </>
            }
            textoConfirmar="Eliminar"
            onConfirmar={eliminar}
            onCerrar={() => setDialogo(null)}
          />
        </section>
      )}
    </>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="rounded-2xl bg-ink-950/50 px-3.5 py-2.5">
      <dt className="text-[11px] font-semibold tracking-wider text-ink-400 uppercase">{label}</dt>
      <dd className="mt-0.5 truncate font-semibold">{valor}</dd>
    </div>
  )
}
