import { useRef, useState, useEffect, type ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  autoSlideInterval?: number; // ms entre desplazamientos (por defecto 3500ms)
}

/** Carrusel autodeslizante suave y responsive con soporte táctil, teclado y pausa accesible (WCAG 2.2.2). */
export function FeatureCarousel({ label, children, autoSlideInterval = 3500 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const isPaused = isInteracting || userPaused;

  // Desplazamiento manual en dirección (-1 o +1)
  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = Math.min(track.clientWidth * 0.85, 360);
    const maxScroll = track.scrollWidth - track.clientWidth;

    if (direction === 1 && track.scrollLeft >= maxScroll - 15) {
      // Si llegó al final, regresa suavemente al inicio
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === -1 && track.scrollLeft <= 15) {
      // Si está al inicio y retrocede, va al final
      track.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
    }
  };

  // Efecto autodeslizante continuo
  useEffect(() => {
    if (isPaused) return;

    // Respetar preferencia de reducción de movimiento del sistema
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const interval = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      const cardWidth = Math.min(track.clientWidth * 0.85, 360);

      if (track.scrollLeft >= maxScroll - 20) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [isPaused, autoSlideInterval]);

  return (
    <div
      className="relative group/carousel"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
    >
      {/* Pista de tarjetas deslizantes */}
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        aria-roledescription="carrusel autodeslizante"
        tabIndex={0}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Controles de navegación laterales y estado de pausa */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => setUserPaused((prev) => !prev)}
          aria-label={userPaused ? `Reanudar rotación de ${label}` : `Pausar rotación de ${label}`}
          aria-pressed={userPaused}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-surface text-xs text-text-secondary hover:text-text-primary hover:border-accent transition focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className={`inline-block size-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
          <span>{isPaused ? (userPaused ? 'Pausado' : 'Pausa (interacción)') : 'Deslizamiento activo'}</span>
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={`Ver anteriores: ${label}`}
            className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition hover:border-accent hover:text-accent hover:bg-surface/80 shadow-sm"
          >
            <span aria-hidden="true" className="text-base">←</span>
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={`Ver siguientes: ${label}`}
            className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition hover:border-accent hover:text-accent hover:bg-surface/80 shadow-sm"
          >
            <span aria-hidden="true" className="text-base">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
