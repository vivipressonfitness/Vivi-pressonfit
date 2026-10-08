import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useMembershipStore } from '../store/membershipStore';
import { Card } from '../components/ui/Card';
import type { MembershipContent } from '../types';

// Panel admin MÍNIMO: lista perfiles y contenido. La SPA actual tiene un panel
// más completo (edición de landing_config); migrar esos formularios es tarea
// de la siguiente iteración. Solo accesible si profiles.is_admin = true.
export default function Admin() {
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const [profiles, setProfiles] = useState<Array<{ id: string; email: string; full_name: string | null; plan_status: string }>>([]);
  const [content, setContent] = useState<MembershipContent[]>([]);
  const [tab, setTab] = useState<'members' | 'content'>('members');

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('profiles').select('id, email, full_name, plan_status').then(({ data }) => setProfiles(data ?? []));
    supabase.from('membership_content').select('*').order('created_at', { ascending: false }).then(({ data }) => setContent(data ?? []));
  }, [isAdmin]);

  if (!isAdmin) return <p className="text-text-secondary py-10">No tienes permisos de administrador.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Panel Admin</h1>
      <div className="flex gap-2">
        <button onClick={() => setTab('members')} className={`px-4 py-2 rounded-pill text-sm ${tab === 'members' ? 'bg-accent text-white' : 'border border-border text-text-secondary'}`}>
          Miembros ({profiles.length})
        </button>
        <button onClick={() => setTab('content')} className={`px-4 py-2 rounded-pill text-sm ${tab === 'content' ? 'bg-accent text-white' : 'border border-border text-text-secondary'}`}>
          Contenido ({content.length})
        </button>
      </div>

      {tab === 'members' ? (
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
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-sm">
            <thead className="text-left text-text-secondary border-b border-border">
              <tr><th className="p-4">Título</th><th className="p-4">Categoría</th><th className="p-4">Video Bunny</th><th className="p-4">Publicado</th></tr>
            </thead>
            <tbody>
              {content.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="p-4">{c.title}</td>
                  <td className="p-4 text-text-secondary">{c.category}</td>
                  <td className="p-4 font-mono text-xs">{c.bunny_video_id ?? '—'}</td>
                  <td className="p-4">{c.is_published ? '✅' : '⏳'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
