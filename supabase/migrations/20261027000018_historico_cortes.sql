-- Histórico de cortes (D-179): a ficha técnica passa a ser uma entrada por serviço, ligada à
-- marcação, com até duas fotografias, uma nota interna (só a equipa) e uma nota para o cliente.
-- O cliente vê na sua área as entradas que a equipa marcar como visíveis, sem a nota interna.
-- Fotografias só com o consentimento do cliente, que o pode retirar (as fotografias saem).

-- 1 · Consentimento das fotografias, por cliente
alter table public.clientes
  add column consentimento_fotos boolean not null default false,
  add column consentimento_fotos_em timestamptz,
  add constraint clientes_consentimento_fotos_data
    check (not consentimento_fotos or consentimento_fotos_em is not null);

-- 2 · A ficha técnica como entrada do histórico
alter table public.fichas_tecnicas
  add column marcacao_id uuid,
  add column foto2_path text,
  add column nota_cliente text,
  add column visivel_cliente boolean not null default false,
  add constraint fichas_tecnicas_marcacao_fk foreign key (inquilino_id, marcacao_id)
    references public.marcacoes (inquilino_id, id) on delete set null (marcacao_id),
  add constraint fichas_tecnicas_foto2 check (foto2_path is null or foto_path is not null),
  drop constraint fichas_tecnicas_check,
  add constraint fichas_tecnicas_check
    check (nota is not null or nota_cliente is not null or foto_path is not null);

create unique index fichas_tecnicas_uma_por_marcacao
  on public.fichas_tecnicas (inquilino_id, marcacao_id) where marcacao_id is not null;

-- 3 · Regras da entrada: a marcação é do mesmo cliente; fotografias só com consentimento
create or replace function public.validar_ficha_tecnica() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.marcacao_id is not null and not exists (
       select 1 from public.marcacoes m
        where m.id = new.marcacao_id and m.inquilino_id = new.inquilino_id
          and m.cliente_id = new.cliente_id) then
    raise exception 'marcacao_invalida' using errcode = 'P0001';
  end if;
  if (new.foto_path is not null or new.foto2_path is not null)
     and (tg_op = 'INSERT' or new.foto_path is distinct from old.foto_path
          or new.foto2_path is distinct from old.foto2_path)
     and not exists (select 1 from public.clientes c
                      where c.id = new.cliente_id and c.inquilino_id = new.inquilino_id
                        and c.consentimento_fotos) then
    raise exception 'sem_consentimento_fotos' using errcode = 'P0001';
  end if;
  return new;
end $$;

create trigger fichas_tecnicas_validar before insert or update on public.fichas_tecnicas
  for each row execute function public.validar_ficha_tecnica();

-- 4 · O histórico do próprio cliente: só as entradas visíveis, sem a nota interna
create or replace function public.meu_historico_cortes(p_inquilino uuid)
returns table (id uuid, data timestamptz, servico text, profissional text, nota text,
               foto_path text, foto2_path text)
language sql stable security definer set search_path = '' as $$
  select f.id, coalesce(m.inicio, f.criado_em), s.nome, p.nome_apresentado, f.nota_cliente,
         case when c.consentimento_fotos then f.foto_path end,
         case when c.consentimento_fotos then f.foto2_path end
    from public.fichas_tecnicas f
    join public.clientes c on c.id = f.cliente_id and c.inquilino_id = f.inquilino_id
    left join public.marcacoes m on m.id = f.marcacao_id and m.inquilino_id = f.inquilino_id
    left join public.servicos s on s.id = m.servico_id and s.inquilino_id = m.inquilino_id
    left join public.profissionais p on p.id = f.profissional_id and p.inquilino_id = f.inquilino_id
   where f.inquilino_id = p_inquilino and c.auth_user_id = auth.uid() and f.visivel_cliente
     and c.anonimizado_em is null
     and public.funcionalidade_ativa(p_inquilino, 'ficha_tecnica')
   order by coalesce(m.inicio, f.criado_em) desc
$$;

-- Uma fotografia do bucket `fichas` que pertence ao cliente com sessão (as visíveis, para ver;
-- todas as suas, para apagar quando retira o consentimento).
create or replace function public.foto_do_cliente(p_nome text, p_so_visiveis boolean)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.fichas_tecnicas f
      join public.clientes c on c.id = f.cliente_id and c.inquilino_id = f.inquilino_id
     where c.auth_user_id = auth.uid() and (f.foto_path = p_nome or f.foto2_path = p_nome)
       and (not p_so_visiveis or (f.visivel_cliente and c.consentimento_fotos)))
$$;

create policy storage_fichas_cliente_ler on storage.objects for select
  using (bucket_id = 'fichas' and public.foto_do_cliente(name, true));
create policy storage_fichas_cliente_apagar on storage.objects for delete
  using (bucket_id = 'fichas' and public.foto_do_cliente(name, false));

-- Os caminhos de todas as fotografias do cliente com sessão nesta barbearia: a aplicação apaga os
-- ficheiros (com a sessão dele) antes de retirar o consentimento.
create or replace function public.minhas_fotos_historico(p_inquilino uuid)
returns setof text language sql stable security definer set search_path = '' as $$
  select x from public.fichas_tecnicas f
    join public.clientes c on c.id = f.cliente_id and c.inquilino_id = f.inquilino_id,
         unnest(array[f.foto_path, f.foto2_path]) as x
   where f.inquilino_id = p_inquilino and c.auth_user_id = auth.uid() and x is not null
$$;

-- 5 · O cliente dá ou retira o consentimento na sua área. Ao retirar, as fotografias saem das
-- fichas (a aplicação apaga primeiro os ficheiros, com a sessão do cliente) e as entradas que só
-- tinham fotografias desaparecem.
create or replace function public.mudar_consentimento_fotos(p_inquilino uuid, p_sim boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_cliente uuid;
begin
  select id into v_cliente from public.clientes
   where inquilino_id = p_inquilino and auth_user_id = auth.uid() and anonimizado_em is null
   for update;
  if v_cliente is null then raise exception 'sem_permissao' using errcode = '42501'; end if;
  update public.clientes
     set consentimento_fotos = p_sim, consentimento_fotos_em = case when p_sim then now() end
   where id = v_cliente;
  if not p_sim then
    delete from public.fichas_tecnicas
     where cliente_id = v_cliente and inquilino_id = p_inquilino
       and nota is null and nota_cliente is null;
    update public.fichas_tecnicas set foto_path = null, foto2_path = null
     where cliente_id = v_cliente and inquilino_id = p_inquilino;
  end if;
end $$;

revoke all on function public.meu_historico_cortes(uuid), public.foto_do_cliente(text, boolean),
  public.minhas_fotos_historico(uuid), public.mudar_consentimento_fotos(uuid, boolean),
  public.validar_ficha_tecnica()
  from public, anon;
grant execute on function public.meu_historico_cortes(uuid), public.foto_do_cliente(text, boolean),
  public.minhas_fotos_historico(uuid), public.mudar_consentimento_fotos(uuid, boolean)
  to authenticated;
