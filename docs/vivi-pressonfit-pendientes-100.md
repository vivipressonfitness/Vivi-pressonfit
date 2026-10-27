# VIVIPRESSONFIT — Plan técnico para llegar al 100%

**Documento:** Backlog técnico de producción, seguridad, contenido, pagos y lanzamiento  
**Proyecto:** VIVIPRESSONFIT  
**URL auditada:** https://vivi-pressonfit.vercel.app/  
**Fecha:** 24 de octubre de 2026  
**Versión:** 1.0  
**Alcance:** trabajo técnico pendiente para considerar el producto 100% listo para producción.  
**Fuera de alcance:** precios, tarifas, propuestas comerciales y estrategia de cobro.

---

## 0. Resumen ejecutivo

El sitio está en un estado funcional avanzado: landing, autenticación, membresía, dashboard, biblioteca de videos, perfil, panel de administración, páginas legales, Stripe y Bunny Stream ya existen. La auditoría externa lo sitúa en torno al **70% funcional** y al **50–60% listo para producción**.

La diferencia no está en la UI. Está en la capa que convierte una demo en un negocio operativo:

1. **Aislamiento de medios privados** y endurecimiento de RLS.
2. **Definición e implementación completa del trial de 7 días**.
3. **Contenido real** y limpieza de datos de prueba.
4. **Emails transaccionales y de ciclo de vida**.
5. **Analítica, observabilidad y consentimiento**.
6. **Dominio propio, metadatos y assets**.
7. **Performance, accesibilidad y QA**.
8. **Revisión legal y operación**.

El bucket `members-media` es público hoy por decisión de prueba. Eso es aceptable **solo** mientras contenga demos y no haya clientes pagando. Antes de subir contenido real debe pasar a privado, con URLs firmadas o Bunny para todo el contenido de miembros.

### Ruta crítica

```
Decisiones de negocio
  → separación de buckets y storage privado
  → trial + Stripe live probado
  → carga de contenido real
  → emails + analítica
  → dominio + SEO
  → performance + accesibilidad
  → QA + legal
  → lanzamiento
```

### Bloqueantes absolutos

- Contenido real en bucket público.
- Stripe live sin probar trial, pago, fallo, cancelación y reactivación.
- RLS o autorización de admin solo en el cliente.
- Contenido de prueba (`example.com`, “Prueba de Video”, IDs duplicados) visible a miembros.
- Trial sin reglas de negocio definidas.
- Legal sin revisar para el país de operación.

---

## 1. Contexto y método

### 1.1 Alcance de la auditoría

Se auditó el sitio público en producción y los bundles servidos por Vercel. No se tuvo acceso al repositorio, a las políticas RLS, a la configuración de Stripe, a las variables de entorno ni al panel de Supabase. Por eso:

- Los hallazgos de frontend, rutas, assets, storage público, metadatos y performance están verificados.
- Los hallazgos de RLS, Stripe live, emails y CI/CD están marcados como **“verificar en código/configuración”**.
- Las tareas de este documento son el alcance técnico necesario; algunas requieren acceso al repositorio y a los paneles.

### 1.2 Evidencia utilizada

- Navegación y snapshots del sitio.
- Inspección de bundles JS/CSS y chunks lazy.
- Consultas de solo lectura a Supabase REST y Storage con la clave anónima pública.
- Pruebas de disponibilidad de assets.
- Lighthouse (accesibilidad, SEO, buenas prácticas).
- Medición de recursos y tiempos de carga.
- Revisión de `robots.txt`, `sitemap.xml`, `index.html` y JSON-LD.

### 1.3 Limitaciones

- No se ejecutaron pagos reales ni se crearon usuarios.
- No se modificó ningún dato.
- No se probó en dispositivos móviles reales.
- No se revisó el código fuente ni las políticas RLS.
- Las métricas de performance son de una sola ubicación y red; deben repetirse desde el país objetivo.

### 1.4 Prioridades

| Prioridad | Significado |
|---|---|
| **P0** | Bloqueante de lanzamiento. No se debe cobrar, subir contenido real ni abrir tráfico pago sin esto. |
| **P1** | Requerido para el 100% y para una operación estable. |
| **P2** | Mejora recomendada, no bloqueante para el lanzamiento. |

### 1.5 Complejidad técnica

| Tamaño | Referencia |
|---|---|
| **S** | Menos de 1 día de trabajo. |
| **M** | 1–3 días. |
| **L** | 3–5 días. |
| **XL** | Más de 5 días o depende de terceros. |

La complejidad es técnica, no comercial. No representa precios.

### 1.6 Definición de “100%”

El proyecto se considera 100% cuando:

- Todos los P0 y P1 están cerrados.
- El trial funciona de punta a punta con Stripe live.
- Ningún contenido privado es accesible sin autorización.
- El contenido real está cargado y probado.
- El dominio propio está activo y los metadatos son correctos.
- Hay emails, analítica, monitoreo y backups.
- Legal está revisado.
- QA y UAT están firmados.
- La documentación y el handover están completos.

---

## 2. Inventario técnico actual

### 2.1 Stack observado

| Capa | Tecnología |
|---|---|
| Frontend | Vite + React + React Router + Tailwind CSS |
| Backend | Supabase (Auth, Postgres, Storage, Edge Functions) |
| Pagos | Stripe Checkout, Webhook y Customer Portal |
| Video | Bunny Stream (HLS, tokens firmados) |
| Storage | Supabase Storage (`landing` público, `members-media` actualmente público) |
| Hosting | Vercel |
| Dominio | `vivi-pressonfit.vercel.app` |

### 2.2 Rutas

| Ruta | Función |
|---|---|
| `/` | Landing pública |
| `/membresia` | Plan, registro y checkout |
| `/login` | Inicio de sesión |
| `/registro` | Registro |
| `/recuperar` | Solicitud de recuperación |
| `/recuperar-password` | Cambio de contraseña |
| `/terminos` | Términos |
| `/privacidad` | Privacidad |
| `/cookies` | Cookies |
| `/aviso-legal` | Aviso legal |
| `/legal` | Contenedor legal |
| `/perfil` | Perfil del miembro |
| `/dashboard` | Panel del miembro |
| `/videos` | Biblioteca de videos |
| `/admin` | Panel de administración |

### 2.3 Backend observado

Tablas:

- `profiles`
- `landing_config`
- `membership_content`

Edge Functions:

- `stripe-checkout`
- `stripe-webhook`
- `stripe-portal`
- `bunny-token`
- `bunny-token-public`

Buckets:

- `landing` (público, esperado)
- `members-media` (público hoy, **debe ser privado antes de contenido real**)

### 2.4 Estado estimado por módulo

| Módulo | Estado funcional | Estado producción | Nota |
|---|---:|---:|---|
| Landing | 90% | 70% | Falta limpieza de placeholders, assets y performance. |
| Auth | 85% | 60% | Falta verificación de email, redirects y hardening. |
| Membresía / checkout | 80% | 50% | Stripe existe; trial live sin verificar. |
| Dashboard / videos | 80% | 55% | Reproductor y acceso existen; contenido real y storage privado pendientes. |
| Perfil | 85% | 70% | Falta gestión completa de cuenta y eliminación. |
| Admin | 80% | 60% | CMS completo; faltan suscripciones, auditoría y validaciones. |
| Legal | 70% | 40% | Páginas existen; revisión legal pendiente. |
| Seguridad | 40% | 25% | Bucket público, RLS y autorización por verificar. |
| Pagos live | 50% | 30% | Funciones existen; modo live y ciclo completo sin probar. |
| Contenido | 30% | 20% | Demo y duplicados. |
| Emails | 10% | 5% | Solo emails de Supabase Auth. |
| Analítica | 0% | 0% | No se detectó script de analítica. |
| SEO / dominio | 60% | 45% | Metadatos básicos; dominio y assets rotos. |
| Performance | 60% | 40% | 3 MB iniciales y TTFB alto. |
| QA | 20% | 15% | Sin evidencia de suite automatizada. |
| Operación | 30% | 20% | Sin evidencia de monitoreo, backups o runbook. |

### 2.5 Hallazgos principales

1. **Bucket `members-media` público:** permite listar y descargar archivos con la clave anónima. Verificado con un video real.
2. **Contenido demo:** “Prueba de Video”, “Rutina VIP Ejemplo”, `example.com`, IDs de Bunny duplicados.
3. **Datos inconsistentes:** `whatsapp_number` = `59178000000` en configuración, pero el footer y el JSON-LD usan `+5493415888117`.
4. **Sin analítica:** no se detectaron GA4, Meta Pixel, PostHog, Plausible ni Vercel Analytics.
5. **Sin emails de ciclo de vida:** no se detectaron Resend, SendGrid, Mailgun, Postmark ni Brevo.
6. **Assets rotos:** el logo del JSON-LD devuelve HTML; no hay favicon real.
7. **SEO de SPA:** una sola metadata para todas las rutas; sitemap incluye login, registro y recuperación.
8. **Performance:** ~3 MB iniciales, imágenes JPG ~1.3 MB, TTFB ~2.2 s en la medición.
9. **Accesibilidad:** Lighthouse 96; solo falla contraste en el marquee decorativo.
10. **Stripe:** las tres funciones responden, pero no se verificó modo live, impuestos, facturas ni ciclo de trial.

---

## 3. Decisiones pendientes (gates)

Estas decisiones deben estar cerradas antes de implementar. Sin ellas, el alcance queda ambiguo.

| ID | Decisión | Impacto | Responsable |
|---|---|---|---|
| DEC-01 | ¿El trial exige tarjeta? | Checkout, webhook, acceso, conversión, abuso. | Negocio |
| DEC-02 | ¿Qué pasa el día 8 si no paga? | Acceso, emails, dunning, legal. | Negocio |
| DEC-03 | ¿Hay período de gracia para `past_due`? | Acceso y mensajes. | Negocio |
| DEC-04 | ¿Un trial por persona, email, tarjeta o cliente Stripe? | Prevención de abuso. | Negocio + técnico |
| DEC-05 | ¿Qué contenido es público, de trial y solo de pago? | Modelo de datos, RLS, UI. | Negocio |
| DEC-06 | ¿Precio, moneda, impuestos incluidos o excluidos? | Stripe, facturas, legal. | Negocio |
| DEC-07 | ¿Política de reembolsos y cancelación? | Legal, Stripe, soporte. | Negocio + legal |
| DEC-08 | ¿País/jurisdicción y entidad legal? | Legal, impuestos, consumer law. | Negocio |
| DEC-09 | ¿Dominio definitivo? | SEO, auth redirects, emails, Stripe. | Negocio |
| DEC-10 | ¿Proveedor de email? | Templates, deliverability, DNS. | Técnico |
| DEC-11 | ¿Proveedor de analítica? | Consentimiento, eventos, dashboards. | Negocio + técnico |
| DEC-12 | ¿Bunny para todo el video o Supabase privado? | Storage, player, costos de infraestructura. | Técnico |
| DEC-13 | ¿Se permite `content_url` externo? | Seguridad, piratería, soporte. | Técnico |
| DEC-14 | ¿Roles de admin y permisos? | RLS, auditoría, operación. | Negocio + técnico |
| DEC-15 | ¿Retención de datos y eliminación de cuenta? | Legal, DB, storage. | Negocio + legal |
| DEC-16 | ¿Edad mínima y disclaimer de salud? | Legal, registro, copy. | Legal |

**Gate 0:** ninguna tarea de contenido real o Stripe live empieza hasta que DEC-01 a DEC-08 estén documentadas.

---

## 4. Backlog técnico

### 4.1 Seguridad y control de acceso

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| SEC-01 | P0 | Convertir `members-media` en bucket privado. | La clave anónima no puede listar ni descargar archivos; solo URLs firmadas o tokens Bunny. | DEC-12 | S |
| SEC-02 | P0 | Separar buckets público y privado. | `landing-public` solo contiene assets de marketing; `members-private` solo contenido de miembros. | SEC-01 | M |
| SEC-03 | P0 | Auditar y definir RLS en `profiles`, `landing_config`, `membership_content` y Storage. | Matriz RLS aprobada y probada con anon, trial, active, canceled y admin. Sin escrituras anónimas. | DEC-05, DEC-14 | L |
| SEC-04 | P0 | Mover la autorización de admin al servidor. | Un usuario no admin no puede mutar contenido, configuración ni roles usando la API directamente. | SEC-03 | M |
| SEC-05 | P0 | Implementar URLs firmadas de corta duración o Bunny para todo video privado. | Ningún video de miembro tiene URL permanente; el player obtiene URL temporal. | DEC-12 | L |
| SEC-06 | P0 | Eliminar el uso de `publicUrl` para contenido privado en el admin. | El admin guarda `storage_path` o `bunny_video_id`; nunca una URL pública para contenido de pago. | SEC-05 | M |
| SEC-07 | P1 | Endurecer autenticación: política de contraseñas, verificación de email, rate limit y CAPTCHA. | Registro/login resisten fuerza bruta y cuentas sin verificar. | DEC-01 | M |
| SEC-08 | P1 | Agregar headers de seguridad. | CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`. | Dominio | M |
| SEC-09 | P1 | Validar JWT, método, content-type y rate limit en Edge Functions. | Llamadas anónimas o con JWT inválido devuelven 401/403; no hay funciones abiertas. | SEC-04 | M |
| SEC-10 | P0 | Revisar higiene de secretos. | `service_role` no está en el bundle; claves separadas por entorno; rotación documentada. | Repo | S |
| SEC-11 | P1 | Validar uploads: MIME real, tamaño, extensión, nombre aleatorio. | Archivos maliciosos o sobredimensionados se rechazan. | SEC-01 | M |
| SEC-12 | P1 | Implementar exportación y eliminación de cuenta/datos. | El usuario puede solicitar exportación y borrado; se eliminan DB, storage y Stripe según política. | DEC-15 | L |
| SEC-13 | P1 | Agregar audit log de acciones admin. | Queda registro de cambios de contenido, precio, roles y publicación. | SEC-04 | M |
| SEC-14 | P1 | Prevenir abuso de trial. | Un mismo cliente/email/tarjeta no puede crear trials ilimitados; se marca y alerta. | DEC-04 | M |
| SEC-15 | P2 | Análisis de dependencias y vulnerabilidades. | `npm audit`/Snyk sin vulnerabilidades críticas; proceso de actualización. | Repo | S |
| SEC-16 | P1 | Checklist de seguridad pre-lanzamiento. | Pruebas de IDOR, RLS, upload, rate limit, headers y exposición de secretos firmadas. | Todas | M |

**Nota crítica:** el bucket público es aceptable solo con demos. La condición para subir contenido real es SEC-01, SEC-02 y SEC-05 cerrados.

---

### 4.2 Base de datos y modelo de datos

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| DB-01 | P1 | Consolidar `landing_config`. | Una sola fuente de verdad para precio, WhatsApp, hero y secciones; sin claves duplicadas (`membership_params`, `monthly_price`, `hero_texts`). | DEC-06 | M |
| DB-02 | P1 | Agregar constraints e integridad. | `monthly_price > 0`, WhatsApp E.164, enums de categoría/target, fechas válidas. | DB-01 | M |
| DB-03 | P1 | Estandarizar `created_at`, `updated_at`, `created_by`, `updated_by`. | Triggers y columnas presentes en tablas editables. | Repo | S |
| DB-04 | P1 | Normalizar taxonomía de contenido. | Categorías, tipos de clase, target y ciclos consistentes; sin texto libre duplicado. | DEC-05 | M |
| DB-05 | P0 | Agregar nivel de acceso al contenido. | `access_level`: público, trial, miembro; aplicado en DB y UI. | DEC-05 | M |
| DB-06 | P1 | Completar campos de suscripción en `profiles`. | `trial_start`, `trial_end`, `current_period_end`, `cancel_at_period_end`, `stripe_status`, `deleted_at`. | PAY-05 | M |
| DB-07 | P1 | Idempotencia de webhooks y sincronización Stripe. | Reintentos no duplican estados ni pagos; `stripe_event_id` único. | PAY-04 | M |
| DB-08 | P1 | Backups y PITR. | Backup automático y restauración probada en staging. | Infra | M |
| DB-09 | P1 | Migraciones versionadas en repo. | `supabase/migrations` reproducible; CI aplica migraciones. | Repo | M |
| DB-10 | P0 | Limpiar datos demo y placeholders. | Sin `example.com`, “Prueba de Video”, “Rutina VIP Ejemplo” ni IDs duplicados en producción. | CMS-01 | S |
| DB-11 | P2 | Índices y queries. | Búsquedas por categoría, mes, published y email con índices; sin full scans evidentes. | DB-04 | S |
| DB-12 | P1 | Suite de pruebas RLS. | Tests automatizados por rol y tabla; fallan si una policy se rompe. | SEC-03 | M |

---

### 4.3 Storage y medios

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| MED-01 | P0 | Separar assets públicos de contenido privado. | Landing y demos en bucket público; clases, rutinas y PDFs en bucket privado. | SEC-02 | M |
| MED-02 | P0 | Política de storage privado. | Sin listado público; sin descarga anónima; signed URL con expiración. | SEC-01 | M |
| MED-03 | P0 | Pipeline de video. | Subida, transcodificación, HLS, thumbnails, duración y estado de procesamiento. | DEC-12 | L |
| MED-04 | P1 | Optimización de imágenes. | WebP/AVIF, `srcset`, dimensiones, compresión y lazy loading. | PERF-04 | M |
| MED-05 | P1 | Optimización del hero. | Poster, `preload` adecuado, fallback mobile y `prefers-reduced-motion`. | PERF-09 | M |
| MED-06 | P1 | Cache y CDN. | Assets hasheados inmutables; imágenes con cache largo; configuración con TTL corto. | DEP-07 | S |
| MED-07 | P1 | Ciclo de vida de archivos. | Nombres únicos, borrado de huérfanos, deduplicación y límite de tamaño. | MED-03 | M |
| MED-08 | P1 | PDFs y guías privadas. | Descarga solo con sesión y autorización; URL firmada; sin enlaces públicos. | SEC-05 | M |
| MED-09 | P2 | Range requests y seeking. | El player permite seek y funciona en iOS/Android. | MED-03 | S |
| MED-10 | P2 | Marca de agua/disuasión. | Opcional; no sustituye el control de acceso. | MED-03 | M |
| MED-11 | P2 | Convención de nombres. | `{tipo}/{ciclo}/{slug}-{hash}.{ext}` documentado. | MED-07 | S |
| MED-12 | P1 | Limpieza de demos del bucket privado. | Sin archivos `WhatsApp Video...`, `demo-*` ni pruebas en `members-media` de producción. | CMS-01 | S |

---

### 4.4 Autenticación y cuentas

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| AUTH-01 | P1 | Verificación de email. | El usuario debe verificar antes de acceder a contenido de pago. | Email | M |
| AUTH-02 | P1 | Redirects de recuperación en dominio final. | El enlace de reset funciona en producción y no en localhost. | DEC-09 | S |
| AUTH-03 | P1 | Manejo de sesión. | Refresh, expiración, logout y cierre en todos los dispositivos. | Supabase | M |
| AUTH-04 | P1 | Trigger/backfill de `profiles`. | Todo usuario tiene perfil; usuarios existentes sin perfil se reparan. | DB-06 | M |
| AUTH-05 | P1 | Gestión de roles. | Admin no puede degradarse a sí mismo; siempre queda al menos un admin. | SEC-04 | S |
| AUTH-06 | P1 | Eliminación/exportación de cuenta. | Flujo completo con confirmación y borrado seguro. | SEC-12 | M |
| AUTH-07 | P1 | Prevención de trials duplicados. | Se reutiliza `stripe_customer_id`; se bloquea o marca trial repetido. | DEC-04 | M |
| AUTH-08 | P2 | MFA para admin. | Admin puede activar segundo factor. | SEC-04 | M |
| AUTH-09 | P2 | Mensajes de error seguros. | No se revela si un email existe. | AUTH-01 | S |
| AUTH-10 | P1 | Allowlist de redirects. | Solo dominios permitidos en emails y OAuth. | DEC-09 | S |

---

### 4.5 Pagos, suscripciones y trial

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| PAY-01 | P0 | Documentar la política del trial. | Tarjeta sí/no, duración, día 8, gracia, cancelación, reembolso y abuso. | DEC-01 a DEC-07 | S |
| PAY-02 | P0 | Configurar productos y precios live. | Producto, precio, moneda, impuestos y modo live coinciden con test. | DEC-06 | M |
| PAY-03 | P0 | Ajustar Checkout. | `mode=subscription`, trial de 7 días, método de pago, `client_reference_id`, metadata de usuario. | PAY-01 | M |
| PAY-04 | P0 | Webhook robusto. | Firma verificada, idempotencia, orden de eventos, reintentos y logs. | PAY-02 | L |
| PAY-05 | P0 | Mapear estados de Stripe a la app. | `trialing`, `active`, `past_due`, `unpaid`, `canceled`, `incomplete` con acceso definido. | PAY-04 | M |
| PAY-06 | P0 | Fin del trial. | `trial_end_date`, recordatorio, cobro automático y acceso correcto después. | PAY-04 | M |
| PAY-07 | P1 | Customer Portal. | Cancelar, actualizar tarjeta, ver facturas y volver a la app. | PAY-02 | S |
| PAY-08 | P1 | Facturas e impuestos. | Stripe Tax, datos fiscales, factura/receipt y moneda. | DEC-06 | M |
| PAY-09 | P1 | 3D Secure y fallos de pago. | SCA, tarjeta rechazada, reintentos y mensajes claros. | PAY-04 | M |
| PAY-10 | P1 | Reembolsos y chargebacks. | Runbook y proceso documentado; estado de acceso actualizado. | PAY-07 | S |
| PAY-11 | P0 | Matriz de pruebas de pago. | Trial, éxito, fallo, cancelación, reactivación, portal, webhook replay. | PAY-04 | M |
| PAY-12 | P1 | Reconciliación Stripe ↔ app. | Job o script detecta y corrige desincronizaciones. | PAY-05 | M |
| PAY-13 | P0 | Limpiar test clocks y datos de prueba. | Sin suscripciones/test data en live. | PAY-02 | S |
| PAY-14 | P1 | Copy legal de renovación. | Precio, periodicidad, cancelación y reembolso visibles antes del checkout. | LEG-02 | S |
| PAY-15 | P1 | Impuestos y moneda. | IVA/VAT definido; precio con/sin impuestos coherente. | DEC-06 | M |
| PAY-16 | P1 | Recibos y emails de pago. | El usuario recibe confirmación y factura. | EMAIL-02 | S |

**Eventos mínimos a manejar:** `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `invoice.finalized`, `trial_will_end`, `customer.updated`.

---

### 4.6 Contenido y CMS

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| CMS-01 | P0 | Cargar contenido real. | Clases, rutinas, nutrición y PDFs completos, sin placeholders. | DEC-05, SEC-05 | XL |
| CMS-02 | P1 | Definir taxonomía. | Categoría, tipo, target, nivel, duración, equipo y ciclo. | DB-04 | M |
| CMS-03 | P0 | Eliminar demos y `example.com`. | Producción sin datos de prueba visibles. | DB-10 | S |
| CMS-04 | P1 | Thumbnails y alt text. | Cada contenido tiene portada, alt y aspect ratio consistente. | MED-04 | M |
| CMS-05 | P1 | Metadatos de contenido. | Título, descripción, duración, nivel y equipo completos. | CMS-02 | M |
| CMS-06 | P1 | Flujo borrador/publicado/programado. | Admin puede previsualizar, publicar y despublicar. | DB-05 | M |
| CMS-07 | P1 | Contenido de landing. | Hero, secciones, FAQ, testimonios, precios y CTA sin placeholders. | LAND-01 | M |
| CMS-08 | P1 | Media manager. | Buscar, paginar, borrar, reemplazar y copiar referencia privada, no URL pública. | SEC-06 | M |
| CMS-09 | P1 | Validación del admin. | Campos requeridos, errores claros, advertencia de cambios sin guardar. | CMS-06 | M |
| CMS-10 | P0 | Niveles de acceso. | Público, trial y miembro aplicados en DB, API y UI. | DB-05 | M |
| CMS-11 | P2 | Versionado/rollback de landing. | Se puede volver a una versión anterior. | DB-01 | M |
| CMS-12 | P1 | QA de reproducción. | iOS, Android, desktop, HLS, seek, fullscreen y subtítulos. | MED-03 | M |
| CMS-13 | P1 | PDFs y descargas. | Guías privadas, signed URL y nombre de archivo correcto. | MED-08 | S |
| CMS-14 | P2 | Programación de contenido. | Publicación automática por fecha/ciclo. | CMS-06 | M |

---

### 4.7 Landing y marketing

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| LAND-01 | P0 | Unificar teléfono/WhatsApp. | Un solo número E.164 en landing, footer, JSON-LD y soporte. | DEC-08 | S |
| LAND-02 | P1 | Revisar claims y precios. | Sin afirmaciones no verificables; precio y trial coherentes. | LEG-02 | S |
| LAND-03 | P1 | Testimonios reales. | Consentimiento, nombre/foto y resultados no garantizados. | LEG-08 | M |
| LAND-04 | P1 | FAQ completa. | Trial, cancelación, reembolso, acceso, equipo y soporte. | PAY-01 | S |
| LAND-05 | P1 | CTAs consistentes. | Una acción primaria por sección; eventos de tracking. | ANA-02 | S |
| LAND-06 | P1 | Cookie banner. | Categorías, rechazo fácil, persistencia, consent mode y enlace a política. | LEG-04 | M |
| LAND-07 | P2 | Links sociales y `sameAs`. | Instagram/WhatsApp oficiales en footer y JSON-LD. | DEC-08 | S |
| LAND-08 | P1 | Revisión de copy. | Español consistente, acentos, “tú/usted”, sin typos. | — | S |
| LAND-09 | P1 | Brand assets. | Logo, favicon, OG image y colores consistentes. | SEO-04 | S |
| LAND-10 | P1 | Videos del landing. | Públicos, optimizados, con poster, captions y sin autoplay pesado. | MED-05 | M |
| LAND-11 | P1 | Estados de carga/error/vacío. | Sin pantallas en blanco ni “Cargando…” indefinido. | UX-03 | M |
| LAND-12 | P2 | Captura de leads. | Solo si se define; consentimiento y CRM. | LEG-03 | M |

---

### 4.8 SEO, dominio y metadatos

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| SEO-01 | P0 | Dominio propio. | DNS, SSL, redirects desde `vercel.app` y dominio canónico. | DEC-09 | M |
| SEO-02 | P0 | Actualizar canonical, OG, Twitter, sitemap y robots al dominio final. | Sin URLs `vercel.app` en metadatos. | SEO-01 | S |
| SEO-03 | P1 | Corregir JSON-LD. | Logo válido, `sameAs`, `offers`, `FAQPage` y datos coherentes. | LAND-01 | M |
| SEO-04 | P1 | Favicon y manifest. | `.ico`, PNG, apple-touch y manifest válidos. | LAND-09 | S |
| SEO-05 | P1 | Metadatos por ruta. | Título, descripción, canonical y OG para `/` y `/membresia` como mínimo. | SEO-01 | M |
| SEO-06 | P1 | Sitemap limpio. | Sin login, registro, recuperación ni rutas privadas. | SEO-07 | S |
| SEO-07 | P1 | `robots.txt`. | Disallow de admin, dashboard, videos, perfil y auth. | SEO-01 | S |
| SEO-08 | P1 | Structured data. | `Organization`, `Product`/`Offer`, `FAQPage` y `Person` de la coach. | SEO-03 | M |
| SEO-09 | P1 | OG images. | Dimensiones, alt, URL absoluta y fallback. | LAND-09 | S |
| SEO-10 | P1 | Search Console/Bing. | Verificación y sitemap enviado. | SEO-01 | S |
| SEO-11 | P1 | 404 y fallback SPA. | Página 404 útil; rutas desconocidas no indexables. | SEO-01 | S |
| SEO-12 | P2 | Prerender/SSG para LCP y metadatos. | HTML inicial con contenido crítico y meta por ruta. | SEO-05 | L |
| SEO-13 | P2 | Hreflang. | Solo si se agregan otros idiomas. | — | S |

---

### 4.9 Analítica, observabilidad y consentimiento

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| ANA-01 | P1 | Elegir proveedor. | GA4, Plausible, PostHog o Vercel Analytics con decisión documentada. | DEC-11 | S |
| ANA-02 | P1 | Definir eventos. | `signup_start`, `signup_complete`, `checkout_start`, `trial_start`, `subscription_active`, `payment_failed`, `cancel`, `video_play`, `video_complete`, `pdf_download`. | ANA-01 | M |
| ANA-03 | P1 | UTM y atribución. | Parámetros capturados y persistidos hasta el checkout. | ANA-02 | M |
| ANA-04 | P1 | Conversiones server-side. | Stripe webhook envía eventos de conversión. | PAY-04 | M |
| ANA-05 | P2 | Pixels de ads. | Meta/TikTok solo con consentimiento. | LEG-04 | M |
| ANA-06 | P1 | Dashboards. | Funnel registro → trial → pago, churn y engagement. | ANA-02 | M |
| ANA-07 | P1 | Error monitoring. | Sentry o equivalente con source maps y alertas. | DEP-02 | M |
| ANA-08 | P1 | Uptime y alertas. | Monitor de landing, login, checkout y webhook. | DEP-05 | S |
| ANA-09 | P1 | Privacidad. | IP anonimizada, retención y DPAs. | LEG-10 | S |
| ANA-10 | P1 | Consent Mode. | Sin cookies de analítica/marketing antes del consentimiento. | LAND-06 | M |
| ANA-11 | P2 | Logs y retención. | Logs estructurados con retención definida. | ANA-07 | S |
| ANA-12 | P1 | Funnel de negocio. | Reporte semanal de trial→paid y cancelaciones. | ANA-06 | S |

---

### 4.10 Performance y Core Web Vitals

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| PERF-01 | P1 | Baseline móvil. | Lighthouse/PageSpeed en móvil, 4G, desde el país objetivo. | — | S |
| PERF-02 | P1 | TTFB. | Objetivo < 800 ms; CDN/edge y cache configurados. | DEP-07 | M |
| PERF-03 | P1 | Bundle JS. | Analizar 563 KB decodificados; split, lazy y eliminar código muerto. | Repo | M |
| PERF-04 | P1 | Imágenes. | JPG 1.3 MB → WebP/AVIF, responsive y < 200 KB por imagen. | MED-04 | M |
| PERF-05 | P1 | Videos. | Sin autoplay masivo; poster, metadata, lazy y HLS. | MED-05 | M |
| PERF-06 | P1 | Fuentes. | Self-host o `display=swap`, preload y subset. | — | S |
| PERF-07 | P1 | Cache. | Assets hasheados inmutables; HTML no-cache; config TTL corto. | DEP-07 | S |
| PERF-08 | P1 | Preconnect. | Supabase, Bunny y Stripe con `preconnect`/`dns-prefetch`. | — | S |
| PERF-09 | P1 | LCP. | Identificar y optimizar el elemento LCP. | PERF-01 | M |
| PERF-10 | P1 | CLS. | Dimensiones, font metrics y skeletons. | PERF-04 | S |
| PERF-11 | P1 | INP. | Reducir JS de interacción y diferir no crítico. | PERF-03 | M |
| PERF-12 | P2 | Lighthouse CI. | Presupuesto de performance en CI. | DEP-02 | M |
| PERF-13 | P1 | Android low-end. | Prueba en dispositivo real o throttling 4x CPU. | PERF-01 | S |

---

### 4.11 Accesibilidad

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| A11Y-01 | P1 | Contraste del marquee. | Texto decorativo con contraste suficiente o `aria-hidden` si es solo adorno. | — | S |
| A11Y-02 | P1 | Focus visible. | Todos los interactivos muestran foco; sin `outline-none` sin reemplazo. | — | M |
| A11Y-03 | P1 | Navegación por teclado. | Menús, modales, player y formularios operables con teclado. | A11Y-02 | M |
| A11Y-04 | P1 | Focus trap en modales. | El foco no escapa; Escape cierra; retorno al trigger. | A11Y-03 | S |
| A11Y-05 | P1 | Labels y errores. | `label`, `aria-describedby`, `aria-invalid` y resumen de errores. | UX-06 | M |
| A11Y-06 | P1 | Alt text. | Imágenes informativas con alt; decorativas con `alt=""`. | CMS-04 | S |
| A11Y-07 | P1 | Jerarquía de headings. | Un `h1` por página y orden lógico. | — | S |
| A11Y-08 | P1 | Landmarks y skip link. | `header`, `nav`, `main`, `footer` y “saltar al contenido”. | — | S |
| A11Y-09 | P1 | ARIA en acordeones/tabs. | `aria-expanded`, `aria-controls`, roles correctos. | — | S |
| A11Y-10 | P1 | Reduced motion. | Videos/animaciones respetan `prefers-reduced-motion`. | MED-05 | S |
| A11Y-11 | P1 | Subtítulos. | Videos con captions/subtítulos y transcripción cuando aplique. | CMS-12 | L |
| A11Y-12 | P1 | Touch targets. | Mínimo 44×44 px en móvil. | UX-01 | S |
| A11Y-13 | P1 | Screen reader. | Prueba NVDA/VoiceOver en flujos críticos. | A11Y-03 | M |
| A11Y-14 | P1 | Autocomplete. | `name`, `email`, `current-password`, `new-password`. | AUTH-01 | S |
| A11Y-15 | P1 | Color no único indicador. | Estados con texto/icono además de color. | — | S |
| A11Y-16 | P2 | Idioma. | `lang="es"` y cambios de idioma si existen. | — | S |
| A11Y-17 | P1 | Zoom/reflow. | 200% zoom y 320 px sin pérdida de contenido. | UX-01 | S |

---

### 4.12 UX y responsive

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| UX-01 | P1 | Matriz responsive. | 360, 390, 414, 768, 1024, 1280 y 1440 sin scroll horizontal. | — | M |
| UX-02 | P1 | Navegación móvil. | Menú claro, CTA accesible y safe areas. | UX-01 | S |
| UX-03 | P1 | Loading states. | Skeletons o spinners con contexto; sin pantalla en blanco. | — | M |
| UX-04 | P1 | Error states. | Mensaje, causa y reintento. | — | M |
| UX-05 | P1 | Empty states. | “No hay contenido” con acción siguiente. | — | S |
| UX-06 | P1 | Validación de formularios. | Inline, preserva datos y enfoca el primer error. | A11Y-05 | M |
| UX-07 | P1 | Handoff a Stripe. | Explica redirección, trial y cancelación antes de salir. | PAY-03 | S |
| UX-08 | P1 | Success/cancel. | Página de retorno con siguiente paso claro. | PAY-03 | S |
| UX-09 | P1 | Claridad del dashboard. | Días de trial, próximo cobro y “gestionar suscripción”. | PAY-05 | M |
| UX-10 | P1 | Player. | Play, pausa, seek, fullscreen, calidad, velocidad y captions. | MED-03 | M |
| UX-11 | P2 | Búsqueda/filtros. | Estado en URL, limpiar filtros y rendimiento. | CMS-02 | M |
| UX-12 | P1 | Admin UX. | Búsqueda, paginación, confirmación de borrado y cambios sin guardar. | CMS-09 | M |
| UX-13 | P1 | Consistencia de copy. | “Membresía”, “prueba gratis”, “trial” y “cancelar” siempre igual. | LAND-08 | S |
| UX-14 | P1 | Cross-browser. | Safari iOS, Chrome Android, Firefox y Edge. | QA-07 | M |
| UX-15 | P2 | Offline/errores de red. | Mensaje claro y reintento. | UX-04 | S |
| UX-16 | P1 | Consentimiento UX. | Aceptar y rechazar con la misma jerarquía visual. | LAND-06 | S |

---

### 4.13 Legal y compliance

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| LEG-01 | P0 | Definir jurisdicción y entidad. | País, razón social, domicilio y ley aplicable. | DEC-08 | S |
| LEG-02 | P0 | Revisar términos. | Servicio, precio, trial, renovación, cancelación, reembolso, acceso, IP y terminación. | LEG-01 | L |
| LEG-03 | P0 | Revisar privacidad. | Datos, finalidad, base legal, proveedores, retención y derechos. | LEG-01 | L |
| LEG-04 | P0 | Revisar cookies. | Categorías, consentimiento, retiro y listado. | LEG-03 | M |
| LEG-05 | P1 | Consumer law. | Retracto, renovación automática, cambios de precio y cancelación fácil. | LEG-02 | M |
| LEG-06 | P1 | Impuestos. | IVA/VAT, facturación y datos fiscales. | DEC-06 | M |
| LEG-07 | P1 | Disclaimer de salud. | No es consejo médico; consultar profesional; riesgo de lesión. | LEG-02 | S |
| LEG-08 | P1 | Testimonios e imágenes. | Consentimiento escrito y derecho de imagen. | LAND-03 | S |
| LEG-09 | P1 | Derechos de autor. | Música, videos y recursos con licencia. | CMS-01 | M |
| LEG-10 | P1 | DPAs. | Acuerdos con Supabase, Stripe, Bunny, Vercel y email. | LEG-03 | M |
| LEG-11 | P2 | Edad mínima. | 18+ o consentimiento parental. | LEG-02 | S |
| LEG-12 | P1 | Datos de contacto. | Email, entidad y dirección visibles. | LEG-01 | S |
| LEG-13 | P1 | Unificar país/teléfono. | Sin contradicción Argentina/Bolivia. | LAND-01 | S |
| LEG-14 | P1 | Política de reembolso. | Coherente con Stripe y con la ley. | PAY-10 | S |
| LEG-15 | P2 | Declaración de accesibilidad. | Compromiso y canal de contacto. | A11Y-13 | S |
| LEG-16 | P1 | Consentimiento de email. | Opt-in y baja en marketing. | EMAIL-02 | S |

---

### 4.14 Emails y notificaciones

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| EMAIL-01 | P1 | Elegir proveedor. | Resend, SendGrid, Postmark o Brevo con decisión documentada. | DEC-10 | S |
| EMAIL-02 | P1 | Templates transaccionales. | Bienvenida, verificación, reset, trial, pago, fallo, cancelación. | EMAIL-01 | L |
| EMAIL-03 | P1 | Trial ending. | Aviso 3 días antes y el día anterior. | PAY-06 | M |
| EMAIL-04 | P1 | Pago fallido. | Aviso con enlace al portal y plazo. | PAY-09 | M |
| EMAIL-05 | P1 | Cancelación. | Confirmación y fecha de fin de acceso. | PAY-07 | S |
| EMAIL-06 | P1 | Deliverability. | SPF, DKIM, DMARC y dominio verificado. | DEP-08 | M |
| EMAIL-07 | P2 | Secuencias de marketing. | Solo con consentimiento y baja. | LEG-16 | M |
| EMAIL-08 | P1 | Pruebas. | Inbox, spam, mobile y links. | EMAIL-02 | S |

---

### 4.15 QA y testing

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| QA-01 | P1 | Plan de pruebas. | Unit, integración, E2E y UAT documentados. | — | M |
| QA-02 | P1 | Auth. | Registro, verificación, login, logout, reset y sesión expirada. | AUTH-01 | M |
| QA-03 | P1 | Pagos. | Trial, éxito, fallo, cancelación, reactivación, portal y webhook replay. | PAY-11 | L |
| QA-04 | P1 | Acceso. | Anon, trial, active, past_due, canceled, expired y admin. | SEC-03 | M |
| QA-05 | P1 | Contenido. | CRUD, publicar, landing, playback y PDFs. | CMS-01 | M |
| QA-06 | P1 | Responsive. | Matriz de dispositivos. | UX-01 | M |
| QA-07 | P1 | Browsers. | Safari iOS, Chrome Android, Firefox y Edge. | UX-14 | M |
| QA-08 | P1 | Performance. | Lighthouse/PageSpeed y presupuesto. | PERF-01 | S |
| QA-09 | P1 | Accesibilidad. | axe + manual + screen reader. | A11Y-13 | M |
| QA-10 | P1 | Seguridad. | RLS, IDOR, upload, rate limit y headers. | SEC-16 | M |
| QA-11 | P1 | Regresión en CI. | Suite automática en cada PR. | DEP-02 | M |
| QA-12 | P1 | UAT con cliente. | Sign-off escrito por flujo. | QA-01 | M |
| QA-13 | P1 | Limpieza de datos. | Sin test users, test clocks ni contenido demo. | DB-10 | S |
| QA-14 | P1 | Criterios de release. | Checklist Go/No-Go completo. | Todas | S |
| QA-15 | P2 | Bug budget. | Priorización y límite de bugs conocidos. | QA-12 | S |

---

### 4.16 DevOps, despliegue y operación

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| DEP-01 | P1 | Ambientes. | Local, staging y producción con claves separadas. | — | M |
| DEP-02 | P1 | CI/CD. | Lint, typecheck, tests, build y preview deploys. | Repo | M |
| DEP-03 | P1 | Migraciones en CI. | Sin cambios manuales de schema. | DB-09 | M |
| DEP-04 | P1 | Backups. | PITR, storage y restore drill. | DB-08 | M |
| DEP-05 | P1 | Monitoreo. | Uptime, errores, logs y alertas. | ANA-07 | M |
| DEP-06 | P1 | Runbook. | Deploy, rollback, incidente, webhook replay y restore. | DEP-04 | M |
| DEP-07 | P1 | Dominio/DNS/SSL. | HSTS y redirects. | SEO-01 | S |
| DEP-08 | P1 | Email DNS. | SPF, DKIM y DMARC. | EMAIL-06 | S |
| DEP-09 | P1 | Secretos. | Gestión, rotación y accesos. | SEC-10 | S |
| DEP-10 | P2 | Límites y cuotas. | Supabase, Bunny, Stripe y Vercel monitoreados. | — | S |
| DEP-11 | P2 | Costos de infraestructura. | Alertas de consumo, sin precios comerciales. | DEP-10 | S |
| DEP-12 | P2 | Status page. | Comunicación de incidentes. | DEP-05 | S |
| DEP-13 | P1 | Versionado de consentimiento. | Cambios de política registrados. | LEG-04 | S |
| DEP-14 | P2 | Ventana de mantenimiento. | Proceso y comunicación. | DEP-06 | S |
| DEP-15 | P1 | Rollback. | deploy anterior restaurable en minutos. | DEP-02 | S |
| DEP-16 | P2 | Preview environments. | PR con Supabase/Stripe test. | DEP-01 | M |

---

### 4.17 Documentación y handover

| ID | P | Tarea | Criterio de aceptación | Depende de | Complejidad |
|---|---|---|---|---|---|
| DOC-01 | P1 | Diagrama de arquitectura. | Frontend, Supabase, Stripe, Bunny, Vercel y flujos. | — | S |
| DOC-02 | P1 | Variables de entorno. | Nombres, propósito y entorno; sin valores. | DEP-09 | S |
| DOC-03 | P1 | Schema y RLS. | ERD y matriz de políticas. | SEC-03 | M |
| DOC-04 | P1 | Configuración Stripe. | Productos, precios, webhooks y portal. | PAY-02 | S |
| DOC-05 | P1 | Configuración Bunny. | Librería, tokens, dominios y player. | MED-03 | S |
| DOC-06 | P1 | Guía de admin. | Cómo cargar, publicar y borrar contenido. | CMS-06 | M |
| DOC-07 | P1 | Flujo de contenido. | Quién sube, revisa, publica y corrige. | CMS-06 | S |
| DOC-08 | P1 | Runbook de incidentes. | Pagos, video, auth y storage. | DEP-06 | M |
| DOC-09 | P1 | Handover de accesos. | Entrega segura de credenciales. | DEP-09 | S |
| DOC-10 | P2 | Changelog. | Releases y cambios relevantes. | DEP-02 | S |
| DOC-11 | P1 | Limitaciones conocidas. | Backlog post-lanzamiento. | — | S |
| DOC-12 | P2 | Capacitación. | Sesión grabada y material. | DOC-06 | S |

---

## 5. Plan por fases

| Fase | Objetivo | Incluye | Gate de salida |
|---|---|---|---|
| **Fase 0 — Decisiones** | Cerrar reglas de negocio. | DEC-01 a DEC-08, DEC-12, DEC-14. | Documento de decisiones firmado. |
| **Fase 1 — Seguridad y medios** | Aislar contenido privado. | SEC-01 a SEC-06, SEC-10, MED-01/02/12, DB-12. | Bucket privado probado; anon no accede; admin no publica URLs. |
| **Fase 2 — Trial y pagos** | Ciclo de suscripción completo. | PAY-01 a PAY-07, PAY-11, PAY-13, DB-06/07, AUTH-07. | Trial, pago, fallo, cancelación y portal probados en test. |
| **Fase 3 — Contenido real** | Cargar y validar biblioteca. | CMS-01 a CMS-05, CMS-10/12/13, MED-03/08. | Contenido real sin placeholders; playback OK. |
| **Fase 4 — Emails y analítica** | Operación y medición. | EMAIL-01 a EMAIL-08, ANA-01 a ANA-10, LAND-06. | Emails entregados; eventos y consentimiento funcionando. |
| **Fase 5 — Dominio y SEO** | Marca y descubrimiento. | SEO-01 a SEO-11, LAND-01/09, PERF-06/08. | Dominio propio, metadatos y sitemap correctos. |
| **Fase 6 — Performance y accesibilidad** | Calidad percibida. | PERF-01 a PERF-13, A11Y-01 a A11Y-17, UX-01 a UX-16. | Presupuesto de performance y auditoría accesible. |
| **Fase 7 — QA y legal** | Lanzamiento seguro. | QA-01 a QA-14, LEG-01 a LEG-16, SEC-16. | UAT y legal firmados. |
| **Fase 8 — Operación y handover** | Sostenibilidad. | DEP-01 a DEP-16, DOC-01 a DOC-12. | Runbook, backups, monitoreo y handover. |

**Regla de secuencia:** no se sube contenido real antes de Fase 1. No se activa Stripe live antes de Fase 2. No se abre tráfico pago antes de Fase 4 y Fase 7.

---

## 6. Checklist de lanzamiento (Go/No-Go)

### Seguridad

- [ ] `members-media` es privado.
- [ ] No se puede listar ni descargar contenido sin autorización.
- [ ] RLS probado por rol.
- [ ] Admin autorizado en servidor, no solo en cliente.
- [ ] Sin `service_role` en bundle.
- [ ] Uploads validados.
- [ ] Headers de seguridad activos.
- [ ] Rate limit/CAPTCHA en auth.
- [ ] Trial abuse mitigado.

### Pagos

- [ ] Producto/precio live correcto.
- [ ] Trial de 7 días configurado.
- [ ] Checkout exige tarjeta según decisión.
- [ ] Webhook con firma e idempotencia.
- [ ] Estados `trialing/active/past_due/canceled` correctos.
- [ ] Portal de cancelación funciona.
- [ ] Pago exitoso, fallido, 3DS y reintento probados.
- [ ] Factura/receipt.
- [ ] Sin test clocks ni datos de prueba.

### Contenido

- [ ] Sin `example.com`.
- [ ] Sin “Prueba de Video” ni “Rutina VIP Ejemplo”.
- [ ] Sin IDs duplicados.
- [ ] Clases, rutinas y PDFs reales.
- [ ] Thumbnails y alt text.
- [ ] Playback iOS/Android/desktop.
- [ ] PDFs privados.
- [ ] Contenido público/trial/miembro separado.

### Emails

- [ ] Bienvenida.
- [ ] Verificación.
- [ ] Reset.
- [ ] Trial ending.
- [ ] Pago exitoso/fallido.
- [ ] Cancelación.
- [ ] SPF/DKIM/DMARC.
- [ ] Links al dominio final.

### Analítica

- [ ] Consentimiento.
- [ ] Eventos de funnel.
- [ ] Conversión server-side.
- [ ] Error monitoring.
- [ ] Uptime.
- [ ] Alertas de pago/webhook.

### SEO y dominio

- [ ] Dominio propio.
- [ ] Canonical/OG/Twitter al dominio final.
- [ ] JSON-LD válido.
- [ ] Favicon.
- [ ] Sitemap sin rutas privadas.
- [ ] Robots correcto.
- [ ] Search Console.
- [ ] Metadatos por ruta.

### Calidad

- [ ] Responsive 360–1440.
- [ ] Safari iOS, Chrome Android, Firefox, Edge.
- [ ] Lighthouse accesibilidad ≥ 95.
- [ ] Sin fallos críticos de contraste/foco/teclado.
- [ ] Performance móvil aceptable.
- [ ] Sin errores de consola.
- [ ] Sin links rotos.
- [ ] UAT firmado.

### Legal

- [ ] Términos revisados.
- [ ] Privacidad revisada.
- [ ] Cookies y consentimiento.
- [ ] Renovación automática y cancelación.
- [ ] Reembolsos.
- [ ] Disclaimer de salud.
- [ ] Entidad y contacto.
- [ ] País/teléfono unificados.
- [ ] DPAs.

### Operación

- [ ] Backups y restore probados.
- [ ] Monitoreo y alertas.
- [ ] Runbook.
- [ ] Rollback.
- [ ] Handover.
- [ ] Documentación.

---

## 7. Matriz de pruebas

### 7.1 Roles

| Rol | Acceso esperado |
|---|---|
| Anónimo | Landing, legal, login, registro. Sin contenido privado. |
| Registrado sin plan | Membresía, checkout. Sin biblioteca completa. |
| Trial | Contenido de trial y miembro según decisión. |
| Activo | Todo el contenido de miembro. |
| `past_due` | Acceso según política de gracia. |
| Cancelado | Acceso hasta fin de período. |
| Expirado | Sin contenido; puede reactivar. |
| Admin | CMS, miembros, configuración. Sin acceso a datos de pago sensibles innecesarios. |

### 7.2 Flujos críticos

1. Registro → verificación → trial → contenido.
2. Trial → cobro → activo → contenido.
3. Trial → cancelación → expiración → bloqueo.
4. Pago fallido → `past_due` → reintento → activo.
5. Checkout duplicado → no duplica suscripción.
6. Webhook replay → estado consistente.
7. Admin publica contenido → miembro lo ve; anónimo no.
8. Admin despublica → miembro deja de verlo.
9. Eliminación de cuenta → datos y accesos eliminados.
10. Reset de contraseña en dominio final.

### 7.3 Dispositivos

- iPhone Safari (iOS actual y anterior).
- Android Chrome (gama media y baja).
- Desktop Chrome, Firefox, Edge.
- Tablet 768.
- 360 px y 320 px.

### 7.4 Pagos

- Tarjeta exitosa.
- Tarjeta rechazada.
- 3D Secure.
- Trial con cancelación inmediata.
- Trial con cancelación al día 6.
- Pago fallido y reintento.
- Reactivación.
- Portal: actualizar tarjeta, cancelar, ver factura.
- Webhook duplicado y fuera de orden.

### 7.5 RLS/seguridad

- Anon lee `landing_config` (si es público).
- Anon no lee `profiles`.
- Anon no escribe ninguna tabla.
- Usuario lee/edita solo su perfil.
- Usuario no lee contenido no publicado.
- Trial no lee contenido solo de pago.
- Admin lee/escribe según política.
- Storage: anon no lista ni descarga privados.
- Storage: signed URL expira.
- Edge Function: sin JWT → 401.

### 7.6 Webhooks

- Firma inválida → 400.
- Evento duplicado → no duplica estado.
- Evento fuera de orden → estado final correcto.
- Fallo temporal → reintento.
- Logs con `event_id` y resultado.

---

## 8. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Contenido real en bucket público | Piratería y pérdida de negocio | SEC-01, SEC-02, SEC-05 antes de subir contenido. |
| Trial mal configurado | Cobros indebidos o acceso gratis | PAY-01, PAY-03, PAY-11, pruebas con test clocks. |
| Webhook caído | Acceso desincronizado | Idempotencia, reintentos, monitoreo, reconciliación. |
| RLS mal configurada | Fuga de datos o contenido | Matriz RLS, tests por rol, revisión de policies. |
| Admin solo en cliente | Escalada de privilegios | SEC-04, RLS y Edge Functions. |
| Contenido demo en producción | Mala percepción y confusión | CMS-01, CMS-03, QA-13. |
| Legal incompleto | Reclamos y sanciones | LEG-01 a LEG-16 antes del lanzamiento. |
| Performance móvil | Abandono y baja conversión | PERF-01 a PERF-13, presupuesto en CI. |
| Dependencia de un solo proveedor | Caída o cambio de costos | Documentar Bunny/Supabase/Stripe y plan de migración. |
| Pérdida de datos | Pérdida de negocio | Backups, PITR y restore drill. |
| Admin lockout | Operación bloqueada | AUTH-05 y al menos dos admins. |
| Emails en spam | Mala experiencia y soporte | SPF/DKIM/DMARC y pruebas. |

---

## 9. Anexos

### A. Evidencia de auditoría

| Hallazgo | Evidencia | Estado |
|---|---|---|
| Bucket `members-media` público | Listado y descarga con clave anónima; `HEAD` a video devuelve 200. | Verificado |
| Contenido demo | `membership_content` con “Prueba de Video”, “Rutina VIP Ejemplo”, `example.com`. | Verificado |
| WhatsApp inconsistente | `59178000000` en configuración; `+5493415888117` en footer/JSON-LD. | Verificado |
| Sin analítica | No se detectaron scripts de GA4, Meta, PostHog, Plausible ni Vercel. | Verificado |
| Sin emails de ciclo de vida | No se detectaron Resend, SendGrid, Mailgun, Postmark ni Brevo. | Verificado |
| JSON-LD logo roto | `/landing/logo-vivipressonfit.jpg` devuelve HTML. | Verificado |
| Favicon ausente | `/favicon.ico` devuelve HTML; no hay `<link rel="icon">`. | Verificado |
| Sitemap con auth | Incluye `/login`, `/registro`, `/recuperar`. | Verificado |
| Performance | ~3 MB iniciales, JPG ~1.3 MB, TTFB ~2.2 s. | Medido |
| Accesibilidad | Lighthouse 96; falla contraste del marquee. | Verificado |
| Stripe | Funciones `stripe-checkout`, `stripe-webhook`, `stripe-portal` responden. | Verificado |
| Stripe live | No verificable sin acceso a paneles. | Pendiente |
| RLS | No verificable sin políticas. | Pendiente |
| Tests/CI | No verificable sin repo. | Pendiente |

### B. Inventario de rutas

Ver sección 2.2.

### C. Inventario de tablas, funciones y buckets

| Tipo | Nombre | Uso |
|---|---|---|
| Tabla | `profiles` | Perfil, plan, admin. |
| Tabla | `landing_config` | Configuración de landing. |
| Tabla | `membership_content` | Contenido de miembros. |
| Función | `stripe-checkout` | Crea sesión de checkout. |
| Función | `stripe-webhook` | Procesa eventos de Stripe. |
| Función | `stripe-portal` | Abre customer portal. |
| Función | `bunny-token` | Token firmado para miembros. |
| Función | `bunny-token-public` | Token para demos públicas. |
| Bucket | `landing` | Assets públicos. |
| Bucket | `members-media` | Contenido de miembros; debe ser privado. |

### D. Variables de entorno (nombres)

No se incluyen valores. Inventario esperado:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo Edge Functions)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `STRIPE_PORTAL_RETURN_URL`
- `BUNNY_STREAM_API_KEY`
- `BUNNY_STREAM_LIBRARY_ID`
- `BUNNY_TOKEN_SECRET`
- `APP_URL`
- `EMAIL_API_KEY`
- `EMAIL_FROM`
- `ANALYTICS_KEY`

**Regla:** ninguna clave `service_role` ni `STRIPE_SECRET_KEY` puede estar en el frontend.

### E. Eventos de Stripe

| Evento | Acción esperada |
|---|---|
| `checkout.session.completed` | Crear/actualizar perfil, guardar customer/subscription. |
| `customer.subscription.created` | Estado `trialing` o `active`. |
| `customer.subscription.updated` | Estado, período, cancelación. |
| `customer.subscription.deleted` | `canceled`. |
| `invoice.payment_succeeded` | `active`, período renovado. |
| `invoice.payment_failed` | `past_due`, iniciar dunning. |
| `invoice.finalized` | Guardar factura. |
| `trial_will_end` | Email de aviso. |
| `customer.updated` | Datos de cliente. |

### F. Matriz RLS (plantilla)

| Tabla | Anon | Usuario | Trial | Activo | Admin |
|---|---|---|---|---|---|
| `landing_config` | SELECT | SELECT | SELECT | SELECT | ALL |
| `profiles` | — | SELECT/UPDATE propio | SELECT propio | SELECT propio | ALL |
| `membership_content` público | SELECT | SELECT | SELECT | SELECT | ALL |
| `membership_content` trial | — | — | SELECT | SELECT | ALL |
| `membership_content` miembro | — | — | — | SELECT | ALL |
| Storage público | SELECT | SELECT | SELECT | SELECT | ALL |
| Storage privado | — | — | SELECT firmado | SELECT firmado | ALL |

Completar y probar con la implementación real.

### G. Política de storage (plantilla)

- Bucket público: solo assets de landing, demo y marketing.
- Bucket privado: clases, rutinas, PDFs y contenido de miembros.
- Sin listado público.
- Sin `publicUrl` para privados.
- Signed URL con expiración corta.
- Validación de MIME/tamaño.
- Nombres aleatorios.
- Borrado de huérfanos.
- Backup/restore.

### H. Checklist de contenido

- [ ] Título.
- [ ] Categoría.
- [ ] Tipo.
- [ ] Target (casa/gym/ambos).
- [ ] Nivel.
- [ ] Duración.
- [ ] Equipo.
- [ ] Descripción.
- [ ] Thumbnail.
- [ ] Alt text.
- [ ] Video Bunny ID o storage path.
- [ ] PDF (si aplica).
- [ ] Nivel de acceso.
- [ ] Ciclo/mes.
- [ ] Publicado.
- [ ] Visible en landing (si aplica).
- [ ] Probado en iOS/Android/desktop.

### I. Glosario

- **RLS:** Row Level Security de Postgres/Supabase.
- **Signed URL:** URL temporal con firma para acceder a un archivo privado.
- **Trial:** período de prueba de 7 días.
- **Dunning:** proceso de reintentos y comunicación por pago fallido.
- **HLS:** streaming adaptativo por segmentos.
- **LCP/CLS/INP:** métricas de Core Web Vitals.
- **UAT:** User Acceptance Testing.
- **PITR:** Point-In-Time Recovery.

---

## 10. Conclusión

El proyecto no necesita una reconstrucción. Necesita **cerrar la brecha entre demo y producción**. La mayor parte del trabajo ya está hecha; lo que falta es la capa de seguridad, pagos reales, contenido real, operación y calidad.

El orden correcto es:

1. **Decisiones** de trial, acceso, precio, impuestos y legal.
2. **Seguridad y storage privado** antes de subir contenido real.
3. **Stripe trial y pagos** probados de punta a punta.
4. **Contenido real** y limpieza de demos.
5. **Emails, analítica, dominio y SEO**.
6. **Performance, accesibilidad y UX**.
7. **QA, legal y lanzamiento**.
8. **Operación, documentación y handover**.

Con los P0 cerrados, el sitio puede lanzarse con riesgo controlado. Con los P1 cerrados, queda en condiciones de operar, medir y escalar. Los P2 pueden pasar al backlog post-lanzamiento sin bloquear el negocio.
