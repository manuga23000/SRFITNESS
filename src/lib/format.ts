const pesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

/** $ 25.000 */
export function formatearMonto(monto: number | undefined | null): string {
  if (monto === undefined || monto === null || Number.isNaN(monto)) return '—'
  return pesos.format(monto)
}

/** Deja solo los dígitos de un monto escrito como "25.000" o "$25000". */
export function parsearMonto(valor: string): number | null {
  const limpio = valor.replace(/[^\d]/g, '')
  if (!limpio) return null
  return Number(limpio)
}

/** Muestra un monto mientras se escribe: "25000" -> "25.000". */
export function montoParaInput(valor: string | number | undefined): string {
  if (valor === undefined || valor === '') return ''
  const n = typeof valor === 'number' ? valor : parsearMonto(valor)
  return n === null ? '' : n.toLocaleString('es-AR')
}

/**
 * Normaliza un celular argentino a 10 dígitos (código de área sin 0 + número sin 15).
 * Acepta formatos como "+54 9 336 412-3456", "0336 154123456" o "3364123456".
 */
export function normalizarCelular(valor: string): string {
  let d = valor.replace(/\D/g, '')
  if (d.startsWith('549')) d = d.slice(3)
  else if (d.startsWith('54') && d.length > 10) d = d.slice(2)
  if (d.startsWith('0')) d = d.slice(1)
  // Quita el "15" que va después del código de área (de 2 a 4 dígitos).
  if (d.length === 12) {
    for (const largoArea of [2, 3, 4]) {
      if (d.slice(largoArea, largoArea + 2) === '15') {
        d = d.slice(0, largoArea) + d.slice(largoArea + 2)
        break
      }
    }
  }
  return d
}

export function celularValido(celular: string): boolean {
  return /^\d{10}$/.test(celular)
}

/** 3364123456 -> 336 412-3456 */
export function formatearCelular(celular: string): string {
  if (!/^\d{10}$/.test(celular)) return celular
  return `${celular.slice(0, 3)} ${celular.slice(3, 6)}-${celular.slice(6)}`
}

export function nombreCompleto(s: { nombre: string; apellido: string }): string {
  return `${s.nombre} ${s.apellido}`.trim()
}

export function iniciales(s: { nombre: string; apellido: string }): string {
  return `${s.nombre.charAt(0)}${s.apellido.charAt(0)}`.toUpperCase()
}

/** Para búsquedas sin importar mayúsculas ni tildes. */
export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** "Juan Perez" -> "Juan Perez" con mayúscula inicial en cada palabra. */
export function capitalizar(texto: string): string {
  return texto
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|\s)(\p{L})/gu, (_, esp: string, letra: string) => esp + letra.toUpperCase())
}
