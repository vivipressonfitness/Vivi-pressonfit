import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Inicio' },
  { to: '/videos', label: 'Videos' },
  { to: '/membresia', label: 'Membresía' },
  { to: '/perfil', label: 'Perfil' },
];

// Sidebar del área privada (colapsa en móvil)
export function Sidebar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:w-56 shrink-0">
      <button
        className="lg:hidden btn-accent w-full !py-2 text-sm mb-3"
        onClick={() => setOpen((o) => !o)}
      >
        Menú {open ? '▲' : '▼'}
      </button>
      <aside className={`${open ? 'block' : 'hidden'} lg:block card-surface !p-3 sticky top-24 space-y-1`}>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`block px-4 py-2 rounded-xl text-sm transition ${
              pathname === l.to ? 'bg-accent/15 text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </aside>
    </div>
  );
}
