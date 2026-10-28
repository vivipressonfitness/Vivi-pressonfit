import { useRef } from 'react';
import { GearIcon, SaveIcon } from '../../ui/Icons';
import { BASE_OFFER } from '../../../lib/offer';

interface OfertaSectionProps {
  values: Record<string, string>;
  onChangeValue: (key: string, value: string) => void;
  showPreviews: boolean;
  uploadingTarget: string | null;
  onUpload: (target: string, file: File, folder: string, onDone: (url: string) => void) => void;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function OfertaSection({
  values,
  onChangeValue,
  showPreviews,
  uploadingTarget,
  onUpload,
  isSaving,
  isDirty,
  onSave,
}: OfertaSectionProps) {
  const nutFileRef = useRef<HTMLInputElement>(null);

  const priceNum = Number(values.monthly_price);
  const isPriceValid = !isNaN(priceNum) && priceNum > 0;

  return (
    <div className="space-y-6">
      {/* 1. Parámetros Comerciales */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <GearIcon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-heading font-bold text-text-primary">
              Parámetros Comerciales &amp; Contacto
            </h3>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Configuración del modelo de negocio, valor de la membresía y canal oficial de soporte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-background border border-border rounded-xl p-4 space-y-2">
            <label className="text-xs uppercase font-bold text-text-secondary block">
              Precio Mensual (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-text-secondary">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={values.monthly_price ?? ''}
                onChange={(e) => onChangeValue('monthly_price', e.target.value)}
                placeholder={String(BASE_OFFER.monthlyPrice)}
                className={`w-full bg-surface border ${
                  !isPriceValid ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'
                } rounded-xl pl-8 pr-4 py-2 text-sm font-bold outline-none`}
              />
            </div>
            {!isPriceValid ? (
              <p className="text-[11px] text-red-400">
                El precio mensual debe ser un valor numérico mayor a 0 (ej: 40).
              </p>
            ) : (
              <p className="text-[11px] text-text-secondary">
                Base actual: ${priceNum} USD/mes con {BASE_OFFER.trialDays} días de prueba gratuita garantizados.
              </p>
            )}
          </div>

          <div className="bg-background border border-border rounded-xl p-4 space-y-2">
            <label className="text-xs uppercase font-bold text-text-secondary block">
              WhatsApp Oficial (con código de país)
            </label>
            <input
              type="text"
              value={values.whatsapp_number ?? ''}
              onChange={(e) => onChangeValue('whatsapp_number', e.target.value.replace(/\D/g, ''))}
              placeholder="584120000000"
              className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm font-mono focus:border-accent outline-none"
            />
            <p className="text-[11px] text-text-secondary">
              Solo dígitos numéricos. Se utiliza para el botón flotante y consultas de soporte.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Títulos de Secciones e Imagen Nutricional */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-3">
          <h3 className="text-lg font-heading font-bold text-text-primary">
            Títulos de Secciones e Imagen Nutricional
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Encabezados de bloques informativos e imagen de la sección de nutrición.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">
              Título Sección Pilares
            </label>
            <input
              type="text"
              value={values.pilares_title ?? ''}
              onChange={(e) => onChangeValue('pilares_title', e.target.value)}
              placeholder="NUESTROS PILARES"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none font-semibold"
            />
          </div>

          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">
              Título Sección Membresía
            </label>
            <input
              type="text"
              value={values.membresias_title ?? ''}
              onChange={(e) => onChangeValue('membresias_title', e.target.value)}
              placeholder="ELIGE TU PLAN DE TRANSFORMACIÓN"
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none font-semibold"
            />
          </div>
        </div>

        {/* Imagen de Nutrición */}
        <div className="bg-background border border-border rounded-xl p-4 space-y-3">
          <h4 className="text-xs uppercase font-bold text-text-secondary">
            Imagen Destacada: Sección Nutrición
          </h4>
          {showPreviews && values.educacion_image && (
            <div className="aspect-[4/3] max-w-sm rounded-lg overflow-hidden border border-border bg-surface">
              <img
                src={values.educacion_image}
                alt="Nutricion Destacada"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <input
                ref={nutFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    onUpload('nut-img', f, 'educativo', (url) => onChangeValue('educacion_image', url));
                  }
                }}
              />
              <button
                type="button"
                disabled={uploadingTarget === 'nut-img'}
                onClick={() => nutFileRef.current?.click()}
                className="w-full bg-surface border border-dashed border-border hover:border-accent text-xs py-2 px-3 rounded-lg transition"
              >
                {uploadingTarget === 'nut-img' ? 'Subiendo…' : '📁 Subir nueva foto de Nutrición'}
              </button>
            </div>
            <div>
              <input
                type="text"
                value={values.educacion_image ?? ''}
                onChange={(e) => onChangeValue('educacion_image', e.target.value)}
                placeholder="https://..."
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
            <span className="text-accent font-semibold">● Cambios pendientes en Oferta &amp; Parámetros</span>
          ) : (
            'Sección guardada y sincronizada'
          )}
        </span>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !isPriceValid}
          className="inline-flex items-center gap-2 bg-accent hover:bg-white text-background font-bold text-xs px-5 py-2.5 rounded-pill transition shadow-sm disabled:opacity-50"
        >
          <SaveIcon className="w-3.5 h-3.5" />
          {isSaving ? 'Guardando…' : 'Guardar Oferta & Ajustes'}
        </button>
      </div>
    </div>
  );
}
