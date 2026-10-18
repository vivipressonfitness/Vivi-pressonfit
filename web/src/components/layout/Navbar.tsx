import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLandingConfig } from '../../hooks/useLandingConfig';

const navLinkCls = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm lg:text-base font-medium transition ${isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'}`;

const mobileNavLinkCls = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-3 text-base font-medium rounded-xl transition ${isActive ? 'bg-accent/15 text-accent font-semibold' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`;

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const onHome = typeof window !== 'undefined' && window.location.pathname === '/';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 min-h-[76px] md:min-h-[90px] py-2">
        {/* LOGO */}
        <Link to="/" onClick={closeMenu} className="flex items-center group py-1 flex-shrink-0">
          <img
            src={config.logo_url || '/landing/logo-vivipressonfit.jpg'}
            alt="VIVIPRESSONFIT"
            style={{ maxHeight: `${config.logo_height || 54}px` }}
            className="w-auto h-11 sm:h-12 md:h-14 object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* NAVEGACIÓN DESKTOP (Visible en pantallas grandes lg+) */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          {onHome &&
            landingAnchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className="px-3 py-1.5 text-sm xl:text-base font-medium text-text-secondary hover:text-accent transition whitespace-nowrap"
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
                className="bg-accent hover:bg-white text-background font-bold !px-5 !py-2 ml-2 rounded-full text-sm transition shadow-md shadow-accent/20 whitespace-nowrap"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkCls}>Entrar</NavLink>
              <Link
                to="/membresia"
                className="bg-accent hover:bg-white text-background font-bold !px-5 xl:!px-6 !py-2 ml-2 rounded-full text-sm xl:text-base transition shadow-md shadow-accent/20 whitespace-nowrap"
              >
                Hazte miembro
              </Link>
            </>
          )}
        </div>

        {/* BOTÓN MENÚ HAMBURGUESA (Visible en pantallas pequeñas y medianas < lg) */}
        <div className="flex items-center gap-2 lg:hidden">
          {!user && (
            <Link
              to="/membresia"
              className="bg-accent text-background font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-sm"
            >
              Membresía
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="p-2 rounded-xl text-text-primary hover:bg-white/10 transition focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border px-5 py-6 space-y-2 max-h-[85vh] overflow-y-auto animate-fadeIn">
          {onHome &&
            landingAnchors.map((a) => (
              <a
                key={a.href}
                href={a.href}
                onClick={closeMenu}
                className="block px-4 py-2.5 text-base font-medium text-text-secondary hover:text-accent hover:bg-white/5 rounded-xl transition"
              >
                {a.label}
              </a>
            ))}

          <div className="pt-2 border-t border-border/60 my-2"></div>

          {user && <NavLink to="/dashboard" onClick={closeMenu} className={mobileNavLinkCls}>Dashboard</NavLink>}
          {user && <NavLink to="/videos" onClick={closeMenu} className={mobileNavLinkCls}>Videos del programa</NavLink>}
          {user && <NavLink to="/membresia" onClick={closeMenu} className={mobileNavLinkCls}>Mi Plan</NavLink>}
          {profile?.is_admin && <NavLink to="/admin" onClick={closeMenu} className={mobileNavLinkCls}>Panel Admin</NavLink>}
          {user && <NavLink to="/perfil" onClick={closeMenu} className={mobileNavLinkCls}>Mi Perfil</NavLink>}

          <div className="pt-3 flex flex-col gap-2.5">
            {user ? (
              <button
                onClick={async () => {
                  closeMenu();
                  await signOut();
                  navigate('/');
                }}
                className="w-full text-center bg-white/10 hover:bg-white/20 text-text-primary font-bold py-3 rounded-xl text-base transition"
              >
                Cerrar Sesión
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={closeMenu}
                  className="w-full text-center border border-white/20 text-white font-semibold py-2.5 rounded-xl text-base hover:bg-white/5 transition"
                >
                  Iniciar Sesión
                </NavLink>
                <Link
                  to="/membresia"
                  onClick={closeMenu}
                  className="w-full text-center bg-accent hover:bg-white text-background font-bold py-3 rounded-xl text-base transition shadow-md shadow-accent/25"
                >
                  Hazte Miembro — $us. {config.monthly_price || 40}/mes
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
