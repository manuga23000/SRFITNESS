import { useContext, useEffect, useMemo, useState } from 'react'
import { SociosContext } from '../context/contexts'
import { diasHasta, estadoCuota } from '../lib/dates'
import type { EstadoCuota, Socio, SocioConEstado } from '../types'

function conEstado(socio: Socio, ahora: Date): SocioConEstado {
  const diasRestantes = diasHasta(socio.fechaVencimiento, ahora)
  return { ...socio, diasRestantes, estado: estadoCuota(diasRestantes) }
}

/** Fuerza un recálculo al cambiar el día (por si la app queda abierta de un día para otro). */
function useDiaActual() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setAhora((prev) => (prev.toDateString() === n.toDateString() ? prev : n))
    }, 60_000)
    return () => clearInterval(id)
  }, [])
  return ahora
}

export interface ResumenSocios {
  activos: number
  alDia: number
  porVencer: number
  vencidos: number
  inactivos: number
}

export function useSocios() {
  const { socios, cargando, error } = useContext(SociosContext)
  const ahora = useDiaActual()

  return useMemo(() => {
    const todos = socios.map((s) => conEstado(s, ahora))
    const activos = todos.filter((s) => s.activo)
    const inactivos = todos.filter((s) => !s.activo)
    const contar = (e: EstadoCuota) => activos.filter((s) => s.estado === e).length
    const resumen: ResumenSocios = {
      activos: activos.length,
      alDia: contar('al-dia'),
      porVencer: contar('por-vencer'),
      vencidos: contar('vencido'),
      inactivos: inactivos.length,
    }
    return { todos, activos, inactivos, resumen, cargando, error }
  }, [socios, ahora, cargando, error])
}

/** Un socio puntual, tomado de la suscripción global. */
export function useSocio(id: string | undefined) {
  const { todos, cargando, error } = useSocios()
  const socio = useMemo(() => todos.find((s) => s.id === id), [todos, id])
  return { socio, cargando, error }
}
