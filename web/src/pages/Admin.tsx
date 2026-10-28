import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import { LandingConfigEditor } from '../components/admin/LandingConfigEditor';
import { ContentManager } from '../components/admin/ContentManager';
import { AnalyticsChart } from '../components/admin/AnalyticsChart';
import { MediaManager } from '../components/admin/MediaManager';
import { VideoIcon, FolderIcon, GearIcon, UsersIcon } from '../components/ui/Icons';

// Panel admin: 4 pestañas de gestión con sistema de diseño unificado (F-10).
type Tab = 'content' | 'bucket' | 'landing' | 'members';

interface MemberRow {
  id: string;
  email: string;
  full_name: string | null;
  plan_status: string;
  is_admin: boolean;
  created_at: string;
}

function formatPlanStatus(status: string | null) {
  switch (status) {
    case 'active':
      return <span className="text-emerald-400 font-semibold">Activo</span>;
    case 'trial':
      return <span className="text-sky-400 font-semibold">Prueba</span>;
    case 'past_due':
      return <span className="text-amber-400 font-semibold">Pago pendiente</span>;
    case 'canceled':
      return <span className="text-red-400 font-semibold">Cancelado</span>;
    case 'expired':
      return <span className="text-red-400 font-semibold">Prueba vencida</span>;
    default:
      return <span className="text-neutral-400">Sin plan</span>;
  }
}

export default function Admin() {
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const [tab, setTab] = useState<Tab>('content');
  const [profiles, setProfiles] = useState<MemberRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'members') loadMembers();
  }, [tab]);

  async function loadMembers() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan_status, is_admin, created_at')
      .order('created_at', { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  }

  async function toggleRole(m: MemberRow) {
    const action = m.is_admin ? 'quitar privilegios de Administrador a' : 'hacer Administrador a';
    const confirmed = window.confirm(
      `¿Confirmas que deseas ${action} ${m.full_name || m.email}?\n\nEsta acción modificará sus permisos de acceso.`
    );
    if (!confirmed) return;

    setToggleLoading(m.id);
    const nextRole = !m.is_admin;
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: nextRole, role: nextRole ? 'admin' : 'member' })
      .eq('id', m.id);

    if (error) {
      alert(`Error al actualizar el rol: ${error.message}`);
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === m.id ? { ...p, is_admin: nextRole } : p))
      );
    }
    setToggleLoading(null);
  }

  if (!profile?.is_admin && !isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Acceso restringido</h1>
        <p className="text-text-secondary mt-2">Esta sección es solo para administradores.</p>
      </div>
    );
  }

  const adminsCount = profiles.filter((p) => p.is_admin).length;
  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      p.email.toLowerCase().includes(q) ||
      p.plan_status.toLowerCase().includes(q)
    );
  });

  const tabs = [
    { id: 'content' as Tab, label: 'Contenido', icon: VideoIcon },
    { id: 'bucket' as Tab, label: 'Biblioteca', icon: FolderIcon },
    { id: 'landing' as Tab, label: 'Landing & Precios', icon: GearIcon },
    { id: 'members' as Tab, label: `Miembros (${profiles.length ? profiles.length - adminsCount : '…'})`, icon: UsersIcon },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-white">Panel Admin</h1>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-pill text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 min-h-[44px] ${
              tab === id
                ? 'bg-accent text-background shadow-md shadow-accent/20'
                : 'border border-border text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
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

          <Card className="!p-4 sm:!p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-lg text-white">Miembros registrados</h2>
                <p className="text-xs text-text-secondary">
                  {profiles.length} cuentas en total · {adminsCount} administradores
                </p>
              </div>

              {/* Buscador de miembros en tiempo real */}
              <div className="w-full sm:w-64">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email…"
                  aria-label="Buscar miembros"
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {loading ? (
              <p role="status" className="text-text-secondary text-sm py-4">Cargando miembros…</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-text-secondary text-sm py-4">
                {searchQuery ? 'No se encontraron miembros con ese criterio.' : 'No hay miembros registrados.'}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-text-secondary border-b border-border bg-surface/50">
                    <tr>
                      <th className="py-3 px-3">Miembro</th>
                      <th className="py-3 px-3">Plan</th>
                      <th className="py-3 px-3">Rol</th>
                      <th className="py-3 px-3">Registro</th>
                      <th className="py-3 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProfiles.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-text-primary">{m.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-text-secondary">{m.email}</p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {formatPlanStatus(m.plan_status)}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {m.is_admin ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-accent/20 text-accent border border-accent/40">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-pill text-[11px] text-text-secondary border border-border">
                              Miembro
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-xs text-text-secondary">
                          {new Date(m.created_at).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={toggleLoading === m.id}
                            onClick={() => toggleRole(m)}
                            className={`text-xs px-3 py-1.5 rounded-pill font-semibold transition ${
                              m.is_admin
                                ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                                : 'border border-border text-text-secondary hover:text-white hover:border-accent'
                            } disabled:opacity-50`}
                          >
                            {toggleLoading === m.id
                              ? 'Guardando…'
                              : m.is_admin
                              ? 'Quitar Admin'
                              : 'Hacer Admin'}
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
