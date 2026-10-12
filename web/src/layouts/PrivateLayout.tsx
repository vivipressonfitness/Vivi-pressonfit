import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Sidebar } from '../components/layout/Sidebar';

export function PrivateLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-6xl w-full px-3.5 sm:px-6 pt-24 sm:pt-28 lg:pt-36 pb-12 flex-1 flex flex-col lg:flex-row gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0 w-full overflow-hidden">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
