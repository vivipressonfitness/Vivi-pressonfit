import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

// Layout de páginas públicas. El contenido se renderiza vía <Outlet />
// (React Router) o como children cuando la página lo usa directamente.
export function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
