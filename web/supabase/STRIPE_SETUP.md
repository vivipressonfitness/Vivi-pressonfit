# Configuración de Stripe en Supabase

Estas funciones mantienen las claves privadas en Supabase y vinculan el cliente creado en Stripe con `public.profiles`.

## Secrets de Supabase

En Supabase → Edge Functions → Secrets, configura valores del mismo modo de Stripe (test o live):

- `STRIPE_SECRET_KEY`: clave secreta del modo elegido (`sk_test_...` para pruebas).
- `STRIPE_PRICE_ID`: precio recurrente mensual (`price_...`) creado en ese mismo modo.
- `STRIPE_WEBHOOK_SECRET`: secreto `whsec_...` del endpoint webhook.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key del proyecto; solo la usa el webhook.
- `APP_ORIGIN`: `https://vivipressonfit.netlify.app`; en desarrollo se puede añadir `http://localhost:3000`, separado por coma.

`SUPABASE_URL` y `SUPABASE_ANON_KEY` son secrets reservados que Supabase entrega a las funciones.

## Desplegar

Desde la carpeta `web` con Supabase CLI vinculado al proyecto correcto:

```sh
supabase functions deploy stripe-checkout
supabase functions deploy stripe-portal
supabase functions deploy stripe-webhook --no-verify-jwt
```

La función `stripe-webhook` verifica la firma criptográfica de Stripe en su código; por eso su verificación JWT de Supabase debe estar desactivada. Checkout y portal conservan la verificación del JWT y además validan al usuario dentro de la función.

## Endpoint webhook de Stripe

En Stripe Developers → Webhooks, añade:

```text
https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

Selecciona los eventos `checkout.session.completed`, `customer.subscription.updated` y `customer.subscription.deleted`. Copia el signing secret de ese endpoint a `STRIPE_WEBHOOK_SECRET` en Supabase.

El precio (`STRIPE_PRICE_ID`) y la clave (`STRIPE_SECRET_KEY`) tienen que pertenecer al mismo modo de Stripe. Para las pruebas, usa ambos en modo test y configura también en Stripe el Customer Portal.

## Comprobar la vinculación

Después de completar un pago de prueba, `public.profiles` debe mostrar IDs con formato `cus_...` y `sub_...`, y `plan_status = 'active'`. No escribas estos IDs manualmente. Si la compra se completó pero no se guardaron, revisa los logs de `stripe-webhook` y las entregas fallidas del endpoint en Stripe.
