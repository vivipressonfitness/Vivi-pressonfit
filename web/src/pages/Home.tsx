import { useLandingConfig } from '../hooks/useLandingConfig';
import { Hero, Marquee } from '../components/landing/Hero';
import { Pilares, AdelantoClases, AdelantoEducativo, PortalCta } from '../components/landing/Sections';
import { Faq } from '../components/landing/MembresiaFaq';

// ============================================================
// LANDING TIPO PORTAL (público, sin login)
// Muestra TODO el contenido gratuito como adelanto de lo que la
// visitante encontrará dentro de la membresía. La oferta/suscripción
// vive en su propia página: /membresia (tras login).
// ============================================================
export default function Home() {
  const { config, clases, recursos } = useLandingConfig();

  return (
    <div>
      <Hero config={config} />
      <Marquee />
      <Pilares config={config} />
      <AdelantoClases clases={clases} />
      <AdelantoEducativo recursos={recursos} />
      <PortalCta config={config} />
      <Faq />
    </div>
  );
}
