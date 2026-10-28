import { formatMonthlyRate, BASE_OFFER } from '../../lib/offer';
import { VideoIcon, MembershipIcon, ShieldIcon } from '../ui/Icons';

interface OfferSnapshotProps {
  monthlyPrice?: number;
}

export function OfferSnapshot({ monthlyPrice }: OfferSnapshotProps) {
  const priceDisplay = formatMonthlyRate(monthlyPrice);

  return (
    <section
      aria-label="Resumen de la membresía"
      className="relative z-10 -mt-6 sm:-mt-10 mb-8 container mx-auto px-6"
    >
      <div className="bg-raised/95 backdrop-blur-xl border border-border hover:border-accent/30 transition-all rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-accent font-semibold tracking-widest uppercase text-xs">
            Propuesta de Valor Transparente
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-text-primary mt-1">
            Tu Membresía en 3 Puntos Clave
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Qué incluye */}
          <div className="bg-background/80 border border-border/80 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                <VideoIcon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary">
                1. ¿Qué incluye?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Biblioteca renovada cada mes: clases guiadas de <strong>GAP</strong>, <strong>Full Body</strong>, <strong>Cardio HIIT</strong>, plan de fuerza semanal y guías prácticas de nutrición real.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 text-[11px] text-accent font-semibold">
              ● Contenido nuevo cada ciclo
            </div>
          </div>

          {/* 2. Cuánto cuesta */}
          <div className="bg-background/80 border border-border/80 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                <MembershipIcon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary">
                2. ¿Cuánto cuesta?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                <strong className="text-text-primary text-sm">{priceDisplay}</strong> sin compromisos ni letra chica. Puedes cancelar tu suscripción con un solo clic desde tu panel cuando lo decidas.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 text-[11px] text-emerald-400 font-semibold">
              ● Sin permanencia · Cancela con 1 clic
            </div>
          </div>

          {/* 3. Cómo pruebo */}
          <div className="bg-background/80 border border-border/80 rounded-2xl p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-text-primary">
                3. ¿Cómo pruebo?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Disfrutas de <strong className="text-text-primary">{BASE_OFFER.trialDays} días de acceso completo 100% gratis</strong>. Si cancelas antes de que termine tu periodo de prueba, no se te cobrará ni un centavo.
              </p>
            </div>
            <div className="pt-2 border-t border-border/40 text-[11px] text-sky-400 font-semibold">
              ● Garantía de 7 días sin cobro inicial
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

