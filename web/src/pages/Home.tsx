import { Link } from 'react-router-dom';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { Hero, Marquee } from '../components/landing/Hero';
import { Pilares, Clases, Educativo } from '../components/landing/Sections';
import { Membresia, Faq } from '../components/landing/MembresiaFaq';

// Landing pública — réplica del diseño del archivo EJEMPLO (VIVIPREFIT).
// Textos, precio e imágenes provienen de landing_config (editable desde Admin).
export default function Home() {
  const { config } = useLandingConfig();

  return (
    <div>
      <Hero config={config} />
      <Marquee />
      <Pilares config={config} />
      <Clases />
      <Educativo config={config} />
      <Membresia config={config} />
      <Faq />
      {/* CTA final hacia el registro */}
      <section className="py-16 bg-background text-center border-t border-border">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
          ¿Lista para empezar tu transformación?
        </h2>
        <p className="text-text-secondary mt-2 mb-6">Únete al programa y entrena con propósito desde hoy.</p>
        <Link
          to="/registro"
          className="inline-block bg-accent text-background px-8 py-4 rounded-full font-bold hover:bg-white transition-all shadow-lg shadow-accent/20"
        >
          Crear mi cuenta — $us. {config.monthly_price}/mes
        </Link>
      </section>
    </div>
  );
}

