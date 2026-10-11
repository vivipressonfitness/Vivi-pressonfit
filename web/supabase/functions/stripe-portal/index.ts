import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, isStripeCustomerId, json, stripeRequest } from '../_shared/stripe.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) return json({ error: 'Inicia sesión para gestionar tu suscripción.' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: 'Tu sesión no es válida. Inicia sesión otra vez.' }, 401);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, plan_status')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError) return json({ error: 'No se pudo consultar tu perfil.' }, 500);
    if (!profile) return json({ error: 'No encontramos el perfil de esta cuenta.' }, 404);

    if (!isStripeCustomerId(profile.stripe_customer_id)) {
      return json({
        error: profile.plan_status === 'trial'
          ? 'Tu cuenta está en prueba gratuita y aún no tiene una suscripción de Stripe para gestionar.'
          : 'Esta cuenta todavía no tiene un cliente de Stripe asociado.',
        code: 'stripe_customer_missing',
      }, 409);
    }
    if (!profile.stripe_subscription_id && profile.plan_status === 'trial') {
      return json({ error: 'Tu cuenta está en prueba gratuita y aún no tiene una suscripción de Stripe para gestionar.', code: 'stripe_subscription_missing' }, 409);
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = (Deno.env.get('APP_ORIGIN') ?? 'https://vivipressonfit.netlify.app')
      .split(',').map((value) => value.trim()).filter(Boolean);
    const returnOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    if (!returnOrigin) return json({ error: 'No está configurado el dominio de retorno.' }, 500);

    const form = new URLSearchParams({
      customer: profile.stripe_customer_id.trim(),
      return_url: `${returnOrigin}/membresia`,
    });
    const portal = await stripeRequest('billing_portal/sessions', form);
    if (!portal.url) return json({ error: 'Stripe no devolvió una URL del portal.' }, 502);
    return json({ url: portal.url });
  } catch (error) {
    console.error('stripe-portal:', error);
    return json({ error: error instanceof Error ? error.message : 'No se pudo abrir el portal de Stripe.' }, 500);
  }
});
