import { useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface Props {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar: string
  peligroso?: boolean
  onConfirmar: () => Promise<void> | void
  onCerrar: () => void
}

export function ConfirmDialog({ abierto, titulo, mensaje, textoConfirmar, peligroso, onConfirmar, onCerrar }: Props) {
  const [procesando, setProcesando] = useState(false)

  async function confirmar() {
    setProcesando(true)
    try {
      await onConfirmar()
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <div className="mb-6 text-sm leading-relaxed text-ink-300">{mensaje}</div>
      <div className="grid grid-cols-2 gap-3">
        <Button variante="secondary" onClick={onCerrar} disabled={procesando}>
          Cancelar
        </Button>
        <Button
          variante={peligroso ? 'danger' : 'primary'}
          onClick={confirmar}
          cargando={procesando}
          className={peligroso ? '!bg-danger !text-white' : ''}
        >
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  )
}
