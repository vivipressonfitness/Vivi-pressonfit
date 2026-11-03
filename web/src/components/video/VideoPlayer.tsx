import Hls from 'hls.js';
import { useEffect, useRef, useState, useCallback } from 'react';
import { requestBunnyToken } from '../../lib/bunny';

interface Props {
  bunnyVideoId: string;
  title: string;
  autoplay?: boolean;
  /** Mostrar u ocultar el encabezado de título (evita duplicidad si el contenedor modal ya lo incluye) */
  showTitle?: boolean;
}

// Reproductor HLS con token firmado obtenido de la Edge Function bunny-token.
// El token dura 120 min; si el usuario sigue viendo cerca de la expiración,
// se renueva automáticamente (onError con tipo networkError suele indicar 403).
export function VideoPlayer({
  bunnyVideoId,
  title,
  autoplay = false,
  showTitle = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
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
        const resp = await requestBunnyToken(bunnyVideoId);
        if (cancelled) return;

        // Si tenemos embedUrl oficial de Bunny, usamos el iframe oficial (más rápido, seguro y con todos los controles optimizados)
        if (resp.embedUrl || (resp.hlsUrl && resp.hlsUrl.includes('player.mediadelivery.net'))) {
          setIframeSrc(resp.embedUrl || resp.hlsUrl);
          setLoading(false);
          return;
        }

        if (!videoRef.current) return;
        attachSource(resp.hlsUrl);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : 'Error al solicitar el acceso seguro al video. Verifica tu conexión.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function attachSource(url: string) {
      const video = videoRef.current!;
      hlsRef.current?.destroy();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari nativo: HLS sin hls.js
        video.src = url;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          // 403 por token expirado → renovar una vez
          if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            void requestBunnyToken(bunnyVideoId)
              .then(({ hlsUrl }) => {
                hls.destroy();
                attachSource(hlsUrl);
              })
              .catch(() => setError('No se pudo reanudar la reproducción del video.'));
          } else if (data.fatal) {
            setError('Error en el flujo de transmisión de video.');
          }
        });
        hlsRef.current = hls;
      } else {
        setError('Tu navegador no soporta reproducción HLS.');
      }
      if (autoplay) void video.play().catch(() => undefined);
    }

    void load();
    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
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
            <span className="text-xs font-medium">Cargando video seguro…</span>
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

        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            title={title}
            loading="lazy"
            className="w-full h-full border-0"
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            controls
            playsInline
            aria-label={title}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
}
