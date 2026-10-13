import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { FiltrosSocios } from '../components/socios/FiltrosSocios'
import { SocioCard } from '../components/socios/SocioCard'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { EmptyState } from '../components/ui/EmptyState'
import { IconBell, IconSearch, IconUserOff, IconUsers } from '../components/ui/icons'
import { ListaSkeleton } from '../components/ui/Skeleton'
import { useSocios } from '../hooks/useSocios'
import { filtrarSocios } from '../lib/filtros'
import { PLANES, type EstadoCuota, type Filtros, type Plan } from '../types'

const ESTADOS: EstadoCuota[] = ['al-dia', 'por-vencer', 'vencido']

/** Los filtros viven en la URL: así el dashboard puede linkear "/socios?estado=vencido" y el "atrás" los respeta. */
function useFiltrosUrl(): [Filtros, (c: Partial<Filtros>) => void] {
  const [params, setParams] = useSearchParams()
  const estado = params.get('estado') as EstadoCuota | null
  const plan = params.get('plan') as Plan | null
  const filtros: Filtros = {
    busqueda: params.get('q') ?? '',
    estado: estado && ESTADOS.includes(estado) ? estado : null,
    plan: plan && PLANES.includes(plan) ? plan : null,
    orden: params.get('orden') === 'nombre' ? 'nombre' : 'vencimiento',
  }

  function actualizar(cambios: Partial<Filtros>) {
    const f = { ...filtros, ...cambios }
    const p = new URLSearchParams()
    if (f.busqueda) p.set('q', f.busqueda)
    if (f.estado) p.set('estado', f.estado)
    if (f.plan) p.set('plan', f.plan)
    if (f.orden !== 'vencimiento') p.set('orden', f.orden)
    setParams(p, { replace: true })
  }

  return [filtros, actualizar]
}

export function SociosPage() {
  const { activos, resumen, cargando } = useSocios()
  const [filtros, setFiltros] = useFiltrosUrl()

  const lista = useMemo(() => filtrarSocios(activos, filtros), [activos, filtros])
  const hayFiltros = Boolean(filtros.busqueda || filtros.estado || filtros.plan)

  return (
    <>
      <PageHeader
        titulo="Socios"
        subtitulo={cargando ? 'Cargando…' : `${resumen.activos} activos`}
        acciones={
          <Link
            to="/inactivos"
            className="flex items-center gap-1.5 rounded-full border border-ink-700 px-3 py-2 text-xs font-semibold text-ink-300 transition hover:bg-ink-800"
          >
            <IconUserOff /> Inactivos{resumen.inactivos > 0 && ` (${resumen.inactivos})`}
          </Link>
        }
      />

      <section className="space-y-4 px-4 pt-4 md:px-6">
        <FiltrosSocios
          filtros={filtros}
          onChange={setFiltros}
          conteoEstados={{ 'al-dia': resumen.alDia, 'por-vencer': resumen.porVencer, vencido: resumen.vencidos }}
        />

        {filtros.estado === 'vencido' && lista.length > 0 && (
          <ButtonLink to="/recordatorios" variante="whatsapp" bloque icono={<IconBell />}>
            Recordar a los vencidos uno por uno
          </ButtonLink>
        )}

        {cargando ? (
          <ListaSkeleton />
        ) : lista.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {lista.map((s, i) => (
              <SocioCard key={s.id} socio={s} indice={i} />
            ))}
          </div>
        ) : hayFiltros ? (
          <EmptyState
            icono={<IconSearch />}
            titulo="Sin resultados"
            texto="No hay socios que coincidan con la búsqueda o los filtros."
            accion={
              <Button variante="secondary" onClick={() => setFiltros({ busqueda: '', estado: null, plan: null })}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            icono={<IconUsers />}
            titulo="Todavía no hay socios"
            texto="Cargá el primero y empezá a llevar el control de las cuotas."
            accion={<ButtonLink to="/socios/nuevo">Agregar socio</ButtonLink>}
          />
        )}
      </section>
    </>
  )
}
