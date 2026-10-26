-- =============================================================================
-- Migração 15 · Comprovativos de pagamento da mensalidade (D-168): a barbearia envia o
-- comprovativo do MB Way ou da transferência e a Performa LAB aprova ou recusa. As mesmas
-- alterações estão em docs/esquema/01 a 04, testadas em docs/esquema/testes/96d_comprovativos.sql.
-- =============================================================================
-- Comprovativos de pagamento da mensalidade (D-168): a barbearia envia o comprovativo do MB Way
-- ou da transferência; a Performa LAB confere e aprova (regista o recebimento) ou recusa com motivo.
-- O ficheiro fica no bucket privado «comprovativos», em <inquilino_id>/<ficheiro>.
create table comprovativos_pagamento (
  id              uuid primary key default gen_random_uuid(),
  inquilino_id    uuid not null references inquilinos(id) on delete cascade,
  fatura_id       uuid references faturas_plataforma(id) on delete set null,
  periodo_inicio  date not null,
  periodo_fim     date not null,
  metodo          text not null check (metodo in ('mbway','transferencia')),
  valor           numeric(10,2) not null check (valor > 0),
  pago_em         date not null,
  caminho         text not null,
  estado          text not null default 'pendente' check (estado in ('pendente','aprovado','recusado')),
  motivo          text check (char_length(motivo) <= 600),
  enviado_por     uuid references auth.users(id) on delete set null,
  enviado_em      timestamptz not null default now(),
  decidido_por    uuid references auth.users(id) on delete set null,
  decidido_em     timestamptz,
  recebimento_id  uuid references recebimentos(id) on delete set null,
  check (periodo_fim >= periodo_inicio),
  check ((estado = 'pendente') = (decidido_em is null)),
  check (estado <> 'recusado' or motivo is not null)
);
-- Um só comprovativo em análise por período.
create unique index comprovativos_um_pendente on comprovativos_pagamento (inquilino_id, periodo_inicio)
  where estado = 'pendente';
create index comprovativos_estado on comprovativos_pagamento (estado, enviado_em);

alter table public.comprovativos_pagamento enable row level security;
create policy comprovativos_pagamento_admin_ler on public.comprovativos_pagamento for select
  using ((select public.e_super_admin()));

-- Comprovativos de pagamento (D-168): o dono vê os seus (também suspenso); escreve-se só pelas
-- funções enviar/aprovar/recusar. O ficheiro: o dono carrega e lê na pasta da barbearia; o
-- super_admin lê tudo. Ninguém altera nem apaga pelo Storage.
create policy comprovativos_ler on comprovativos_pagamento for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'], false)));
create policy storage_comprovativos_ler on storage.objects for select
  using (bucket_id = 'comprovativos' and (
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario'], false) x)
         or (select public.e_super_admin())));
create policy storage_comprovativos_carregar on storage.objects for insert
  with check (bucket_id = 'comprovativos' and
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario'], false) x));

insert into storage.buckets (id, name, public) values ('comprovativos', 'comprovativos', false)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Comprovativos de pagamento da mensalidade (D-168)
-- -----------------------------------------------------------------------------

-- O período que a barbearia está a pagar: a fatura mais antiga por pagar ou, sem ela, o período
-- que começa no próximo vencimento (ou hoje, se ainda não houver), de um mês ou de um ano.
create or replace function public.periodo_a_pagar(p_inquilino uuid)
returns table (inicio date, fim date, fatura_id uuid, valor_fatura numeric)
language plpgsql stable security definer set search_path = '' as $$
declare v_inicio date; v_per text;
begin
  if not (p_inquilino in (select public.inquilinos_onde(array['proprietario'], false))
          or public.e_super_admin()) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return query
    select f.periodo_inicio, f.periodo_fim, f.id, f.valor from public.faturas_plataforma f
     where f.inquilino_id = p_inquilino and f.paga_em is null
     order by f.periodo_inicio limit 1;
  if found then return; end if;
  select coalesce(i.proximo_vencimento, public.hoje_lisboa()), i.periodicidade into v_inicio, v_per
    from public.inquilinos i where i.id = p_inquilino;
  return query select v_inicio,
    (v_inicio + case when v_per = 'anual' then interval '1 year' else interval '1 month' end)::date - 1,
    null::uuid, null::numeric;
end $$;

-- O dono envia o comprovativo (também com a barbearia suspensa, para regularizar, M.4). O ficheiro
-- tem de já estar no bucket, na pasta da barbearia.
create or replace function public.enviar_comprovativo(
  p_inquilino uuid, p_metodo text, p_valor numeric, p_pago_em date, p_caminho text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; p record;
begin
  if not (p_inquilino in (select public.inquilinos_onde(array['proprietario'], false))) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_metodo not in ('mbway','transferencia') then raise exception 'metodo' using errcode = 'P0001'; end if;
  if p_valor is null or p_valor <= 0 or p_valor > 100000 then raise exception 'valor' using errcode = 'P0001'; end if;
  if p_pago_em is null or p_pago_em > public.hoje_lisboa() or p_pago_em < public.hoje_lisboa() - 180 then
    raise exception 'data' using errcode = 'P0001';
  end if;
  if p_caminho !~ ('^' || p_inquilino::text || '/[0-9a-f-]{36}\.(jpg|png|pdf)$')
     or not exists (select 1 from storage.objects o where o.bucket_id = 'comprovativos' and o.name = p_caminho) then
    raise exception 'ficheiro' using errcode = 'P0001';
  end if;
  select * into p from public.periodo_a_pagar(p_inquilino);
  if exists (select 1 from public.comprovativos_pagamento c where c.inquilino_id = p_inquilino
              and c.periodo_inicio = p.inicio and c.estado = 'pendente') then
    raise exception 'ja_pendente' using errcode = 'P0001';
  end if;
  insert into public.comprovativos_pagamento
    (inquilino_id, fatura_id, periodo_inicio, periodo_fim, metodo, valor, pago_em, caminho, enviado_por)
  values (p_inquilino, p.fatura_id, p.inicio, p.fim, p_metodo, p_valor, p_pago_em, p_caminho, auth.uid())
  returning id into v_id;
  perform public.registar_auditoria(p_inquilino, 'comprovativo_enviado', 'comprovativos_pagamento', v_id,
    jsonb_build_object('valor', p_valor, 'metodo', p_metodo, 'periodo_inicio', p.inicio));
  return v_id;
end $$;

-- A Performa LAB aprova: regista o recebimento, marca a fatura paga, põe a barbearia em dia,
-- avança o próximo vencimento para o dia a seguir ao período pago e, se estava suspensa por falta
-- de pagamento (M.4), reativa-a.
create or replace function public.aprovar_comprovativo(p_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.comprovativos_pagamento%rowtype; v_rec uuid;
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select * into c from public.comprovativos_pagamento where id = p_id for update;
  if not found or c.estado <> 'pendente' then raise exception 'ja_decidido' using errcode = 'P0001'; end if;
  insert into public.recebimentos (inquilino_id, fatura_id, valor, metodo, data, nota, registado_por)
  values (c.inquilino_id, c.fatura_id, c.valor, c.metodo, c.pago_em, 'Comprovativo aprovado', auth.uid())
  returning id into v_rec;
  if c.fatura_id is not null then
    update public.faturas_plataforma set paga_em = c.pago_em where id = c.fatura_id and paga_em is null;
  end if;
  update public.inquilinos i
     set estado_pagamento = 'em_dia',
         proximo_vencimento = greatest(coalesce(i.proximo_vencimento, c.periodo_fim + 1), c.periodo_fim + 1),
         estado = case when i.estado = 'suspenso' then 'ativo' else i.estado end
   where i.id = c.inquilino_id;
  update public.comprovativos_pagamento
     set estado = 'aprovado', decidido_por = auth.uid(), decidido_em = now(), recebimento_id = v_rec
   where id = p_id;
  perform public.registar_auditoria(c.inquilino_id, 'comprovativo_aprovado', 'comprovativos_pagamento', p_id,
    jsonb_build_object('valor', c.valor, 'recebimento', v_rec));
  return v_rec;
end $$;

-- A Performa LAB recusa, com o motivo que a barbearia vê; pode enviar outro comprovativo.
create or replace function public.recusar_comprovativo(p_id uuid, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
declare c public.comprovativos_pagamento%rowtype;
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_motivo, ''))) < 3 then raise exception 'motivo' using errcode = 'P0001'; end if;
  select * into c from public.comprovativos_pagamento where id = p_id for update;
  if not found or c.estado <> 'pendente' then raise exception 'ja_decidido' using errcode = 'P0001'; end if;
  update public.comprovativos_pagamento
     set estado = 'recusado', motivo = trim(p_motivo), decidido_por = auth.uid(), decidido_em = now()
   where id = p_id;
  perform public.registar_auditoria(c.inquilino_id, 'comprovativo_recusado', 'comprovativos_pagamento', p_id,
    jsonb_build_object('motivo', trim(p_motivo)));
end $$;

-- Comprovativos de pagamento (D-168): cada função verifica o papel. Sem EXECUTE por omissão
-- para public nem anon.
revoke all on function public.periodo_a_pagar(uuid),
  public.enviar_comprovativo(uuid, text, numeric, date, text),
  public.aprovar_comprovativo(uuid), public.recusar_comprovativo(uuid, text) from public, anon;
grant execute on function public.periodo_a_pagar(uuid),
  public.enviar_comprovativo(uuid, text, numeric, date, text),
  public.aprovar_comprovativo(uuid), public.recusar_comprovativo(uuid, text) to authenticated;
