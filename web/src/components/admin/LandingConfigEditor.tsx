import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  DEFAULT_CONFIG,
  DEFAULT_GALLERY_CARDS,
  DEFAULT_QUIEN_SOY_IMAGES,
  type GalleryCardItem,
  type QuienSoyImageItem,
  type LandingConfig,
  type PreviewItem,
} from '../../hooks/useLandingConfig';
import { LANDING_CLASES, LANDING_EDUCATIVO } from '../../data/landingMedia';
import { uploadLandingImage } from '../../lib/landingUpload';

const FIELDS: Array<{ key: keyof LandingConfig; label: string; type: 'text' | 'number' | 'textarea' | 'url' }> = [
  { key: 'monthly_price', label: 'Precio mensual (USD)', type: 'number' },
  { key: 'whatsapp_number', label: 'WhatsApp (con código país, solo dígitos)', type: 'text' },
  { key: 'hero_title', label: 'Hero — título', type: 'text' },
  { key: 'hero_title_sub', label: 'Hero — título resaltado (rosa)', type: 'text' },
  { key: 'hero_sub', label: 'Hero — descripción', type: 'textarea' },
  { key: 'pilares_title', label: 'Sección Pilares — título', type: 'text' },
  { key: 'membresias_title', label: 'Sección Membresía — título', type: 'text' },
  { key: 'hero_image', label: 'Hero — URL imagen principal', type: 'url' },
  { key: 'educacion_image', label: 'Nutrición — URL imagen destacada', type: 'url' },
];

export function LandingConfigEditor() {
  // Checkbox de previsualización en miniatura
  const [showPreviews, setShowPreviews] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vivifit_admin_show_previews');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [galleryCards, setGalleryCards] = useState<GalleryCardItem[]>(DEFAULT_GALLERY_CARDS);
  const [quienSoyImages, setQuienSoyImages] = useState<QuienSoyImageItem[]>(DEFAULT_QUIEN_SOY_IMAGES);
  const [clasesItems, setClasesItems] = useState<PreviewItem[]>(LANDING_CLASES);
  const [recursosItems, setRecursosItems] = useState<PreviewItem[]>(LANDING_EDUCATIVO);

  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const logoFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const nutFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('landing_config').select('key, value').then(({ data }) => {
      const rows = (data ?? []) as Array<{ key: string; value: unknown }>;
      const map: Record<string, string> = {};
      for (const row of rows) {
        map[row.key] = String(row.value).replace(/^"|"$/g, '');
      }

      const initial: Record<string, string> = {};
      for (const f of FIELDS) {
        initial[f.key] = map[f.key] ?? String(DEFAULT_CONFIG[f.key]);
      }
      initial.logo_url = map.logo_url ?? String(DEFAULT_CONFIG.logo_url);
      initial.logo_height = map.logo_height ?? String(DEFAULT_CONFIG.logo_height);
      initial.gallery_title = map.gallery_title ?? String(DEFAULT_CONFIG.gallery_title);
      initial.quien_soy_title = map.quien_soy_title ?? String(DEFAULT_CONFIG.quien_soy_title);
      initial.quien_soy_subtitle = map.quien_soy_subtitle ?? String(DEFAULT_CONFIG.quien_soy_subtitle);
      initial.quien_soy_bio = map.quien_soy_bio ?? String(DEFAULT_CONFIG.quien_soy_bio);
      setValues(initial);

      // Galería El Método
      const rawGallery = rows.find((r) => r.key === 'gallery_cards')?.value;
      if (rawGallery) {
        try {
          const parsed = typeof rawGallery === 'string' ? JSON.parse(rawGallery) : rawGallery;
          if (Array.isArray(parsed) && parsed.length > 0) setGalleryCards(parsed);
        } catch {}
      }

      // Fotos ¿Quién Soy?
      const rawQuienSoy = rows.find((r) => r.key === 'quien_soy_images')?.value;
      if (rawQuienSoy) {
        try {
          const parsed = typeof rawQuienSoy === 'string' ? JSON.parse(rawQuienSoy) : rawQuienSoy;
          if (Array.isArray(parsed) && parsed.length > 0) setQuienSoyImages(parsed);
        } catch {}
      }

      // Videos de clases
      const rawClases = rows.find((r) => r.key === 'preview_clases')?.value;
      if (rawClases) {
        try {
          const parsed = typeof rawClases === 'string' ? JSON.parse(rawClases) : rawClases;
          if (Array.isArray(parsed) && parsed.length > 0) setClasesItems(parsed);
        } catch {}
      }

      // Videos y recursos educativos
      const rawRecursos = rows.find((r) => r.key === 'preview_recursos')?.value;
      if (rawRecursos) {
        try {
          const parsed = typeof rawRecursos === 'string' ? JSON.parse(rawRecursos) : rawRecursos;
          if (Array.isArray(parsed) && parsed.length > 0) setRecursosItems(parsed);
        } catch {}
      }
    });
  }, []);

  const togglePreviews = (checked: boolean) => {
    setShowPreviews(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vivifit_admin_show_previews', String(checked));
    }
  };

  const saveSingle = async (key: keyof LandingConfig) => {
    setSaving(key);
    setMsg(null);
    const value = (key === 'monthly_price' || key === 'logo_height')
      ? Number(values[key] ?? 0)
      : values[key] ?? '';
    const { error } = await supabase
      .from('landing_config')
      .upsert({ key, value }, { onConflict: 'key' });
    setSaving(null);
    setMsg(error ? `Error al guardar ${key}: ${error.message}` : `✅ "${key}" guardado correctamente`);
  };

  const saveLogo = async () => {
    setSaving('logo');
    setMsg(null);
    const logoUrl = values.logo_url || DEFAULT_CONFIG.logo_url;
    const logoHeight = Number(values.logo_height) || DEFAULT_CONFIG.logo_height;

    const { error: err1 } = await supabase
      .from('landing_config')
      .upsert({ key: 'logo_url', value: logoUrl }, { onConflict: 'key' });
    const { error: err2 } = await supabase
      .from('landing_config')
      .upsert({ key: 'logo_height', value: logoHeight }, { onConflict: 'key' });

    setSaving(null);
    if (err1 || err2) setMsg(`Error al guardar logo: ${(err1 || err2)?.message}`);
    else setMsg('✅ Logo y tamaño guardados con éxito');
  };

  const saveQuienSoy = async () => {
    setSaving('quien_soy');
    setMsg(null);
    const { error: err1 } = await supabase
      .from('landing_config')
      .upsert({ key: 'quien_soy_title', value: values.quien_soy_title }, { onConflict: 'key' });
    const { error: err2 } = await supabase
      .from('landing_config')
      .upsert({ key: 'quien_soy_subtitle', value: values.quien_soy_subtitle }, { onConflict: 'key' });
    const { error: err3 } = await supabase
      .from('landing_config')
      .upsert({ key: 'quien_soy_bio', value: values.quien_soy_bio }, { onConflict: 'key' });
    const { error: err4 } = await supabase
      .from('landing_config')
      .upsert({ key: 'quien_soy_images', value: quienSoyImages }, { onConflict: 'key' });

    setSaving(null);
    const err = err1 || err2 || err3 || err4;
    if (err) setMsg(`Error al guardar sección ¿Quién Soy?: ${err.message}`);
    else setMsg('✅ Sección ¿Quién Soy? y sus 6 fotos guardadas exitosamente');
  };

  const saveGallery = async () => {
    setSaving('gallery');
    setMsg(null);
    const { error: err1 } = await supabase
      .from('landing_config')
      .upsert({ key: 'gallery_title', value: values.gallery_title }, { onConflict: 'key' });
    const { error: err2 } = await supabase
      .from('landing_config')
      .upsert({ key: 'gallery_cards', value: galleryCards }, { onConflict: 'key' });

    setSaving(null);
    const err = err1 || err2;
    if (err) setMsg(`Error al guardar El Método: ${err.message}`);
    else setMsg('✅ Sección El Método en Acción (6 tarjetas) guardada exitosamente');
  };

  const saveClases = async () => {
    setSaving('clases');
    setMsg(null);
    const { error } = await supabase
      .from('landing_config')
      .upsert({ key: 'preview_clases', value: clasesItems }, { onConflict: 'key' });
    setSaving(null);
    if (error) setMsg(`Error al guardar videos de clases: ${error.message}`);
    else setMsg('✅ Videos de clases de adelanto guardados exitosamente');
  };

  const saveRecursos = async () => {
    setSaving('recursos');
    setMsg(null);
    const { error } = await supabase
      .from('landing_config')
      .upsert({ key: 'preview_recursos', value: recursosItems }, { onConflict: 'key' });
    setSaving(null);
    if (error) setMsg(`Error al guardar recursos educativos: ${error.message}`);
    else setMsg('✅ Videos y recursos educativos guardados exitosamente');
  };

  const uploadFile = async (targetTag: string, file: File, folder: string, onDone: (url: string) => void) => {
    setUploadingTarget(targetTag);
    setMsg(null);
    try {
      const publicUrl = await uploadLandingImage(file, folder);
      onDone(publicUrl);
      setMsg('✅ Archivo subido exitosamente a Storage. Recuerda hacer clic en "Guardar" para confirmar.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al subir';
      setMsg(`Error al subir: ${message}`);
    } finally {
      setUploadingTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* BARRA SUPERIOR: CHECKBOX DE PREVIEWS EN MINIATURA */}
      <div className="bg-surface border-2 border-accent/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showPreviews}
            onChange={(e) => togglePreviews(e.target.checked)}
            className="w-5 h-5 accent-accent rounded cursor-pointer"
          />
          <div>
            <span className="text-sm font-bold text-text-primary block">
              Mostrar vistas previas en miniatura del contenido
            </span>
            <span className="text-xs text-text-secondary">
              Activa o desactiva las miniaturas visuales de fotos y videos en este panel para mayor comodidad.
            </span>
          </div>
        </label>
        <span className={`text-xs font-bold px-3 py-1 rounded-pill ${showPreviews ? 'bg-accent/20 text-accent' : 'bg-raised text-text-secondary'}`}>
          {showPreviews ? '👁️ Miniaturas Visibles' : '📁 Modo Compacto'}
        </span>
      </div>

      {msg && (
        <div className="bg-accent/15 border border-accent/40 text-text-primary p-3 rounded-xl text-sm font-medium">
          {msg}
        </div>
      )}

      {/* 1. SECCIÓN: LOGO DE LA MARCA */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">1. Identidad de Marca: Logo</h3>
            <p className="text-xs text-text-secondary">Personaliza la imagen y el tamaño visible en el Header y Footer.</p>
          </div>
          <button
            type="button"
            onClick={() => setValues((v) => ({ ...v, logo_url: DEFAULT_CONFIG.logo_url, logo_height: String(DEFAULT_CONFIG.logo_height) }))}
            className="text-xs text-text-secondary hover:text-accent transition underline"
          >
            Restablecer logo original
          </button>
        </div>

        {showPreviews && (
          <div className="bg-background/90 border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[90px] gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-text-secondary uppercase">
              Vista Previa en Miniatura (Header)
            </span>
            <img
              src={values.logo_url || DEFAULT_CONFIG.logo_url}
              alt="Logo Preview"
              style={{ height: `${Number(values.logo_height) || DEFAULT_CONFIG.logo_height}px` }}
              className="w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_CONFIG.logo_url; }}
            />
            <span className="text-xs text-text-secondary font-mono">{Number(values.logo_height) || DEFAULT_CONFIG.logo_height}px</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">Subir Logo desde tu PC</label>
            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile('logo', f, 'logo', (url) => setValues((v) => ({ ...v, logo_url: url })));
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
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1.5">O pegar URL de imagen</label>
            <input
              type="text"
              value={values.logo_url ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, logo_url: e.target.value }))}
              placeholder="/landing/logo-vivipressonfit.jpg o https://..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>
        </div>

        <div className="bg-background/50 border border-border/60 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs uppercase font-bold text-text-secondary">Tamaño del Logo (Altura en Píxeles)</label>
            <span className="text-xs font-mono font-bold text-accent">{values.logo_height || DEFAULT_CONFIG.logo_height}px</span>
          </div>
          <input
            type="range"
            min={32}
            max={120}
            step={2}
            value={Number(values.logo_height) || DEFAULT_CONFIG.logo_height}
            onChange={(e) => setValues((v) => ({ ...v, logo_height: e.target.value }))}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        <button
          type="button"
          onClick={saveLogo}
          disabled={saving === 'logo'}
          className="bg-accent hover:bg-white text-background font-bold text-sm px-6 py-2 rounded-pill transition"
        >
          {saving === 'logo' ? 'Guardando…' : 'Guardar Logo'}
        </button>
      </div>

      {/* 2. SECCIÓN: ¿QUIÉN SOY? (CON LAS FOTOS 1-6 DE VIVI) */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">2. Sección "¿Quién Soy?" (6 Fotos Personales de Vivi)</h3>
            <p className="text-xs text-text-secondary">Edita el título, subtítulo, biografía y las 6 fotografías de la coach.</p>
          </div>
          <button
            type="button"
            onClick={() => setQuienSoyImages(DEFAULT_QUIEN_SOY_IMAGES)}
            className="text-xs text-text-secondary hover:text-accent transition underline"
          >
            Restablecer fotos iniciales
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">Título de la Sección</label>
            <input
              type="text"
              value={values.quien_soy_title ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, quien_soy_title: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">Subtítulo (Badge)</label>
            <input
              type="text"
              value={values.quien_soy_subtitle ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, quien_soy_subtitle: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs uppercase font-bold text-text-secondary block mb-1">Biografía / Mensaje de la Coach</label>
            <textarea
              rows={3}
              value={values.quien_soy_bio ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, quien_soy_bio: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
            />
          </div>
        </div>

        {/* 6 Fotos Personales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quienSoyImages.map((img) => (
            <div key={img.id} className="bg-background border border-border rounded-xl p-3 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-accent uppercase block">Foto #{img.id}</span>
                {showPreviews && (
                  <div className="aspect-[4/5] rounded-lg overflow-hidden border border-border my-2 bg-surface">
                    <img
                      src={img.image_url}
                      alt={`Vivi #${img.id}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `/landing/gallery/${img.id}.jpg`; }}
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
                      if (f) uploadFile(`quien-soy-${img.id}`, f, 'quien-soy', (url) => {
                        setQuienSoyImages((prev) => prev.map((item) => item.id === img.id ? { ...item, image_url: url } : item));
                      });
                    }}
                  />
                  <span>{uploadingTarget === `quien-soy-${img.id}` ? 'Subiendo…' : '📁 Subir foto'}</span>
                </label>
                <input
                  type="text"
                  placeholder="URL imagen"
                  value={img.image_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuienSoyImages((prev) => prev.map((item) => item.id === img.id ? { ...item, image_url: val } : item));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono mb-2"
                />
                <input
                  type="text"
                  placeholder="Pie de foto"
                  value={img.caption || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuienSoyImages((prev) => prev.map((item) => item.id === img.id ? { ...item, caption: val } : item));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveQuienSoy}
          disabled={saving === 'quien_soy'}
          className="bg-accent hover:bg-white text-background font-bold text-sm px-6 py-2 rounded-pill transition"
        >
          {saving === 'quien_soy' ? 'Guardando…' : 'Guardar Sección ¿Quién Soy? (Textos y 6 Fotos)'}
        </button>
      </div>

      {/* 3. SECCIÓN: EL MÉTODO EN ACCIÓN (6 TARJETAS TEMÁTICAS) */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">3. El Método VIVIPRESSONFIT en Acción (6 Tarjetas Temáticas)</h3>
            <p className="text-xs text-text-secondary">Entrenamientos Guiados, Tonificación, Cardio, Nutrición, etc.</p>
          </div>
          <button
            type="button"
            onClick={() => setGalleryCards(DEFAULT_GALLERY_CARDS)}
            className="text-xs text-text-secondary hover:text-accent transition underline"
          >
            Restablecer imágenes temáticas
          </button>
        </div>

        <div>
          <label className="text-xs uppercase font-bold text-text-secondary block mb-1">Título de la Sección</label>
          <input
            type="text"
            value={values.gallery_title ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, gallery_title: e.target.value }))}
            className="w-full max-w-md bg-background border border-border rounded-xl px-3 py-2 text-sm focus:border-accent outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryCards.map((card) => (
            <div key={card.id} className="bg-background border border-border rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-accent uppercase">Tarjeta #{card.id}</span>
                  <span className="text-[10px] bg-surface px-2 py-0.5 rounded text-text-secondary border border-border">4:5</span>
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
                      if (f) uploadFile(`gallery-${card.id}`, f, 'gallery', (url) => {
                        setGalleryCards((prev) => prev.map((c) => c.id === card.id ? { ...c, image_url: url } : c));
                      });
                    }}
                  />
                  <span>{uploadingTarget === `gallery-${card.id}` ? 'Subiendo…' : '📁 Cambiar imagen'}</span>
                </label>

                <input
                  type="text"
                  placeholder="URL imagen"
                  value={card.image_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGalleryCards((prev) => prev.map((c) => c.id === card.id ? { ...c, image_url: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none font-mono mb-2"
                />

                <input
                  type="text"
                  placeholder="Etiqueta (Badge)"
                  value={card.tag}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGalleryCards((prev) => prev.map((c) => c.id === card.id ? { ...c, tag: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none font-medium text-accent mb-2"
                />

                <input
                  type="text"
                  placeholder="Título"
                  value={card.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGalleryCards((prev) => prev.map((c) => c.id === card.id ? { ...c, title: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none font-bold text-text-primary mb-2"
                />

                <textarea
                  rows={2}
                  placeholder="Descripción"
                  value={card.desc}
                  onChange={(e) => {
                    const val = e.target.value;
                    setGalleryCards((prev) => prev.map((c) => c.id === card.id ? { ...c, desc: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs focus:border-accent outline-none text-text-secondary"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveGallery}
          disabled={saving === 'gallery'}
          className="bg-accent hover:bg-white text-background font-bold text-sm px-6 py-2 rounded-pill transition"
        >
          {saving === 'gallery' ? 'Guardando…' : 'Guardar El Método en Acción (6 Tarjetas)'}
        </button>
      </div>

      {/* 4. SECCIÓN: VIDEOS Y ADELANTOS DE CLASES */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">4. Videos y Adelantos Gratuitos: Clases</h3>
            <p className="text-xs text-text-secondary">Edita los videos públicos (GAP, Full Body, Cardio, Fuerza) y sus carátulas.</p>
          </div>
          <button
            type="button"
            onClick={() => setClasesItems(LANDING_CLASES)}
            className="text-xs text-text-secondary hover:text-accent transition underline"
          >
            Restablecer demos de clases
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {clasesItems.map((item, idx) => (
            <div key={idx} className="bg-background border border-border rounded-xl p-3 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-accent uppercase block">Clase #{idx + 1} — {item.category}</span>

                {showPreviews && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-border my-2 bg-black relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">Sin miniatura</div>
                    )}
                  </div>
                )}

                <label className="text-[11px] uppercase font-bold text-text-secondary block">Miniatura (Thumbnail)</label>
                <label className="w-full bg-surface hover:bg-white/5 border border-dashed border-border text-[11px] py-1.5 px-2 rounded-lg transition flex items-center justify-center cursor-pointer mb-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingTarget === `clase-thumb-${idx}`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(`clase-thumb-${idx}`, f, 'clases', (url) => {
                        setClasesItems((prev) => prev.map((c, i) => i === idx ? { ...c, thumbnail_url: url } : c));
                      });
                    }}
                  />
                  <span>{uploadingTarget === `clase-thumb-${idx}` ? 'Subiendo…' : '📁 Subir miniatura'}</span>
                </label>
                <input
                  type="text"
                  placeholder="URL miniatura"
                  value={item.thumbnail_url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClasesItems((prev) => prev.map((c, i) => i === idx ? { ...c, thumbnail_url: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono mb-2"
                />

                <label className="text-[11px] uppercase font-bold text-text-secondary block">URL de Video (mp4 / Vimeo / Bunny)</label>
                <input
                  type="text"
                  placeholder="/landing/demo-...mp4 o https://..."
                  value={item.video_url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClasesItems((prev) => prev.map((c, i) => i === idx ? { ...c, video_url: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono mb-2"
                />

                <input
                  type="text"
                  placeholder="Título"
                  value={item.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClasesItems((prev) => prev.map((c, i) => i === idx ? { ...c, title: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none font-bold text-text-primary mb-2"
                />

                <textarea
                  rows={2}
                  placeholder="Descripción"
                  value={item.desc}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClasesItems((prev) => prev.map((c, i) => i === idx ? { ...c, desc: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none text-text-secondary"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveClases}
          disabled={saving === 'clases'}
          className="bg-accent hover:bg-white text-background font-bold text-sm px-6 py-2 rounded-pill transition"
        >
          {saving === 'clases' ? 'Guardando…' : 'Guardar Videos de Clases'}
        </button>
      </div>

      {/* 5. SECCIÓN: VIDEOS Y RECURSOS EDUCATIVOS */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-heading font-bold text-text-primary">5. Videos y Recursos Educativos / Nutrición</h3>
            <p className="text-xs text-text-secondary">Edita las 4 muestras educativas (plato balanceado, calentamiento, teasers de miembros).</p>
          </div>
          <button
            type="button"
            onClick={() => setRecursosItems(LANDING_EDUCATIVO)}
            className="text-xs text-text-secondary hover:text-accent transition underline"
          >
            Restablecer recursos iniciales
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recursosItems.map((item, idx) => (
            <div key={idx} className="bg-background border border-border rounded-xl p-3 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-accent uppercase block">Recurso #{idx + 1}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.locked ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {item.locked ? '🔒 Bloqueado' : '▶ Gratis'}
                  </span>
                </div>

                {showPreviews && (
                  <div className="aspect-video rounded-lg overflow-hidden border border-border my-2 bg-black relative">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-text-secondary">Sin miniatura</div>
                    )}
                  </div>
                )}

                <label className="text-[11px] uppercase font-bold text-text-secondary block">Miniatura</label>
                <label className="w-full bg-surface hover:bg-white/5 border border-dashed border-border text-[11px] py-1.5 px-2 rounded-lg transition flex items-center justify-center cursor-pointer mb-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingTarget === `recurso-thumb-${idx}`}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(`recurso-thumb-${idx}`, f, 'recursos', (url) => {
                        setRecursosItems((prev) => prev.map((c, i) => i === idx ? { ...c, thumbnail_url: url } : c));
                      });
                    }}
                  />
                  <span>{uploadingTarget === `recurso-thumb-${idx}` ? 'Subiendo…' : '📁 Subir miniatura'}</span>
                </label>
                <input
                  type="text"
                  placeholder="URL miniatura"
                  value={item.thumbnail_url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecursosItems((prev) => prev.map((c, i) => i === idx ? { ...c, thumbnail_url: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono mb-2"
                />

                <label className="text-[11px] uppercase font-bold text-text-secondary block">URL de Video</label>
                <input
                  type="text"
                  placeholder="URL de video (opcional)"
                  value={item.video_url || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecursosItems((prev) => prev.map((c, i) => i === idx ? { ...c, video_url: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-[11px] focus:border-accent outline-none font-mono mb-2"
                />

                <input
                  type="text"
                  placeholder="Título"
                  value={item.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecursosItems((prev) => prev.map((c, i) => i === idx ? { ...c, title: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none font-bold text-text-primary mb-2"
                />

                <textarea
                  rows={2}
                  placeholder="Descripción"
                  value={item.desc}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRecursosItems((prev) => prev.map((c, i) => i === idx ? { ...c, desc: val } : c));
                  }}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-xs focus:border-accent outline-none text-text-secondary mb-2"
                />

                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(item.locked)}
                    onChange={(e) => {
                      const chk = e.target.checked;
                      setRecursosItems((prev) => prev.map((c, i) => i === idx ? { ...c, locked: chk } : c));
                    }}
                    className="w-4 h-4 accent-accent"
                  />
                  <span>Contenido bloqueado (Solo miembros)</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={saveRecursos}
          disabled={saving === 'recursos'}
          className="bg-accent hover:bg-white text-background font-bold text-sm px-6 py-2 rounded-pill transition"
        >
          {saving === 'recursos' ? 'Guardando…' : 'Guardar Recursos Educativos'}
        </button>
      </div>

      {/* 6. SECCIÓN: IMÁGENES PRINCIPALES (HERO Y NUTRICIÓN) */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-heading font-bold text-text-primary border-b border-border pb-3">
          6. Imágenes Destacadas: Hero &amp; Nutrición
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hero Image */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-text-primary">Imagen Principal del Hero</h4>
            {showPreviews && values.hero_image && (
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-surface">
                <img src={values.hero_image} alt="Hero" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              ref={heroFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile('hero-img', f, 'hero', (url) => setValues((v) => ({ ...v, hero_image: url })));
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
            <input
              type="text"
              value={values.hero_image ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, hero_image: e.target.value }))}
              placeholder="/landing/coach-whatsapp.jpg o https://..."
              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs font-mono focus:border-accent outline-none"
            />
            <button
              type="button"
              onClick={() => saveSingle('hero_image')}
              disabled={saving === 'hero_image'}
              className="bg-accent text-background font-bold text-xs px-4 py-1.5 rounded-pill transition"
            >
              {saving === 'hero_image' ? 'Guardando…' : 'Guardar Imagen Hero'}
            </button>
          </div>

          {/* Nutrición Image */}
          <div className="bg-background border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-text-primary">Imagen de la Sección Nutrición</h4>
            {showPreviews && values.educacion_image && (
              <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border bg-surface">
                <img src={values.educacion_image} alt="Nutricion" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              ref={nutFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile('nut-img', f, 'educativo', (url) => setValues((v) => ({ ...v, educacion_image: url })));
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
            <input
              type="text"
              value={values.educacion_image ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, educacion_image: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-xs font-mono focus:border-accent outline-none"
            />
            <button
              type="button"
              onClick={() => saveSingle('educacion_image')}
              disabled={saving === 'educacion_image'}
              className="bg-accent text-background font-bold text-xs px-4 py-1.5 rounded-pill transition"
            >
              {saving === 'educacion_image' ? 'Guardando…' : 'Guardar Imagen Nutrición'}
            </button>
          </div>
        </div>
      </div>

      {/* 7. SECCIÓN: OTROS PARÁMETROS GENERALES */}
      <div className="bg-raised border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-heading font-bold text-text-primary border-b border-border pb-3">
          7. Parámetros de Negocio y Textos (Precio, WhatsApp, Hero, Secciones)
        </h3>

        {FIELDS.filter((f) => f.key !== 'hero_image' && f.key !== 'educacion_image').map((f) => (
          <div key={f.key} className="bg-background border border-border rounded-xl p-4">
            <label className="block text-xs uppercase tracking-wider font-bold text-text-secondary mb-2">
              {f.label}
            </label>
            {f.type === 'textarea' ? (
              <textarea
                rows={3}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:border-accent outline-none"
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm focus:border-accent outline-none"
              />
            )}
            <button
              type="button"
              onClick={() => saveSingle(f.key)}
              disabled={saving === f.key}
              className="mt-2 bg-accent hover:bg-white text-background text-xs font-bold px-4 py-2 rounded-pill transition disabled:opacity-50"
            >
              {saving === f.key ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
