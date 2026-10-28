import { Link } from 'react-router-dom';
import { useLandingConfig } from '../../hooks/useLandingConfig';
import { CookieBanner } from '../ui/CookieBanner';
import { formatPrice, formatMonthlyRate } from '../../lib/offer';

// Footer réplica del diseño EJEMPLO: 4 columnas (marca / estructura / contacto).
export function Footer() {
  const { config } = useLandingConfig();
  const wa = (config.whatsapp_number && config.whatsapp_number !== '59178000000')
    ? config.whatsapp_number
    : ((import.meta.env.VITE_WHATSAPP_NUMBER as string) || '5493415888117');
  return (
    <footer id="unete" className="bg-background pt-12 pb-8 border-t border-border">
      <CookieBanner />
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-10">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src={config.logo_url || '/landing/logo-vivipressonfit.jpg'}
                alt="VIVIPRESSONFIT"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.dataset.fallback) return;
                  img.dataset.fallback = '1';
                  img.src = '/landing/logo-vivifit.jpg';
                }}
                style={{ height: `${Math.round((config.logo_height || 44) * 1.2)}px` }}
                className="w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-text-secondary max-w-sm text-sm">
              Programa de Entrenamiento y Estilo de Vida Saludable. Tu espacio integral para entrenar con propósito.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-text-primary text-sm uppercase tracking-wider">Estructura</h4>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li><Link to="/#quien-soy" className="hover:text-accent transition-colors">¿Quién Soy?</Link></li>
              <li><Link to="/#galeria" className="hover:text-accent transition-colors">El Método</Link></li>
              <li><Link to="/#adelantos" className="hover:text-accent transition-colors">Adelantos Gratis</Link></li>
              <li><Link to="/#pilares" className="hover:text-accent transition-colors">Plan de Fuerza 3x</Link></li>
              <li><Link to="/#educativo" className="hover:text-accent transition-colors">Educación Alimentaria</Link></li>
              <li><Link to="/membresia" className="hover:text-accent transition-colors">Membresía {formatPrice(config.monthly_price)}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-text-primary text-sm uppercase tracking-wider">Contacto &amp; Soporte</h4>
            <ul className="space-y-3 text-text-secondary text-sm">
              <li>
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-whatsapp-green transition-colors flex items-center gap-2"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.42 9.42 0 0 1 14.6-11.6 9.38 9.38 0 0 1 2.76 6.67c0 5.2-4.23 9.43-9.43 9.43Zm8.03-17.4A11.3 11.3 0 0 0 12.04.7C5.8.7.72 5.78.72 12.02c0 2.5.82 4.8 2.2 6.67L.62 23.3l4.75-1.25a11.28 11.28 0 0 0 5.4 1.38h.01c6.23 0 11.31-5.08 11.31-11.32 0-3.02-1.18-5.86-3.31-8Z"/></svg>
                  WhatsApp Soporte
                </a>
              </li>
              <li><Link to="/terminos" className="hover:text-accent transition-colors">Términos del Servicio</Link></li>
              <li><Link to="/privacidad" className="hover:text-accent transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/cookies" className="hover:text-accent transition-colors">Política de Cookies</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new Event('reopen-cookie-banner'))}
                  className="hover:text-accent transition-colors text-left"
                >
                  Preferencias de cookies
                </button>
              </li>
              <li><Link to="/aviso-legal" className="hover:text-accent transition-colors">Aviso Legal</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border text-xs text-text-secondary">
          <p>© {new Date().getFullYear()} VIVIPRESSONFIT. Todos los derechos reservados.</p>
          <p className="mt-2 md:mt-0">Suscripción mensual {formatMonthlyRate(config.monthly_price)}</p>
        </div>
      </div>
    </footer>
  );
}
