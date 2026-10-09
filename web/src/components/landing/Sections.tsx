import { useState } from 'react';
import type { LandingConfig, PreviewItem } from '../../hooks/useLandingConfig';
import { FreeVideoModal } from './FreeVideoModal';
import { LANDING_CLASES, LANDING_EDUCATIVO } from '../../data/landingMedia';

// ============================================================
// Secciones del PORTAL PÚBLICO de adelantos (landing tipo portal).
// Todo lo que una visitante puede VER gratis sin login, como muestra
// de lo que encontrará dentro de la membresía. La suscripción vive en
// su propia página (/membresia), no en este portal.
// ============================================================

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

// Tarjeta reutilizable de adelanto gratuito / contenido bloqueado (solo miembros).
export function PreviewCard({
  item,
  onPlay,
}: {
  item: PreviewItem;
  onPlay: (item: PreviewItem) => void;
}) {
  const hasVideo = !item.locked && Boolean(item.bunny_video_id || item.video_url);

  return (
    <div
      className={`bg-surface p-6 rounded-2xl border border-border text-left group/card transition relative ${
        hasVideo ? 'hover:border-accent' : 'opacity-95'
      }`}
    >
      {item.thumbnail_url && (
        <div className="relative -m-6 mb-4 rounded-t-2xl overflow-hidden aspect-[4/3]">
          <img
            src={item.thumbnail_url}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          {hasVideo && (
            <button
              type="button"
              onClick={() => onPlay(item)}
              aria-label={`Ver adelanto de ${item.title}`}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-accent text-background flex items-center justify-center shadow-lg shadow-accent/30 opacity-90 hover:opacity-100 transition cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-0.5"><path d="M8 5v14l11-7L8 5Z" /></svg>
            </button>
          )}
          {hasVideo && (
            <span className="absolute top-3 right-3 bg-whatsapp-green text-black text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full">
              Gratis
            </span>
          )}
          {item.locked && (
            <span className="absolute top-3 right-3 bg-black/70 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-9-2a3 3 0 0 1 6 0v2H9V6Z" /></svg>
              Solo miembros
            </span>
          )}
        </div>
      )}
      <span className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-4">
        {item.category}
      </span>
      <h3 className="font-heading text-xl md:text-2xl font-bold mb-2 text-text-primary">{item.title}</h3>
      <p className="text-text-secondary text-sm">{item.desc}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        {item.duration && <span className="text-xs text-text-secondary font-semibold">{item.duration}</span>}
        {hasVideo && (
          <button
            type="button"
            onClick={() => onPlay(item)}
            className="inline-flex items-center gap-2 text-accent text-sm font-bold hover:underline ml-auto cursor-pointer"
          >
            Ver adelanto →
          </button>
        )}
        {item.locked && (
          <a
            href="/membresia"
            className="ml-auto inline-flex items-center gap-1 text-accent text-sm font-bold hover:underline"
          >
            Desbloquear →
          </a>
        )}
      </div>
    </div>
  );
}

// Adelanto de la Biblioteca de Clases (demo corto por categoría).
// Defaults: LANDING_CLASES; el Admin puede sobreescribir publicando
// landing_config.preview_clases (jsonb array).
export function AdelantoClases({ clases = LANDING_CLASES }: { clases?: PreviewItem[] }) {
  const [playing, setPlaying] = useState<PreviewItem | null>(null);

  return (
    <section id="adelantos" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <span className="text-accent font-semibold tracking-widest uppercase text-xs">
              Míralo antes de decidir · Sin registro
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold mt-2 text-text-primary">
              Adelantos Gratuitos: Biblioteca de Clases
            </h2>
            <p className="text-text-secondary mt-3 max-w-xl">
              Un fragmento real de cada categoría. Las clases completas (30-45 min) están dentro de la membresía.
            </p>
          </div>
          <a href="/membresia" className="text-accent font-bold hover:underline flex items-center gap-2">
            Ver todo el contenido de miembro
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z"/></svg>
          </a>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clases.map((c) => (
            <PreviewCard key={c.title} item={c} onPlay={setPlaying} />
          ))}
        </div>
      </div>
      {playing && <FreeVideoModal item={playing} onClose={() => setPlaying(null)} />}
    </section>
  );
}

// Zona Educativa/Nutrición: muestras gratis + teasers bloqueados.
export function AdelantoEducativo({ recursos = LANDING_EDUCATIVO }: { recursos?: PreviewItem[] }) {
  const [playing, setPlaying] = useState<PreviewItem | null>(null);

  return (
    <section id="educativo" className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
          <div className="relative order-2 md:order-1">
            <div className="aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl">
              <img
                src="/landing/thumb-cardio.jpg"
                alt="Nutrición ViviPreFit"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <span className="text-accent font-semibold tracking-widest uppercase text-xs">
              Nutrición y Educación — también gratis
            </span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-text-primary leading-tight">
              Aprende a nutrir tu cuerpo sin dietas imposibles
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Aquí tienes muestras reales del material educativo. Al ser miembro recibes las guías
              completas cada mes y soporte directo por WhatsApp con tu coach.
            </p>
            <a
              href="/membresia"
              className="inline-block border border-border text-text-primary px-6 py-3 rounded-full font-bold hover:border-accent hover:text-accent transition-all"
            >
              Ver qué más incluye la membresía
            </a>
          </div>
        </div>

        <h3 className="font-heading text-xl md:text-2xl font-bold text-text-primary mb-6">
          Contenido educativo de acceso libre
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recursos.map((c) => (
            <PreviewCard key={c.title} item={c} onPlay={setPlaying} />
          ))}
        </div>
      </div>
      {playing && <FreeVideoModal item={playing} onClose={() => setPlaying(null)} />}
    </section>
  );
}

// CTA puente: "esto fue solo el adelanto → página de membresía".
export function PortalCta({ config }: { config: LandingConfig }) {
  return (
    <section className="py-20 bg-background text-center border-t border-border relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,46,147,0.08),transparent_60%)]" />
      <div className="container mx-auto px-6 relative z-10 max-w-2xl">
        <span className="text-accent font-semibold tracking-widest uppercase text-xs">
          Esto fue solo el adelanto
        </span>
        <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-text-primary">
          Dentro de la membresía hay mucho más esperándote
        </h2>
        <p className="text-text-secondary mt-3 mb-8">
          Clases completas, rutinas 3x por semana, guías de nutrición mensuales y soporte
          personalizado por WhatsApp — desde $us. {config.monthly_price}/mes.
        </p>
        <a
          href="/membresia"
          className="inline-block bg-accent text-background px-8 py-4 rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-accent/20"
        >
          Conocer la membresía →
        </a>
      </div>
    </section>
  );
}
