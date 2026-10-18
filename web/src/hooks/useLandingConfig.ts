import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getMemberMediaUrl } from '../lib/storage';
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
  logo_url: string;
  logo_height: number;
  gallery_title: string;
  quien_soy_title: string;
  quien_soy_subtitle: string;
  quien_soy_bio: string;
}

export interface GalleryCardItem {
  id: number;
  image_url: string;
  tag: string;
  title: string;
  desc: string;
}

export interface QuienSoyImageItem {
  id: number;
  image_url: string;
  caption: string;
}

export const DEFAULT_GALLERY_CARDS: GalleryCardItem[] = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1080&q=80',
    tag: 'Fuerza 3x',
    title: 'Entrenamientos Guiados',
    desc: 'Rutinas planificadas con progresión semanal para casa o gimnasio.',
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1080&q=80',
    tag: 'Firmeza',
    title: 'Tonificación & GAP',
    desc: 'Clases completas enfocadas en glúteos, abdomen y piernas.',
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&w=1080&q=80',
    tag: 'Energía',
    title: 'Cardio HIIT Activo',
    desc: 'Sesiones dinámicas para acelerar el metabolismo y quemar calorías.',
  },
  {
    id: 4,
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1080&q=80',
    tag: 'Nutrición',
    title: 'Educación Alimentaria',
    desc: 'Aprende a nutrir tu cuerpo con balance y sin dietas restrictivas.',
  },
  {
    id: 5,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1080&q=80',
    tag: 'Comunidad',
    title: 'Acompañamiento VIP',
    desc: 'Soporte y motivación constante directamente por WhatsApp.',
  },
  {
    id: 6,
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1080&q=80',
    tag: 'Resultados',
    title: 'Constancia y Evolución',
    desc: 'Un estilo de vida sostenible que disfrutarás mantener cada día.',
  },
];

export const DEFAULT_QUIEN_SOY_IMAGES: QuienSoyImageItem[] = [
  { id: 1, image_url: '/landing/gallery/1.jpg', caption: 'Fuerza y Técnica' },
  { id: 2, image_url: '/landing/gallery/2.jpg', caption: 'Constancia Diaria' },
  { id: 3, image_url: '/landing/gallery/3.jpg', caption: 'Energía y Motivación' },
  { id: 4, image_url: '/landing/gallery/4.jpg', caption: 'Estilo de Vida' },
  { id: 5, image_url: '/landing/gallery/5.jpg', caption: 'Acompañamiento Cercano' },
  { id: 6, image_url: '/landing/gallery/6.jpg', caption: 'Entrenando con Propósito' },
];

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
  whatsapp_number: '5493415888117',
  hero_title: 'Programa de Entrenamiento y',
  hero_title_sub: 'Estilo de Vida Saludable.',
  hero_sub:
    'Un método completo y dinámico que combina clases grabadas bajo demanda, rutinas de fuerza estructuradas para casa o gimnasio, educación alimentaria y soporte directo por WhatsApp.',
  pilares_title: 'Todo lo que incluye tu membresía',
  membresias_title: 'Tu Membresía Mensual Todo Incluido',
  // Imagen local del repo (web/public/landing) — reemplazable desde Admin con una URL externa.
  hero_image: '/landing/vivi.webp',
  educacion_image:
    'https://storage.googleapis.com/uxpilot-auth.appspot.com/gen_bcbde05bb8_c9ad26c2d0ca8065.png',
  logo_url: '/landing/logo-vivipressonfit.jpg',
  logo_height: 64,
  gallery_title: 'El Método VIVIPRESSONFIT en Acción',
  quien_soy_title: '¿Quién Soy?',
  quien_soy_subtitle: 'Tu Coach & Mentora',
  quien_soy_bio:
    '¡Hola! Soy Vivi. Mi enfoque no se basa en dietas extremas ni castigos, sino en construir fuerza, disciplina y bienestar paso a paso. Estoy aquí para acompañarte cada día y guiarte a lograr la mejor versión de ti misma.',
};

const CONFIG_KEYS = Object.keys(DEFAULT_CONFIG) as Array<keyof LandingConfig>;

export function useLandingConfig() {
  // Inicialización inmediata desde localStorage para evitar salto/transición visual al cargar
  const [config, setConfig] = useState<LandingConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vivifit_landing_config');
        if (cached) return { ...DEFAULT_CONFIG, ...JSON.parse(cached) };
      } catch {}
    }
    return DEFAULT_CONFIG;
  });

  const [galleryCards, setGalleryCards] = useState<GalleryCardItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vivifit_gallery_cards');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_GALLERY_CARDS;
  });

  const [quienSoyImages, setQuienSoyImages] = useState<QuienSoyImageItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vivifit_quien_soy_images');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_QUIEN_SOY_IMAGES;
  });

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
          if (row.key === 'preview_clases' || row.key === 'preview_recursos' || row.key === 'clases_items' || row.key === 'gallery_cards' || row.key === 'quien_soy_images') continue;
          if ((CONFIG_KEYS as string[]).includes(row.key)) {
            const raw = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
            const val = raw.replace(/^"|"$/g, '');
            if (!val) continue;
            if (row.key === 'monthly_price') {
              const n = Number(val);
              if (!Number.isNaN(n)) next.monthly_price = n;
            } else if (row.key === 'logo_height') {
              const n = Number(val);
              if (!Number.isNaN(n) && n > 0) next.logo_height = n;
            } else if (row.key === 'gallery_title') {
              next.gallery_title = val.replace(/VIVIFIT/gi, 'VIVIPRESSONFIT');
            } else if (row.key === 'whatsapp_number') {
              const cleanWa = val.replace(/\D/g, '');
              next.whatsapp_number = cleanWa && cleanWa !== '59178000000' ? cleanWa : '5493415888117';
            } else {
              (next as unknown as Record<string, string>)[row.key] = val;
            }
          }
        }

        // Galería de 6 fotos (El Método)
        const rawGallery = rows.find((r) => r.key === 'gallery_cards')?.value;
        if (rawGallery) {
          try {
            const parsed = typeof rawGallery === 'string' ? JSON.parse(rawGallery) : rawGallery;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setGalleryCards(parsed);
              if (typeof window !== 'undefined') localStorage.setItem('vivifit_gallery_cards', JSON.stringify(parsed));
            }
          } catch {}
        }

        // Galería ¿Quién Soy? (Fotos 1-6 de Vivi)
        const rawQuienSoy = rows.find((r) => r.key === 'quien_soy_images')?.value;
        if (rawQuienSoy) {
          try {
            const parsed = typeof rawQuienSoy === 'string' ? JSON.parse(rawQuienSoy) : rawQuienSoy;
            if (Array.isArray(parsed) && parsed.length > 0) {
              setQuienSoyImages(parsed);
              if (typeof window !== 'undefined') localStorage.setItem('vivifit_quien_soy_images', JSON.stringify(parsed));
            }
          } catch {}
        }

        // Adelantos de clases (desde landing_config o por defecto)
        const rawClases =
          rows.find((r) => r.key === 'preview_clases')?.value ??
          rows.find((r) => r.key === 'clases_items')?.value;
        const parsedClases = parseItems(rawClases);
        if (parsedClases) setClases(parsedClases);

        // Si existen programas con show_in_landing = true en membership_content, integrarlos
        supabase
          .from('membership_content')
          .select('*')
          .eq('show_in_landing', true)
          .then(({ data: mcData, error: mcError }) => {
            if (!alive || mcError || !mcData || mcData.length === 0) return;
            const resolveUrl = (val: string | null | undefined) => {
              if (!val) return null;
              if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/landing/')) return val;
              return getMemberMediaUrl(val);
            };

            const dynamicItems: PreviewItem[] = mcData.map((m) => ({
              category: m.category || 'Clase',
              title: m.title,
              desc: m.description || '',
              bunny_video_id: m.bunny_video_id,
              video_url: resolveUrl(m.preview_video_url || m.content_url || m.storage_path),
              thumbnail_url: resolveUrl(m.thumbnail_url || (m.preview_video_url ? null : m.storage_path)),
              duration: m.preview_duration || 'Adelanto gratis',
              locked: false,
            }));
            setClases(dynamicItems);
          });

        // Recursos educativos gratis
        const parsedRecursos = parseItems(rows.find((r) => r.key === 'preview_recursos')?.value);
        if (parsedRecursos) setRecursos(parsedRecursos);

        setConfig(next);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vivifit_landing_config', JSON.stringify(next));
        }
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { config, clases, recursos, galleryCards, quienSoyImages, loading };
}
