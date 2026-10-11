import { useState } from 'react';
import { ExpandableCard } from './ExpandableCard';

// FAQ del portal público. La oferta/suscripción ahora vive en la página /membresia
// (componente PlanCard), no en el landing.

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
            <ExpandableCard
              key={f.q}
              id={`faq-${i}`}
              title={f.q}
              expanded={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            >
              {f.a}
            </ExpandableCard>
          ))}
        </div>
      </div>
    </section>
  );
}
