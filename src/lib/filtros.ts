import type { Filtros, SocioConEstado } from '../types'
import { nombreCompleto, normalizarTexto } from './format'

export function filtrarSocios(socios: SocioConEstado[], f: Filtros): SocioConEstado[] {
  const q = normalizarTexto(f.busqueda)
  const qDigitos = f.busqueda.replace(/\D/g, '')
  const resultado = socios.filter((s) => {
    if (f.plan && s.plan !== f.plan) return false
    if (f.estado && s.estado !== f.estado) return false
    if (!q) return true
    const texto = normalizarTexto(`${s.nombre} ${s.apellido} ${s.apellido} ${s.nombre}`)
    return q.split(/\s+/).every((p) => texto.includes(p)) || (qDigitos.length >= 3 && s.celular.includes(qDigitos))
  })
  return ordenarSocios(resultado, f.orden)
}

export function ordenarSocios(socios: SocioConEstado[], orden: Filtros['orden']): SocioConEstado[] {
  const copia = [...socios]
  if (orden === 'nombre') {
    copia.sort((a, b) => normalizarTexto(nombreCompleto(a)).localeCompare(normalizarTexto(nombreCompleto(b)), 'es'))
  } else {
    // Vencimiento más próximo (o más vencido) primero.
    copia.sort((a, b) => a.fechaVencimiento.getTime() - b.fechaVencimiento.getTime())
  }
  return copia
}
