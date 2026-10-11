# Extracto de documentación: Magic UI

Fecha de consulta: 11 de octubre de 2026.

Ficha de investigación resumida; consultar las fuentes para instrucciones/versiones completas.

## Fuentes oficiales

- [Sitio principal](https://magicui.design/)
- [Repositorio de GitHub](https://github.com/magicuidesign/magicui)
- [Documentación de versión Tailwind 3](https://v3.magicui.design/docs)
- [Instalación manual de versión Tailwind 3](https://v3.magicui.design/docs/installation/manual)
- [Aviso de versiones heredadas](https://magicui.design/docs/legacy)

## Extracto útil

- Magic UI ofrece componentes y efectos React/TypeScript/Tailwind; muchos componentes animados incorporan Motion.
- La versión actual prioriza Tailwind 4 y React 19. El sitio oficial conserva una documentación heredada específica para proyectos Tailwind 3.
- La instalación manual documenta aliases, estilos base, configuración Tailwind y helper `cn`, por lo que no todos los componentes son plug-and-play en una aplicación con convenciones propias.
- Patrones como `Magic Card`, animación de entrada o una pequeña transición pueden aportar feedback, pero efectos de fondo y movimiento constante no son necesarios para las tareas de un miembro.

## Aplicación a VIVIPREFIT

**Útil para:** estados hover/focus de tarjetas, transición discreta al cargar contenido y pequeños detalles interactivos.

**Riesgo de integración:** mezclar ejemplos de la versión 4 con Tailwind 3 produce clases/configuraciones incompatibles; Motion agrega dependencia y peso.

**Decisión recomendada:** si se toma una referencia, usar la rama/documentación v3 y adaptar el patrón con CSS/Tailwind ya instalados. No agregar efectos animados ni paquetes durante la fase inicial.
