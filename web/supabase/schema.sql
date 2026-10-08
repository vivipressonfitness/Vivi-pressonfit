-- =========================================================
-- VIVIPREFIT · Schema Supabase (compatible con web/ React)
-- Ejecutar en Supabase Studio > SQL Editor. Idempotente.
-- =========================================================

create extension if not exists pgcrypto;

-- 1) HELPERS + TABLAS ------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar unique,
  full_name varchar,
  avatar_url text,
  plan_status varchar not null default 'trial',        -- trial | active | expired
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  stripe_customer_id varchar,
  stripe_subscription_id varchar,
  is_admin bool not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.landing_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.membership_content (
  id uuid primary key default gen_random_uuid(),
  cycle_date date not null,
  category text not null default 'Clase',
  title text not null,
  description text,
  bunny_video_id text,
  storage_path text,
  content_url text,
  target_mode text not null default 'Ambos',           -- Casa | Gym | Ambos
  class_type text,
  month_year text,
  is_published bool not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger para perfil automático al registrarse.
-- IMPORTANTE: está marcado SECURITY DEFINER + grant execute a anon/authenticated.
-- Si se crea como rol postgres normal, Supabase lo envuelve en un "migrated function"
-- con search_path='' y el INSERT falla en silencio -> el registro nunca crea el perfil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, plan_status, trial_start_date, trial_end_date, is_admin)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'trial', now(), now() + interval '3 days',
    -- Los correos de administración NUNCA entran como miembros trial
    case when lower(coalesce(new.email,'')) in ('admin@vivipressonfit.com') then true else false end
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

grant execute on function public.handle_new_user() to anon, authenticated, service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) RLS ------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.landing_config enable row level security;
alter table public.membership_content enable row level security;

-- Función isAdmin() (security definer para evitar recursión sobre profiles)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- PROFILES: cada quien ve/edita el suyo; admin ve todos (SELECT ya cubre tabla Miembros del Admin)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (auth.uid() = id or public.is_admin()) with check (auth.uid() = id or public.is_admin());

-- LANDING_CONFIG: lectura pública (landing sin login), escritura solo admin
drop policy if exists "landing_config_select_public" on public.landing_config;
create policy "landing_config_select_public" on public.landing_config for select to anon, authenticated using (true);
drop policy if exists "landing_config_insert_admin" on public.landing_config;
create policy "landing_config_insert_admin" on public.landing_config for insert to authenticated
  with check (public.is_admin());
drop policy if exists "landing_config_update_admin" on public.landing_config;
create policy "landing_config_update_admin" on public.landing_config for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "landing_config_delete_admin" on public.landing_config;
create policy "landing_config_delete_admin" on public.landing_config for delete to authenticated
  using (public.is_admin());

-- MEMBERSHIP_CONTENT: visible solo para trial vigente o suscripción activa (o admin); CRUD admin
drop policy if exists "mc_select_active" on public.membership_content;
create policy "mc_select_active" on public.membership_content for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from profiles p
      where p.id = auth.uid() and (
        p.plan_status = 'active'
        or (p.plan_status = 'trial' and p.trial_end_date > now())
      )
    )
  );
drop policy if exists "mc_insert_admin" on public.membership_content;
create policy "mc_insert_admin" on public.membership_content for insert to authenticated with check (public.is_admin());
drop policy if exists "mc_update_admin" on public.membership_content;
create policy "mc_update_admin" on public.membership_content for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "mc_delete_admin" on public.membership_content;
create policy "mc_delete_admin" on public.membership_content for delete to authenticated using (public.is_admin());

-- 3) SEED landing_config (valores por defecto del diseño EJEMPLO) ---------

insert into public.landing_config (key, value) values
  ('monthly_price', '40'),
  ('whatsapp_number', '"59178000000"'),
  ('hero_title', '"Programa de Entrenamiento y"'),
  ('hero_title_sub', '"Estilo de Vida Saludable."'),
  ('hero_sub', '"Un método completo y dinámico que combina clases grabadas bajo demanda, rutinas de fuerza estructuradas para casa o gimnasio, educación alimentaria y soporte directo por WhatsApp."'),
  ('pilares_title', '"Todo lo que incluye tu membresía"'),
  ('membresias_title', '"Tu Membresía Mensual Todo Incluido"')
on conflict (key) do nothing;

-- 4) DIAGNÓSTICO: ¿por qué no se inscriben nuevos miembros?
-- Si el registro crea la cuenta auth pero NO el perfil, revisa esto en Supabase SQL Editor:

-- a) ¿Existe el trigger y la función?
-- select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and tgname = 'on_auth_user_created';
-- select proname, prosecdef from pg_proc where proname = 'handle_new_user';

-- b) Perfiles huérfanos (usuarios auth sin perfil) -> créalos/repara con:
-- insert into public.profiles (id, email, full_name, plan_status, trial_start_date, trial_end_date)
-- select u.id, u.email, split_part(u.email,'@',1), 'trial', now(), now() + interval '3 days'
-- from auth.users u
-- left join public.profiles p on p.id = u.id
-- where p.id is null
-- on conflict (id) do update set plan_status='trial', trial_start_date=now(), trial_end_date=now() + interval '3 days';

-- c) ¿Confirmación de email activada? En Supabase: Authentication → Providers → Email.
--    Si "Confirm email" está ON, el alta solo se completa tras confirmar el correo.

-- 5) ACTIVAR CUENTA ADMIN (reemplaza el uuid por el id real de tu usuario)
-- update public.profiles set is_admin = true, plan_status = 'active' where email = 'admin@vivipressonfit.com';
