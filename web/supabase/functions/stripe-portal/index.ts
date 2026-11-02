// @ts-nocheck
// deno-lint-ignore-file
/* eslint-disable */
import { createClient } from 'npm:@supabase/supabase-js@2';

// ─── Utilidades compartidas de Stripe ───────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function stripeSecret() {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Falta configurar STRIPE_SECRET_KEY en Supabase.');
  return key;
}

async function stripeRequest(path: string, params: URLSearchParams) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message ?? `Stripe respondió HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

function isStripeCustomerId(value: unknown): value is string {
  return typeof value === 'string' && /^cus_[A-Za-z0-9]+$/.test(value.trim());
}

// ─── Manejador de Portal de Facturación ─────────────────────────
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
    const allowedOrigins = (Deno.env.get('APP_ORIGIN') ?? 'https://vivi-pressonfit.vercel.app')
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