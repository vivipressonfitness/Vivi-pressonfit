import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getStripe } from '../lib/stripe';

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
      const { data } = await supabase.functions
        .invoke('stripe-checkout', { body: {} })
        .then(({ data, error }) => {
          if (error) throw new Error(error.message);
          return { data: data as { url?: string; missing?: boolean } };
        })
        .catch((e: Error) => ({ data: { missing: /Function not found/i.test(e.message) } as { url?: string; missing?: boolean } }));

      if (data?.missing) {
        throw new Error(
          'Falta la Edge Function stripe-checkout. Configúrala antes de cobrar suscripciones.',
        );
      }
      if (!data?.url) throw new Error('No se recibió URL de Stripe Checkout');

      const stripe = await getStripe();
      const result = await stripe!.redirectToCheckout({ sessionId: extractSessionId(data.url) });
      if (result.error) setError(result.error.message ?? 'No se pudo abrir Stripe');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error iniciando checkout');
    } finally {
      setLoading(false);
    }
  }, []);

  return { startCheckout, loading, error };
}

function extractSessionId(url: string): string {
  // Acepta tanto una URL de checkout como un id cs_... directo
  const match = url.match(/cs_[A-Za-z0-9]+/);
  if (!match) throw new Error('URL de Checkout inválida');
  return match[0];
}
