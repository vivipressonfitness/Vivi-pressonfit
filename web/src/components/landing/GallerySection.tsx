import { useState } from 'react';
import type { GalleryCardItem } from '../../hooks/useLandingConfig';

interface GallerySectionProps {
  cards: GalleryCardItem[];
  title?: string;
}

export function GallerySection({ cards, title }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryCardItem | null>(null);

  return (
    <section id="galeria" className="py-24 bg-background relative overflow-hidden border-t border-border">
      {/* Resplandor decorativo de fondo */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-accent/5 rounded-full blur-[140px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs">
            Experiencia y Comunidad
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-text-primary">
            {title || 'El Método VIVIFIT en Acción'}
          </h2>
          <p className="text-text-secondary mt-3 text-base md:text-lg">
            Entrenamiento de fuerza estructurado, movimiento dinámico y hábitos saludables diseñados para tu vida diaria.
          </p>
        </div>

        {/* Cuadrícula estética / Carrusel responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => setSelectedImage(card)}
              className="group relative rounded-3xl overflow-hidden border border-border bg-surface cursor-pointer shadow-lg hover:border-accent transition-all duration-300 hover:-translate-y-1"
            >
              {/* Imagen con proporción 4:5 */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-background">
                <img
                  src={card.image_url}
                  alt={card.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback local seguro si la imagen remota falla
                    (e.target as HTMLImageElement).src = `/landing/gallery/${card.id}.jpg`;
                  }}
                />
                {/* Degradado para máxima legibilidad de los textos */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                {/* Badge flotante superior */}
                <div className="absolute top-4 left-4">
                  <span className="bg-accent/90 text-background text-xs font-bold px-3 py-1 rounded-pill shadow-md backdrop-blur-sm uppercase tracking-wider">
                    {card.tag}
                  </span>
                </div>

                {/* Textos y contenido en la parte inferior */}
                <div className="absolute inset-x-0 bottom-0 p-6 space-y-2">
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                  <div className="pt-2 flex items-center text-xs font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Ver detalle ↗</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal / Visor de imagen en pantalla completa */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] w-full">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-accent transition"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-2 bg-surface">
              <span className="text-accent text-xs font-bold tracking-wider uppercase">
                {selectedImage.tag}
              </span>
              <h4 className="font-heading text-2xl font-bold text-text-primary">
                {selectedImage.title}
              </h4>
              <p className="text-text-secondary text-sm">
                {selectedImage.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

