import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from '../ui/Icons';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  videos: 'Biblioteca de Clases',
  membresia: 'Mi Membresía',
  perfil: 'Mi Perfil',
  admin: 'Panel de Administración',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav aria-label="Migas de pan" className="mb-4 flex items-center text-xs text-text-secondary">
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to="/"
            className="hover:text-accent transition flex items-center gap-1 focus:outline-none focus:underline"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            <span>Inicio</span>
          </Link>
        </li>

        {pathSegments.map((segment, idx) => {
          const isLast = idx === pathSegments.length - 1;
          const url = `/${pathSegments.slice(0, idx + 1).join('/')}`;
          const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={url} className="flex items-center gap-1.5">
              <ChevronRightIcon className="w-3 h-3 text-border" />
              {isLast ? (
                <span className="font-semibold text-text-primary" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link to={url} className="hover:text-accent transition focus:outline-none focus:underline">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

