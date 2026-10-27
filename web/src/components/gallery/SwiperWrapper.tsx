import React, { useState } from 'react';
import { useCarouselMedia } from '../../hooks/useCarouselMedia';
import { MediaItem } from '../../types/MediaItem';

interface MediaCardProps {
  item: MediaItem;
}

const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  return (
    <div className="relative w-[210px] sm:w-[250px] md:w-[280px] aspect-[9/16] shrink-0 rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/10 shadow-md select-none pointer-events-none">
      {item.type === 'image' ? (
        <img
          src={item.src}
          alt={item.alt || 'Contenido de la comunidad'}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          width={280}
          height={498}
        />
      ) : (
        <video
          src={item.src}
          className="w-full h-full object-cover pointer-events-none"
          playsInline
          autoPlay
          loop
          muted
          preload="metadata"
          width={280}
          height={498}
        />
      )}

      {/* Sutil overlay de degradado inferior */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
    </div>
  );
};

interface SwiperWrapperProps {
  filterMode?: 'all' | 'image' | 'video';
}

/**
 * Carrusel horizontal continuo con control de accesibilidad WCAG 2.2.2:
 * - Movimiento fluido mediante GPU hardware acceleration.
 * - Control de pausa/reanudación mediante botón visible para usuarios.
 * - Pausa automática al pasar el mouse (hover) o al recibir foco por teclado (focus-within).
 * - Respeta prefers-reduced-motion para usuarios con sensibilidad al movimiento.
 */
export const SwiperWrapper: React.FC<SwiperWrapperProps> = ({ filterMode = 'all' }) => {
  const { media: filtered, loading } = useCarouselMedia(filterMode);
  const [isPaused, setIsPaused] = useState(false);

  // Asegura suficientes tarjetas para duplicación sin saltos en el bucle continuo
  const displayItems = React.useMemo(() => {
    if (filtered.length === 0) return [];
    let list = [...filtered];
    let counter = 1;
    while (list.length < 8) {
      list = [
        ...list,
        ...filtered.map((item) => ({
          ...item,
          id: `${item.id}-loop-${counter++}`,
        })),
      ];
    }
    return list;
  }, [filtered]);

  if (loading) {
    return (
      <section id="galeria" className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-72 rounded-3xl bg-neutral-900/40 border border-white/5">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary text-sm">Cargando experiencias…</p>
          </div>
        </div>
      </section>
    );
  }

  if (filtered.length === 0) {
    return null;
  }

  return (
    <section id="galeria" className="w-full py-16 overflow-hidden">
      {/* Animación por GPU nativa con reglas de pausa accesible */}
      <style>{`
        @keyframes carouselMarqueeTrack {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .carousel-marquee-inner {
          display: flex;
          width: max-content;
          animation: carouselMarqueeTrack 38s linear infinite;
          will-change: transform;
        }
        .carousel-marquee-inner.is-paused,
        .carousel-track-container:hover .carousel-marquee-inner,
        .carousel-track-container:focus-within .carousel-marquee-inner {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .carousel-marquee-inner {
            animation: none !important;
          }
        }
      `}</style>

      {/* Cabecera de la sección con control de animación accesible */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">
            Comunidad & Entrenamientos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            Viví la Experiencia
          </h2>
        </div>

        {/* Botón de control de pausa accesible (WCAG 2.2.2 / F-05) */}
        <button
          type="button"
          onClick={() => setIsPaused((prev) => !prev)}
          aria-label={isPaused ? 'Reanudar movimiento del carrusel' : 'Pausar movimiento del carrusel'}
          aria-pressed={isPaused}
          className="self-center sm:self-end inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface text-xs font-medium text-text-secondary hover:text-text-primary hover:border-accent transition focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isPaused ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-3.5 h-3.5 text-accent">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
              <span>Reanudar</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-3.5 h-3.5 text-text-secondary">
                <path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z" />
              </svg>
              <span>Pausar</span>
            </>
          )}
        </button>
      </div>

      {/* Tira continua con soporte de hover, focus y teclado */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Carrusel continuo de la comunidad"
        className="carousel-track-container w-full overflow-hidden py-4 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className={`carousel-marquee-inner gap-4 sm:gap-6 ${isPaused ? 'is-paused' : ''}`}>
          {/* Primer set de tarjetas */}
          {displayItems.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
          {/* Segundo set clonado para bucle 100% continuo e invisible */}
          {displayItems.map((item) => (
            <MediaCard key={`clone-${item.id}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
};
