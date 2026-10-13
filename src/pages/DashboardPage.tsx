import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/dashboard/StatCard'
import { Fab } from '../components/layout/Fab'
import { PageHeader } from '../components/layout/PageHeader'
import { SocioCard } from '../components/socios/SocioCard'
import { ButtonLink } from '../components/ui/ButtonLink'
import { EmptyState } from '../components/ui/EmptyState'
import { IconAlert, IconBell, IconCheck, IconClock, IconDumbbell, IconUsers } from '../components/ui/icons'
import { ListaSkeleton } from '../components/ui/Skeleton'
import { useSocios } from '../hooks/useSocios'
import { DIAS_AVISO } from '../lib/dates'
import { ordenarSocios } from '../lib/filtros'

const fechaLarga = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })

function saludo(ahora: Date) {
  const h = ahora.getHours()
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function DashboardPage() {
  const { activos, resumen, cargando } = useSocios()
  const [ahora] = useState(() => new Date())

  const atencion = useMemo(
    () =>
      ordenarSocios(
        activos.filter((s) => s.estado !== 'al-dia'),
        'vencimiento',
      ),
    [activos],
  )
  const porcentajeAlDia = resumen.activos ? Math.round((resumen.alDia / resumen.activos) * 100) : 0

  return (
    <>
      <PageHeader />

      <section className="px-4 pt-5 md:px-6">
        <p className="text-sm font-medium text-ink-400 first-letter:uppercase">{fechaLarga.format(ahora)}</p>
        <h1 className="font-display text-5xl leading-none tracking-wide">
          {saludo(ahora)}, <span className="text-lime-neon">profe</span>
        </h1>

        {/* Contadores */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            to="/socios"
            label="Activos"
            valor={resumen.activos}
            icono={<IconUsers />}
            tono="lime"
            cargando={cargando}
            indice={0}
          />
          <StatCard
            to="/socios?estado=al-dia"
            label="Al día"
            valor={resumen.alDia}
            icono={<IconCheck />}
            tono="ok"
            detalle={resumen.activos ? `${porcentajeAlDia}% de los socios` : undefined}
            cargando={cargando}
            indice={1}
          />
          <StatCard
            to="/socios?estado=por-vencer"
            label="Por vencer"
            valor={resumen.porVencer}
            icono={<IconClock />}
            tono="warn"
            detalle={`En los próximos ${DIAS_AVISO} días`}
            cargando={cargando}
            indice={2}
          />
          <StatCard
            to="/socios?estado=vencido"
            label="Vencidos"
            valor={resumen.vencidos}
            icono={<IconAlert />}
            tono="danger"
            detalle={resumen.vencidos ? 'Tocá para verlos' : 'Nadie debe 🙌'}
            cargando={cargando}
            indice={3}
          />
        </div>

        {/* Barra de salud del gym */}
        {!cargando && resumen.activos > 0 && (
          <div
            className="mt-4 animate-fade-up rounded-3xl border border-ink-800 bg-ink-900 p-4"
            style={{ animationDelay: '240ms' }}
          >
            <div className="mb-2 flex justify-between text-xs font-semibold text-ink-400">
              <span>Estado de las cuotas</span>
              <span className="text-white">{porcentajeAlDia}% al día</span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-ink-800">
              <div
                className="bg-ok transition-all duration-700"
                style={{ width: `${(resumen.alDia / resumen.activos) * 100}%` }}
              />
              <div
                className="bg-warn transition-all duration-700"
                style={{ width: `${(resumen.porVencer / resumen.activos) * 100}%` }}
              />
              <div
                className="bg-danger transition-all duration-700"
                style={{ width: `${(resumen.vencidos / resumen.activos) * 100}%` }}
              />
            </div>
          </div>
        )}

        {resumen.vencidos > 0 && (
          <ButtonLink to="/recordatorios" variante="whatsapp" bloque icono={<IconBell />} className="mt-4 min-h-14">
            Recordar a los {resumen.vencidos} vencidos
          </ButtonLink>
        )}

        {/* Lista de atención */}
        <div className="mt-8">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="font-display text-3xl tracking-wide">Para cobrar</h2>
            {atencion.length > 0 && (
              <Link to="/socios" className="text-sm font-semibold text-lime-neon">
                Ver todos
              </Link>
            )}
          </div>

          {cargando ? (
            <ListaSkeleton cantidad={2} />
          ) : resumen.activos === 0 ? (
            <EmptyState
              icono={<IconDumbbell />}
              titulo="Arrancamos"
              texto="Cargá a tus socios y acá vas a ver quién debe y a quién le vence la cuota."
              accion={<ButtonLink to="/socios/nuevo">Agregar el primer socio</ButtonLink>}
            />
          ) : atencion.length === 0 ? (
            <EmptyState
              icono={<IconCheck />}
              titulo="Todo al día"
              texto="Nadie debe ni tiene la cuota por vencer. ¡Crack!"
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {atencion.slice(0, 8).map((s, i) => (
                <SocioCard key={s.id} socio={s} indice={i} />
              ))}
            </div>
          )}
          {atencion.length > 8 && (
            <ButtonLink to="/socios" variante="secondary" bloque className="mt-3">
              Ver {atencion.length - 8} más
            </ButtonLink>
          )}
        </div>
      </section>

      <Fab />
    </>
  )
}
