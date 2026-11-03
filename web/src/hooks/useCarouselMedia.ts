import { useEffect, useState, useCallback } from 'react';
import { listMemberMediaFiles } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { MediaItem } from '../types/MediaItem';

interface BunnyCarouselEntry {
  id?: string;
  videoId: string;
  title?: string;
}

const BUNNY_LIBRARY_ID = '796132';

/**
 * Hook que carga los archivos multimedia del carrusel "Viví la Experiencia":
 * - Archivos del bucket `members-media` (excluyendo logos como LOGO_VIVI.png).
 * - Videos públicos de Bunny Stream configurados en `landing_config` (`carousel_bunny_videos`).
 * - Aplica el filtro configurado desde el panel admin ('all' | 'image' | 'video').
 * Incluye estado de error y función refetch para máxima resiliencia.
 */
export function useCarouselMedia(
  filterMode: 'all' | 'image' | 'video' = 'all'
): {
  media: MediaItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Cargar archivos del bucket members-media
      const { items, error: storageErr } = await listMemberMediaFiles();
      if (storageErr) {
        console.warn('Aviso de storage en carrusel:', storageErr);
      }

      // Excluir LOGO_VIVI.png y logos del sistema del carrusel
      const filteredFiles = (items || []).filter((f) => {
        const nameLower = (f.name || '').toLowerCase();
        const pathLower = (f.path || '').toLowerCase();
        const urlLower = (f.publicUrl || '').toLowerCase();

        if (
          nameLower === 'logo_vivi.png' ||
          nameLower.includes('logo_vivi') ||
          pathLower.includes('logo_vivi') ||
          urlLower.includes('logo_vivi')
        ) {
          return false;
        }
        return true;
      });

      const bucketItems: MediaItem[] = filteredFiles.map((f) => {
        const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
        const type: MediaItem['type'] =
          ext === 'mp4' || ext === 'webm' || ext === 'mov' || ext === 'm4v'
            ? 'video'
            : 'image';
        return {
          id: f.path,
          type,
          src: f.publicUrl,
          alt: f.name,
        };
      });

      // 2. Cargar videos de Bunny Stream configurados en landing_config (carousel_bunny_videos)
      let bunnyItems: MediaItem[] = [];
      try {
        const { data: configRow } = await supabase
          .from('landing_config')
          .select('value')
          .eq('key', 'carousel_bunny_videos')
          .maybeSingle();

        if (configRow?.value) {
          let rawEntries: BunnyCarouselEntry[] = [];
          if (typeof configRow.value === 'string') {
            try {
              rawEntries = JSON.parse(configRow.value);
            } catch {
              rawEntries = [];
            }
          } else if (Array.isArray(configRow.value)) {
            rawEntries = configRow.value as BunnyCarouselEntry[];
          }

          bunnyItems = rawEntries
            .filter((entry) => Boolean(entry.videoId && entry.videoId.trim()))
            .map((entry) => {
              const cleanId = entry.videoId.trim();
              return {
                id: entry.id || `bunny-${cleanId}`,
                type: 'video' as const,
                bunnyVideoId: cleanId,
                src: `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${cleanId}?autoplay=true&loop=true&muted=true&controls=false&preload=true`,
                thumbnail: `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${cleanId}/thumbnail.jpg`,
                alt: entry.title || 'Video de la comunidad Viví Press On Fit',
              };
            });
        }
      } catch (err) {
        console.warn('No se pudieron cargar videos de Bunny Stream para el carrusel:', err);
      }

      // Combinar videos de Bunny y elementos del Bucket
      const combined: MediaItem[] = [...bunnyItems, ...bucketItems];

      // Filtrar según el modo configurado en el panel admin ('all' | 'image' | 'video')
      const finalMedia =
        filterMode === 'all'
          ? combined
          : combined.filter((item) => item.type === filterMode);

      setMedia(finalMedia);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la galería');
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  useEffect(() => {
    void loadMedia();
  }, [loadMedia]);

  return { media, loading, error, refetch: loadMedia };
}
