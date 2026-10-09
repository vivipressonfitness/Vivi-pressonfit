import type { ClaseItem } from '../hooks/useLandingConfig';

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

// Clases de la sección "Biblioteca de Clases" (#clases).
// Estructura compatible con landing_config.clases_items (editable desde Admin):
// cuando exista esa clave, el Admin puede sobreescribir esta lista y reproducir
// videos reales vía Bunny Stream (bunny_video_id) o YouTube/Vimeo (video_url).
export const LANDING_CLASES: ClaseItem[] = [
  {
    tag: 'Firmeza',
    title: 'GAP',
    desc: 'Glúteos, Abdomen y Piernas: firmeza y tonificación muscular.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoFuerza,
    thumbnail_url: LANDING_IMAGES.thumbGap,
  },
  {
    tag: 'Global',
    title: 'Full Body',
    desc: 'Trabajo integral de cada grupo muscular.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoCardio,
    thumbnail_url: LANDING_IMAGES.thumbFullBody,
  },
  {
    tag: 'Intensidad',
    title: 'Cardio HIIT',
    desc: 'Quema calórica y resistencia cardiovascular.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoVertical,
    thumbnail_url: LANDING_IMAGES.thumbCardio,
  },
  {
    tag: 'Híbrido',
    title: 'Fuerza + Aeróbico',
    desc: 'Resistencia muscular y capacidad aeróbica.',
    bunny_video_id: null,
    video_url: LANDING_VIDEOS.demoClase,
    thumbnail_url: LANDING_IMAGES.thumbGap,
  },
];
