import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMembership } from '../hooks/useMembership';
import { useVideos } from '../hooks/useVideos';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { Card } from '../components/ui/Card';
import { MembershipBadge } from '../components/membership/MembershipBadge';
import { StatusCard } from '../components/membership/StatusCard';
import { PlayIcon } from '../components/ui/Icons';
import { formatMonthlyRate } from '../lib/offer';

// F-10: Dashboard sin emojis funcionales, con iconos SVG de trazo y léxico unificado
export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { hasAccess, status } = useMembership();
  const { videos, loading } = useVideos();
  const { config } = useLandingConfig();

  const firstName = profile?.full_name?.split(' ')[0] ?? '';
  const recommended = videos.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            ¡Hola, {firstName || 'alumna'}!
          </h1>
          <p className="text-text-secondary mt-1">Esto es lo que tienes disponible este ciclo.</p>
        </div>
        {/* Acción principal directa hacia el catálogo de clases */}
        <Link
          to="/videos"
          className="btn-accent shrink-0 min-h-[48px] inline-flex items-center gap-2"
        >
          <PlayIcon className="w-4 h-4" />
          <span>Explorar clases</span>
        </Link>
      </div>

      <StatusCard />

      {/* Últimas clases publicadas */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-white">Últimas clases</h2>
          <Link to="/videos" className="text-accent text-sm font-semibold hover:underline">
            Ver todas →
          </Link>
        </div>
        {loading ? (
          <p role="status" className="text-text-secondary text-sm">Cargando contenido…</p>
        ) : !hasAccess && status !== null ? (
          <p className="text-amber-400 text-sm">
            Activa tu membresía para desbloquear los videos del mes.{' '}
            <Link to="/membresia" className="underline font-semibold">
              Suscribirme — {formatMonthlyRate(config.monthly_price)}
            </Link>
          </p>
        ) : recommended.length === 0 ? (
          <p className="text-text-secondary text-sm">Aún no hay videos publicados en este ciclo.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recommended.map((v) => (
              <li key={v.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-text-primary">{v.title}</p>
                  <p className="text-xs text-text-secondary">{v.category} · {v.month_year ?? v.cycle_date}</p>
                </div>
                <Link
                  to="/videos"
                  aria-label={`Ver clase: ${v.title}`}
                  className="btn-accent !px-4 !py-2 text-sm shrink-0 min-h-[44px] inline-flex items-center gap-1.5"
                >
                  <PlayIcon className="w-3.5 h-3.5" />
                  <span>Ver clase</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Resumen del progreso */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-lg text-white">Tu progreso</h2>
          <MembershipBadge status={status} />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Todavía no medimos clases vistas ni completadas, así que preferimos no mostrar
          números inventados. Mientras tanto, explora el catálogo y entrena a tu ritmo.
        </p>
        <Link
          to="/videos"
          className="text-sm font-semibold text-accent underline underline-offset-2 hover:text-accent-hover min-h-[44px] inline-flex items-center"
        >
          Explorar las clases disponibles
        </Link>
      </Card>

      <a
        href={`https://wa.me/${(config.whatsapp_number && config.whatsapp_number !== '59178000000') ? config.whatsapp_number : '5493415888117'}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-whatsapp-green hover:bg-emerald-600 text-background font-bold px-6 py-3 rounded-pill text-center transition min-h-[48px] flex items-center justify-center shadow-md"
      >
        Chatear por WhatsApp con tu coach
      </a>
    </div>
  );
}
