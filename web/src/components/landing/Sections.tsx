import type { LandingConfig } from '../../hooks/useLandingConfig';

// Secciones Pilares / Clases / Educativo — réplica del diseño EJEMPLO.

const PILARES = [
  {
    title: '1. Biblioteca de Clases Grabadas',
    desc: (
      <>
        Acceso ilimitado a sesiones completas de <strong>GAP</strong>, <strong>Full Body</strong>,{' '}
        <strong>Cardio HIIT</strong> y <strong>Fuerza + Aeróbico</strong>.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M8 5v14l11-7L8 5Z"/></svg>
    ),
    iconColor: 'text-accent',
  },
  {
    title: '2. Plan de Entrenamiento',
    desc: (
      <>
        Rutinas de fuerza <strong>3 veces por semana</strong> para casa o gimnasio.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M20.57 14.91L22 16.33V21h-2v-3.08l-1.91-1.9-.57.57L19.42 19H16v2h-4.67l-1.41-1.43L8.5 21H7v-4.5L3.43 12.93 2 11.5V7h2v3.08l1.91 1.9.57-.57L4.58 9H8V5h4.67l1.42 1.42L15.5 5H17v4.5l3.57 3.57-.00.84Z"/></svg>
    ),
    iconColor: 'text-accent',
  },
  {
    title: '3. Nutrición & Acompañamiento',
    desc: (
      <>
        Educación alimentaria + <strong>soporte personalizado por WhatsApp</strong>.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-whatsapp-green"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
    ),
    iconColor: '',
  },
  {
    title: '4. Dinámica del Servicio',
    desc: (
      <>
        <strong>Renovación mensual:</strong> rutinas, clases y recursos nuevos cada ciclo.
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8Z"/></svg>
    ),
    iconColor: 'text-accent',
  },
];

export function Pilares({ config }: { config: LandingConfig }) {
  return (
    <section id="pilares" className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs">
            Estructura del Programa
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-text-primary">
            {config.pilares_title}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILARES.map((p) => (
            <div
              key={p.title}
              className="bg-raised p-7 rounded-2xl border border-border hover:border-accent transition duration-300"
            >
              <div
                className={`w-14 h-14 bg-background rounded-2xl flex items-center justify-center mb-6 border border-border ${p.iconColor}`}
              >
                {p.icon}
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-text-primary">{p.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CLASES = [
  { tag: 'Firmeza', title: 'GAP', desc: 'Glúteos, Abdomen y Piernas: firmeza y tonificación muscular.' },
  { tag: 'Global', title: 'Full Body', desc: 'Trabajo integral de cada grupo muscular.' },
  { tag: 'Intensidad', title: 'Cardio HIIT', desc: 'Quema calórica y resistencia cardiovascular.' },
  { tag: 'Híbrido', title: 'Fuerza + Aeróbico', desc: 'Resistencia muscular y capacidad aeróbica.' },
];

export function Clases() {
  return (
    <section id="clases" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <span className="text-accent font-semibold tracking-widest uppercase text-xs">
              Variedad y Enfoque
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mt-2 text-text-primary">
              Biblioteca de Clases Grabadas
            </h2>
          </div>
          <a href="#membresia" className="text-accent font-bold hover:underline flex items-center gap-2">
            Ver detalles de inscripción
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z"/></svg>
          </a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CLASES.map((c) => (
            <div key={c.title} className="bg-surface p-6 rounded-2xl border border-border">
              <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-4">
                {c.tag}
              </span>
              <h3 className="font-heading text-2xl font-bold mb-2 text-text-primary">{c.title}</h3>
              <p className="text-text-secondary text-sm">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Educativo({ config }: { config: LandingConfig }) {
  return (
    <section id="educativo" className="py-24 bg-surface">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <div className="aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl">
            <img src={config.educacion_image} alt="Nutrición" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="space-y-8">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs">
            Nutrición y Acompañamiento
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-text-primary leading-tight">
            Aprende a nutrir tu cuerpo sin dietas imposibles
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Hábitos sostenibles, educación alimentaria y soporte directo con tu coach vía WhatsApp.
          </p>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-accent">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.4 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1Zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5Z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-lg">Educación Alimentaria Práctica</h4>
                <p className="text-text-secondary text-sm">Guías mensuales para comer consciente y saludable.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-whatsapp-green">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-lg">Soporte Personalizado vía WhatsApp</h4>
                <p className="text-text-secondary text-sm">Canal directo para resolver dudas técnicas y de nutrición.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
