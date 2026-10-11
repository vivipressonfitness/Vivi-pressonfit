# Plan de acción: renovar UI/UX del área de membresía

**Proyecto:** VIVIPREFIT React
**Alcance solicitado:** solo interfaz de usuario (UI)
**Fecha de preparación:** 11 de octubre de 2026
**Estado:** propuesta de implementación; no representa cambios ya realizados en las pantallas.

## 1. Reglas obligatorias de alcance

Estas reglas rigen cada tarea, revisión y entrega de esta iniciativa:

1. **Solo se permiten cambios de UI.** Se pueden ajustar JSX, estilos, composición, texto visible, navegación visual y estado efímero de presentación.
2. **No se cambian servicios ni datos:** nada de tablas, columnas, SQL, migraciones, triggers, RLS, policies, Edge Functions, webhooks, secrets, variables de entorno o integraciones Supabase/Stripe/Bunny.
3. **No se cambian reglas del producto:** no alterar quién tiene acceso, estados `trial/active/past_due/expired`, duración/precio de planes, cobro, cancelación, permisos, autenticación ni retorno de Checkout.
4. **No se altera el comportamiento de acciones existentes.** El botón de portal conserva su handler actual; enlaces y controles no deben simular funciones que no existen.
5. **No se agregan librerías ni se actualizan versiones en la primera fase.** En particular, no migrar Tailwind 3 a 4, no ejecutar `shadcn init`, no añadir Motion por decoración y no reemplazar el design system actual.
6. **No se inventan datos.** Si la UI no recibe fecha de renovación, historial, duración, miniatura o progreso, no se muestra un dato ficticio. Se puede presentar un estado vacío honesto o un texto neutral.
7. **Se preservan los flujos actuales** de inicio/cierre de sesión, navegación, acceso a contenido, reproducción y portal de Stripe.
8. **No tocar archivos de backend** para resolver una necesidad visual. Si durante la implementación aparece una dependencia backend, se documenta como fuera de alcance y se deja intacta.
9. Las referencias de terceros se adaptan a la marca VIVIPREFIT: fondo oscuro, superficies existentes, acento rosa y tipografías actuales. No pegar una plantilla completa que cambie la identidad del producto.
10. No incluir `web/.env`, `.temp` u otros archivos de configuración local en commits.

### Archivos permitidos inicialmente

- `web/src/pages/Membership.tsx`
- `web/src/components/membership/StatusCard.tsx`
- `web/src/pages/Videos.tsx`
- `web/src/components/video/VideoList.tsx`
- `web/src/components/video/VideoCard.tsx`
- `web/src/components/video/VideoPlayer.tsx`
- `web/src/pages/Dashboard.tsx`
- `web/src/components/ui/Modal.tsx` (solo accesibilidad/presentación del modal)
- estilos UI puntuales en `web/src/index.css` cuando no se puedan resolver con los tokens/clases ya existentes

`web/package.json`, `web/package-lock.json`, `web/tailwind.config.js`, `web/supabase/**`, `web/src/lib/**`, `web/src/store/**`, `web/src/hooks/**`, `web/src/router.tsx` y cualquier archivo de Auth/Stripe quedan fuera de alcance, salvo lectura para entender los props existentes.

## 2. Diagnóstico de la base actual

- La aplicación usa React 18, Vite y Tailwind CSS 3.4.19; dispone de `Card`, `Button`, `MembershipBadge` y tokens de marca propios.
- `Membership.tsx` combina el estado del plan con bastante texto promocional. Es válido para una persona que aún evalúa suscribirse, pero ocupa espacio que un miembro activo necesita para entender y gestionar su plan.
- `StatusCard.tsx` ya conoce estado, días de prueba e IDs Stripe y ya llama al portal. El rediseño debe conservar esta lógica y mejorar su jerarquía visual.
- `Videos.tsx` presenta un catálogo sencillo; `VideoList.tsx` dibuja una grilla y `VideoCard.tsx` muestra título, categoría, texto y mes. La lista no incluye búsqueda ni filtros visuales.
- `VideoPlayer.tsx` usa HLS en una proporción de video adecuada, pero se muestra dentro del modal genérico de ancho pequeño (`max-w-md`).
- `Dashboard.tsx` muestra tres contenidos recientes y un bloque que aclara que el seguimiento de progreso aún no existe. El rediseño no debe convertir ese bloque en métricas ficticias.
- La navegación privada ya contiene Inicio, Videos, Mi Plan y Perfil; no hace falta introducir una arquitectura nueva.

## 3. Revisión de bibliotecas y decisión

| Herramienta | Qué aporta a este trabajo | Compatibilidad con la base actual | Decisión |
|---|---|---|---|
| Cult UI | Referencias de tarjetas visuales, superficies y estados animados; su repo abierto declara MIT. | Documentación actual basada en Tailwind 4, Motion y tokens shadcn; la app está en Tailwind 3.4 y usa componentes propios. | **Mejor inspiración visual**, adaptar uno o dos patrones a los componentes existentes; no instalar el kit completo. |
| shadcn/ui | Composición accesible, variantes y patrones de Card/Dialog/Tabs personalizables. | Puede incorporarse por piezas a Vite, pero su CLI/configuración actual puede cambiar tokens, aliases y CSS. | Usar principios y ejemplos; no inicializar shadcn ni duplicar `Card`/`Button`. |
| Magic UI | Microinteracciones y estados hover/entrada para mejorar feedback. | La línea actual prioriza Tailwind 4/React 19; existe documentación heredada compatible con Tailwind 3. Algunos patrones añaden Motion. | Referencia secundaria; evitar animaciones que no aporten claridad y no instalar Motion ahora. |
| Aceternity UI | Ideas para tarjetas de video, imágenes y efectos puntuales. | Requisitos dependen de cada componente; puede requerir Motion, utilidades, configuración adicional o contenido Pro. | Solo inspiración selectiva; no copiar páginas completas ni depender de bloques premium. |

### Recomendación técnica

**No incorporar una biblioteca completa en esta fase.** Conservar React, Tailwind 3.4 y los componentes existentes. Hacer una adaptación manual y pequeña de patrones visuales de Cult UI, usando shadcn como referencia de composición/accesibilidad y consultando Magic UI/Aceternity solo si una interacción específica resuelve un problema real.

Motivos: minimiza regresiones, no altera la compilación de Netlify, conserva la identidad VIVIPREFIT, evita migraciones de Tailwind y deja el código sencillo de modificar por la persona propietaria.

## 4. Resultado UX deseado

El miembro debería poder responder en pocos segundos:

- ¿Mi acceso está activo?
- ¿Qué puedo entrenar ahora?
- ¿Dónde encuentro una clase concreta?
- ¿Cómo gestiono mi suscripción?

La pantalla debe poner una sola acción primaria por contexto. En **Mi Plan**, esa acción es gestionar la suscripción si la cuenta ya tiene Stripe asociado. En **Dashboard**, es empezar/abrir contenido disponible. En **Videos**, es localizar y reproducir una clase.

## 5. Plan de implementación por fases

### Fase 0 — Congelar alcance y establecer referencia visual

**Tareas**

1. Confirmar el commit/base actual y trabajar en una rama para la UI.
2. Capturar las pantallas actuales en móvil (390×844), tablet (768×1024) y escritorio (1440×900).
3. Registrar estados existentes que se deben representar: loading, error, lista vacía, trial, active, past_due y acceso inactivo.
4. Revisar que los botones de portal, navegación a videos y enlaces a WhatsApp ya tengan handlers funcionales.
5. Definir criterios UI-only de la sección 1 en la revisión del cambio.

**Entregable:** capturas de referencia y lista breve de archivos UI que se tocarán.

**Aceptación:** no hay cambios a dependencias, lógica de acceso, SQL ni servicios.

### Fase 1 — Sistema visual compacto para el área privada

**Tareas**

1. Mantener paleta vigente: background `#080709`, surface `#131015`, border `#332B36`, accent rosa `#FF2E93`, texto primario/secundario y Poppins/Montserrat.
2. Definir ritmo visual consistente para título, descripción, tarjeta, badge y botón con las clases existentes.
3. Revisar que el contenido no quede oculto detrás del navbar fijo ni de la sidebar, en escritorio y móvil.
4. Mantener contraste y foco visible en botones, enlaces y filtros; respetar `prefers-reduced-motion` si se introduce alguna transición CSS.
5. Reutilizar los componentes existentes antes de crear variantes nuevas.

**Entregable:** componentes visuales existentes con variantes/clases consistentes, sin tokens globales nuevos salvo necesidad documentada.

### Fase 2 — “Mi Plan”

**Archivos candidatos:** `Membership.tsx`, `StatusCard.tsx`.

**Tareas**

1. Reorganizar el encabezado para que diga claramente “Mi plan” o “Tu membresía”, con una descripción corta.
2. Convertir estado y acciones en el primer bloque visual, con badge destacado y texto breve para cada estado ya existente.
3. Para `active`, priorizar “Activa” y el control de suscripción actual. Para `trial`, conservar días de prueba y explicación. Para estados no activos, conservar el CTA actual que lleva al flujo ya implementado.
4. Mostrar beneficios en una lista compacta y fácil de recorrer, eliminando repetición de marketing para quien ya está activo. No cambiar el precio ni el acceso.
5. Mantener la comparación promocional para el contexto apropiado o reducirla visualmente sin alterar los enlaces de registro/checkout.
6. Evitar mostrar “próxima renovación” hasta que el frontend ya disponga de ese dato; no calcularlo a partir de una fecha aproximada ni consultar nuevos endpoints.
7. Mantener errores del portal visibles y asociados al botón; no simular éxito ni ocultar respuesta existente.
8. Revisar estados de carga/disabled y el tamaño táctil del botón en móvil.

**Aceptación:** un miembro activo identifica su estado y puede abrir el portal con el mismo handler de Stripe; un trial entiende que está en prueba; no se muestran datos inexistentes; nada cambia en el cobro.

### Fase 3 — “Videos”

**Archivos candidatos:** `Videos.tsx`, `VideoList.tsx`, `VideoCard.tsx`, `VideoPlayer.tsx`, `Modal.tsx`.

**Tareas**

1. Añadir a la parte superior el título, una frase orientativa y un contador calculado del arreglo ya cargado.
2. Añadir búsqueda local sobre título/descripción y filtros locales por categoría/mes usando `allContent`; no crear consultas nuevas ni cambiar el hook de Supabase.
3. Mostrar filtros como controles accesibles con estado seleccionado, foco y opción de limpiar filtros.
4. Diseñar tarjetas con categoría, título, descripción breve, ciclo y CTA “Ver clase”. Sin miniaturas inventadas: usar una superficie visual de marca o assets existentes solo si son adecuados.
5. Mantener mensajes separados para carga, error, lista vacía y búsqueda sin resultados.
6. Ampliar visualmente el reproductor en escritorio y móvil, conservar `aspect-video`, `controls` y el acceso al cierre.
7. Mejorar el modal para teclado, Escape, foco visible, lector de pantalla y cierre sin alterar la lógica que obtiene el token Bunny.
8. Evitar reproducción automática con sonido; preservar `playsInline` y los controles del video.

**Aceptación:** búsqueda/filtros operan sobre los datos ya recibidos, botones abren exactamente el contenido actual y no se cambia el acceso a los videos.

### Fase 4 — Dashboard como centro de acción

**Archivo candidato:** `Dashboard.tsx`.

**Tareas**

1. Hacer el saludo más compacto y acompañarlo con una acción directa hacia el contenido.
2. Cambiar “Continúa entrenando” por una etiqueta veraz como “Últimas clases” si no existe historial de reproducción.
3. Priorizar tres contenidos recientes/relevantes ya presentes en el arreglo actual y facilitar el paso directo a Videos.
4. Mantener la tarjeta de membresía como resumen, evitando duplicar demasiada información de “Mi Plan”.
5. Mejorar el bloque de progreso sin porcentajes falsos: mientras no exista historial, dejar una explicación honesta con acceso a explorar las clases.
6. Mantener el CTA de WhatsApp y comprobar que sea visible sin competir con la acción principal.

**Aceptación:** el miembro sabe qué hacer después de iniciar sesión; no hay promesas de progreso que no mida la aplicación; no se altera el orden/consulta de datos de backend.

### Fase 5 — Revisión responsive, accesibilidad y regresión visual

**Lista de revisión**

- Anchos de 360, 390, 768, 1024 y 1440 px; sin desbordamiento horizontal.
- Navegación con teclado: Tab, Shift+Tab, Enter, Espacio y Escape cuando corresponda.
- Focus ring visible y botones/enlaces con etiquetas que expliquen la acción.
- Contraste legible para texto secundario y badge en fondo oscuro.
- Estado loading, errores, listas vacías, filtros sin coincidencias y plan activo/trial/inactivo.
- Reproducción HLS, cierre del modal y retorno al catálogo.
- Verificar que checkout/portal no cambia, que los enlaces no cambian de destino y que los permisos de contenido se mantienen.
- Ejecutar `npm run build` y `npm run lint` dentro de `web`; revisar el diff para confirmar que solo contiene archivos permitidos.
- Comprobar que ningún `.env`, archivo temporal, captura con datos personales o secreto se haya agregado al commit.

**Entregable:** una entrega UI que pase build/lint y revisión manual por viewport.

## 6. Orden recomendado de trabajo

1. **Mi Plan** — una pantalla, alto impacto y ya conocemos los estados reales de suscripción.
2. **Videos** — es la tarea central del miembro; filtros locales y presentación pueden realizarse sin backend.
3. **Dashboard** — reorganizar lo que ya existe y enlazar a contenido; dejar el progreso real fuera de alcance.

Cada fase debe revisarse visualmente antes de comenzar la siguiente. Si un requisito exige modificar backend, se detiene esa sub-tarea y queda fuera de este plan UI-only.

## 7. Decisión de bibliotecas: sí/no

### Sí

- Usar Cult UI para referencias de jerarquía y tarjetas; adaptar al sistema de VIVIPREFIT.
- Usar documentación de shadcn para semántica, variantes y accesibilidad.
- Usar Magic UI/Aceternity únicamente como inspiración de microinteracciones o tarjetas puntuales tras revisar la licencia/dependencias del componente exacto.
- Mantener componentes pequeños, props existentes y estilos Tailwind 3.

### No

- No reemplazar la UI completa por una plantilla Cult/Aceternity.
- No instalar una biblioteca completa, inicializar shadcn ni cambiar versión de Tailwind.
- No añadir animaciones de fondo, hover esencial o efectos que oculten información.
- No añadir progreso, facturas, fechas de renovación o planes que el backend no provee.
- No tocar funciones, datos, seguridad o pagos en una entrega que se haya aprobado como UI-only.

## 8. Documentación de referencia local

- [Extracto Cult UI](references/cult-ui.md)
- [Extracto shadcn/ui](references/shadcn-ui.md)
- [Extracto Magic UI](references/magic-ui.md)
- [Extracto Aceternity UI](references/aceternity-ui.md)
