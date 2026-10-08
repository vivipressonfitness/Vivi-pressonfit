import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useMembershipStore } from '../../store/membershipStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MembershipBadge } from './MembershipBadge';

// Portal de cliente Stripe: la URL la genera la Edge Function stripe-portal
// (ver "CAMBIOS REQUERIDOS EN BACKEND"). Fallback: instrucción por WhatsApp.
export function StatusCard() {
  const { status, trialEndDate } = useMembershipStore();
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const navigate = useNavigate();

  // Trial vigente: calcular días restantes desde profiles.trial_end_date (esquema real)
  const trialDaysLeft = (() => {
    if (status !== 'trial' || !trialEndDate) return null;
    const ms = new Date(trialEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / 86400000));
  })();

  async function openPortal() {
    const { data } = await supabase.functions
      .invoke('stripe-portal', { body: {} })
      .then((r) => (r.error ? { data: undefined } : r))
      .catch(() => ({ data: undefined }));
    if ((data as { url?: string })?.url) window.location.href = (data as { url: string }).url;
    else navigate('/membresia?portal=missing');
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Estado de tu suscripción</h3>
        <MembershipBadge status={status} />
      </div>
      {trialDaysLeft !== null && (
        <p className="text-sm text-text-secondary">
          Prueba gratuita: <strong className="text-accent">{trialDaysLeft} día{trialDaysLeft === 1 ? '' : 's'} restante{trialDaysLeft === 1 ? '' : 's'}</strong>
        </p>
      )}
      {status === 'active' || status === 'trial' || status === 'past_due' ? (
        <Button variant="outline" onClick={openPortal}>Gestionar / cancelar suscripción</Button>
      ) : !isAdmin && (
        <p className="text-sm text-amber-400">Tu membresía no está activa. Reactívala para ver los videos del mes.</p>
      )}
    </Card>
  );
}
