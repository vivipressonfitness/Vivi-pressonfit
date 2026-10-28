import { DEFAULT_GALLERY_CARDS, type GalleryCardItem } from '../../../hooks/useLandingConfig';
import { GridIcon, SaveIcon, RotateCcwIcon } from '../../ui/Icons';

interface MetodoSectionProps {
  values: Record<string, string>;
  onChangeValue: (key: string, value: string) => void;
  cards: GalleryCardItem[];
  onChangeCards: (cards: GalleryCardItem[]) => void;
  showPreviews: boolean;
  uploadingTarget: string | null;
  onUpload: (target: string, file: File, folder: string, onDone: (url: string) => void) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function MetodoSection({
  values,
  onChangeValue,
  cards,
  onChangeCards,
  showPreviews,
  uploadingTarget,
  onUpload,
  isSaving,
  isDirty,
  onSave,
}: MetodoSectionProps) {
  const updateSingleCard = (id: number, patch: Partial<GalleryCardItem>) => {
    onChangeCards(cards.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <GridIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-text-primary">
                El Método VIVIPRESSONFIT en Acción (6 Tarjetas Temáticas)
              </h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Disciplinas centrales: Entrenamientos Guiados, Tonificación, Cardio, Nutrición, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChangeCards(DEFAULT_GALLERY_CARDS)}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition underline"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Restablecer tarjetas originales
          </button>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-text-secondary block mb-1">
            Título de la Sección en la Landing
          </label>
          <input
            type="text"
            value={values.gallery_title ?? ''}
            onChange={(e) => onChangeValue('gallery_title', e.target.value)}
            placeholder="EL MÉTODO EN ACCIÓN"
            className="w-full max-w-md bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-background border border-border rounded-2xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-accent uppercase">Tarjeta #{card.id}</span>
                  <span className="text-[10px] bg-surface px-2 py-0.5 rounded text-text-secondary border border-border font-mono">
                    4:5
                  </span>
                </div>

                {showPreviews && (
                  <div className="aspect-[4/5] rounded-xl overflow-hidden border border-border my-2 bg-surface">
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <label className="w-full bg-surface hover:bg-white/5 border border-dashed border-border hover:border-accent text-xs font-medium py-2 px-3 rounded-xl transition flex items-center justify-center cursor-pointer mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingTarget === `gallery-${card.id}`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        onUpload(`gallery-${card.id}`, f, 'gallery', (url) => {
                          updateSingleCard(card.id, { image_url: url });
                        });
                      }
                    }}
                  />
                  <span>
                    {uploadingTarget === `gallery-${card.id}` ? 'Subiendo…' : '📁 Cambiar imagen'}
                  </span>
                </label>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      URL de la imagen
                    </label>
                    <input
                      type="text"
                      placeholder="URL imagen"
                      value={card.image_url}
                      onChange={(e) => updateSingleCard(card.id, { image_url: e.target.value })}
                      className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Etiqueta (Badge superior)
                    </label>
                    <input
                      type="text"
                      placeholder="Etiqueta"
                      value={card.tag}
                      onChange={(e) => updateSingleCard(card.id, { tag: e.target.value })}
                      className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none font-semibold text-accent"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Título
                    </label>
                    <input
                      type="text"
                      placeholder="Título"
                      value={card.title}
                      onChange={(e) => updateSingleCard(card.id, { title: e.target.value })}
                      className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none font-bold text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-text-secondary block">
                      Descripción breve
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Descripción"
                      value={card.desc}
                      onChange={(e) => updateSingleCard(card.id, { desc: e.target.value })}
                      className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none text-text-secondary"
                    />
                  </div>
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
            <span className="text-accent font-semibold">● Cambios pendientes en El Método</span>
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
          {isSaving ? 'Guardando…' : 'Guardar El Método en Acción'}
        </button>
      </div>
    </div>
  );
}

