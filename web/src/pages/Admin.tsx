import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import { LandingConfigEditor } from '../components/admin/LandingConfigEditor';
import { ContentManager } from '../components/admin/ContentManager';
import { AnalyticsChart } from '../components/admin/AnalyticsChart';

import { MediaManager } from '../components/admin/MediaManager';

// Panel admin con autonomía plena: 4 pestañas.
// - Contenido: CRUD de membership_content (público para landing y privado para miembros)
// - Bucket: gestor de archivos multimedia del bucket members-media
// - Landing: editor de landing_config (precio, WhatsApp, textos hero, imágenes)
// - Miembros: lista de perfiles con plan + toggle miembro/administrador
type Tab = 'content' | 'bucket' | 'landing' | 'members';

interface MemberRow {
  id: string;
  email: string;
  full_name: string | null;
  plan_status: string;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const isStoreAdmin = useMembershipStore((s) => s.isAdmin);
  const profile = useAuthStore((s) => s.profile);
  const initializing = useAuthStore((s) => s.initializing);
  const membershipLoading = useMembershipStore((s) => s.loading);
  const isAdmin = isStoreAdmin || Boolean(profile?.is_admin);
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

  if (initializing || (membershipLoading && !profile)) {
    return (
      <div className="py-20 text-center text-text-secondary flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span>Verificando credenciales de administrador…</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center text-text-secondary">
        <p className="text-accent font-semibold text-lg mb-2">Acceso restringido</p>
        <p>Esta sección está reservada exclusivamente para la administración del portal.</p>
      </div>
    );
  }

  const adminsCount = profiles.filter((p) => p.is_admin).length;
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'content', label: 'Contenido del mes (Público / Privado)' },
    { id: 'bucket', label: '📦 Bucket Multimedia' },
    { id: 'landing', label: 'Landing / Precios' },
    { id: 'members', label: `Miembros (${profiles.length - adminsCount})` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Panel Admin</h1>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-pill text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${tab === t.id ? 'bg-accent text-background' : 'border border-border text-text-secondary hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'content' && <ContentManager />}

      {tab === 'bucket' && <MediaManager />}

      {tab === 'landing' && (
        <Card>
          <LandingConfigEditor />
        </Card>
      )}

      {tab === 'members' && (
        <div className="space-y-6">
          <AnalyticsChart members={profiles} />
          <Card className="overflow-x-auto !p-0">
          {roleError && <p className="p-4 pb-0 text-red-400 text-sm">{roleError}</p>}
          {loadingMembers ? (
            <p className="p-4 text-text-secondary">Cargando miembros…</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs sm:text-sm min-w-[580px]">
                <thead className="text-left text-text-secondary border-b border-border">
                  <tr>
                    <th className="p-3 sm:p-4">Nombre</th>
                    <th className="p-3 sm:p-4">Email</th>
                    <th className="p-3 sm:p-4">Plan</th>
                    <th className="p-3 sm:p-4">Rol</th>
                    <th className="p-3 sm:p-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="p-3 sm:p-4 font-medium">{p.full_name ?? '—'}</td>
                      <td className="p-3 sm:p-4 text-text-secondary truncate max-w-[160px]">{p.email}</td>
                      <td className="p-3 sm:p-4">{p.plan_status}</td>
                      <td className="p-3 sm:p-4">
                        <span className={`px-2 py-0.5 rounded-pill text-[10px] sm:text-xs font-bold ${p.is_admin ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-secondary'}`}>
                          {p.is_admin ? 'Administrador' : 'Miembro'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <button
                          onClick={() => toggleRole(p)}
                          disabled={updatingId === p.id || p.id === myId}
                          title={p.id === myId ? 'No puedes cambiar tu propio rol' : undefined}
                          className="px-2.5 py-1 rounded-pill text-xs font-bold border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {updatingId === p.id ? 'Guardando…' : p.is_admin ? 'Retroceder' : 'Hacer Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </Card>
        </div>
      )}
    </div>
  );
}
