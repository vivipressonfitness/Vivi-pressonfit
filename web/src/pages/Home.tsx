import { useLandingConfig } from '../hooks/useLandingConfig';
import { Hero, Marquee } from '../components/landing/Hero';
import { OfferSnapshot } from '../components/landing/OfferSnapshot';
import { MetodoVideo } from '../components/landing/MetodoVideo';
import { AdelantoClases, AdelantoEducativo } from '../components/landing/Sections';
import { SwiperWrapper } from '../components/gallery/SwiperWrapper';
import { AboutMe } from '../components/landing/AboutMe';
import { Faq } from '../components/landing/MembresiaFaq';

// ============================================================
// LANDING TIPO PORTAL (F-14):
// Jerarquía optimizada a bloques de alto impacto:
// 1. Hero principal + Resumen de oferta (Qué incluye / Cuánto cuesta / Cómo pruebo).
// 2. Experiencia en video: Showreel con control de pausa WCAG + Marquee.
// 3. El Método en Acción: 6 tarjetas temáticas interactivas.
// 4. Quién Soy: Historia, credenciales y fotos de Vivi.
// 5. Muestras gratuitas: Clases y Nutrición con duración y nivel visibles.
// 6. Preguntas frecuentes (FAQ) con CTA contextual de cierre.
// ============================================================
export default function Home() {
  const { config, clases, recursos, quienSoyImages } = useLandingConfig();

  return (
    <div>
      {/* 1. Hero & Resumen de Oferta antes del pliegue */}
      <Hero config={config} />
      <OfferSnapshot monthlyPrice={config.monthly_price} />

      {/* 2. El Método en Movimiento (Video + Marquee) */}
      <MetodoVideo />
      <Marquee />

      {/* 3. El Método en Acción (6 Disciplinas) */}
      <SwiperWrapper filterMode={config.carousel_filter} />

      {/* 4. Quién Soy (Credibilidad y cercanía humana) */}
      <AboutMe config={config} images={quienSoyImages} />

      {/* 5. Muestras Gratuitas de Clases y Nutrición */}
      <AdelantoClases clases={clases} />
      <AdelantoEducativo recursos={recursos} config={config} />

      {/* 6. Preguntas Frecuentes y Cierre Contextual */}
      <Faq />
    </div>
  );
}
