import { useState } from 'react';
import type { LandingConfig, QuienSoyImageItem } from '../../hooks/useLandingConfig';

interface AboutMeProps {
  config: LandingConfig;
  images: QuienSoyImageItem[];
}

export function AboutMe({ config, images }: AboutMeProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<QuienSoyImageItem | null>(null);

  return (
    <section id="quien-soy" className="py-24 bg-surface border-t border-border relative overflow-hidden">
      {/* Luz ambiental de fondo */}
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-[450px] h-[450px] rounded-full bg-accent/10 blur-[130px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Cabecera y Biografía */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs">
            {config.quien_soy_subtitle || 'Tu Coach & Mentora'}
          </span>
          <h2 className="font-heading text-4xl md:text-6xl font-bold text-text-primary tracking-tight">
            {config.quien_soy_title || '¿Quién Soy?'}
          </h2>
          <p className="text-text-secondary text-base md:text-xl leading-relaxed font-light">
            {config.quien_soy_bio ||
              '¡Hola! Soy Vivi. Mi misión es acompañarte a construir fuerza, energía y hábitos saludables duraderos sin restricciones absurdas ni frustración.'}
          </p>
        </div>

        {/* Galería Mosaico de las 6 Fotos Personales de Vivi (1.jpg - 6.jpg) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {images.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-background border border-border hover:border-accent cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-md"
            >
              <img
                src={item.image_url}
                alt={item.caption || `Coach Vivi #${item.id}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `/landing/gallery/${item.id}.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-xs font-semibold text-text-primary">
                  {item.caption || 'Ver foto ↗'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Botón de Contacto / WhatsApp */}
        <div className="mt-12 text-center">
          <a
            href={`https://wa.me/${config.whatsapp_number}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-3 bg-whatsapp-green hover:bg-white text-background font-bold px-8 py-3.5 rounded-pill text-base transition shadow-lg shadow-whatsapp-green/20"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
            <span>Conversa conmigo en WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Modal Visor en Pantalla Completa */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-md w-full bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/5] w-full">
              <img
                src={selectedPhoto.image_url}
                alt={selectedPhoto.caption || 'Coach Vivi'}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-accent transition"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            {selectedPhoto.caption && (
              <div className="p-4 bg-surface text-center">
                <p className="text-sm font-semibold text-text-primary">
                  {selectedPhoto.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

