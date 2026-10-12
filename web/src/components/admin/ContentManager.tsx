import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MembershipContent } from '../../types';
import { MediaBucketManager } from './MediaBucketManager';

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

  const remove = async (id: string) => {
    if (!window.confirm('¿Eliminar este contenido?')) return;
    await supabase.from('membership_content').delete().eq('id', id);
    load();
  };

  const togglePub = async (c: MembershipContent) => {
    await supabase.from('membership_content').update({ is_published: !c.is_published }).eq('id', c.id);
    load();
  };

  const toggleLanding = async (c: MembershipContent) => {
    await supabase.from('membership_content').update({ show_in_landing: !c.show_in_landing }).eq('id', c.id);
    load();
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
      // Auto-detección según el tipo de archivo si no había un target fijo
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

  const inputCls =
    'w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent outline-none text-text-primary transition';

  return (
    <div className="space-y-8">
      {/* Botón para desplegar el gestor del bucket */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-raised/80 border border-border p-4 rounded-2xl">
        <div>
          <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
            <span>📦</span> Bucket Multimedia de Miembros (<code className="text-accent text-xs">members-media</code>)
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
      <form onSubmit={submit} className="bg-raised border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-heading font-bold text-xl text-text-primary flex items-center gap-2">
            <span>{editingId ? '✏️' : '➕'}</span>
            {editingId ? 'Editar Programa / Contenido' : 'Nuevo Programa / Contenido'}
          </h3>
          {editingId && (
            <span className="text-xs bg-accent/20 border border-accent/40 text-accent font-semibold px-3 py-1 rounded-full">
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

        {/* ============================================================== */}
        {/* BLOQUE 1: LO PÚBLICO (QUÉ SE MUESTRA EN EL LANDING PAGE) */}
        {/* ============================================================== */}
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
            <label className="flex items-center gap-2 cursor-pointer bg-accent/15 border border-accent/40 px-3 py-1.5 rounded-full text-xs font-bold text-white">
              <input
                type="checkbox"
                checked={form.show_in_landing}
                onChange={(e) => setForm({ ...form, show_in_landing: e.target.checked })}
                className="w-4 h-4 accent-[#FF2E93]"
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
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
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

        {/* ============================================================== */}
        {/* BLOQUE 2: LO PRIVADO (QUÉ VA A MIRAR EL MIEMBRO ACTIVO) */}
        {/* ============================================================== */}
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
                onChange={(e) => setForm({ ...form, private_video_url: e.target.value, content_url: e.target.value })}
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
              className="w-4 h-4 accent-[#FF2E93]"
            />
            <span className="font-semibold text-text-primary">
              {form.is_published ? '✅ Publicado (Visible a Miembros)' : '⏸️ Oculto (Borrador)'}
            </span>
          </label>
        </div>
      </form>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            msg.error ? 'bg-red-500/15 border border-red-500/30 text-red-200' : 'bg-green-500/15 border border-green-500/30 text-green-200'
          }`}
        >
          <span>{msg.text}</span>
          <button type="button" onClick={() => setMsg(null)} className="text-text-secondary hover:text-white font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* LISTADO DE CONTENIDOS DEL MES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-text-primary">
            Programas y Clases Registrados ({items.length})
          </h3>
          <span className="text-xs text-text-secondary">
            Administra qué programas se muestran en el Landing y cuáles en la Biblioteca
          </span>
        </div>

        <div className="space-y-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="bg-raised border border-border hover:border-accent/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-text-primary text-base truncate">{c.title}</p>
                  <span className="text-[11px] bg-background border border-border px-2 py-0.5 rounded-md text-text-secondary font-mono">
                    {c.category}
                  </span>
                  {c.target_mode && (
                    <span className="text-[11px] bg-background border border-border px-2 py-0.5 rounded-md text-text-secondary">
                      {c.target_mode}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  <span>📅 {c.month_year ?? c.cycle_date}</span>
                  <span>•</span>
                  {c.private_video_url || c.content_url ? (
                    <span className="text-green-400">🎬 Video Listo</span>
                  ) : c.bunny_video_id ? (
                    <span className="text-accent">🐰 Bunny Stream</span>
                  ) : (
                    <span className="text-gray-500">Sin video</span>
                  )}
                  {c.pdf_url && (
                    <>
                      <span>•</span>
                      <span className="text-blue-400">📄 PDF Adjunto</span>
                    </>
                  )}
                </div>
              </div>

              {/* Indicadores de exposición: Público vs Privado */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleLanding(c)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                    c.show_in_landing
                      ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30'
                      : 'bg-background border-border text-gray-500 hover:text-white'
                  }`}
                  title="Haz clic para alternar si se muestra en el Landing público"
                >
                  <span>🌐</span>
                  <span>{c.show_in_landing ? 'En Landing' : 'Oculto en Landing'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => togglePub(c)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                    c.is_published
                      ? 'bg-green-500/15 border-green-500/40 text-green-300 hover:bg-green-500/25'
                      : 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/25'
                  }`}
                  title="Haz clic para alternar si está visible para miembros"
                >
                  <span>🔒</span>
                  <span>{c.is_published ? 'Miembros Activo' : 'Borrador'}</span>
                </button>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => edit(c)}
                  className="text-xs bg-background hover:bg-accent hover:text-background border border-border px-3.5 py-1.5 rounded-pill font-semibold text-text-primary transition"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="text-xs bg-background hover:bg-red-500/20 text-red-400 hover:border-red-400 border border-border px-3 py-1.5 rounded-pill transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="bg-raised/50 border border-border rounded-2xl p-8 text-center text-text-secondary text-sm">
              No hay programas registrados todavía. Utiliza el formulario superior para agregar tu primer contenido.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
