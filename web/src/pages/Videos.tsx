import { useMemo, useState } from 'react';
import { useVideos } from '../hooks/useVideos';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { VideoList } from '../components/video/VideoList';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { Modal } from '../components/ui/Modal';
import type { MembershipContent } from '../types';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Videos() {
  const { allContent, loading, error } = useVideos();
  const { config } = useLandingConfig();
  const [selected, setSelected] = useState<MembershipContent | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todas');
  const [month, setMonth] = useState('todos');

  const handlePlay = (content: MembershipContent) => {
    if (content.bunny_video_id) setSelected(content);
    else if (content.content_url) window.open(content.content_url, '_blank');
    else setSelected(content);
  };

  // Filtros locales: operan solo sobre el arreglo ya cargado por el hook actual.
  const categories = useMemo(
    () => Array.from(new Set(allContent.map((c) => c.category))).sort(),
    [allContent],
  );
  const months = useMemo(
    () =>
      Array.from(
        new Set(allContent.map((c) => c.month_year ?? c.cycle_date.slice(0, 7))),
      ).sort(),
    [allContent],
  );

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return allContent.filter((c) => {
      const matchesQuery =
        q === '' ||
        norm(c.title).includes(q) ||
        (c.description ? norm(c.description).includes(q) : false);
      const matchesCategory = category === 'todas' || c.category === category;
      const cMonth = c.month_year ?? c.cycle_date.slice(0, 7);
      const matchesMonth = month === 'todos' || cMonth === month;
      return matchesQuery && matchesCategory && matchesMonth;
    });
  }, [allContent, query, category, month]);

  const hasActiveFilters = query.trim() !== '' || category !== 'todas' || month !== 'todos';
  const clearFilters = () => {
    setQuery('');
    setCategory('todas');
    setMonth('todos');
  };

  const selectCls =
    'rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent';

  const cleanPhone = (config.whatsapp_number || '').replace(/\D/g, '') || '59178000000';
  const waViviUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    '¡Hola Vivi! Tengo una observación o sugerencia sobre la reproducción de videos en la prueba: '
  )}`;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold">Videos del programa</h1>
        <p className="text-text-secondary">
          Encuentra una clase por nombre o filtra por categoría y ciclo.
          {!loading && !error && (
            <>
              {' '}
              <span aria-live="polite">
                {filtered.length === allContent.length
                  ? `${allContent.length} clase${allContent.length === 1 ? '' : 's'} disponible${allContent.length === 1 ? '' : 's'}.`
                  : `Mostrando ${filtered.length} de ${allContent.length} clases.`}
              </span>
            </>
          )}
        </p>
      </header>

      {/* Banner de Ayuda Visual y Feedback durante la Prueba */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-surface to-accent/10 border border-purple-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
          <div>
            <p className="font-bold text-text-primary text-sm flex items-center gap-1.5">
              <span>🎬</span> ¡Prueba la reproducción en tu pantalla!
            </p>
            <p className="text-text-secondary mt-0.5">
              Haz clic en cualquier clase para comprobar la velocidad de carga, sonido y pantalla completa.
            </p>
          </div>
        </div>
        <a
          href={waViviUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-white font-bold inline-flex items-center justify-center gap-1.5 bg-accent/15 border border-accent/30 px-3.5 py-2 rounded-xl hover:bg-accent/25 transition shrink-0 self-start md:self-auto"
        >
          <span>💬 Enviar Sugerencia</span>
        </a>
      </div>

      {/* Búsqueda y filtros locales */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3" role="search">
        <label className="relative grow sm:max-w-sm">
          <span className="sr-only">Buscar clases por título o descripción</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clases…"
            className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
          />
          <span aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            🔍
          </span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex-1 sm:flex-initial text-sm text-text-secondary">
            <span className="sr-only">Categoría</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectCls} w-full sm:w-auto`}>
              <option value="todas">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="flex-1 sm:flex-initial text-sm text-text-secondary">
            <span className="sr-only">Ciclo</span>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className={`${selectCls} w-full sm:w-auto`}>
              <option value="todos">Todos los ciclos</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs sm:text-sm font-semibold text-accent underline underline-offset-2 hover:text-accent-hover min-h-[38px] px-2"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <VideoList videos={filtered} loading={loading} error={error} onPlay={handlePlay} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="lg">
        {selected?.bunny_video_id ? (
          <VideoPlayer bunnyVideoId={selected.bunny_video_id} title={selected.title} />
        ) : (
          <div className="py-6">
            <p className="text-text-secondary">No hay un reproductor disponible para este contenido.</p>
            {selected?.content_url && (
              <div className="mt-4">
                <a href={selected.content_url} target="_blank" rel="noreferrer" className="btn-accent">
                  Abrir enlace
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
