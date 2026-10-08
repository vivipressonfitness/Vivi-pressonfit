import type { LandingConfig } from '../../hooks/useLandingConfig';

// Hero replica del diseño EJEMPLO: badge rosa, título Montserrat, CTA pink + outline,
// imagen 3/4 con overlay y tarjeta flotante "Membresía Mensual".
export function Hero({ config }: { config: LandingConfig }) {
  return (
    <header id="inicio" className="relative min-h-[92vh] flex items-center pt-28 pb-16 overflow-hidden bg-background">
      {/* glow decorativo */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-accent/10 blur-3xl" />
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Renovación Mensual Continua
          </span>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-text-primary">
            {config.hero_title} <br />
            <span className="text-accent">{config.hero_title_sub}</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed max-w-lg">{config.hero_sub}</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href="#membresia"
              className="inline-block bg-accent text-background px-8 py-4 rounded-full font-bold hover:bg-text-primary transition-all text-center shadow-lg shadow-accent/25 cursor-pointer"
            >
              Inscribirme por $us. {config.monthly_price} / mes
            </a>
            <a
              href="#pilares"
              className="inline-block border border-border text-text-primary px-8 py-4 rounded-full font-bold hover:border-accent hover:text-accent transition-all text-center"
            >
              Explorar Contenido
            </a>
          </div>
          <div className="flex items-center gap-6 pt-2 text-xs text-text-secondary">
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-accent"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8Z"/></svg>
              Contenido renovado cada mes
            </span>
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-whatsapp-green"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
              Soporte personalizado
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-border relative group">
            <img
              src={config.hero_image}
              alt="Entrenamiento ViviPreFit"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-raised/80 backdrop-blur-md border border-border">
              <p className="text-xs uppercase font-bold text-accent tracking-wider">Membresía Mensual</p>
              <p className="text-sm font-semibold text-white">
                Acceso 24/7 a todas las clases y asesoría nutricional
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const MARQUEE_ITEMS = [
  'GAP: GLÚTEOS, ABDOMEN Y PIERNAS',
  'FULL BODY COMPLETO',
  'CARDIO HIIT QUEMA GRASA',
  'FUERZA + AERÓBICO',
  'SOPORTE POR WHATSAPP',
];

export function Marquee() {
  const row = (
    <>
      {MARQUEE_ITEMS.map((t) => (
        <span key={t}>
          <span className="font-heading text-3xl font-extrabold opacity-30 mx-8 text-text-primary">{t}</span>
          <span className="font-heading text-3xl font-extrabold text-accent opacity-40 mx-8">✦</span>
        </span>
      ))}
    </>
  );
  return (
    <div className="py-6 border-y border-border bg-background overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee">{row}{row}</div>
    </div>
  );
}
