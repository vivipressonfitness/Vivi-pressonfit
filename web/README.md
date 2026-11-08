# VIVIPRESSONFIT — Frontend Web (`web/`)

Aplicación SPA en React 18 + TypeScript + Vite que implementa el portal público, área de membresía, biblioteca de videos y panel de administración.

* **Despliegue Oficial en Vercel:** [vivi-pressonfit.vercel.app](https://vivi-pressonfit.vercel.app/)
* **Documentación Central:** Ver [`../docs/DOCUMENTO_COMPLETO_PROYECTO.md`](../docs/DOCUMENTO_COMPLETO_PROYECTO.md) y [`../docs/PENDIENTES_Y_ROADMAP.md`](../docs/PENDIENTES_Y_ROADMAP.md).

---

## Stack Tecnológico

* **React 18.3.1** con TypeScript 5.6.3
* **Vite 7.3.7** para empaquetado optimizado
* **Tailwind CSS 3.4.19** con tokens de diseño contrastados (WCAG 2.2 AA)
* **React Router DOM 7.18.4** para navegación cliente
* **Zustand 5.0.2** para gestión atómica de estado
* **Supabase Client 2.45** para Auth y base de datos
* **Stripe.js 4.10** para pagos y Customer Portal
* **Node 22 LTS** (`engines.node: 22.x`)

---

## Comandos Principales

```bash
npm run dev        # Servidor de desarrollo Vite en http://localhost:3000
npm run lint       # Validación de reglas con ESLint
npm run typecheck  # Comprobación de tipos con tsc --noEmit
npm run build      # Compilación estricta para producción (dist/)
npm run preview    # Previsualización local del bundle de producción
```

---

## Variables de Entorno Públicas (`.env.local`)

| Variable | Descripción |
| :--- | :--- |
| `VITE_SUPABASE_URL` | URL de la instancia de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe (`pk_...`) |
| `VITE_WHATSAPP_NUMBER` | Teléfono de soporte de la coach |
