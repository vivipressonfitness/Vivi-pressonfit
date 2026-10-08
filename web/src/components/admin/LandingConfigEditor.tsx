import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_CONFIG, type LandingConfig } from '../../hooks/useLandingConfig';

// Editor de landing_config: upsert por clave. Autonomía total para la admin:
// precio, WhatsApp, textos del hero, títulos de secciones e imágenes.
const FIELDS: Array<{ key: keyof LandingConfig; label: string; type: 'text' | 'number' | 'textarea' | 'url' }> = [
  { key: 'monthly_price', label: 'Precio mensual (USD)', type: 'number' },
  { key: 'whatsapp_number', label: 'WhatsApp (con código país, solo dígitos)', type: 'text' },
  { key: 'hero_title', label: 'Hero — título', type: 'text' },
  { key: 'hero_title_sub', label: 'Hero — título resaltado (rosa)', type: 'text' },
  { key: 'hero_sub', label: 'Hero — descripción', type: 'textarea' },
  { key: 'pilares_title', label: 'Sección Pilares — título', type: 'text' },
  { key: 'membresias_title', label: 'Sección Membresía — título', type: 'text' },
  { key: 'hero_image', label: 'Hero — URL imagen', type: 'url' },
  { key: 'educacion_image', label: 'Nutrición — URL imagen', type: 'url' },
];

export function LandingConfigEditor() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('landing_config').select('key, value').then(({ data }) => {
      const map: Record<string, string> = {};
      for (const row of (data ?? []) as Array<{ key: string; value: unknown }>) {
        map[row.key] = String(row.value).replace(/^"|"$/g, '');
      }
      // defaults visibles si la clave aún no existe en BD
      const initial: Record<string, string> = {};
      for (const f of FIELDS) {
        initial[f.key] = map[f.key] ?? String(DEFAULT_CONFIG[f.key]);
      }
      setValues(initial);
    });
  }, []);

  const save = async (key: keyof LandingConfig) => {
    setSaving(key);
    setMsg(null);
    const value = key === 'monthly_price' ? Number(values[key] ?? 0) : values[key] ?? '';
    const { error } = await supabase
      .from('landing_config')
      .upsert({ key, value }, { onConflict: 'key' });
    setSaving(null);
    setMsg(error ? `Error al guardar ${key}: ${error.message}` : `✅ "${key}" guardado`);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Los cambios se reflejan al instante en la landing pública (<code className="text-accent">/</code>).
      </p>
      {FIELDS.map((f) => (
        <div key={f.key} className="bg-raised border border-border rounded-2xl p-4">
          <label className="block text-xs uppercase tracking-wider font-bold text-text-secondary mb-2">
            {f.label}
          </label>
          {f.type === 'textarea' ? (
            <textarea
              rows={3}
              value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-accent outline-none"
            />
          ) : (
            <input
              type={f.type === 'number' ? 'number' : 'text'}
              value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm focus:border-accent outline-none"
            />
          )}
          <button
            onClick={() => save(f.key)}
            disabled={saving === f.key}
            className="mt-2 bg-accent hover:bg-white text-background text-sm font-bold px-4 py-2 rounded-pill transition disabled:opacity-50"
          >
            {saving === f.key ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      ))}
      {msg && <p className="text-sm text-text-primary">{msg}</p>}
    </div>
  );
}
