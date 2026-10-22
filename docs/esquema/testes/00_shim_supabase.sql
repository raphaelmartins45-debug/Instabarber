-- =============================================================================
-- Só para testes locais num Postgres sem Supabase.
-- Reproduz o mínimo do ambiente Supabase: esquema auth, papéis anon /
-- authenticated / service_role, auth.uid(), auth.jwt(), esquema storage e os
-- privilégios por omissão que o Supabase dá ao esquema public.
-- NUNCA correr isto num projeto Supabase real.
-- =============================================================================

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;
create table if not exists auth.users (
  id     uuid primary key default gen_random_uuid(),
  email  text unique,
  phone  text unique
);

create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;

create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid $$;

grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;

-- Privilégios por omissão como no Supabase: as tabelas do public ficam
-- acessíveis aos três papéis, e é o RLS que decide.
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

-- Storage mínimo
create schema if not exists storage;
create table if not exists storage.buckets (
  id      text primary key,
  name    text not null,
  public  boolean not null default false
);
create table if not exists storage.objects (
  id         uuid primary key default gen_random_uuid(),
  bucket_id  text references storage.buckets(id),
  name       text not null,
  owner      uuid
);
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.objects, storage.buckets to anon, authenticated, service_role;
grant execute on all functions in schema storage to anon, authenticated, service_role;
