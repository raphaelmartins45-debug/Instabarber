-- =============================================================================
-- Migração 12 · Apoio às barbearias e comunicados aos gestores (D-160). As mesmas tabelas,
-- funções e políticas estão em docs/esquema/01, 02 e 03, testadas em
-- docs/esquema/testes/96_apoio_comunicados.sql.
-- =============================================================================
-- Apoio às barbearias (D-160): o histórico de cada contacto da Performa LAB com uma barbearia.
-- Só o super_admin vê e escreve; a barbearia não vê nada.
create table apoio_registos (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  tipo          text not null check (tipo in ('chamada','whatsapp','email','visita','nota')),
  assunto       text not null check (length(trim(assunto)) between 1 and 200),
  texto         text check (length(texto) <= 5000),
  estado        text not null default 'aberto' check (estado in ('aberto','resolvido')),
  resolvido_em  timestamptz,
  criado_por    uuid references auth.users(id) on delete set null,
  criado_em     timestamptz not null default now(),
  check ((estado = 'resolvido') = (resolvido_em is not null))
);
create index apoio_registos_inquilino on apoio_registos (inquilino_id, criado_em desc);
create index apoio_registos_abertos on apoio_registos (estado) where estado = 'aberto';

-- Comunicados da InstaBarber aos gestores das barbearias (D-160): para todas, para um plano ou
-- para uma barbearia, entre o início e o fim. O gestor lê pela função meus_comunicados() e
-- marca «Li» por marcar_comunicado_lido(); a leitura conta por barbearia.
create table comunicados (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null check (length(trim(titulo)) between 1 and 120),
  texto         text not null check (length(trim(texto)) between 1 and 3000),
  destino       text not null check (destino in ('todas','plano','barbearia')),
  plano         text check (plano in ('basic','pro')),
  inquilino_id  uuid references inquilinos(id) on delete cascade,
  inicio        timestamptz not null default now(),
  fim           timestamptz,
  criado_por    uuid references auth.users(id) on delete set null,
  criado_em     timestamptz not null default now(),
  check ((destino = 'todas' and plano is null and inquilino_id is null)
      or (destino = 'plano' and plano is not null and inquilino_id is null)
      or (destino = 'barbearia' and inquilino_id is not null and plano is null)),
  check (fim is null or fim > inicio)
);
create index comunicados_inicio on comunicados (inicio desc);

create table comunicado_leituras (
  comunicado_id  uuid not null references comunicados(id) on delete cascade,
  inquilino_id   uuid not null references inquilinos(id) on delete cascade,
  lido_por       uuid references auth.users(id) on delete set null,
  lido_em        timestamptz not null default now(),
  primary key (comunicado_id, inquilino_id)
);

-- RLS ativo e leitura total pelo super_admin, como o 03_rls.sql faz a todas as tabelas.
alter table public.apoio_registos enable row level security;
alter table public.comunicados enable row level security;
alter table public.comunicado_leituras enable row level security;
create policy apoio_registos_admin_ler on public.apoio_registos for select using ((select public.e_super_admin()));
create policy comunicados_admin_ler on public.comunicados for select using ((select public.e_super_admin()));
create policy comunicado_leituras_admin_ler on public.comunicado_leituras for select using ((select public.e_super_admin()));

-- Apoio e comunicados (D-160): só o super_admin com dois fatores escreve e lê.
-- comunicado_leituras só se escreve por marcar_comunicado_lido() (leitura pela política *_admin_ler).
create policy apoio_registos_admin on apoio_registos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy comunicados_admin on comunicados for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- -----------------------------------------------------------------------------
-- 8D · Comunicados aos gestores (D-160). A tabela só se lê pelo super_admin (RLS);
--      o gestor (proprietário) lê e marca como lidos os da sua barbearia por estas funções.
-- -----------------------------------------------------------------------------
create or replace function public.comunicado_para(p_comunicado uuid, p_inquilino uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.comunicados c join public.inquilinos i on i.id = p_inquilino
     where c.id = p_comunicado and c.inicio <= now() and (c.fim is null or c.fim > now())
       and (c.destino = 'todas' or (c.destino = 'plano' and c.plano = i.plano)
            or (c.destino = 'barbearia' and c.inquilino_id = i.id)))
$$;

create or replace function public.exigir_gestor(p_inquilino uuid) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_inquilino is null
     or p_inquilino not in (select public.inquilinos_onde(array['proprietario'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
end $$;

-- Os comunicados em vigor para a barbearia que o gestor ainda não marcou como lidos.
create or replace function public.meus_comunicados(p_inquilino uuid)
returns table (id uuid, titulo text, texto text, inicio timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.exigir_gestor(p_inquilino);
  return query
    select c.id, c.titulo, c.texto, c.inicio from public.comunicados c
     where public.comunicado_para(c.id, p_inquilino)
       and not exists (select 1 from public.comunicado_leituras l
                        where l.comunicado_id = c.id and l.inquilino_id = p_inquilino)
     order by c.inicio desc;
end $$;

create or replace function public.marcar_comunicado_lido(p_comunicado uuid, p_inquilino uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_gestor(p_inquilino);
  if not public.comunicado_para(p_comunicado, p_inquilino) then
    raise exception 'comunicado_invalido' using errcode = 'P0001';
  end if;
  insert into public.comunicado_leituras (comunicado_id, inquilino_id, lido_por)
  values (p_comunicado, p_inquilino, auth.uid())
  on conflict (comunicado_id, inquilino_id) do nothing;
end $$;

-- Comunicados (D-160): cada função verifica o gestor da barbearia.
revoke all on function public.comunicado_para(uuid, uuid), public.exigir_gestor(uuid) from public, anon, authenticated;
grant execute on function public.meus_comunicados(uuid), public.marcar_comunicado_lido(uuid, uuid)
  to authenticated;
