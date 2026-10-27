import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ScrollToHash } from '../components/layout/ScrollToHash';

// Layout de páginas públicas. El contenido se renderiza vía <Outlet />
// (React Router) o como children cuando la página lo usa directamente.
export function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ScrollToHash />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none focus-visible:ring-0">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
