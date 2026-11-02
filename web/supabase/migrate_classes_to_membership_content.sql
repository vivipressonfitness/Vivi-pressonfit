-- ============================================================================
-- MIGRACIÓN: Clases y Menús a la tabla unificada membership_content (Opción A)
-- Ejecutar en Supabase Studio > SQL Editor de tu proyecto nuevo (dikqtpexjdjbkvhyijyb)
-- Idempotente (se puede ejecutar varias veces sin duplicar registros)
-- ============================================================================

-- 1. Asegurar que membership_content tenga todas las columnas modernas
ALTER TABLE public.membership_content 
  ADD COLUMN IF NOT EXISTS show_in_landing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preview_video_url text,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS preview_duration text DEFAULT 'Adelanto gratis',
  ADD COLUMN IF NOT EXISTS pdf_url text,
  ADD COLUMN IF NOT EXISTS private_video_url text;

-- 2. Asegurar política de lectura pública para las muestras de la landing
DROP POLICY IF EXISTS "mc_select_public_landing" ON public.membership_content;
CREATE POLICY "mc_select_public_landing" ON public.membership_content
  FOR SELECT TO anon, authenticated
  USING (show_in_landing = true);

-- 3. Insertar las clases y muestras (provenientes de classes_rows.sql)
INSERT INTO public.membership_content (
  id,
  cycle_date,
  category,
  class_type,
  title,
  description,
  content_url,
  preview_video_url,
  thumbnail_url,
  preview_duration,
  target_mode,
  month_year,
  is_published,
  show_in_landing
) VALUES 
-- Muestras gratuitas para el Landing
(
  '10000000-0000-4000-8000-000000000001',
  '2026-10-01',
  'Clase',
  'GAP',
  'Muestra de GAP',
  'Video breve de demostración para el landing.',
  '/landing/demo-clase.mp4',
  '/landing/demo-clase.mp4',
  '/landing/thumb-gap.jpg',
  '60s · adelanto',
  'Ambos',
  'Octubre 2026',
  true,
  true
),
(
  '10000000-0000-4000-8000-000000000002',
  '2026-10-01',
  'Clase',
  'Cardio HIIT',
  'Muestra de Cardio HIIT',
  'Video breve de demostración para el landing.',
  '/landing/demo-cardio.mp4',
  '/landing/demo-cardio.mp4',
  '/landing/thumb-cardio.jpg',
  '60s · adelanto',
  'Ambos',
  'Octubre 2026',
  true,
  true
),
-- Clases completas para el área de miembros
(
  '10000000-0000-4000-8000-000000000003',
  '2026-10-01',
  'Clase',
  'Full Body',
  'Clase Full Body de ejemplo',
  'Contenido para miembros activos.',
  NULL,
  NULL,
  '/landing/thumb-fullbody.jpg',
  '35 min',
  'Ambos',
  'Octubre 2026',
  true,
  false
),
(
  '16da1006-8869-442b-b097-3f4dc1b58a7c',
  '2026-09-01',
  'Clase',
  'gap',
  'GAP: Glúteos y Piernas',
  'Enfoque total en tren inferior.',
  NULL,
  NULL,
  '/landing/thumb-gap.jpg',
  '35 min',
  'Ambos',
  'Septiembre 2026',
  true,
  false
),
(
  '368aa18d-de66-4c9c-90b6-e45ee147f3a0',
  '2026-09-01',
  'Clase',
  'strength_cardio',
  'Fuerza + Potencia',
  'Combinación estratégica para ganar fuerza sin perder agilidad.',
  NULL,
  NULL,
  '/landing/thumb-cardio.jpg',
  '40 min',
  'Ambos',
  'Septiembre 2026',
  true,
  false
),
(
  '8d8f467e-9073-40bf-8571-499f999eead0',
  '2026-09-01',
  'Clase',
  'hiit',
  'Cardio HIIT: Quema Total',
  'Intervalos de alta intensidad para maximizar calorías.',
  NULL,
  NULL,
  '/landing/thumb-cardio.jpg',
  '30 min',
  'Ambos',
  'Septiembre 2026',
  true,
  false
),
(
  'e715953f-3ae4-4c5d-b143-de785d8491c6',
  '2026-09-01',
  'Clase',
  'full_body',
  'Full Body: Activación Global',
  'Clase completa para despertar todos los músculos.',
  NULL,
  NULL,
  '/landing/thumb-fullbody.jpg',
  '45 min',
  'Ambos',
  'Septiembre 2026',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_url = EXCLUDED.content_url,
  preview_video_url = EXCLUDED.preview_video_url,
  thumbnail_url = EXCLUDED.thumbnail_url,
  preview_duration = EXCLUDED.preview_duration,
  category = EXCLUDED.category,
  class_type = EXCLUDED.class_type,
  show_in_landing = EXCLUDED.show_in_landing,
  is_published = EXCLUDED.is_published;

-- 4. Insertar los menús y planes nutricionales (provenientes de menus_rows.sql)
INSERT INTO public.membership_content (
  id,
  cycle_date,
  category,
  class_type,
  title,
  description,
  target_mode,
  month_year,
  is_published,
  show_in_landing
) VALUES 
(
  '20000000-0000-4000-8000-000000000001',
  '2026-10-01',
  'Nutrición',
  'menu',
  'Muestra de ciclo: Plan Nutricional',
  'Guía alimentaria y estructura del ciclo mensual.',
  'Ambos',
  'Octubre 2026',
  true,
  false
),
(
  '49d0a4a2-98e8-4d59-baff-f46e1a850a1d',
  '2026-09-01',
  'Nutrición',
  'menu',
  'Menú Septiembre: Energía y Balance',
  'Plan de nutrición y pautas de alimentación saludable para el mes.',
  'Ambos',
  'Septiembre 2026',
  true,
  false
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  class_type = EXCLUDED.class_type,
  month_year = EXCLUDED.month_year,
  is_published = EXCLUDED.is_published;
