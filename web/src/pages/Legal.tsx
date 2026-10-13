import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { LEGAL_SECTIONS, type LegalSection } from '../data/legalContent';

interface LegalProps {
  defaultSection?: 'terminos' | 'privacidad' | 'cookies' | 'aviso-legal';
}

export default function Legal({ defaultSection }: LegalProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Determinar la sección activa según la ruta actual o el prop
  const currentPath = location.pathname.replace(/^\//, '');
  const activeKey =
    currentPath in LEGAL_SECTIONS
      ? currentPath
      : defaultSection || 'terminos';

  const section: LegalSection = LEGAL_SECTIONS[activeKey] || LEGAL_SECTIONS.terminos;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeKey]);

  const tabs: { id: string; label: string; path: string }[] = [
    { id: 'terminos', label: 'Términos y Condiciones', path: '/terminos' },
    { id: 'privacidad', label: 'Política de Privacidad', path: '/privacidad' },
    { id: 'cookies', label: 'Política de Cookies', path: '/cookies' },
    { id: 'aviso-legal', label: 'Aviso Legal', path: '/aviso-legal' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabecera */}
        <div className="text-center space-y-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
          >
            ← Volver al Inicio
          </Link>
          <span className="block text-xs uppercase tracking-widest text-accent font-semibold">
            Información Legal &amp; Transparencia
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
            {section.title}
          </h1>
          <p className="text-xs text-text-secondary">
            Última actualización: {section.lastUpdated}
          </p>
        </div>

        {/* Pestañas de navegación entre documentos legales */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-border pb-4">
          {tabs.map((tab) => {
            const isActive = tab.id === activeKey;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all min-h-[40px] ${
                  isActive
                    ? 'bg-accent text-white shadow-md'
                    : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface/80 border border-border'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenido del documento */}
        <div className="card-surface p-6 sm:p-10 space-y-8 text-text-secondary leading-relaxed border border-border">
          {section.content.map((block, idx) => (
            <section key={idx} className="space-y-3">
              {block.heading && (
                <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2 border-b border-border/40 pb-2">
                  {block.heading}
                </h2>
              )}
              {block.text && (
                <p className="text-sm sm:text-base leading-relaxed">
                  {block.text}
                </p>
              )}
              {block.list && (
                <ul className="space-y-2 list-disc list-inside pl-2 text-sm sm:text-base">
                  {block.list.map((item, itemIdx) => (
                    <li key={itemIdx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Pie con contacto de soporte legal */}
        <div className="text-center pt-4 text-xs text-text-secondary">
          <p>
            ¿Tienes alguna duda sobre nuestras políticas o el servicio?{' '}
            <Link to="/#unete" className="text-accent underline hover:text-accent-hover font-semibold">
              Contáctanos por WhatsApp
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

