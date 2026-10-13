import { useState, type FormEvent, type ReactNode } from 'react'
import { aInputDate, desdeInputDate, formatearFecha, hoy, vencimientoPorDefecto } from '../../lib/dates'
import { capitalizar, celularValido, montoParaInput, normalizarCelular, parsearMonto } from '../../lib/format'
import type { Plan, Precios, Socio, SocioInput } from '../../types'
import { Button } from '../ui/Button'
import { MontoInput } from '../ui/MontoInput'
import { PlanSelector } from './PlanSelector'

interface Props {
  inicial?: Socio
  precios: Precios
  textoGuardar: string
  onGuardar: (datos: SocioInput) => Promise<void>
}

type Errores = Partial<
  Record<'nombre' | 'apellido' | 'celular' | 'fechaUltimoPago' | 'fechaVencimiento' | 'monto', string>
>

export function SocioForm({ inicial, precios, textoGuardar, onGuardar }: Props) {
  const esEdicion = Boolean(inicial)
  const [nombre, setNombre] = useState(inicial?.nombre ?? '')
  const [apellido, setApellido] = useState(inicial?.apellido ?? '')
  const [celular, setCelular] = useState(inicial?.celular ?? '')
  const [plan, setPlan] = useState<Plan>(inicial?.plan ?? '3 veces')
  const [fechaPago, setFechaPago] = useState(aInputDate(inicial?.fechaUltimoPago ?? hoy()))
  const [vencimiento, setVencimiento] = useState(aInputDate(inicial?.fechaVencimiento ?? vencimientoPorDefecto(hoy())))
  // Mientras no se toque a mano, el vencimiento sigue a la fecha de pago (+1 mes).
  const [vencimientoManual, setVencimientoManual] = useState(
    () =>
      inicial !== undefined &&
      inicial.fechaVencimiento.getTime() !== vencimientoPorDefecto(inicial.fechaUltimoPago).getTime(),
  )
  const [mostrarVencimiento, setMostrarVencimiento] = useState(esEdicion)
  const [monto, setMonto] = useState(montoParaInput(inicial ? inicial.montoUltimoPago : precios[plan] || undefined))
  const [montoManual, setMontoManual] = useState(esEdicion)
  const [notas, setNotas] = useState(inicial?.notas ?? '')
  const [errores, setErrores] = useState<Errores>({})
  const [guardando, setGuardando] = useState(false)

  // Si los precios llegan después de montar el formulario, se completa el monto.
  const [preciosPrevios, setPreciosPrevios] = useState(precios)
  if (precios !== preciosPrevios) {
    setPreciosPrevios(precios)
    if (!montoManual && precios[plan] > 0) setMonto(montoParaInput(precios[plan]))
  }

  function elegirPlan(p: Plan) {
    setPlan(p)
    if (!montoManual) setMonto(precios[p] > 0 ? montoParaInput(precios[p]) : '')
  }

  function cambiarFechaPago(valor: string) {
    setFechaPago(valor)
    const fecha = desdeInputDate(valor)
    if (fecha && !vencimientoManual) setVencimiento(aInputDate(vencimientoPorDefecto(fecha)))
  }

  function validar(): SocioInput | null {
    const e: Errores = {}
    const cel = normalizarCelular(celular)
    const fPago = desdeInputDate(fechaPago)
    const fVenc = desdeInputDate(vencimiento)
    const montoNum = parsearMonto(monto)

    if (nombre.trim().length < 2) e.nombre = 'Ingresá el nombre'
    if (apellido.trim().length < 2) e.apellido = 'Ingresá el apellido'
    if (!celularValido(cel)) e.celular = 'Con código de área, sin 0 ni 15 (ej: 3364123456)'
    if (!fPago) e.fechaUltimoPago = 'Elegí la fecha de pago'
    else if (fPago > hoy()) e.fechaUltimoPago = 'La fecha de pago no puede ser futura'
    if (!fVenc) e.fechaVencimiento = 'Elegí la fecha de vencimiento'
    else if (fPago && fVenc <= fPago) e.fechaVencimiento = 'Tiene que ser posterior a la fecha de pago'
    if (!esEdicion && (montoNum === null || montoNum <= 0)) e.monto = 'Ingresá el monto que pagó'

    setErrores(e)
    if (Object.keys(e).length > 0) return null
    return {
      nombre: capitalizar(nombre),
      apellido: capitalizar(apellido),
      celular: cel,
      plan,
      fechaUltimoPago: fPago!,
      fechaVencimiento: fVenc!,
      montoUltimoPago: montoNum ?? undefined,
      notas: notas.trim() || undefined,
    }
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    const datos = validar()
    if (!datos) {
      navigator.vibrate?.(60)
      // Lleva al primer campo con error (el encabezado fijo tapa la parte de arriba).
      requestAnimationFrame(() => {
        const campo = document.querySelector<HTMLElement>('form [data-error="true"]')
        campo?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        campo?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true })
      })
      return
    }
    setGuardando(true)
    try {
      await onGuardar(datos)
    } finally {
      setGuardando(false)
    }
  }

  const vencimientoFecha = desdeInputDate(vencimiento)

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="nombre" label="Nombre" error={errores.nombre}>
          <input
            id="nombre"
            className={`field ${errores.nombre ? '!border-danger' : ''}`}
            autoComplete="off"
            autoCapitalize="words"
            placeholder="Juan"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </Campo>
        <Campo id="apellido" label="Apellido" error={errores.apellido}>
          <input
            id="apellido"
            className={`field ${errores.apellido ? '!border-danger' : ''}`}
            autoComplete="off"
            autoCapitalize="words"
            placeholder="Pérez"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />
        </Campo>
      </div>

      <Campo id="celular" label="Celular" error={errores.celular} ayuda="Código de área + número, sin 0 ni 15">
        <input
          id="celular"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          className={`field font-semibold tracking-wider ${errores.celular ? '!border-danger' : ''}`}
          placeholder="3364123456"
          value={celular}
          onChange={(e) => setCelular(e.target.value)}
          onBlur={() => {
            const n = normalizarCelular(celular)
            if (celularValido(n)) setCelular(n)
          }}
        />
      </Campo>

      <div>
        <span className="label">Plan</span>
        <PlanSelector valor={plan} onChange={elegirPlan} precios={precios} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo id="fechaPago" label={esEdicion ? 'Último pago' : 'Fecha de pago'} error={errores.fechaUltimoPago}>
          <input
            id="fechaPago"
            type="date"
            className={`field ${errores.fechaUltimoPago ? '!border-danger' : ''}`}
            max={aInputDate(hoy())}
            value={fechaPago}
            onChange={(e) => cambiarFechaPago(e.target.value)}
          />
        </Campo>
        <Campo id="monto" label={esEdicion ? 'Monto último pago' : 'Monto'} error={errores.monto}>
          <MontoInput
            id="monto"
            valor={monto}
            invalido={Boolean(errores.monto)}
            onChange={(v) => {
              setMonto(v)
              setMontoManual(true)
            }}
          />
        </Campo>
      </div>

      {mostrarVencimiento ? (
        <Campo
          id="vencimiento"
          label="Vencimiento"
          error={errores.fechaVencimiento}
          ayuda="Por defecto, un mes después del pago"
        >
          <input
            id="vencimiento"
            type="date"
            className={`field ${errores.fechaVencimiento ? '!border-danger' : ''}`}
            value={vencimiento}
            onChange={(e) => {
              setVencimiento(e.target.value)
              setVencimientoManual(true)
            }}
          />
        </Campo>
      ) : (
        <div className="flex items-center justify-between rounded-2xl border border-ink-800 bg-ink-900 px-4 py-3">
          <div>
            <div className="text-xs font-semibold tracking-wider text-ink-400 uppercase">Vence el</div>
            <div className="font-display text-2xl tracking-wide text-lime-neon">{formatearFecha(vencimientoFecha)}</div>
          </div>
          <button
            type="button"
            onClick={() => setMostrarVencimiento(true)}
            className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-300 underline-offset-4 hover:underline"
          >
            Cambiar
          </button>
        </div>
      )}

      <Campo id="notas" label="Notas (opcional)">
        <textarea
          id="notas"
          rows={2}
          className="field resize-none"
          placeholder="Lesiones, horarios, lo que quieras recordar…"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </Campo>

      <Button type="submit" bloque cargando={guardando} className="min-h-14 text-base tracking-wide uppercase">
        {textoGuardar}
      </Button>
    </form>
  )
}

function Campo({
  id,
  label,
  error,
  ayuda,
  children,
}: {
  id: string
  label: string
  error?: string
  ayuda?: string
  children: ReactNode
}) {
  return (
    <div data-error={Boolean(error)}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 animate-pop text-xs font-semibold text-danger">{error}</p>
      ) : (
        ayuda && <p className="mt-1.5 text-xs text-ink-400">{ayuda}</p>
      )}
    </div>
  )
}
