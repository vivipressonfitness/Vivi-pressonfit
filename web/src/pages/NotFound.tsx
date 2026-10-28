import { Link } from 'react-router-dom';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { HomeIcon, VideoIcon, UserIcon } from '../components/ui/Icons';

export default function NotFound() {
  const { config } = useLandingConfig();
  const wa = (config.whatsapp_number && config.whatsapp_number !== '59178000000')
    ? config.whatsapp_number
    : ((import.meta.env.VITE_WHATSAPP_NUMBER as string) || '5493415888117');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 sm:py-32">
      <div className="max-w-xl w-full text-center space-y-6 bg-raised/80 border border-border rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent px-4 py-1.5 rounded-pill font-mono text-xs font-bold uppercase tracking-wider">
          <span>Error 404</span>
          <span>•</span>
          <span>Página no encontrada</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
          ¿Te perdiste en el entrenamiento?
        </h1>

        <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          La ruta que intentas abrir no existe, ha sido renombrada o el enlace es incorrecto. Retoma tu rutina desde aquí:
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-background px-6 py-3 rounded-pill font-bold text-sm transition shadow-md shadow-accent/20 min-h-[44px]"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <Link
            to="/#adelantos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-background hover:bg-white/5 border border-border text-text-primary px-6 py-3 rounded-pill font-semibold text-sm transition min-h-[44px]"
          >
            <VideoIcon className="w-4 h-4" />
            <span>Ver Clases de Muestra</span>
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-background hover:bg-white/5 border border-border text-text-secondary hover:text-text-primary px-5 py-3 rounded-pill text-sm transition min-h-[44px]"
          >
            <UserIcon className="w-4 h-4" />
            <span>Acceder</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-border/60 text-xs text-text-secondary">
          <p>
            ¿Crees que se trata de un error?{' '}
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent('Hola Vivi, encontré un enlace roto en la plataforma.')}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline font-semibold"
            >
              Avisar a soporte por WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

