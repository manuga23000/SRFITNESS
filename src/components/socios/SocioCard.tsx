import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatearFecha } from '../../lib/dates'
import { iniciales, nombreCompleto } from '../../lib/format'
import { linkTelefono, linkWhatsapp, mensajeRecordatorio } from '../../lib/whatsapp'
import type { SocioConEstado } from '../../types'
import { IconCash, IconChevronRight, IconPhone, IconWhatsapp } from '../ui/icons'
import { EstadoBadge } from './EstadoBadge'
import { PLAN_LABEL } from '../../lib/etiquetas'

interface Props {
  socio: SocioConEstado
  onPagar?: (socio: SocioConEstado) => void
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

export function SocioCard({ socio, onPagar, indice = 0, acciones }: Props) {
  return (
    <article
      className="animate-fade-up relative overflow-hidden rounded-3xl border border-ink-800 bg-ink-900 transition hover:border-ink-700"
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
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-400">
            <span className="rounded-md bg-ink-800 px-1.5 py-0.5 font-semibold text-ink-300">
              {PLAN_LABEL[socio.plan]}
            </span>
            <span>Vence {formatearFecha(socio.fechaVencimiento)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {socio.activo ? (
            <EstadoBadge estado={socio.estado} diasRestantes={socio.diasRestantes} />
          ) : (
            <span className="rounded-full bg-ink-800 px-2.5 py-1 text-xs font-bold text-ink-400 ring-1 ring-ink-700 ring-inset">
              De baja
            </span>
          )}
          <IconChevronRight className="text-ink-600" />
        </div>
      </Link>

      {acciones ? (
        <div className="px-4 pb-4">{acciones}</div>
      ) : (
        socio.activo && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 pb-4">
          {onPagar ? (
            <button
              onClick={() => onPagar(socio)}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[0.97] ${
                socio.estado === 'al-dia'
                  ? 'border border-ink-700 bg-ink-800 text-white hover:bg-ink-700'
                  : 'bg-lime-neon text-ink-950 hover:bg-lime-soft'
              }`}
            >
              <IconCash className="text-lg" />
              Registrar pago
            </button>
          ) : (
            <span />
          )}
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
