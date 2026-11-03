import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MediaBucketManager } from './MediaBucketManager';

type CarouselFilterMode = 'all' | 'image' | 'video';

interface BunnyCarouselItem {
  id: string;
  videoId: string;
  title?: string;
  createdAt?: string;
}

const BUNNY_LIBRARY_ID = '796132';

/**
 * Gestor del Carrusel "Viví la Experiencia" (Comunidad & Entrenamientos):
 * - Control de qué tipo de multimedia (Todo, Fotos, Videos) se proyecta en la Landing.
 * - Soporte directo para videos de Bunny Stream (ahorro total de cuota del bucket).
 * - Sube videos verticales (9:16) y fotos de alumnas/comunidad al bucket members-media.
 * - Los archivos subidos aquí se integran automáticamente en el carrusel continuo.
 */
export function MediaManager() {
  const [carouselFilter, setCarouselFilter] = useState<CarouselFilterMode>('all');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Estados de Videos de Bunny Stream para el Carrusel
  const [bunnyVideos, setBunnyVideos] = useState<BunnyCarouselItem[]>([]);
  const [loadingBunny, setLoadingBunny] = useState(true);
  const [bunnyInput, setBunnyInput] = useState('');
  const [bunnyTitleInput, setBunnyTitleInput] = useState('');
  const [savingBunny, setSavingBunny] = useState(false);
  const [bunnyMsg, setBunnyMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Cargar configuración guardada de landing_config
  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      // 1. Cargar filtro del carrusel
      try {
        const { data } = await supabase
          .from('landing_config')
          .select('value')
          .eq('key', 'carousel_filter')
          .maybeSingle();

        if (!cancelled && data?.value) {
          const val = typeof data.value === 'string' ? data.value.replace(/^"|"$/g, '') : data.value;
          if (val === 'all' || val === 'image' || val === 'video') {
            setCarouselFilter(val as CarouselFilterMode);
          }
        }
      } catch (e) {
        console.warn('Error al cargar carousel_filter:', e);
      }

      // 2. Cargar videos de Bunny Stream para el carrusel
      try {
        const { data } = await supabase
          .from('landing_config')
          .select('value')
          .eq('key', 'carousel_bunny_videos')
          .maybeSingle();

        if (!cancelled && data?.value) {
          let list: BunnyCarouselItem[] = [];
          if (typeof data.value === 'string') {
            try {
              list = JSON.parse(data.value);
            } catch {
              list = [];
            }
          } else if (Array.isArray(data.value)) {
            list = data.value as BunnyCarouselItem[];
          }
          setBunnyVideos(list);
        }
      } catch (e) {
        console.warn('Error al cargar carousel_bunny_videos:', e);
      } finally {
        if (!cancelled) {
          setLoadingBunny(false);
        }
      }
    }

    void fetchConfig();

    return () => {
      cancelled = true;
    };
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

  const showBunnyMsg = (text: string, error = false) => {
    setBunnyMsg({ text, error });
    setTimeout(() => {
      setBunnyMsg((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Función para agregar un video de Bunny Stream al carrusel
  const handleAddBunnyVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawVal = bunnyInput.trim();
    if (!rawVal) {
      showBunnyMsg('Ingresa el GUID o enlace del video de Bunny Stream.', true);
      return;
    }

    // Extraer GUID en caso de que hayan pegado una URL completa
    const urlMatch = rawVal.match(/(?:embed|play)\/\d+\/([a-zA-Z0-9-]+)/);
    const videoId = urlMatch ? urlMatch[1] : rawVal.replace(/[^\w-]/g, '');

    if (!videoId || videoId.length < 8) {
      showBunnyMsg('El formato del ID de video no parece válido. Verifica el GUID.', true);
      return;
    }

    if (bunnyVideos.some((v) => v.videoId.toLowerCase() === videoId.toLowerCase())) {
      showBunnyMsg('Este video ya está incluido en el carrusel.', true);
      return;
    }

    setSavingBunny(true);
    const newEntry: BunnyCarouselItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `bv-${Date.now()}`,
      videoId,
      title: bunnyTitleInput.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...bunnyVideos];

    const { error } = await supabase
      .from('landing_config')
      .upsert({ key: 'carousel_bunny_videos', value: updated }, { onConflict: 'key' });

    setSavingBunny(false);
    if (error) {
      showBunnyMsg(`Error al guardar video en Supabase: ${error.message}`, true);
    } else {
      setBunnyVideos(updated);
      setBunnyInput('');
      setBunnyTitleInput('');
      showBunnyMsg(`✅ Video Bunny "${videoId.slice(0, 8)}…" agregado al carrusel.`);
    }
  };

  // Función para eliminar un video de Bunny Stream del carrusel
  const handleDeleteBunnyVideo = async (id: string, videoId: string) => {
    if (!window.confirm(`¿Quitar el video Bunny "${videoId.slice(0, 8)}…" del carrusel público?`)) {
      return;
    }

    const updated = bunnyVideos.filter((v) => v.id !== id);
    const { error } = await supabase
      .from('landing_config')
      .upsert({ key: 'carousel_bunny_videos', value: updated }, { onConflict: 'key' });

    if (error) {
      showBunnyMsg(`Error al eliminar: ${error.message}`, true);
    } else {
      setBunnyVideos(updated);
      showBunnyMsg('🗑️ Video de Bunny Stream eliminado del carrusel.');
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
              <span>📱</span> Formato Vertical Reel (9:16)
            </p>
            <p className="leading-relaxed">
              Tanto los videos de <strong>Bunny Stream</strong> como los del <strong>Bucket</strong> se adaptan al marco vertical del carrusel continuo.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface border border-border/80 space-y-1">
            <p className="font-bold text-text-primary flex items-center gap-1.5">
              <span>⚡</span> Optimización de Ancho de Banda
            </p>
            <p className="leading-relaxed">
              Al cargar videos desde <strong>Bunny Stream</strong> se reproduce mediante CDN global sin gastar espacio ni transferencia en tu bucket de Supabase.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN BUNNY STREAM: VIDEOS DE LA COMUNIDAD */}
      <div className="bg-raised border border-border rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">🎬</span>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-text-primary">
                Videos de Bunny Stream para el Carrusel
              </h3>
              <p className="text-xs text-text-secondary">
                Biblioteca pública configurada (ID: <code className="text-accent font-mono">{BUNNY_LIBRARY_ID}</code>).
              </p>
            </div>
          </div>
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
            {bunnyVideos.length} {bunnyVideos.length === 1 ? 'video activo' : 'videos activos'}
          </span>
        </div>

        {bunnyMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold border ${
              bunnyMsg.error
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
          >
            {bunnyMsg.text}
          </div>
        )}

        {/* Formulario para agregar video Bunny */}
        <form onSubmit={handleAddBunnyVideo} className="bg-background border border-border rounded-2xl p-4 space-y-3">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                ID o URL de Bunny Stream *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 5b4c19a2-4d32-47e1-bf2b-... o enlace de embed"
                className="w-full bg-surface border border-border focus:border-accent rounded-xl px-3.5 py-2 text-xs sm:text-sm text-text-primary outline-none transition"
                value={bunnyInput}
                onChange={(e) => setBunnyInput(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Título o Alumna (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Clase Funcional Alumnas"
                className="w-full bg-surface border border-border focus:border-accent rounded-xl px-3.5 py-2 text-xs sm:text-sm text-text-primary outline-none transition"
                value={bunnyTitleInput}
                onChange={(e) => setBunnyTitleInput(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-text-secondary hidden sm:block">
              Acepta tanto el GUID directo como la URL de incrustación de Bunny Stream.
            </p>
            <button
              type="submit"
              disabled={savingBunny}
              className="btn-accent !py-2 !px-5 text-xs font-bold disabled:opacity-50 ml-auto"
            >
              {savingBunny ? 'Guardando...' : '+ Agregar al Carrusel'}
            </button>
          </div>
        </form>

        {/* Listado de videos de Bunny agregados */}
        {loadingBunny ? (
          <p className="text-xs text-text-secondary py-4 text-center">Cargando videos de Bunny…</p>
        ) : bunnyVideos.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-2xl p-4 text-text-secondary text-xs space-y-1">
            <p className="font-semibold text-text-primary">No hay videos de Bunny Stream agregados aún.</p>
            <p>Ingresa un ID de video arriba para que se proyecte en el carrusel de la comunidad.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
            {bunnyVideos.map((item) => (
              <div
                key={item.id}
                className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-accent/40 transition"
              >
                <div className="relative aspect-[9/16] bg-black/60 overflow-hidden">
                  <img
                    src={`https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${item.videoId}/thumbnail.jpg`}
                    alt={item.title || 'Video Bunny'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback si la miniatura aún no se procesa
                      (e.currentTarget as HTMLImageElement).src = '/landing/thumb-gap.jpg';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-mono flex items-center gap-1">
                    <span>🐰</span>
                    <span>Bunny</span>
                  </div>
                </div>

                <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-xs text-text-primary line-clamp-1">
                      {item.title || 'Video Comunidad'}
                    </p>
                    <p className="text-[10px] font-mono text-text-secondary truncate" title={item.videoId}>
                      {item.videoId}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBunnyVideo(item.id, item.videoId)}
                    className="w-full py-1 text-[11px] font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition text-center border border-rose-500/20"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gestor y Subidor Directo de Archivos para el Carrusel */}
      <MediaBucketManager
        title="Subir y Administrar Archivos Locales del Carrusel (Bucket: members-media)"
        compact={false}
      />
    </div>
  );
}
