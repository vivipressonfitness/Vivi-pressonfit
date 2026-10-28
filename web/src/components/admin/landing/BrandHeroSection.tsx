import { useRef } from 'react';
import { DEFAULT_CONFIG } from '../../../hooks/useLandingConfig';
import { SparklesIcon, SaveIcon, RotateCcwIcon } from '../../ui/Icons';

interface BrandHeroSectionProps {
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  showPreviews: boolean;
  uploadingTarget: string | null;
  onUpload: (target: string, file: File, folder: string, onDone: (url: string) => void) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function BrandHeroSection({
  values,
  onChange,
  showPreviews,
  uploadingTarget,
  onUpload,
  isSaving,
  isDirty,
  onSave,
}: BrandHeroSectionProps) {
  const logoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const logoHeight = Number(values.logo_height) || DEFAULT_CONFIG.logo_height;
  const logoUrl = values.logo_url || DEFAULT_CONFIG.logo_url;
  const heroImageUrl = values.hero_image || DEFAULT_CONFIG.hero_image;

  return (
    <div className="space-y-6">
      {/* 1. Logotipo e Identidad Visual */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-heading font-bold text-text-primary">Identidad de Marca: Logotipo</h3>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Controla la imagen del logotipo y su tamaño visible en el Header y Footer del sitio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('logo_url', DEFAULT_CONFIG.logo_url);
              onChange('logo_height', String(DEFAULT_CONFIG.logo_height));
            }}
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition underline"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            Restablecer logo original
          </button>
        </div>

        {showPreviews && (
          <div className="bg-background/90 border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[90px] gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              Vista Previa en Miniatura (Header)
            </span>
            <img
              src={logoUrl}
              alt="Logo Preview"
              style={{ height: `${logoHeight}px` }}
              className="w-auto object-contain max-w-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_CONFIG.logo_url;
              }}
            />
            <span className="text-xs text-text-secondary font-mono">{logoHeight}px de altura</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">
              Subir Logo desde tu equipo
            </label>
            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload('logo', f, 'logo', (url) => onChange('logo_url', url));
              }}
            />
            <button
              type="button"
              disabled={uploadingTarget === 'logo'}
              onClick={() => logoFileRef.current?.click()}
              className="w-full bg-background border border-dashed border-border hover:border-accent text-sm py-2.5 px-4 rounded-xl transition"
            >
              {uploadingTarget === 'logo' ? 'Subiendo logo…' : '📁 Seleccionar archivo de imagen'}
            </button>
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">
              O pegar URL directa de imagen
            </label>
            <input
              type="text"
              value={values.logo_url ?? ''}
              onChange={(e) => onChange('logo_url', e.target.value)}
              placeholder="/landing/logo-vivipressonfit.jpg o https://..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>
        </div>

        <div className="bg-background/50 border border-border/60 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs uppercase font-bold text-text-secondary">
              Altura visible del Logo (píxeles)
            </label>
            <span className="text-xs font-mono font-bold text-accent">{logoHeight}px</span>
          </div>
          <input
            type="range"
            min={32}
            max={120}
            step={2}
            value={logoHeight}
            onChange={(e) => onChange('logo_height', e.target.value)}
            className="w-full accent-accent cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Sección Hero */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="border-b border-border pb-3">
          <h3 className="text-lg font-heading font-bold text-text-primary">Contenido Principal: Hero</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            El primer impacto visual que ven tus visitantes al entrar a la plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">
              Título Principal del Hero
            </label>
            <input
              type="text"
              value={values.hero_title ?? ''}
              onChange={(e) => onChange('hero_title', e.target.value)}
              placeholder="TRANSFORMA TU CUERPO Y TU ENERGÍA"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold focus:border-accent outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">
              Texto Destacado en Rosa (Énfasis)
            </label>
            <input
              type="text"
              value={values.hero_title_sub ?? ''}
              onChange={(e) => onChange('hero_title_sub', e.target.value)}
              placeholder="DESDE CUALQUIER LUGAR"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-accent focus:border-accent outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">
              Descripción / Bajada del Hero
            </label>
            <textarea
              rows={3}
              value={values.hero_sub ?? ''}
              onChange={(e) => onChange('hero_sub', e.target.value)}
              placeholder="Entrenamientos guiados, programas progresivos y nutrición real..."
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* Imagen del Hero */}
        <div className="bg-background border border-border rounded-xl p-4 space-y-3">
          <h4 className="text-xs uppercase font-bold text-text-secondary">Fotografía Principal del Hero</h4>
          {showPreviews && heroImageUrl && (
            <div className="aspect-[16/9] max-w-md mx-auto rounded-lg overflow-hidden border border-border bg-surface">
              <img src={heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <input
                ref={heroFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload('hero-img', f, 'hero', (url) => onChange('hero_image', url));
                }}
              />
              <button
                type="button"
                disabled={uploadingTarget === 'hero-img'}
                onClick={() => heroFileRef.current?.click()}
                className="w-full bg-surface border border-dashed border-border hover:border-accent text-xs py-2 px-3 rounded-lg transition"
              >
                {uploadingTarget === 'hero-img' ? 'Subiendo…' : '📁 Subir nueva foto del Hero'}
              </button>
            </div>
            <div>
              <input
                type="text"
                value={values.hero_image ?? ''}
                onChange={(e) => onChange('hero_image', e.target.value)}
                placeholder="/landing/coach-whatsapp.jpg o https://..."
                className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs font-mono focus:border-accent outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardado de sección */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-text-secondary">
          {isDirty ? (
            <span className="text-accent font-semibold">● Cambios pendientes en Identidad &amp; Hero</span>
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
          {isSaving ? 'Guardando…' : 'Guardar Identidad & Hero'}
        </button>
      </div>
    </div>
  );
}

