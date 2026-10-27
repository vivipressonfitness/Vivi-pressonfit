import React from 'react';
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
        />
      ) : (
        <video
          src={item.src}
          className="w-full h-full object-cover pointer-events-none"
          playsInline
          autoPlay
          loop
          muted
          preload="auto"
        />
      )}

      {/* Sutil overlay de degradado inferior estilo Obé */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
    </div>
  );
};

interface SwiperWrapperProps {
  filterMode?: 'all' | 'image' | 'video';
}

/**
 * Carrusel horizontal continuo estilo Obé Fitness:
 * - Movimiento 100% fluido e imparable mediante GPU hardware acceleration.
 * - NUNCA se pausa al hacer scroll con el mouse ni al desplazarse en celular.
 * - Velocidad calibrada a 28s para un ritmo ágil y constante.
 * - Totalmente limpio en el frontend y administrable desde el Panel Admin.
 */
export const SwiperWrapper: React.FC<SwiperWrapperProps> = ({ filterMode = 'all' }) => {
  const { media: filtered, loading } = useCarouselMedia(filterMode);

  // Asegura suficientes tarjetas para duplicación sin saltos en el bucle infinito
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
      {/* Animación por GPU nativa inmune a pausas por scroll o toques de pantalla */}
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
          animation: carouselMarqueeTrack 38s linear infinite !important;
          will-change: transform;
        }
      `}</style>

      {/* Título de la sección */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center sm:text-left">
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">
          Comunidad & Entrenamientos
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Viví la Experiencia
        </h2>
      </div>

      {/* Tira continua e infinita que jamás se pausa al hacer scroll */}
      <div className="w-full overflow-hidden py-4 select-none">
        <div className="carousel-marquee-inner gap-4 sm:gap-6">
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
