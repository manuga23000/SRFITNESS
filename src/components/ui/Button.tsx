import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { claseBoton, type Variante } from './buttonStyles'
import { Spinner } from './Spinner'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  icono?: ReactNode
  bloque?: boolean
}

export function Button({
  variante = 'primary',
  cargando = false,
  icono,
  bloque = false,
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  return (
    <button {...rest} disabled={disabled || cargando} className={claseBoton(variante, bloque, className)}>
      {cargando ? <Spinner /> : icono}
      {children}
    </button>
  )
}
