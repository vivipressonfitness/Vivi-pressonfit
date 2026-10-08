import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function App() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-text-secondary">Cargando…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
