import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
  DEFAULT_CONFIG,
  DEFAULT_GALLERY_CARDS,
  DEFAULT_QUIEN_SOY_IMAGES,
  type GalleryCardItem,
  type QuienSoyImageItem,
  type PreviewItem,
} from '../../hooks/useLandingConfig';
import { LANDING_CLASES, LANDING_EDUCATIVO } from '../../data/landingMedia';
import { uploadLandingImage } from '../../lib/landingUpload';
import {
  SparklesIcon,
  UserIcon,
  GridIcon,
  VideoIcon,
  GearIcon,
  ExternalLinkIcon,
  SaveIcon,
  RotateCcwIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from '../ui/Icons';
import { BrandHeroSection } from './landing/BrandHeroSection';
import { QuienSoySection } from './landing/QuienSoySection';
import { MetodoSection } from './landing/MetodoSection';
import { MuestrasSection } from './landing/MuestrasSection';
import { OfertaSection } from './landing/OfertaSection';

export type LandingEditorTab = 'brand-hero' | 'quien-soy' | 'metodo' | 'muestras' | 'oferta';

interface EditorSnapshot {
  values: Record<string, string>;
  galleryCards: GalleryCardItem[];
  quienSoyImages: QuienSoyImageItem[];
  clasesItems: PreviewItem[];
  recursosItems: PreviewItem[];
}

const BRAND_HERO_KEYS = ['logo_url', 'logo_height', 'hero_title', 'hero_title_sub', 'hero_sub', 'hero_image'];
const QUIEN_SOY_KEYS = ['quien_soy_title', 'quien_soy_subtitle', 'quien_soy_bio'];
const METODO_KEYS = ['gallery_title'];
const OFERTA_KEYS = ['monthly_price', 'whatsapp_number', 'pilares_title', 'membresias_title', 'educacion_image'];

export function LandingConfigEditor() {
  const [activeTab, setActiveTab] = useState<LandingEditorTab>('brand-hero');
  const [loading, setLoading] = useState<boolean>(true);

  // Checkbox de previsualización en miniatura
  const [showPreviews, setShowPreviews] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vivifit_admin_show_previews');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  // Estado actual editable
  const [values, setValues] = useState<Record<string, string>>({});
  const [galleryCards, setGalleryCards] = useState<GalleryCardItem[]>(DEFAULT_GALLERY_CARDS);
  const [quienSoyImages, setQuienSoyImages] = useState<QuienSoyImageItem[]>(DEFAULT_QUIEN_SOY_IMAGES);
  const [clasesItems, setClasesItems] = useState<PreviewItem[]>(LANDING_CLASES);
  const [recursosItems, setRecursosItems] = useState<PreviewItem[]>(LANDING_EDUCATIVO);

  // Snapshot inicial para tracking de estado sucio (dirty-state)
  const [initialSnapshot, setInitialSnapshot] = useState<EditorSnapshot | null>(null);

  const [saving, setSaving] = useState<string | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Carga inicial desde Supabase
  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      const { data } = await supabase.from('landing_config').select('key, value');
      const rows = (data ?? []) as Array<{ key: string; value: unknown }>;
      const map: Record<string, string> = {};
      for (const row of rows) {
        map[row.key] = String(row.value).replace(/^"|"$/g, '');
      }

      const initialValues: Record<string, string> = {
        monthly_price: map.monthly_price ?? String(DEFAULT_CONFIG.monthly_price),
        whatsapp_number: map.whatsapp_number ?? String(DEFAULT_CONFIG.whatsapp_number),
        hero_title: map.hero_title ?? String(DEFAULT_CONFIG.hero_title),
        hero_title_sub: map.hero_title_sub ?? String(DEFAULT_CONFIG.hero_title_sub),
        hero_sub: map.hero_sub ?? String(DEFAULT_CONFIG.hero_sub),
        pilares_title: map.pilares_title ?? String(DEFAULT_CONFIG.pilares_title),
        membresias_title: map.membresias_title ?? String(DEFAULT_CONFIG.membresias_title),
        hero_image: map.hero_image ?? String(DEFAULT_CONFIG.hero_image),
        educacion_image: map.educacion_image ?? String(DEFAULT_CONFIG.educacion_image),
        logo_url: map.logo_url ?? String(DEFAULT_CONFIG.logo_url),
        logo_height: map.logo_height ?? String(DEFAULT_CONFIG.logo_height),
        gallery_title: map.gallery_title ?? String(DEFAULT_CONFIG.gallery_title),
        quien_soy_title: map.quien_soy_title ?? String(DEFAULT_CONFIG.quien_soy_title),
        quien_soy_subtitle: map.quien_soy_subtitle ?? String(DEFAULT_CONFIG.quien_soy_subtitle),
        quien_soy_bio: map.quien_soy_bio ?? String(DEFAULT_CONFIG.quien_soy_bio),
      };

      let initialGallery = DEFAULT_GALLERY_CARDS;
      const rawGallery = rows.find((r) => r.key === 'gallery_cards')?.value;
      if (rawGallery) {
        try {
          const parsed = typeof rawGallery === 'string' ? JSON.parse(rawGallery) : rawGallery;
          if (Array.isArray(parsed) && parsed.length > 0) initialGallery = parsed;
        } catch {}
      }

      let initialQuienSoy = DEFAULT_QUIEN_SOY_IMAGES;
      const rawQuienSoy = rows.find((r) => r.key === 'quien_soy_images')?.value;
      if (rawQuienSoy) {
        try {
          const parsed = typeof rawQuienSoy === 'string' ? JSON.parse(rawQuienSoy) : rawQuienSoy;
          if (Array.isArray(parsed) && parsed.length > 0) initialQuienSoy = parsed;
        } catch {}
      }

      let initialClases = LANDING_CLASES;
      const rawClases = rows.find((r) => r.key === 'preview_clases')?.value;
      if (rawClases) {
        try {
          const parsed = typeof rawClases === 'string' ? JSON.parse(rawClases) : rawClases;
          if (Array.isArray(parsed) && parsed.length > 0) initialClases = parsed;
        } catch {}
      }

      let initialRecursos = LANDING_EDUCATIVO;
      const rawRecursos = rows.find((r) => r.key === 'preview_recursos')?.value;
      if (rawRecursos) {
        try {
          const parsed = typeof rawRecursos === 'string' ? JSON.parse(rawRecursos) : rawRecursos;
          if (Array.isArray(parsed) && parsed.length > 0) initialRecursos = parsed;
        } catch {}
      }

      setValues(initialValues);
      setGalleryCards(initialGallery);
      setQuienSoyImages(initialQuienSoy);
      setClasesItems(initialClases);
      setRecursosItems(initialRecursos);

      setInitialSnapshot({
        values: initialValues,
        galleryCards: initialGallery,
        quienSoyImages: initialQuienSoy,
        clasesItems: initialClases,
        recursosItems: initialRecursos,
      });

      setLoading(false);
    }

    loadConfig();
  }, []);

  // Tracking de Dirty State por sección
  const dirtySections = useMemo(() => {
    if (!initialSnapshot) {
      return {
        brandHero: false,
        quienSoy: false,
        metodo: false,
        muestras: false,
        oferta: false,
      };
    }

    const isBrandHeroDirty = BRAND_HERO_KEYS.some(
      (k) => (values[k] ?? '') !== (initialSnapshot.values[k] ?? '')
    );

    const isQuienSoyValuesDirty = QUIEN_SOY_KEYS.some(
      (k) => (values[k] ?? '') !== (initialSnapshot.values[k] ?? '')
    );
    const isQuienSoyImagesDirty =
      JSON.stringify(quienSoyImages) !== JSON.stringify(initialSnapshot.quienSoyImages);
    const isQuienSoyDirty = isQuienSoyValuesDirty || isQuienSoyImagesDirty;

    const isMetodoTitleDirty = METODO_KEYS.some(
      (k) => (values[k] ?? '') !== (initialSnapshot.values[k] ?? '')
    );
    const isMetodoCardsDirty =
      JSON.stringify(galleryCards) !== JSON.stringify(initialSnapshot.galleryCards);
    const isMetodoDirty = isMetodoTitleDirty || isMetodoCardsDirty;

    const isClasesDirty =
      JSON.stringify(clasesItems) !== JSON.stringify(initialSnapshot.clasesItems);
    const isRecursosDirty =
      JSON.stringify(recursosItems) !== JSON.stringify(initialSnapshot.recursosItems);
    const isMuestrasDirty = isClasesDirty || isRecursosDirty;

    const isOfertaDirty = OFERTA_KEYS.some(
      (k) => (values[k] ?? '') !== (initialSnapshot.values[k] ?? '')
    );

    return {
      brandHero: isBrandHeroDirty,
      quienSoy: isQuienSoyDirty,
      metodo: isMetodoDirty,
      muestras: isMuestrasDirty,
      oferta: isOfertaDirty,
    };
  }, [initialSnapshot, values, galleryCards, quienSoyImages, clasesItems, recursosItems]);

  const hasUnsavedChanges = Object.values(dirtySections).some(Boolean);
  const dirtySectionsCount = Object.values(dirtySections).filter(Boolean).length;

  // Advertencia antes de cerrar o recargar con cambios pendientes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const togglePreviews = (checked: boolean) => {
    setShowPreviews(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vivifit_admin_show_previews', String(checked));
    }
  };

  const uploadFile = async (
    targetTag: string,
    file: File,
    folder: string,
    onDone: (url: string) => void
  ) => {
    setUploadingTarget(targetTag);
    setMsg(null);
    try {
      const publicUrl = await uploadLandingImage(file, folder);
      onDone(publicUrl);
      setMsg({
        text: 'Archivo subido a Storage. Recuerda hacer clic en "Guardar y publicar" para aplicar los cambios.',
        type: 'success',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al subir archivo';
      setMsg({ text: `Error al subir: ${message}`, type: 'error' });
    } finally {
      setUploadingTarget(null);
    }
  };

  // Revertir cambios locales al snapshot inicial
  const discardAllChanges = () => {
    if (!initialSnapshot) return;
    const confirmed = window.confirm(
      '¿Deseas descartar todas las modificaciones no guardadas y volver al estado publicado?'
    );
    if (!confirmed) return;

    setValues({ ...initialSnapshot.values });
    setGalleryCards(JSON.parse(JSON.stringify(initialSnapshot.galleryCards)));
    setQuienSoyImages(JSON.parse(JSON.stringify(initialSnapshot.quienSoyImages)));
    setClasesItems(JSON.parse(JSON.stringify(initialSnapshot.clasesItems)));
    setRecursosItems(JSON.parse(JSON.stringify(initialSnapshot.recursosItems)));
    setMsg({ text: 'Cambios descartados. Se restauró el estado publicado.', type: 'success' });
  };

  // Guardar y publicar todo (Batch atómico)
  const saveAllChanges = async () => {
    const p = Number(values.monthly_price);
    if (isNaN(p) || p <= 0) {
      setMsg({
        text: 'Error: El precio mensual debe ser un número mayor a 0 (ej: 40).',
        type: 'error',
      });
      setActiveTab('oferta');
      return;
    }

    setSaving('all');
    setMsg(null);

    const updates: Array<{ key: string; value: unknown }> = [];
    for (const [k, v] of Object.entries(values)) {
      if (k === 'monthly_price' || k === 'logo_height') {
        updates.push({ key: k, value: Number(v || 0) });
      } else {
        updates.push({ key: k, value: v ?? '' });
      }
    }
    updates.push({ key: 'gallery_cards', value: galleryCards });
    updates.push({ key: 'quien_soy_images', value: quienSoyImages });
    updates.push({ key: 'preview_clases', value: clasesItems });
    updates.push({ key: 'preview_recursos', value: recursosItems });

    const { error } = await supabase.from('landing_config').upsert(updates, { onConflict: 'key' });

    setSaving(null);
    if (error) {
      setMsg({ text: `Error al publicar en la base de datos: ${error.message}`, type: 'error' });
    } else {
      setMsg({
        text: '✅ ¡Landing actualizada y publicada exitosamente con todos los cambios!',
        type: 'success',
      });
      setInitialSnapshot({
        values: { ...values },
        galleryCards: JSON.parse(JSON.stringify(galleryCards)),
        quienSoyImages: JSON.parse(JSON.stringify(quienSoyImages)),
        clasesItems: JSON.parse(JSON.stringify(clasesItems)),
        recursosItems: JSON.parse(JSON.stringify(recursosItems)),
      });
    }
  };

  // Guardar sección individual: Brand & Hero
  const saveBrandHero = async () => {
    setSaving('brand-hero');
    setMsg(null);
    const updates = [
      { key: 'logo_url', value: values.logo_url || DEFAULT_CONFIG.logo_url },
      { key: 'logo_height', value: Number(values.logo_height) || DEFAULT_CONFIG.logo_height },
      { key: 'hero_title', value: values.hero_title ?? '' },
      { key: 'hero_title_sub', value: values.hero_title_sub ?? '' },
      { key: 'hero_sub', value: values.hero_sub ?? '' },
      { key: 'hero_image', value: values.hero_image ?? '' },
    ];
    const { error } = await supabase.from('landing_config').upsert(updates, { onConflict: 'key' });
    setSaving(null);

    if (error) {
      setMsg({ text: `Error al guardar Marca & Hero: ${error.message}`, type: 'error' });
    } else {
      setMsg({ text: '✅ Sección Identidad & Hero guardada exitosamente.', type: 'success' });
      setInitialSnapshot((prev) =>
        prev
          ? {
              ...prev,
              values: {
                ...prev.values,
                logo_url: values.logo_url ?? '',
                logo_height: values.logo_height ?? '',
                hero_title: values.hero_title ?? '',
                hero_title_sub: values.hero_title_sub ?? '',
                hero_sub: values.hero_sub ?? '',
                hero_image: values.hero_image ?? '',
              },
            }
          : null
      );
    }
  };

  // Guardar sección individual: Quien Soy
  const saveQuienSoy = async () => {
    setSaving('quien-soy');
    setMsg(null);
    const updates = [
      { key: 'quien_soy_title', value: values.quien_soy_title ?? '' },
      { key: 'quien_soy_subtitle', value: values.quien_soy_subtitle ?? '' },
      { key: 'quien_soy_bio', value: values.quien_soy_bio ?? '' },
      { key: 'quien_soy_images', value: quienSoyImages },
    ];
    const { error } = await supabase.from('landing_config').upsert(updates, { onConflict: 'key' });
    setSaving(null);

    if (error) {
      setMsg({ text: `Error al guardar sección ¿Quién Soy?: ${error.message}`, type: 'error' });
    } else {
      setMsg({ text: '✅ Sección ¿Quién Soy? y sus 6 fotos guardadas exitosamente.', type: 'success' });
      setInitialSnapshot((prev) =>
        prev
          ? {
              ...prev,
              values: {
                ...prev.values,
                quien_soy_title: values.quien_soy_title ?? '',
                quien_soy_subtitle: values.quien_soy_subtitle ?? '',
                quien_soy_bio: values.quien_soy_bio ?? '',
              },
              quienSoyImages: JSON.parse(JSON.stringify(quienSoyImages)),
            }
          : null
      );
    }
  };

  // Guardar sección individual: Metodo
  const saveMetodo = async () => {
    setSaving('metodo');
    setMsg(null);
    const updates = [
      { key: 'gallery_title', value: values.gallery_title ?? '' },
      { key: 'gallery_cards', value: galleryCards },
    ];
    const { error } = await supabase.from('landing_config').upsert(updates, { onConflict: 'key' });
    setSaving(null);

    if (error) {
      setMsg({ text: `Error al guardar El Método: ${error.message}`, type: 'error' });
    } else {
      setMsg({ text: '✅ Sección El Método (6 tarjetas temáticas) guardada exitosamente.', type: 'success' });
      setInitialSnapshot((prev) =>
        prev
          ? {
              ...prev,
              values: {
                ...prev.values,
                gallery_title: values.gallery_title ?? '',
              },
              galleryCards: JSON.parse(JSON.stringify(galleryCards)),
            }
          : null
      );
    }
  };

  // Guardar sección individual: Muestras
  const saveMuestras = async () => {
    setSaving('muestras');
    setMsg(null);
    const updates = [
      { key: 'preview_clases', value: clasesItems },
      { key: 'preview_recursos', value: recursosItems },
    ];
    const { error } = await supabase.from('landing_config').upsert(updates, { onConflict: 'key' });
    setSaving(null);

    if (error) {
      setMsg({ text: `Error al guardar Clases & Recursos: ${error.message}`, type: 'error' });
    } else {
      setMsg({ text: '✅ Muestras de clases y recursos guardados exitosamente.', type: 'success' });
      setInitialSnapshot((prev) =>
        prev
          ? {
              ...prev,
              clasesItems: JSON.parse(JSON.stringify(clasesItems)),
              recursosItems: JSON.parse(JSON.stringify(recursosItems)),
            }
          : null
      );
    }
  };

  // Guardar sección individual: Oferta
  const saveOferta = async () => {
    const p = Number(values.monthly_price);
    if (isNaN(p) || p <= 0) {
      setMsg({
        text: 'Error: El precio mensual debe ser un número mayor a 0 (ej: 40).',
        type: 'error',
      });
      return;
    }
    setSaving('oferta');
    setMsg(null);

    const updates = [
      { key: 'monthly_price', value: p },
      { key: 'whatsapp_number', value: values.whatsapp_number ?? '' },
      { key: 'pilares_title', value: values.pilares_title ?? '' },
      { key: 'membresias_title', value: values.membresias_title ?? '' },
      { key: 'educacion_image', value: values.educacion_image ?? '' },
    ];
    const { error } = await supabase.from('landing_config').upsert(updates, { onConflict: 'key' });
    setSaving(null);

    if (error) {
      setMsg({ text: `Error al guardar Oferta & Parámetros: ${error.message}`, type: 'error' });
    } else {
      setMsg({ text: '✅ Parámetros comerciales y oferta guardados exitosamente.', type: 'success' });
      setInitialSnapshot((prev) =>
        prev
          ? {
              ...prev,
              values: {
                ...prev.values,
                monthly_price: values.monthly_price ?? '',
                whatsapp_number: values.whatsapp_number ?? '',
                pilares_title: values.pilares_title ?? '',
                membresias_title: values.membresias_title ?? '',
                educacion_image: values.educacion_image ?? '',
              },
            }
          : null
      );
    }
  };

  if (loading) {
    return (
      <div className="bg-raised border border-border rounded-2xl p-12 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">Cargando configuración de la Landing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. BARRA SUPERIOR DE PUBLICACIÓN & DIRTY STATE */}
      <div className="sticky top-20 z-20 bg-surface/95 backdrop-blur-md border border-border rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado izquierdo: Estado y conteo de modificaciones */}
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              hasUnsavedChanges ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary">
                {hasUnsavedChanges
                  ? `Tienes cambios pendientes (${dirtySectionsCount} ${
                      dirtySectionsCount === 1 ? 'sección editada' : 'secciones editadas'
                    })`
                  : 'Landing en sincronía con producción'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${
                  hasUnsavedChanges
                    ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {hasUnsavedChanges ? 'Borrador sin publicar' : 'Publicado'}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              {hasUnsavedChanges
                ? 'Publica tus cambios para que se reflejen de inmediato a los visitantes.'
                : 'Cualquier modificación quedará marcada antes de sobreescribir la landing.'}
            </p>
          </div>
        </div>

        {/* Lado derecho: Acciones de publicación y enlaces */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle de miniaturas */}
          <button
            type="button"
            onClick={() => togglePreviews(!showPreviews)}
            className="inline-flex items-center gap-1.5 bg-background hover:bg-raised text-text-secondary hover:text-text-primary text-xs px-3 py-2 rounded-xl border border-border transition"
            title="Conmutar vista previa de imágenes"
          >
            {showPreviews ? <EyeIcon className="w-3.5 h-3.5" /> : <EyeOffIcon className="w-3.5 h-3.5" />}
            <span>{showPreviews ? 'Miniaturas' : 'Compacto'}</span>
          </button>

          {/* Enlace para ver en vivo */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-background hover:bg-raised text-text-primary text-xs px-3 py-2 rounded-xl border border-border transition"
          >
            <ExternalLinkIcon className="w-3.5 h-3.5" />
            <span>Ver Landing en vivo</span>
          </a>

          {/* Descartar cambios */}
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={discardAllChanges}
              className="inline-flex items-center gap-1.5 bg-background hover:bg-red-500/10 text-red-400 text-xs px-3 py-2 rounded-xl border border-red-500/30 transition"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
              <span>Descartar</span>
            </button>
          )}

          {/* Guardar y publicar todo */}
          <button
            type="button"
            onClick={saveAllChanges}
            disabled={saving === 'all' || !hasUnsavedChanges}
            className="inline-flex items-center gap-2 bg-accent hover:bg-white text-background font-bold text-xs px-5 py-2 rounded-pill transition shadow-sm disabled:opacity-40"
          >
            <SaveIcon className="w-3.5 h-3.5" />
            <span>{saving === 'all' ? 'Publicando todo…' : 'Guardar y Publicar todo'}</span>
          </button>
        </div>
      </div>

      {/* Banner de mensajes de éxito / error */}
      {msg && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium ${
            msg.type === 'error'
              ? 'bg-red-500/15 border-red-500/40 text-red-200'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {msg.type === 'error' ? (
              <AlertCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-xs opacity-75 hover:opacity-100 underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 2. NAVEGACIÓN POR PESTAÑAS TEMÁTICAS */}
      <nav
        aria-label="Secciones del editor de landing"
        className="flex overflow-x-auto pb-2 gap-2 border-b border-border text-sm"
      >
        <button
          type="button"
          onClick={() => setActiveTab('brand-hero')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'brand-hero'
              ? 'bg-accent text-background shadow-sm'
              : 'bg-raised hover:bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Marca &amp; Hero</span>
          {dirtySections.brandHero && (
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'brand-hero' ? 'bg-background' : 'bg-accent'
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quien-soy')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'quien-soy'
              ? 'bg-accent text-background shadow-sm'
              : 'bg-raised hover:bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>¿Quién Soy?</span>
          {dirtySections.quienSoy && (
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'quien-soy' ? 'bg-background' : 'bg-accent'
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metodo')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'metodo'
              ? 'bg-accent text-background shadow-sm'
              : 'bg-raised hover:bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          <GridIcon className="w-4 h-4" />
          <span>El Método en Acción</span>
          {dirtySections.metodo && (
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'metodo' ? 'bg-background' : 'bg-accent'
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('muestras')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'muestras'
              ? 'bg-accent text-background shadow-sm'
              : 'bg-raised hover:bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          <VideoIcon className="w-4 h-4" />
          <span>Clases &amp; Recursos</span>
          {dirtySections.muestras && (
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'muestras' ? 'bg-background' : 'bg-accent'
              }`}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('oferta')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeTab === 'oferta'
              ? 'bg-accent text-background shadow-sm'
              : 'bg-raised hover:bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          <GearIcon className="w-4 h-4" />
          <span>Oferta &amp; Ajustes</span>
          {dirtySections.oferta && (
            <span
              className={`w-2 h-2 rounded-full ${
                activeTab === 'oferta' ? 'bg-background' : 'bg-accent'
              }`}
            />
          )}
        </button>
      </nav>

      {/* 3. CONTENIDO DEL SUBMÓDULO ACTIVO */}
      <div>
        {activeTab === 'brand-hero' && (
          <BrandHeroSection
            values={values}
            onChange={(key, val) => setValues((v) => ({ ...v, [key]: val }))}
            showPreviews={showPreviews}
            uploadingTarget={uploadingTarget}
            onUpload={uploadFile}
            isSaving={saving === 'brand-hero'}
            isDirty={dirtySections.brandHero}
            onSave={saveBrandHero}
          />
        )}

        {activeTab === 'quien-soy' && (
          <QuienSoySection
            values={values}
            onChangeValue={(key, val) => setValues((v) => ({ ...v, [key]: val }))}
            images={quienSoyImages}
            onChangeImages={setQuienSoyImages}
            showPreviews={showPreviews}
            uploadingTarget={uploadingTarget}
            onUpload={uploadFile}
            isSaving={saving === 'quien-soy'}
            isDirty={dirtySections.quienSoy}
            onSave={saveQuienSoy}
          />
        )}

        {activeTab === 'metodo' && (
          <MetodoSection
            values={values}
            onChangeValue={(key, val) => setValues((v) => ({ ...v, [key]: val }))}
            cards={galleryCards}
            onChangeCards={setGalleryCards}
            showPreviews={showPreviews}
            uploadingTarget={uploadingTarget}
            onUpload={uploadFile}
            isSaving={saving === 'metodo'}
            isDirty={dirtySections.metodo}
            onSave={saveMetodo}
          />
        )}

        {activeTab === 'muestras' && (
          <MuestrasSection
            clasesItems={clasesItems}
            onChangeClases={setClasesItems}
            recursosItems={recursosItems}
            onChangeRecursos={setRecursosItems}
            showPreviews={showPreviews}
            uploadingTarget={uploadingTarget}
            onUpload={uploadFile}
            isSaving={saving === 'muestras'}
            isDirty={dirtySections.muestras}
            onSave={saveMuestras}
          />
        )}

        {activeTab === 'oferta' && (
          <OfertaSection
            values={values}
            onChangeValue={(key, val) => setValues((v) => ({ ...v, [key]: val }))}
            showPreviews={showPreviews}
            uploadingTarget={uploadingTarget}
            onUpload={uploadFile}
            isSaving={saving === 'oferta'}
            isDirty={dirtySections.oferta}
            onSave={saveOferta}
          />
        )}
      </div>
    </div>
  );
}
