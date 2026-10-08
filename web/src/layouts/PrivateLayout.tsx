import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Sidebar } from '../components/layout/Sidebar';

export function PrivateLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="mx-auto max-w-6xl w-full px-4 py-8 flex-1 flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
