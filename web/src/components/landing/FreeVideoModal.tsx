import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import type { ClaseItem } from '../../hooks/useLandingConfig';

// Modal de video PROMOCIONAL FREE en el landing (visible sin login).
// Fuentes soportadas por card de clases_items:
//  - bunny_video_id → HLS de Bunny Stream. El token se pide a la Edge Function
//    pública bunny-token-public (no requiere sesión; verificar-membership=false).
//  - video_url      → mp4/mov directo, o embed de YouTube/Vimeo.

interface Props {
  item: ClaseItem;
  onClose: () => void;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function FreeVideoModal({ item, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ytEmbed = item.video_url ? youtubeId(item.video_url) : null;
  const vimeoEmbed = item.video_url
    ? (item.video_url.match(/vimeo\.com\/(\d+)/) ?? [])[1] ?? null
    : null;
  const directUrl =
    item.video_url && !ytEmbed && !vimeoEmbed ? item.video_url : null;
  const isLocalDemo = Boolean(directUrl && directUrl.startsWith('/landing/'));

  // Cerrar con Escape + bloquear scroll del fondo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [onClose]);

  // HLS público desde Bunny (token vía Edge Function anon)
  useEffect(() => {
    if (!item.bunny_video_id || !videoRef.current) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const base = import.meta.env.VITE_SUPABASE_URL as string;
        const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
        const res = await fetch(`${base.replace(/\/$/, '')}/functions/v1/bunny-token-public`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
          body: JSON.stringify({ videoId: item.bunny_video_id }),
        });
        const json = (await res.json().catch(() => ({}))) as { hlsUrl?: string; error?: string };
        if (cancelled) return;
        if (!res.ok || !json.hlsUrl) throw new Error(json.error ?? 'No se pudo cargar el video');
        attachSource(json.hlsUrl);
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
        video.src = url;
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_evt, data) => {
          if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setError('El video no está disponible por ahora.');
          }
        });
        hlsRef.current = hls;
      } else {
        setError('Tu navegador no soporta HLS');
      }
      void video.play().catch(() => undefined);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [item.bunny_video_id]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-1">
              {item.tag} · CLASE GRATIS
            </span>
            <h3 className="font-heading text-xl font-bold text-text-primary">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-text-secondary hover:text-white text-2xl leading-none px-2"
          >
            ✕
          </button>
        </div>

        <div className="aspect-video bg-black relative">
          {item.bunny_video_id ? (
            <>
              <video ref={videoRef} controls playsInline className="w-full h-full" />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                  Cargando video…
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm px-6 text-center">
                  {error}
                </div>
              )}
            </>
          ) : ytEmbed ? (
            <iframe
              title={item.title}
              src={`https://www.youtube.com/embed/${ytEmbed}?autoplay=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : vimeoEmbed ? (
            <iframe
              title={item.title}
              src={`https://player.vimeo.com/video/${vimeoEmbed}?autoplay=1`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : directUrl ? (
            <video
              src={directUrl}
              controls
              autoPlay={!isLocalDemo}
              playsInline
              poster={item.thumbnail_url ?? undefined}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
              Sin video configurado
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-text-secondary line-clamp-2">{item.desc}</p>
          <a
            href="#membresia"
            onClick={onClose}
            className="shrink-0 bg-accent hover:bg-white text-background text-sm font-bold px-4 py-2 rounded-pill transition"
          >
            Quiero todas las clases
          </a>
        </div>

        {isLocalDemo && (
          <p className="px-6 pb-4 -mt-1 text-[11px] leading-relaxed text-text-secondary">
            📌 Demo local servida desde <code className="text-accent">web/public/landing/</code>. Para producción:
            subí esta clase a Bunny Stream y publicá la clave{' '}
            <code className="text-accent">clases_items</code> en Admin → Landing Config (se reproduce con token
            público vía <code className="text-accent">bunny-token-public</code>).
          </p>
        )}
      </div>
    </div>
  );
}
