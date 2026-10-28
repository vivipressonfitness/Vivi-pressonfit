import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/authStore';
import { hasActiveAccess } from '../../store/membershipStore';

interface Props {
  children: ReactNode;
  requireMembership?: boolean; // false = solo login (perfil); true = además membresía activa o admin
}

// F-09: Verificación de sesión robusta, esqueleto accesible y preservación íntegra de intención ('from')
export function ProtectedRoute({ children, requireMembership = true }: Props) {
  const { session, profile, initializing, profileLoading } = useAuthStore();
  const location = useLocation();

  // Esqueleto de carga durante la hidratación de sesión y perfil
  if (initializing || (session && profileLoading && !profile)) {
    return (
      <div
        className="min-h-[50vh] flex items-center justify-center p-6"
        role="status"
        aria-live="polite"
        aria-label="Verificando credenciales de acceso"
      >
        <div className="card-surface max-w-sm w-full p-8 text-center space-y-4 animate-pulse border border-border">
          <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center text-accent">
            <svg
              className="w-6 h-6 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded w-1/2 mx-auto" />
            <div className="h-3 bg-white/5 rounded w-3/4 mx-auto" />
          </div>
          <p className="text-xs text-text-secondary">Verificando tu membresía…</p>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname + location.search;

  if (!session) {
    return <Navigate to="/login" state={{ from: currentPath }} replace />;
  }

  // Si existe sesión pero el perfil aún no se encuentra registrado en BD
  if (session && !profile && location.pathname !== '/membresia') {
    return <Navigate to="/membresia" state={{ from: currentPath }} replace />;
  }

  // Si la ruta requiere membresía activa y la usuaria no es admin ni tiene acceso activo
  if (requireMembership && !profile?.is_admin && !hasActiveAccess(profile?.plan_status ?? null)) {
    return <Navigate to="/membresia" state={{ from: currentPath }} replace />;
  }

  return <>{children}</>;
}
