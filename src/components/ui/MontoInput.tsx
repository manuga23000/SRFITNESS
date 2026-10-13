interface Props {
  id: string
  valor: string
  onChange: (valor: string) => void
  invalido?: boolean
  placeholder?: string
}

/** Input de pesos con separador de miles mientras se escribe. */
export function MontoInput({ id, valor, onChange, invalido, placeholder = '0' }: Props) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-bold text-ink-400">$</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        className={`field pl-9 text-lg font-bold ${invalido ? '!border-danger' : ''}`}
        placeholder={placeholder}
        value={valor}
        onChange={(e) => {
          const digitos = e.target.value.replace(/\D/g, '').slice(0, 9)
          onChange(digitos ? Number(digitos).toLocaleString('es-AR') : '')
        }}
      />
    </div>
  )
}
