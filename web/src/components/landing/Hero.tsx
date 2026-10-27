import type { LandingConfig } from '../../hooks/useLandingConfig';
import { ShinyText } from '../ui/reactbits/ShinyText';
import { BlurText } from '../ui/reactbits/BlurText';

// Hero del PORTAL público:
// - Fondo cinematográfico de pantalla completa con /landing/vivi.webp.
// - Vivi visible a la izquierda con encuadre completo (cabeza y cuerpo sin recortes).
// - El recuadro con Títulos, Descripción, Botones de acción y Sellos de confianza DENTRO de la imagen a la derecha.
export function Hero({ config }: { config: LandingConfig }) {
  const heroTitleFull = `${config.hero_title || 'Programa de Entrenamiento y'} ${config.hero_title_sub || 'Estilo de Vida Saludable'}`.toUpperCase();

  return (
    <header id="inicio" className="relative bg-background">
      <h1 className="sr-only">{heroTitleFull}</h1>
      {/* ============================================================== */}
      {/* VERSIÓN MÓVIL (< md): FLUJO LIMPIO Y APILADO */}
      {/* ============================================================== */}
      <div className="block md:hidden pt-[76px]">
        {/* 1. TIRA ANIMADA DEL TÍTULO ANCLADA JUSTO DEBAJO DEL HEADER */}
        <div className="py-3 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border-b border-border overflow-hidden whitespace-nowrap" aria-hidden="true">
          <div className="inline-block animate-marquee">
            {[1, 2, 3].map((i) => (
              <span key={i}>
                <span className="font-heading text-sm font-extrabold tracking-wider text-white px-4">
                  {heroTitleFull}
                </span>
                <span className="text-accent font-bold px-2">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* 2. FOTO PRINCIPAL DE VIVI 100% LIMPIA (SIN NINGÚN TEXTO ENCIMA) */}
        <div className="relative w-full aspect-[4/5] max-h-[480px] bg-background overflow-hidden">
          <img
            src={config.hero_image || '/landing/vivi.webp'}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-25"
          />
          <img
            src={config.hero_image || '/landing/vivi.webp'}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = '/landing/vivi.webp';
              }
            }}
            alt="Coach Vivi Fitness"
            className="relative z-10 w-full h-full object-contain object-bottom brightness-[0.98] contrast-[1.02]"
          />
          {/* Suave degradado para fundir los pies con el fondo */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent z-10" />
        </div>

        {/* 3. CONTENIDO MOVIDO DEBAJO DE LA FOTO PRINCIPAL */}
        <div className="px-5 pb-12 pt-2 space-y-5 text-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <ShinyText text="7 Días de Prueba Gratis · Membresía VIP" speed={3.5} color="#FFFFFF" shineColor="#FF2E93" />
            </span>
          </div>

          <p className="text-gray-200 text-sm leading-relaxed font-light px-2">
            {config.hero_sub}
          </p>

          <div className="flex flex-col gap-3 pt-1">
            <a
              href="/membresia"
              className="w-full inline-block bg-accent hover:bg-white text-background py-3.5 rounded-full font-bold transition-all text-center shadow-lg shadow-accent/30 text-base"
            >
              Hazte miembro — USD {config.monthly_price}/mes
            </a>
            <a
              href="#adelantos"
              className="w-full inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-accent py-3.5 rounded-full font-bold backdrop-blur-md transition-all text-center text-base"
            >
              Ver contenido gratis ▶
            </a>
          </div>

          <div className="flex flex-col items-center gap-2 pt-2 text-xs text-gray-300">
            <span className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-accent"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8Z"/></svg>
              Contenido renovado cada mes
            </span>
            <span className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-whatsapp-green"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
              Soporte personalizado
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VERSIÓN LAPTOP Y PC (>= md): INTACTA TAL CUAL ESTABA */}
      {/* ============================================================== */}
      <div className="hidden md:flex relative min-h-screen items-center pt-40 pb-28 overflow-hidden">
        {/* Fondo con Vivi de cuerpo entero a la izquierda */}
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
          <img
            src={config.hero_image || '/landing/vivi.webp'}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-30 -z-10"
          />
          <img
            src={config.hero_image || '/landing/vivi.webp'}
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = '/landing/vivi.webp';
              }
            }}
            alt="Coach Vivi Fitness Hero"
            className="w-full h-full object-contain object-[5%_center] lg:object-[8%_center] brightness-[0.96] contrast-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/35 to-black/85" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)]" />
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background/90 via-background/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Neón decorativo */}
        <div className="pointer-events-none absolute top-1/3 right-10 w-[500px] h-[500px] rounded-full bg-accent/15 blur-[140px]" />

        {/* Recuadro a la derecha */}
        <div className="container mx-auto px-6 lg:px-8 relative z-10 flex justify-end">
          <div className="w-full max-w-xl lg:max-w-2xl bg-black/60 backdrop-blur-xl border border-white/20 hover:border-accent/40 transition-colors rounded-3xl p-10 lg:p-12 shadow-[0_30px_70px_rgba(0,0,0,0.85)] space-y-7">
            <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <ShinyText text="7 Días de Prueba Gratis · Membresía VIP" speed={3.5} color="#FFFFFF" shineColor="#FF2E93" />
            </span>

            <div className="font-heading text-4xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white drop-shadow-md" aria-hidden="true">
              <BlurText text={config.hero_title} delay={60} animateBy="words" direction="top" className="inline" /> <br />
              <span className="text-accent drop-shadow-[0_2px_15px_rgba(255,107,157,0.35)]">
                {config.hero_title_sub}
              </span>
            </div>

            <p className="text-gray-200 text-lg lg:text-xl leading-relaxed font-light drop-shadow">
              {config.hero_sub}
            </p>

            <div className="flex flex-row gap-4 pt-1">
              <a
                href="/membresia"
                className="inline-block bg-accent hover:bg-white text-background px-8 py-4 rounded-full font-bold transition-all text-center shadow-lg shadow-accent/30 cursor-pointer text-lg"
              >
                Hazte miembro — USD {config.monthly_price}/mes
              </a>
              <a
                href="#adelantos"
                className="inline-block bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-accent hover:border-accent px-8 py-4 rounded-full font-bold backdrop-blur-md transition-all text-center text-lg"
              >
                Ver contenido gratis ▶
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-gray-300">
              <span className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-accent"><path d="M12 4V1L8 5l4 4V6a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8Z"/></svg>
                Contenido renovado cada mes
              </span>
              <span className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-whatsapp-green"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
                Soporte personalizado
              </span>
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
