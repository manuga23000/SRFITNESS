import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePagoModal } from '../../hooks/usePagoModal'
import { formatearFecha } from '../../lib/dates'
import { iniciales, nombreCompleto } from '../../lib/format'
import { linkTelefono, linkWhatsapp, mensajeRecordatorio } from '../../lib/whatsapp'
import type { SocioConEstado } from '../../types'
import { IconCash, IconChevronRight, IconPhone, IconWhatsapp } from '../ui/icons'
import { EstadoBadge } from './EstadoBadge'
import { PLAN_LABEL } from '../../lib/etiquetas'

interface Props {
  socio: SocioConEstado
  indice?: number
  /** Reemplaza la fila de acciones (ej: "Reactivar" en socios dados de baja). */
  acciones?: ReactNode
}

const acento: Record<SocioConEstado['estado'], string> = {
  'al-dia': 'from-ok/70',
  'por-vencer': 'from-warn/80',
  vencido: 'from-danger/90',
}

const avatar: Record<SocioConEstado['estado'], string> = {
  'al-dia': 'bg-ok/15 text-ok',
  'por-vencer': 'bg-warn/15 text-warn',
  vencido: 'bg-danger/15 text-danger',
}

export function SocioCard({ socio, indice = 0, acciones }: Props) {
  const { abrirPago } = usePagoModal()
  return (
    <article
      className="relative animate-fade-up overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 transition hover:border-ink-700"
      style={{ animationDelay: `${Math.min(indice, 10) * 30}ms` }}
    >
      {socio.activo && (
        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${acento[socio.estado]} to-transparent`} />
      )}

      <Link to={`/socios/${socio.id}`} className="flex items-center gap-3 p-4 pb-3 active:bg-ink-850">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-display text-xl tracking-wide ${
            socio.activo ? avatar[socio.estado] : 'bg-ink-800 text-ink-400'
          }`}
        >
          {iniciales(socio)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[17px] leading-tight font-bold">{nombreCompleto(socio)}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {socio.activo ? (
              <EstadoBadge estado={socio.estado} diasRestantes={socio.diasRestantes} />
            ) : (
              <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs font-bold text-ink-400 ring-1 ring-ink-700 ring-inset">
                De baja
              </span>
            )}
            <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink-300">
              {PLAN_LABEL[socio.plan]}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <span className="text-[10px] font-semibold tracking-wider text-ink-400 uppercase">Vence</span>
          <span className="font-display text-lg leading-none tracking-wide tabular-nums">
            {formatearFecha(socio.fechaVencimiento)}
          </span>
        </div>
        <IconChevronRight className="-mr-1 shrink-0 text-ink-600" />
      </Link>

      {acciones ? (
        <div className="px-4 pb-4">{acciones}</div>
      ) : (
        socio.activo && (
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 pb-4">
            <button
              onClick={() => abrirPago(socio)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[0.97] ${
                socio.estado === 'al-dia'
                  ? 'border border-ink-700 bg-ink-800 text-white hover:bg-ink-700'
                  : 'bg-lime-neon text-ink-950 hover:bg-lime-soft'
              }`}
            >
              <IconCash className="text-lg" />
              Registrar pago
            </button>
            <a
              href={linkWhatsapp(socio.celular, mensajeRecordatorio(socio))}
              target="_blank"
              rel="noreferrer"
              aria-label={`WhatsApp a ${socio.nombre}`}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-[#25d366]/15 text-2xl text-[#25d366] transition hover:bg-[#25d366]/25 active:scale-90"
            >
              <IconWhatsapp />
            </a>
            <a
              href={linkTelefono(socio.celular)}
              aria-label={`Llamar a ${socio.nombre}`}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-ink-800 text-xl text-ink-300 transition hover:bg-ink-700 hover:text-white active:scale-90"
            >
              <IconPhone />
            </a>
          </div>
        )
      )}
    </article>
  )
}
