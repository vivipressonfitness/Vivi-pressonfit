-- ============================================================================
-- SCRIPT DE ACTUALIZACIÓN: 4 CLASES DE SUSCRIPTORAS PRIVADAS (BUNNY STREAM)
-- Ejecutar en Supabase Studio > SQL Editor
-- ID de Video Privado (Librería 796132): fec9d91b-cccc-4f1c-9729-2e91a53f33b4
-- ============================================================================

-- 1. Actualizar las 4 clases de miembros con el video privado de Bunny Stream
UPDATE public.membership_content
SET 
  bunny_video_id = 'fec9d91b-cccc-4f1c-9729-2e91a53f33b4',
  show_in_landing = false,
  is_published = true,
  thumbnail_url = CASE 
    WHEN title ILIKE '%gap%' THEN '/landing/thumb-gap.jpg'
    WHEN title ILIKE '%cardio%' THEN '/landing/thumb-cardio.jpg'
    ELSE '/landing/thumb-fullbody.jpg'
  END,
  title = REGEXP_REPLACE(title, '\s*\(Gratis\)\s*', '', 'gi')
WHERE title NOT ILIKE '%(gratis)%' AND title NOT ILIKE '%muestra%';

-- 2. Asegurar que las muestras gratis queden solo en el Landing público
UPDATE public.membership_content
SET 
  show_in_landing = true,
  is_published = true
WHERE title ILIKE '%(gratis)%' OR title ILIKE '%muestra%';

-- 3. Verificación de las clases que verán las miembros
SELECT id, title, category, bunny_video_id, show_in_landing, is_published, thumbnail_url
FROM public.membership_content
ORDER BY title;

