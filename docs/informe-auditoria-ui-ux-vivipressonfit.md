# Auditoría UI/UX — VIVIPRESSONFIT

**Experiencia digital · UI/UX · Accesibilidad**

> Una lectura de producto, no solo de pantallas: qué comunica la marca, dónde se pierde la confianza y qué decisiones impiden que una visitante llegue a entrenar.

Diagnóstico del portal público, la membresía, el área de alumnas y el panel de administración. **24 hallazgos priorizados**, con evidencia en el código y un plan de corrección sin modificar el proyecto.

| Campo | Valor |
| --- | --- |
| Fecha | 26 de octubre de 2026 |
| Alcance | 75 archivos TS/TSX · 7.420 líneas |
| Superficies | Portal · membresía · área privada · admin |
| Rutas declaradas | 15 + fallback |
| Método | Revisión estática de código |
| Hallazgos | 24 |
| Referencia | WCAG 2.2 AA |
| Cambios en el código | Ninguno |

Este documento no modifica el código de la aplicación. Es una auditoría de experiencia basada en la lectura del frontend React enlazado, no una certificación de conformidad ni un sustituto de pruebas con usuarios, lectores de pantalla o analítica real.

---

## Índice

1. [Resumen ejecutivo](#01--resumen-ejecutivo)
2. [Alcance y método](#02--alcance-y-método)
3. [Lo que ya funciona](#03--lo-que-ya-funciona)
4. [Mapa de experiencia](#04--mapa-de-experiencia)
5. [Scorecard UI/UX](#05--scorecard-uiux)
6. [Hallazgos priorizados](#06--hallazgos-priorizados)
7. [Accesibilidad](#07--accesibilidad)
8. [Conversión y confianza](#08--conversión-y-confianza)
9. [Sistema de diseño](#09--sistema-de-diseño)
10. [Área privada](#10--área-privada)
11. [Panel de administración](#11--panel-de-administración)
12. [Responsive y rendimiento](#12--dispositivo-y-velocidad)
13. [Contenido y microcopy](#13--contenido-y-microcopy)
14. [Plan de acción](#14--plan-de-acción-30--60--90)
15. [Medición](#15--medición)
16. [Anexos](#16--anexos)

---

## 01 · Resumen ejecutivo

VIVIPRESSONFIT tiene una propuesta clara —entrenamiento, nutrición y acompañamiento— y una estrategia inteligente para venderla: dejar probar el contenido antes de pedir una cuenta. La identidad oscura con acento rosa también tiene dirección. El problema no es falta de diseño, sino falta de cierre de sistemas: activos, estados, accesibilidad y gobernanza.

La experiencia todavía no está lista para sostener una membresía de pago. La marca aparece rota en la primera pantalla por un activo inexistente, la prueba social está dañada, la portada móvil no tiene un encabezado principal, la navegación contiene un destino muerto y el estado de la membresía puede empujar a una alumna que ya está en prueba a "comenzar" otra prueba. Son fallos de confianza, no detalles visuales.

Los 24 hallazgos se ordenan por impacto. **Cuatro son críticos y nueve son altos**: corregirlos antes de comprar tráfico o lanzar una campaña evita que el primer contacto con la marca sea una imagen rota o un checkout contradictorio.

### Cifras del diagnóstico

| Indicador | Valor | Lectura |
| --- | --- | --- |
| Hallazgos críticos | **4** | Bloquean la confianza inicial |
| Contraste del texto blanco sobre el rosa | **3,46:1** | Por debajo del mínimo AA |
| Bucle continuo del carrusel | **38 s** | Sin pausa visible |
| Líneas en un único editor de landing | **942** | Sin flujo de publicación |

### Prioridades

1. Reparar identidad y prueba social antes de invertir en tráfico.
2. Convertir la portada en una narrativa con una acción principal, no en una suma de secciones.
3. Sanear accesibilidad: H1 móvil, foco, diálogos, pausa de movimiento y contraste.
4. Separar "membresía" de "mi plan" y hacer que el CTA dependa del estado real.
5. Rehacer el admin como flujo de publicación, no como un formulario gigante.

### Veredicto de madurez: 5,7 / 10

Preparada para iterar y probar con usuarias reales. No preparada para venderse como experiencia terminada.

La nota es una escala de juicio profesional para priorizar, no una métrica estadística ni una predicción de conversión.

**Lo que no haría todavía:** un rediseño completo, nuevas funciones de entrenamiento o un cambio de identidad. El mayor retorno está en cerrar los fallos de confianza, navegación y estado que ya existen. Un rediseño sobre una base rota solo hace más caro el mismo problema.

---

## 02 · Alcance y método

### Transparencia: qué se revisó y qué no

La revisión cubre el frontend React enlazado al proyecto: portal público, autenticación, página de membresía y checkout, dashboard, biblioteca de vídeos, perfil, páginas legales y panel de administración. Se inspeccionaron componentes, estilos, rutas, activos públicos, estados de carga y mensajes de error.

**Superficies incluidas.** Home y portal de adelantos, navegación y pie, registro/login/recuperación, membresía y Stripe, dashboard, vídeos, perfil, legales y las cuatro pestañas de administración.

**Base de evaluación.** Heurísticas de usabilidad de Nielsen, WCAG 2.2 nivel AA, principios de conversión y confianza, consistencia de sistema de diseño y señales de rendimiento observables en el código.

**Cómo leer las referencias.** Las citas con formato `src/…:42` indican archivo y línea del frontend revisado. La numeración corresponde al estado del código el 26 de octubre de 2026; puede cambiar si el proyecto se edita después de esta auditoría.

### Lectura de severidad

| Nivel | Criterio | Qué implica | Plazo sugerido |
| --- | --- | --- | --- |
| **Crítico** | Rompe confianza, marca o acceso; afecta a la mayoría de visitantes. | No lanzar campañas ni cobrar con este fallo visible. | 0-14 días |
| **Alto** | Bloquea una tarea clave o genera una interpretación errónea del servicio. | Corregir antes de la siguiente fase de crecimiento. | 15-30 días |
| **Medio** | Genera fricción, deuda o pérdida de eficiencia, pero existe una salida. | Planificar en el ciclo siguiente. | 30-60 días |
| **Bajo** | Higiene, mantenimiento o coherencia de largo plazo. | Agrupar con la limpieza técnica. | 60-90 días |

**Limitaciones.** No se ejecutó la aplicación, no se probó con lector de pantalla y no se accedió a Stripe, Supabase ni datos de analítica. Los hallazgos visuales se infieren del marcado y los estilos; una prueba en navegador puede añadir o descartar incidencias.

**Fuera de alcance.** Seguridad de backend, lógica de cobro, RLS, Edge Functions, rendimiento medido en campo y pruebas formales de conformidad legal. El foco es la experiencia de la persona que descubre, compra, entra y administra el producto.

---

## 03 · Lo que ya funciona

### No todo es deuda

La auditoría pierde valor si solo enumera errores. Estas decisiones ya están bien y deben sobrevivir a cualquier rediseño; son la base sobre la que se puede corregir el resto.

**Una propuesta con foco.** Entrenamiento, nutrición y acompañamiento en una sola membresía. El mensaje "todo lo que viste gratis, ahora completo" conecta bien el portal con la oferta.

**"Ver antes de pagar".** Los adelantos reducen el riesgo percibido y permiten que la visitante juzgue el estilo de la coach antes de registrarse. Es una ventaja de producto, no un adorno.

**Identidad con dirección.** Fondo casi negro, rosa intenso, titulares de alto impacto. El contraste del texto secundario sobre superficie cumple (6,54:1) y el rosa como texto sobre oscuro también (5,45:1).

**Un patrón de vídeo bien resuelto.** La banda "El método, en movimiento" carga por intersección, respeta ahorro de datos y movimiento reducido, y ofrece pausa visible. Es el modelo a replicar en los carruseles. — `src/components/landing/MetodoVideo.tsx:32`

**Arquitectura de rutas.** Las páginas se cargan con lazy y la landing no arrastra el reproductor ni el área privada. La separación público/privado/admin es comprensible.

**Honestidad en estados vacíos.** El dashboard evita inventar progreso y explica que todavía no mide clases completadas. La biblioteca y el dashboard tienen mensajes de vacío claros. Esa honestidad debe mantenerse.

> **Principio de trabajo:** conservar la identidad, la lógica de adelantos y la honestidad del área privada; corregir la ejecución alrededor de ellas. No se necesita un producto nuevo, sino un producto que cumpla lo que ya promete.

---

## 04 · Mapa de experiencia

### Dónde se gana y dónde se pierde la confianza

La fricción no está en el deseo de entrenar. Está en la transición entre "me interesa" y "confío lo suficiente para dar mi tarjeta y entrar". El recorrido se evaluó de descubrimiento a administración.

| Etapa | Pregunta de la persona | Lo que encuentra hoy | Riesgo principal | Severidad |
| --- | --- | --- | --- | --- |
| **Descubrir** (Home) | "¿Qué es, para quién y por qué debería quedarme?" | Hero cinematográfico, adelantos y muchas secciones; en móvil falta el H1 y "Métodos" no lleva a ninguna parte. | Primera impresión de marca rota; navegación que promete más de lo que entrega. | CRÍTICO |
| **Explorar** (Adelantos) | "¿Puedo ver cómo entrena antes de pagar?" | Vídeos reales en tarjetas, pero varios autoplay simultáneos, sin pausa ni duración visible. | Sobrecarga sensorial y de datos; poca información para decidir. | ALTO |
| **Decidir** (Membresía) | "¿Cuánto cuesta y qué pasa exactamente al día 7?" | Mucho beneficio, precio pequeño, dos columnas y un formulario que cambia según la sesión. | Oferta densa; precio y condiciones compiten con el resto del texto. | ALTO |
| **Registrarse** (Cuenta) | "¿Cuánto tarda y qué pasa si me equivoco?" | Formulario corto, errores globales y mensajes del servidor sin traducir. | Abandono por error percibido; poca recuperación ante fallos. | ALTO |
| **Pagar** (Stripe) | "¿Es seguro y puedo cancelar?" | Copia de "$0 hoy" y Stripe; el estado de la cuenta no siempre se refleja antes de mostrar el CTA. | Confusión de prueba vs. suscripción; riesgo de doble alta. | ALTO |
| **Entrar** (Dashboard) | "¿Dónde empiezo?" | Saludo, estado del plan, últimas clases y WhatsApp. Progreso todavía no existe y se explica. | Buen tono, pero poca orientación sobre la siguiente clase concreta. | MEDIO |
| **Gestionar** (Mi plan) | "¿Cómo cambio o cancelo?" | La misma ruta vende y gestiona; una alumna en trial ve un CTA para empezar la prueba. | Ambigüedad de estado y riesgo comercial. | ALTO |
| **Administrar** (Panel admin) | "¿Cómo publico sin romper la landing?" | Editor de 942 líneas, guardado por campo, sin preview ni estado de cambios. | Lentitud, errores y miedo a editar. | ALTO |

---

## 05 · Scorecard UI/UX

### Diagnóstico comparado

Ocho dimensiones, puntuadas de 0 a 10. La intención es mostrar dónde concentrar el esfuerzo, no comparar con competidores ni predecir resultados. La puntuación global es un promedio ponderado por impacto en la experiencia de compra y uso.

| Dimensión | Puntuación |
| --- | --- |
| Propuesta y narrativa | 7,0 |
| Navegación e IA | 5,4 |
| Sistema visual | 6,0 |
| Accesibilidad | 4,6 |
| Conversión y confianza | 5,8 |
| Área privada | 6,4 |
| Administración | 5,0 |
| Responsive y rendimiento percibido | 5,6 |
| **Madurez global** | **5,7** |

**Lectura:** la propuesta y el área privada están por encima de la media del resto. Accesibilidad, navegación y administración son las dimensiones que más arrastran la experiencia y donde se concentra la deuda.

### Distribución de los 24 hallazgos

| Severidad | Hallazgos |
| --- | --- |
| Crítico | 4 |
| Alto | 9 |
| Medio | 9 |
| Bajo | 2 |

Las barras representan la cantidad de hallazgos por nivel, no la gravedad acumulada. Los críticos se corrigen primero aunque sean pocos.

---

## 06 · Hallazgos priorizados

### Registro de auditoría — 24 hallazgos priorizados

Cada hallazgo incluye evidencia, impacto y una recomendación concreta. El esfuerzo es relativo: **"S"** implica un cambio acotado; **"M"** una intervención de varios componentes; **"L"** un rediseño de flujo o de información. No se asigna un coste en horas porque no se conoce el equipo ni el calendario.

| ID | Hallazgo | Área | Severidad | Esfuerzo |
| --- | --- | --- | --- | --- |
| F-01 | Logo por defecto inexistente y metadatos de marca rotos | Marca / activos | CRÍTICO | S |
| F-02 | Testimonios con imágenes de 1 byte y afirmaciones no verificables | Confianza / contenido | CRÍTICO | M |
| F-03 | La portada móvil no tiene un H1 | Accesibilidad / SEO | CRÍTICO | S |
| F-04 | Destino muerto /#galeria y anclas ocultas por la cabecera fija | Navegación | CRÍTICO | M |
| F-05 | Movimiento automático continuo sin pausa | Accesibilidad / motion | ALTO | M |
| F-06 | Diálogos y visores de media sin base accesible | Accesibilidad | ALTO | M |
| F-07 | Contraste insuficiente y texto crítico demasiado pequeño | Accesibilidad / tipografía | ALTO | S |
| F-08 | Estado de membresía y checkout contradictorios | Conversión / estados | ALTO | M |
| F-09 | Arranque de sesión y errores de autenticación confusos | Auth / estados | ALTO | M |
| F-10 | Sistema visual fragmentado: botones, radios e iconos emoji | Sistema de diseño | ALTO | M |
| F-11 | Precio y oferta sin una fuente única | Contenido / confianza | ALTO | S/M |
| F-12 | Editor de landing monolítico y sin flujo de publicación | Admin | ALTO | L |
| F-13 | Gestión de miembros y contenido con riesgo operativo | Admin | ALTO | L |
| F-14 | Portada larga y con exceso de CTAs equivalentes | Conversión / jerarquía | MEDIO | M |
| F-15 | Etiquetas de navegación que no coinciden con las secciones | IA / navegación | MEDIO | S/M |
| F-16 | Formularios sin validación inline ni ayudas de error | Formularios | MEDIO | M |
| F-17 | Estados de carga, error y vacío inconsistentes | Resiliencia | MEDIO | M |
| F-18 | Fricción responsive y objetivos táctiles pequeños | Responsive | MEDIO | M |
| F-19 | Rendimiento percibido y CLS por activos y autoplay | Rendimiento | MEDIO | M |
| F-20 | Jerarquía tipográfica y tamaños de lectura | Tipografía | MEDIO | S/M |
| F-21 | Voz, idioma y microcopy inconsistentes | Contenido | MEDIO | S/M |
| F-22 | Consentimiento de cookies sin control real | Privacidad | MEDIO | S/M |
| F-23 | Componentes y estilos muertos que confunden el sistema | Higiene técnica | BAJO | S |
| F-24 | Gobernanza de marca y nombres internos divergentes | Gobernanza | BAJO | S |

### Críticos

> Corregir antes de comprar tráfico, lanzar una campaña o cobrar una suscripción. — **4 hallazgos**

#### F-01 · Logo por defecto inexistente y metadatos de marca rotos

*CRÍTICO · Esfuerzo S · Marca y activos · Criterio: confianza, coherencia visual, SEO*

**Qué ocurre.** La configuración, la cabecera y el pie apuntan a `/landing/logo-vivipressonfit.jpg`, pero en el repositorio solo existe `public/landing/logo-vivifit.jpg`. La misma ruta inexistente aparece en el logo del JSON-LD. El editor de admin, además, sugiere el nombre antiguo en su placeholder. Solo una fila de `landing_config` que sobrescriba el valor evita el fallo; el estado limpio del proyecto no lo evita.

**Evidencia**

- `src/hooks/useLandingConfig.ts:149` — ruta de logo por defecto
- `src/components/layout/Navbar.tsx:42` · `src/components/layout/Footer.tsx:19` — fallbacks
- `index.html:37` — logo del JSON-LD
- `src/components/admin/LandingConfigEditor.tsx:313` — placeholder con el nombre existente

**Impacto.** La cabecera y el pie son el primer y el último contacto de marca. Un logo roto comunica abandono y contradice la promesa de un servicio de pago; además invalida datos estructurados y la tarjeta social.

**Recomendación.** Definir una ruta canónica, renombrar o añadir el archivo, usar un fallback con `onError`, actualizar metadatos y placeholder, y verificar el inventario de activos en cada release.

#### F-02 · Testimonios con imágenes de 1 byte y afirmaciones no verificables

*CRÍTICO · Esfuerzo M · Confianza y contenido · Criterio: credibilidad, consentimiento, claims*

**Qué ocurre.** Los tres retratos de `/assets/testimonial-*.webp` pesan 1 byte: cualquier navegador los muestra rotos. Todos los enlaces "Escríbeme" apuntan al WhatsApp de la coach, no al de las alumnas. Los textos incluyen resultados concretos ("bajé 3 kg en 1 mes", "mejor marca") sin contexto, periodo, consentimiento ni descargo. La sección reutiliza `id="educativo"`, ya usado por la sección de nutrición.

**Evidencia**

- `src/components/landing/Testimonios.tsx:6-20` — fotos y afirmaciones
- `src/components/landing/Testimonios.tsx:45-50` — enlaces de WhatsApp
- `src/components/landing/Testimonios.tsx:25` · `src/components/landing/Sections.tsx:339` — id duplicado
- `public/assets/testimonial-1.webp` — 1 byte

**Impacto.** La prueba social es uno de los activos de mayor confianza y aquí produce el efecto contrario: caras rotas y promesas que no se pueden sostener. También hay riesgo reputacional y legal por resultados de salud sin contexto.

**Recomendación.** Ocultar la sección hasta tener testimonios reales con consentimiento y foto; acompañar cada resultado con contexto y descargo; enlazar el canal correcto o eliminar el CTA; usar un id único. Si no hay material, sustituir por "cómo funciona" o resultados del programa sin promesas individuales.

#### F-03 · La portada móvil no tiene un H1

*CRÍTICO · Esfuerzo S · Accesibilidad y SEO · Criterio: WCAG 1.3.1, 2.4.6; estructura del documento*

**Qué ocurre.** En móvil, el hero no contiene ningún `h1`: la única etiqueta `h1` está dentro del bloque `hidden md:flex` que se oculta por debajo de 768 px. El título móvil se pinta en un `span` dentro de una tira animada. El documento móvil queda sin encabezado principal.

**Evidencia**

- `src/components/landing/Hero.tsx:17-95` — versión móvil sin h1
- `src/components/landing/Hero.tsx:100` — bloque desktop oculto por debajo de `md`
- `src/components/landing/Hero.tsx:138` — único h1

**Impacto.** Las personas que navegan con lector de pantalla pierden el título de la página; los buscadores reciben una señal más débil; la estructura de encabezados deja de ser fiable.

**Recomendación.** Un solo `h1` en el flujo, visible en todos los tamaños. Usar el mismo texto con estilos responsive o dos variantes donde solo cambie el CSS, nunca el nivel semántico. Verificar un único `h1` por página.

#### F-04 · Destino muerto /#galeria y anclas ocultas por la cabecera fija

*CRÍTICO · Esfuerzo M · Navegación e IA · Criterio: orientación, enlaces fiables, acceso*

**Qué ocurre.** El enlace "Métodos" apunta a `/#galeria`; `GallerySection` define `id="galeria"` pero no se importa en Home, y el carrusel que sí se renderiza no tiene id. Los enlaces hash del pie usan `Link` sin restauración de scroll y la cabecera fija no define `scroll-padding`; los títulos pueden quedar debajo del header. La página legal empieza con `py-12` (48 px) bajo un header de 76-90 px, por lo que el contenido superior queda tapado.

**Evidencia**

- `src/components/layout/Navbar.tsx:20-23` — "Métodos" → `/#galeria`
- `src/components/landing/GallerySection.tsx:13` — id definido en componente no usado
- `src/components/gallery/SwiperWrapper.tsx:86` — sección sin id
- `src/components/layout/Footer.tsx:32-36` — enlaces hash
- `src/pages/Legal.tsx:34` — padding superior insuficiente

**Impacto.** La navegación promete una sección que no existe. Los saltos internos pueden dejar el título oculto o no desplazarse en navegación cliente, lo que hace que la persona crea que el enlace está roto.

**Recomendación.** Un mapa único de secciones; asignar ids a las secciones reales; usar un helper de scroll con offset; `scroll-mt`/`scroll-padding-top`; padding superior consistente en páginas internas; página 404 útil en lugar de redirigir todo al inicio.

### Altos

> Bloquean una experiencia de pago confiable o una tarea clave del producto. — **9 hallazgos**

#### F-05 · Movimiento automático continuo sin pausa

*ALTO · Esfuerzo M · Accesibilidad y motion · Criterio: WCAG 2.2.2; rendimiento; confort*

**Qué ocurre.** El carrusel de comunidad se anima 38 s en bucle y el comentario del código dice explícitamente que nunca se pausa. La marquesina de marca y la del hero móvil también son infinitas. Las tarjetas de adelanto reproducen vídeo automáticamente, en mute y en bucle, sin control de pausa. `FeatureCarousel` pausa al pasar el ratón o tocar, pero no al recibir foco de teclado. `MetodoVideo` sí implementa pausa, movimiento reducido y ahorro de datos: ese es el patrón a replicar.

**Evidencia**

- `src/components/gallery/SwiperWrapper.tsx:44-46, 100, 115-127` — bucle de 38 s sin pausa
- `src/components/landing/Hero.tsx:19-30, 201-203` — marquesinas
- `src/components/landing/Sections.tsx:193-213` — autoplay de tarjetas
- `src/components/landing/FeatureCarousel.tsx:60-63` — pausa solo con ratón/tacto
- `src/components/landing/MetodoVideo.tsx:132-150` — patrón correcto

**Impacto.** Las personas con trastornos vestibulares o sensibilidad al movimiento no pueden detener el contenido; el autoplay simultáneo consume datos y batería; la atención se dispersa justo cuando la persona intenta decidir. También incumple el criterio de pausar, detener u ocultar el movimiento de más de cinco segundos.

**Recomendación.** Pausa visible en toda superficie en movimiento; detener fuera del viewport o cuando la pestaña no está visible; respetar `prefers-reduced-motion`; limitar los vídeos simultáneos; pausar también al recibir foco; usar póster hasta la interacción.

#### F-06 · Diálogos y visores de media sin base accesible

*ALTO · Esfuerzo M · Accesibilidad · Criterio: WCAG 2.1.1, 2.4.3, 4.1.2*

**Qué ocurre.** `FreeVideoModal` no declara `role="dialog"` ni `aria-modal`, no mueve el foco, no lo atrapa y no lo devuelve. `AboutMe` y `GallerySection` abren visores desde un `div` con `onClick`, sin teclado. `Modal` sí tiene trampa de foco y `Escape`, pero no bloquea el scroll del fondo. El `iframe` del reproductor de miembros no tiene `title`. Los cierres usan el glifo `X`.

**Evidencia**

- `src/components/landing/FreeVideoModal.tsx:118-139` — contenedor sin rol ni foco
- `src/components/landing/AboutMe.tsx:35-53, 73-106` — visor sobre div
- `src/components/ui/Modal.tsx:66-76` — rol correcto, sin scroll lock
- `src/components/video/VideoPlayer.tsx:96-105` — iframe sin title

**Impacto.** Una persona que navega con teclado o lector de pantalla puede abrir el vídeo y quedar atrapada detrás del overlay, sin saber dónde está el cierre ni cómo volver. El fondo sigue desplazándose mientras el diálogo está abierto.

**Recomendación.** Un único primitivo de diálogo accesible: foco inicial, trampa, `Escape`, retorno al disparador, scroll lock, `inert` en el fondo y `aria-labelledby`. Convertir los visores de imagen en botones; añadir `title` a los iframes; ofrecer subtítulos y transcripción cuando haya voz.

#### F-07 · Contraste insuficiente y texto crítico demasiado pequeño

*ALTO · Esfuerzo S · Accesibilidad y tipografía · Criterio: WCAG 1.4.3, 1.4.11; legibilidad*

**Qué ocurre.** El blanco sobre el rosa de marca mide 3,46:1; se usa en botones y pestañas de 12-14 px. El borde de campos y tarjetas mide 1,38:1 sobre superficie, por debajo del 3:1 de componentes. Textos críticos —precio, letra pequeña del trial, consentimiento— aparecen a 11-12 px. Los grises de cuerpo sí cumplen (6,5-7:1) y el rosa como texto sobre oscuro cumple (5,45:1).

**Evidencia**

- `src/components/ui/Button.tsx:12` · `src/pages/Admin.tsx:106` · `src/pages/Legal.tsx:66` — blanco sobre rosa
- `src/index.css:52-57` — `btn-accent` también usa blanco
- `src/components/ui/Input.tsx:18-20` — borde `border-border`
- `src/pages/Membership.tsx:286-288, 396-398` — letra pequeña crítica

*Contraste calculado con luminancia relativa WCAG 2.x sobre `#FF2E93` y `#080709`.*

**Impacto.** Las personas con baja visión pueden no leer el precio o las condiciones; los botones pequeños con texto blanco incumplen el mínimo de 4,5:1; los campos con borde casi invisible son difíciles de localizar.

**Recomendación.** Usar tinta oscura sobre rosa (5,8:1) o un rosa más profundo si se mantiene blanco; llevar bordes de campo a 3:1; 16 px para cuerpo y 14 px mínimo para información crítica; auditar hover, disabled, focus y estados seleccionados.

#### F-08 · Estado de membresía y checkout contradictorios

*ALTO · Esfuerzo M/L · Conversión y estados · Criterio: claridad de oferta, prevención de doble alta*

**Qué ocurre.** `isManaging` solo cubre `active` y `past_due`. Una alumna en trial ve el formulario de "Paso Final" con el botón "Comenzar 7 días de prueba gratis", aunque ya está en prueba. Antes de que el perfil hidrate, una miembro activa puede ver el checkout. La misma ruta `/membresia` vende y gestiona. Un admin sin membresía también ve la compra.

**Evidencia**

- `src/pages/Membership.tsx:46-49` — `isManaging` solo active/past_due
- `src/pages/Membership.tsx:262-288` — CTA para usuaria con sesión
- `src/components/membership/StatusCard.tsx:81-82` — mensaje de trial
- `src/store/membershipStore.ts:21-37` — status inicia en null

**Impacto.** La persona en prueba recibe una instrucción que contradice su estado; la miembro activa puede ver un checkout que no le corresponde; el admin puede comprar sin necesitarlo. El coste potencial es una doble suscripción, una solicitud de reembolso o una simple pérdida de confianza.

**Recomendación.** Separar `/membresia` (adquisición) de `/mi-plan` (gestión). Un CTA por estado: invitada, trial, activa, pago vencido, cancelada, vencida, admin. Bloquear el checkout hasta hidratar el estado. En trial, ofrecer "Convertir a plan de pago" con fecha exacta de cobro; en activa, "Gestionar suscripción".

#### F-09 · Arranque de sesión y errores de autenticación confusos

*ALTO · Esfuerzo M · Autenticación y estados · Criterio: continuidad, recuperación de errores*

**Qué ocurre.** `initAuthListener` marca `initializing=false` antes de terminar `loadProfile`; `ProtectedRoute` redirige a `/membresia` si hay sesión pero aún no hay perfil. Un acceso directo a `/dashboard` puede rebotar. Los errores de Supabase se muestran en inglés y sin mapeo; en registro, mensajes de éxito o advertencia se pintan con estilo de error rojo. El login deja `console.debug` con datos de sesión y perfil.

**Evidencia**

- `src/store/authStore.ts:37-40` — initializing antes del perfil
- `src/components/auth/ProtectedRoute.tsx:22-24` — redirección por perfil ausente
- `src/components/auth/LoginForm.tsx:28, 38, 52` — logs y error crudo
- `src/components/auth/RegisterForm.tsx:64-79` — éxito/advertencia como error

**Impacto.** Un enlace guardado o un acceso directo puede llevar a la persona a la página de venta en vez de a su contenido. Un error en inglés y en rojo se interpreta como cuenta rota. Los logs no son visibles para la usuaria, pero sí ruido para el equipo.

**Recomendación.** Hidratar sesión, perfil y membresía antes de decidir la ruta; esqueleto de carga; errores traducidos con acción de recuperación; separar `status` de `alert`; validación inline; quitar logs; conservar el contexto `from` y restaurar la intención original.

#### F-10 · Sistema visual fragmentado: botones, radios e iconos emoji

*ALTO · Esfuerzo M · Sistema de diseño · Criterio: consistencia, accesibilidad, calidad percibida*

**Qué ocurre.** Conviven dos primarios: rosa con texto blanco (`Button`, `btn-accent`, pestañas) y rosa con texto casi negro (Navbar, Hero, Membership). La misma acción se llama "Hazte miembro", "Probar 7 días gratis", "Comenzar 7 días", "Continuar a la prueba" y "Activa tus 7 días". Se mezclan radios de 8, 12, 16, 24, 28 px y píldora; los emojis funcionan como iconos en navegación, dashboard y admin. Los estados semánticos usan verdes, ámbar, rojo, azul y gris hardcodeados.

**Evidencia**

- `src/components/ui/Button.tsx:11-16` + `src/components/layout/Navbar.tsx:87-97` — dos tratamientos
- `src/index.css:52-57` — `btn-accent` con texto blanco
- `src/components/layout/Sidebar.tsx:18` · `src/pages/Dashboard.tsx:23-62` · `src/components/admin/MediaBucketManager.tsx:143-198` — emoji funcional
- `tailwind.config.js:27-29` — solo se define `pill`; el resto es ad hoc

**Impacto.** La fragmentación impide que la interfaz se sienta como un producto terminado; los emojis cambian de forma según el sistema operativo, no tienen un nombre accesible fiable y mezclan tono con función.

**Recomendación.** Tokens de color, tipografía, espacio, radio y movimiento; tres variantes de botón; un léxico único de CTA; una familia de iconos de trazo; tokens semánticos para estados; revisar contraste en cada variante.

#### F-11 · Precio y oferta sin una fuente única

*ALTO · Esfuerzo S/M · Contenido y confianza · Criterio: coherencia comercial, exactitud*

**Qué ocurre.** El pie y el modal de vídeo gratis tienen `40` hardcodeado; también la meta descripción, Open Graph y JSON-LD. El resto lee `config.monthly_price`. Si se cambia el precio desde el admin, varias superficies quedan desactualizadas.

**Evidencia**

- `src/components/layout/Footer.tsx:63` — "Suscripción mensual USD 40 / mes"
- `src/components/landing/FreeVideoModal.tsx:239` — "USD 40/mes"
- `index.html:10, 20, 48` — precio en metadatos
- `Membership.tsx:191, 287` — uso de config

**Impacto.** Una oferta que cambia según la pantalla es una fuente directa de desconfianza y de disputas. También puede dejar metadatos y buscadores mostrando un precio distinto al del checkout.

**Recomendación.** Un objeto de oferta con precio, moneda, periodo, días de prueba e impuestos; un formateador único; usar ese valor en copy, metadatos, checkout y emails; validar coherencia en build y en el editor de admin.

#### F-12 · Editor de landing monolítico y sin flujo de publicación

*ALTO · Esfuerzo L · Administración · Criterio: eficiencia operativa, prevención de errores*

**Qué ocurre.** El editor de landing tiene 942 líneas, siete bloques apilados y un botón de guardado por campo. No hay índice, barra de guardado fija, estado de cambios sin guardar, validación ni vista previa. "Restablecer" cambia el estado local sin confirmación. Los mensajes de éxito exponen claves internas ("monthly_price" guardado correctamente).

**Evidencia**

- `src/components/admin/LandingConfigEditor.tsx:15-25, 116-146, 904-939` — estructura y guardado
- `src/components/admin/LandingConfigEditor.tsx:126` — mensaje con clave interna
- `src/components/admin/LandingConfigEditor.tsx:260-266, 352-359, 466-471, 583-590, 690-697` — resets locales

**Impacto.** Publicar un cambio pequeño requiere navegar una página enorme y recordar qué se guardó. El miedo a romper la landing desincentiva la actualización de contenido, justo lo que sostiene una membresía mensual.

**Recomendación.** Dividir en Marca / Inicio / Contenido / Precios; guardado por sección con barra sticky; detección de cambios; vista previa; validación; confirmaciones para restablecer; mensajes humanos con el nombre visible del campo.

#### F-13 · Gestión de miembros y contenido con riesgo operativo

*ALTO · Esfuerzo L · Administración · Criterio: seguridad operativa, escala, claridad*

**Qué ocurre.** La tabla de miembros no tiene búsqueda, filtros, paginación ni detalle. El botón para retirar admin se llama "Retroceder", no pide confirmación y escribe el cambio de inmediato. El estado del plan se muestra como `active`/`past_due` en inglés. `ContentManager` es un formulario de 641 líneas con borrado por `window.confirm`, toggles que ignoran errores y pestañas que no viven en la URL.

**Evidencia**

- `src/pages/Admin.tsx:132-167` — tabla sin filtros ni confirmación
- `src/pages/Admin.tsx:154-161` — "Retroceder" / "Hacer Admin"
- `src/components/admin/ContentManager.tsx:118-132` — borrado y toggles sin manejo de error
- `src/pages/Admin.tsx:39` — pestaña solo en estado local

**Impacto.** Un clic accidental puede retirar permisos de administración o despublicar contenido; con muchos miembros, encontrar a alguien se vuelve manual; el equipo no puede volver a una pestaña concreta del admin ni compartir un enlace interno.

**Recomendación.** Lista con búsqueda, filtros, orden y paginación; ficha de miembro; acciones explícitas, confirmadas y con consecuencia visible; auditoría de roles; estados traducidos; tabla de contenido con acciones masivas y vista previa; pestañas en la URL.

### Medios

> Deuda que erosiona conversión, accesibilidad o eficiencia, pero no bloquea por sí sola. — **9 hallazgos**

#### F-14 · Portada larga y con exceso de CTAs equivalentes

*MEDIO · Esfuerzo M · Conversión y jerarquía · Criterio: claridad de decisión*

**Qué ocurre.** La portada encadena diez bloques y repite la misma oferta en hero, método, clases, nutrición, CTA y FAQ. No hay un resumen compacto "esto incluye / cuánto cuesta / cómo pruebo" antes del pliegue. Las tarjetas de adelanto no muestran duración ni nivel, aunque el dato de duración existe.

**Evidencia**

- `src/pages/Home.tsx:20-31` — secuencia de diez bloques
- `src/components/landing/Sections.tsx:386-409` — CTA puente
- `src/data/landingMedia.ts:43, 53, 63, 73` — duración definida pero no visible

**Impacto.** La persona tiene que recorrer demasiado para reconstruir la oferta. Cada bloque compite por la misma acción, así que ninguno se siente como el siguiente paso.

**Recomendación.** Reducir a 6-7 bloques; resumen de oferta cerca del hero; una acción primaria por viewport; duración y nivel en tarjetas; prueba de producto real; CTA contextual en lugar de repetir el mismo botón.

#### F-15 · Etiquetas de navegación que no coinciden con las secciones

*MEDIO · Esfuerzo S/M · IA y navegación · Criterio: orientación, coincidencia de vocabulario*

**Qué ocurre.** Los labels de navegación no coinciden con los títulos de sección ("Programas" → "Estructura del Programa"; "Gratis" → "Adelantos Gratuitos"; "Nutrición" → "Nutrición y Educación"). "Mi Plan" lleva a la misma ruta que la venta. No hay 404: cualquier ruta desconocida vuelve al inicio sin explicación. "Contáctanos por WhatsApp" en Legal lleva al pie, no a WhatsApp. Las pestañas de admin no son enlazables.

**Evidencia**

- `src/components/layout/Navbar.tsx:13-23` — labels y anclas
- `src/components/landing/Sections.tsx:327-339` — título de nutrición
- `src/router.tsx:70` — fallback a inicio
- `src/pages/Legal.tsx:107` — enlace de contacto

**Impacto.** La navegación no confirma la expectativa. Un enlace de contacto que termina en el pie obliga a buscar el WhatsApp; una ruta inexistente no explica qué ocurrió.

**Recomendación.** Un mapa de vocabulario entre nav, títulos y URLs; rutas separadas para venta y gestión; 404 útil con enlaces; enlace directo a WhatsApp; pestañas de admin en URL; breadcrumbs en el área privada.

#### F-16 · Formularios sin validación inline ni ayudas de error

*MEDIO · Esfuerzo M · Formularios · Criterio: WCAG 3.3.1, 3.3.2; finalización*

**Qué ocurre.** Los formularios validan al enviar y muestran un error global; `Input` no expone `aria-invalid` ni `aria-describedby`; los errores del servidor llegan sin traducir. No hay ver u ocultar contraseña, medidor de fortaleza ni aviso de mayúsculas. La regla es de 6 caracteres. Los enlaces de términos abren pestaña nueva sin avisar. Perfil comparte un solo estado de guardado para dos formularios.

**Evidencia**

- `src/components/auth/RegisterForm.tsx:30, 137-158` — validación y consentimiento
- `src/pages/Profile.tsx:18-45` — estado de guardado compartido
- `src/pages/Membership.tsx:58-60` — mínimo de contraseña

**Impacto.** Un error global obliga a revisar todo el formulario; el lector de pantalla no anuncia qué campo falló; una contraseña débil se descubre tarde. La pestaña nueva de términos puede desorientar en móvil.

**Recomendación.** Validación inline; resumen de errores con foco; `aria-invalid` y `aria-describedby`; visibilidad y fortaleza en contraseña; mínimo más exigente; errores traducidos; estado de guardado por formulario; éxito anunciado con `role="status"`.

#### F-17 · Estados de carga, error y vacío inconsistentes

*MEDIO · Esfuerzo M · Resiliencia · Criterio: previsibilidad, recuperación*

**Qué ocurre.** Si falla la consulta de `landing_config`, `loading` queda en `true` y no hay superficie de error; el carrusel desaparece si la carga falla; no hay `ErrorBoundary`; las listas de admin no distinguen carga de vacío; el reproductor no ofrece reintento. La configuración se consulta por separado en Navbar, Footer, Home, Membership, Dashboard y RegisterForm.

**Evidencia**

- `src/hooks/useLandingConfig.ts:195-303` — carga sin rama de error
- `src/components/gallery/SwiperWrapper.tsx:81-83` — fallo silencioso
- `src/components/video/VideoPlayer.tsx:91-95` — error sin reintento
- `src/App.tsx:6-14` — sin ErrorBoundary

**Impacto.** Una sección que no carga se interpreta como una sección que no existe; la usuaria no sabe si esperar o recargar. El equipo recibe soporte por fallos que no puede reproducir.

**Recomendación.** Proveedor único de configuración con caché; estados loading/error/empty explícitos y reintento; `ErrorBoundary`; esqueletos; no mostrar datos obsoletos sin indicador.

#### F-18 · Fricción responsive y objetivos táctiles pequeños

*MEDIO · Esfuerzo M · Responsive · Criterio: uso en móvil, accesibilidad táctil*

**Qué ocurre.** En móvil, el hero apila tira, imagen y contenido antes de la oferta; el menú no bloquea scroll ni atrapa foco; el banner de cookies usa objetivos de 36 px; varios botones de icono son menores de 44 px; la tabla de admin exige scroll horizontal (580 px mínimo); el editor de landing mantiene seis columnas de fotos en desktop; el checkout queda después de todo el contenido.

**Evidencia**

- `src/components/landing/Hero.tsx:17-95` — orden móvil
- `src/components/layout/Navbar.tsx:136-198` — menú sin foco/scroll lock
- `src/components/ui/CookieBanner.tsx:72-80` — `min-h` 36 px
- `src/pages/Admin.tsx:132` — `min-w` 580 px
- `src/pages/Membership.tsx:257` — sticky solo en desktop

**Impacto.** En móvil se toca mal, se scrollea de más y la decisión de compra aparece tarde; en admin, la tabla se vuelve incómoda y las fotos se ven diminutas.

**Recomendación.** CTA o resumen sticky en móvil; menú como diálogo; objetivos de 44 px; tablas convertidas en tarjetas; dos columnas en el editor; revisar 320/375/768/1024; adelantar el checkout antes de los beneficios largos.

#### F-19 · Rendimiento percibido y CLS por activos y autoplay

*MEDIO · Esfuerzo M · Rendimiento · Criterio: LCP, CLS, INP, datos móviles*

**Qué ocurre.** El logo y los testimonios no tienen dimensiones intrínsecas; varias imágenes no declaran `width`/`height`. Los vídeos del carrusel usan `preload="auto"` y se duplican para el bucle. `main.tsx` importa tres CSS de Swiper aunque el carrusel actual no usa Swiper. Lenis envuelve toda la app, incluido admin, sin opt-out de movimiento. La galería por defecto referencia Unsplash externo.

**Evidencia**

- `src/components/gallery/SwiperWrapper.tsx:20-28, 119-125` — autoplay y duplicado
- `src/main.tsx:6-8` — CSS de Swiper
- `src/App.tsx:8` — Lenis global
- `src/hooks/useLandingConfig.ts:41-84` — Unsplash en defaults

**Impacto.** El primer render puede desplazarse al aparecer imágenes sin dimensiones; varios vídeos compiten por red y CPU; el scroll suave global puede sentirse pesado en móviles de gama baja.

**Recomendación.** Presupuesto de rendimiento; dimensiones y `srcset`; póster y carga por intersección; un solo vídeo activo; eliminar CSS muerto; condicionar Lenis a movimiento reducido; alojar los activos localmente.

#### F-20 · Jerarquía tipográfica y tamaños de lectura

*MEDIO · Esfuerzo S/M · Tipografía · Criterio: legibilidad, jerarquía*

**Qué ocurre.** La mayor parte del cuerpo va a 12-14 px; precio, letra pequeña del trial, consentimiento y legales están a 11-12 px. Abundan los `font-extrabold` en títulos y CTAs, lo que aplana la jerarquía. El gris secundario cumple contraste, pero a esos tamaños la lectura se vuelve exigente.

**Evidencia**

- `src/pages/Membership.tsx:286-288, 396-398` — microcopy crítico
- `src/components/layout/Footer.tsx:61-63` — 12 px
- `src/components/ui/CookieBanner.tsx:55` — 12 px
- `src/components/landing/Hero.tsx:138-145` — títulos 4xl/6xl y cuerpo 18-20

**Impacto.** La información que decide la compra es la más pequeña. La abundancia de negritas hace que todo grite y nada destaque.

**Recomendación.** Cuerpo 16 px; crítico 14 px mínimo; metadatos 12 px; escala 12/14/16/18/24/32/48; limitar pesos; `line-height` 1.5-1.7; líneas de 65-75 caracteres.

#### F-21 · Voz, idioma y microcopy inconsistentes

*MEDIO · Esfuerzo S/M · Contenido · Criterio: coherencia de marca, claridad*

**Qué ocurre.** Se mezclan "tú" y voseo ("Seleccioná" en admin), "alumna" y "miembro", español con "Dashboard", "Landing", "Panel Admin", "Bucket" y "Email". "VIP" no se define. El precio se escribe de cuatro formas. La voz cambia entre cercana y técnica según la pantalla.

**Evidencia**

- `src/components/admin/MediaManager.tsx:72` — "Seleccioná"
- `src/pages/Membership.tsx:168, 304` — "VIP" y "Nueva Alumna"
- `src/pages/Dashboard.tsx:23` — "¡Hola!" vs. admin técnico
- `src/data/legalContent.ts:24` — "USD $40.-"

**Impacto.** La marca suena distinta según la superficie; el vocabulario técnico del admin se filtra a una experiencia de consumo; "VIP" promete una categoría que no se explica.

**Recomendación.** Glosario de marca y producto; una persona gramatical; español para la UI y términos técnicos solo donde aporten; definir VIP; formato único de precio; revisar todo el copy en una pasada editorial.

#### F-22 · Consentimiento de cookies sin control real

*MEDIO · Esfuerzo S/M · Privacidad · Criterio: control del usuario, confianza*

**Qué ocurre.** El banner solo ofrece "Solo necesarias" o "Aceptar todas"; no hay preferencias por categoría ni forma de reabrir la decisión. Los botones miden 36 px, no hay anuncio `aria-live` y el banner vive dentro del footer. No se explica qué cookies de terceros se usan más allá de Stripe.

**Evidencia**

- `src/components/ui/CookieBanner.tsx:23-36, 68-82` — opciones y guardado
- `src/components/layout/Footer.tsx:13` — banner dentro del footer

**Impacto.** La persona no puede cambiar de opinión ni entender qué acepta. Un banner que no ofrece control real resta más confianza de la que suma.

**Recomendación.** Centro de preferencias con categorías, igual prominencia, reapertura desde el pie, 44 px, explicación de proveedores y conservación; enlazar privacidad y cookies.

### Bajos

> Higiene y gobernanza para evitar que la deuda vuelva a producir los fallos anteriores. — **2 hallazgos**

#### F-23 · Componentes y estilos muertos que confunden el sistema

*BAJO · Esfuerzo S · Higiene técnica · Criterio: mantenibilidad*

**Qué ocurre.** `GallerySection`, `HoverVideoPreview` y `PlanCard` no se usan. `galleryCards` se carga pero Home no lo consume. Se importan CSS de Swiper sin Swiper. El README habla de Router v6 mientras la dependencia es v7.18.4. Esta deuda explica parte de la deriva de marca y de estilos.

**Evidencia**

- `src/components/landing/GallerySection.tsx` · `HoverVideoPreview.tsx` · `src/components/membership/PlanCard.tsx` — sin importadores
- `src/main.tsx:6-8` — CSS de Swiper
- `README.md:44` vs `package.json:21` — versiones de Router

**Impacto.** Cada componente muerto es una versión más de la interfaz que alguien puede copiar por error. El CSS no usado añade peso y ruido.

**Recomendación.** Eliminar o reintegrar; actualizar documentación; comprobar imports muertos en CI; mantener una sola fuente de verdad para secciones y componentes.

#### F-24 · Gobernanza de marca y nombres internos divergentes

*BAJO · Esfuerzo S · Gobernanza · Criterio: consistencia de marca, prevención*

**Qué ocurre.** El nombre visible es VIVIPRESSONFIT; el paquete, claves de `localStorage`, comentarios y nombres de archivo usan VIVIPREFIT/VIVIFIT. El logo canónico no existe con el nombre que consume el código. No hay manifiesto de activos ni convención de nombres.

**Evidencia**

- `package.json:2-6` · `src/hooks/useLandingConfig.ts:166-186` — nombres legacy
- `public/landing/logo-vivifit.jpg` vs. `logo-vivipressonfit.jpg` — deriva de activos
- `src/lib/supabase.ts:24` — client info con nombre antiguo

**Impacto.** La deriva de nombres ya produjo al menos un fallo visible (F-01) y volverá a producirlo cuando se cambie un activo, una clave o un metadato.

**Recomendación.** Nombre canónico y aliases legacy; manifiesto de activos con ruta, dimensiones, alt y licencia; convención kebab-case; checklist de release; actualizar metadatos y documentación.

---

## 07 · Accesibilidad

### Criterios WCAG 2.2 AA

**Accesibilidad: los fallos que más cuestan corregir después**

La evaluación es de código, no una auditoría formal de conformidad. Aun así, hay patrones claros: el contraste de cuerpo es bueno, el foco global existe y varios componentes tienen buenas intenciones (etiquetas asociadas, roles de estado, pausa en el vídeo del método). Los problemas se concentran en movimiento, diálogos, encabezados, contraste de componentes y mensajes de formulario.

| Criterio | Estado | Evidencia | Corrección prioritaria |
| --- | --- | --- | --- |
| 1.3.1 Información y relaciones | ◐ PARCIAL | H1 móvil ausente; id duplicado; labels de admin sin asociación. | Un H1 por página; ids únicos; `htmlFor` / `id` en admin. |
| 1.4.3 Contraste mínimo | ✕ NO CUMPLE | Blanco sobre rosa 3,46:1 en textos pequeños. | Tinta oscura sobre rosa o rosa más profundo; revisar estados. |
| 1.4.11 Contraste de componentes | ✕ NO CUMPLE | Borde de campos 1,38:1 sobre superficie. | Borde de al menos 3:1; no depender solo del color. |
| 2.1.1 Teclado | ◐ PARCIAL | Visores sobre `div`; modales sin foco; menú móvil sin trampa. | Botones reales; diálogo con foco gestionado; menú como diálogo. |
| 2.2.2 Pausar, detener, ocultar | ✕ NO CUMPLE | Carrusel de 38 s, marquesinas y autoplay sin pausa. | Pausa visible y detención fuera de viewport. |
| 2.4.1 Evitar bloques | ✕ NO CUMPLE | No hay enlace "saltar al contenido". | Añadir skip link visible al enfocar. |
| 2.4.3 Orden del foco | ◐ PARCIAL | Modales y menú móvil no devuelven el foco. | Foco inicial, trampa y retorno al disparador. |
| 2.4.6 Encabezados y etiquetas | ◐ PARCIAL | Sin H1 móvil; footer salta a h4. | Jerarquía secuencial y encabezado principal único. |
| 2.4.7 Foco visible | ◐ PARCIAL | Anillo global correcto; admin usa borde de 1 px. | Mantener anillo de 2 px en todos los controles. |
| 3.3.1 Identificación de errores | ◐ PARCIAL | Errores globales, en inglés, sin campo asociado. | Error por campo, resumen y mensaje traducido. |
| 3.3.2 Etiquetas e instrucciones | ◐ PARCIAL | `Input` asocia label; admin no; falta ayuda de contraseña. | Label, hint y requisitos visibles antes de enviar. |
| 4.1.2 Nombre, rol, valor | ◐ PARCIAL | Iframe sin `title`; botones de icono con emoji/`title`. | Título de iframe y nombre accesible explícito. |
| 4.1.3 Mensajes de estado | ◐ PARCIAL | Éxitos y carga no se anuncian; botón "Cargando..." sin `aria-busy`. | `role="status"` / `aria-live` y estado del botón. |

**Lo que ya está bien.** Foco global visible; labels del componente `Input`; estados con texto además de color; pausa y `reduced motion` en `MetodoVideo`; `aria-expanded` en el acordeón de FAQ; `aria-live` en el contador de vídeos; `role="alert"` en algunos errores.

**Prueba mínima antes de lanzar.** Recorrer la compra solo con teclado; abrir y cerrar todos los modales con `Escape`; navegar con VoiceOver o NVDA en móvil y desktop; aplicar zoom al 200 %; activar movimiento reducido; verificar contraste de todos los estados.

> **Nota legal.** Si el Servicio se ofrece a consumidores en la Unión Europea, la European Accessibility Act exige accesibilidad en comercio electrónico desde junio de 2025. Este informe no es asesoría legal; conviene validar el alcance con asesoría especializada si aplica.

---

## 08 · Conversión y confianza

### De interés a confianza

**Conversión: el problema no es el deseo, es el siguiente paso**

No hay datos de analítica en el código revisado, así que este informe no asigna tasas de abandono. Lo que sí se puede leer es la secuencia de decisiones y los puntos donde la interfaz contradice la intención de la persona.

| Paso | Etapa | Qué ocurre | Fricción |
| --- | --- | --- | --- |
| 01 | Landing | Interés y prueba visual. | MARCA ROTA |
| 02 | Membresía | Oferta y confianza. | OFERTA DENSA |
| 03 | Registro | Cuenta y consentimiento. | ESTADO |
| 04 | Stripe | Pago y prueba. | ERRORES |
| 05 | Trial | Primer acceso. | ORIENTACIÓN |
| 06 | Miembro | Uso y renovación. | GESTIÓN |

Los riesgos son acumulativos: una marca rota en el primer paso reduce la credibilidad de todo lo que viene después; un estado contradictorio en el paso cuatro puede convertir una prueba en una disputa.

### Lo que falta para confiar

**Una oferta legible.** Precio, periodicidad, prueba y cancelación en un bloque que se entienda sin leer toda la página.

**Una marca que existe.** Logo real, metadatos correctos y una imagen de marca consistente en cabecera, pie y tarjeta social.

**Prueba social verificable.** Personas reales, consentimiento, contexto y ningún resultado de salud presentado como promesa.

**Un estado que no miente.** Si estás en prueba, la interfaz lo dice y no te ofrece empezar otra prueba; si estás activa, te deja gestionar.

**Un siguiente paso único.** Una acción primaria por viewport. El resto son enlaces secundarios, no seis botones que compiten.

**Una salida clara.** Cancelar, cambiar de plan y contactar soporte sin buscar en el pie ni abrir un modal sin foco.

### Bloque de oferta recomendado

Este es un ejemplo de jerarquía y copy, no una pantalla final. La idea es que precio y condiciones sean el centro, no una nota al pie.

> **MEMBRESÍA VIVIPRESSONFIT**
> **Todo el programa, un solo plan**
>
> Clases completas, rutinas de fuerza y guías de nutrición.
>
> **USD 40 / mes** después de la prueba
> **Hoy: USD 0**
> 7 días de acceso completo
> Cancelas antes del día 7 y no se realiza ningún cargo
> Renovación mensual; puedes cancelar cuando quieras
>
> Se solicitará un método de pago, pero no se cobrará hasta que termine la prueba.

El texto exacto debe validarse con la política real de Stripe, la moneda y los impuestos aplicables. No se recomienda usar urgencia falsa ni contadores de escasez.

### Léxico de CTA

| Situación | Hoy | Recomendado | Por qué |
| --- | --- | --- | --- |
| Visitante sin cuenta | Hazte miembro / Probar 7 días / Comenzar prueba | Empezar prueba de 7 días | Una promesa concreta, repetible en toda la web. |
| Contenido gratuito | Ver contenido gratis / Ver clases gratis | Ver clases gratis | Beneficio inmediato y específico. |
| Alumna en prueba | Comenzar 7 días de prueba | Convertir a plan de pago | No contradice el estado actual. |
| Miembro activa | Mi Plan | Mi plan | Nombre estable, sin ambigüedad de mayúsculas. |

---

## 09 · Sistema de diseño

### Diseño sistémico

**Un sistema visual que hoy se parece a una colección**

La paleta y las tipografías tienen una intención clara. Lo que falta es la capa que convierte esa intención en reglas: tokens, variantes y límites. Sin esa capa, cada pantalla resuelve el mismo problema de una forma distinta y la marca se desgasta.

| Elemento | Estado actual | Regla recomendada | Motivo |
| --- | --- | --- | --- |
| Color de acento | `#FF2E93` con blanco o casi negro según el componente. | Un único par accesible: tinta `#080709` sobre rosa, o rosa profundo con blanco. | Elimina la inconsistencia y asegura 4,5:1. |
| Superficies | `background`, `surface`, `raised` y blanco/negro hardcodeados. | Tres niveles: fondo, superficie, elevada; sin alfa ad hoc. | Jerarquía predecible. |
| Bordes | `#332836` a 1,38:1; algunos `blancos/10`. | Borde decorativo y borde interactivo separados; interactivo a 3:1. | Los campos se deben reconocer. |
| Radios | 8, 12, 16, 24, 28 px, píldora. | 8 para controles, 16 para tarjetas, píldora para acciones. | Tres reglas bastan. |
| Tipografía | Montserrat + Poppins; muchos extrabold; cuerpo 12-14 px. | Una display y una de lectura; cuerpo 16 px; tres pesos. | Legibilidad y jerarquía. |
| Iconos | SVG sueltos, flechas tipográficas y emojis funcionales. | Una familia de trazo, 24 px, 2 px de grosor; emoji solo como contenido. | Coherencia y nombre accesible. |
| Movimiento | Animaciones largas, marquesinas y Lenis global. | 150-250 ms para interacción; pausa para movimiento continuo; `reduced motion`. | Confort y percepción de calidad. |
| Estados | Verde, ámbar, rojo, azul, gris hardcodeados. | Tokens semánticos con texto e icono, no solo color. | Accesibilidad y consistencia. |

**Botones.** Tres variantes: primario, secundario y terciario. Altura mínima 44 px, etiqueta de acción y estado de carga que conserve el ancho. Nunca dos primarios en el mismo viewport.

**Campos.** Label visible, ayuda breve, error asociado y borde de 3:1. No usar placeholder como etiqueta. Mantener el valor tras un error y enfocar el primer campo inválido.

**Tarjetas de contenido.** Imagen con proporción declarada, categoría, título, duración, nivel y una acción. No usar el mismo bloque para un vídeo, una guía y un teaser bloqueado sin cambiar la affordance.

> **Regla de edición:** antes de añadir un componente nuevo, comprobar si ya existe una variante del mismo patrón. Si no existe, documentar su propósito, sus estados y su límite de uso. La consistencia no es estética: reduce decisiones y errores.

---

## 10 · Área privada

### Después de entrar

**Área privada: buena honestidad, poca orientación**

El dashboard y la biblioteca tienen una base sana: no inventan progreso, explican el estado de la membresía y ofrecen una salida a WhatsApp. El siguiente salto es convertir esa base en una rutina: qué hacer hoy, qué sigue y cómo retomar.

| Superficie | Fortaleza | Brecha | Recomendación |
| --- | --- | --- | --- |
| **Dashboard** | Saludo claro, estado del plan y explicación honesta de la ausencia de progreso. | "Últimas clases" no dice cuál es el siguiente paso; no hay continuidad. | "Tu siguiente clase" con duración, nivel y equipo; retomar la última solo si existe historial. |
| **Biblioteca de vídeos** | Buscador, filtros por categoría y ciclo, contador accesible. | Tarjetas sin miniatura real, duración ni nivel; no se filtra por modalidad. | Miniatura, duración, nivel, equipo y modalidad; filtros guardados en URL. |
| **Reproductor** | HLS firmado, control de expiración y soporte nativo. | Iframe sin título; error sin reintento; sin siguiente/anterior; sin subtítulos. | Título accesible, reintento, navegación entre clases y subtítulos/transcripción. |
| **Perfil** | Edición de nombre y contraseña, con estado visible. | Sin datos de plan, facturas, método de pago ni cambio de email; un solo estado de guardado. | Separar datos, seguridad y facturación; estado por formulario; enlace al portal de Stripe. |
| **Mi plan** | Estado, días de prueba y portal de gestión. | Comparte ruta con la venta; trial sin gestión clara; precios duplicados. | Ruta propia, resumen de próximo cargo, cancelación y facturas en un solo lugar. |

**Conservar:** la frase del dashboard que evita mostrar métricas inventadas. Es una decisión de producto valiosa. Cuando exista historial real, el progreso debe aparecer con una definición explícita ("clases completadas", "minutos vistos"), no como un porcentaje decorativo.

---

## 11 · Panel de administración

### Operación del producto

**Panel de administración: el coste oculto de publicar**

La administración no es una pantalla secundaria: es lo que permite que la membresía se renueve cada mes. Hoy el panel funciona como una colección de formularios largos. El equipo puede publicar, pero paga cada cambio con navegación, memoria y riesgo.

| Tarea | Experiencia actual | Modelo recomendado | Resultado esperado |
| --- | --- | --- | --- |
| Publicar una clase | Formulario de 641 líneas, gestor de bucket en un cajón, guardado único, sin preview. | Lista de contenido + editor lateral + preview + estados borrador/publicado. | Publicar en menos pasos y con menos miedo a romper la landing. |
| Cambiar el precio | Campo suelto con botón "Guardar" y mensaje con la clave interna. | Tarjeta de oferta con precio, moneda, prueba, impuestos y preview de copy. | Evitar inconsistencias entre landing, checkout y metadatos. |
| Gestionar un miembro | Tabla sin búsqueda, rol con "Retroceder" y sin confirmación. | Lista filtrable + ficha + acciones explícitas + confirmación + auditoría. | Reducir el riesgo de retirar permisos por error. |
| Editar la marca | Siete bloques apilados, resets locales y sin cambios sin guardar. | Secciones con navegación, barra sticky y estado sucio. | Editar sin perder cambios y sin recorrer 942 líneas. |
| Medir | Un gráfico de altas de seis meses. | KPIs con definición: altas, trials activos, conversión, cancelaciones, contenido publicado. | Decisiones basadas en el ciclo de membresía, no solo en altas. |

### Esquema conceptual del admin

El objetivo no es añadir más funciones, sino cambiar el modelo mental: de "editar campos" a "publicar y verificar". Este esquema muestra la jerarquía; no es una captura de la aplicación.

```text
Resumen                    Contenido del mes                 Vista previa
· Altas, trials, alertas   · Buscar · Filtrar · Ordenar      · Tarjeta pública y de miembro
· Contenido                · Semana 1 - GAP                  · Estado: Borrador
· Clases y guías           · Semana 1 - Full Body            · Guardar y publicar
· Biblioteca               · Guía de nutrición
· Marca                    · Precio y soporte
· Inicio y textos          · Planes y roles
· Ajustes                  · Semana 1 - GAP
```

*Esquema conceptual. No representa la interfaz actual ni un diseño final.*

**Reglas de seguridad operativa.** Confirmar acciones destructivas; explicar la consecuencia de un cambio de rol; mostrar un estado de guardado por sección; impedir salir con cambios sin guardar; registrar quién cambió un rol o publicó contenido.

**Reglas de eficiencia.** Búsqueda y filtros en listas; acciones masivas; duplicar contenido; preview antes de publicar; enlaces profundos a una pestaña; estados de carga y error visibles; mensajes con el nombre humano del campo, no con la clave técnica.

---

## 12 · Dispositivo y velocidad

### Responsive y rendimiento

| Ancho | Qué ocurre | Riesgo | Recomendación |
| --- | --- | --- | --- |
| **320-390 px** | Hero apilado; sin H1; CTA principal después de la imagen; banner de cookies de 36 px; menú sin bloqueo de scroll. | Fatiga y errores de toque en el primer contacto. | Resumen de oferta y CTA antes del contenido largo; menú dialog; targets 44 px. |
| **768-1023 px** | Hero y H1 mejoran, pero los anclajes secundarios siguen ocultos; el checkout aún no es sticky. | Transición brusca entre móvil y tablet. | Definir CTA y anclajes de un único breakpoint. |
| **1024 px** | Navbar completo; seis fotos en "Quién soy"; tabla de admin con scroll horizontal. | Fotos pequeñas y tabla incómoda. | Reducir a 4 columnas; tabla en tarjetas por debajo de 1100. |
| **1280 px+** | Se muestran los anclajes secundarios; el hero usa una tarjeta de 2xl. | Buena composición, pero la navegación cambia de contenido sin aviso. | Mantener el mismo mapa de navegación en todos los anchos. |

### Presupuesto de rendimiento propuesto

| Métrica | Objetivo | Qué revisar | Acción |
| --- | --- | --- | --- |
| LCP móvil | < 2,5 s en 4G | Hero, logo, fuentes, primer render del portal. | Preload del hero, dimensiones, prioridad de imagen, fuentes locales. |
| CLS | < 0,1 | Logo, testimonios, imágenes del carrusel y config remota. | `width`/`height`, `aspect-ratio`, esqueletos con el tamaño final. |
| INP | < 200 ms | Autoplay múltiple, marquesinas y scroll suave. | Menos vídeos activos, pausa fuera de viewport, Lenis condicionado. |
| Peso inicial | Definir presupuesto por ruta | CSS de Swiper sin uso, fuentes, JS de terceros. | Eliminar CSS muerto, dividir por ruta, revisar fuentes. |

No se midieron estas métricas en campo. Son objetivos de diseño y rendimiento, no resultados actuales.

> **Regla de activos:** cada imagen debe declarar proporción, tamaño intrínseco, texto alternativo y política de carga. Cada vídeo debe tener póster, pausa y una condición de reproducción. Un activo sin estas propiedades es una fuente futura de CLS o de movimiento no deseado.

---

## 13 · Contenido y microcopy

### Marca y lenguaje

**Contenido, confianza y coherencia de voz**

La interfaz promete cercanía, pero el lenguaje cambia de registro según la pantalla. También hay afirmaciones que necesitan contexto y activos que no existen. La corrección de contenido no es cosmética: es parte de la promesa de marca.

| Situación | Actual | Recomendado | Criterio |
| --- | --- | --- | --- |
| Registro | "Nueva Alumna" / "Ya tengo cuenta" | "Crear cuenta" / "Ya tengo cuenta" | Acción clara sin etiquetar a la persona antes de que elija. |
| Plan | "Membresía VIP" sin definición | "Membresía mensual" o definir qué significa VIP. | Evitar una categoría que no se explica. |
| Precio | "USD 40", "USD $40.-", "$40" | "USD 40 / mes" en toda la interfaz. | Formato único y legible. |
| Gestión | "Mi Plan" dentro de la página de venta | "Mi plan" como ruta y título propios. | Separar compra de administración. |
| Admin | "Seleccioná", "Bucket", "Landing" | "Selecciona", "Biblioteca de archivos", "Página de inicio". | Una persona gramatical y vocabulario comprensible. |
| Testimonios | Resultados sin contexto ni consentimiento | Historia real, periodo, punto de partida y descargo. | Confianza y responsabilidad. |
| Imagen de nutrición | `thumb-cardio.jpg` como imagen de nutrición | Imagen real de alimentación o ilustración propia. | Coherencia entre imagen y mensaje. |

**Reglas de contenido.** No publicar resultados de salud sin contexto; usar "puede" y "según tu punto de partida", no promesas; explicar la prueba y la cancelación en el mismo bloque; fechas y precios con formato único; revisar todos los textos legales contra la oferta real.

**Activos de confianza.** Logo real, retratos con consentimiento, foto de la coach coherente con la promesa, capturas reales del programa si se muestran, política de cancelación visible y un canal de soporte que responda.

> **Riesgo editorial:** los resultados individuales de salud o peso son material sensible. Si se mantienen, deben tener consentimiento, contexto y un descargo claro; si no se puede demostrar, es mejor retirarlos. La confianza no se construye con una cifra, sino con una historia verificable.

---

## 14 · Plan de acción 30 / 60 / 90

### Secuencia recomendada

El orden importa. Primero se elimina lo que destruye confianza; después se arreglan los estados que bloquean la compra; luego se pule la experiencia y se consolida el sistema. No se recomienda empezar por un rediseño visual.

### Ahora · 0-14 días — P0 y quick wins

1. Corregir logo, metadatos y fallback.
2. Ocultar o reparar testimonios.
3. Añadir H1 móvil único.
4. Legal.
5. Pausa visible en marquesinas y carrusel.
6. Corregir contraste de botones y bordes.

### Siguiente · 15-30 días — P1 de conversión y acceso

1. Separar venta de gestión y CTA por estado.
2. Bloquear checkout hasta hidratar membresía.
3. Hidratar perfil antes de redirigir.
4. Traducir errores y validar inline.
5. Unificar botones, iconos y CTA.
6. Precio desde una sola fuente.

### 30-60 días — P2 de experiencia

1. Simplificar la landing a 6-7 bloques.
2. Rediseñar el bloque de oferta y el checkout móvil.
3. Unificar diálogos y menú accesible.
4. Estados loading/error/empty y mensajes.
5. Reducir autoplay y limpiar activos.
6. Mejorar biblioteca y perfil.

### 60-90 días — P3 y consolidación

1. Rehacer el admin como flujo de publicación.
2. Gestión de miembros con búsqueda y auditoría.
3. Centro de preferencias de cookies.
4. Documentación de sistema de diseño.
5. Instaurar checklist de activos y release.
6. Medir y revisar con datos reales.

### Definición de "listo para lanzar"

- [ ] Logo, testimonios y metadatos de marca cargan correctamente en una instalación limpia.
- [ ] La portada móvil tiene un H1 y no hay enlaces internos muertos.
- [ ] Los anclajes no quedan ocultos por la cabecera fija.
- [ ] Todo movimiento continuo se puede pausar y respeta `reduced motion`.
- [ ] Los botones y campos cumplen contraste y foco visible.
- [ ] Una alumna en trial no ve un CTA para empezar otra prueba.
- [ ] Un acceso directo a `/dashboard` no rebota durante la carga del perfil.
- [ ] Los errores de formulario se entienden en español y señalan el campo.
- [ ] El precio es el mismo en landing, checkout, metadatos y pie.
- [ ] Un cambio de rol en admin pide confirmación y deja rastro.

**Qué no incluir en esta fase:** nuevos módulos de entrenamiento, gamificación, un tema claro, una app nativa o una reescritura completa. Nada de eso resuelve los bloqueos actuales y todos aumentan la superficie que hay que mantener.

---

## 15 · Medición

### Para no decidir a ciegas

**Qué medir después de corregir**

El código revisado no contiene una capa de analítica de producto. Antes de cambiar la interfaz conviene establecer una línea base; después, medir el mismo embudo y las mismas tareas. Sin datos, el rediseño se convierte en una opinión más elaborada.

| Métrica | Definición | Objetivo inicial | Uso |
| --- | --- | --- | --- |
| Interés en la oferta | Visitas a la landing que abren `/membresia`. | Establecer base; no fijar meta sin datos. | Claridad de la propuesta y CTA. |
| Inicio de registro | Personas que empiezan el formulario de cuenta. | Reducir abandono tras el primer campo. | Fricción de formulario. |
| Checkout iniciado | Sesiones que llegan a Stripe. | Aumentar la proporción respecto a registros. | Claridad de prueba y confianza. |
| Trial activado | Cuentas que completan la prueba. | Reducir fallos técnicos y dobles altas. | Estado de membresía y errores. |
| Conversión a pago | Trials que pasan a plan activo. | Comparar antes y después de la corrección de estado. | Valor real de la prueba. |
| Contactos de soporte | Mensajes por acceso, cobro o cancelación. | Reducir consultas repetidas. | Claridad de la interfaz y de la política. |
| Tiempo de publicación | Minutos desde abrir admin hasta publicar una clase. | Reducir y estandarizar. | Eficiencia del panel. |
| Accesibilidad | Tareas completadas con teclado y lector; incidencias críticas. | Cero bloqueos críticos en el recorrido de compra. | Calidad y riesgo legal. |

**Prueba cualitativa mínima.** Cinco personas del público objetivo, cinco tareas: entender la oferta, ver un adelanto, iniciar la prueba, encontrar una clase y cancelar. Observar dónde se detienen y qué palabras repiten.

**Guardarraíles.** No usar urgencia falsa; no ocultar el precio; no impedir cancelar; no pedir consentimiento con opciones engañosas; no publicar resultados de salud sin contexto. La conversión no justifica erosionar la confianza.

---

## 16 · Anexos

### A. Mapa de rutas

| Ruta | Acceso | Propósito | Observación |
| --- | --- | --- | --- |
| `/` | Público | Portal y adelantos | Sin H1 móvil; `/#galeria` muerto. |
| `/membresia` | Público | Venta y checkout | También muestra gestión; estado ambiguo. |
| `/login` | Público | Inicio de sesión | Redirección según perfil. |
| `/registro` | Público | Alta de cuenta | Mensajes de éxito como error. |
| `/recuperar` | Público | Recuperación | No valida enlace antes de enviar. |
| `/recuperar-password` | Público | Nueva contraseña | Sin estado de enlace inválido. |
| `/terminos` | Público | Legal | Padding superior insuficiente. |
| `/privacidad` | Público | Legal | Mismo layout. |
| `/cookies` | Público | Legal | Banner con control limitado. |
| `/aviso-legal` | Público | Legal | Mismo layout. |
| `/legal` | Público | Alias de términos | Ruta duplicada de contenido. |
| `/perfil` | Con sesión | Datos y contraseña | Sin facturación ni plan. |
| `/dashboard` | Membresía | Inicio de miembro | Estado de progreso honesto. |
| `/videos` | Membresía | Biblioteca | Filtros locales; sin deep link. |
| `/admin` | Admin | Panel | Cuatro pestañas en estado local. |
| `*` | Público | Fallback | Redirige al inicio sin 404. |

### B. Inventario de activos críticos

| Activo | Estado | Uso | Acción |
| --- | --- | --- | --- |
| `public/landing/logo-vivifit.jpg` | Existe | Logo real disponible | Usarlo o renombrarlo a la ruta canónica. |
| `logo-vivipressonfit.jpg` | No existe | Fallback de cabecera, pie y JSON-LD | Crear, renombrar o corregir la referencia. |
| `assets/testimonial-1..3.webp` | 1 byte | Retratos de testimonios | Reemplazar o retirar la sección. |
| `media/placeholder-1..2.*` | 1 byte | Placeholder | Eliminar si no se usan. |
| `landing/vivi.webp` | Existe | Hero | Mantener; declarar dimensiones. |
| `landing/hero-reel.mp4` | Existe | Banda de método | Buen patrón; conservar pausa y `reduced motion`. |
| Imágenes Unsplash en defaults | Externas | Galería no usada | Localizar o eliminar al retirar el componente muerto. |

### C. Archivos revisados

Se revisaron, entre otros: router, layouts, Navbar, Footer, Sidebar, Home, Hero, Sections, MetodoVideo, AboutMe, FeatureCarousel, PreviewCard, FreeVideoModal, SwiperWrapper, Membership, LoginForm, RegisterForm, ForgotPassword, ResetPassword, Dashboard, Videos, VideoCard, VideoList, VideoPlayer, Profile, Legal, Admin, ContentManager, LandingConfigEditor, MediaManager, MediaBucketManager, AnalyticsChart, StatusCard, MembershipBadge, PlanCard, Input, Button, Modal, CookieBanner, HaloBadge, hooks de configuración, autenticación, membresía, vídeos y carrusel, stores, tipos, datos de landing y contenido legal.

### D. Base del cálculo de contraste

| Combinación | Ratio | Uso | Lectura |
| --- | --- | --- | --- |
| `#9E95A3` sobre `#080709` | 6,97:1 | Texto secundario | Cumple AA para texto normal. |
| `#9E95A3` sobre `#131015` | 6,54:1 | Texto secundario en tarjetas | Cumple AA. |
| `#FF2E93` sobre `#080709` | 5,80:1 | Acento como texto | Cumple AA. |
| `#FFFFFF` sobre `#FF2E93` | 3,46:1 | Botones y pestañas | No cumple para texto normal; solo apto para texto grande. |
| `#080709` sobre `#FF2E93` | 5,80:1 | Alternativa de tinta sobre acento | Cumple AA. |
| `#332836` sobre `#131015` | 1,38:1 | Bordes de campos | No cumple 1.4.11 para componentes. |

**Conclusión de método.** Los ratios se calcularon con la fórmula de luminancia relativa de WCAG 2.x. No sustituyen una medición sobre la interfaz renderizada, pero permiten identificar pares que fallan por un margen amplio y deben corregirse en el token, no pantalla por pantalla.

---

*Auditoría UI/UX — VIVIPRESSONFIT · Documento de trabajo · 26 de octubre de 2026 · Revisión estática del frontend React. Elaborado para el equipo de producto.*

*No se modificó ningún archivo del proyecto original. Las referencias corresponden al código revisado. Sin métricas de campo ni certificación de conformidad.*
