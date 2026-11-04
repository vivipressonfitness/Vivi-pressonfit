-- =====================================================================
-- CREACIÓN DE 30 MIEMBROS DE PRUEBA COMO SUSCRIPTORES ACTIVOS
-- Dominio de prueba: @test.vivipressonfit.com
-- Contraseña unificada para los 30 usuarios: TestVivi2026!
-- Ejecutar en Supabase Studio > SQL Editor.
-- =====================================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_name text;
  v_encrypted_pw text;
  i integer;
BEGIN
  -- Asegurar extensión para hashing seguro bcrypt
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  -- Hash bcrypt de la contraseña: 'TestVivi2026!'
  v_encrypted_pw := crypt('TestVivi2026!', gen_salt('bf'));

  FOR i IN 1..30 LOOP
    v_user_id := gen_random_uuid();
    v_email := 'miembro' || LPAD(i::text, 2, '0') || '@test.vivipressonfit.com';
    v_name := 'Alumna Test ' || LPAD(i::text, 2, '0');

    -- 1. Insertar en auth.users si no existe previamente
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        v_email,
        v_encrypted_pw,
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', v_name),
        now(),
        now(),
        '',
        '',
        '',
        ''
      );
    ELSE
      SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
    END IF;

    -- 2. Asegurar perfil con membresía SUSCRIPTORES ACTIVOS (plan_status = 'active')
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      plan_status,
      stripe_customer_id,
      stripe_subscription_id,
      is_admin,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      v_email,
      v_name,
      'active',
      'cus_test_' || LPAD(i::text, 2, '0'),
      'sub_test_' || LPAD(i::text, 2, '0'),
      false,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      plan_status = 'active',
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      stripe_subscription_id = EXCLUDED.stripe_subscription_id,
      updated_at = now();

  END LOOP;
END $$;

-- Verificación rápida de los 30 usuarios creados:
SELECT 
  p.id, 
  p.email, 
  p.full_name, 
  p.plan_status, 
  p.stripe_subscription_id, 
  p.created_at
FROM public.profiles p
WHERE p.email LIKE '%@test.vivipressonfit.com'
ORDER BY p.email ASC;

