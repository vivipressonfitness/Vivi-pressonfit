import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LANDING_CLASES, LANDING_EDUCATIVO } from '../data/landingMedia';

// Config editable desde el panel Admin (tabla landing_config: key -> value jsonb).
// Claves usadas por la landing tipo PORTAL, con defaults tomados del diseño EJEMPLO.
export interface LandingConfig {
  monthly_price: number;
  whatsapp_number: string;
  hero_title: string;
  hero_title_sub: string;
  hero_sub: string;
  pilares_title: string;
  membresias_title: string;
  hero_image: string;
  educacion_image: string;
}

// Item de contenido GRATIS del portal público (adelanto de la membresía).
export interface PreviewItem {
  category: string;      // categoría/etiqueta (ej. "Firmeza", "Nutrición")
  title: string;
  desc: string;
  bunny_video_id: string | null; // HLS público vía Bunny Stream
  video_url: string | null;      // mp4 local (/landing/...) o embed YouTube/Vimeo
  thumbnail_url?: string | null;
  duration?: string | null;      // ej. "19s · adelanto"
  locked?: boolean;              // true → se muestra como "solo miembros" (sin reproducir)
}

/** @deprecated alias histórico de PreviewItem (campo `tag` → `category`). */
export type ClaseItem = PreviewItem & { tag?: string };

// Convierte items legados ({tag}) al formato portal ({category}).
function normalizeItem(raw: Record<string, unknown>): PreviewItem {
  return {
    category: (raw.category as string) ?? (raw.tag as string) ?? 'Clase',
    title: (raw.title as string) ?? '',
    desc: (raw.desc as string) ?? '',
    bunny_video_id: (raw.bunny_video_id as string) ?? null,
    video_url: (raw.video_url as string) ?? null,
    thumbnail_url: (raw.thumbnail_url as string) ?? null,
    duration: (raw.duration as string) ?? null,
    locked: Boolean(raw.locked),
  };
}

function parseItems(value: unknown): PreviewItem[] | null {
  let items: unknown = value;
  if (typeof value === 'string') {
    try {
      items = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(items) || items.length === 0) return null;
  return items.map((i) => normalizeItem(i as Record<string, unknown>));
}

export const DEFAULT_CONFIG: LandingConfig = {
  monthly_price: 40,
  whatsapp_number: '59178000000',
  hero_title: 'Programa de Entrenamiento y',
  hero_title_sub: 'Estilo de Vida Saludable.',
  hero_sub:
    'Un método completo y dinámico que combina clases grabadas bajo demanda, rutinas de fuerza estructuradas para casa o gimnasio, educación alimentaria y soporte directo por WhatsApp.',
  pilares_title: 'Todo lo que incluye tu membresía',
  membresias_title: 'Tu Membresía Mensual Todo Incluido',
  // Imagen local del repo (web/public/landing) — reemplazable desde Admin con una URL externa.
  hero_image: '/landing/coach-whatsapp.jpg',
  educacion_image:
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_bcbde05bb8_c9ad26c2d0ca8065.png',
};

const CONFIG_KEYS = Object.keys(DEFAULT_CONFIG) as Array<keyof LandingConfig>;

export function useLandingConfig() {
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG);
  // Adelantos gratuitos del portal: defaults locales (landingMedia.ts) hasta que
  // el admin publique las claves jsonb `preview_clases` / `preview_recursos`.
  const [clases, setClases] = useState<PreviewItem[]>(LANDING_CLASES);
  const [recursos, setRecursos] = useState<PreviewItem[]>(LANDING_EDUCATIVO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    supabase
      .from('landing_config')
      .select('key, value')
      .then(({ data }) => {
        if (!alive) return;
        const rows = (data ?? []) as Array<{ key: string; value: unknown }>;
        const next: LandingConfig = { ...DEFAULT_CONFIG };
        for (const row of rows) {
          // Las claves de listas jsonb se procesan aparte.
          if (row.key === 'preview_clases' || row.key === 'preview_recursos' || row.key === 'clases_items') continue;
          if ((CONFIG_KEYS as string[]).includes(row.key)) {
            const raw = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
            // La SPA vanilla guardaba valores planos en jsonb; tolerar ambos formatos.
            const val = raw.replace(/^"|"$/g, '');
            if (!val) continue;
            if (row.key === 'monthly_price') {
              const n = Number(val);
              if (!Number.isNaN(n)) next.monthly_price = n;
            } else {
              (next as unknown as Record<string, string>)[row.key] = val;
            }
          }
        }
        // Adelantos de clases: `preview_clases` (nuevo) con fallback a `clases_items` (legado).
        const rawClases =
          rows.find((r) => r.key === 'preview_clases')?.value ??
          rows.find((r) => r.key === 'clases_items')?.value;
        const parsedClases = parseItems(rawClases);
        if (parsedClases) setClases(parsedClases);

        // Recursos educativos gratis: `preview_recursos`.
        const parsedRecursos = parseItems(rows.find((r) => r.key === 'preview_recursos')?.value);
        if (parsedRecursos) setRecursos(parsedRecursos);

        setConfig(next);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { config, clases, recursos, loading };
}
