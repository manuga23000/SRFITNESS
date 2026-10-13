import { useEffect, useState, type ReactNode } from 'react'
import { escucharSocios } from '../services/sociosService'
import { SociosContext, type SociosState } from './contexts'

/**
 * Mantiene una única suscripción en tiempo real a la colección de socios para toda la app,
 * así al navegar entre pantallas los datos ya están y no hay recargas.
 */
export function SociosProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SociosState>({ socios: [], cargando: true, error: null })

  useEffect(
    () =>
      escucharSocios(
        (socios) => setState({ socios, cargando: false, error: null }),
        (error) => {
          console.error(error)
          setState((s) => ({ ...s, cargando: false, error }))
        },
      ),
    [],
  )

  return <SociosContext.Provider value={state}>{children}</SociosContext.Provider>
}
