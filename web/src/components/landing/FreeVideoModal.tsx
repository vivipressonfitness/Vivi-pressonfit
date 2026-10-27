import { useEffect, useRef, useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import type Hls from 'hls.js';
import type { PreviewItem } from '../../hooks/useLandingConfig';

// Modal de video PROMOCIONAL FREE en el portal público (visible sin login).
// Cumple con WAI-ARIA 1.2 dialog (atrapamiento de foco, escape, pausa de scroll y Lenis).

interface Props {
  item: PreviewItem;
  onClose: () => void;
}

function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function FreeVideoModal({ item, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const lenis = useLenis();

  const videoRef = useRef<HTMLVideoElement>(null);
  const directVideoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const ytEmbed = item.video_url ? youtubeId(item.video_url) : null;
  const vimeoEmbed = item.video_url
    ? (item.video_url.match(/vimeo\.com\/(\d+)/) ?? [])[1] ?? null
    : null;
  const bunnyMatch = item.video_url
    ? item.video_url.match(/(?:iframe|player)\.mediadelivery\.net\/(?:play|embed)\/(\d+)\/([\w-]+)/)
    : null;
  const bunnyEmbed = bunnyMatch
    ? `https://iframe.mediadelivery.net/embed/${bunnyMatch[1]}/${bunnyMatch[2]}?autoplay=true`
    : item.video_url && /iframe\.mediadelivery\.net|video\.bunnycdn\.com/.test(item.video_url)
      ? `${item.video_url}${item.video_url.includes('?') ? '&' : '?'}autoplay=true`
      : null;
  const directUrl =
    item.video_url && !ytEmbed && !vimeoEmbed && !bunnyEmbed ? item.video_url : null;
  const isLocalDemo = Boolean(directUrl && directUrl.startsWith('/landing/'));

  // Gestión de foco, teclado Escape, bloqueo de scroll y pausa de Lenis (WAI-ARIA 1.2)
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    // Pausar Lenis y bloquear scroll nativo
    lenis?.stop();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Foco inicial accesible
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first || document.activeElement === modalRef.current) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      lenis?.start();

      hlsRef.current?.destroy();
      hlsRef.current = null;

      // Restaurar foco al elemento que disparó el modal
      previousFocusRef.current?.focus();
    };
  }, [onClose, lenis]);

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
        await attachSource(json.hlsUrl);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error cargando video');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function attachSource(url: string) {
      const video = videoRef.current;
      if (!video) return;
      hlsRef.current?.destroy();
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        const { default: HlsClass } = await import('hls.js');
        if (cancelled) return;
        if (HlsClass.isSupported()) {
          const hls = new HlsClass({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(HlsClass.Events.ERROR, (_evt, data) => {
            if (data.fatal && data.type === HlsClass.ErrorTypes.NETWORK_ERROR) {
              setError('El video no está disponible por ahora.');
            }
          });
          hlsRef.current = hls;
        } else {
          setError('Tu navegador no soporta HLS');
        }
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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 md:bg-black/85 backdrop-blur-sm p-0 md:p-4"
      onClick={onClose}
    >
      {/* Botón flotante SIEMPRE VISIBLE para regresar en dispositivos móviles */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Regresar y cerrar video"
        className="md:hidden fixed top-3 left-3 z-[90] flex items-center gap-1.5 bg-black/80 hover:bg-black active:scale-95 text-white px-3.5 py-2 rounded-full border border-white/20 backdrop-blur-md shadow-2xl transition cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        <span className="text-xs font-bold tracking-tight">Volver</span>
      </button>

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full h-full md:h-auto max-w-3xl bg-surface border-0 md:border md:border-border rounded-none md:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-center md:block focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-border/40 md:border-border">
          <div className="pl-24 md:pl-0">
            {/* Solo categoría del programa */}
            <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-1 uppercase tracking-wider">
              {item.category}
            </span>
            <h3 id={titleId} className="font-heading text-base md:text-xl font-bold text-text-primary line-clamp-1">
              {item.title}
            </h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar reproductor"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-surface text-text-secondary hover:text-white hover:border-accent transition-colors focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="aspect-video bg-black relative w-full flex-1 md:flex-none flex items-center justify-center overflow-hidden">
          {item.bunny_video_id ? (
            <>
              <video
                ref={videoRef}
                controls
                playsInline
                aria-label={item.title}
                onEnded={() => setVideoEnded(true)}
                onPlay={() => setVideoEnded(false)}
                className="w-full h-full"
              />
              {loading && (
                <div role="status" className="absolute inset-0 flex items-center justify-center text-text-secondary">
                  Cargando video…
                </div>
              )}
              {error && (
                <div role="alert" className="absolute inset-0 flex items-center justify-center text-red-400 text-sm px-6 text-center">
                  {error}
                </div>
              )}
            </>
          ) : ytEmbed ? (
            <iframe
              title={`Video de ${item.title}`}
              src={`https://www.youtube.com/embed/${ytEmbed}?autoplay=1`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : vimeoEmbed ? (
            <iframe
              title={`Video de ${item.title}`}
              src={`https://player.vimeo.com/video/${vimeoEmbed}?autoplay=1`}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : bunnyEmbed ? (
            <iframe
              title={`Video de ${item.title}`}
              src={`${bunnyEmbed}${bunnyEmbed.includes('?') ? '&' : '?'}autoplay=true`}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : directUrl ? (
            <video
              ref={directVideoRef}
              src={directUrl}
              controls
              autoPlay={!isLocalDemo}
              playsInline
              aria-label={item.title}
              poster={item.thumbnail_url ?? undefined}
              onEnded={() => setVideoEnded(true)}
              onPlay={() => setVideoEnded(false)}
              className="w-full h-full"
            />
          ) : (
            <div role="status" className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
              Sin video configurado
            </div>
          )}

          {/* End-Screen CTA al terminar el video (CRO) */}
          {videoEnded && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
              <span className="bg-accent/20 border border-accent/40 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                Fin del adelanto gratuito
              </span>
              <h4 className="text-xl md:text-2xl font-extrabold text-white mb-2">
                ¿Lista para entrenar la clase completa?
              </h4>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md mb-6 leading-relaxed">
                Desbloquea las clases de 30-45 min, rutinas de fuerza 3x por semana y guías de nutrición con tus 7 días de prueba sin costo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
                <Link
                  to="/membresia"
                  onClick={onClose}
                  className="w-full sm:w-auto bg-accent hover:bg-white text-background font-bold px-6 py-3 rounded-full text-sm transition shadow-lg shadow-accent/30 text-center focus-visible:ring-2 focus-visible:ring-accent"
                >
                  Probar 7 días gratis — USD 40/mes
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setVideoEnded(false);
                    const target = videoRef.current || directVideoRef.current;
                    if (target) {
                      target.currentTime = 0;
                      void target.play();
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-text-secondary hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-accent"
                >
                  ↺ Volver a reproducir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
