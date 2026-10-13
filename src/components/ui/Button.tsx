import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from './Spinner'

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  cargando?: boolean
  icono?: ReactNode
  bloque?: boolean
}

const variantes: Record<Variante, string> = {
  primary:
    'bg-lime-neon text-ink-950 hover:bg-lime-soft shadow-[0_8px_30px_-10px] shadow-lime-neon/60',
  secondary: 'bg-ink-800 text-white border border-ink-700 hover:bg-ink-700',
  ghost: 'bg-transparent text-ink-300 hover:bg-ink-800 hover:text-white',
  danger: 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
  whatsapp: 'bg-[#25d366] text-ink-950 hover:bg-[#3be37a]',
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
    <button
      {...rest}
      disabled={disabled || cargando}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-bold transition duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${
        bloque ? 'w-full' : ''
      } ${variantes[variante]} ${className}`}
    >
      {cargando ? <Spinner /> : icono}
      {children}
    </button>
  )
}
