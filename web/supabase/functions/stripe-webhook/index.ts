import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/stripe.ts';

const encoder = new TextEncoder();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) return json({ error: 'Webhook no configurado.' }, 500);
    const signature = req.headers.get('stripe-signature');
    if (!signature) return json({ error: 'Falta la firma de Stripe.' }, 400);

    const rawBody = await req.text();
    if (!await verifyStripeSignature(rawBody, signature, webhookSecret)) {
      return json({ error: 'Firma de Stripe inválida.' }, 400);
    }
    const event = JSON.parse(rawBody);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
      if (!userId || typeof session.customer !== 'string') {
        return json({ error: 'Checkout sin user ID o customer válido.' }, 400);
      }
      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
      const { error } = await supabase.from('profiles').update({
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscriptionId,
        plan_status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      if (error) throw error;
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        const { error } = await supabase.from('profiles').update({
          stripe_subscription_id: null,
          plan_status: 'canceled',
          updated_at: new Date().toISOString(),
        }).eq('id', userId);
        if (error) throw error;
      }
    } else if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object;
      const userId = subscription.metadata?.supabase_user_id;
      if (userId) {
        const status = subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status === 'past_due' || subscription.status === 'unpaid'
            ? 'past_due'
            : subscription.status === 'canceled' || subscription.status === 'incomplete_expired'
              ? 'canceled'
              : null;
        if (status) {
          const customerId = typeof subscription.customer === 'string' ? subscription.customer : null;
          const { error } = await supabase.from('profiles').update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            plan_status: status,
            updated_at: new Date().toISOString(),
          }).eq('id', userId);
          if (error) throw error;
        }
      }
    }

    return json({ received: true });
  } catch (error) {
    console.error('stripe-webhook:', error);
    return json({ error: error instanceof Error ? error.message : 'Error procesando webhook.' }, 500);
  }
});

async function verifyStripeSignature(payload: string, header: string, secret: string) {
  const values = header.split(',').map((part) => part.split('=', 2));
  const timestamp = values.find(([key]) => key === 't')?.[1];
  const signatures = values.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() / 1000 - timestampNumber) > 300) return false;

  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return signatures.some((signature) => timingSafeEqual(signature, expected));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
