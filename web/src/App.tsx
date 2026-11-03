import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import { router } from './router';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
        <Suspense fallback={<div className="py-20 text-center text-text-secondary">Cargando…</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </ReactLenis>
    </ErrorBoundary>
  );
}
