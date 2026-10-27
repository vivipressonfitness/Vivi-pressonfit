import { useLandingConfig } from '../hooks/useLandingConfig';
import { Hero, Marquee } from '../components/landing/Hero';
import { MetodoVideo } from '../components/landing/MetodoVideo';
import { Pilares, AdelantoClases, AdelantoEducativo, PortalCta } from '../components/landing/Sections';
import { SwiperWrapper } from '../components/gallery/SwiperWrapper';
import { AboutMe } from '../components/landing/AboutMe';
import { Faq } from '../components/landing/MembresiaFaq';
// ============================================================
// LANDING TIPO PORTAL (público, sin login)
// Muestra TODO el contenido gratuito como adelanto de lo que la
// visitante encontrará dentro de la membresía. La oferta/suscripción
// vive en su propia página: /membresia (tras login).
// ============================================================
export default function Home() {
  const { config, clases, recursos, quienSoyImages } = useLandingConfig();

  return (
    <div>
      <Hero config={config} />
      <MetodoVideo />
      <Marquee />
      <Pilares config={config} />
      <SwiperWrapper filterMode={config.carousel_filter} />
      <AboutMe config={config} images={quienSoyImages} />
      <AdelantoClases clases={clases} />
      <AdelantoEducativo recursos={recursos} config={config} />
      <PortalCta config={config} />
      <Faq />
    </div>
  );
}
