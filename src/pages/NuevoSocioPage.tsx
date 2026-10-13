import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { SocioForm } from '../components/socios/SocioForm'
import { usePrecios } from '../hooks/usePrecios'
import { useToast } from '../hooks/useToast'
import { crearSocio } from '../services/sociosService'
import type { SocioInput } from '../types'

export function NuevoSocioPage() {
  const { precios } = usePrecios()
  const toast = useToast()
  const navigate = useNavigate()

  async function guardar(datos: SocioInput) {
    try {
      await crearSocio(datos)
      toast.ok(`${datos.nombre} ${datos.apellido} ya es socio 💪`)
      navigate('/socios', { replace: true })
    } catch (e) {
      console.error(e)
      toast.error('No se pudo guardar el socio. Probá de nuevo')
    }
  }

  return (
    <>
      <PageHeader titulo="Nuevo socio" subtitulo="Alta rápida con el primer pago" volver />
      <section className="px-4 pt-5 md:px-6">
        <SocioForm precios={precios} textoGuardar="Guardar socio" onGuardar={guardar} />
      </section>
    </>
  )
}
