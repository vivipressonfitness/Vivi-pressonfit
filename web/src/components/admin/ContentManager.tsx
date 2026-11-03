import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MembershipContent } from '../../types';
import { MediaBucketManager } from './MediaBucketManager';
import { Modal } from '../ui/Modal';
import {
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrashIcon,
  FolderIcon,
} from '../ui/Icons';

type AssignTarget = 'private_video' | 'preview_video' | 'thumbnail' | 'pdf';

const TARGET_LABELS: Record<AssignTarget, string> = {
  private_video: 'Video privado de la clase (exclusivo miembros)',
  preview_video: 'Video demo / Teaser público (Landing Page)',
  thumbnail: 'Miniatura / Portada pública',
  pdf: 'Documento PDF (Recetario / Guía)',
};

// CRUD de membership_content (contenido del mes con diferenciación pública vs privada).
const EMPTY: Omit<MembershipContent, 'id' | 'created_at' | 'updated_at'> = {
  cycle_date: new Date().toISOString().slice(0, 10),
  category: 'Clase',
  title: '',
  description: null,
  bunny_video_id: null,
  storage_path: null,
  content_url: null,
  target_mode: 'Ambos',
  class_type: null,
  month_year: null,
  // CM-02: Borrador por defecto para evitar publicaciones accidentales
  is_published: false,
  // Gestión pública (Landing) y privada (Miembros):
  show_in_landing: false,
  preview_video_url: null,
  thumbnail_url: null,
  preview_duration: '30s · adelanto',
  pdf_url: null,
  private_video_url: null,
};

export function ContentManager() {
  const [items, setItems] = useState<MembershipContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Estados del Formulario Bajo Demanda (Modal)
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Estados del Bucket Multimedia (Modal Selector)
  const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);

  // Notificación Toast flotante no intrusiva
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  // Estados de eliminación y acciones rápidas
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteModalTarget, setDeleteModalTarget] = useState<MembershipContent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtros de búsqueda en el catálogo
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [landingFilter, setLandingFilter] = useState<'all' | 'landing' | 'private_only'>('all');

  const showToast = (text: string, error = false) => {
    setToast({ text, error });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('membership_content')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setLoadError('No se pudo cargar el catálogo de contenidos.');
      } else {
        setItems(data ?? []);
      }
    } catch {
      setLoadError('Error de red al consultar contenidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const resetForm = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setAssignTarget(null);
  };

  const handleOpenNew = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (c: MembershipContent) => {
    setForm({
      cycle_date: c.cycle_date,
      category: c.category,
      title: c.title,
      description: c.description,
      bunny_video_id: c.bunny_video_id,
      storage_path: c.storage_path,
      content_url: c.content_url,
      target_mode: c.target_mode,
      class_type: c.class_type,
      month_year: c.month_year,
      is_published: c.is_published,
      show_in_landing: Boolean(c.show_in_landing),
      preview_video_url: c.preview_video_url || null,
      thumbnail_url: c.thumbnail_url || null,
      preview_duration: c.preview_duration || '30s · adelanto',
      pdf_url: c.pdf_url || null,
      private_video_url: c.private_video_url || c.content_url || null,
    });
    setEditingId(c.id);
    setIsFormModalOpen(true);
  };

  const openBucketFor = (target: AssignTarget) => {
    setAssignTarget(target);
    setIsBucketModalOpen(true);
  };

  // Asignar archivo seleccionado desde el bucket members-media
  const handleAssignFromBucket = (fileUrl: string, fileType: 'video' | 'image' | 'pdf') => {
    if (assignTarget === 'private_video') {
      setForm((prev) => ({ ...prev, private_video_url: fileUrl, content_url: fileUrl }));
      showToast('🎬 Video privado asignado desde el bucket');
    } else if (assignTarget === 'preview_video') {
      setForm((prev) => ({ ...prev, preview_video_url: fileUrl, show_in_landing: true }));
      showToast('👁️ Video demo público asignado desde el bucket');
    } else if (assignTarget === 'thumbnail') {
      setForm((prev) => ({ ...prev, thumbnail_url: fileUrl }));
      showToast('🖼️ Miniatura asignada desde el bucket');
    } else if (assignTarget === 'pdf') {
      setForm((prev) => ({ ...prev, pdf_url: fileUrl }));
      showToast('📄 Documento PDF asignado desde el bucket');
    } else {
      if (fileType === 'video') {
        setForm((prev) => ({ ...prev, private_video_url: fileUrl, content_url: fileUrl }));
        showToast('🎬 Video privado asignado');
      } else if (fileType === 'image') {
        setForm((prev) => ({ ...prev, thumbnail_url: fileUrl }));
        showToast('🖼️ Miniatura asignada');
      } else {
        setForm((prev) => ({ ...prev, pdf_url: fileUrl }));
        showToast('📄 Documento PDF asignado');
      }
    }
    setIsBucketModalOpen(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    // CM-01: Validación de seguridad para evitar fuga del video completo al landing
    if (form.show_in_landing) {
      if (!form.preview_video_url && !form.thumbnail_url) {
        setBusy(false);
        showToast(
          '⚠️ Para mostrar este contenido en el Landing debes asignar un video adelanto o miniatura.',
          true,
        );
        return;
      }
      if (
        form.preview_video_url &&
        (form.preview_video_url === form.private_video_url ||
          (form.content_url && form.preview_video_url === form.content_url))
      ) {
        setBusy(false);
        showToast(
          '⚠️ El video demo no puede ser el mismo video privado completo de la clase.',
          true,
        );
        return;
      }
    }

    const payload = {
      ...form,
      preview_video_url: form.preview_video_url?.trim() || null,
      thumbnail_url: form.thumbnail_url?.trim() || null,
      pdf_url: form.pdf_url?.trim() || null,
      private_video_url: form.private_video_url?.trim() || null,
      content_url: form.private_video_url?.trim() || form.content_url?.trim() || null,
      bunny_video_id: form.bunny_video_id?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from('membership_content')
        .update(payload)
        .eq('id', editingId);

      setBusy(false);
      if (error) {
        showToast(`Error al actualizar: ${error.message}`, true);
      } else {
        showToast(`✅ "${form.title}" actualizado con éxito.`);
        setIsFormModalOpen(false);
        resetForm();
        void load();
      }
    } else {
      const { error } = await supabase.from('membership_content').insert([payload]);
      setBusy(false);
      if (error) {
        showToast(`Error al crear contenido: ${error.message}`, true);
      } else {
        showToast(`✅ "${form.title}" publicado con éxito.`);
        setIsFormModalOpen(false);
        resetForm();
        void load();
      }
    }
  };

  // Eliminación segura con modal
  const handleConfirmDelete = async () => {
    if (!deleteModalTarget) return;
    setDeleteLoading(true);

    const { error } = await supabase
      .from('membership_content')
      .delete()
      .eq('id', deleteModalTarget.id);

    setDeleteLoading(false);

    if (error) {
      showToast(`Error al eliminar contenido: ${error.message}`, true);
    } else {
      showToast(`✅ "${deleteModalTarget.title}" ha sido eliminado exitosamente.`);
      setItems((prev) => prev.filter((item) => item.id !== deleteModalTarget.id));
      if (editingId === deleteModalTarget.id) resetForm();
    }
    setDeleteModalTarget(null);
  };

  // Toggle rápido de publicación (Borrador / Publicado)
  const togglePub = async (c: MembershipContent) => {
    setActionLoadingId(c.id);
    const nextVal = !c.is_published;

    const { error } = await supabase
      .from('membership_content')
      .update({ is_published: nextVal })
      .eq('id', c.id);

    setActionLoadingId(null);

    if (error) {
      showToast(`Error al cambiar publicación: ${error.message}`, true);
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, is_published: nextVal } : item)),
      );
      showToast(nextVal ? '✅ Clase publicada para miembros' : '🟡 Clase marcada como borrador');
    }
  };

  // Toggle rápido de visibilidad en Landing
  const toggleLanding = async (c: MembershipContent) => {
    setActionLoadingId(c.id);
    const nextVal = !c.show_in_landing;

    const { error } = await supabase
      .from('membership_content')
      .update({ show_in_landing: nextVal })
      .eq('id', c.id);

    setActionLoadingId(null);

    if (error) {
      showToast(`Error al cambiar visibilidad: ${error.message}`, true);
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, show_in_landing: nextVal } : item)),
      );
      showToast(nextVal ? '🌐 Mostrándose en el Landing' : '🔒 Exclusivo para miembros');
    }
  };

  // Filtrado de contenidos en el catálogo
  const filteredItems = useMemo(() => {
    return items.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchDesc) return false;
      }
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (statusFilter === 'published' && !c.is_published) return false;
      if (statusFilter === 'draft' && c.is_published) return false;
      if (landingFilter === 'landing' && !c.show_in_landing) return false;
      if (landingFilter === 'private_only' && c.show_in_landing) return false;

      return true;
    });
  }, [items, searchQuery, categoryFilter, statusFilter, landingFilter]);

  const inputCls =
    'w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none text-text-primary transition';

  return (
    <div className="space-y-6">
      {/* 1. CABECERA PRINCIPAL DEL CATÁLOGO (Inversión de jerarquía visual) */}
      <div className="bg-raised border border-border rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-bold text-lg">
                📚
              </span>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-text-primary">
                Catálogo de Clases y Contenidos
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Administra publicaciones, visibilidad en el Landing y recursos para miembros ({filteredItems.length} de {items.length} disponibles).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setAssignTarget(null);
                setIsBucketModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-pill border border-border bg-background text-text-secondary hover:text-white hover:border-accent text-xs font-semibold transition inline-flex items-center gap-1.5 min-h-[40px]"
            >
              <FolderIcon className="w-4 h-4 text-accent" />
              <span>Explorar Bucket (Archivos)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNew}
              className="btn-accent !px-4 !py-2 text-xs sm:text-sm font-bold inline-flex items-center gap-2 min-h-[40px] shadow-lg shadow-accent/20"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>+ Nuevo Contenido</span>
            </button>
          </div>
        </div>

        {/* 2. BARRA DE FILTROS Y BÚSQUEDA RÁPIDA */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary mr-1">
            <FilterIcon className="w-3.5 h-3.5 text-accent" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Filtros:</span>
          </div>

          <div className="w-full sm:w-56 relative">
            <SearchIcon className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-2.5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary focus:border-accent outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-text-primary focus:border-accent outline-none"
          >
            <option value="all">Categoría: Todas</option>
            {['Clase', 'Rutina', 'Nutrición', 'Recurso', 'Full Body', 'Cardio HIIT', 'GAP'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-text-primary focus:border-accent outline-none"
          >
            <option value="all">Estado: Todos</option>
            <option value="published">Solo Publicados</option>
            <option value="draft">Solo Borradores</option>
          </select>

          <select
            value={landingFilter}
            onChange={(e) => setLandingFilter(e.target.value as 'all' | 'landing' | 'private_only')}
            className="bg-background border border-border rounded-xl px-3 py-1.5 text-text-primary focus:border-accent outline-none"
          >
            <option value="all">Exposición: Todos</option>
            <option value="landing">En Landing</option>
            <option value="private_only">Solo Miembros</option>
          </select>

          {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || landingFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setLandingFilter('all');
              }}
              className="text-accent hover:underline ml-auto font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* 3. LISTADO DE CONTENIDOS DEL MES */}
      <div className="space-y-3">
        {filteredItems.map((c) => (
          <div
            key={c.id}
            className="bg-raised border border-border hover:border-accent/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-sm"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-text-primary text-sm sm:text-base break-words">
                  {c.title}
                </h4>
                <span className="text-[10px] sm:text-[11px] bg-background border border-border px-2.5 py-0.5 rounded-pill text-text-secondary font-mono shrink-0">
                  {c.category}
                </span>
                {c.target_mode && (
                  <span className="text-[10px] sm:text-[11px] bg-background border border-border px-2.5 py-0.5 rounded-pill text-text-secondary shrink-0">
                    {c.target_mode}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-text-secondary">
                <span>📅 {c.month_year ?? c.cycle_date}</span>
                <span>•</span>
                {c.private_video_url || c.content_url ? (
                  <span className="text-emerald-400 font-medium">🎬 Video Privado Listo</span>
                ) : c.bunny_video_id ? (
                  <span className="text-accent font-medium">🐰 Bunny Stream</span>
                ) : (
                  <span className="text-zinc-500">Sin video</span>
                )}
                {c.preview_video_url && (
                  <>
                    <span>•</span>
                    <span className="text-purple-400 font-medium">👁️ Teaser Landing</span>
                  </>
                )}
                {c.pdf_url && (
                  <>
                    <span>•</span>
                    <span className="text-sky-400 font-medium">📄 PDF Adjunto</span>
                  </>
                )}
              </div>
            </div>

            {/* Botones de acción y switches rápidos */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 pt-3 md:pt-0 border-t border-border/40 md:border-t-0 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoadingId === c.id}
                  onClick={() => toggleLanding(c)}
                  className={`text-xs font-bold px-3 py-1 rounded-pill border transition flex items-center gap-1.5 disabled:opacity-50 min-h-[34px] ${
                    c.show_in_landing
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30'
                      : 'bg-background border-border text-zinc-400 hover:text-white'
                  }`}
                  title="Alternar si se muestra como adelanto público en el Landing"
                >
                  <span>{c.show_in_landing ? '🌐 En Landing' : '🔒 Solo Miembros'}</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoadingId === c.id}
                  onClick={() => togglePub(c)}
                  className={`text-xs font-bold px-3 py-1 rounded-pill border transition flex items-center gap-1.5 disabled:opacity-50 min-h-[34px] ${
                    c.is_published
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  }`}
                  title="Alternar estado de publicación"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${c.is_published ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>{c.is_published ? 'Publicado' : 'Borrador'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="text-xs bg-background hover:bg-accent hover:text-background border border-border px-3.5 py-1.5 rounded-pill font-bold text-text-primary transition min-h-[34px]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalTarget(c)}
                  className="text-xs bg-background hover:bg-red-500/20 text-red-400 hover:border-red-400 border border-border px-3 py-1.5 rounded-pill transition min-h-[34px]"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div role="status" className="bg-raised/50 border border-border rounded-2xl p-12 text-center text-text-secondary space-y-3">
            <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Cargando catálogo de clases y programas…</p>
          </div>
        )}

        {!loading && loadError && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center text-red-300 space-y-3">
            <AlertCircleIcon className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm font-semibold">{loadError}</p>
            <button
              type="button"
              onClick={load}
              className="px-4 py-1.5 rounded-pill text-xs font-bold bg-surface border border-red-500/40 hover:bg-red-500/20 text-white transition"
            >
              Reintentar carga
            </button>
          </div>
        )}

        {!loading && !loadError && filteredItems.length === 0 && (
          <div className="bg-raised/50 border border-dashed border-border rounded-2xl p-10 text-center text-text-secondary space-y-3">
            <div className="text-3xl" aria-hidden="true">📂</div>
            <p className="font-semibold text-text-primary">No se encontraron contenidos</p>
            <p className="text-xs max-w-sm mx-auto">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || landingFilter !== 'all'
                ? 'Prueba modificando los filtros aplicados arriba.'
                : 'Aún no has registrado clases o programas. Haz clic en "+ Nuevo Contenido" para crear el primero.'}
            </p>
            <button
              type="button"
              onClick={handleOpenNew}
              className="btn-accent !py-2 !px-4 text-xs font-bold mt-2"
            >
              + Crear primer contenido
            </button>
          </div>
        )}
      </div>

      {/* 4. MODAL BAJO DEMANDA: CREAR O EDITAR CONTENIDO (Foco inmediato y sin scroll disruptivo) */}
      <Modal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={editingId ? `Editar: "${form.title || 'Contenido'}"` : 'Nuevo Contenido del Programa'}
        size="lg"
      >
        <form onSubmit={submit} className="space-y-5 pt-2">
          {/* Datos Principales Generales */}
          <div className="grid md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Título del Programa / Clase *
              </label>
              <input
                required
                placeholder="Ej: GAP: Glúteos y Piernas"
                className={inputCls}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Categoría *
              </label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {['Clase', 'Rutina', 'Nutrición', 'Recurso', 'Full Body', 'Cardio HIIT', 'GAP'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Fecha de Ciclo
              </label>
              <input
                type="date"
                className={inputCls}
                value={form.cycle_date}
                onChange={(e) => setForm({ ...form, cycle_date: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Mes / Ciclo (Etiqueta)
              </label>
              <input
                placeholder="Ej: Octubre 2026"
                className={inputCls}
                value={form.month_year ?? ''}
                onChange={(e) => setForm({ ...form, month_year: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Modalidad
              </label>
              <select
                className={inputCls}
                value={form.target_mode}
                onChange={(e) => setForm({ ...form, target_mode: e.target.value })}
              >
                {['Ambos', 'Casa', 'Gimnasio'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SECCIÓN PRIVADA: MIEMBROS ACTIVOS */}
          <div className="bg-background/80 border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-border/70 pb-2.5">
              <span className="text-base">🔒</span>
              <h4 className="font-heading font-bold text-sm text-text-primary">
                Contenido Exclusivo para Miembros (Privado)
              </h4>
            </div>

            <div className="grid md:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">
                    Video Completo (Bucket members-media o URL)
                  </label>
                  <button
                    type="button"
                    onClick={() => openBucketFor('private_video')}
                    className="text-[11px] text-accent hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>📁 Seleccionar del Bucket</span>
                  </button>
                </div>
                <input
                  placeholder="URL en members-media o HLS"
                  className={inputCls}
                  value={form.private_video_url ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, private_video_url: e.target.value, content_url: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">
                  GUID Bunny Stream (Opcional)
                </label>
                <input
                  placeholder="ID Bunny Stream (ej: 4a2d-b8...)"
                  className={inputCls}
                  value={form.bunny_video_id ?? ''}
                  onChange={(e) => setForm({ ...form, bunny_video_id: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">
                    Documento PDF / Recetario
                  </label>
                  <button
                    type="button"
                    onClick={() => openBucketFor('pdf')}
                    className="text-[11px] text-accent hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>📁 Seleccionar del Bucket</span>
                  </button>
                </div>
                <input
                  placeholder="URL del PDF en members-media"
                  className={inputCls}
                  value={form.pdf_url ?? ''}
                  onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Descripción e Instrucciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones, series, repeticiones..."
                  className={inputCls}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN PÚBLICA: LANDING PAGE */}
          <div className="bg-background/80 border border-purple-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🌐</span>
                <h4 className="font-heading font-bold text-sm text-purple-300">
                  Adelanto Promocional en Landing (Público)
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-purple-500/15 border border-purple-500/40 px-3 py-1 rounded-pill text-xs font-bold text-purple-200">
                <input
                  type="checkbox"
                  checked={form.show_in_landing}
                  onChange={(e) => setForm({ ...form, show_in_landing: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
                Mostrar en Landing
              </label>
            </div>

            {form.show_in_landing && (
              <div className="grid md:grid-cols-2 gap-3.5 pt-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-secondary">
                      Video Demo / Teaser (Corto)
                    </label>
                    <button
                      type="button"
                      onClick={() => openBucketFor('preview_video')}
                      className="text-[11px] text-purple-400 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>📁 Seleccionar del Bucket</span>
                    </button>
                  </div>
                  <input
                    placeholder="/landing/demo-clase.mp4 o URL"
                    className={inputCls}
                    value={form.preview_video_url ?? ''}
                    onChange={(e) => setForm({ ...form, preview_video_url: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-text-secondary">
                      Miniatura / Portada
                    </label>
                    <button
                      type="button"
                      onClick={() => openBucketFor('thumbnail')}
                      className="text-[11px] text-purple-400 hover:underline font-bold inline-flex items-center gap-1"
                    >
                      <span>📁 Seleccionar del Bucket</span>
                    </button>
                  </div>
                  <input
                    placeholder="/landing/thumb-gap.jpg o URL"
                    className={inputCls}
                    value={form.thumbnail_url ?? ''}
                    onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary">
                    Duración / Etiqueta del Teaser
                  </label>
                  <input
                    placeholder="Ej: 60s · adelanto"
                    className={inputCls}
                    value={form.preview_duration ?? ''}
                    onChange={(e) => setForm({ ...form, preview_duration: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCIONES DEL FORMULARIO DENTRO DEL MODAL */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer bg-background border border-border px-3.5 py-2 rounded-xl hover:border-accent transition">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
              <span>{form.is_published ? '✅ Publicar de inmediato' : '🟡 Guardar como Borrador'}</span>
            </label>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setIsFormModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-pill text-xs border border-border text-text-secondary hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-accent !px-6 !py-2 text-xs font-bold shadow-md shadow-accent/25 disabled:opacity-50"
              >
                {busy ? 'Guardando…' : editingId ? 'Guardar Cambios' : 'Publicar Contenido'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* 5. MODAL SELECTOR DEL BUCKET MULTIMEDIA (Se abre bajo demanda desde cada campo) */}
      <Modal
        open={isBucketModalOpen}
        onClose={() => setIsBucketModalOpen(false)}
        title={
          assignTarget
            ? `Seleccionar archivo para: ${TARGET_LABELS[assignTarget]}`
            : 'Explorador Multimedia (Bucket: members-media)'
        }
        size="lg"
      >
        <div className="py-2">
          {assignTarget && (
            <div className="mb-4 p-3 rounded-xl bg-accent/15 border border-accent/40 text-xs text-text-primary flex items-center justify-between">
              <span>
                Asignando archivo a: <strong className="text-white">{TARGET_LABELS[assignTarget]}</strong>
              </span>
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="text-[11px] text-accent underline hover:text-white ml-2"
              >
                Modo libre
              </button>
            </div>
          )}
          <MediaBucketManager
            onSelectFile={handleAssignFromBucket}
            title="Archivos del Bucket members-media"
            compact={false}
          />
        </div>
      </Modal>

      {/* 6. MODAL ACCESIBLE DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal
        open={Boolean(deleteModalTarget)}
        onClose={() => setDeleteModalTarget(null)}
        title="Eliminar contenido permanentemente"
        size="md"
      >
        {deleteModalTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-base text-text-primary">
                  ¿Confirmas la eliminación?
                </h4>
                <p className="text-xs text-text-secondary">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-3 space-y-1 text-xs">
              <p className="font-bold text-text-primary">{deleteModalTarget.title}</p>
              <p className="text-text-secondary">
                Categoría: <span className="text-text-primary font-semibold">{deleteModalTarget.category}</span>
                {deleteModalTarget.month_year && (
                  <> · Ciclo: <span className="text-text-primary font-semibold">{deleteModalTarget.month_year}</span></>
                )}
              </p>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              El contenido se eliminará de la base de datos y dejará de estar disponible tanto en el Landing público como en el área de miembros.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeleteModalTarget(null)}
                className="px-4 py-2 rounded-pill text-xs border border-border text-text-secondary hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-pill text-xs font-bold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando…' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 7. TOAST FLOTANTE DE FEEDBACK (No invasivo, WAI-ARIA) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 transition ${
            toast.error
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}
        >
          {toast.error ? (
            <AlertCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 text-xs text-text-secondary"
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
