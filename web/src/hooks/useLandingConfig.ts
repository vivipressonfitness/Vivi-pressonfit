import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LANDING_CLASES } from '../data/landingMedia';

// Config editable desde el panel Admin (tabla landing_config: key -> value jsonb).
// Claves usadas por la landing, con defaults tomados del diseño EJEMPLO.
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

export interface ClaseItem {
  tag: string;
  title: string;
  desc: string;
  bunny_video_id: string | null;
  video_url: string | null;
  thumbnail_url?: string | null;
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
  // Lista de clases promocionales del landing: defaults locales hasta que el
  // admin publique la clave jsonb `clases_items` en landing_config.
  const [clases, setClases] = useState<ClaseItem[]>(LANDING_CLASES);
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
          if (row.key === 'clases_items') continue; // se procesa aparte (jsonb array)
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
        // clases_items → ClaseItem[] (acepta objeto jsonb o string JSON)
        const rawItems = rows.find((r) => r.key === 'clases_items')?.value;
        let items: unknown = rawItems;
        if (typeof rawItems === 'string') {
          try { items = JSON.parse(rawItems); } catch { items = null; }
        }
        const parsed = Array.isArray(items) ? (items as ClaseItem[]) : null;
        if (parsed && parsed.length > 0) setClases(parsed);

        setConfig(next);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { config, clases, loading };
}
