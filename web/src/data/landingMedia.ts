import type { PreviewItem } from '../hooks/useLandingConfig';

// ============================================================
// CONTENIDO PROMOCIONAL PÚBLICO del Landing (sin login)
// Originales: exports de Instagram @viviprefit, copiados a web/public/landing/*
// Servidos como estáticos de Vite (/landing/...) — reemplázalos por los definitivos del coach.
// ============================================================

export const LANDING_IMAGES = {
  // Retrato vertical del coach → imagen principal del Hero
  heroPortrait: '/landing/coach-whatsapp.jpg',
  // Thumbnails cuadradas/verticales de las clases
  thumbGap: '/landing/thumb-gap.jpg',
  thumbFullBody: '/landing/thumb-fullbody.jpg',
  thumbCardio: '/landing/thumb-cardio.jpg',
};

export const LANDING_VIDEOS = {
  demoFuerza: '/landing/demo-fuerza.mp4',   // 480x480 · 19s
  demoCardio: '/landing/demo-cardio.mp4',   // 480x600 · 29s
  demoVertical: '/landing/demo-vertical.mp4', // 360x640 · 60s
  demoClase: '/landing/demo-clase.mp4',     // 720x1280 · 13s
};

// ============================================================
// PORTAL DE ADELANTOS (landing tipo portal, sin login)
// Todo lo que una visitante puede ver gratis ANTES de suscribirse.
// El Admin puede sobreescribir estas listas publicando en landing_config
// las claves jsonb `preview_clases` / `preview_recursos`.
// Cada item reproduce vía Bunny Stream (bunny_video_id → HLS público),
// YouTube/Vimeo (video_url embed) o mp4 local (video_url /landing/...).
// ============================================================

// Adelanto de la Biblioteca de Clases Grabadas (demo corto de cada categoría).
export const LANDING_CLASES: PreviewItem[] = [
  {
    category: 'Firmeza',
    title: 'GAP',
    desc: 'Glúteos, Abdomen y Piernas: firmeza y tonificación muscular.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoFuerza,
    thumbnail_url: LANDING_IMAGES.thumbGap,
    duration: '19s · adelanto',
    locked: false,
  },
  {
    category: 'Global',
    title: 'Full Body',
    desc: 'Trabajo integral de cada grupo muscular.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoCardio,
    thumbnail_url: LANDING_IMAGES.thumbFullBody,
    duration: '29s · adelanto',
    locked: false,
  },
  {
    category: 'Intensidad',
    title: 'Cardio HIIT',
    desc: 'Quema calórica y resistencia cardiovascular.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoVertical,
    thumbnail_url: LANDING_IMAGES.thumbCardio,
    duration: '60s · adelanto',
    locked: false,
  },
  {
    category: 'Híbrido',
    title: 'Fuerza + Aeróbico',
    desc: 'Resistencia muscular y capacidad aeróbica.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoClase,
    thumbnail_url: LANDING_IMAGES.thumbGap,
    duration: '13s · adelanto',
    locked: false,
  },
];

// Muestras gratuitas del área Educativa / Nutrición.
export const LANDING_EDUCATIVO: PreviewItem[] = [
  {
    category: 'Nutrición',
    title: 'Empieza hoy: plato balanceado',
    desc: 'Mini guía para armar tus comidas sin dietas imposibles.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoCardio,
    thumbnail_url: LANDING_IMAGES.thumbCardio,
    duration: 'adelanto',
    locked: false,
  },
  {
    category: 'Rutinas',
    title: 'Calentamiento en casa (sin equipo)',
    desc: 'Vista previa de las rutinas de fuerza 3x por semana.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoFuerza,
    thumbnail_url: LANDING_IMAGES.thumbFullBody,
    duration: 'adelanto',
    locked: false,
  },
  {
    category: 'Membresía',
    title: 'Plan completo de nutrición mensual',
    desc: 'Se libera al suscribirte — dentro del portal privado.',
    bunny_video_id: null,
    video_url: null,
    thumbnail_url: LANDING_IMAGES.thumbGap,
    duration: null,
    locked: true,
  },
  {
    category: 'Membresía',
    title: 'Clases completas GAP / Full Body',
    desc: 'Versiones largas de 30-45 min solo para miembros.',
    bunny_video_id: null,
    video_url: null,
    thumbnail_url: LANDING_IMAGES.thumbCardio,
    duration: null,
    locked: true,
  },
];
