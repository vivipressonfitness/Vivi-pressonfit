# VIVIPREFIT — Frontend React (`web/`)

Nueva aplicación React + TypeScript que reemplaza la SPA vanilla de `frontend/index.html`.
El backend (Supabase, Stripe, Bunny Stream, Edge Functions) **no cambia**.

## Stack

React 18 · TypeScript · Vite · React Router v6 · Zustand · Tailwind CSS · Supabase JS · Stripe JS · HLS.js

## Requisitos

- Node ≥ 18
- Proyecto Supabase configurado (schema de `database/schema.sql` desplegado)
- Edge Functions desplegadas: `bunny-token`, `stripe-webhook` (+ `stripe-checkout` y `stripe-portal`, ver abajo)

## Instalación local

```bash
cd web
npm install
cp .env.example .env.local   # completa VITE_SUPABASE_ANON_KEY y VITE_STRIPE_PUBLISHABLE_KEY
npm run dev                  # http://localhost:3000
```

## Variables de entorno (solo públicas, prefijo VITE_)

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key (RLS autoriza; nunca uses SERVICE_ROLE_KEY aquí) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública `pk_...` |
| `VITE_WHATSAPP_NUMBER` | Número de soporte |

## Scripts

```bash
npm run dev        # desarrollo
npm run build      # typecheck + build → dist/
npm run preview    # servir build local
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## Despliegue en Vercel

1. Importa el repo y establece **Root Directory = `web`**.
2. Build command: `npm run build` · Output: `dist` (ya en `vercel.json`).
3. Agrega las 4 variables `VITE_*` en Project → Settings → Environment Variables.
4. Deploy. `vercel.json` incluye rewrite SPA para React Router.

## Seguridad

- Autorización real = **RLS en Supabase** + verificación de sesión en Edge Functions.
- Tokens Bunny: siempre vía Edge Function `bunny-token` (SHA256 firmado, TTL 120 min). El frontend nunca conoce `BUNNY_STREAM_TOKEN_KEY`.
- Stripe Checkout: debe crearse en el servidor (Edge Function `stripe-checkout`). La SPA anterior usaba la secret key en el cliente — **no migrar ese patrón**.

## Estructura

```
src/
  components/{ui,layout,video,membership,auth}
  pages/          Home, Login, Register, Dashboard, Videos, Profile, Membership, Admin
  hooks/          useAuth, useMembership, useVideos, useStripe
  lib/            supabase, stripe, bunny
  store/          authStore, membershipStore, videoStore (Zustand)
  types/          tipos alineados a schema.sql
  layouts/        PublicLayout, PrivateLayout
  router.tsx      rutas públicas + protegidas (code-splitting)
```

## Backend pendiente (recomendado)

Para activar cobro y autogestión 100% desde React se necesitan dos Edge Functions nuevas
(espejo de `bunny-token`, sin tocar las existentes):

- `stripe-checkout`: crea Checkout Session (mode subscription, `STRIPE_PRICE_ID`) y devuelve `{ url }`.
- `stripe-portal`: crea Billing Portal session para el `stripe_customer_id` del usuario y devuelve `{ url }`.

Mientras no existan, los botones muestran avisos claros (sin romper nada).
