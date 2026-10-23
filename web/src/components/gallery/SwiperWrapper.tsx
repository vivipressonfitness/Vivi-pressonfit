import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { useCarouselMedia } from '../../hooks/useCarouselMedia';
import { MediaItem } from '../../types/MediaItem';

interface MediaCardProps {
  item: MediaItem;
}

const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  return (
    <div className="group relative w-full aspect-[9/16] max-h-[540px] rounded-[2rem] overflow-hidden bg-neutral-900 border border-white/10 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 select-none">
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
 * Carousel horizontal multi-tarjeta estilo Obé Fitness:
 * - Totalmente limpio en el frontend (sin botones de filtro ni flechas intrusivas).
 * - Movimiento 100% continuo, fluido y autoplay constante.
 * - La selección de contenido se administra desde el Panel Admin.
 * - Excluye el logo oficial del carrusel.
 */
export const SwiperWrapper: React.FC<SwiperWrapperProps> = ({ filterMode = 'all' }) => {
  const { media: filtered, loading } = useCarouselMedia(filterMode);

  // Asegura suficientes tarjetas para un loop continuo y fluido sin saltos
  const displayItems = React.useMemo(() => {
    if (filtered.length === 0) return [];
    if (filtered.length >= 10) return filtered;
    let list = [...filtered];
    let counter = 1;
    while (list.length < 12) {
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
      <section className="w-full py-16 px-4">
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
    return null; // Si no hay archivos, no ocupa espacio innecesario en la landing
  }

  return (
    <section className="w-full py-16 overflow-hidden">
      {/* Estilo para garantizar movimiento continuo y suave sin saltos */}
      <style>{`
        .swiper-continuous-fluid .swiper-wrapper {
          transition-timing-function: linear !important;
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

      {/* Contenedor del Carrusel Estilo Obé con movimiento 100% fluido y lineal */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={16}
          slidesPerView={1.25}
          speed={3800}
          freeMode={{
            enabled: true,
            momentum: false,
          }}
          grabCursor={true}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          breakpoints={{
            480: {
              slidesPerView: 1.8,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.4,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3.2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4.2,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 4.8,
              spaceBetween: 24,
            },
          }}
          className="swiper-continuous-fluid !overflow-visible py-4"
        >
          {displayItems.map((item) => (
            <SwiperSlide key={item.id} className="h-auto">
              <MediaCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
