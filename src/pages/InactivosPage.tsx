import { useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { SocioCard } from '../components/socios/SocioCard'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { IconSearch, IconUserCheck, IconUserOff } from '../components/ui/icons'
import { ListaSkeleton } from '../components/ui/Skeleton'
import { useSocios } from '../hooks/useSocios'
import { useToast } from '../hooks/useToast'
import { filtrarSocios } from '../lib/filtros'
import { cambiarActivo } from '../services/sociosService'
import type { SocioConEstado } from '../types'

export function InactivosPage() {
  const { inactivos, cargando } = useSocios()
  const toast = useToast()
  const [busqueda, setBusqueda] = useState('')
  const [procesando, setProcesando] = useState<string | null>(null)

  const lista = useMemo(
    () => filtrarSocios(inactivos, { busqueda, estado: null, plan: null, orden: 'nombre' }),
    [inactivos, busqueda],
  )

  async function reactivar(s: SocioConEstado) {
    setProcesando(s.id)
    try {
      await cambiarActivo(s.id, true)
      toast.ok(`${s.nombre} volvió a estar activo`)
    } catch {
      toast.error('No se pudo reactivar')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <>
      <PageHeader titulo="Inactivos" subtitulo="Socios dados de baja" volver />
      <section className="space-y-4 px-4 pt-4 md:px-6">
        {inactivos.length > 4 && (
          <div className="relative">
            <IconSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-ink-400" />
            <input
              type="search"
              placeholder="Buscar"
              className="field !rounded-full pl-11"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        )}

        {cargando ? (
          <ListaSkeleton cantidad={3} />
        ) : lista.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {lista.map((s, i) => (
              <SocioCard
                key={s.id}
                socio={s}
                indice={i}
                acciones={
                  <Button
                    variante="secondary"
                    bloque
                    icono={<IconUserCheck />}
                    cargando={procesando === s.id}
                    onClick={() => reactivar(s)}
                  >
                    Reactivar
                  </Button>
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icono={<IconUserOff />}
            titulo={busqueda ? 'Sin resultados' : 'No hay socios inactivos'}
            texto="Cuando des de baja a un socio va a aparecer acá, con su historial intacto."
          />
        )}
      </section>
    </>
  )
}
