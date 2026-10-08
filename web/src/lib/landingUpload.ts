import { supabase } from './supabase';

// Subida de imágenes promocionales del landing a Supabase Storage (bucket "landing").
// El contenido de membresía NO se sube aquí: vive en servidores externos (Bunny Stream).

export const LANDING_BUCKET = 'landing';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Sube una imagen y devuelve su URL pública.
 * @param folder prefijo dentro del bucket, p.ej. "hero" o "educativo"
 */
export async function uploadLandingImage(file: File, folder = 'general'): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato no permitido. Usá JPG, PNG, WEBP, GIF o AVIF.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('La imagen supera 5 MB. Comprimila antes de subir.');
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(LANDING_BUCKET).upload(safeName, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    // Si el objeto ya existía o falló por política, propagar mensaje claro.
    throw new Error(`Error al subir: ${error.message}`);
  }

  const { data } = supabase.storage.from(LANDING_BUCKET).getPublicUrl(safeName);
  return data.publicUrl;
}

/** Elimina una imagen previamente subida (acepta URL pública completa o path relativo). */
export async function deleteLandingImage(urlOrPath: string): Promise<void> {
  const marker = `/object/public/${LANDING_BUCKET}/`;
  const idx = urlOrPath.indexOf(marker);
  const path = idx >= 0 ? urlOrPath.slice(idx + marker.length) : urlOrPath.replace(/^\/?${LANDING_BUCKET}\//, '');
  if (!path || path === urlOrPath && !urlOrPath.startsWith(`${LANDING_BUCKET}/`) && idx < 0) {
    // No es una URL del bucket propio (p.ej. un link externo): no se puede borrar.
    throw new Error('No es una imagen alojada en este sitio; solo podés quitar la referencia.');
  }
  const { error } = await supabase.storage.from(LANDING_BUCKET).remove([path]);
  if (error) throw new Error(`Error al eliminar: ${error.message}`);
}
