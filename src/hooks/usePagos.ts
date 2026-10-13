import { useEffect, useState } from 'react'
import { escucharPagos } from '../services/pagosService'
import type { Pago } from '../types'

export function usePagos(socioId: string | undefined) {
  const [state, setState] = useState<{ pagos: Pago[]; cargando: boolean; error: Error | null }>({
    pagos: [],
    cargando: true,
    error: null,
  })

  useEffect(() => {
    if (!socioId) return
    return escucharPagos(
      socioId,
      (pagos) => setState({ pagos, cargando: false, error: null }),
      (error) => setState({ pagos: [], cargando: false, error }),
    )
  }, [socioId])

  return state
}
