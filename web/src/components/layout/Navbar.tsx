import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm transition ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`;

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        <Link to="/" className="font-extrabold tracking-tight text-xl">
          VIVI<span className="text-accent">PREFIT</span>
        </Link>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkCls}>Inicio</NavLink>
          {user && <NavLink to="/dashboard" className={navLinkCls}>Dashboard</NavLink>}
          {user && <NavLink to="/videos" className={navLinkCls}>Videos</NavLink>}
          {user && <NavLink to="/membresia" className={navLinkCls}>Membresía</NavLink>}
          {profile?.is_admin && <NavLink to="/admin" className={navLinkCls}>Admin</NavLink>}
          {user ? (
            <>
              <NavLink to="/perfil" className={navLinkCls}>Perfil</NavLink>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="btn-accent !px-4 !py-2 text-sm ml-2"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkCls}>Entrar</NavLink>
              <Link to="/registro" className="btn-accent !px-4 !py-2 text-sm ml-2">Únete ya</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
