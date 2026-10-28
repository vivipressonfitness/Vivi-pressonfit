import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MembershipContent } from '../../types';
import { MediaBucketManager } from './MediaBucketManager';
import {
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrashIcon,
  VideoIcon,
  FolderIcon,
} from '../ui/Icons';

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
  is_published: true,
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
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [showBucketDrawer, setShowBucketDrawer] = useState(false);
  const [assignTarget, setAssignTarget] = useState<'private_video' | 'preview_video' | 'thumbnail' | 'pdf' | null>(null);

  // Estados de seguridad y filtros (F-13)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteModalTarget, setDeleteModalTarget] = useState<MembershipContent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filtros de búsqueda en el listado
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [landingFilter, setLandingFilter] = useState<'all' | 'landing' | 'private_only'>('all');

  const load = () => {
    supabase
      .from('membership_content')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setItems(data);
      });
  };

  useEffect(load, []);

  const reset = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
    setAssignTarget(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const payload = {
      cycle_date: form.cycle_date,
      category: form.category,
      title: form.title,
      description: form.description || null,
      bunny_video_id: form.bunny_video_id || null,
      storage_path: form.storage_path || null,
      content_url: form.private_video_url || form.content_url || null,
      target_mode: form.target_mode || 'Ambos',
      class_type: form.class_type || null,
      month_year: form.month_year || null,
      is_published: form.is_published,
      // Campos público vs privado:
      show_in_landing: Boolean(form.show_in_landing),
      preview_video_url: form.preview_video_url || null,
      thumbnail_url: form.thumbnail_url || null,
      preview_duration: form.preview_duration || 'Adelanto gratis',
      pdf_url: form.pdf_url || null,
      private_video_url: form.private_video_url || null,
    };

    const { error } = editingId
      ? await supabase.from('membership_content').update(payload).eq('id', editingId)
      : await supabase.from('membership_content').insert(payload);

    setBusy(false);
    if (error) {
      setMsg({ text: `Error: ${error.message}`, error: true });
    } else {
      setMsg({ text: editingId ? '✅ Contenido actualizado con éxito' : '✅ Contenido agregado con éxito' });
      reset();
      load();
    }
  };

  const edit = (c: MembershipContent) => {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminación segura con modal y manejo de error (F-13)
  const handleConfirmDelete = async () => {
    if (!deleteModalTarget) return;
    setDeleteLoading(true);
    setMsg(null);

    const { error } = await supabase
      .from('membership_content')
      .delete()
      .eq('id', deleteModalTarget.id);

    setDeleteLoading(false);

    if (error) {
      setMsg({ text: `Error al eliminar contenido: ${error.message}`, error: true });
    } else {
      setMsg({ text: `✅ "${deleteModalTarget.title}" ha sido eliminado exitosamente.` });
      setItems((prev) => prev.filter((item) => item.id !== deleteModalTarget.id));
      if (editingId === deleteModalTarget.id) reset();
    }
    setDeleteModalTarget(null);
  };

  // Toggle de publicación con manejo de error (F-13)
  const togglePub = async (c: MembershipContent) => {
    setActionLoadingId(c.id);
    setMsg(null);
    const nextVal = !c.is_published;

    const { error } = await supabase
      .from('membership_content')
      .update({ is_published: nextVal })
      .eq('id', c.id);

    setActionLoadingId(null);

    if (error) {
      setMsg({ text: `Error al cambiar estado de publicación: ${error.message}`, error: true });
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, is_published: nextVal } : item))
      );
    }
  };

  // Toggle de visibilidad en Landing con manejo de error (F-13)
  const toggleLanding = async (c: MembershipContent) => {
    setActionLoadingId(c.id);
    setMsg(null);
    const nextVal = !c.show_in_landing;

    const { error } = await supabase
      .from('membership_content')
      .update({ show_in_landing: nextVal })
      .eq('id', c.id);

    setActionLoadingId(null);

    if (error) {
      setMsg({ text: `Error al cambiar visibilidad en Landing: ${error.message}`, error: true });
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, show_in_landing: nextVal } : item))
      );
    }
  };

  // Asignar archivo seleccionado desde el bucket members-media
  const handleAssignFromBucket = (fileUrl: string, fileType: 'video' | 'image' | 'pdf') => {
    if (assignTarget === 'private_video') {
      setForm((prev) => ({ ...prev, private_video_url: fileUrl, content_url: fileUrl }));
      setMsg({ text: '🎬 Video privado asignado desde el bucket' });
    } else if (assignTarget === 'preview_video') {
      setForm((prev) => ({ ...prev, preview_video_url: fileUrl, show_in_landing: true }));
      setMsg({ text: '👁️ Video demo público asignado desde el bucket' });
    } else if (assignTarget === 'thumbnail') {
      setForm((prev) => ({ ...prev, thumbnail_url: fileUrl }));
      setMsg({ text: '🖼️ Miniatura asignada desde el bucket' });
    } else if (assignTarget === 'pdf') {
      setForm((prev) => ({ ...prev, pdf_url: fileUrl }));
      setMsg({ text: '📄 Documento PDF asignado desde el bucket' });
    } else {
      if (fileType === 'video') {
        setForm((prev) => ({ ...prev, private_video_url: fileUrl, content_url: fileUrl }));
        setMsg({ text: '🎬 Video privado asignado desde el bucket' });
      } else if (fileType === 'image') {
        setForm((prev) => ({ ...prev, thumbnail_url: fileUrl }));
        setMsg({ text: '🖼️ Miniatura asignada desde el bucket' });
      } else {
        setForm((prev) => ({ ...prev, pdf_url: fileUrl }));
        setMsg({ text: '📄 Documento PDF asignado desde el bucket' });
      }
    }
  };

  // Filtrado de contenidos en el listado
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
    <div className="space-y-8">
      {/* Botón para desplegar el gestor del bucket */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-raised/80 border border-border p-4 rounded-2xl">
        <div>
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <FolderIcon className="w-5 h-5 text-accent" />
            <span>Bucket Multimedia de Miembros (<code>members-media</code>)</span>
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Sube videos completos, demos del landing, miniaturas o PDFs y asígnalos con un clic.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowBucketDrawer(!showBucketDrawer)}
          className={`px-4 py-2 rounded-pill font-bold text-xs transition flex items-center gap-2 ${
            showBucketDrawer
              ? 'bg-accent text-background'
              : 'bg-background border border-border text-text-primary hover:border-accent'
          }`}
        >
          <span>{showBucketDrawer ? '▲ Ocultar Gestor de Archivos' : '▼ Abrir Gestor de Archivos'}</span>
        </button>
      </div>

      {/* Visor / Subidor del Bucket members-media */}
      {showBucketDrawer && (
        <MediaBucketManager
          onSelectFile={handleAssignFromBucket}
          title="Subir y Seleccionar Multimedia para los Contenidos"
        />
      )}

      {/* FORMULARIO DE CONTENIDO (PÚBLICO Y PRIVADO) */}
      <form onSubmit={submit} className="bg-raised border border-border rounded-2xl p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-heading font-bold text-xl text-text-primary flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-accent" />
            <span>{editingId ? 'Editar Programa / Contenido' : 'Nuevo Programa / Contenido'}</span>
          </h3>
          {editingId && (
            <span className="text-xs bg-accent/20 border border-accent/40 text-accent font-semibold px-3 py-1 rounded-pill">
              Editando ID: {editingId.slice(0, 8)}…
            </span>
          )}
        </div>

        {/* Datos Principales Generales */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Título del Programa / Clase *
            </label>
            <input
              required
              placeholder="Ej: Semana 1 - GAP: Glúteos y Piernas de Acero"
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
              Modalidad de Entrenamiento
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

        {/* BLOQUE 1: LO PÚBLICO (QUÉ SE MUESTRA EN EL LANDING PAGE) */}
        <div className="bg-background/80 border-2 border-accent/30 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌐</span>
              <div>
                <h4 className="font-heading font-bold text-base text-accent">
                  Sección Pública: Adelanto en Landing Page
                </h4>
                <p className="text-xs text-text-secondary">
                  Define si este programa se promociona gratis en la portada a visitantes sin cuenta.
                </p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-accent/15 border border-accent/40 px-3 py-1.5 rounded-pill text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={form.show_in_landing}
                onChange={(e) => setForm({ ...form, show_in_landing: e.target.checked })}
                className="w-4 h-4 accent-accent rounded"
              />
              Mostrar como Adelanto en el Landing
            </label>
          </div>

          {form.show_in_landing ? (
            <div className="grid md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">
                    Video Demo / Teaser Público (URL o members-media)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignTarget('preview_video');
                      setShowBucketDrawer(true);
                    }}
                    className="text-[11px] text-accent hover:underline"
                  >
                    Elegir del Bucket
                  </button>
                </div>
                <input
                  placeholder="https://... o /landing/demo-fuerza.mp4"
                  className={inputCls}
                  value={form.preview_video_url ?? ''}
                  onChange={(e) => setForm({ ...form, preview_video_url: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-text-secondary">
                    Miniatura / Portada Pública (URL o imagen)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignTarget('thumbnail');
                      setShowBucketDrawer(true);
                    }}
                    className="text-[11px] text-accent hover:underline"
                  >
                    Elegir del Bucket
                  </button>
                </div>
                <input
                  placeholder="https://... o /landing/thumb-gap.jpg"
                  className={inputCls}
                  value={form.thumbnail_url ?? ''}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-secondary">
                  Duración / Badge de adelanto
                </label>
                <input
                  placeholder="Ej: 30s · adelanto gratis"
                  className={inputCls}
                  value={form.preview_duration ?? ''}
                  onChange={(e) => setForm({ ...form, preview_duration: e.target.value })}
                />
              </div>

              {/* Previsualización en miniatura si existe portada */}
              {form.thumbnail_url && (
                <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-border">
                  <img
                    src={form.thumbnail_url}
                    alt="Preview portada"
                    className="w-16 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-xs text-text-secondary">Miniatura activa para el Landing</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-text-secondary italic">
              Activa la casilla si deseas que este programa aparezca en la galería o adelantos del Landing público.
            </p>
          )}
        </div>

        {/* BLOQUE 2: LO PRIVADO (QUÉ VA A MIRAR EL MIEMBRO ACTIVO) */}
        <div className="bg-background/80 border-2 border-border/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="text-xl">🔒</span>
            <div>
              <h4 className="font-heading font-bold text-base text-text-primary">
                Sección Privada: Contenido Exclusivo para Miembros
              </h4>
              <p className="text-xs text-text-secondary">
                Solo accesible para usuarios con membresía activa o período de prueba válido.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-secondary">
                  Video Completo de la Clase (Bucket members-media o URL)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAssignTarget('private_video');
                    setShowBucketDrawer(true);
                  }}
                  className="text-[11px] text-accent hover:underline"
                >
                  Elegir del Bucket
                </button>
              </div>
              <input
                placeholder="URL completa en members-media o HLS"
                className={inputCls}
                value={form.private_video_url ?? ''}
                onChange={(e) =>
                  setForm({ ...form, private_video_url: e.target.value, content_url: e.target.value })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                ID de Video Bunny Stream (Opcional, si usas Bunny CDN)
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
                  Material Complementario en PDF / Guía de Nutrición
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAssignTarget('pdf');
                    setShowBucketDrawer(true);
                  }}
                  className="text-[11px] text-accent hover:underline"
                >
                  Elegir del Bucket
                </button>
              </div>
              <input
                placeholder="URL del PDF en members-media"
                className={inputCls}
                value={form.pdf_url ?? ''}
                onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-text-secondary">
                Descripción Completa e Instrucciones para el Miembro
              </label>
              <textarea
                rows={3}
                placeholder="Instrucciones, repeticiones, tiempos de descanso o sugerencias para el alumno..."
                className={inputCls}
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Acciones del formulario */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
          <button
            type="submit"
            disabled={busy}
            className="bg-accent hover:bg-white text-background font-bold px-7 py-3 rounded-pill text-sm transition disabled:opacity-50 shadow-md shadow-accent/25"
          >
            {busy ? 'Guardando cambios...' : editingId ? 'Actualizar Contenido' : 'Guardar Nuevo Contenido'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="border border-border text-text-secondary px-6 py-3 rounded-pill text-sm hover:text-text-primary transition"
            >
              Cancelar Edición
            </button>
          )}

          <label className="flex items-center gap-2 text-sm text-text-secondary ml-auto cursor-pointer bg-background border border-border px-4 py-2 rounded-xl">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 accent-accent rounded"
            />
            <span className="font-semibold text-text-primary">
              {form.is_published ? '✅ Publicado (Visible a Miembros)' : '⏸️ Oculto (Borrador)'}
            </span>
          </label>
        </div>
      </form>

      {/* Banner de mensajes y feedback */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            msg.error
              ? 'bg-red-500/15 border-red-500/30 text-red-200'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.error ? (
              <AlertCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-text-secondary hover:text-white font-bold ml-2 text-xs underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* LISTADO DE CONTENIDOS DEL MES CON FILTROS (F-13) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-text-primary">
              Programas y Clases Registrados ({filteredItems.length} de {items.length})
            </h3>
            <p className="text-xs text-text-secondary">
              Filtra, audita visibilidad y administra programas públicos y privados.
            </p>
          </div>
        </div>

        {/* Barra de Filtros de Contenido */}
        <div className="flex flex-wrap items-center gap-2 bg-raised/80 border border-border p-3 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <FilterIcon className="w-3.5 h-3.5 text-accent" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Filtros:</span>
          </div>

          <div className="w-48 relative">
            <SearchIcon className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar contenido…"
              className="w-full bg-background border border-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-text-primary focus:border-accent outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-background border border-border rounded-lg px-2.5 py-1 text-text-primary focus:border-accent outline-none"
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
            className="bg-background border border-border rounded-lg px-2.5 py-1 text-text-primary focus:border-accent outline-none"
          >
            <option value="all">Estado: Todos</option>
            <option value="published">Solo Publicados</option>
            <option value="draft">Solo Borradores</option>
          </select>

          <select
            value={landingFilter}
            onChange={(e) => setLandingFilter(e.target.value as 'all' | 'landing' | 'private_only')}
            className="bg-background border border-border rounded-lg px-2.5 py-1 text-text-primary focus:border-accent outline-none"
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
              className="text-accent hover:underline ml-auto"
            >
              Restablecer filtros
            </button>
          )}
        </div>

        {/* Lista de Items */}
        <div className="space-y-3">
          {filteredItems.map((c) => (
            <div
              key={c.id}
              className="bg-raised border border-border hover:border-accent/30 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-text-primary text-sm sm:text-base break-words">{c.title}</p>
                  <span className="text-[10px] sm:text-[11px] bg-background border border-border px-2 py-0.5 rounded-pill text-text-secondary font-mono shrink-0">
                    {c.category}
                  </span>
                  {c.target_mode && (
                    <span className="text-[10px] sm:text-[11px] bg-background border border-border px-2 py-0.5 rounded-pill text-text-secondary shrink-0">
                      {c.target_mode}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-text-secondary">
                  <span>📅 {c.month_year ?? c.cycle_date}</span>
                  <span>•</span>
                  {c.private_video_url || c.content_url ? (
                    <span className="text-emerald-400">🎬 Video Listo</span>
                  ) : c.bunny_video_id ? (
                    <span className="text-accent">🐰 Bunny Stream</span>
                  ) : (
                    <span className="text-zinc-500">Sin video</span>
                  )}
                  {c.pdf_url && (
                    <>
                      <span>•</span>
                      <span className="text-sky-400">📄 PDF Adjunto</span>
                    </>
                  )}
                </div>
              </div>

              {/* Botones de acción y estado con protección de carga */}
              <div className="flex flex-wrap items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t border-border/40 md:border-t-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={actionLoadingId === c.id}
                    onClick={() => toggleLanding(c)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-pill border transition flex items-center gap-1 disabled:opacity-50 ${
                      c.show_in_landing
                        ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                        : 'bg-background border-border text-zinc-500 hover:text-white'
                    }`}
                    title="Haz clic para alternar si se muestra en el Landing público"
                  >
                    <span>🌐</span>
                    <span>{c.show_in_landing ? 'En Landing' : 'Oculto'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoadingId === c.id}
                    onClick={() => togglePub(c)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-pill border transition flex items-center gap-1 disabled:opacity-50 ${
                      c.is_published
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                    }`}
                    title="Haz clic para alternar si está visible para miembros"
                  >
                    <span>🔒</span>
                    <span>{c.is_published ? 'Publicado' : 'Borrador'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => edit(c)}
                    className="text-xs bg-background hover:bg-accent hover:text-background border border-border px-3 py-1 rounded-pill font-semibold text-text-primary transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalTarget(c)}
                    className="text-xs bg-background hover:bg-red-500/20 text-red-400 hover:border-red-400 border border-border px-3 py-1 rounded-pill transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="bg-raised/50 border border-dashed border-border rounded-2xl p-8 text-center text-text-secondary text-sm space-y-1">
              <p className="font-semibold text-text-primary">No se encontraron contenidos</p>
              <p className="text-xs">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || landingFilter !== 'all'
                  ? 'Prueba modificando los filtros aplicados.'
                  : 'Aún no has registrado programas o clases. Usa el formulario superior para crear el primero.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE CONTENIDO (F-13) */}
      {deleteModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-raised border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  ¿Eliminar este contenido permanentemente?
                </h3>
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
                className="px-4 py-2 rounded-pill text-xs border border-border text-text-secondary hover:text-text-primary transition"
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
        </div>
      )}
    </div>
  );
}
