import { useEffect, useState } from 'react'
import { escucharPrecios, PRECIOS_VACIOS } from '../services/preciosService'
import type { Precios } from '../types'

export function usePrecios() {
  const [state, setState] = useState<{ precios: Precios; cargando: boolean }>({
    precios: PRECIOS_VACIOS,
    cargando: true,
  })

  useEffect(
    () =>
      escucharPrecios(
        (precios) => setState({ precios, cargando: false }),
        (error) => {
          console.error(error)
          setState((s) => ({ ...s, cargando: false }))
        },
      ),
    [],
  )

  return state
}
