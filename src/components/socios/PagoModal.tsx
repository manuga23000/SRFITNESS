import { useState, type FormEvent } from 'react'
import { usePrecios } from '../../hooks/usePrecios'
import { useToast } from '../../hooks/useToast'
import { aInputDate, desdeInputDate, formatearFecha, hoy, vencimientoPorDefecto } from '../../lib/dates'
import { montoParaInput, nombreCompleto, parsearMonto } from '../../lib/format'
import { registrarPago } from '../../services/pagosService'
import type { Plan, SocioConEstado } from '../../types'
import { Button } from '../ui/Button'
import { IconCheck } from '../ui/icons'
import { Modal } from '../ui/Modal'
import { MontoInput } from '../ui/MontoInput'
import { PlanSelector } from './PlanSelector'

interface Props {
  socio: SocioConEstado | null
  onCerrar: () => void
}

export function PagoModal({ socio, onCerrar }: Props) {
  return (
    <Modal abierto={socio !== null} onCerrar={onCerrar} titulo="Registrar pago">
      {/* key: el formulario arranca de cero para cada socio */}
      {socio && <FormularioPago key={socio.id} socio={socio} onListo={onCerrar} />}
    </Modal>
  )
}

function FormularioPago({ socio, onListo }: { socio: SocioConEstado; onListo: () => void }) {
  const { precios } = usePrecios()
  const toast = useToast()
  const [plan, setPlan] = useState<Plan>(socio.plan)
  const [fecha, setFecha] = useState(aInputDate(hoy()))
  const [vencimiento, setVencimiento] = useState(aInputDate(vencimientoPorDefecto(hoy())))
  const [editandoVenc, setEditandoVenc] = useState(false)
  const [monto, setMonto] = useState(() => montoParaInput(precios[socio.plan] || socio.montoUltimoPago))
  const [montoManual, setMontoManual] = useState(false)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [listo, setListo] = useState(false)

  // Los precios pueden llegar un instante después de abrir el modal.
  const [preciosPrevios, setPreciosPrevios] = useState(precios)
  if (precios !== preciosPrevios) {
    setPreciosPrevios(precios)
    if (!montoManual && precios[plan] > 0) setMonto(montoParaInput(precios[plan]))
  }

  function elegirPlan(p: Plan) {
    setPlan(p)
    if (!montoManual) setMonto(montoParaInput(precios[p] || (p === socio.plan ? socio.montoUltimoPago : undefined)))
  }

  function cambiarFecha(valor: string) {
    setFecha(valor)
    const f = desdeInputDate(valor)
    if (f && !editandoVenc) setVencimiento(aInputDate(vencimientoPorDefecto(f)))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const f = desdeInputDate(fecha)
    const v = desdeInputDate(vencimiento)
    const m = parsearMonto(monto)
    if (!f) return setError('Elegí la fecha del pago')
    if (f > hoy()) return setError('La fecha no puede ser futura')
    if (!v || v <= f) return setError('El vencimiento tiene que ser posterior al pago')
    if (m === null || m <= 0) return setError('Ingresá el monto')
    setError('')
    setGuardando(true)
    try {
      await registrarPago(socio.id, { fecha: f, monto: m, plan, fechaVencimiento: v })
      setListo(true)
      navigator.vibrate?.([30, 40, 30])
      toast.ok(`Pago de ${socio.nombre} registrado ✓`)
      setTimeout(onListo, 650)
    } catch (err) {
      console.error(err)
      toast.error('No se pudo registrar el pago')
      setGuardando(false)
    }
  }

  if (listo) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="grid h-20 w-20 animate-pop place-items-center rounded-full bg-lime-neon text-5xl text-ink-950 shadow-[0_0_50px_-5px] shadow-lime-neon">
          <IconCheck strokeWidth={3} />
        </div>
        <p className="mt-4 font-display text-3xl tracking-wide">¡Pago registrado!</p>
        <p className="text-sm text-ink-400">Nuevo vencimiento: {formatearFecha(desdeInputDate(vencimiento))}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="flex items-center justify-between rounded-2xl bg-ink-850 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-bold">{nombreCompleto(socio)}</div>
          <div className="text-xs text-ink-400">
            {socio.estado === 'vencido' ? 'Venció' : 'Vence'} el {formatearFecha(socio.fechaVencimiento)}
          </div>
        </div>
      </div>

      <div>
        <span className="label">Plan</span>
        <PlanSelector valor={plan} onChange={elegirPlan} precios={precios} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pago-fecha" className="label">
            Fecha
          </label>
          <input
            id="pago-fecha"
            type="date"
            className="field"
            max={aInputDate(hoy())}
            value={fecha}
            onChange={(e) => cambiarFecha(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pago-monto" className="label">
            Monto
          </label>
          <MontoInput
            id="pago-monto"
            valor={monto}
            onChange={(v) => {
              setMonto(v)
              setMontoManual(true)
            }}
          />
        </div>
      </div>

      {editandoVenc ? (
        <div>
          <label htmlFor="pago-venc" className="label">
            Nuevo vencimiento
          </label>
          <input
            id="pago-venc"
            type="date"
            className="field"
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-lime-neon/30 bg-lime-neon/5 px-4 py-3">
          <div>
            <div className="text-xs font-semibold tracking-wider text-ink-400 uppercase">Nuevo vencimiento</div>
            <div className="font-display text-3xl leading-none tracking-wide text-lime-neon">
              {formatearFecha(desdeInputDate(vencimiento))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditandoVenc(true)}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-300 underline-offset-4 hover:underline"
          >
            Cambiar
          </button>
        </div>
      )}

      {error && (
        <p className="animate-pop rounded-xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">{error}</p>
      )}

      <Button type="submit" bloque cargando={guardando} className="min-h-14 text-base tracking-wide uppercase">
        Confirmar pago
      </Button>
    </form>
  )
}
