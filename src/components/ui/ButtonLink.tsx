import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { claseBoton, type Variante } from './buttonStyles'

interface Props extends LinkProps {
  variante?: Variante
  icono?: ReactNode
  bloque?: boolean
}

/** Link de navegación con el mismo aspecto que Button. */
export function ButtonLink({ variante = 'primary', icono, bloque = false, className = '', children, ...rest }: Props) {
  return (
    <Link {...rest} className={claseBoton(variante, bloque, className)}>
      {icono}
      {children}
    </Link>
  )
}
