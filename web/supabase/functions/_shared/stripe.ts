export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function stripeSecret() {
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) throw new Error('Falta configurar STRIPE_SECRET_KEY en Supabase.');
  return key;
}

export async function stripeRequest(path: string, params: URLSearchParams) {
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

export function isStripeCustomerId(value: unknown): value is string {
  return typeof value === 'string' && /^cus_[A-Za-z0-9]+$/.test(value.trim());
}
