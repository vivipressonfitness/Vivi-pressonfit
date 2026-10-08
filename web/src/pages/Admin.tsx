import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import { LandingConfigEditor } from '../components/admin/LandingConfigEditor';
import { ContentManager } from '../components/admin/ContentManager';

// Panel admin con autonomía plena: 3 pestañas.
// - Contenido: CRUD de membership_content (clases/rutinas del mes)
// - Landing: editor de landing_config (precio, WhatsApp, textos hero, imágenes)
// - Miembros: lista de perfiles con plan. Solo accesible si profiles.is_admin = true
//   (además la BD aplica RLS, así que sin rol admin no hay datos ni escritura).
type Tab = 'members' | 'content' | 'landing';

export default function Admin() {
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const [profiles, setProfiles] = useState<Array<{ id: string; email: string; full_name: string | null; plan_status: string }>>([]);
  const [tab, setTab] = useState<Tab>('content');

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('profiles').select('id, email, full_name, plan_status').then(({ data }) => setProfiles(data ?? []));
  }, [isAdmin]);

  if (!isAdmin) return <p className="text-text-secondary py-10">No tienes permisos de administrador.</p>;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'content', label: 'Contenido del mes' },
    { id: 'landing', label: 'Landing / Precios' },
    { id: 'members', label: `Miembros (${profiles.length})` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Panel Admin</h1>
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-pill text-sm font-bold transition ${tab === t.id ? 'bg-accent text-white' : 'border border-border text-text-secondary hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && <ContentManager />}

      {tab === 'landing' && (
        <Card>
          <LandingConfigEditor />
        </Card>
      )}

      {tab === 'members' && (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-text-secondary border-b border-border">
              <tr><th className="p-4">Nombre</th><th className="p-4">Email</th><th className="p-4">Plan</th></tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-4">{p.full_name ?? '—'}</td>
                  <td className="p-4 text-text-secondary">{p.email}</td>
                  <td className="p-4">{p.plan_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
