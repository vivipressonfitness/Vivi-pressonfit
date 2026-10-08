import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MembershipContent } from '../../types';

// CRUD de membership_content (contenido del mes visible en el dashboard).
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
};

export function ContentManager() {
  const [items, setItems] = useState<MembershipContent[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    supabase
      .from('membership_content')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  };
  useEffect(load, []);

  const reset = () => {
    setForm({ ...EMPTY });
    setEditingId(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const payload = {
      ...form,
      description: form.description || null,
      bunny_video_id: form.bunny_video_id || null,
      content_url: form.content_url || null,
      class_type: form.class_type || null,
      month_year: form.month_year || null,
    };
    const { error } = editingId
      ? await supabase.from('membership_content').update(payload).eq('id', editingId)
      : await supabase.from('membership_content').insert(payload);
    setBusy(false);
    if (error) setMsg(`Error: ${error.message}`);
    else {
      setMsg(editingId ? '✅ Contenido actualizado' : '✅ Contenido agregado');
      reset();
      load();
    }
  };

  const edit = (c: MembershipContent) => {
    setForm({
      cycle_date: c.cycle_date, category: c.category, title: c.title,
      description: c.description, bunny_video_id: c.bunny_video_id,
      storage_path: c.storage_path, content_url: c.content_url,
      target_mode: c.target_mode, class_type: c.class_type,
      month_year: c.month_year, is_published: c.is_published,
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

  const inputCls =
    'w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-accent outline-none';

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-raised border border-border rounded-2xl p-5 grid md:grid-cols-2 gap-4">
        <h3 className="md:col-span-2 font-heading font-bold text-lg text-text-primary">
          {editingId ? 'Editar contenido del mes' : 'Agregar contenido del mes'}
        </h3>
        <input required placeholder="Título (ej: Semana 1 - GAP Intenso)" className={inputCls}
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select className={inputCls} value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['Clase', 'Rutina', 'Nutrición', 'Recurso'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="date" className={inputCls} value={form.cycle_date}
          onChange={(e) => setForm({ ...form, cycle_date: e.target.value })} />
        <input placeholder="Mes-Año (ej: Octubre 2026)" className={inputCls}
          value={form.month_year ?? ''} onChange={(e) => setForm({ ...form, month_year: e.target.value })} />
        <input placeholder="ID video Bunny Stream (opcional)" className={inputCls}
          value={form.bunny_video_id ?? ''} onChange={(e) => setForm({ ...form, bunny_video_id: e.target.value })} />
        <input placeholder="URL alternativa (opcional)" className={inputCls}
          value={form.content_url ?? ''} onChange={(e) => setForm({ ...form, content_url: e.target.value })} />
        <textarea rows={2} placeholder="Descripción" className={`${inputCls} md:col-span-2`}
          value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="flex items-center gap-3 md:col-span-2">
          <button type="submit" disabled={busy}
            className="bg-accent hover:bg-white text-background font-bold px-6 py-3 rounded-pill text-sm transition disabled:opacity-50">
            {busy ? 'Guardando…' : editingId ? 'Actualizar' : 'Agregar'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="border border-border text-text-secondary px-6 py-3 rounded-pill text-sm hover:text-text-primary transition">
              Cancelar
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-text-secondary ml-auto">
            <input type="checkbox" checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="accent-[#FF2E93]" />
            Publicado
          </label>
        </div>
      </form>
      {msg && <p className="text-sm">{msg}</p>}

      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="bg-raised border border-border rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-text-primary truncate">{c.title}</p>
              <p className="text-xs text-text-secondary">
                {c.category} · {c.month_year ?? c.cycle_date} · {c.bunny_video_id ? 'Bunny 🎬' : c.content_url ? 'URL 🔗' : '—'}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.is_published ? 'bg-accent/20 text-accent' : 'bg-surface text-text-secondary'}`}>
              {c.is_published ? 'Publicado' : 'Oculto'}
            </span>
            <button onClick={() => togglePub(c)} className="text-xs border border-border rounded-pill px-3 py-1.5 text-text-secondary hover:text-text-primary transition">
              {c.is_published ? 'Ocultar' : 'Publicar'}
            </button>
            <button onClick={() => edit(c)} className="text-xs border border-border rounded-pill px-3 py-1.5 text-text-secondary hover:text-accent transition">
              Editar
            </button>
            <button onClick={() => remove(c.id)} className="text-xs border border-border rounded-pill px-3 py-1.5 text-red-400 hover:border-red-400 transition">
              Eliminar
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-text-secondary">Sin contenido todavía.</p>}
      </div>
    </div>
  );
}
