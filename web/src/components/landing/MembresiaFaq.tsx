import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LandingConfig } from '../../hooks/useLandingConfig';

// Membresía + FAQ — réplica del diseño EJEMPLO.
export function Membresia({ config }: { config: LandingConfig }) {
  const navigate = useNavigate();
  const price = `$us. ${config.monthly_price} / mes`;

  return (
    <section id="membresia" className="py-24 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,46,147,0.06),transparent_60%)]" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs">
            Suscripción Simple y Transparente
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-3 text-text-primary">
            {config.membresias_title}
          </h2>
          <p className="text-text-secondary mt-3">Sin contratos a largo plazo. Cancela o renueva cuando quieras.</p>
        </div>
        <div className="max-w-xl mx-auto">
          <div className="bg-raised p-8 md:p-10 rounded-3xl border-2 border-accent relative shadow-2xl shadow-accent/10">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-accent text-background px-5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest whitespace-nowrap">
              Plan Completo Todo Incluido
            </span>
            <div className="text-center pb-8 border-b border-border">
              <h3 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
                Programa Estilo de Vida Saludable
              </h3>
              <p className="text-text-secondary text-sm mt-2">Acceso total + acompañamiento mensual</p>
              <div className="mt-6 flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-extrabold text-text-primary font-heading">
                  $us. {config.monthly_price}
                </span>
                <span className="text-text-secondary font-medium">/ mes</span>
              </div>
            </div>
            <div className="py-8">
              <p className="text-xs uppercase tracking-wider text-text-secondary font-bold mb-4">
                Lo que recibes cada mes:
              </p>
              <ul className="space-y-4 text-text-secondary text-sm">
                {[
                  ['Clases Grabadas:', ' GAP, Full Body, Cardio HIIT, Fuerza + Aeróbico.', false],
                  ['Rutinas 3x/semana:', ' Casa y Gimnasio.', false],
                  ['Educación Alimentaria:', ' Guías nutricionales.', false],
                  ['Soporte WhatsApp:', ' Atención personalizada.', true],
                  ['Renovación mensual:', ' Contenido nuevo cada ciclo.', false],
                ].map(([strong, rest, isWa]) => (
                  <li key={strong as string} className="flex items-start">
                    <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 mr-3 mt-0.5 shrink-0 ${isWa ? 'text-whatsapp-green' : 'text-accent'}`}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z" />
                    </svg>
                    <span>
                      <strong>{strong}</strong>
                      {rest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigate('/registro')}
              className="w-full py-4 bg-accent text-background rounded-full font-bold text-base hover:bg-white transition-all shadow-lg shadow-accent/20"
            >
              Suscribirme por {price}
            </button>
            <p className="text-center text-xs text-text-secondary mt-4">
              Acceso inmediato tras completar tu registro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: '¿Cómo funciona la renovación mensual del contenido?',
    a: 'Cada mes se actualizan las clases (GAP, Full Body, Cardio HIIT, Fuerza), las rutinas 3x y los recursos de alimentación.',
  },
  {
    q: '¿Puedo entrenar si no tengo equipo o no voy al gimnasio?',
    a: '¡Sí! Las rutinas tienen variantes para casa con materiales mínimos y para gimnasio.',
  },
  {
    q: '¿Cómo recibo el soporte personalizado por WhatsApp?',
    a: 'Al activar tu suscripción, tu dashboard incluirá el enlace directo a WhatsApp de tu coach.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id="faq" className="py-24 bg-surface border-t border-border">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs">Preguntas Frecuentes</span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold mt-2 text-text-primary">
            ¿Tienes alguna duda?
          </h2>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map((f, i) => (
            <div
              key={f.q}
              onClick={() => setOpen(open === i ? null : i)}
              className="border border-border bg-raised rounded-2xl p-5 cursor-pointer"
            >
              <button className="w-full flex justify-between items-center text-left font-semibold text-base md:text-lg text-text-primary">
                {f.q}
                <span className="text-accent transition-transform ml-4 text-xl leading-none">
                  {open === i ? '−' : '+'}
                </span>
              </button>
              {open === i && (
                <p className="pt-4 text-text-secondary text-sm leading-relaxed">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
