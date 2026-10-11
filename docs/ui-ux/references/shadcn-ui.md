# Extracto de documentación: shadcn/ui

Fecha de consulta: 11 de octubre de 2026.

Este archivo resume páginas oficiales para evaluación. No reproduce el manual completo.

## Fuentes oficiales

- [Repositorio y README](https://github.com/shadcn-ui/ui)
- [Sitio y componentes](https://ui.shadcn.com/)
- [Instalación en Vite](https://ui.shadcn.com/docs/installation/vite)
- [Instalación manual](https://ui.shadcn.com/docs/installation/manual)
- [Reglas de estilo](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md)

## Extracto útil

- shadcn/ui se presenta como código abierto personalizable para construir un sistema de componentes propio, no como una caja negra que se instala y ya determina toda la interfaz.
- La guía Vite contempla proyectos existentes y la incorporación de componentes de forma individual.
- Las guías actuales incluyen distintos caminos de instalación; algunas instrucciones de Tailwind 4 agregan configuración, tokens, utilidades y aliases. Hay que seleccionar la guía compatible con la versión real del proyecto.
- Sus recomendaciones de estilo favorecen colores semánticos, variantes de componentes y tokens coherentes; esto encaja con el uso de `Card`, `Button`, `text-text-secondary`, `surface` y `accent` que ya tiene VIVIPREFIT.

## Aplicación a VIVIPREFIT

**Útil para:** patrones de tarjeta de estado, tabs/filtros, diálogo de reproducción accesible y jerarquía consistente.

**Riesgo de integración:** el repositorio ya tiene componentes propios y no tiene el andamiaje completo de shadcn. Ejecutar `shadcn init` podría cambiar configuración de Tailwind/CSS y generar una segunda convención visual.

**Decisión recomendada:** usar su documentación como guía de accesibilidad y composición; reutilizar o adaptar únicamente patrones compatibles. No instalar componentes base duplicados ni cambiar la configuración global durante esta etapa.
