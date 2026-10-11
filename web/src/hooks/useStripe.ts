import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

// NOTA DE ARQUITECTURA: la SPA actual crea el Checkout Session en el cliente,
// lo cual NO es seguro. Este hook asume la Edge Function `stripe-checkout`
// (ver sección "CAMBIOS REQUERIDOS EN BACKEND"). Si aún no existe, el botón
// muestra un aviso en lugar de exponer STRIPE_SECRET_KEY.
export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('stripe-checkout', { body: {} });
      if (invokeError) {
        const context = invokeError.context;
        if (context instanceof Response) {
          const body = await context.clone().json().catch(() => null);
          throw new Error(body?.error ?? invokeError.message);
        }
        throw new Error(invokeError.message);
      }
      if (!data?.url) throw new Error('No se recibió URL de Stripe Checkout');

      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error iniciando checkout');
    } finally {
      setLoading(false);
    }
  }, []);

  return { startCheckout, loading, error };
}
