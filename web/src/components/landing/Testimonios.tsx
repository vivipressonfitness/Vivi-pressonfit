import { FC } from 'react';

const testimonios = [
  {
    nombre: 'Ana G.',
    foto: '/assets/testimonial-1.webp',
    texto: 'En 4 semanas alcancé mi mejor marca en press de hombros, ¡y sin lesionarme!',
    whatsapp: '+5493415888117',
  },
  {
    nombre: 'María L.',
    foto: '/assets/testimonial-2.webp',
    texto: 'El método me da estructura; ahora entreno 3× semana y sigo con energía.',
    whatsapp: '+5493415888117',
  },
  {
    nombre: 'Sofía R.',
    foto: '/assets/testimonial-3.webp',
    texto: 'Las guías de nutrición son prácticas y me ayudaron a bajar 3 kg en 1 mes.',
    whatsapp: '+5493415888117',
  },
];

export const Testimonios: FC = () => (
  <section id="testimonios" className="py-12 bg-surface">
    <h2 className="text-center text-3xl font-bold text-text-primary mb-8">
      Lo que dicen nuestras alumnas
    </h2>
    <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto px-4">
      {testimonios.map((t) => (
        <article
          key={t.nombre}
          className="flex flex-col items-center bg-background rounded-xl p-6 shadow-sm"
        >
          <img
            src={t.foto}
            alt={t.nombre}
            className="w-20 h-20 rounded-full object-cover mb-4"
            loading="lazy"
          />
          <p className="text-center text-sm text-text-secondary italic mb-2">
            “{t.texto}”
          </p>
          <p className="font-medium text-text-primary">{t.nombre}</p>
          <a
            href={`https://wa.me/${t.whatsapp.replace(/[^\d]/g, '')}`}
            className="mt-3 inline-flex items-center gap-2 text-accent hover:underline"
          >
            📲 Escríbeme
          </a>
        </article>
      ))}
    </div>
  </section>
);

