import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLandingConfig } from '../../hooks/useLandingConfig';

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 text-[20px] font-medium transition ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`;

// Anclas del portal público (scroll suave a secciones) — visibles solo en "/"
const landingAnchors = [
  { href: '/#pilares', label: 'Programas' },
  { href: '/#galeria', label: 'Métodos' },
  { href: '/#quien-soy', label: '¿Quién Soy?' },
  { href: '/#adelantos', label: 'Gratis' },
  { href: '/#educativo', label: 'Nutrición' },
  { href: '/#faq', label: 'FAQ' },
];

export function Navbar() {
  const { config } = useLandingConfig();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const onHome = typeof window !== 'undefined' && window.location.pathname === '/';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-md border-b border-border shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-6 md:px-8 min-h-[96px] md:min-h-[110px] py-3">
        <Link to="/" className="flex items-center group py-1">
          <img
            src={config.logo_url || '/landing/logo-vivifit.jpg'}
            alt="VIVIFIT"
            style={{ height: `${config.logo_height || 64}px` }}
            className="w-auto object-contain transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="flex items-center gap-2">
          {onHome &&
            landingAnchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="px-4 py-2 text-[20px] font-medium text-text-secondary hover:text-accent transition"
              >
                {a.label}
              </a>
            ))}
          {user && <NavLink to="/dashboard" className={navLinkCls}>Dashboard</NavLink>}
          {user && <NavLink to="/videos" className={navLinkCls}>Videos</NavLink>}
          {user && <NavLink to="/membresia" className={navLinkCls}>Mi Plan</NavLink>}
          {profile?.is_admin && <NavLink to="/admin" className={navLinkCls}>Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/perfil" className={navLinkCls}>Perfil</NavLink>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="bg-accent hover:bg-white text-background font-bold !px-5 !py-2.5 ml-3 rounded-pill text-sm md:text-base transition shadow-md shadow-accent/20"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkCls}>Entrar</NavLink>
              <Link
                to="/membresia"
                className="bg-accent hover:bg-white text-background font-bold !px-6 !py-2.5 ml-3 rounded-pill text-sm md:text-base transition shadow-md shadow-accent/20"
              >
                Hazte miembro
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
