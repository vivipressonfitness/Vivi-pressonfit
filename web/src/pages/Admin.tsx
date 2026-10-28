import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import { LandingConfigEditor } from '../components/admin/LandingConfigEditor';
import { ContentManager } from '../components/admin/ContentManager';
import { MediaManager } from '../components/admin/MediaManager';
import { MembersManager, type MemberRow } from '../components/admin/MembersManager';
import { VideoIcon, FolderIcon, GearIcon, UsersIcon } from '../components/ui/Icons';

export type AdminTab = 'content' | 'bucket' | 'landing' | 'members';

const VALID_TABS: AdminTab[] = ['content', 'bucket', 'landing', 'members'];

export default function Admin() {
  const profile = useAuthStore((s) => s.profile);
  const isAdmin = useMembershipStore((s) => s.isAdmin);

  // Sincronización bidireccional de pestañas con la URL (F-13)
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as AdminTab | null;
  const activeTab: AdminTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : 'content';

  const [profiles, setProfiles] = useState<MemberRow[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Carga de miembros cuando se selecciona la pestaña 'members' o para el conteo de badges
  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoadingMembers(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, plan_status, is_admin, created_at')
      .order('created_at', { ascending: false });
    setProfiles(data ?? []);
    setLoadingMembers(false);
  }

  const handleSelectTab = (tabId: AdminTab) => {
    setSearchParams({ tab: tabId });
  };

  if (!profile?.is_admin && !isAdmin) {
    return (
      <div className="py-20 text-center space-y-3">
        <h1 className="text-2xl font-bold text-text-primary">Acceso restringido</h1>
        <p className="text-text-secondary text-sm">
          Esta sección está reservada exclusivamente para administradores de la plataforma.
        </p>
      </div>
    );
  }

  const adminsCount = profiles.filter((p) => p.is_admin).length;
  const regularMembersCount = profiles.length ? profiles.length - adminsCount : 0;

  const tabs = [
    { id: 'content' as AdminTab, label: 'Contenido y Clases', icon: VideoIcon },
    { id: 'bucket' as AdminTab, label: 'Biblioteca de Medios', icon: FolderIcon },
    { id: 'landing' as AdminTab, label: 'Editor de Landing & Precios', icon: GearIcon },
    {
      id: 'members' as AdminTab,
      label: `Miembros (${profiles.length ? regularMembersCount : '…'})`,
      icon: UsersIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Panel de Administración
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Gestión integral de contenidos, almacenamiento, identidad comercial y miembros de la comunidad.
          </p>
        </div>
      </div>

      {/* Navegación por pestañas sincronizadas con la URL */}
      <nav
        aria-label="Pestañas del panel de administración"
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0"
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSelectTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-pill text-xs sm:text-sm font-bold transition whitespace-nowrap shrink-0 min-h-[44px] ${
              activeTab === id
                ? 'bg-accent text-background shadow-md shadow-accent/20'
                : 'border border-border text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Pestaña: Contenido y Programas */}
      {activeTab === 'content' && <ContentManager />}

      {/* Pestaña: Biblioteca de Archivos Bucket */}
      {activeTab === 'bucket' && <MediaManager />}

      {/* Pestaña: Editor de Landing Page */}
      {activeTab === 'landing' && (
        <Card className="!p-4 sm:!p-6">
          <LandingConfigEditor />
        </Card>
      )}

      {/* Pestaña: Directorio y Gestión de Miembros */}
      {activeTab === 'members' && (
        <MembersManager
          profiles={profiles}
          loading={loadingMembers}
          onRefresh={loadMembers}
        />
      )}
    </div>
  );
}
