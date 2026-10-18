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

  function saveConsent(allowAnalytics: boolean) {
    try {
      const consentRecord = {
        necessary: true,
        analytics: allowAnalytics,
        timestamp: new Date().toISOString(),
        version: '1.0',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentRecord));
    } catch {
      // Ignorar fallo de storage
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-md z-40 animate-fade-in"
    >
      <div className="bg-surface/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-4 sm:p-5 text-sm space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-xl select-none" role="img" aria-label="galleta">
            🍪
          </span>
          <div className="space-y-1">
            <h4 className="font-semibold text-text-primary text-sm">
              Tu privacidad y cookies
            </h4>
            <p className="text-text-secondary text-xs leading-relaxed">
              Utilizamos cookies técnicas necesarias para autenticar tu cuenta y procesar pagos con Stripe. Puedes consultar los detalles en nuestra{' '}
              <Link
                to="/cookies"
                className="text-accent underline underline-offset-2 hover:text-accent-hover font-medium"
              >
                Política de Cookies
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => saveConsent(false)}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors min-h-[36px]"
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={() => saveConsent(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-background hover:bg-white transition-colors shadow-sm min-h-[36px]"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </aside>
  );
}

