-- =============================================================================
-- Migração 13 · Equipa InstaBarber: gestor e comercial (D-161). As mesmas alterações estão em
-- docs/esquema/01 a 04, testadas em docs/esquema/testes/96b_equipa_plataforma.sql.
-- =============================================================================
-- Papéis da equipa InstaBarber (D-161): o gestor é um administrador que não gere contas; o
-- comercial só vê o Comercial dos seus leads. Os três não pertencem a nenhuma barbearia.
alter table perfis drop constraint perfis_check;
alter table perfis drop constraint perfis_papel_check;
alter table perfis add constraint perfis_papel_check
  check (papel in ('super_admin','gestor_plataforma','comercial','proprietario','profissional'));
alter table perfis add constraint perfis_check
  check ((papel in ('super_admin','gestor_plataforma','comercial')) = (inquilino_id is null));
-- Cada pessoa da equipa InstaBarber tem um só papel na plataforma.
create unique index perfis_um_papel_plataforma on perfis (user_id) where inquilino_id is null;

-- O comercial responsável pelo lead e quem o criou (D-161).
alter table leads add column responsavel_id uuid references auth.users(id) on delete set null;
alter table leads add column criado_por uuid references auth.users(id) on delete set null;
create index leads_responsavel on leads (responsavel_id, estado);

-- Desconto na mensalidade e taxa de migração (D-161). Desligados até a Performa LAB os ativar
-- em configuracao_comercial; a taxa de migração é a comissão do comercial.
alter table propostas add column desconto_mensalidade_pct numeric(5,2) not null default 0
  check (desconto_mensalidade_pct between 0 and 100);
alter table propostas add column taxa_migracao_sem_iva numeric(10,2) not null default 0
  check (taxa_migracao_sem_iva >= 0);
alter table propostas add column desconto_taxa_pct numeric(5,2) not null default 0
  check (desconto_taxa_pct between 0 and 100);
alter table inquilinos add column desconto_mensalidade_pct numeric(5,2) not null default 0
  check (desconto_mensalidade_pct between 0 and 100);
-- A vista do estado efetivo da proposta passa a mostrar as colunas novas.
drop view propostas_com_estado;
create view propostas_com_estado with (security_invoker = true) as
  select p.*,
         case when p.estado = 'enviada' and p.valida_ate < (now() at time zone 'Europe/Lisbon')::date
              then 'expirada' else p.estado end as estado_efetivo
    from propostas p;


-- Condições comerciais (D-161): uma só linha. Os descontos e a taxa de migração estão
-- desligados até a Performa LAB os ligar; os limites valem para o comercial.
create table configuracao_comercial (
  id                            boolean primary key default true check (id),
  descontos_ativos              boolean not null default false,
  desconto_max_mensalidade_pct  numeric(5,2) not null default 20
                                check (desconto_max_mensalidade_pct between 0 and 100),
  taxa_migracao_ativa           boolean not null default false,
  taxa_migracao_sem_iva         numeric(10,2) not null default 0 check (taxa_migracao_sem_iva >= 0),
  desconto_max_taxa_pct         numeric(5,2) not null default 50
                                check (desconto_max_taxa_pct between 0 and 100),
  atualizado_por                uuid references auth.users(id) on delete set null,
  atualizado_em                 timestamptz not null default now()
);

-- Metas mensais de cada comercial (D-161): a Performa LAB define, o comercial vê as suas.
create table metas_comerciais (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  mes          date not null check (extract(day from mes) = 1),
  leads_novos  integer not null default 0 check (leads_novos >= 0),
  propostas    integer not null default 0 check (propostas >= 0),
  ganhos       integer not null default 0 check (ganhos >= 0),
  criado_em    timestamptz not null default now(),
  unique (user_id, mes)
);

insert into configuracao_comercial default values;

-- RLS ativo e leitura total pelos administradores, como o 03_rls.sql faz a todas as tabelas.
alter table public.configuracao_comercial enable row level security;
alter table public.metas_comerciais enable row level security;
create policy configuracao_comercial_admin_ler on public.configuracao_comercial for select using ((select public.e_super_admin()));
create policy metas_comerciais_admin_ler on public.metas_comerciais for select using ((select public.e_super_admin()));

-- Administrador da plataforma com dois fatores: o dono (super_admin) e o gestor InstaBarber
-- (gestor_plataforma, D-161). O gestor faz tudo o que o dono faz, exceto gerir a equipa.
create or replace function public.e_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis
                 where user_id = auth.uid() and papel in ('super_admin','gestor_plataforma') and ativo)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- -----------------------------------------------------------------------------
-- 8E · Equipa InstaBarber (D-161): o dono gere as contas; o comercial trabalha os seus leads.
-- -----------------------------------------------------------------------------
-- Só o dono (super_admin com dois fatores): contas da equipa InstaBarber.
create or replace function public.e_dono_plataforma() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis
                 where user_id = auth.uid() and papel = 'super_admin' and ativo)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- Comercial com dois fatores.
create or replace function public.e_comercial() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis
                 where user_id = auth.uid() and papel = 'comercial' and ativo)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- Os leads de que o comercial é responsável (vazio para quem não é comercial).
create or replace function public.meus_leads() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select id from public.leads where responsavel_id = auth.uid() and public.e_comercial()
$$;

create or replace function public.lead_acessivel(p_lead uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.e_super_admin() or p_lead in (select public.meus_leads())
$$;

-- Para as políticas do Storage: a pasta leads/<id>/ de um lead acessível.
create or replace function public.pasta_lead_acessivel(p_nome text) returns boolean
language sql stable security definer set search_path = '' as $$
  select (storage.foldername(p_nome))[1] = 'leads'
     and exists (select 1 from public.leads l
                  where l.id::text = (storage.foldername(p_nome))[2]
                    and public.lead_acessivel(l.id))
$$;

create or replace function public.exigir_lead(p_lead uuid) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_lead is null or not public.lead_acessivel(p_lead) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
end $$;

-- Quem cria o lead fica registado; o lead criado por um comercial é dele. Pela API (não pelas
-- funções, que correm como dono das tabelas), o comercial não muda o estado, a barbearia
-- ligada, o responsável nem o autor. Sem security definer: current_user diz quem chama.
create or replace function public.preparar_lead() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.criado_por := coalesce(new.criado_por, auth.uid());
    if public.e_comercial() and not public.e_super_admin() then new.responsavel_id := auth.uid(); end if;
    return new;
  end if;
  if current_user = 'authenticated' and not public.e_super_admin()
     and (new.estado, new.inquilino_id, new.responsavel_id, new.criado_por)
         is distinct from (old.estado, old.inquilino_id, old.responsavel_id, old.criado_por) then
    raise exception 'campo_protegido' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger leads_preparar before insert or update on leads
  for each row execute function public.preparar_lead();

-- A carteira de um comercial: as barbearias dos leads que ganhou (D-161). Só colunas de
-- estado, nunca dados dos clientes da barbearia. O comercial vê só a sua.
create or replace function public.carteira_comercial(p_user uuid default null)
returns table (inquilino_id uuid, nome text, plano text, estado text, estado_pagamento text,
               aprovado_em timestamptz, lead_id uuid)
language plpgsql stable security definer set search_path = '' as $$
declare v_user uuid := coalesce(p_user, auth.uid());
begin
  if not (public.e_super_admin() or (public.e_comercial() and v_user = auth.uid())) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return query
    select i.id, i.nome, i.plano, i.estado, i.estado_pagamento, i.aprovado_em, l.id
      from public.leads l join public.inquilinos i on i.id = l.inquilino_id
     where l.responsavel_id = v_user
     order by i.nome;
end $$;

create or replace function public.exigir_comercial_ou_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.e_super_admin() or public.e_comercial()) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
end $$;

-- O texto final do contrato com o número, enquanto é rascunho (D-161): o comercial do lead
-- também o fixa, sem poder alterar o contrato diretamente.
create or replace function public.fixar_texto_contrato(p_contrato uuid, p_texto text) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'rascunho' then raise exception 'contrato_nao_e_rascunho' using errcode = 'P0001'; end if;
  if coalesce(trim(p_texto), '') = '' then raise exception 'texto_obrigatorio' using errcode = 'P0001'; end if;
  update public.contratos set texto = p_texto where id = p_contrato;
end $$;


-- Cria uma versão nova da proposta. As versões anteriores ainda abertas ficam «substituída».
-- Os preços chegam calculados por lib/regras/mensalidade.ts; as restrições da tabela conferem-nos.
-- Descontos e taxa de migração (D-161): só com o interruptor ligado em configuracao_comercial;
-- o comercial fica dentro dos limites; a taxa é a da configuração com o desconto aplicado.
create or replace function public.criar_proposta(p_lead uuid, p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_versao integer; v_id uuid; v_estado text;
  v_cfg public.configuracao_comercial%rowtype;
  v_desc numeric := coalesce((p ->> 'desconto_mensalidade_pct')::numeric, 0);
  v_taxa numeric := coalesce((p ->> 'taxa_migracao_sem_iva')::numeric, 0);
  v_desc_taxa numeric := coalesce((p ->> 'desconto_taxa_pct')::numeric, 0);
begin
  perform public.exigir_lead(p_lead);
  select * into v_cfg from public.configuracao_comercial;
  if v_desc > 0 and not coalesce(v_cfg.descontos_ativos, false) then
    raise exception 'descontos_desligados' using errcode = 'P0001';
  end if;
  if not coalesce(v_cfg.taxa_migracao_ativa, false) and (v_taxa <> 0 or v_desc_taxa <> 0) then
    raise exception 'taxa_migracao_desligada' using errcode = 'P0001';
  end if;
  if not public.e_super_admin() and (v_desc > v_cfg.desconto_max_mensalidade_pct
                                     or v_desc_taxa > v_cfg.desconto_max_taxa_pct) then
    raise exception 'desconto_acima_do_limite' using errcode = 'P0001';
  end if;
  if coalesce(v_cfg.taxa_migracao_ativa, false)
     and v_taxa <> round(v_cfg.taxa_migracao_sem_iva * (1 - v_desc_taxa / 100), 2) then
    raise exception 'taxa_migracao_invalida' using errcode = 'P0001';
  end if;
  select estado into v_estado from public.leads where id = p_lead for update;
  if v_estado is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_estado in ('ganho','perdido') then raise exception 'lead_fechado' using errcode = 'P0001'; end if;
  select coalesce(max(versao), 0) + 1 into v_versao from public.propostas where lead_id = p_lead;
  update public.propostas set estado = 'substituida' where lead_id = p_lead and estado in ('rascunho','enviada');
  insert into public.propostas (lead_id, numero, versao, plano, periodicidade, profissionais, dominio_proprio, desafio_90,
    mensalidade_sem_iva, valor_periodo_sem_iva, valor_periodo_com_iva, iva_taxa, condicoes_lancamento, validade_dias, dados,
    desconto_mensalidade_pct, taxa_migracao_sem_iva, desconto_taxa_pct, criado_por)
  values (p_lead, public.proximo_numero_comercial('PRP'), v_versao, p ->> 'plano',
    coalesce(p ->> 'periodicidade', 'mensal'), (p ->> 'profissionais')::integer,
    coalesce((p ->> 'dominio_proprio')::boolean, false), coalesce((p ->> 'desafio_90')::boolean, false),
    (p ->> 'mensalidade_sem_iva')::numeric, (p ->> 'valor_periodo_sem_iva')::numeric, (p ->> 'valor_periodo_com_iva')::numeric,
    coalesce((p ->> 'iva_taxa')::numeric, 23),
    nullif(p ->> 'condicoes_lancamento', ''), coalesce((p ->> 'validade_dias')::integer, 15),
    coalesce(p -> 'dados', '{}'), v_desc, v_taxa, v_desc_taxa, auth.uid())
  returning id into v_id;
  if v_estado in ('novo','contactado','demonstracao') then
    update public.leads set estado = 'proposta', atualizado_em = now() where id = p_lead;
  end if;
  perform public.evento_lead(p_lead, 'proposta', 'Proposta criada (versão ' || v_versao || ').', jsonb_build_object('proposta', v_id));
  return v_id;
end $$;

create or replace function public.proteger_inquilino() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
  v_protegidos text[] := array['slug','vertical','plano','periodicidade','profissionais_contratados',
                               'estado','estado_pagamento','proximo_vencimento','dominio_proprio',
                               'aprovado_em','criado_em','desconto_mensalidade_pct'];
begin
  if v_mudou && v_protegidos and not (public.e_super_admin() or public.e_sistema()) then
    raise exception 'campo_protegido' using errcode = '42501',
      detail = array_to_string(array(select unnest(v_mudou) intersect select unnest(v_protegidos)), ',');
  end if;
  return new;
end $$;

create or replace function public.auditar_inquilino() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
begin
  if v_mudou && array['plano','periodicidade','profissionais_contratados','estado','estado_pagamento',
                      'proximo_vencimento','dominio_proprio','slug','desconto_mensalidade_pct'] then
    perform public.registar_auditoria(new.id, 'inquilino_alterado', 'inquilinos', new.id,
      jsonb_build_object('campos', to_jsonb(v_mudou)));
  end if;
  return new;
end $$;

create or replace function public.registar_evento_lead(
  p_lead uuid, p_tipo text, p_texto text, p_proxima_acao text default null, p_proxima_acao_em date default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_lead(p_lead);
  if p_tipo not in ('nota','chamada','mensagem') then raise exception 'tipo_invalido' using errcode = 'P0001'; end if;
  if coalesce(trim(p_texto), '') = '' then raise exception 'texto_obrigatorio' using errcode = 'P0001'; end if;
  perform public.evento_lead(p_lead, p_tipo, p_texto);
  update public.leads
     set ultimo_contacto_em = now(), atualizado_em = now(),
         proxima_acao = p_proxima_acao, proxima_acao_em = p_proxima_acao_em
   where id = p_lead;
  if not found then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
end $$;

create or replace function public.mudar_estado_lead(p_lead uuid, p_estado text, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_atual text;
begin
  perform public.exigir_lead(p_lead);
  if p_estado not in ('novo','contactado','demonstracao','proposta','perdido') then
    raise exception 'estado_invalido' using errcode = 'P0001';
  end if;
  select estado into v_atual from public.leads where id = p_lead for update;
  if v_atual is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_atual = 'ganho' then raise exception 'lead_ganho_e_final' using errcode = 'P0001'; end if;
  if p_estado = 'perdido' and coalesce(trim(p_motivo), '') = '' then
    raise exception 'motivo_obrigatorio' using errcode = 'P0001';
  end if;
  update public.leads
     set estado = p_estado,
         motivo_perda = case when p_estado = 'perdido' then p_motivo else null end,
         atualizado_em = now()
   where id = p_lead;
  perform public.evento_lead(p_lead, 'estado', null, jsonb_build_object('de', v_atual, 'para', p_estado, 'motivo', p_motivo));
end $$;

create or replace function public.proteger_proposta() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado <> 'rascunho' and (
       new.plano, new.periodicidade, new.profissionais, new.dominio_proprio, new.desafio_90,
       new.mensalidade_sem_iva, new.valor_periodo_sem_iva, new.valor_periodo_com_iva,
       new.condicoes_lancamento, new.validade_dias, new.dados, new.desconto_mensalidade_pct,
       new.taxa_migracao_sem_iva, new.desconto_taxa_pct, new.numero, new.versao, new.lead_id)
     is distinct from (
       old.plano, old.periodicidade, old.profissionais, old.dominio_proprio, old.desafio_90,
       old.mensalidade_sem_iva, old.valor_periodo_sem_iva, old.valor_periodo_com_iva,
       old.condicoes_lancamento, old.validade_dias, old.dados, old.desconto_mensalidade_pct,
       old.taxa_migracao_sem_iva, old.desconto_taxa_pct, old.numero, old.versao, old.lead_id) then
    raise exception 'proposta_imutavel' using errcode = 'P0001';
  end if;
  return new;
end $$;

create or replace function public.marcar_proposta_enviada(p_proposta uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.propostas%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.propostas where id = p_proposta for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'proposta_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'rascunho' then raise exception 'proposta_nao_e_rascunho' using errcode = 'P0001'; end if;
  update public.propostas
     set estado = 'enviada', enviada_em = now(), valida_ate = public.hoje_lisboa() + validade_dias
   where id = p_proposta;
  perform public.evento_lead(v.lead_id, 'proposta', 'Proposta ' || v.numero || ' enviada.', jsonb_build_object('proposta', p_proposta));
end $$;

create or replace function public.decidir_proposta(p_proposta uuid, p_aceite boolean, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.propostas%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.propostas where id = p_proposta for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'proposta_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'enviada' then raise exception 'proposta_nao_enviada' using errcode = 'P0001'; end if;
  if v.valida_ate < public.hoje_lisboa() then raise exception 'proposta_expirada' using errcode = 'P0001'; end if;
  if not p_aceite and coalesce(trim(p_motivo), '') = '' then raise exception 'motivo_obrigatorio' using errcode = 'P0001'; end if;
  update public.propostas
     set estado = case when p_aceite then 'aceite' else 'recusada' end,
         decidida_em = now(), motivo_recusa = case when p_aceite then null else p_motivo end
   where id = p_proposta;
  perform public.evento_lead(v.lead_id, 'proposta',
    'Proposta ' || v.numero || case when p_aceite then ' aceite.' else ' recusada.' end,
    jsonb_build_object('proposta', p_proposta, 'motivo', p_motivo));
end $$;

create or replace function public.marcar_contrato_enviado(p_contrato uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'rascunho' then raise exception 'contrato_nao_e_rascunho' using errcode = 'P0001'; end if;
  update public.contratos set estado = 'enviado' where id = p_contrato;
  perform public.evento_lead(v.lead_id, 'contrato', 'Contrato enviado para assinatura.', jsonb_build_object('contrato', p_contrato));
end $$;

create or replace function public.assinar_contrato(p_contrato uuid, p_data date, p_pdf_assinado text, p_inicio date default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('rascunho','enviado') then raise exception 'contrato_nao_assinavel' using errcode = 'P0001'; end if;
  if p_data is null or coalesce(trim(p_pdf_assinado), '') = '' then
    raise exception 'assinatura_incompleta' using errcode = 'P0001';
  end if;
  update public.contratos
     set estado = 'assinado', assinado_em = p_data, pdf_assinado_path = p_pdf_assinado,
         data_inicio = coalesce(p_inicio, data_inicio)
   where id = p_contrato;
  update public.leads set estado = 'ganho', motivo_perda = null, atualizado_em = now() where id = v.lead_id;
  perform public.evento_lead(v.lead_id, 'contrato', 'Contrato ' || v.numero || ' assinado.', jsonb_build_object('contrato', p_contrato));
  perform public.registar_auditoria(null, 'contrato_assinado', 'contratos', p_contrato, jsonb_build_object('numero', v.numero));
end $$;

create or replace function public.criar_convite_adesao(p_contrato uuid, p_token text, p_dados jsonb, p_dias integer default 14)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype; v_id uuid;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null or v.estado <> 'assinado' then raise exception 'contrato_nao_assinado' using errcode = 'P0001'; end if;
  if p_token is null or length(p_token) < 32 then raise exception 'token_fraco' using errcode = 'P0001'; end if;
  if p_dados ? 'palavra_passe' or p_dados ? 'password' then raise exception 'campo_proibido' using errcode = 'P0001'; end if;
  update public.convites_adesao set expira_em = now() where contrato_id = p_contrato and usado_em is null and expira_em > now();
  insert into public.convites_adesao (contrato_id, token_hash, dados, expira_em)
  values (p_contrato, encode(sha256(convert_to(p_token, 'UTF8')), 'hex'), p_dados, now() + make_interval(days => p_dias))
  returning id into v_id;
  perform public.evento_lead(v.lead_id, 'contrato', 'Convite de adesão criado.', jsonb_build_object('convite', v_id));
  return v_id;
end $$;

create or replace function public.gerar_contrato(p_proposta uuid, p_modelo uuid, p_dados jsonb, p_texto text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_prop public.propostas%rowtype; v_mod public.modelos_documento%rowtype; v_id uuid;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v_prop from public.propostas where id = p_proposta for update;
  if v_prop.id is not null then perform public.exigir_lead(v_prop.lead_id); end if;
  if v_prop.id is null then raise exception 'proposta_inexistente' using errcode = 'P0001'; end if;
  if v_prop.estado <> 'aceite' then raise exception 'proposta_nao_aceite' using errcode = 'P0001'; end if;
  select * into v_mod from public.modelos_documento where id = p_modelo;
  if v_mod.id is null or v_mod.tipo <> 'contrato' then raise exception 'modelo_invalido' using errcode = 'P0001'; end if;
  if v_mod.estado <> 'aprovado' then raise exception 'modelo_nao_aprovado' using errcode = 'P0001'; end if;
  if coalesce(trim(p_dados ->> 'razao_social'), '') = '' or coalesce(trim(p_dados ->> 'morada'), '') = ''
     or coalesce(trim(p_dados ->> 'representante'), '') = '' then
    raise exception 'dados_contratante_em_falta' using errcode = 'P0001';
  end if;
  if not public.nif_valido(p_dados ->> 'nif') then raise exception 'nif_invalido' using errcode = 'P0001'; end if;
  if exists (select 1 from public.contratos where proposta_id = p_proposta and estado in ('assinado')) then
    raise exception 'contrato_ja_assinado' using errcode = 'P0001';
  end if;
  update public.contratos set estado = 'cancelado'
   where proposta_id = p_proposta and estado in ('rascunho','enviado');
  insert into public.contratos (proposta_id, lead_id, modelo_id, numero, dados, texto, criado_por)
  values (p_proposta, v_prop.lead_id, p_modelo, public.proximo_numero_comercial('CTR'), p_dados, p_texto, auth.uid())
  returning id into v_id;
  perform public.evento_lead(v_prop.lead_id, 'contrato', 'Contrato gerado a partir da proposta ' || v_prop.numero || '.',
    jsonb_build_object('contrato', v_id));
  return v_id;
end $$;

create or replace function public.ligar_contrato_inquilino(p_contrato uuid, p_inquilino uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is null or v.estado <> 'assinado' then raise exception 'contrato_nao_assinado' using errcode = 'P0001'; end if;
  update public.contratos set inquilino_id = p_inquilino, data_inicio = coalesce(data_inicio, public.hoje_lisboa()) where id = p_contrato;
  update public.leads set inquilino_id = p_inquilino where id = v.lead_id;
  -- O desconto da proposta aceite passa para a mensalidade da barbearia (D-161).
  update public.inquilinos
     set desconto_mensalidade_pct = (select desconto_mensalidade_pct from public.propostas where id = v.proposta_id)
   where id = p_inquilino;
  perform public.evento_lead(v.lead_id, 'contrato', 'Barbearia criada e ligada ao contrato.', jsonb_build_object('inquilino', p_inquilino));
end $$;

drop policy perfis_escrever on perfis;

-- Equipa InstaBarber (D-161). Os perfis das barbearias escrevem-se pelos administradores; os
-- da equipa InstaBarber só pelo dono. O comercial trabalha só os leads de que é responsável.
create policy perfis_escrever_barbearia on perfis for all
  using (inquilino_id is not null and (select public.e_super_admin()))
  with check (inquilino_id is not null and (select public.e_super_admin()));
create policy perfis_escrever_plataforma on perfis for all
  using (inquilino_id is null and (select public.e_dono_plataforma()))
  with check (inquilino_id is null and (select public.e_dono_plataforma()));

-- Na própria linha (e não por meus_leads()), para o comercial ler o lead que acabou de criar.
create policy leads_comercial_ler on leads for select
  using (responsavel_id = (select auth.uid()) and (select public.e_comercial()));
create policy leads_comercial_criar on leads for insert
  with check ((select public.e_comercial()) and responsavel_id = (select auth.uid()));
create policy leads_comercial_alterar on leads for update
  using (responsavel_id = (select auth.uid()) and (select public.e_comercial()))
  with check (responsavel_id = (select auth.uid()));
create policy lead_eventos_comercial_ler on lead_eventos for select
  using (lead_id in (select public.meus_leads()));
create policy lead_eventos_comercial_criar on lead_eventos for insert
  with check (lead_id in (select public.meus_leads()) and criado_por = (select auth.uid()));
create policy briefings_comercial on briefings for all
  using (lead_id in (select public.meus_leads()))
  with check (lead_id in (select public.meus_leads()));
create policy propostas_comercial_ler on propostas for select
  using (lead_id in (select public.meus_leads()));
create policy contratos_comercial_ler on contratos for select
  using (lead_id in (select public.meus_leads()));
create policy modelos_comercial_ler on modelos_documento for select
  using (estado = 'aprovado' and (select public.e_comercial()));

create policy configuracao_comercial_admin on configuracao_comercial for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy configuracao_comercial_ler on configuracao_comercial for select
  using ((select public.e_comercial()));
create policy metas_comerciais_admin on metas_comerciais for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy metas_comerciais_ler on metas_comerciais for select
  using (user_id = (select auth.uid()) and (select public.e_comercial()));

create policy storage_comercial_leads on storage.objects for all
  using (bucket_id = 'comercial' and (select public.e_comercial()) and public.pasta_lead_acessivel(name))
  with check (bucket_id = 'comercial' and (select public.e_comercial()) and public.pasta_lead_acessivel(name));

-- Equipa InstaBarber (D-161): cada função verifica o papel.
revoke all on function public.preparar_lead(), public.exigir_lead(uuid),
  public.exigir_comercial_ou_admin() from public, anon, authenticated;
grant execute on function public.fixar_texto_contrato(uuid, text), public.e_dono_plataforma(),
  public.e_comercial(), public.meus_leads(),
  public.lead_acessivel(uuid), public.pasta_lead_acessivel(text), public.carteira_comercial(uuid)
  to authenticated;
