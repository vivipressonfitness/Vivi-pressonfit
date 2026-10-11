import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useMembershipStore } from '../../store/membershipStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MembershipBadge } from './MembershipBadge';

export function StatusCard() {
  const { status, trialEndDate, stripeCustomerId, stripeSubscriptionId } = useMembershipStore();
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const [portalError, setPortalError] = useState<string | null>(null);
  const hasStripeSubscription = /^cus_[A-Za-z0-9]+$/.test(stripeCustomerId ?? '') && /^sub_[A-Za-z0-9]+$/.test(stripeSubscriptionId ?? '');

  const trialDaysLeft = (() => {
    if (status !== 'trial' || !trialEndDate) return null;
    return Math.max(0, Math.ceil((new Date(trialEndDate).getTime() - Date.now()) / 86400000));
  })();

  async function openPortal() {
    setPortalError(null);
    const { data, error } = await supabase.functions.invoke('stripe-portal', { body: {} });
    if (error) {
      const context = error.context;
      if (context instanceof Response) {
        const body = await context.clone().json().catch(() => null);
        setPortalError(body?.error ?? 'No se pudo abrir el portal de Stripe. Inténtalo de nuevo.');
      } else {
        setPortalError(error.message || 'No se pudo abrir el portal de Stripe.');
      }
      return;
    }
    if (data?.url) window.location.assign(data.url);
    else setPortalError('Stripe no devolvió el enlace del portal.');
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
      {(status === 'active' || status === 'past_due') && hasStripeSubscription ? (
        <Button variant="outline" onClick={openPortal}>Gestionar / cancelar suscripción</Button>
      ) : status === 'trial' ? (
        <p className="text-sm text-text-secondary">La prueba gratuita no tiene una suscripción de Stripe para gestionar. Puedes iniciar tu suscripción desde esta página.</p>
      ) : (status === 'active' || status === 'past_due') && !hasStripeSubscription && !isAdmin ? (
        <p className="text-sm text-amber-400">Esta cuenta no tiene una suscripción de Stripe válida asociada. Contacta con soporte antes de intentar otro pago.</p>
      ) : !isAdmin && (
        <p className="text-sm text-amber-400">Tu membresía no está activa. Reactívala para ver los videos del mes.</p>
      )}
      {portalError && <p role="alert" className="text-sm text-amber-400">{portalError}</p>}
    </Card>
  );
}
