import type { SocioConEstado } from '../types'
import { formatearFecha } from './dates'

export function mensajeRecordatorio(socio: SocioConEstado): string {
  const fecha = formatearFecha(socio.fechaVencimiento)
  const nombre = socio.nombre.split(' ')[0]
  switch (socio.estado) {
    case 'vencido':
      return `Hola ${nombre}! Te recuerdo que tu cuota del gym venció el ${fecha}. Cuando puedas, acercate a renovarla 💪 SR Fitness Gym`
    case 'por-vencer':
      if (socio.diasRestantes === 0)
        return `Hola ${nombre}! Te recuerdo que tu cuota del gym vence hoy (${fecha}). ¡Te esperamos! 💪 SR Fitness Gym`
      return `Hola ${nombre}! Te recuerdo que tu cuota del gym vence el ${fecha}. ¡Te esperamos! 💪 SR Fitness Gym`
    default:
      return `Hola ${nombre}! ¿Cómo va? Tu cuota del gym está al día, vence el ${fecha}. ¡Nos vemos en el gym! 💪 SR Fitness Gym`
  }
}

/** Link de WhatsApp para un celular argentino (prefijo 549). */
export function linkWhatsapp(celular: string, mensaje?: string): string {
  const base = `https://wa.me/549${celular}`
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base
}

export function linkTelefono(celular: string): string {
  return `tel:+549${celular}`
}
