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
  const [portalLoading, setPortalLoading] = useState(false);
  const hasStripeSubscription = /^cus_[A-Za-z0-9]+$/.test(stripeCustomerId ?? '') && /^sub_[A-Za-z0-9]+$/.test(stripeSubscriptionId ?? '');

  const trialDaysLeft = (() => {
    if (status !== 'trial' || !trialEndDate) return null;
    return Math.max(0, Math.ceil((new Date(trialEndDate).getTime() - Date.now()) / 86400000));
  })();

  async function openPortal() {
    setPortalError(null);
    setPortalLoading(true);
    try {
      await invokePortal();
    } finally {
      setPortalLoading(false);
    }
  }

  async function invokePortal() {
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

  const stateCopy: Record<string, string> = {
    active: 'Tu acceso está activo. Puedes entrenar todo el contenido del ciclo actual.',
    trial: hasStripeSubscription
      ? 'Estás en la prueba gratuita. Tu suscripción comenzará automáticamente al finalizar.'
      : 'Estás en la prueba gratuita con acceso completo al contenido.',
    past_due: 'El último pago no se completó. Gestiona tu suscripción para evitar interrupciones.',
    canceled: 'Tu suscripción está cancelada. Suscríbete de nuevo para retomar el acceso.',
    expired: 'La prueba gratuita terminó. Suscríbete para continuar entrenando.',
    inactive: 'Aún no tienes membresía. Suscríbete para desbloquear las clases completas.',
  };

  // F-08: Mostrar portal de Stripe para trial con suscripción y para active/past_due
  const showPortalButton = hasStripeSubscription && (status === 'active' || status === 'past_due' || status === 'trial');

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-bold leading-tight">Estado de tu suscripción</h2>
          <p id="membership-state-copy" aria-live="polite" className="text-sm text-text-secondary">
            {stateCopy[status ?? 'inactive'] ?? stateCopy.inactive}
          </p>
        </div>
        <MembershipBadge status={status} />
      </div>
      {trialDaysLeft !== null && (
        <p className="text-sm text-text-secondary">
          Prueba gratuita: <strong className="text-accent">{trialDaysLeft} día{trialDaysLeft === 1 ? '' : 's'} restante{trialDaysLeft === 1 ? '' : 's'}</strong>
        </p>
      )}
      {showPortalButton ? (
        <Button
          variant="outline"
          onClick={openPortal}
          loading={portalLoading}
          aria-describedby="membership-state-copy"
          className="w-full sm:w-auto min-h-[48px]"
        >
          {status === 'trial' ? 'Gestionar método de pago' : 'Gestionar / cancelar suscripción'}
        </Button>
      ) : (status === 'active' || status === 'past_due') && !hasStripeSubscription && !isAdmin ? (
        <p className="text-sm text-amber-400">Esta cuenta no tiene una suscripción de Stripe válida asociada. Contacta con soporte antes de intentar otro pago.</p>
      ) : status === 'trial' && !hasStripeSubscription ? (
        <p className="text-sm text-sky-400">Completa tu suscripción para conservar el acceso completo tras la prueba.</p>
      ) : !isAdmin && status !== 'trial' && status !== 'active' && status !== 'past_due' && (
        <p className="text-sm text-amber-400">Tu membresía no está activa. Reactívala para ver los videos del mes.</p>
      )}
      {portalError && (
        <div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3">
          <p className="text-sm text-amber-400">{portalError}</p>
          <button
            type="button"
            onClick={openPortal}
            className="mt-2 text-sm font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Reintentar
          </button>
        </div>
      )}
    </Card>
  );
}
