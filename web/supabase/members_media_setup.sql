-- =====================================================================
-- BUCKET 'members-media' Y GESTIÓN PÚBLICA/PRIVADA DE CONTENIDO DEL MES
-- Ejecutar en Supabase Studio > SQL Editor (Idempotente, no borra nada)
-- =====================================================================

-- 1. Crear el bucket 'members-media' en storage.buckets si no existe
insert into storage.buckets (id, name, public)
values ('members-media', 'members-media', true)
on conflict (id) do update set public = true;

-- 2. Políticas de Seguridad (RLS) para el bucket 'members-media'
-- Lectura: disponible para reproducir/descargar
drop policy if exists "members_media_select_policy" on storage.objects;
create policy "members_media_select_policy" on storage.objects
  for select
  using (bucket_id = 'members-media');

-- Subida / Inserción: Solo administradores
drop policy if exists "members_media_insert_admin" on storage.objects;
create policy "members_media_insert_admin" on storage.objects
  for insert
  with check (bucket_id = 'members-media' and public.is_admin());

-- Actualización: Solo administradores
drop policy if exists "members_media_update_admin" on storage.objects;
create policy "members_media_update_admin" on storage.objects
  for update
  using (bucket_id = 'members-media' and public.is_admin());

-- Eliminación: Solo administradores
drop policy if exists "members_media_delete_admin" on storage.objects;
create policy "members_media_delete_admin" on storage.objects
  for delete
  using (bucket_id = 'members-media' and public.is_admin());

-- 3. Extender tabla membership_content con columnas para diferenciar público vs privado
-- (Todos los campos son opcionales con 'if not exists' para total retrocompatibilidad)
alter table public.membership_content add column if not exists show_in_landing boolean default false;
alter table public.membership_content add column if not exists preview_video_url text;
alter table public.membership_content add column if not exists thumbnail_url text;
alter table public.membership_content add column if not exists preview_duration text default 'Adelanto gratis';
alter table public.membership_content add column if not exists pdf_url text;
alter table public.membership_content add column if not exists private_video_url text;

-- 4. Permitir lectura anónima solo para contenidos marcados expresamente para el landing público
drop policy if exists "mc_select_public_landing" on public.membership_content;
create policy "mc_select_public_landing" on public.membership_content
  for select to anon, authenticated
  using (show_in_landing = true);

