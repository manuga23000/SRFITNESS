import { useContext } from 'react'
import { PagoModalContext } from '../context/contexts'

/** Abre el modal de "Registrar pago" desde cualquier pantalla. */
export function usePagoModal() {
  return useContext(PagoModalContext)
}
