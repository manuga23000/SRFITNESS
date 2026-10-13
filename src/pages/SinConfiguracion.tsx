import { Logo } from '../components/layout/Logo'

export function SinConfiguracion() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md space-y-5">
        <Logo size="lg" />
        <h1 className="font-display text-3xl tracking-wide">Falta configurar Firebase</h1>
        <p className="text-sm leading-relaxed text-ink-300">
          Copiá <code className="rounded bg-ink-800 px-1.5 py-0.5 text-lime-neon">.env.example</code> como{' '}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-lime-neon">.env.local</code>, completá las variables{' '}
          <code className="text-lime-neon">VITE_FIREBASE_*</code> con los datos de tu proyecto y reiniciá el servidor.
          Los pasos están en el README.
        </p>
      </div>
    </div>
  )
}
