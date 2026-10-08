import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { requestBunnyToken } from '../../lib/bunny';

interface Props {
  bunnyVideoId: string;
  title: string;
  autoplay?: boolean;
}

// Reproductor HLS con token firmado obtenido de la Edge Function bunny-token.
// El token dura 120 min; si el usuario sigue viendo cerca de la expiración,
// se renueva automáticamente (onError con tipo networkError suele indicar 403).
export function VideoPlayer({ bunnyVideoId, title, autoplay = true }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { hlsUrl } = await requestBunnyToken(bunnyVideoId);
        if (cancelled || !videoRef.current) return;
        attachSource(hlsUrl);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando video');
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
              .then(({ hlsUrl }) => { hls.destroy(); attachSource(hlsUrl); })
              .catch(() => setError('No se pudo reproducir el video'));
          }
        });
        hlsRef.current = hls;
      } else {
        setError('Tu navegador no soporta HLS');
      }
      if (autoplay) void video.play().catch(() => undefined);
    }

    load();
    return () => {
      cancelled = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [bunnyVideoId, autoplay]);

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-lg">{title}</h3>
      <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-border relative">
        {loading && (
          <div className="absolute inset-0 grid place-items-center text-text-secondary">
            Cargando video…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 grid place-items-center text-red-400 px-6 text-center">
            {error}
          </div>
        )}
        <video ref={videoRef} controls playsInline className="w-full h-full" />
      </div>
    </div>
  );
}
