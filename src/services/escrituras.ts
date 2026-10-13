/**
 * Con la caché offline de Firestore las escrituras se aplican localmente al instante
 * (onSnapshot ya las muestra), pero la promesa no resuelve hasta que el servidor confirma.
 * Sin señal eso puede tardar mucho, así que después de un momento damos la operación
 * por hecha: queda en cola y se sincroniza sola. Los errores rápidos (ej: permisos)
 * sí se propagan para poder avisarlos.
 */
export function confirmarEscritura<T>(promesa: Promise<T>, esperaMs = 2500): Promise<T | void> {
  promesa.catch((e) => console.error('Error al sincronizar con Firestore', e))
  return Promise.race([promesa, new Promise<void>((res) => setTimeout(res, esperaMs))])
}
