import { useEffect, useState, useCallback } from 'react';
import { listMemberMediaFiles } from '../lib/storage';
import { MediaItem } from '../types/MediaItem';

/**
 * Hook que carga los archivos multimedia del bucket `members-media`
 * excluyendo archivos del sistema/logo (como LOGO_VIVI.png) y aplicando
 * el filtro configurado desde el panel admin.
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
      const { items, error: storageErr } = await listMemberMediaFiles();
      if (storageErr) {
        setError(storageErr);
        setMedia([]);
        return;
      }

      // Excluir LOGO_VIVI.png y logos del sistema del carrusel
      const filteredFiles = items.filter((f) => {
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

      const mapped: MediaItem[] = filteredFiles.map((f) => {
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

      // Filtrar según el modo configurado en el panel admin ('all' | 'image' | 'video')
      const finalMedia =
        filterMode === 'all'
          ? mapped
          : mapped.filter((item) => item.type === filterMode);

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
