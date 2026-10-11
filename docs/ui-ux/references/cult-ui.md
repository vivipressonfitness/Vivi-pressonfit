# Extracto de documentación: Cult UI

Fecha de consulta: 11 de octubre de 2026.

Este archivo es una ficha de referencia resumida, no una copia integral de la documentación original. Los enlaces oficiales contienen los ejemplos y versiones vigentes.

## Fuentes oficiales

- [Repositorio y README](https://github.com/nolly-studio/cult-ui)
- [Instalación manual](https://www.cult-ui.com/docs/installation/manual)
- [Theming](https://www.cult-ui.com/docs/theming)
- [Componentes](https://www.cult-ui.com/docs/components)

## Extracto útil

- Catálogo de componentes y patrones visuales para React, Tailwind y Motion; el repositorio declara licencia MIT para el proyecto abierto.
- Los componentes se distribuyen como código fuente por medio del registro de shadcn. Se copian al repositorio de la aplicación y luego se adaptan.
- La documentación actual de instalación manual se basa en Tailwind CSS 4, tokens CSS compatibles con shadcn, el helper `cn`, alias de importación y dependencias específicas por componente.
- Los tokens descritos incluyen fondo, superficie de tarjeta, borde, texto atenuado, foco, acento y radio. La recomendación útil es adaptar estos conceptos a los tokens VIVIPREFIT, no reemplazar la paleta existente.
- Los efectos de luz, borde animado y hover son decorativos. Para una pantalla de suscriptor conviene limitar el movimiento y mantener la lectura del estado y las acciones como prioridad.

## Aplicación a VIVIPREFIT

**Útil para:** inspiración de tarjeta principal de membresía, superficies en capas, jerarquía de títulos/descrición y estados visuales.

**No integrar directamente en bloque:** el proyecto existente usa React 18, Tailwind 3.4.19 y componentes propios; la guía actual de Cult UI supone Tailwind 4 y convenciones shadcn. La instalación CLI puede editar configuración, estilos globales y dependencias.

**Decisión recomendada:** tomar referencias visuales y reescribir la pieza necesaria usando `Card`, `Button` y clases/tokens ya existentes. No ejecutar `shadcn init`, no migrar Tailwind y no agregar Motion durante la primera fase UI.
