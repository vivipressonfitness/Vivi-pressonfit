import { Link, useLocation } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { useMembership } from '../hooks/useMembership';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { PlanCard } from '../components/membership/PlanCard';
import { StatusCard } from '../components/membership/StatusCard';
import { Card } from '../components/ui/Card';

// Página de MEMBRESÍA — separada del landing/portal.
// El portal público (/) muestra solo adelantos gratis; aquí vive la oferta:
// comparativa "adelanto vs. membresía", el plan con Stripe y el estado de suscripción.
export default function Membership() {
  const { startCheckout, loading, error } = useStripe();
  const { hasAccess } = useMembership();
  const { config } = useLandingConfig();
  const location = useLocation();
  const portalMissing = new URLSearchParams(location.search).get('portal') === 'missing';

  const incluye = [
    ['Clases completas en video', 'GAP, Full Body, Cardio HIIT y Fuerza + Aeróbico de 30-45 min, sin límite.'],
    ['Rutinas de fuerza 3x por semana', 'Programas estructurados para casa o gimnasio, renovados cada mes.'],
    ['Guías de nutrición mensuales', 'Educación alimentaria práctica: planes y recetas del ciclo.'],
    ['Soporte directo por WhatsApp', 'Tu coach responde tus dudas técnicas y de nutrición.'],
    ['Contenido nuevo cada ciclo', 'Renovación mensual: siempre hay clases y recursos frescos.'],
  ];

  return (
    <div className="space-y-10 max-w-3xl mx-auto py-6">
      {/* Encabezado de la oferta */}
      <div className="text-center space-y-3">
        <span className="inline-block bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs">
          Membresía Mensual
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold">
          Todo lo que viste gratis, ahora <span className="text-accent">completo</span>
        </h1>
        <p className="text-text-secondary max-w-xl mx-auto">
          En el portal probaste los adelantos. Como miembro accedes a las versiones completas,
          las rutinas del mes, las guías de nutrición y el acompañamiento directo.
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

      {portalMissing && (
        <Card className="border-amber-500/40">
          <p className="text-sm text-amber-400">
            El portal de autogestión aún no está disponible (falta la Edge Function{' '}
            <code>stripe-portal</code>). Para cancelar o actualizar tu tarjeta, escríbenos por WhatsApp.
          </p>
        </Card>
      )}

      {/* Comparativa adelanto vs. membresía */}
      <Card>
        <h2 className="font-bold text-lg mb-4">Adelanto gratuito vs. membresía</h2>
        <ul className="space-y-4">
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

      {/* Oferta / pago */}
      {!hasAccess && (
        <>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <PlanCard price={config.monthly_price} onSubscribe={startCheckout} loading={loading} />
        </>
      )}

      <div className="text-center text-sm text-text-secondary">
        <Link to="/" className="hover:text-accent transition-colors">
          ← Volver al portal de adelantos
        </Link>
      </div>
    </div>
  );
}
