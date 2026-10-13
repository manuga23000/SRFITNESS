import { PageHeader } from '../components/layout/PageHeader'
import { ButtonLink } from '../components/ui/ButtonLink'
import { EmptyState } from '../components/ui/EmptyState'
import { IconSearch } from '../components/ui/icons'

export function SocioNoEncontrado() {
  return (
    <>
      <PageHeader titulo="Socio" volver />
      <section className="px-4 pt-6 md:px-6">
        <EmptyState
          icono={<IconSearch />}
          titulo="No encontramos este socio"
          texto="Puede que lo hayan eliminado."
          accion={<ButtonLink to="/socios">Ver socios</ButtonLink>}
        />
      </section>
    </>
  )
}
