import { useLocation } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { useMembership } from '../hooks/useMembership';
import { PlanCard } from '../components/membership/PlanCard';
import { StatusCard } from '../components/membership/StatusCard';
import { Card } from '../components/ui/Card';

export default function Membership() {
  const { startCheckout, loading, error } = useStripe();
  const { hasAccess } = useMembership();
  const location = useLocation();
  const portalMissing = new URLSearchParams(location.search).get('portal') === 'missing';

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-extrabold text-center">Tu Membresía</h1>

      <StatusCard />

      {portalMissing && (
        <Card className="border-amber-500/40">
          <p className="text-sm text-amber-400">
            El portal de autogestión aún no está disponible (falta la Edge Function{' '}
            <code>stripe-portal</code>). Para cancelar o actualizar tu tarjeta, escríbenos por WhatsApp.
          </p>
        </Card>
      )}

      {!hasAccess && (
        <>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <PlanCard onSubscribe={startCheckout} loading={loading} />
        </>
      )}
    </div>
  );
}
