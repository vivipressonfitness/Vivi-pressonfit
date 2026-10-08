import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { hasActiveAccess } from '../../store/membershipStore';

interface Props {
  children: ReactNode;
  requireMembership?: boolean; // false = solo login (perfil); true = además membresía activa o admin
}

// Solo UX: la protección REAL es RLS + Edge Functions con verificación de sesión.
export function ProtectedRoute({ children, requireMembership = true }: Props) {
  const { session, profile, initializing } = useAuthStore();
  const location = useLocation();

  if (initializing) {
    return <div className="py-20 text-center text-text-secondary">Cargando…</div>;
  }
  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (session && !profile && location.pathname !== '/membresia') {
    return <Navigate to="/membresia" state={{ from: location.pathname }} replace />;
  }
  if (requireMembership && !profile?.is_admin && !hasActiveAccess(profile?.plan_status ?? null)) {
    return <Navigate to="/membresia" replace />;
  }
  return <>{children}</>;
}
