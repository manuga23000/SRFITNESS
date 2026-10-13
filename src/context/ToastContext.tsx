import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastApi } from './contexts'

type ToastTipo = 'ok' | 'error' | 'info'

interface Toast {
  id: number
  tipo: ToastTipo
  mensaje: string
}

const estilos: Record<ToastTipo, string> = {
  ok: 'border-lime-neon/40 bg-ink-850 text-white [&_.dot]:bg-lime-neon',
  error: 'border-danger/50 bg-ink-850 text-white [&_.dot]:bg-danger',
  info: 'border-ink-600 bg-ink-850 text-white [&_.dot]:bg-ink-300',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const push = useCallback((tipo: ToastTipo, mensaje: string) => {
    const id = nextId.current++
    setToasts((t) => [...t.slice(-2), { id, tipo, mensaje }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      ok: (m) => push('ok', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+12px)]"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tipo === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-sm animate-pop items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl shadow-black/60 ${estilos[t.tipo]}`}
          >
            <span className="dot h-2.5 w-2.5 shrink-0 rounded-full" />
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
