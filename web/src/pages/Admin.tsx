import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import { LandingConfigEditor } from '../components/admin/LandingConfigEditor';
import { ContentManager } from '../components/admin/ContentManager';

// Panel admin con autonomía plena: 3 pestañas.
// - Contenido: CRUD de membership_content (clases/rutinas del mes)
// - Landing: editor de landing_config (precio, WhatsApp, textos hero, imágenes)
// - Miembros: lista de perfiles con plan + toggle miembro/administrador
//   (la BD aplica RLS: solo perfiles con is_admin=true pueden leer/escribir)
type Tab = 'members' | 'content' | 'landing';

interface MemberRow {
  id: string;
  email: string;
  full_name: string | null;
  plan_status: string;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const myId = useAuthStore((s) => s.user?.id);
  const [profiles, setProfiles] = useState<MemberRow[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('content');

  async function loadMembers() {
    setLoadingMembers(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan_status, is_admin, created_at')
      .order('created_at', { ascending: false });
    if (!error) setProfiles((data as MemberRow[]) ?? []);
    setLoadingMembers(false);
  }

  useEffect(() => {
    if (!isAdmin) return;
    loadMembers();
  }, [isAdmin]);

  // Diferenciar miembros y administradores: la admin puede promover/retrolear roles.
  // No permite quitarse el propio rol (evita quedar sin acceso al panel).
  async function toggleRole(m: MemberRow) {
    if (m.id === myId) { setRoleError('No puedes cambiar tu propio rol.'); return; }
    setRoleError(null);
    setUpdatingId(m.id);
    const nextAdmin = !m.is_admin;
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: nextAdmin, plan_status: nextAdmin ? 'active' : m.plan_status })
      .eq('id', m.id);
    if (error) setRoleError(`No se pudo actualizar el rol: ${error.message}`);
    else setProfiles((prev) => prev.map((p) => (p.id === m.id ? { ...p, is_admin: nextAdmin, plan_status: nextAdmin ? 'active' : p.plan_status } : p)));
    setUpdatingId(null);
  }

  if (!isAdmin) return <p className="text-text-secondary py-10">No tienes permisos de administrador.</p>;

  const adminsCount = profiles.filter((p) => p.is_admin).length;
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'content', label: 'Contenido del mes' },
    { id: 'landing', label: 'Landing / Precios' },
    { id: 'members', label: `Miembros (${profiles.length - adminsCount})` },
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
          {roleError && <p className="p-4 pb-0 text-red-400 text-sm">{roleError}</p>}
          {loadingMembers ? (
            <p className="p-4 text-text-secondary">Cargando miembros…</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-text-secondary border-b border-border">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="p-4">{p.full_name ?? '—'}</td>
                    <td className="p-4 text-text-secondary">{p.email}</td>
                    <td className="p-4">{p.plan_status}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-pill text-xs font-bold ${p.is_admin ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-secondary'}`}>
                        {p.is_admin ? 'Administrador' : 'Miembro'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleRole(p)}
                        disabled={updatingId === p.id || p.id === myId}
                        title={p.id === myId ? 'No puedes cambiar tu propio rol' : undefined}
                        className="px-3 py-1 rounded-pill text-xs font-bold border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {updatingId === p.id ? 'Guardando…' : p.is_admin ? 'Retroceder a Miembro' : 'Hacer Administrador'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}
