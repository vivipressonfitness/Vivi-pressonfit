import { Link } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { useMembership } from '../hooks/useMembership';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { useMembershipStore } from '../store/membershipStore';
import { PlanCard } from '../components/membership/PlanCard';
import { StatusCard } from '../components/membership/StatusCard';
import { Card } from '../components/ui/Card';

// Página de MEMBRESÍA — separada del landing/portal.
// El portal público (/) muestra solo adelantos gratis; aquí vive la oferta:
// comparativa "adelanto vs. membresía", el plan con Stripe y el estado de suscripción.
export default function Membership() {
  const { startCheckout, loading, error } = useStripe();
  const { hasAccess, status } = useMembership();
  const stripeSubscriptionId = useMembershipStore((s) => s.stripeSubscriptionId);
  const { config } = useLandingConfig();

  const incluye = [
    ['Clases completas en video', 'GAP, Full Body, Cardio HIIT y Fuerza + Aeróbico de 30-45 min, sin límite.'],
    ['Rutinas de fuerza 3x por semana', 'Programas estructurados para casa o gimnasio, renovados cada mes.'],
    ['Guías de nutrición mensuales', 'Educación alimentaria práctica: planes y recetas del ciclo.'],
    ['Soporte directo por WhatsApp', 'Tu coach responde tus dudas técnicas y de nutrición.'],
    ['Contenido nuevo cada ciclo', 'Renovación mensual: siempre hay clases y recursos frescos.'],
  ];

  // Para un miembro ya gestionable (active/past_due con suscripción), la acción
  // primaria es administrar su plan; la oferta se mantiene accesible pero secundaria.
  const isManaging =
    (status === 'active' || status === 'past_due') &&
    /^sub_[A-Za-z0-9]+$/.test(stripeSubscriptionId ?? '');

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      {/* Encabezado: claro para miembros, promocional para quien aún no lo es */}
      <div className={isManaging ? 'space-y-1' : 'text-center space-y-3'}>
        <span
          className={`inline-block bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs ${
            isManaging ? '' : 'mx-auto'
          }`}
        >
          {isManaging ? 'Mi plan' : 'Membresía Mensual'}
        </span>
        <h1 className={`text-3xl md:text-4xl font-extrabold ${isManaging ? '' : 'mx-auto max-w-xl'}`}>
          {isManaging ? (
            'Tu membresía'
          ) : (
            <>
              Todo lo que viste gratis, ahora <span className="text-accent">completo</span>
            </>
          )}
        </h1>
        <p className={`text-text-secondary ${isManaging ? '' : 'max-w-xl mx-auto'}`}>
          {isManaging
            ? 'Revisa tu estado y gestiona tu suscripción cuando quieras.'
            : 'En el portal probaste los adelantos. Como miembro accedes a las versiones completas, las rutinas del mes, las guías de nutrición y el acompañamiento directo.'}
        </p>
        {!hasAccess && (
          <p className="text-sm text-text-secondary pt-2">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/registro" className="text-accent font-bold hover:underline">
              Regístrate primero
            </Link>{' '}
            y luego completa tu suscripción.
          </p>
        )}
      </div>

      <StatusCard />

      {isManaging && (
        <div className="text-sm text-text-secondary">
          ¿Quieres repasar qué incluye la membresía?{' '}
          <a href="#incluye" className="text-accent font-semibold hover:underline">
            Ver beneficios
          </a>
        </div>
      )}

      {/* Oferta / pago: se muestra junto al estado para quien aún no puede gestionar */}
      {(!hasAccess || status === 'trial') && (
        <div className="space-y-3">
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <PlanCard price={config.monthly_price} onSubscribe={startCheckout} loading={loading} />
        </div>
      )}

      {/* Comparativa adelanto vs. membresía */}
      <Card id="incluye">
        <h2 className="font-bold text-lg mb-4">Adelanto gratuito vs. membresía</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {incluye.map(([title, desc]) => (
            <li key={title} className="flex gap-3 items-start">
              <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-text-secondary">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-text-secondary mt-5 border-t border-border pt-4">
          El portal público solo ofrece fragmentos de demostración; el material completo está
          reservado para miembros activos.
        </p>
      </Card>

      {isManaging && (
        <div className="text-sm text-text-secondary">
          ¿Necesitas revisar la oferta otra vez?{' '}
          <a href="#oferta" className="text-accent font-semibold hover:underline">
            Ver el plan y suscribirse
          </a>
        </div>
      )}

      {/* Oferta para quien ya gestiona su plan: disponible pero fuera del foco principal */}
      {isManaging && (
        <div id="oferta" className="scroll-mt-24 space-y-3">
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <PlanCard price={config.monthly_price} onSubscribe={startCheckout} loading={loading} />
        </div>
      )}

      <div className="text-center text-sm text-text-secondary">
        <Link to="/" className="hover:text-accent transition-colors">
          ← Volver al portal de adelantos
        </Link>
      </div>
    </div>
  );
}
