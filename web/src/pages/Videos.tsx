import { useMemo, useState } from 'react';
import { useVideos } from '../hooks/useVideos';
import { VideoList } from '../components/video/VideoList';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { Modal } from '../components/ui/Modal';
import type { MembershipContent } from '../types';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function Videos() {
  const { allContent, loading, error } = useVideos();
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

      {/* Búsqueda y filtros locales */}
      <div className="flex flex-wrap items-center gap-3" role="search">
        <label className="relative grow min-w-[220px] max-w-sm">
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
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="sr-only sm:not-sr-only">Categoría</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
            <option value="todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="sr-only sm:not-sr-only">Ciclo</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
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
            className="text-sm font-semibold text-accent underline underline-offset-2 hover:text-accent-hover min-h-[40px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Limpiar filtros
          </button>
        )}
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
