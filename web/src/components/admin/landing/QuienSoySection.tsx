import { DEFAULT_QUIEN_SOY_IMAGES, type QuienSoyImageItem } from '../../../hooks/useLandingConfig';
import { UserIcon, SaveIcon, RotateCcwIcon } from '../../ui/Icons';

interface QuienSoySectionProps {
  values: Record<string, string>;
  onChangeValue: (key: string, value: string) => void;
  images: QuienSoyImageItem[];
  onChangeImages: (images: QuienSoyImageItem[]) => void;
  showPreviews: boolean;
  uploadingTarget: string | null;
  onUpload: (target: string, file: File, folder: string, onDone: (url: string) => void) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function QuienSoySection({
  values,
  onChangeValue,
  images,
  onChangeImages,
  showPreviews,
  uploadingTarget,
  onUpload,
  isSaving,
  isDirty,
  onSave,
}: QuienSoySectionProps) {
  const updateSingleImage = (id: number, patch: Partial<QuienSoyImageItem>) => {
    onChangeImages(images.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-text-primary">
                Sección "¿Quién Soy?": Biografía y Galería de Vivi
              </h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Personaliza el mensaje personal de la coach y su carrusel de 6 fotos auténticas.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChangeImages(DEFAULT_QUIEN_SOY_IMAGES)}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition underline"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Restablecer 6 fotos iniciales
          </button>
        </div>

        {/* Textos de la sección */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">
              Título de la Sección
            </label>
            <input
              type="text"
              value={values.quien_soy_title ?? ''}
              onChange={(e) => onChangeValue('quien_soy_title', e.target.value)}
              placeholder="¿QUIÉN SOY?"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">
              Subtítulo / Badge Superior
            </label>
            <input
              type="text"
              value={values.quien_soy_subtitle ?? ''}
              onChange={(e) => onChangeValue('quien_soy_subtitle', e.target.value)}
              placeholder="CONOCE A TU ENTRENADORA"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">
              Biografía / Manifiesto de la Coach
            </label>
            <textarea
              rows={4}
              value={values.quien_soy_bio ?? ''}
              onChange={(e) => onChangeValue('quien_soy_bio', e.target.value)}
              placeholder="Soy Vivi, entrenadora apasionada por crear hábitos sostenibles..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Las 6 fotos personales */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-text-secondary block">
            6 Fotografías Personales de Vivi (Proporción 4:5 vertical)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="bg-background border border-border rounded-xl p-3 flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-accent uppercase">Foto #{img.id}</span>
                    <span className="text-[10px] text-text-secondary font-mono">4:5</span>
                  </div>

                  {showPreviews && (
                    <div className="aspect-[4/5] rounded-lg overflow-hidden border border-border my-2 bg-surface">
                      <img
                        src={img.image_url}
                        alt={`Vivi #${img.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `/landing/gallery/${img.id}.jpg`;
                        }}
                      />
                    </div>
                  )}

                  <label className="w-full bg-surface hover:bg-white/5 border border-dashed border-border hover:border-accent text-[11px] font-medium py-1.5 px-2 rounded-lg transition flex items-center justify-center cursor-pointer mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingTarget === `quien-soy-${img.id}`}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          onUpload(`quien-soy-${img.id}`, f, 'quien-soy', (url) => {
                            updateSingleImage(img.id, { image_url: url });
                          });
                        }
                      }}
                    />
                    <span>
                      {uploadingTarget === `quien-soy-${img.id}` ? 'Subiendo…' : '📁 Cambiar foto'}
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="URL imagen"
                    value={img.image_url}
                    onChange={(e) => updateSingleImage(img.id, { image_url: e.target.value })}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono mb-2"
                  />

                  <input
                    type="text"
                    placeholder="Pie de foto"
                    value={img.caption || ''}
                    onChange={(e) => updateSingleImage(img.id, { caption: e.target.value })}
                    className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de guardado de sección */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-text-secondary">
          {isDirty ? (
            <span className="text-accent font-semibold">● Cambios pendientes en ¿Quién Soy?</span>
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
          {isSaving ? 'Guardando…' : 'Guardar Sección ¿Quién Soy?'}
        </button>
      </div>
    </div>
  );
}

