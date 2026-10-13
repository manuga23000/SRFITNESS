import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { SocioForm } from '../components/socios/SocioForm'
import { Skeleton } from '../components/ui/Skeleton'
import { usePrecios } from '../hooks/usePrecios'
import { useSocio } from '../hooks/useSocios'
import { useToast } from '../hooks/useToast'
import { actualizarSocio } from '../services/sociosService'
import type { SocioInput } from '../types'
import { SocioNoEncontrado } from './SocioNoEncontrado'

export function EditarSocioPage() {
  const { id } = useParams()
  const { socio, cargando } = useSocio(id)
  const { precios } = usePrecios()
  const toast = useToast()
  const navigate = useNavigate()

  async function guardar(datos: SocioInput) {
    try {
      await actualizarSocio(id!, datos)
      toast.ok('Cambios guardados')
      navigate(-1)
    } catch (e) {
      console.error(e)
      toast.error('No se pudieron guardar los cambios')
    }
  }

  if (!cargando && !socio) return <SocioNoEncontrado />

  return (
    <>
      <PageHeader titulo="Editar socio" subtitulo={socio && `${socio.nombre} ${socio.apellido}`} volver />
      <section className="px-4 pt-5 md:px-6">
        {socio ? (
          <SocioForm
            key={socio.id}
            inicial={socio}
            precios={precios}
            textoGuardar="Guardar cambios"
            onGuardar={guardar}
          />
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-20" />
            <Skeleton className="h-14" />
          </div>
        )}
      </section>
    </>
  )
}
