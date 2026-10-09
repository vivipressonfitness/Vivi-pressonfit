import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm transition ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`;

// Anclas del portal público (scroll suave a secciones) — visibles solo en "/"
const landingAnchors = [
  { href: '/#pilares', label: 'El Programa' },
  { href: '/#adelantos', label: 'Gratis' },
  { href: '/#educativo', label: 'Nutrición' },
  { href: '/#faq', label: 'FAQ' },
];

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const onHome = typeof window !== 'undefined' && window.location.pathname === '/';

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="container mx-auto flex items-center justify-between px-6 h-20">
        <Link to="/" className="font-heading font-extrabold tracking-tight text-2xl">
          VIVI<span className="text-accent">PREFIT</span>
        </Link>
        <div className="flex items-center gap-1">
          {onHome &&
            landingAnchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="px-3 py-2 text-sm text-text-secondary hover:text-accent transition"
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
                className="bg-accent hover:bg-white text-background font-bold !px-4 !py-2 ml-2 rounded-pill text-sm transition"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkCls}>Entrar</NavLink>
              <Link
                to="/membresia"
                className="bg-accent hover:bg-white text-background font-bold !px-4 !py-2 ml-2 rounded-pill text-sm transition"
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
