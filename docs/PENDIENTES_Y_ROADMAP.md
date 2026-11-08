# VIVIPRESSONFIT — Pendientes, Backlog y Roadmap de Producción

**Hoja de Ruta Operativa y Mejoras Post-Lanzamiento**  
*Versión: 2.0.0*  
*Fecha: Noviembre 2026*  
*Entorno Actual: [vivi-pressonfit.vercel.app](https://vivi-pressonfit.vercel.app/)*  

---

## 1. Estado Actual de la Plataforma

El desarrollo técnico central del frontend, backend, seguridad y diseño accesible se encuentra **100% completado y validado en producción**:

* ✅ **Remediación UI/UX y Accesibilidad:** Los 24 hallazgos de auditoría (F-01 a F-24) han sido resueltos y verificados bajo **WCAG 2.2 Nivel AA** (contraste cromático 5.8:1, controles de pausa en animaciones, modales accesibles y metas táctiles de 44 px).
* ✅ **Pipeline CI/CD y Calidad:** TypeScript 0 errores, ESLint 0 errores y compilación estricta de producción en Vite (`dist/`).
* ✅ **Infraestructura de Video:** Transcodificación adaptativa HLS en Bunny Stream con separación entre librería pública (`797766`) y librería privada (`796132`) protegida por tokens criptográficos SHA-256.
* ✅ **Pasarela de Membresía:** Integración funcional con Stripe Checkout (prueba de 7 días gratuitos + USD 40/mes), Customer Billing Portal y sincronización por webhooks HMAC.
* ✅ **Panel de Administración:** Gestión modular de clases, miembros y configuración de la landing page.

---

## 2. Pendientes Críticos Previos al Lanzamiento Comercial (P0)

> **Criterio P0:** Acciones necesarias antes de invertir en publicidad paga, campañas de adquisición o cobro a alumnas reales.

| Tarea | Área | Esfuerzo | Descripción y Pasos de Ejecución |
| :--- | :--- | :--- | :--- |
| **2.1 Dominio Propio** | Infraestructura / DNS | S (1-2 horas) | Configurar el dominio definitivo (ej. `vivipressonfit.com`) en el panel de Vercel (**Settings > Domains**). Apuntar los registros DNS en el registrador (Registro A hacia `76.76.21.21` o CNAME `cname.vercel-dns.com`). Vercel aprovisionará el certificado SSL automáticamente. |
| **2.2 Activación de Stripe en Modo Live** | Pagos / Facturación | S (1 hora) | Cuando se abra al público general, cambiar las claves de prueba (`test`) a claves de producción (`live`) en: <br>1) Supabase Edge Functions Secrets: `STRIPE_SECRET_KEY` (`sk_live_...`), `STRIPE_PRICE_ID` (`price_...`) y `STRIPE_WEBHOOK_SECRET` (`whsec_...`). <br>2) Vercel: `VITE_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`). <br>3) En Stripe Dashboard: Registrar el webhook live apuntando a `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`. |
| **2.3 Carga del Catálogo Completo de Clases** | Contenido / Admin | M (1-2 días) | Subir el paquete inicial completo de clases grabadas (Full Body, GAP, Cardio, Fuerza) a Bunny Stream (Librería `796132`) y darlas de alta desde el panel `/admin` con sus títulos, duración, nivel de dificultad y miniaturas definitivas. |
| **2.4 Revisión Legal Final** | Legal / Cumplimiento | S (1 día) | Ajustar la razón social, NIF/CIF o datos fiscales en las páginas legales (`/terminos`, `/privacidad`, `/aviso-legal`) conforme a la legislación del país donde tribute el negocio. |

---

## 3. Mejoras y Optimización Post-Lanzamiento (P1)

> **Criterio P1:** Funcionalidades recomendadas para mejorar la conversión, la retención y la comunicación operativa en las primeras semanas de operación.

| Tarea | Área | Esfuerzo | Descripción y Beneficio |
| :--- | :--- | :--- | :--- |
| **3.1 Servicio de Emails Transaccionales** | Notificaciones | M (2-3 días) | Integrar un proveedor de correo transaccional (Resend, SendGrid o Postmark) en Supabase Auth y en los webhooks de Stripe. <br>• Correo de bienvenida a la plataforma con guía de primeros pasos. <br>• Recordatorio automático al día 5 del periodo de prueba ("Faltan 2 días para tu primera mensualidad"). <br>• Notificación de recibo de cobro y avisos en caso de tarjeta vencida. |
| **3.2 Analítica de Conversión y Embudos** | Producto / Marketing | S (1 día) | Conectar Google Analytics 4 o Plausible Analytics condicionado a la aceptación en el `CookieBanner` existente, midiendo el embudo clave: *Visita Landing → Clic en 7 días gratis → Registro → Stripe Checkout iniciado → Suscripción completada*. |
| **3.3 Canal Oficial de Soporte en WhatsApp** | Atención al Cliente | S (30 min) | Asignar la línea oficial de WhatsApp Business en la variable de entorno `VITE_WHATSAPP_NUMBER` para que los botones de soporte del Navbar, Dashboard y Footer abran el chat directamente con la coach. |

---

## 4. Mantenimiento Técnico y Roadmap a Futuro (P2)

> **Criterio P2:** Mejoras estructurales, deuda técnica histórica y nuevas funcionalidades a considerar según la escala del negocio.

| Tarea | Área | Esfuerzo | Descripción |
| :--- | :--- | :--- | :--- |
| **4.1 Purgado de Videos Históricos en Git** | Higiene Técnica / Repo | S (2 horas) | Durante las fases iniciales del proyecto (previas a la migración a Bunny Stream), se subieron 9 videos MP4 al repositorio que hoy están en desuso. Aunque ya están excluidos en `.gitignore`, permanecen en el historial git ocupando ~13 MB. Se puede ejecutar una limpieza con `git-filter-repo` para reducir el tamaño del clone del repositorio. |
| **4.2 Progressive Web App (PWA)** | Mobile UX | M (2 días) | Añadir `manifest.json` e iconos para que las alumnas puedan "Instalar" la aplicación directamente en su iPhone o Android desde el navegador, teniéndola en su pantalla de inicio como una app nativa sin pasar por App Store ni Google Play. |
| **4.3 Historial y Métricas de Entrenamiento** | Gamificación | L (3-5 días) | Incorporar en el Dashboard un registro de "Clase completada", permitiendo a las usuarias marcar entrenamientos finalizados y visualizar un calendario mensual con sus días activos de ejercicio. |

---

## 5. Matriz de Priorización y Próximos Pasos

```
PASO INMEDIATO (Semana 1):
  1. Configurar dominio propio en Vercel (P0)
  2. Cargar videos reales de clases en Bunny e indexar en /admin (P0)
  3. Revisión legal de textos y datos de contacto (P0)

LANZAMIENTO COMERCIAL (Semana 2):
  4. Activar claves Live de Stripe (P0)
  5. Conectar WhatsApp Business de soporte (P1)
  6. Iniciar difusión y tráfico de alumnas

POST-LANZAMIENTO Y CRECIMIENTO (Mes 1):
  7. Implementar emails transaccionales con Resend (P1)
  8. Medición de métricas de retención y cancelación (P1)
  9. Evaluación de PWA para móviles (P2)
```

---

*Documento de Pendientes y Roadmap · Plataforma VIVIPRESSONFIT · Versión 2.0.0 · Consolidado y compatible.*
