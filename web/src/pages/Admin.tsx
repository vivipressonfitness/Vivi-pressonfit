import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import { LandingConfigEditor } from '../components/admin/LandingConfigEditor';
import { ContentManager } from '../components/admin/ContentManager';
import { AnalyticsChart } from '../components/admin/AnalyticsChart';
import { MediaManager } from '../components/admin/MediaManager';

// Panel admin: 4 pestañas de gestión.
// - Contenido: CRUD de membership_content (público y privado)
// - Biblioteca: gestor de archivos multimedia del bucket members-media
// - Landing: editor de configuración (precio, WhatsApp, textos, imágenes)
// - Miembros: lista filtrable con confirmación y auditoría de roles
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
      return <span className="text-accent font-semibold">En Prueba</span>;
    case 'past_due':
      return <span className="text-amber-400 font-semibold">Pago Pendiente</span>;
    case 'canceled':
      return <span className="text-neutral-400">Cancelado</span>;
    case 'expired':
      return <span className="text-red-400">Vencido</span>;
    default:
      return <span className="text-text-secondary">{status || 'Inactivo'}</span>;
  }
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // Cambiar rol con confirmación obligatoria para evitar degradaciones accidentales (F-13)
  async function toggleRole(m: MemberRow) {
    if (m.id === myId) {
      setRoleError('No puedes modificar tu propio rol de administrador.');
      return;
    }
    const actionLabel = m.is_admin ? 'retirar los permisos de Administrador a' : 'nombrar como Administrador a';
    const confirmMessage = `¿Estás segura de que deseas ${actionLabel} ${m.full_name || m.email}?`;
    if (!window.confirm(confirmMessage)) return;

    setRoleError(null);
    setUpdatingId(m.id);
    const nextAdmin = !m.is_admin;
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: nextAdmin, plan_status: nextAdmin ? 'active' : m.plan_status })
      .eq('id', m.id);

    if (error) {
      setRoleError(`No se pudo actualizar el rol: ${error.message}`);
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === m.id ? { ...p, is_admin: nextAdmin, plan_status: nextAdmin ? 'active' : p.plan_status } : p))
      );
    }
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
  const filteredProfiles = profiles.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.full_name?.toLowerCase().includes(q) ?? false) ||
      p.email.toLowerCase().includes(q) ||
      p.plan_status.toLowerCase().includes(q)
    );
  });

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'content', label: 'Contenido del mes (Público / Privado)' },
    { id: 'bucket', label: 'Biblioteca de Archivos' },
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
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-pill text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 ${
              tab === t.id ? 'bg-accent text-background' : 'border border-border text-text-secondary hover:text-white'
            }`}
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

          <Card className="!p-4 sm:!p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Listado de Miembros y Permisos</h2>
                <p className="text-xs text-text-secondary">Gestiona los roles de acceso y consulta el estado de suscripción.</p>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o correo…"
                className="bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent w-full sm:w-64"
              />
            </div>

            {roleError && <p role="alert" className="text-red-400 text-xs">{roleError}</p>}

            {loadingMembers ? (
              <p role="status" className="py-6 text-center text-text-secondary text-sm">Cargando miembros…</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="py-6 text-center text-text-secondary text-sm">No se encontraron miembros con ese criterio.</p>
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
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                        <td className="p-3 sm:p-4 font-medium">{p.full_name ?? '—'}</td>
                        <td className="p-3 sm:p-4 text-text-secondary truncate max-w-[160px]">{p.email}</td>
                        <td className="p-3 sm:p-4">{formatPlanStatus(p.plan_status)}</td>
                        <td className="p-3 sm:p-4">
                          <span
                            className={`px-2 py-0.5 rounded-pill text-[10px] sm:text-xs font-bold ${
                              p.is_admin ? 'bg-accent/20 text-accent' : 'bg-white/10 text-text-secondary'
                            }`}
                          >
                            {p.is_admin ? 'Administrador' : 'Miembro'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            type="button"
                            onClick={() => toggleRole(p)}
                            disabled={updatingId === p.id || p.id === myId}
                            title={p.id === myId ? 'No puedes modificar tu propio rol' : undefined}
                            className="px-3 py-1.5 rounded-pill text-xs font-bold border border-border hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-accent"
                          >
                            {updatingId === p.id ? 'Guardando…' : p.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
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
