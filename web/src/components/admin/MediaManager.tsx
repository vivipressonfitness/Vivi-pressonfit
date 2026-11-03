import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MediaBucketManager } from './MediaBucketManager';

type CarouselFilterMode = 'all' | 'image' | 'video';

/**
 * Gestor del Carrusel "Viví la Experiencia" (Comunidad & Entrenamientos):
 * - Control de qué tipo de multimedia (Todo, Fotos, Videos) se proyecta en la Landing.
 * - Sube videos verticales (9:16) y fotos de alumnas/comunidad al bucket members-media.
 * - Los archivos subidos aquí se integran automáticamente en el carrusel continuo.
 */
export function MediaManager() {
  const [carouselFilter, setCarouselFilter] = useState<CarouselFilterMode>('all');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Cargar configuración guardada de landing_config
  useEffect(() => {
    supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'carousel_filter')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const val = typeof data.value === 'string' ? data.value.replace(/^"|"$/g, '') : data.value;
          if (val === 'all' || val === 'image' || val === 'video') {
            setCarouselFilter(val as CarouselFilterMode);
          }
        }
      });
  }, []);

  const handleFilterChange = async (mode: CarouselFilterMode) => {
    setCarouselFilter(mode);
    setSaving(true);
    setSaveMsg(null);

    const { error } = await supabase
      .from('landing_config')
      .upsert({ key: 'carousel_filter', value: mode }, { onConflict: 'key' });

    setSaving(false);
    if (error) {
      setSaveMsg(`Error al guardar: ${error.message}`);
    } else {
      try {
        const cached = localStorage.getItem('vivifit_landing_config');
        const parsed = cached ? JSON.parse(cached) : {};
        parsed.carousel_filter = mode;
        localStorage.setItem('vivifit_landing_config', JSON.stringify(parsed));
      } catch {}

      const modeNames = { all: 'Todo (Fotos y Videos)', image: 'Solo Fotos', video: 'Solo Videos' };
      setSaveMsg(`✅ Carrusel configurado: mostrando "${modeNames[mode]}" en la Landing`);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Control del Carrusel en la Landing */}
      <div className="bg-raised border border-border rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl" aria-hidden="true">🎡</span>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-text-primary">
                Carrusel: "Viví la Experiencia"
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Administra los videos y fotos de la sección <strong>Comunidad & Entrenamientos</strong> del Landing.
            </p>
          </div>

          {/* Selector de modo del carrusel */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">Mostrar en Landing:</span>
            <div className="flex items-center gap-1.5 p-1 bg-background border border-border rounded-2xl">
              {(
                [
                  { id: 'all', label: '✨ Todo' },
                  { id: 'video', label: '🎬 Solo Videos' },
                  { id: 'image', label: '🖼️ Solo Fotos' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={saving}
                  onClick={() => handleFilterChange(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    carouselFilter === item.id
                      ? 'bg-accent text-background shadow-md'
                      : 'text-text-secondary hover:text-white hover:bg-surface'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mensaje de confirmación en vivo */}
        {saveMsg && (
          <div className="p-3.5 rounded-2xl bg-accent/10 border border-accent/30 text-accent text-xs font-semibold">
            {saveMsg}
          </div>
        )}

        {/* Guía rápida para el administrador */}
        <div className="grid md:grid-cols-2 gap-3 text-xs text-text-secondary">
          <div className="p-3.5 rounded-2xl bg-surface border border-border/80 space-y-1">
            <p className="font-bold text-text-primary flex items-center gap-1.5">
              <span>📱</span> Formato Recomendado
            </p>
            <p className="leading-relaxed">
              Sube videos o fotos verticales en formato <strong>9:16 (tipo Reel o historia)</strong>. Aparecerán automáticamente en el carrusel infinito del landing.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface border border-border/80 space-y-1">
            <p className="font-bold text-text-primary flex items-center gap-1.5">
              <span>🛡️</span> Filtro Automático
            </p>
            <p className="leading-relaxed">
              El archivo <code className="text-accent font-mono">LOGO_VIVI.png</code> y los logos están protegidos y <strong>nunca aparecerán</strong> en el carrusel de la comunidad.
            </p>
          </div>
        </div>
      </div>

      {/* Gestor y Subidor Directo de Archivos para el Carrusel */}
      <MediaBucketManager
        title="Subir y Administrar Archivos del Carrusel (Bucket: members-media)"
        compact={false}
      />
    </div>
  );
}
