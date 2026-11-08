# VIVIPRESSONFIT — Plataforma Web de Membresía y Streaming

Plataforma SaaS de bienestar y entrenamiento físico bajo modelo de membresía mensual con prueba de 7 días gratuitos, portal privado de alumnas con streaming adaptativo seguro (Bunny.net), autenticación JWT y base de datos relacional (Supabase) y facturación automatizada (Stripe).

* **URL de Producción Oficial:** [vivi-pressonfit.vercel.app](https://vivi-pressonfit.vercel.app/)

---

## 📚 Documentación Central del Proyecto

La documentación del proyecto ha sido consolidada y unificada en **2 únicos documentos maestros** dentro de la carpeta [`docs/`](docs/):

1. 📘 **[DOCUMENTO COMPLETO DEL PROYECTO](docs/DOCUMENTO_COMPLETO_PROYECTO.md)**  
   *Toda la información técnica y funcional de la solución.*
   * **Ficha Técnica y Stack:** React 18, TypeScript, Vite, Tailwind CSS, Supabase, Bunny Stream y Stripe.
   * **Arquitectura Global:** Diagramas de componentes, flujos de autenticación y topología de infraestructura.
   * **Frontend y Estado:** Rutas, almacenes Zustand (`authStore`, `membershipStore`, `videoStore`) y componentes UI.
   * **Sistema de Diseño y Accesibilidad:** Tokens cromáticos, contraste 5.8:1, controles de pausa y certificación **WCAG 2.2 AA**.
   * **Backend y Base de Datos:** Esquema PostgreSQL, políticas de seguridad por fila (RLS) y función RPC de testers.
   * **Edge Functions (Deno):** Generación de tokens firmados SHA-256 (`bunny-token`) y webhooks de Stripe.
   * **Streaming Seguro:** Separación de librerías pública (`797766`) y privada (`796132`) en Bunny.net.
   * **Manual de Operaciones:** Guía para administradores, gestión de clases y variables de entorno.

2. 📋 **[PENDIENTES Y ROADMAP](docs/PENDIENTES_Y_ROADMAP.md)**  
   *Hoja de ruta operativa y mejoras post-lanzamiento.*
   * **Estado de la Plataforma:** Registro de funcionalidades completadas al 100%.
   * **Tareas Previas al Lanzamiento (P0):** Dominio propio (`vivipressonfit.com`), pase a claves Live de Stripe y carga de catálogo inicial de clases.
   * **Mejoras Post-Lanzamiento (P1):** Emails transaccionales (Resend/SendGrid) y analítica de conversión.
   * **Roadmap a Futuro (P2):** Aplicación instalable (PWA), calendario de entrenamientos y optimización histórica de repositorio.

---

## 🚀 Inicio Rápido en Desarrollo Local

```bash
# 1. Clonar el repositorio y entrar al frontend
git clone https://github.com/vivipressonfitness/Vivi-pressonfit.git
cd Vivi-pressonfit/web

# 2. Instalar dependencias con Node 22 LTS
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar servidor de desarrollo Vite
npm run dev
```

## 🛠️ Comandos de Verificación y Compilación

Desde el directorio `web/`:
* `npm run lint` — Ejecuta ESLint sobre todo el código fuente TS/TSX.
* `npm run typecheck` — Comprobación estricta de tipos con TypeScript (`tsc --noEmit`).
* `npm run build` — Compilación y optimización de producción para Vercel (`dist/`).
