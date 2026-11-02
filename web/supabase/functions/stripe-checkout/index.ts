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

// ─── Manejador de Checkout ──────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) return json({ error: 'Inicia sesión para continuar.' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: 'Tu sesión no es válida. Inicia sesión otra vez.' }, 401);

    const priceId = Deno.env.get('STRIPE_PRICE_ID');
    if (!priceId || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
      return json({ error: 'Falta configurar un STRIPE_PRICE_ID válido en Supabase.' }, 500);
    }

    const origin = req.headers.get('origin');
    const allowedOrigins = (Deno.env.get('APP_ORIGIN') ?? 'https://vivi-pressonfit.vercel.app')
      .split(',').map((value) => value.trim()).filter(Boolean);
    const returnOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    if (!returnOrigin) return json({ error: 'No está configurado el dominio de retorno.' }, 500);

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle();
    if (profileError) return json({ error: 'No se pudo consultar tu perfil.' }, 500);

    const form = new URLSearchParams({
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'subscription_data[trial_period_days]': '7',
      success_url: `${returnOrigin}/membresia?checkout=success`,
      cancel_url: `${returnOrigin}/membresia?checkout=cancelled`,
      client_reference_id: user.id,
      'metadata[supabase_user_id]': user.id,
      'subscription_data[metadata][supabase_user_id]': user.id,
    });
    if (user.email) form.set('customer_email', user.email);
    const customerId = profile?.stripe_customer_id?.trim();
    if (customerId && /^cus_[A-Za-z0-9]+$/.test(customerId)) {
      form.delete('customer_email');
      form.set('customer', customerId);
    }

    const session = await stripeRequest('checkout/sessions', form);
    if (!session.url) return json({ error: 'Stripe no devolvió una URL de pago.' }, 502);
    return json({ url: session.url });
  } catch (error) {
    console.error('stripe-checkout:', error);
    return json({ error: error instanceof Error ? error.message : 'No se pudo iniciar el pago.' }, 500);
  }
});
