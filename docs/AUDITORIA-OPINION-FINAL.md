# Opinión final sobre la auditoría de VIVIPREFIT

**Fecha:** 14 de octubre de 2026  
**Alcance de esta opinión:** contraste del informe recibido con el checkout local disponible en `web/` y la confirmación del propietario de que el repositorio GitHub enlazado es público. No se modificó la aplicación.

## Dictamen

La auditoría recibida es amplia y útil como hoja de ruta, pero sus resultados de ejecución y los cambios que dice haber agregado **no corresponden al estado actual de este checkout**. Aquí no hay configuración ni pruebas de Vitest, el build local no se completó por un error de acceso a un archivo temporal de esbuild, y este entorno no verificó `npm audit`. Por tanto, tomo los hallazgos técnicos que confirmé localmente como evidencia; los demás quedan como afirmaciones del informe pendientes de reproducir en el commit exacto que lo generó.

El punto más urgente ya no es hipotético: el propietario confirmó que el repositorio enlazado es **público**, y hay **9 archivos MP4, unos 13,6 MB, versionados bajo `web/src/components/video/`**. Uno de ellos se llama `contenido_vip.mp4`. Los objetos están en el historial Git; cualquier persona puede obtenerlos mediante el repositorio/clon y la regla de `.gitignore` no los retira. Esto constituye exposición pública de medios si ese contenido no estaba destinado a distribución abierta. No pude recuperar la página de GitHub directamente por un fallo de caché de navegación; la confirmación de visibilidad viene del propietario y la presencia de blobs se verificó en el checkout con Git.

## Qué pude corroborar

- `web/package.json` no declara `test`, `test:watch` ni dependencias de Vitest/Testing Library, y no encontré los archivos de test descritos en el informe. El informe puede haber sido generado desde otra rama, copia o commit.
- `npm run lint` y `npm run typecheck` pasan al ejecutarlos con `npm.cmd`.
- `npm run build` supera TypeScript y transforma 143 módulos, pero Vite falla al borrar un archivo temporal de esbuild en `%TEMP%` con `Acceso denegado`. No es evidencia de un error de compilación del producto, pero tampoco permite afirmar que el build de este checkout esté validado.
- La rama/copia observada no muestra cambios locales (`git status` limpio).
- Los MP4 están trackeados. El total medido es 13,6 MB en 9 archivos, alineado en cantidad con los “9 videos” del informe; el informe indicó ~16 MB, posiblemente por distinta revisión o redondeo/alcance.
- `bunny-token` sí devuelve `Access-Control-Allow-Origin: *`. También verifica sesión y estado de acceso en servidor. CORS abierto no reemplaza esa autorización, aunque una allowlist de orígenes reduce quién puede invocar la función desde navegadores; no es una barrera contra clientes no navegador.
- `vercel.json` no configura cabeceras HTTP de seguridad. `index.html` carga Google Fonts desde `fonts.googleapis.com` antes de cualquier consentimiento. Los datos de membresía y rutas sensibles se deben seguir protegiendo en RLS/Edge Functions; `ProtectedRoute` se describe correctamente como control de UX.
- La ruta de Videos ya tiene búsqueda y filtros locales, y el modal genérico ya implementa Escape y una trampa básica de foco. Aun así, el control, el anuncio accesible y el foco inicial/restaurado merecen verificación manual.
- `hls.js` se declara como chunk manual separado. El informe indica que supera 500 kB; esa cifra y el gzip reportado deben reproducirse con un build exitoso de la misma revisión antes de priorizar optimizaciones.

## Mi valoración del plan

El orden propuesto es razonable: primero resolver la exposición potencial del material, luego fortalecer la verificación continua y, después, abordar rendimiento y accesibilidad. Mantendría el plan UI-only existente para Mi Plan, Videos y Dashboard como carril separado. En particular, no mezclaría cambios de CORS, cabeceras, almacenamiento de medios o APIs con una entrega visual.

Algunas recomendaciones necesitan ajuste antes de ejecutarse:

1. **Medios trackeados en repo público:** tratar como incidente de exposición de contenido y clasificar de inmediato los 9 MP4. Si son VIP, detener su publicación y migrar los originales a almacenamiento privado/streaming autorizado. Retirar archivos del tip actual evita que sigan en la rama principal, pero no borra los blobs históricos; purgar el historial requiere respaldo, coordinación y reescritura de referencias. Si algún medio incluye credenciales o datos personales (no verificado), revocar/rotar las credenciales y atender el proceso correspondiente.
2. **CORS:** fijar orígenes esperados y probar preflight/producción. CORS es una política del navegador, no autenticación ni autorización; la validación de sesión, membresía y autorización de recursos sigue siendo obligatoria.
3. **CSP y cabeceras:** introducir una política inicialmente en modo report-only o con pruebas en preview. La app usa Supabase, Stripe, Bunny y Google Fonts; una CSP estricta mal configurada puede romper login, pago, embeds o reproducción. Revisar compatibilidad de `frame-src`, `connect-src`, `img-src`, `media-src` y scripts antes de forzarla.
4. **Checkout exitoso:** el parámetro `checkout=success` confirma el retorno desde Stripe, pero no necesariamente que el webhook ya haya actualizado la membresía. Un mensaje de UI debe describir el pago como “procesándose/verificando” o esperar el estado real, sin conceder acceso en el cliente.
5. **Dependencias:** verificar árbol instalado y avisos de auditoría en el lockfile exacto. Las versiones declaradas como rangos no prueban por sí mismas que estén obsoletas o vulnerables.
6. **Objetivos de Lighthouse:** medir una línea base por ruta y dispositivo antes de fijar umbrales; usar presupuestos graduales para evitar objetivos arbitrarios o frágiles.

## Prioridades que recomiendo

| Prioridad | Acción | Criterio de cierre |
|---|---|---|
| P0 | Clasificar los 9 MP4 trackeados en el repo público; confirmar cuáles son VIP/sensibles y mover el contenido restringido a un origen privado autorizado. Preparar plan para limpiar historia si aplica. | Inventario por archivo, exposición detenida en la rama publicada y decisión coordinada sobre historial/cachés/clones. |
| P1 | Reproducir el estado exacto del informe: commit/branch, `npm ci`, test, lint, typecheck, build y `npm audit` con salida guardada. | Evidencia vinculada a un SHA concreto y discrepancias resueltas. |
| P1 | Añadir suite unitaria mínima y CI si se confirma que sigue ausente en la rama objetivo. | Pruebas reproducibles en CI sin tocar reglas de negocio. |
| P2 | Preparar allowlist CORS para la función Bunny y revisar cabeceras de producción/CSP en preview. | Flujos válidos comprobados y política desplegable sin bloquear integraciones. |
| P2 | Hacer mediciones de LCP/CLS, tamaño de medios y bundle por ruta; optimizar recursos identificados. | Comparación antes/después en landing y área privada. |
| P3 | Ejecutar fases de accesibilidad y micro-UX con pruebas de teclado, lector de pantalla y viewport. | Checklist WCAG relevante y flujos actuales preservados. |

## Conclusión

La recomendación principal se confirma: el repo es público y los 9 MP4 están dentro de su historial. **Clasificar y contener esos medios es P0.** El resto del plan es sensato como propuesta, pero las pruebas, auditorías de dependencias y métricas de bundle deben asociarse a un commit reproducible antes de considerarlas evidencia del estado actual. Separaría el saneamiento de medios y las comprobaciones de seguridad de la iniciativa UI/UX, y mantendría intactas las reglas de acceso y los flujos de autenticación, membresía, Stripe y reproducción.
