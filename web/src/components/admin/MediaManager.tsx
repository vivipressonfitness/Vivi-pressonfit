import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MediaBucketManager } from './MediaBucketManager';

type CarouselFilterMode = 'all' | 'image' | 'video';

/**
 * Gestor del Carrusel y Bucket Multimedia para el Panel Admin:
 * - Control centralizado de qué tipo de contenido (Todo, Fotos, Videos) se muestra en la Landing.
 * - Información de exclusiones automáticas (LOGO_VIVI.png).
 * - Gestor completo del bucket con subida, eliminación y vista previa.
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
      // Actualizar caché de localStorage para que la landing lo tome de inmediato
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
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 mb-5">
          <div>
            <h3 className="font-heading font-bold text-xl text-text-primary flex items-center gap-2">
              <span>🎡</span> Selección de Contenido para el Carrusel
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Seleccioná qué tipo de multimedia se proyecta públicamente en el carrusel de la página de inicio.
            </p>
          </div>

          {/* Botones de selección / filtro */}
          <div className="flex items-center gap-2 p-1 bg-background border border-border rounded-xl">
            {(
              [
                { id: 'all', label: '✨ Todo (Fotos & Videos)' },
                { id: 'image', label: '🖼️ Solo Fotos' },
                { id: 'video', label: '🎬 Solo Videos' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={saving}
                onClick={() => handleFilterChange(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  carouselFilter === item.id
                    ? 'bg-accent text-white shadow-md'
                    : 'text-text-secondary hover:text-white hover:bg-surface'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mensaje de confirmación en vivo */}
        {saveMsg && (
          <div className="mb-4 p-3 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-medium animate-fadeIn">
            {saveMsg}
          </div>
        )}

        {/* Aviso de exclusión de LOGO_VIVI.png */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border/80 text-xs text-text-secondary">
          <span className="text-base leading-none">🛡️</span>
          <div>
            <strong className="text-text-primary">Filtro de seguridad del carrusel:</strong> El archivo{' '}
            <code className="bg-background px-1.5 py-0.5 rounded text-accent font-mono">LOGO_VIVI.png</code> y
            los logos del sistema están <strong>excluidos permanentemente</strong> del carrusel público para que solo se
            muestren tus fotos y videos de entrenamiento.
          </div>
        </div>
      </div>

      {/* Gestor del Bucket Multimedia */}
      <MediaBucketManager
        title="Gestor de Archivos Multimedia (Bucket: members-media)"
        compact={false}
      />
    </div>
  );
}
