import { useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../ui/Card';
import {
  UsersIcon,
  ShieldIcon,
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XCloseIcon,
} from '../ui/Icons';
import { AnalyticsChart } from './AnalyticsChart';

export interface MemberRow {
  id: string;
  email: string;
  full_name: string | null;
  plan_status: string;
  is_admin: boolean;
  created_at: string;
}

interface MembersManagerProps {
  profiles: MemberRow[];
  loading: boolean;
  onRefresh: () => void;
}

export function formatPlanBadge(status: string | null) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Activo
        </span>
      );
    case 'trial':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          Prueba (7 días)
        </span>
      );
    case 'past_due':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Pago pendiente
        </span>
      );
    case 'canceled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-red-500/15 text-red-300 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Cancelado
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-zinc-500/15 text-zinc-300 border border-zinc-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Prueba vencida
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] text-text-secondary border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          Sin plan
        </span>
      );
  }
}

export function MembersManager({ profiles, loading, onRefresh }: MembersManagerProps) {
  const currentProfile = useAuthStore((s) => s.profile);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc'>('newest');

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Estados de modales y seguridad operativa
  const [roleModalTarget, setRoleModalTarget] = useState<MemberRow | null>(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<MemberRow | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Métricas
  const metrics = useMemo(() => {
    const total = profiles.length;
    const admins = profiles.filter((p) => p.is_admin).length;
    const active = profiles.filter((p) => p.plan_status === 'active' || p.plan_status === 'trial').length;
    const pastDueOrExpired = profiles.filter(
      (p) => p.plan_status === 'past_due' || p.plan_status === 'expired' || p.plan_status === 'canceled'
    ).length;
    return { total, admins, active, pastDueOrExpired };
  }, [profiles]);

  // Filtrado y Ordenamiento
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        // Búsqueda por texto
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.full_name?.toLowerCase().includes(q) ?? false;
          const matchEmail = p.email.toLowerCase().includes(q);
          const matchId = p.id.toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchId) return false;
        }

        // Filtro por rol
        if (roleFilter === 'admin' && !p.is_admin) return false;
        if (roleFilter === 'member' && p.is_admin) return false;

        // Filtro por plan
        if (planFilter !== 'all') {
          if (planFilter === 'none' && p.plan_status && p.plan_status !== 'none') return false;
          if (planFilter !== 'none' && p.plan_status !== planFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'name_asc') {
          const nameA = a.full_name || a.email;
          const nameB = b.full_name || b.email;
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'name_desc') {
          const nameA = a.full_name || a.email;
          const nameB = b.full_name || b.email;
          return nameB.localeCompare(nameA);
        }
        return 0;
      });
  }, [profiles, searchQuery, roleFilter, planFilter, sortBy]);

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;
  const paginatedProfiles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProfiles.slice(start, start + pageSize);
  }, [filteredProfiles, page, pageSize]);

  // Ejecución segura de cambio de rol
  const handleConfirmRoleChange = async () => {
    if (!roleModalTarget) return;

    if (roleModalTarget.id === currentProfile?.id && roleModalTarget.is_admin) {
      setFeedbackMsg({
        text: 'Operación bloqueada: Por seguridad no puedes retirar tus propios privilegios de administrador.',
        error: true,
      });
      setRoleModalTarget(null);
      return;
    }

    setRoleActionLoading(true);
    setFeedbackMsg(null);
    const nextRole = !roleModalTarget.is_admin;

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: nextRole, role: nextRole ? 'admin' : 'member' })
      .eq('id', roleModalTarget.id);

    setRoleActionLoading(false);

    if (error) {
      setFeedbackMsg({
        text: `Error al actualizar el rol: ${error.message}`,
        error: true,
      });
    } else {
      setFeedbackMsg({
        text: `✅ Permisos actualizados con éxito para ${roleModalTarget.full_name || roleModalTarget.email}: ahora es ${
          nextRole ? 'Administrador' : 'Miembro'
        }.`,
      });
      onRefresh();
    }
    setRoleModalTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Muestra analítica visual */}
      <AnalyticsChart members={profiles} />

      {/* 2. Tarjetas de métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-raised border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary uppercase font-bold">Cuentas Totales</span>
            <UsersIcon className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-text-primary mt-2">{metrics.total}</p>
        </div>

        <div className="bg-raised border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary uppercase font-bold">Activos / Prueba</span>
            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{metrics.active}</p>
        </div>

        <div className="bg-raised border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary uppercase font-bold">Pendientes / Bajas</span>
            <AlertCircleIcon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">{metrics.pastDueOrExpired}</p>
        </div>

        <div className="bg-raised border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary uppercase font-bold">Administradores</span>
            <ShieldIcon className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-extrabold text-accent mt-2">{metrics.admins}</p>
        </div>
      </div>

      {/* Banner de mensajes y feedback */}
      {feedbackMsg && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-sm font-medium ${
            feedbackMsg.error
              ? 'bg-red-500/15 border-red-500/30 text-red-200'
              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.error ? (
              <AlertCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-text-secondary hover:text-white ml-2 text-xs underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 3. Panel de control con Filtros y Tabla de Miembros */}
      <Card className="!p-4 sm:!p-6 space-y-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-text-primary">
              Directorio de Miembros Registrados
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Visualiza, filtra y audita los roles y estados de membresía de todos los usuarios.
            </p>
          </div>

          {/* Barra de búsqueda */}
          <div className="w-full lg:w-72 relative">
            <SearchIcon className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre, email o ID…"
              aria-label="Buscar miembros"
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Barra de Filtros Combinados */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <FilterIcon className="w-3.5 h-3.5 text-accent" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Filtros:</span>
          </div>

          {/* Rol */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as 'all' | 'admin' | 'member');
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-text-primary focus:border-accent outline-none"
          >
            <option value="all">Rol: Todos</option>
            <option value="admin">Solo Administradores</option>
            <option value="member">Solo Miembros</option>
          </select>

          {/* Estado del plan */}
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-text-primary focus:border-accent outline-none"
          >
            <option value="all">Plan: Todos los estados</option>
            <option value="active">Activos</option>
            <option value="trial">En Prueba (Trial)</option>
            <option value="past_due">Pago Pendiente</option>
            <option value="canceled">Cancelados</option>
            <option value="expired">Prueba Vencida</option>
            <option value="none">Sin Plan</option>
          </select>

          {/* Orden */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as 'newest' | 'oldest' | 'name_asc' | 'name_desc');
              setPage(1);
            }}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-text-primary focus:border-accent outline-none ml-auto"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="name_asc">Nombre (A → Z)</option>
            <option value="name_desc">Nombre (Z → A)</option>
          </select>

          {/* Limpiar filtros */}
          {(searchQuery || roleFilter !== 'all' || planFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setPlanFilter('all');
                setSortBy('newest');
                setPage(1);
              }}
              className="text-xs text-accent hover:underline py-1 px-2"
            >
              Restablecer filtros
            </button>
          )}
        </div>

        {/* Contenido de la Tabla */}
        {loading ? (
          <div className="py-12 text-center text-text-secondary text-sm space-y-2">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Cargando información de miembros…</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm space-y-2 bg-background/50 rounded-xl border border-dashed border-border">
            <UsersIcon className="w-8 h-8 mx-auto text-text-secondary opacity-50" />
            <p className="font-semibold text-text-primary">No se encontraron miembros</p>
            <p className="text-xs">
              {searchQuery || roleFilter !== 'all' || planFilter !== 'all'
                ? 'Intenta ajustar los criterios de búsqueda o filtros aplicados.'
                : 'Aún no hay cuentas registradas en la plataforma.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase text-text-secondary border-b border-border bg-surface/50 font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-3">Miembro</th>
                  <th className="py-3 px-3">Estado del Plan</th>
                  <th className="py-3 px-3">Rol</th>
                  <th className="py-3 px-3">Fecha de Registro</th>
                  <th className="py-3 px-3 text-right">Gestión de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedProfiles.map((m) => {
                  const isSelf = m.id === currentProfile?.id;
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => setSelectedMemberDetail(m)}
                          className="text-left group cursor-pointer"
                        >
                          <p className="font-semibold text-text-primary group-hover:text-accent transition flex items-center gap-1.5">
                            <span>{m.full_name || 'Sin nombre'}</span>
                            {isSelf && (
                              <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-mono font-bold">
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-text-secondary font-mono">{m.email}</p>
                        </button>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {formatPlanBadge(m.plan_status)}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        {m.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-pill text-[11px] font-bold bg-accent/20 text-accent border border-accent/40">
                            <ShieldIcon className="w-3 h-3" />
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
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedMemberDetail(m)}
                            className="text-xs border border-border hover:border-accent text-text-secondary hover:text-text-primary px-2.5 py-1 rounded-pill transition"
                          >
                            Detalle
                          </button>

                          <button
                            type="button"
                            disabled={isSelf && m.is_admin}
                            onClick={() => setRoleModalTarget(m)}
                            title={
                              isSelf && m.is_admin
                                ? 'No puedes revocar tus propios privilegios de administrador'
                                : undefined
                            }
                            className={`text-xs px-3 py-1 rounded-pill font-semibold transition ${
                              m.is_admin
                                ? 'border border-red-500/40 text-red-400 hover:bg-red-500/10'
                                : 'border border-border text-text-secondary hover:text-white hover:border-accent'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            {m.is_admin ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Barra de Paginación */}
        {!loading && filteredProfiles.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <span>
                Mostrando {(page - 1) * pageSize + 1} -{' '}
                {Math.min(page * pageSize, filteredProfiles.length)} de {filteredProfiles.length} miembros
              </span>
              <span className="text-border">|</span>
              <label className="flex items-center gap-1">
                <span>Por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="bg-background border border-border rounded px-2 py-0.5 text-text-primary focus:border-accent outline-none"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-border bg-background text-text-primary hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition"
                aria-label="Página anterior"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono font-semibold text-text-primary">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-border bg-background text-text-primary hover:border-accent disabled:opacity-30 disabled:pointer-events-none transition"
                aria-label="Página siguiente"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* 5. MODAL DE CONFIRMACIÓN DE CAMBIO DE ROL (Seguridad Operativa F-13) */}
      {roleModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-raised border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  roleModalTarget.is_admin ? 'bg-red-500/20 text-red-400' : 'bg-accent/20 text-accent'
                }`}
              >
                <ShieldIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-text-primary">
                  {roleModalTarget.is_admin
                    ? '¿Quitar permisos de Administrador?'
                    : '¿Conceder permisos de Administrador?'}
                </h3>
                <p className="text-xs text-text-secondary">Auditoría y control de seguridad de roles</p>
              </div>
            </div>

            <div className="bg-background border border-border rounded-xl p-3.5 space-y-1.5 text-xs">
              <p>
                <span className="text-text-secondary">Usuario:</span>{' '}
                <span className="font-bold text-text-primary">
                  {roleModalTarget.full_name || 'Sin nombre'}
                </span>
              </p>
              <p>
                <span className="text-text-secondary">Email:</span>{' '}
                <span className="font-mono text-text-primary">{roleModalTarget.email}</span>
              </p>
              <p>
                <span className="text-text-secondary">Rol actual:</span>{' '}
                <span className="font-bold">{roleModalTarget.is_admin ? 'Administrador' : 'Miembro regular'}</span>
              </p>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              {roleModalTarget.is_admin
                ? 'Al quitar los privilegios de administrador, esta cuenta perderá acceso inmediato a las pestañas de Contenido, Biblioteca de Medios, Editor de Landing y Directorio de Miembros.'
                : 'Al convertir a este usuario en Administrador, tendrá acceso completo para modificar el contenido, subir archivos a los buckets y gestionar roles de la plataforma.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                disabled={roleActionLoading}
                onClick={() => setRoleModalTarget(null)}
                className="px-4 py-2 rounded-pill text-xs border border-border text-text-secondary hover:text-text-primary transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={roleActionLoading}
                onClick={handleConfirmRoleChange}
                className={`px-5 py-2 rounded-pill text-xs font-bold transition shadow-sm ${
                  roleModalTarget.is_admin
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-accent hover:bg-white text-background'
                }`}
              >
                {roleActionLoading
                  ? 'Aplicando…'
                  : roleModalTarget.is_admin
                  ? 'Sí, Quitar Privilegios'
                  : 'Sí, Hacer Administrador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL FICHA DE DETALLE DE MIEMBRO */}
      {selectedMemberDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-raised border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <UsersIcon className="w-5 h-5 text-accent" />
                <h3 className="font-heading font-bold text-lg text-text-primary">Ficha de Miembro</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberDetail(null)}
                className="text-text-secondary hover:text-white p-1 rounded-lg transition"
              >
                <XCloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-background border border-border rounded-xl p-3.5 space-y-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    Nombre Completo
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {selectedMemberDetail.full_name || 'No registrado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    Correo Electrónico
                  </span>
                  <span className="font-mono text-text-primary">{selectedMemberDetail.email}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    ID Único de Usuario (Supabase Auth)
                  </span>
                  <span className="font-mono text-[11px] text-text-secondary break-all">
                    {selectedMemberDetail.id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background border border-border rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">
                    Estado de Plan
                  </span>
                  <div>{formatPlanBadge(selectedMemberDetail.plan_status)}</div>
                </div>

                <div className="bg-background border border-border rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-secondary block">Rol</span>
                  <span className="font-bold text-text-primary">
                    {selectedMemberDetail.is_admin ? 'Administrador' : 'Miembro Regular'}
                  </span>
                </div>
              </div>

              <div className="bg-background border border-border rounded-xl p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-secondary block">
                  Fecha de Alta / Creación de Cuenta
                </span>
                <span className="text-text-primary font-mono">
                  {new Date(selectedMemberDetail.created_at).toLocaleString('es-AR', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSelectedMemberDetail(null)}
                className="bg-background hover:bg-white/5 border border-border text-text-primary text-xs font-semibold px-5 py-2 rounded-pill transition"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

