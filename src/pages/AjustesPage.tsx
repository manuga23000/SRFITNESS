import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { IconChevronRight, IconLogout, IconUserOff } from '../components/ui/icons'
import { MontoInput } from '../components/ui/MontoInput'
import { Skeleton } from '../components/ui/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { usePrecios } from '../hooks/usePrecios'
import { useSocios } from '../hooks/useSocios'
import { useToast } from '../hooks/useToast'
import { PLAN_DETALLE, PLAN_LABEL } from '../lib/etiquetas'
import { montoParaInput, parsearMonto } from '../lib/format'
import { guardarPrecios } from '../services/preciosService'
import { PLANES, type Plan, type Precios } from '../types'

export function AjustesPage() {
  const { user, cerrarSesion } = useAuth()
  const { precios, cargando } = usePrecios()
  const { resumen } = useSocios()

  return (
    <>
      <PageHeader titulo="Ajustes" subtitulo={user?.email ?? undefined} />
      <section className="space-y-8 px-4 pt-5 md:px-6">
        <div>
          <h2 className="font-display text-2xl tracking-wide">Precios de los planes</h2>
          <p className="mb-4 text-sm text-ink-400">Se usan para autocompletar el monto al registrar un pago.</p>
          {cargando ? (
            <div className="space-y-3">
              {PLANES.map((p) => (
                <Skeleton key={p} className="h-20 !rounded-2xl" />
              ))}
            </div>
          ) : (
            // key: si los precios cambian desde otro dispositivo, el formulario se actualiza
            <FormPrecios key={JSON.stringify(precios)} precios={precios} />
          )}
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-2xl tracking-wide">Cuenta</h2>
          <Link
            to="/inactivos"
            className="flex items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900 px-4 py-4 transition hover:border-ink-700 active:scale-[0.99]"
          >
            <IconUserOff className="text-xl text-ink-400" />
            <span className="flex-1 font-semibold">Socios inactivos</span>
            <span className="text-sm text-ink-400">{resumen.inactivos}</span>
            <IconChevronRight className="text-ink-600" />
          </Link>
          <Button variante="secondary" bloque icono={<IconLogout />} onClick={() => cerrarSesion()}>
            Cerrar sesión
          </Button>
        </div>

        <p className="pb-4 text-center text-xs text-ink-600">SR Fitness Gym · Control de cuotas</p>
      </section>
    </>
  )
}

function FormPrecios({ precios }: { precios: Precios }) {
  const toast = useToast()
  const [valores, setValores] = useState<Record<Plan, string>>(() => {
    const v = {} as Record<Plan, string>
    for (const p of PLANES) v[p] = precios[p] > 0 ? montoParaInput(precios[p]) : ''
    return v
  })
  const [guardando, setGuardando] = useState(false)
  const cambios = PLANES.some((p) => (parsearMonto(valores[p]) ?? 0) !== precios[p])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const nuevos = {} as Precios
    for (const p of PLANES) nuevos[p] = parsearMonto(valores[p]) ?? 0
    setGuardando(true)
    try {
      await guardarPrecios(nuevos)
      toast.ok('Precios actualizados')
    } catch {
      toast.error('No se pudieron guardar los precios')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {PLANES.map((p) => (
        <div key={p} className="flex items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 p-3 pl-4">
          <label htmlFor={`precio-${p}`} className="w-24 shrink-0">
            <span className="block font-display text-2xl leading-none tracking-wide">{PLAN_LABEL[p]}</span>
            <span className="text-[11px] text-ink-400">{PLAN_DETALLE[p]}</span>
          </label>
          <div className="flex-1">
            <MontoInput id={`precio-${p}`} valor={valores[p]} onChange={(v) => setValores((s) => ({ ...s, [p]: v }))} />
          </div>
        </div>
      ))}
      <Button type="submit" bloque cargando={guardando} disabled={!cambios}>
        Guardar precios
      </Button>
    </form>
  )
}
