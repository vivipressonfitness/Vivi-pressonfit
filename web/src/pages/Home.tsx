import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PlanCard } from '../components/membership/PlanCard';
import { useStripe } from '../hooks/useStripe';
import type { LandingConfigValue } from '../types';

export default function Home() {
  const [config, setConfig] = useState<LandingConfigValue | null>(null);
  const { startCheckout, loading, error } = useStripe();

  // landing_config alimenta precio/título editables desde el panel admin actual
  useEffect(() => {
    supabase
      .from('landing_config')
      .select('key, value')
      .then(({ data }) => {
        const map: Record<string, LandingConfigValue> = {};
        (data ?? []).forEach((r: { key: string; value: LandingConfigValue }) => { map[r.key] = r.value; });
        setConfig(map.monthly_price ?? map.main ?? null);
      });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          {config?.program_title ?? 'Entrenamiento y Estilo de Vida Saludable'}
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
          Un programa mensual con videos guiados, planes de entrenamiento y acompañamiento real.
          Transforma tu cuerpo y tus hábitos con VIVIPREFIT.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/registro" className="btn-accent">Comienza hoy — $us. {config?.price ?? 40}/mes</Link>
          <Link to="/login" className="border border-border rounded-pill px-6 py-3 text-text-secondary hover:text-text-primary transition">
            Ya soy miembro
          </Link>
        </div>
      </section>

      {/* Beneficios */}
      <section className="mx-auto max-w-6xl px-4 grid gap-6 sm:grid-cols-3">
        {[
          ['🏋️', 'Programa mensual', 'Rutinas nuevas cada ciclo, progresivas y guiadas en video.'],
          ['🥗', 'Estilo de vida', 'Guías de nutrición y hábitos que sostienen tus resultados.'],
          ['💬', 'Acompañamiento', 'Soporte directo por WhatsApp durante toda tu membresía.'],
        ].map(([icon, title, desc]) => (
          <div key={title} className="card-surface text-center">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold mb-2">{title}</h3>
            <p className="text-sm text-text-secondary">{desc}</p>
          </div>
        ))}
      </section>

      {/* Precio */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        {error && <p className="text-red-400 text-center mb-4 text-sm">{error}</p>}
        <PlanCard price={config?.price ?? 40} onSubscribe={startCheckout} loading={loading} />
      </section>
    </div>
  );
}
