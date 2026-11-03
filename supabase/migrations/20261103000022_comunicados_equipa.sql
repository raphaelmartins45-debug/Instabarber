-- Comunicados também para a equipa InstaBarber (D-191): os comerciais ou os gestores, todos ou uma
-- pessoa. Mesma tabela e mesma lógica dos comunicados às barbearias; as leituras são por pessoa.

-- 1 · Destinos novos e a pessoa (opcional)
alter table public.comunicados
  add column destinatario_id uuid references auth.users(id) on delete cascade,
  drop constraint comunicados_destino_check,
  add constraint comunicados_destino_check
    check (destino in ('todas','plano','barbearia','comerciais','gestores')),
  drop constraint comunicados_check,
  add constraint comunicados_check check (
       (destino = 'todas' and plano is null and inquilino_id is null and destinatario_id is null)
    or (destino = 'plano' and plano is not null and inquilino_id is null and destinatario_id is null)
    or (destino = 'barbearia' and inquilino_id is not null and plano is null and destinatario_id is null)
    or (destino in ('comerciais','gestores') and plano is null and inquilino_id is null));

-- 2 · As leituras da equipa
-- Quem da equipa InstaBarber leu cada comunicado (D-191): uma linha por pessoa.
create table public.comunicado_leituras_equipa (
  comunicado_id  uuid not null references public.comunicados(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  lido_em        timestamptz not null default now(),
  primary key (comunicado_id, user_id)
);
alter table public.comunicado_leituras_equipa enable row level security;
-- Só se escreve por marcar_comunicado_lido_equipa(); os administradores leem as leituras.
create policy comunicado_leituras_equipa_admin_ler on public.comunicado_leituras_equipa for select
  using ((select public.e_super_admin()));

-- 3 · Funções
-- Comunicados à equipa InstaBarber (D-191): para os comerciais ou para os gestores, todos ou
-- uma pessoa. Cada pessoa lê e marca como lidos os seus por estas funções.
create or replace function public.comunicado_para_equipa(p_comunicado uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.comunicados c join public.perfis p on p.user_id = p_user
     where c.id = p_comunicado and c.inicio <= now() and (c.fim is null or c.fim > now())
       and p.ativo and p.inquilino_id is null
       and ((c.destino = 'comerciais' and p.papel = 'comercial')
            or (c.destino = 'gestores' and p.papel = 'gestor_plataforma'))
       and (c.destinatario_id is null or c.destinatario_id = p_user))
$$;

-- Os comunicados em vigor para quem está a usar o Admin que ainda não marcou como lidos.
create or replace function public.meus_comunicados_equipa()
returns table (id uuid, titulo text, texto text, inicio timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id, c.titulo, c.texto, c.inicio from public.comunicados c
   where public.comunicado_para_equipa(c.id, auth.uid())
     and not exists (select 1 from public.comunicado_leituras_equipa l
                      where l.comunicado_id = c.id and l.user_id = auth.uid())
   order by c.inicio desc;
$$;

create or replace function public.marcar_comunicado_lido_equipa(p_comunicado uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.comunicado_para_equipa(p_comunicado, auth.uid()) then
    raise exception 'comunicado_invalido' using errcode = 'P0001';
  end if;
  insert into public.comunicado_leituras_equipa (comunicado_id, user_id)
  values (p_comunicado, auth.uid())
  on conflict (comunicado_id, user_id) do nothing;
end $$;

revoke all on function public.comunicado_para_equipa(uuid, uuid), public.meus_comunicados_equipa(),
  public.marcar_comunicado_lido_equipa(uuid) from public, anon;
grant execute on function public.meus_comunicados_equipa(), public.marcar_comunicado_lido_equipa(uuid)
  to authenticated, service_role;
