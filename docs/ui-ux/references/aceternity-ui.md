# Extracto de documentación: Aceternity UI

Fecha de consulta: 11 de octubre de 2026.

Ficha resumida de documentación oficial; no sustituye los pasos completos de cada componente.

## Fuentes oficiales

- [Sitio y catálogo de componentes](https://ui.aceternity.com/)
- [CLI e instalación](https://ui.aceternity.com/docs/cli)
- [Utilidades requeridas](https://ui.aceternity.com/components/add-utilities)
- [Catálogo para agentes y LLMs](https://ui.aceternity.com/ai-recommendations)
- [Tarjetas](https://ui.aceternity.com/components/cards-free)

## Extracto útil

- Catálogo de componentes React/Tailwind con ejemplos de interacción, tarjetas y efectos; existen componentes gratuitos y contenido Pro, que deben distinguirse antes de planificar una integración.
- La documentación CLI usa el registro de shadcn y puede inicializar configuración y dependencias.
- Componentes concretos pueden requerir Motion, `clsx`, `tailwind-merge`, utilidades Tailwind y ajustes al `tailwind.config`.
- El catálogo oficial indica compatibilidad con React y Tailwind; cada componente tiene sus propios requerimientos. Revisarlos uno por uno evita instalar dependencias innecesarias.

## Aplicación a VIVIPREFIT

**Útil para:** inspiración de tarjetas con imagen, transiciones suaves y tratamiento visual del contenido de video.

**Riesgo de integración:** copiar un bloque grande o de pago puede arrastrar tokens, configuración y dependencias ajenas al proyecto. Las animaciones complejas pueden competir con la información de estado y la accesibilidad.

**Decisión recomendada:** tomar ideas visuales, no templates completos. En caso de implementar una pieza, revisar antes licencia, si es gratuito/Pro, dependencias, soporte de `prefers-reduced-motion`, teclado y funcionamiento con Tailwind 3.4.
