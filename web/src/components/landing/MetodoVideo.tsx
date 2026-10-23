import { useEffect, useRef, useState } from 'react';

// ============================================================
// Banda "El método, en movimiento" — anclada justo debajo del hero.
// - Showreel vertical (9:16) mudo y en loop, con poster como respaldo.
// - Carga diferida al entrar en viewport: no compite con el LCP del hero.
// - Respeta prefers-reduced-motion y el ahorro de datos (queda el poster).
// - Botón de pausa visible (WCAG 2.2.2: movimiento automático > 5 s).
// Todo el comportamiento vive aquí: no modifica Hero, Navbar ni el Admin.
// ============================================================

const REEL_SRC = '/landing/hero-reel.mp4';
const REEL_POSTER = '/landing/hero-reel-poster.webp';

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

export function MetodoVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [inView, setInView] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  const showVideo = inView && !reduceMotion && !saveData && !failed;

  // Preferencias del sistema + red: 2G o ahorro de datos => solo poster.
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReduceMotion(motion.matches);
    syncMotion();
    motion.addEventListener('change', syncMotion);

    const connection = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) {
      setSaveData(true);
    }

    return () => motion.removeEventListener('change', syncMotion);
  }, []);

  // Carga y reproducción solo cuando la banda está cerca del viewport.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '200px', threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Pausa si sale del viewport, si la pestaña se oculta o si la visitante lo pide.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncPlayback = () => {
      if (!inView || paused || document.visibilityState === 'hidden') {
        video.pause();
        return;
      }
      void video.play().catch(() => {});
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [inView, paused, ready]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="metodo-video-title"
      className="relative overflow-hidden bg-surface border-y border-border"
    >
      <div className="pointer-events-none absolute -left-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-accent/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[320px] w-[320px] rounded-full bg-accent/5 blur-[110px]" />

      <div className="container relative mx-auto px-6 py-12 md:py-16">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-14">
          {/* ---------- Showreel vertical ---------- */}
          <div className="mx-auto w-full max-w-[300px] md:max-w-[320px]">
            <div className="group relative aspect-[9/16] overflow-hidden rounded-[28px] border border-border bg-background shadow-[0_24px_60px_rgba(0,0,0,0.75)]">
              {/* Poster: LCP visual y respaldo si el video falla o no se carga. */}
              {posterFailed ? (
                <div className="absolute inset-0 bg-gradient-to-br from-surface via-raised to-background" />
              ) : (
                <img
                  src={REEL_POSTER}
                  onError={() => setPosterFailed(true)}
                  alt="Vivi entrenando press de hombros en el gimnasio"
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover ${ready ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
                />
              )}

              {showVideo && (
                <video
                  ref={videoRef}
                  src={REEL_SRC}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                  aria-label="Fragmento de entrenamiento de Vivi: press de hombros en el gimnasio y caminata al aire libre"
                  onCanPlay={() => setReady(true)}
                  onError={() => setFailed(true)}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
                />
              )}

              {/* Degradado para legibilidad de los controles */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                9 s · El método
              </span>

              {showVideo && (
                <button
                  type="button"
                  onClick={() => setPaused((value) => !value)}
                  aria-label={paused ? 'Reproducir el video' : 'Pausar el video'}
                  aria-pressed={paused}
                  className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white backdrop-blur-md transition hover:bg-black/75 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {paused ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M8 5v14l11-7L8 5Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" />
                    </svg>
                  )}
                </button>
              )}

              {paused && showVideo && (
                <span className="pointer-events-none absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-0.5 h-6 w-6">
                    <path d="M8 5v14l11-7L8 5Z" />
                  </svg>
                </span>
              )}

              <a
                href="#adelantos"
                className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-background shadow-lg shadow-accent/30 transition hover:bg-white"
              >
                Ver clases gratis
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
              </a>
            </div>

            <p className="mt-3 text-center text-[11px] uppercase tracking-widest text-text-secondary">
              Entrenamiento real · sin sonido
            </p>
          </div>

          {/* ---------- Copy de la banda ---------- */}
          <div className="text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              El método, en movimiento
            </span>
            <h2
              id="metodo-video-title"
              className="mt-2 font-heading text-3xl font-bold leading-tight text-text-primary md:text-4xl lg:text-5xl"
            >
              Así se entrena dentro de <span className="text-accent">VIVIPRESSONFIT</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-secondary md:mx-0 md:text-base">
              Fuerza con mancuernas, trabajo de espalda y hombros, y cardio al aire libre. Un
              fragmento real de las sesiones que encuentras al entrar: técnica cuidada, progresión
              semanal y acompañamiento cercano.
            </p>

            <ul className="mx-auto mt-6 grid max-w-md gap-3 text-left md:mx-0">
              {[
                'Fuerza con progresión semana a semana',
                'Técnica guiada, sin ejercicios al azar',
                'Cardio y movilidad para sostener el ritmo',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3 w-3">
                      <path d="M9.55 17.05 4.5 12l1.4-1.4 3.65 3.6 8.55-8.55L19.5 7l-9.95 10.05Z" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center md:flex-col md:items-start lg:flex-row lg:justify-start">
              <a
                href="/membresia"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-accent px-7 py-3.5 text-base font-bold text-background shadow-lg shadow-accent/25 transition hover:bg-white"
              >
                Hazte miembro
              </a>
              <a
                href="#adelantos"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-border px-7 py-3.5 text-base font-bold text-text-primary transition hover:border-accent hover:text-accent"
              >
                Ver el contenido gratis
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
