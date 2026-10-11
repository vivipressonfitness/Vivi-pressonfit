import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { to: '/videos', label: 'Videos' },
    { to: '/membership', label: 'Membresía' },
  ];

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2" aria-label="Inicio - Bailando en Casa">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold">B</span>
            <span className="text-lg sm:text-xl font-extrabold text-gray-900">
              Bailando <span className="text-pink-600">en Casa</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                {link.label}
              </Link>
            ))}
            {!user ? (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">Iniciar sesión</Link>
                <button
                  onClick={() => navigate('/signup')}
                  className="rounded-full bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 transition-colors"
                >
                  Empieza gratis
                </button>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cerrar sesión
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700"
              >
                {link.label}
              </Link>
            ))}
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-700"
                >
                  Iniciar sesión
                </Link>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}
                  className="mt-2 w-full rounded-full bg-pink-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-pink-700"
                >
                  Empieza gratis
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                className="mt-2 w-full rounded-full border border-gray-300 px-5 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
