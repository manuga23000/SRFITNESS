import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { PagoModal } from '../components/socios/PagoModal'
import type { SocioConEstado } from '../types'
import { PagoModalContext } from './contexts'

export function PagoModalProvider({ children }: { children: ReactNode }) {
  const [socio, setSocio] = useState<SocioConEstado | null>(null)
  const cerrar = useCallback(() => setSocio(null), [])
  const api = useMemo(() => ({ abrirPago: setSocio }), [])

  return (
    <PagoModalContext.Provider value={api}>
      {children}
      <PagoModal socio={socio} onCerrar={cerrar} />
    </PagoModalContext.Provider>
  )
}
