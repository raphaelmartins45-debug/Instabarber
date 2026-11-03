-- Campanhas comerciais e periodicidade semestral (D-190).
-- A Performa LAB liga campanhas (condições especiais) que o comercial escolhe na proposta: meses
-- de oferta no primeiro período, primeiro mês grátis, preço especial da implementação e
-- condições temporárias (desconto, profissionais, domínio). Acompanham a barbearia e contam
-- desde o primeiro pagamento. Nova periodicidade: semestral (seis mensalidades de uma vez).

-- 1 · A tabela das campanhas
-- Campanhas comerciais (D-190): condições especiais que a Performa LAB liga e o comercial
-- escolhe na proposta. Cada uma fixa o que oferece; a base de dados confere a proposta.
create table public.campanhas_comerciais (
  id                      uuid primary key default gen_random_uuid(),
  chave                   text not null unique check (chave ~ '^[a-z0-9_]+$'),
  nome                    text not null check (length(trim(nome)) between 3 and 80),
  -- O texto que aparece na proposta, no contrato e em «O meu plano»
  texto                   text not null check (length(trim(texto)) between 10 and 600),
  ativa                   boolean not null default false,
  valida_ate              date,
  vagas                   integer check (vagas is null or vagas > 0),
  ordem                   integer not null default 0,
  planos                  text[] not null default '{basic,pro}' check (planos <@ array['basic','pro'] and cardinality(planos) > 0),
  periodicidade           text check (periodicidade in ('mensal','semestral','anual')),
  -- Implementação: o pacote que a campanha fixa e o preço sem IVA (nulo = preço normal; 0 = oferta)
  implementacao           text check (implementacao in ('nenhuma','essencial','formacao')),
  implementacao_sem_iva   numeric(10,2) check (implementacao_sem_iva >= 0),
  -- Meses de oferta somados ao primeiro período pago (Anual 14: 12 pagos + 2)
  meses_oferta            integer not null default 0 check (meses_oferta between 0 and 12),
  -- O primeiro mês não paga mensalidade (paga-se só a implementação)
  primeiro_mes_gratis     boolean not null default false,
  -- Condição temporária, contada desde o primeiro pagamento: desconto, profissionais e domínio
  meses_condicao          integer not null default 0 check (meses_condicao between 0 and 24),
  desconto_temporario_pct numeric(5,2) not null default 0 check (desconto_temporario_pct between 0 and 100),
  profissionais_gratis    integer not null default 0 check (profissionais_gratis between 0 and 10),
  dominio_gratis          boolean not null default false,
  criado_em               timestamptz not null default now(),
  check (implementacao_sem_iva is null or implementacao is not null),
  check ((meses_condicao > 0) = (desconto_temporario_pct > 0 or profissionais_gratis > 0 or dominio_gratis)),
  check (not primeiro_mes_gratis or periodicidade = 'mensal')
);
alter table public.campanhas_comerciais enable row level security;
create policy campanhas_admin on public.campanhas_comerciais for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy campanhas_ler on public.campanhas_comerciais for select
  using ((select public.e_comercial()));
-- Leitura total do super_admin, como em todas as tabelas (03_rls.sql, política *_admin_ler).
create policy campanhas_comerciais_admin_ler on public.campanhas_comerciais for select
  using ((select public.e_super_admin()));
-- Campanhas comerciais de partida (D-190), todas desligadas: a Performa LAB liga as que quiser.
insert into public.campanhas_comerciais (chave, nome, texto, ordem, planos, periodicidade, implementacao,
  implementacao_sem_iva, meses_oferta, primeiro_mes_gratis, meses_condicao, desconto_temporario_pct,
  profissionais_gratis, dominio_gratis) values
  ('anual14_pro', 'Anual 14', 'Paga o anual e usa 14 meses: aos 12 meses do ano juntamos 2 meses de oferta. A Implementação Essencial é por nossa conta.',
   10, '{pro}', 'anual', 'essencial', 0, 2, false, 0, 0, 0, false),
  ('anual14_basic', 'Anual 14', 'Paga o anual e usa 14 meses: aos 12 meses do ano juntamos 2 meses de oferta. Implementação Essencial a 50 €.',
   11, '{basic}', 'anual', 'essencial', 50, 2, false, 0, 0, 0, false),
  ('semestral', 'Semestral com implementação', 'Paga seis meses de uma vez e a Implementação Essencial é por nossa conta.',
   20, '{basic,pro}', 'semestral', 'essencial', 0, 0, false, 0, 0, 0, false),
  ('primeiro_mes', 'Primeiro mês por nossa conta', 'Paga só a Implementação Essencial (50 €) e o primeiro mês é de oferta. Depois, a mensalidade normal.',
   30, '{basic,pro}', 'mensal', 'essencial', 50, 0, true, 0, 0, 0, false),
  ('muda_ja', 'Muda já', 'Vem de outro sistema? A Implementação com Formação ao preço da Essencial (50 €): importamos os seus clientes, levamos o expositor e formamos a equipa.',
   40, '{basic,pro}', null, 'formacao', 50, 0, false, 0, 0, 0, false),
  ('sobe_pro', 'Sobe para Pro', 'O Pro completo a metade do preço nos três primeiros meses.',
   50, '{pro}', 'mensal', null, null, 0, false, 3, 50, 0, false),
  ('equipa_crescer', 'Equipa a crescer', 'O quarto profissional é de oferta nos primeiros seis meses.',
   60, '{pro}', null, null, null, 0, false, 6, 0, 1, false),
  ('dominio_oferta', 'Domínio de oferta', 'O domínio próprio é por nossa conta no primeiro ano.',
   70, '{basic,pro}', 'anual', null, null, 0, false, 12, 0, 0, true)
on conflict (chave) do nothing;

-- 2 · Semestral nas barbearias, nas propostas e nos pedidos
alter table public.inquilinos drop constraint inquilinos_periodicidade_check,
  add constraint inquilinos_periodicidade_check check (periodicidade in ('mensal','semestral','anual'));
alter table public.propostas drop constraint propostas_periodicidade_check,
  add constraint propostas_periodicidade_check check (periodicidade in ('mensal','semestral','anual'));
alter table public.pedidos_adesao drop constraint pedidos_adesao_periodicidade_check,
  add constraint pedidos_adesao_periodicidade_check check (periodicidade in ('mensal','semestral','anual'));

-- 3 · A campanha na proposta, com a comissão do comercial fixada na criação
alter table public.propostas
  add column campanha_id uuid references public.campanhas_comerciais(id) on delete restrict,
  add column comissao_sem_iva numeric(10,2) not null default 0 check (comissao_sem_iva >= 0);
update public.propostas set comissao_sem_iva = round(taxa_migracao_sem_iva * 0.5, 2);
drop view public.propostas_com_estado;
create view public.propostas_com_estado with (security_invoker = true) as
  select p.*,
         case when p.estado = 'enviada' and p.valida_ate < (now() at time zone 'Europe/Lisbon')::date
              then 'expirada' else p.estado end as estado_efetivo
    from public.propostas p;

-- 4 · A campanha na barbearia e o primeiro pagamento (campos protegidos)
alter table public.inquilinos
  add column campanha_id uuid references public.campanhas_comerciais(id) on delete restrict,
  add column campanha_ate date,
  add column primeiro_pagamento_em date;
update public.inquilinos i set primeiro_pagamento_em = (select min(r.data) from public.recebimentos r where r.inquilino_id = i.id);

-- 5 · Funções
-- Campos do inquilino que só a Performa LAB altera (B2, D.3).
create or replace function public.proteger_inquilino() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
  v_protegidos text[] := array['slug','vertical','plano','periodicidade','profissionais_contratados',
                               'estado','estado_pagamento','proximo_vencimento','dominio_proprio',
                               'aprovado_em','criado_em','desconto_mensalidade_pct',
                               'implementacao','implementacao_sem_iva','implementacao_paga_em',
                               'cortesia','cortesia_ate','campanha_id','campanha_ate',
                               'primeiro_pagamento_em'];
begin
  if v_mudou && v_protegidos and not (public.e_super_admin() or public.e_sistema()) then
    raise exception 'campo_protegido' using errcode = '42501',
      detail = array_to_string(array(select unnest(v_mudou) intersect select unnest(v_protegidos)), ',');
  end if;
  return new;
end $$;

-- Regista em auditoria as alterações aos campos protegidos (plano, estado…).
create or replace function public.auditar_inquilino() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
begin
  if v_mudou && array['plano','periodicidade','profissionais_contratados','estado','estado_pagamento',
                      'proximo_vencimento','dominio_proprio','slug','desconto_mensalidade_pct',
                      'implementacao','implementacao_sem_iva','implementacao_paga_em',
                      'cortesia','cortesia_ate','campanha_id','campanha_ate'] then
    perform public.registar_auditoria(new.id, 'inquilino_alterado', 'inquilinos', new.id,
      jsonb_build_object('campos', to_jsonb(v_mudou)));
  end if;
  return new;
end $$;

-- Uma campanha (D-190) serve para uma proposta se estiver ligada, dentro da data, com vagas e
-- for para o plano e a periodicidade escolhidos.
create or replace function public.campanha_disponivel(p_campanha uuid, p_plano text, p_periodicidade text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.campanhas_comerciais c
     where c.id = p_campanha and c.ativa
       and (c.valida_ate is null or c.valida_ate >= public.hoje_lisboa())
       and p_plano = any (c.planos)
       and (c.periodicidade is null or c.periodicidade = p_periodicidade)
       and (c.vagas is null or (select count(*) from public.inquilinos i where i.campanha_id = c.id) < c.vagas));
$$;

-- Cria uma versão nova da proposta. As versões anteriores ainda abertas ficam «substituída».
-- Os preços chegam calculados por lib/regras/mensalidade.ts; as restrições da tabela conferem-nos.
-- A implementação (D-189) é «nenhuma», «essencial» ou «formacao»: o valor (guardado em
-- taxa_migracao_sem_iva) tem de ser o preço do pacote na configuração, com o desconto da taxa.
-- Uma campanha (D-190) pode fixar o pacote e o preço da implementação; a comissão do comercial é
-- então metade do preço normal do pacote (a InstaBarber paga-a como custo de venda).
create or replace function public.criar_proposta(p_lead uuid, p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_versao integer; v_id uuid; v_estado text;
  v_cfg public.configuracao_comercial%rowtype;
  v_camp public.campanhas_comerciais%rowtype;
  v_campanha uuid := nullif(p ->> 'campanha_id', '')::uuid;
  v_desc numeric := coalesce((p ->> 'desconto_mensalidade_pct')::numeric, 0);
  v_taxa numeric := coalesce((p ->> 'taxa_migracao_sem_iva')::numeric, 0);
  v_desc_taxa numeric := coalesce((p ->> 'desconto_taxa_pct')::numeric, 0);
  v_impl text := coalesce(nullif(p ->> 'implementacao', ''),
                          case when v_taxa = 0 and v_desc_taxa = 0 then 'nenhuma' end);
  v_base numeric; v_comissao numeric;
begin
  perform public.exigir_lead(p_lead);
  select * into v_cfg from public.configuracao_comercial;
  if v_desc > 0 and not coalesce(v_cfg.descontos_ativos, false) then
    raise exception 'descontos_desligados' using errcode = 'P0001';
  end if;
  if v_campanha is not null then
    if not public.campanha_disponivel(v_campanha, p ->> 'plano', coalesce(p ->> 'periodicidade', 'mensal')) then
      raise exception 'campanha_invalida' using errcode = 'P0001';
    end if;
    select * into v_camp from public.campanhas_comerciais where id = v_campanha;
  end if;
  if v_impl is null or v_impl not in ('nenhuma','essencial','formacao')
     or (v_impl = 'nenhuma' and (v_taxa <> 0 or v_desc_taxa <> 0))
     or (v_camp.implementacao is not null and v_impl <> v_camp.implementacao) then
    raise exception 'implementacao_invalida' using errcode = 'P0001';
  end if;
  v_base := case v_impl when 'essencial' then v_cfg.implementacao_essencial_sem_iva
                        when 'formacao' then v_cfg.implementacao_formacao_sem_iva else 0 end;
  if v_camp.implementacao_sem_iva is not null then
    -- O preço da campanha não leva desconto do comercial.
    if v_taxa <> v_camp.implementacao_sem_iva or v_desc_taxa <> 0 then
      raise exception 'taxa_migracao_invalida' using errcode = 'P0001';
    end if;
    v_comissao := round(v_base * 0.5, 2);
  else
    if not coalesce(v_cfg.taxa_migracao_ativa, false) and v_impl <> 'nenhuma' then
      raise exception 'taxa_migracao_desligada' using errcode = 'P0001';
    end if;
    if v_impl <> 'nenhuma' and v_taxa <> round(v_base * (1 - v_desc_taxa / 100), 2) then
      raise exception 'taxa_migracao_invalida' using errcode = 'P0001';
    end if;
    v_comissao := round(v_taxa * 0.5, 2);
  end if;
  if not public.e_super_admin() and (v_desc > v_cfg.desconto_max_mensalidade_pct
                                     or v_desc_taxa > v_cfg.desconto_max_taxa_pct) then
    raise exception 'desconto_acima_do_limite' using errcode = 'P0001';
  end if;
  select estado into v_estado from public.leads where id = p_lead for update;
  if v_estado is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_estado in ('ganho','perdido') then raise exception 'lead_fechado' using errcode = 'P0001'; end if;
  select coalesce(max(versao), 0) + 1 into v_versao from public.propostas where lead_id = p_lead;
  update public.propostas set estado = 'substituida' where lead_id = p_lead and estado in ('rascunho','enviada');
  insert into public.propostas (lead_id, numero, versao, plano, periodicidade, profissionais, dominio_proprio, desafio_90,
    mensalidade_sem_iva, valor_periodo_sem_iva, valor_periodo_com_iva, iva_taxa, condicoes_lancamento, validade_dias, dados,
    desconto_mensalidade_pct, implementacao, taxa_migracao_sem_iva, desconto_taxa_pct, campanha_id,
    comissao_sem_iva, criado_por)
  values (p_lead, public.proximo_numero_comercial('PRP'), v_versao, p ->> 'plano',
    coalesce(p ->> 'periodicidade', 'mensal'), (p ->> 'profissionais')::integer,
    coalesce((p ->> 'dominio_proprio')::boolean, false), coalesce((p ->> 'desafio_90')::boolean, false),
    (p ->> 'mensalidade_sem_iva')::numeric, (p ->> 'valor_periodo_sem_iva')::numeric, (p ->> 'valor_periodo_com_iva')::numeric,
    coalesce((p ->> 'iva_taxa')::numeric, 23),
    nullif(p ->> 'condicoes_lancamento', ''), coalesce((p ->> 'validade_dias')::integer, 15),
    coalesce(p -> 'dados', '{}'), v_desc, v_impl, v_taxa, v_desc_taxa, v_campanha, v_comissao, auth.uid())
  returning id into v_id;
  if v_estado in ('novo','contactado','demonstracao') then
    update public.leads set estado = 'proposta', atualizado_em = now() where id = p_lead;
  end if;
  perform public.evento_lead(p_lead, 'proposta', 'Proposta criada (versão ' || v_versao || ').', jsonb_build_object('proposta', v_id));
  return v_id;
end $$;

-- Depois de enviada, a proposta não muda de preço nem de conteúdo: faz-se uma versão nova.
create or replace function public.proteger_proposta() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado <> 'rascunho' and (
       new.plano, new.periodicidade, new.profissionais, new.dominio_proprio, new.desafio_90,
       new.mensalidade_sem_iva, new.valor_periodo_sem_iva, new.valor_periodo_com_iva,
       new.condicoes_lancamento, new.validade_dias, new.dados, new.desconto_mensalidade_pct,
       new.implementacao, new.taxa_migracao_sem_iva, new.desconto_taxa_pct, new.campanha_id,
       new.comissao_sem_iva, new.numero, new.versao, new.lead_id)
     is distinct from (
       old.plano, old.periodicidade, old.profissionais, old.dominio_proprio, old.desafio_90,
       old.mensalidade_sem_iva, old.valor_periodo_sem_iva, old.valor_periodo_com_iva,
       old.condicoes_lancamento, old.validade_dias, old.dados, old.desconto_mensalidade_pct,
       old.implementacao, old.taxa_migracao_sem_iva, old.desconto_taxa_pct, old.campanha_id,
       old.comissao_sem_iva, old.numero, old.versao, old.lead_id) then
    raise exception 'proposta_imutavel' using errcode = 'P0001';
  end if;
  return new;
end $$;

-- Assinar fecha o negócio: o lead passa a «ganho». Exige o PDF assinado.
create or replace function public.assinar_contrato(p_contrato uuid, p_data date, p_pdf_assinado text, p_inicio date default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('rascunho','enviado','carregado') then raise exception 'contrato_nao_assinavel' using errcode = 'P0001'; end if;
  if p_data is null or coalesce(trim(p_pdf_assinado), '') = '' then
    raise exception 'assinatura_incompleta' using errcode = 'P0001';
  end if;
  update public.contratos
     set estado = 'assinado', assinado_em = p_data, pdf_assinado_path = p_pdf_assinado,
         data_inicio = coalesce(p_inicio, data_inicio), envio_token_hash = null
   where id = p_contrato;
  update public.leads set estado = 'ganho', motivo_perda = null, atualizado_em = now() where id = v.lead_id;
  perform public.evento_lead(v.lead_id, 'contrato', 'Contrato ' || v.numero || ' assinado.', jsonb_build_object('contrato', p_contrato));
  perform public.registar_auditoria(null, 'contrato_assinado', 'contratos', p_contrato, jsonb_build_object('numero', v.numero));
  -- A comissão do comercial responsável, se estiver ativo (D-162, D-189, D-190): metade da
  -- implementação cobrada, ou do preço normal do pacote quando uma campanha o oferece.
  insert into public.comissoes_comerciais (contrato_id, comercial_id, valor)
  select v.id, l.responsavel_id, p.comissao_sem_iva
    from public.leads l join public.propostas p on p.id = v.proposta_id
   where l.id = v.lead_id and p.comissao_sem_iva > 0
     and exists (select 1 from public.perfis pf
                  where pf.user_id = l.responsavel_id and pf.papel = 'comercial' and pf.ativo
                    and pf.inquilino_id is null)
  on conflict (contrato_id) do nothing;
end $$;

-- Na aprovação do pedido, liga o contrato à barbearia criada.
create or replace function public.ligar_contrato_inquilino(p_contrato uuid, p_inquilino uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is null or v.estado <> 'assinado' then raise exception 'contrato_nao_assinado' using errcode = 'P0001'; end if;
  update public.contratos set inquilino_id = p_inquilino, data_inicio = coalesce(data_inicio, public.hoje_lisboa()) where id = p_contrato;
  update public.leads set inquilino_id = p_inquilino where id = v.lead_id;
  -- O desconto da proposta aceite passa para a mensalidade da barbearia (D-161), a
  -- implementação contratada fica por cobrar no primeiro pagamento (D-189) e a campanha
  -- (D-190) acompanha a barbearia, com a periodicidade da proposta.
  update public.inquilinos i
     set desconto_mensalidade_pct = p.desconto_mensalidade_pct,
         implementacao = p.implementacao,
         implementacao_sem_iva = p.taxa_migracao_sem_iva,
         campanha_id = p.campanha_id,
         periodicidade = case when p.campanha_id is not null then p.periodicidade else i.periodicidade end
    from public.propostas p
   where p.id = v.proposta_id and i.id = p_inquilino;
  perform public.evento_lead(v.lead_id, 'contrato', 'Barbearia criada e ligada ao contrato.', jsonb_build_object('inquilino', p_inquilino));
end $$;

-- O período que a barbearia está a pagar: a fatura mais antiga por pagar ou, sem ela, o período
-- que começa no próximo vencimento (ou hoje, se ainda não houver), de um mês, de seis meses ou de
-- um ano. No primeiro pagamento, os meses de oferta da campanha (D-190) juntam-se ao período.
create or replace function public.periodo_a_pagar(p_inquilino uuid)
returns table (inicio date, fim date, fatura_id uuid, valor_fatura numeric)
language plpgsql stable security definer set search_path = '' as $$
declare v_inicio date; v_per text; v_oferta integer;
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
  select coalesce(i.proximo_vencimento, public.hoje_lisboa()), i.periodicidade,
         case when i.primeiro_pagamento_em is null then coalesce(c.meses_oferta, 0) else 0 end
    into v_inicio, v_per, v_oferta
    from public.inquilinos i left join public.campanhas_comerciais c on c.id = i.campanha_id
   where i.id = p_inquilino;
  return query select v_inicio,
    (v_inicio + case v_per when 'anual' then interval '1 year' when 'semestral' then interval '6 months'
                           else interval '1 month' end
              + make_interval(months => v_oferta))::date - 1,
    null::uuid, null::numeric;
end $$;

-- A Performa LAB aprova: regista o recebimento, marca a fatura paga, põe a barbearia em dia,
-- avança o próximo vencimento para o dia a seguir ao período pago e, se estava suspensa por falta
-- de pagamento (M.4), reativa-a. O primeiro pagamento leva também a implementação por cobrar
-- (D-189), fica guardado e começa a contar a condição temporária da campanha (D-190); a comissão
-- do comercial passa a «a pagar», com vencimento 10 dias depois.
create or replace function public.aprovar_comprovativo(p_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.comprovativos_pagamento%rowtype; v_rec uuid; i public.inquilinos%rowtype;
        v_impl numeric := 0; v_primeiro boolean; v_meses integer;
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select * into c from public.comprovativos_pagamento where id = p_id for update;
  if not found or c.estado <> 'pendente' then raise exception 'ja_decidido' using errcode = 'P0001'; end if;
  select * into i from public.inquilinos where id = c.inquilino_id for update;
  v_primeiro := i.primeiro_pagamento_em is null;
  if i.implementacao <> 'nenhuma' and i.implementacao_paga_em is null and i.implementacao_sem_iva > 0 then
    v_impl := i.implementacao_sem_iva;
  end if;
  select coalesce(meses_condicao, 0) into v_meses from public.campanhas_comerciais where id = i.campanha_id;
  insert into public.recebimentos (inquilino_id, fatura_id, valor, metodo, data, nota, registado_por)
  values (c.inquilino_id, c.fatura_id, c.valor, c.metodo, c.pago_em, 'Comprovativo aprovado', auth.uid())
  returning id into v_rec;
  if c.fatura_id is not null then
    update public.faturas_plataforma set paga_em = c.pago_em where id = c.fatura_id and paga_em is null;
  end if;
  update public.inquilinos
     set estado_pagamento = 'em_dia',
         proximo_vencimento = greatest(coalesce(i.proximo_vencimento, c.periodo_fim + 1), c.periodo_fim + 1),
         estado = case when i.estado = 'suspenso' then 'ativo' else i.estado end,
         implementacao_paga_em = case when i.implementacao <> 'nenhuma' and i.implementacao_paga_em is null
                                      then c.pago_em else i.implementacao_paga_em end,
         primeiro_pagamento_em = coalesce(i.primeiro_pagamento_em, c.pago_em),
         campanha_ate = case when v_primeiro and coalesce(v_meses, 0) > 0
                             then (c.periodo_inicio + make_interval(months => v_meses))::date - 1
                             else i.campanha_ate end
   where id = c.inquilino_id;
  if v_primeiro then
    update public.comissoes_comerciais k
       set estado = 'a_pagar', taxa_paga_em = c.pago_em, vence_em = c.pago_em + 10
      from public.contratos ct
     where k.contrato_id = ct.id and ct.inquilino_id = c.inquilino_id and k.estado = 'pendente';
  end if;
  update public.comprovativos_pagamento
     set estado = 'aprovado', decidido_por = auth.uid(), decidido_em = now(), recebimento_id = v_rec,
         implementacao_sem_iva = v_impl
   where id = p_id;
  perform public.registar_auditoria(c.inquilino_id, 'comprovativo_aprovado', 'comprovativos_pagamento', p_id,
    jsonb_build_object('valor', c.valor, 'recebimento', v_rec, 'implementacao', v_impl));
  return v_rec;
end $$;

-- A campanha de uma barbearia registada no painel (D-190), antes do primeiro pagamento: fixa a
-- periodicidade e, se a campanha o disser, o pacote e o preço da implementação.
create or replace function public.definir_campanha(p_inquilino uuid, p_campanha uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.campanhas_comerciais%rowtype; v_cfg public.configuracao_comercial%rowtype;
begin
  perform public.exigir_super_admin();
  if p_campanha is not null then
    select * into v from public.campanhas_comerciais where id = p_campanha;
    if not found then raise exception 'campanha_invalida' using errcode = 'P0001'; end if;
  end if;
  select * into v_cfg from public.configuracao_comercial;
  update public.inquilinos i
     set campanha_id = p_campanha,
         periodicidade = coalesce(v.periodicidade, i.periodicidade),
         implementacao = coalesce(v.implementacao, i.implementacao),
         implementacao_sem_iva = case
           when v.implementacao is null then i.implementacao_sem_iva
           when v.implementacao_sem_iva is not null then v.implementacao_sem_iva
           when v.implementacao = 'formacao' then v_cfg.implementacao_formacao_sem_iva
           else v_cfg.implementacao_essencial_sem_iva end
   where i.id = p_inquilino and i.primeiro_pagamento_em is null
     and (p_campanha is null or i.plano = any (v.planos));
  if not found then raise exception 'campanha_invalida' using errcode = 'P0001'; end if;
end $$;

-- A campanha da própria barbearia (D-190), para «O meu plano» calcular o valor e mostrar a
-- condição: só o dono dessa barbearia e a Performa LAB (as campanhas não são públicas).
create or replace function public.campanha_da_barbearia(p_inquilino uuid)
returns table (nome text, texto text, primeiro_mes_gratis boolean, meses_condicao integer,
               desconto_temporario_pct numeric, profissionais_gratis integer, dominio_gratis boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (p_inquilino in (select public.inquilinos_onde(array['proprietario'], false))
          or public.e_super_admin()) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return query
    select c.nome, c.texto, c.primeiro_mes_gratis, c.meses_condicao, c.desconto_temporario_pct,
           c.profissionais_gratis, c.dominio_gratis
      from public.inquilinos i join public.campanhas_comerciais c on c.id = i.campanha_id
     where i.id = p_inquilino;
end $$;

revoke all on function public.campanha_disponivel(uuid, text, text),
  public.definir_campanha(uuid, uuid) from public, anon;
grant execute on function public.campanha_disponivel(uuid, text, text),
  public.definir_campanha(uuid, uuid) to authenticated;
grant execute on function public.campanha_disponivel(uuid, text, text),
  public.definir_campanha(uuid, uuid) to service_role;
revoke all on function public.campanha_da_barbearia(uuid) from public, anon;
grant execute on function public.campanha_da_barbearia(uuid) to authenticated, service_role;
