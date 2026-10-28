import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMembershipStore } from '../../store/membershipStore';
import {
  HomeIcon,
  VideoIcon,
  MembershipIcon,
  UserIcon,
  GearIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../ui/Icons';

interface NavLinkItem {
  to: string;
  label: string;
  icon: typeof HomeIcon;
}

const baseLinks: NavLinkItem[] = [
  { to: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { to: '/videos', label: 'Videos', icon: VideoIcon },
  { to: '/membresia', label: 'Mi Plan', icon: MembershipIcon },
  { to: '/perfil', label: 'Perfil', icon: UserIcon },
];

// Sidebar del área privada (colapsa en móvil).
// F-10: Iconos SVG de trazo consistentes y accesibles sin emojis funcionales.
export function Sidebar() {
  const { pathname } = useLocation();
  const isAdmin = useMembershipStore((s) => s.isAdmin);
  const [open, setOpen] = useState(false);

  const allLinks: NavLinkItem[] = isAdmin
    ? [...baseLinks, { to: '/admin', label: 'Panel Admin', icon: GearIcon }]
    : baseLinks;

  return (
    <div className="lg:w-56 shrink-0">
      <button
        className="lg:hidden btn-accent w-full !py-2.5 text-sm mb-3 min-h-[44px] flex items-center justify-center gap-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="private-nav"
      >
        <span>Menú de navegación</span>
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      <aside
        id="private-nav"
        aria-label="Navegación del área de miembros"
        className={`${open ? 'block' : 'hidden'} lg:block card-surface !p-3 lg:sticky lg:top-24 space-y-1`}
      >
        {allLinks.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition ${
                isActive
                  ? 'bg-accent/15 text-accent font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </aside>
    </div>
  );
}
