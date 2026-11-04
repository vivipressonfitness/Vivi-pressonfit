import { useEffect, useState, useCallback } from 'react';
import { requestBunnyToken } from '../../lib/bunny';

interface Props {
  bunnyVideoId: string;
  title: string;
  autoplay?: boolean;
  /** Mostrar u ocultar el encabezado de título (evita duplicidad si el contenedor modal ya lo incluye) */
  showTitle?: boolean;
}

const PUBLIC_BUNNY_LIBRARY_ID = '797766';

// Reproductor oficial de Bunny Stream para miembros con token firmado (Librería privada 796132)
// y fallback seguro a biblioteca pública (797766) si es necesario.
export function VideoPlayer({
  bunnyVideoId,
  title,
  autoplay = false,
  showTitle = false,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setIframeSrc(null);
      try {
        if (!bunnyVideoId || !bunnyVideoId.trim()) {
          throw new Error('Identificador de video no especificado.');
        }

        const cleanId = bunnyVideoId.trim();

        // 1. Intentar obtener el token firmado oficial de la Edge Function (para librería privada 796132)
        let resolvedEmbedUrl: string | null = null;
        try {
          const resp = await requestBunnyToken(cleanId);
          if (resp?.embedUrl) {
            const sep = resp.embedUrl.includes('?') ? '&' : '?';
            resolvedEmbedUrl = `${resp.embedUrl}${sep}autoplay=${
              autoplay ? 'true' : 'false'
            }&preload=true&responsive=true`;
          }
        } catch (tokenErr) {
          console.warn('bunny-token privado no disponible, intentando biblioteca pública:', tokenErr);
        }

        // 2. Si no es video privado o no requirió token firmado, usar reproductor estándar de librería 797766
        if (!resolvedEmbedUrl) {
          resolvedEmbedUrl = `https://iframe.mediadelivery.net/embed/${PUBLIC_BUNNY_LIBRARY_ID}/${cleanId}?autoplay=${
            autoplay ? 'true' : 'false'
          }&preload=true&responsive=true`;
        }

        if (!cancelled) {
          setIframeSrc(resolvedEmbedUrl);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'Error al solicitar el acceso seguro al video. Verifica tu conexión.',
          );
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [bunnyVideoId, autoplay, retryTrigger]);

  return (
    <div className="space-y-3">
      {showTitle && <h3 className="font-bold text-lg text-text-primary">{title}</h3>}
      <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-border relative">
        {loading && (
          <div
            role="status"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-sm text-text-secondary z-10"
          >
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Cargando video…</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center space-y-3 z-20"
          >
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-lg"
            >
              ⚠️
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">No se pudo reproducir el video</p>
              <p className="text-xs text-text-secondary max-w-sm leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="btn-accent !py-2 !px-4 text-xs font-semibold inline-flex items-center gap-2 min-h-[38px]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reintentar reproducción</span>
            </button>
          </div>
        )}

        {iframeSrc && (
          <iframe
            src={iframeSrc}
            title={title}
            loading="lazy"
            className="w-full h-full border-0"
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
