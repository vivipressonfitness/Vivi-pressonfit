import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getMemberMediaUrl } from '../lib/storage';
import { LANDING_CLASES, LANDING_EDUCATIVO } from '../data/landingMedia';
import { BASE_OFFER } from '../lib/offer';

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
  carousel_filter: 'all' | 'image' | 'video';
}

export interface PreviewItem {
  category: string;
  title: string;
  desc: string;
  bunny_video_id: string | null;
  video_url: string | null;
  thumbnail_url?: string | null;
  duration?: string | null;
  locked?: boolean;
}

/** @deprecated alias histórico de PreviewItem (campo `tag` → `category`). */
export type ClaseItem = PreviewItem & { tag?: string };

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
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1080&q=80',
    tag: 'Fuerza',
    title: 'Entrenamiento Estructurado',
    desc: 'Rutinas diseñadas progresivamente para desarrollar masa muscular y resistencia real.',
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
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1080&q=80',
    tag: 'Hábito',
    title: 'Comunidad & Constancia',
    desc: 'El respaldo diario para mantener la motivación y no abandonar.',
  },
  {
    id: 6,
    image_url: 'https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=1080&q=80',
    tag: 'Enfoque',
    title: 'Salud Integral y Postura',
    desc: 'Movilidad articular y técnica correcta para prevenir lesiones.',
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

export const DEFAULT_CONFIG: LandingConfig = {
  monthly_price: BASE_OFFER.monthlyPrice,
  whatsapp_number: '5493415888117',
  hero_title: 'Programa de Entrenamiento y',
  hero_title_sub: 'Estilo de Vida Saludable.',
  hero_sub:
    'Un método completo y dinámico que combina clases grabadas bajo demanda, rutinas de fuerza estructuradas para casa o gimnasio, educación alimentaria y soporte directo por WhatsApp.',
  pilares_title: 'Todo lo que incluye tu membresía',
  membresias_title: 'Tu Membresía Mensual Todo Incluido',
  hero_image: '/landing/vivi.webp',
  educacion_image: '/landing/thumb-cardio.jpg',
  logo_url: '/landing/logo-vivipressonfit.jpg',
  logo_height: 64,
  gallery_title: 'El Método VIVIPRESSONFIT en Acción',
  quien_soy_title: '¿Quién Soy?',
  quien_soy_subtitle: 'Tu Coach & Mentora',
  quien_soy_bio:
    '¡Hola! Soy Vivi. Mi enfoque no se basa en dietas extremas ni castigos, sino en construir fuerza, disciplina y bienestar paso a paso. Estoy aquí para acompañarte todos los días y darte las herramientas reales para transformar tu energía y tu físico.',
  carousel_filter: 'all',
};

const CONFIG_KEYS: Array<keyof LandingConfig> = [
  'monthly_price',
  'whatsapp_number',
  'hero_title',
  'hero_title_sub',
  'hero_sub',
  'pilares_title',
  'membresias_title',
  'hero_image',
  'educacion_image',
  'logo_url',
  'logo_height',
  'gallery_title',
  'quien_soy_title',
  'quien_soy_subtitle',
  'quien_soy_bio',
  'carousel_filter',
];

/** Función auxiliar para deduplicar recursos por título */
function dedupeItems(items: PreviewItem[]): PreviewItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = (item.title || '').trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseItems(raw: unknown): PreviewItem[] | null {
  if (!raw) return null;
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) return null;
    return dedupeItems(
      arr.map((x) => ({
        category: String(x.category ?? x.tag ?? 'Clase'),
        title: String(x.title ?? ''),
        desc: String(x.desc ?? ''),
        bunny_video_id: x.bunny_video_id ? String(x.bunny_video_id) : null,
        video_url: x.video_url ? String(x.video_url) : null,
        thumbnail_url: x.thumbnail_url ? String(x.thumbnail_url) : null,
        duration: x.duration ? String(x.duration) : null,
        locked: Boolean(x.locked),
      })),
    );
  } catch {
    return null;
  }
}

export function useLandingConfig(): {
  config: LandingConfig;
  clases: PreviewItem[];
  recursos: PreviewItem[];
  galleryCards: GalleryCardItem[];
  quienSoyImages: QuienSoyImageItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
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

  const [clases, setClases] = useState<PreviewItem[]>(() => dedupeItems(LANDING_CLASES));
  const [recursos, setRecursos] = useState<PreviewItem[]>(() => dedupeItems(LANDING_EDUCATIVO));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('landing_config')
        .select('key, value');

      if (dbError) {
        setError(`Aviso de configuración: ${dbError.message}`);
      }

      const rows = (data ?? []) as Array<{ key: string; value: unknown }>;
      const next: LandingConfig = { ...DEFAULT_CONFIG };

      for (const row of rows) {
        if (
          row.key === 'preview_clases' ||
          row.key === 'preview_recursos' ||
          row.key === 'clases_items' ||
          row.key === 'gallery_cards' ||
          row.key === 'quien_soy_images'
        ) {
          continue;
        }

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
            next.whatsapp_number =
              cleanWa && cleanWa !== '59178000000' ? cleanWa : '5493415888117';
          } else if (row.key === 'educacion_image' && val.includes('uxpilot-auth.appspot.com')) {
            next.educacion_image = '/landing/thumb-cardio.jpg';
          } else if (row.key === 'carousel_filter') {
            if (val === 'all' || val === 'image' || val === 'video') next.carousel_filter = val;
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
            if (typeof window !== 'undefined') {
              localStorage.setItem('vivifit_gallery_cards', JSON.stringify(parsed));
            }
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
            if (typeof window !== 'undefined') {
              localStorage.setItem('vivifit_quien_soy_images', JSON.stringify(parsed));
            }
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
      try {
        const { data: mcData, error: mcError } = await supabase
          .from('membership_content')
          .select('*')
          .eq('show_in_landing', true)
          .eq('is_published', true);

        if (!mcError && mcData && mcData.length > 0) {
          const resolveUrl = (val: string | null | undefined) => {
            if (!val) return null;
            if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/landing/')) {
              return val;
            }
            return getMemberMediaUrl(val);
          };

          const validTeasers = mcData.filter((m) => Boolean(m.preview_video_url || m.thumbnail_url));
          if (validTeasers.length > 0) {
            const dynamicItems: PreviewItem[] = validTeasers.map((m) => ({
              category: m.category || 'Clase',
              title: m.title,
              desc: m.description
                ? m.description.length > 120
                  ? `${m.description.slice(0, 117)}…`
                  : m.description
                : '',
              bunny_video_id: null,
              video_url: resolveUrl(m.preview_video_url),
              thumbnail_url: resolveUrl(m.thumbnail_url || (m.preview_video_url ? null : m.storage_path)),
              duration: m.preview_duration || 'Adelanto gratis',
              locked: false,
            }));

            // Deduplicación para asegurar que no se repitan títulos
            setClases(dedupeItems(dynamicItems));
          }
        }
      } catch (e) {
        console.warn('No se pudieron cargar muestras dinámicas de membership_content:', e);
      }

      // Recursos educativos gratis
      const parsedRecursos = parseItems(rows.find((r) => r.key === 'preview_recursos')?.value);
      if (parsedRecursos) setRecursos(parsedRecursos);

      setConfig(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vivifit_landing_config', JSON.stringify(next));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    clases,
    recursos,
    galleryCards,
    quienSoyImages,
    loading,
    error,
    refetch: fetchConfig,
  };
}
