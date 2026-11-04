-- =====================================================================
-- LIMPIEZA DE MIEMBROS DE PRUEBA (@test.vivipressonfit.com)
-- Elimina los 30 usuarios de auth.users y en cascada de public.profiles.
-- Ejecutar en Supabase Studio > SQL Editor cuando finalices tus pruebas.
-- =====================================================================

DELETE FROM auth.users 
WHERE email LIKE '%@test.vivipressonfit.com';

-- Comprobación: debe devolver 0 filas
SELECT count(*) as usuarios_restantes 
FROM public.profiles 
WHERE email LIKE '%@test.vivipressonfit.com';

