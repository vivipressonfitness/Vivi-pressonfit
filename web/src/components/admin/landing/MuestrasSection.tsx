import { LANDING_CLASES, LANDING_EDUCATIVO } from '../../../data/landingMedia';
import type { PreviewItem } from '../../../hooks/useLandingConfig';
import { VideoIcon, SaveIcon, RotateCcwIcon } from '../../ui/Icons';

interface MuestrasSectionProps {
  clasesItems: PreviewItem[];
  onChangeClases: (items: PreviewItem[]) => void;
  recursosItems: PreviewItem[];
  onChangeRecursos: (items: PreviewItem[]) => void;
  showPreviews: boolean;
  uploadingTarget: string | null;
  onUpload: (target: string, file: File, folder: string, onDone: (url: string) => void) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function MuestrasSection({
  clasesItems,
  onChangeClases,
  recursosItems,
  onChangeRecursos,
  showPreviews,
  uploadingTarget,
  onUpload,
  isSaving,
  isDirty,
  onSave,
}: MuestrasSectionProps) {
  const updateClase = (index: number, patch: Partial<PreviewItem>) => {
    onChangeClases(clasesItems.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const updateRecurso = (index: number, patch: Partial<PreviewItem>) => {
    onChangeRecursos(recursosItems.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  return (
    <div className="space-y-8">
      {/* 1. Videos de clases */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-text-primary">
                1. Muestras Gratuitas: Clases en Video
              </h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Demostraciones abiertas en la Landing (GAP, Full Body, Cardio, Fuerza).
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChangeClases(LANDING_CLASES)}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition underline"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Restablecer demos de clases
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clasesItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border rounded-xl p-3 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase block">
                    Clase #{idx + 1}
                  </span>
                  <span className="text-[10px] bg-surface px-1.5 py-0.5 rounded text-text-secondary border border-border">
                    {item.category}
                  </span>
                </div>

                {showPreviews && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-border my-2 bg-black relative">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">
                        Sin miniatura
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">
                      Miniatura (Thumbnail)
                    </label>
                    <label className="w-full bg-surface hover:bg-white/5 border border-dashed border-border text-[11px] py-1.5 px-2 rounded-lg transition flex items-center justify-center cursor-pointer mb-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingTarget === `clase-thumb-${idx}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            onUpload(`clase-thumb-${idx}`, f, 'clases', (url) => {
                              updateClase(idx, { thumbnail_url: url });
                            });
                          }
                        }}
                      />
                      <span>
                        {uploadingTarget === `clase-thumb-${idx}`
                          ? 'Subiendo…'
                          : '📁 Subir miniatura'}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="URL miniatura"
                      value={item.thumbnail_url || ''}
                      onChange={(e) => updateClase(idx, { thumbnail_url: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      URL del Video (MP4 / Bunny / Vimeo)
                    </label>
                    <input
                      type="text"
                      placeholder="/landing/demo-...mp4 o https://..."
                      value={item.video_url || ''}
                      onChange={(e) => updateClase(idx, { video_url: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Título de la clase
                    </label>
                    <input
                      type="text"
                      placeholder="Título"
                      value={item.title}
                      onChange={(e) => updateClase(idx, { title: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none font-bold text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Descripción breve
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Descripción"
                      value={item.desc}
                      onChange={(e) => updateClase(idx, { desc: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none text-text-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recursos educativos y nutrición */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <VideoIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-text-primary">
                2. Muestras Educativas y Nutrición
              </h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Micro-talleres, guías de platos balanceados y teasers de la comunidad.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChangeRecursos(LANDING_EDUCATIVO)}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition underline"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Restablecer recursos iniciales
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recursosItems.map((item, idx) => (
            <div
              key={idx}
              className="bg-background border border-border rounded-xl p-3 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-accent uppercase block">
                    Recurso #{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      item.locked
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {item.locked ? '🔒 Bloqueado' : '▶ Abierto'}
                  </span>
                </div>

                {showPreviews && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-border my-2 bg-black relative">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">
                        Sin miniatura
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block mb-1">
                      Miniatura (Thumbnail)
                    </label>
                    <label className="w-full bg-surface hover:bg-white/5 border border-dashed border-border text-[11px] py-1.5 px-2 rounded-lg transition flex items-center justify-center cursor-pointer mb-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingTarget === `recurso-thumb-${idx}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            onUpload(`recurso-thumb-${idx}`, f, 'recursos', (url) => {
                              updateRecurso(idx, { thumbnail_url: url });
                            });
                          }
                        }}
                      />
                      <span>
                        {uploadingTarget === `recurso-thumb-${idx}`
                          ? 'Subiendo…'
                          : '📁 Subir miniatura'}
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="URL miniatura"
                      value={item.thumbnail_url || ''}
                      onChange={(e) => updateRecurso(idx, { thumbnail_url: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      URL de Video
                    </label>
                    <input
                      type="text"
                      placeholder="URL de video (opcional)"
                      value={item.video_url || ''}
                      onChange={(e) => updateRecurso(idx, { video_url: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Título
                    </label>
                    <input
                      type="text"
                      placeholder="Título"
                      value={item.title}
                      onChange={(e) => updateRecurso(idx, { title: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none font-bold text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Descripción breve
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Descripción"
                      value={item.desc}
                      onChange={(e) => updateRecurso(idx, { desc: e.target.value })}
                      className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none text-text-secondary"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(item.locked)}
                      onChange={(e) => updateRecurso(idx, { locked: e.target.checked })}
                      className="w-4 h-4 accent-accent"
                    />
                    <span>Contenido bloqueado (Requiere suscripción activa)</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de guardado de sección */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-text-secondary">
          {isDirty ? (
            <span className="text-accent font-semibold">● Cambios pendientes en Clases &amp; Muestras</span>
          ) : (
            'Sección guardada y sincronizada'
          )}
        </span>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 bg-accent hover:bg-white text-background font-bold text-xs px-5 py-2.5 rounded-pill transition shadow-sm disabled:opacity-50"
        >
          <SaveIcon className="w-3.5 h-3.5" />
          {isSaving ? 'Guardando…' : 'Guardar Clases & Recursos'}
        </button>
      </div>
    </div>
  );
}

