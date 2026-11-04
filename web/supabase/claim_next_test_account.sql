-- =====================================================================
-- FUNCIÓN RPC: ASIGNADOR ATÓMICO CORRELATIVO DE CUENTAS DE TEST
-- Asigna secuencialmente miembro01, miembro02... miembro30, miembro31...
-- Si el número supera 30, crea la cuenta en auth.users automáticamente.
-- Ejecutar en Supabase Studio > SQL Editor.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.claim_next_test_account()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_next int;
  v_email text;
  v_name text;
  v_user_id uuid;
  v_encrypted_pw text;
BEGIN
  -- 1. Incrementar contador atómico en landing_config
  INSERT INTO public.landing_config (key, value)
  VALUES ('test_account_counter', '1'::jsonb)
  ON CONFLICT (key) DO UPDATE
  SET value = to_jsonb((coalesce((public.landing_config.value)::text::int, 0) + 1))
  RETURNING (value::text)::int INTO v_next;

  v_email := 'miembro' || LPAD(v_next::text, 2, '0') || '@test.vivipressonfit.com';
  v_name := 'Alumna Test ' || LPAD(v_next::text, 2, '0');

  -- 2. Si el usuario aún no existe (por ejemplo > 30), crearlo dinámicamente
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = v_email) THEN
    v_user_id := gen_random_uuid();
    v_encrypted_pw := crypt('TestVivi2026!', gen_salt('bf'));

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      v_email, v_encrypted_pw, now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_name),
      now(), now(), '', '', '', ''
    );

    INSERT INTO public.profiles (
      id, email, full_name, plan_status, stripe_customer_id, stripe_subscription_id, is_admin, created_at, updated_at
    ) VALUES (
      v_user_id, v_email, v_name, 'active', 'cus_test_' || LPAD(v_next::text, 2, '0'), 'sub_test_' || LPAD(v_next::text, 2, '0'), false, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET plan_status = 'active';
  END IF;

  RETURN jsonb_build_object(
    'number', v_next,
    'email', v_email,
    'password', 'TestVivi2026!'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_next_test_account() TO anon, authenticated, service_role;

