begin;
-- O código de acesso da demonstração (D-208): «Gerar» cria um código de 6 algarismos para a
-- reunião; instabarber.pt/demo só mostra as vistas a quem o escrever. Guarda-se só o hash; o
-- Reset apaga a barbearia de demonstração e, com ela, o código (em cascata).

create table public.demonstracao_codigos (
  inquilino_id uuid primary key references public.inquilinos(id) on delete cascade,
  codigo_hash  text not null,
  criado_em    timestamptz not null default now()
);
alter table public.demonstracao_codigos enable row level security;
revoke all on public.demonstracao_codigos from anon, authenticated;

-- Um código novo para a demonstração atual (substitui o anterior). Só a equipa da InstaBarber.
create or replace function public.novo_codigo_demonstracao()
returns text
language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_codigo text;
begin
  if not (public.e_super_admin() or public.e_comercial()) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  select id into v_id from public.inquilinos where demonstracao;
  if v_id is null then raise exception 'sem_demonstracao' using errcode = 'P0001'; end if;
  v_codigo := lpad((('x' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))::bit(32)::bigint % 1000000)::text, 6, '0');
  insert into public.demonstracao_codigos (inquilino_id, codigo_hash)
  values (v_id, encode(sha256(convert_to(v_codigo, 'UTF8')), 'hex'))
  on conflict (inquilino_id) do update set codigo_hash = excluded.codigo_hash, criado_em = now();
  return v_codigo;
end $$;

-- Verdadeiro se o código abre a demonstração atual. Público (a página /demo); as tentativas
-- contam-se no servidor (limite de pedidos).
create or replace function public.codigo_demonstracao_valido(p_codigo text)
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.demonstracao_codigos c
      join public.inquilinos i on i.id = c.inquilino_id and i.demonstracao
     where c.codigo_hash = encode(sha256(convert_to(coalesce(p_codigo, ''), 'UTF8')), 'hex'));
$$;

revoke all on function public.novo_codigo_demonstracao(), public.codigo_demonstracao_valido(text)
  from public, anon, authenticated;
grant execute on function public.novo_codigo_demonstracao() to authenticated;
grant execute on function public.codigo_demonstracao_valido(text) to anon, authenticated;
commit;
