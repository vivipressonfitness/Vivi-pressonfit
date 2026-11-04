import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLandingConfig } from '../../hooks/useLandingConfig';

/**
 * Banner amigable y sutil para el Periodo de Prueba:
 * - Agradece a las alumnas/testers por participar.
 * - Guía visual directa para incentivar la reproducción de videos.
 * - Canales de comunicación directa para enviar sugerencias a Vivi o al desarrollador.
 * - Plegable / descartable para no obstaculizar la navegación diaria.
 */
export function BetaTesterBanner() {
  const { config } = useLandingConfig();
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    try {
      const isMin = localStorage.getItem('vivifit_beta_banner_minimized');
      if (isMin === 'true') setMinimized(true);
    } catch {}
  }, []);

  const handleToggle = () => {
    const next = !minimized;
    setMinimized(next);
    try {
      localStorage.setItem('vivifit_beta_banner_minimized', String(next));
    } catch {}
  };

  const cleanPhone = (config.whatsapp_number || '').replace(/\D/g, '') || '59178000000';
  const waViviUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    '¡Hola Vivi! Estoy probando la plataforma de miembros y quería compartirte esta sugerencia/observación: '
  )}`;

  if (minimized) {
    return (
      <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-purple-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span>
            <strong>Periodo de Prueba Activo:</strong> Tu opinión nos ayuda a mejorar.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={waViviUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>💬 Enviar sugerencia</span>
          </a>
          <button
            type="button"
            onClick={handleToggle}
            className="text-text-secondary hover:text-white underline text-[11px]"
          >
            Ver mensaje completo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-surface to-background p-5 sm:p-6 shadow-lg space-y-4 relative overflow-hidden">
      {/* Botón superior para minimizar */}
      <button
        type="button"
        onClick={handleToggle}
        className="absolute top-4 right-4 text-text-secondary hover:text-white text-xs px-2.5 py-1 rounded-lg hover:bg-white/5 transition"
        title="Minimizar aviso"
      >
        ✕ Minimizar
      </button>

      {/* Cabecera del aviso */}
      <div className="flex items-start gap-3.5 pr-16">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-xl shrink-0 shadow-md">
          ✨
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Fase de Pruebas & Calidad
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
            ¡Muchas gracias por ser parte de esta prueba!
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
            Tu participación es clave para medir la capacidad, fluidez y velocidad del sistema.
            Queremos que la experiencia sea perfecta para todas las alumnas.
          </p>
        </div>
      </div>

      {/* Misión Principal de Prueba (Ayuda Visual Sutil para ver videos) */}
      <div className="rounded-2xl bg-surface/80 border border-accent/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
            </span>
            <p className="text-xs font-bold text-accent uppercase tracking-wider">
              Misión principal de la prueba
            </p>
          </div>
          <p className="text-xs sm:text-sm text-text-primary font-medium">
            Entra a las clases y <strong>reproduce los videos</strong> para verificar que carguen sin cortes en tu celular o computadora.
          </p>
        </div>

        <Link
          to="/videos"
          className="btn-accent shrink-0 !py-2.5 !px-5 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <span>▶ Probar Reproducción de Videos</span>
        </Link>
      </div>

      {/* Pie con canales de sugerencias */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/40 text-xs text-text-secondary">
        <p className="flex items-center gap-1.5">
          <span>💡</span>
          <span>¿Notaste algún detalle o tienes una idea para mejorar? ¡Valoramos mucho tus comentarios!</span>
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={waViviUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-white font-bold inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-xl hover:bg-accent/20 transition"
          >
            <span>💬 Sugerencias a Vivi / Dev</span>
          </a>
        </div>
      </div>
    </div>
  );
}

