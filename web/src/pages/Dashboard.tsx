import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useMembership } from '../hooks/useMembership';
import { useVideos } from '../hooks/useVideos';
import { Card } from '../components/ui/Card';
import { MembershipBadge } from '../components/membership/MembershipBadge';
import { StatusCard } from '../components/membership/StatusCard';

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile);
  const { hasAccess, status } = useMembership();
  const { videos, loading } = useVideos();

  const firstName = profile?.full_name?.split(' ')[0] ?? '';
  const recommended = videos.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">¡Hola, {firstName}! 👋</h1>
        <p className="text-text-secondary mt-1">Esto es lo que tienes disponible este ciclo.</p>
      </div>

      <StatusCard />

      {/* Próximos entrenamientos / videos recomendados */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Continúa entrenando</h2>
          <Link to="/videos" className="text-accent text-sm font-semibold hover:underline">Ver todos →</Link>
        </div>
        {loading ? (
          <p className="text-text-secondary text-sm">Cargando contenido…</p>
        ) : !hasAccess && status !== null ? (
          <p className="text-amber-400 text-sm">
            Activa tu membresía para desbloquear los videos del mes.{' '}
            <Link to="/membresia" className="underline">Suscribirme $us. 40/mes</Link>
          </p>
        ) : recommended.length === 0 ? (
          <p className="text-text-secondary text-sm">Aún no hay videos publicados en este ciclo.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recommended.map((v) => (
              <li key={v.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-text-secondary">{v.category} · {v.month_year ?? v.cycle_date}</p>
                </div>
                <Link to="/videos" className="btn-accent !px-4 !py-2 text-sm shrink-0">▶ Ver</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Progreso: la tabla de progreso aún no existe en el schema (ver sección backend).
          Cuando exista `video_progress`, este bloque mostrará % completado. */}
      <Card className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg">Tu progreso</h2>
          <p className="text-sm text-text-secondary mt-1">
            Próximamente: estadísticas de videos vistos y clases completadas.
          </p>
        </div>
        <MembershipBadge status={status} />
      </Card>

      <a
        href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? '59178000000'}`}
        target="_blank"
        rel="noreferrer"
        className="block bg-whatsapp-green hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-pill text-center transition"
      >
        Chatear por WhatsApp
      </a>
    </div>
  );
}
