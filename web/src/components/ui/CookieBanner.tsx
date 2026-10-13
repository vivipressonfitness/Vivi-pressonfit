import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'vivipressonfit_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) {
        // Retraso sutil de 800ms para no interferir con la carga inicial
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Si localStorage no está disponible, no mostrar para no molestar
      setVisible(false);
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    } catch {
      // Ignorar fallo de storage
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Aviso de Cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-fade-in"
    >
      <div className="bg-surface/95 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl p-5 text-sm space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-xl select-none" role="img" aria-label="galleta">
            🍪
          </span>
          <div className="space-y-1">
            <h4 className="font-semibold text-text-primary text-sm">
              Tu privacidad es importante
            </h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              Utilizamos cookies técnicas y de seguridad necesarias para mantener tu sesión activa y procesar pagos seguros con Stripe. No usamos cookies de rastreo publicitario.{' '}
              <Link
                to="/cookies"
                className="text-accent underline underline-offset-2 hover:text-accent-hover font-medium"
              >
                Leer política
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleAccept}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shadow-sm min-h-[36px]"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </aside>
  );
}

