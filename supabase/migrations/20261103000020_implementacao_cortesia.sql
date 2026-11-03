-- Implementação (Essencial e com Formação), cortesia e registo de barbearias pelo painel (D-189).
-- A taxa de migração passa a ser a implementação: dois pacotes com preço na configuração
-- comercial, escolhidos na proposta; metade do valor cobrado é a comissão do comercial. Cobra-se
-- no primeiro pagamento da barbearia. A cortesia tira a barbearia dos vencimentos até uma data.
-- Os nomes internos (taxa_migracao_*) mantêm-se; só o que se vê muda de nome.

-- 1 · Os dois pacotes de implementação na configuração comercial, ligados
alter table public.configuracao_comercial
  add column implementacao_essencial_sem_iva numeric(10,2) not null default 50
    check (implementacao_essencial_sem_iva >= 0),
  add column implementacao_formacao_sem_iva numeric(10,2) not null default 100
    check (implementacao_formacao_sem_iva >= 0),
  drop column taxa_migracao_sem_iva;
update public.configuracao_comercial set taxa_migracao_ativa = true;

-- 2 · A proposta guarda o pacote escolhido
alter table public.propostas
  add column implementacao text not null default 'nenhuma'
    check (implementacao in ('nenhuma','essencial','formacao')),
  add constraint propostas_implementacao check (implementacao <> 'nenhuma' or taxa_migracao_sem_iva = 0);
update public.propostas set implementacao = 'essencial' where taxa_migracao_sem_iva > 0;
-- A vista do estado efetivo da proposta passa a mostrar a coluna nova.
drop view public.propostas_com_estado;
create view public.propostas_com_estado with (security_invoker = true) as
  select p.*,
         case when p.estado = 'enviada' and p.valida_ate < (now() at time zone 'Europe/Lisbon')::date
              then 'expirada' else p.estado end as estado_efetivo
    from public.propostas p;

-- 3 · A barbearia: implementação por cobrar e cortesia (campos protegidos)
alter table public.inquilinos
  add column implementacao text not null default 'nenhuma'
    check (implementacao in ('nenhuma','essencial','formacao')),
  add column implementacao_sem_iva numeric(10,2) not null default 0 check (implementacao_sem_iva >= 0),
  add column implementacao_paga_em date,
  add column cortesia boolean not null default false,
  add column cortesia_ate date,
  add constraint inquilinos_implementacao check (implementacao <> 'nenhuma' or implementacao_sem_iva = 0),
  add constraint inquilinos_cortesia check (cortesia or cortesia_ate is null);

-- 4 · A parte do pagamento que coube à implementação (para a fatura com duas linhas)
alter table public.comprovativos_pagamento
  add column implementacao_sem_iva numeric(10,2) not null default 0 check (implementacao_sem_iva >= 0);

-- Campos do inquilino que só a Performa LAB altera (B2, D.3).
create or replace function public.proteger_inquilino() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
  v_protegidos text[] := array['slug','vertical','plano','periodicidade','profissionais_contratados',
                               'estado','estado_pagamento','proximo_vencimento','dominio_proprio',
                               'aprovado_em','criado_em','desconto_mensalidade_pct',
                               'implementacao','implementacao_sem_iva','implementacao_paga_em',
                               'cortesia','cortesia_ate'];
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
                      'cortesia','cortesia_ate'] then
    perform public.registar_auditoria(new.id, 'inquilino_alterado', 'inquilinos', new.id,
      jsonb_build_object('campos', to_jsonb(v_mudou)));
  end if;
  return new;
end $$;

-- Cria uma versão nova da proposta. As versões anteriores ainda abertas ficam «substituída».
-- Os preços chegam calculados por lib/regras/mensalidade.ts; as restrições da tabela conferem-nos.
-- A implementação (D-189) é «nenhuma», «essencial» ou «formacao»: o valor (guardado em
-- taxa_migracao_sem_iva) tem de ser o preço do pacote na configuração, com o desconto da taxa.
create or replace function public.criar_proposta(p_lead uuid, p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_versao integer; v_id uuid; v_estado text;
  v_cfg public.configuracao_comercial%rowtype;
  v_desc numeric := coalesce((p ->> 'desconto_mensalidade_pct')::numeric, 0);
  v_taxa numeric := coalesce((p ->> 'taxa_migracao_sem_iva')::numeric, 0);
  v_desc_taxa numeric := coalesce((p ->> 'desconto_taxa_pct')::numeric, 0);
  v_impl text := coalesce(nullif(p ->> 'implementacao', ''),
                          case when v_taxa = 0 and v_desc_taxa = 0 then 'nenhuma' end);
  v_base numeric;
begin
  perform public.exigir_lead(p_lead);
  select * into v_cfg from public.configuracao_comercial;
  if v_desc > 0 and not coalesce(v_cfg.descontos_ativos, false) then
    raise exception 'descontos_desligados' using errcode = 'P0001';
  end if;
  if v_impl is null or v_impl not in ('nenhuma','essencial','formacao')
     or (v_impl = 'nenhuma' and (v_taxa <> 0 or v_desc_taxa <> 0)) then
    raise exception 'implementacao_invalida' using errcode = 'P0001';
  end if;
  if not coalesce(v_cfg.taxa_migracao_ativa, false) and v_impl <> 'nenhuma' then
    raise exception 'taxa_migracao_desligada' using errcode = 'P0001';
  end if;
  if not public.e_super_admin() and (v_desc > v_cfg.desconto_max_mensalidade_pct
                                     or v_desc_taxa > v_cfg.desconto_max_taxa_pct) then
    raise exception 'desconto_acima_do_limite' using errcode = 'P0001';
  end if;
  v_base := case v_impl when 'essencial' then v_cfg.implementacao_essencial_sem_iva
                        when 'formacao' then v_cfg.implementacao_formacao_sem_iva else 0 end;
  if v_impl <> 'nenhuma' and v_taxa <> round(v_base * (1 - v_desc_taxa / 100), 2) then
    raise exception 'taxa_migracao_invalida' using errcode = 'P0001';
  end if;
  select estado into v_estado from public.leads where id = p_lead for update;
  if v_estado is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_estado in ('ganho','perdido') then raise exception 'lead_fechado' using errcode = 'P0001'; end if;
  select coalesce(max(versao), 0) + 1 into v_versao from public.propostas where lead_id = p_lead;
  update public.propostas set estado = 'substituida' where lead_id = p_lead and estado in ('rascunho','enviada');
  insert into public.propostas (lead_id, numero, versao, plano, periodicidade, profissionais, dominio_proprio, desafio_90,
    mensalidade_sem_iva, valor_periodo_sem_iva, valor_periodo_com_iva, iva_taxa, condicoes_lancamento, validade_dias, dados,
    desconto_mensalidade_pct, implementacao, taxa_migracao_sem_iva, desconto_taxa_pct, criado_por)
  values (p_lead, public.proximo_numero_comercial('PRP'), v_versao, p ->> 'plano',
    coalesce(p ->> 'periodicidade', 'mensal'), (p ->> 'profissionais')::integer,
    coalesce((p ->> 'dominio_proprio')::boolean, false), coalesce((p ->> 'desafio_90')::boolean, false),
    (p ->> 'mensalidade_sem_iva')::numeric, (p ->> 'valor_periodo_sem_iva')::numeric, (p ->> 'valor_periodo_com_iva')::numeric,
    coalesce((p ->> 'iva_taxa')::numeric, 23),
    nullif(p ->> 'condicoes_lancamento', ''), coalesce((p ->> 'validade_dias')::integer, 15),
    coalesce(p -> 'dados', '{}'), v_desc, v_impl, v_taxa, v_desc_taxa, auth.uid())
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
       new.implementacao, new.taxa_migracao_sem_iva, new.desconto_taxa_pct, new.numero, new.versao, new.lead_id)
     is distinct from (
       old.plano, old.periodicidade, old.profissionais, old.dominio_proprio, old.desafio_90,
       old.mensalidade_sem_iva, old.valor_periodo_sem_iva, old.valor_periodo_com_iva,
       old.condicoes_lancamento, old.validade_dias, old.dados, old.desconto_mensalidade_pct,
       old.implementacao, old.taxa_migracao_sem_iva, old.desconto_taxa_pct, old.numero, old.versao, old.lead_id) then
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
  -- Metade da implementação cobrada é a comissão do comercial responsável, se estiver ativo
  -- (D-162, D-189): quem vende é quem faz a implementação. O desconto na taxa sai da comissão.
  insert into public.comissoes_comerciais (contrato_id, comercial_id, valor)
  select v.id, l.responsavel_id, round(p.taxa_migracao_sem_iva * 0.5, 2)
    from public.leads l join public.propostas p on p.id = v.proposta_id
   where l.id = v.lead_id and round(p.taxa_migracao_sem_iva * 0.5, 2) > 0
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
  -- O desconto da proposta aceite passa para a mensalidade da barbearia (D-161) e a
  -- implementação contratada fica por cobrar no primeiro pagamento (D-189).
  update public.inquilinos i
     set desconto_mensalidade_pct = p.desconto_mensalidade_pct,
         implementacao = p.implementacao,
         implementacao_sem_iva = p.taxa_migracao_sem_iva
    from public.propostas p
   where p.id = v.proposta_id and i.id = p_inquilino;
  perform public.evento_lead(v.lead_id, 'contrato', 'Barbearia criada e ligada ao contrato.', jsonb_build_object('inquilino', p_inquilino));
end $$;

-- A Performa LAB aprova: regista o recebimento, marca a fatura paga, põe a barbearia em dia,
-- avança o próximo vencimento para o dia a seguir ao período pago e, se estava suspensa por falta
-- de pagamento (M.4), reativa-a. O primeiro pagamento leva também a implementação por cobrar
-- (D-189): fica paga, o comprovativo guarda a parte que lhe coube e a comissão do comercial
-- passa a «a pagar», com vencimento 10 dias depois.
create or replace function public.aprovar_comprovativo(p_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.comprovativos_pagamento%rowtype; v_rec uuid; i public.inquilinos%rowtype;
        v_impl numeric := 0;
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select * into c from public.comprovativos_pagamento where id = p_id for update;
  if not found or c.estado <> 'pendente' then raise exception 'ja_decidido' using errcode = 'P0001'; end if;
  select * into i from public.inquilinos where id = c.inquilino_id for update;
  if i.implementacao <> 'nenhuma' and i.implementacao_paga_em is null and i.implementacao_sem_iva > 0 then
    v_impl := i.implementacao_sem_iva;
  end if;
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
         implementacao_paga_em = case when v_impl > 0 then c.pago_em else i.implementacao_paga_em end
   where id = c.inquilino_id;
  if v_impl > 0 then
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

-- Cortesia (D-189): a barbearia não paga nem recebe vencimentos até à data de fim (ou até a
-- Performa LAB a desligar). Com data, o primeiro vencimento é o dia seguinte; sem data, não há
-- vencimento. Ao desligar, o vencimento passa a hoje se não houver outro.
create or replace function public.definir_cortesia(p_inquilino uuid, p_ativa boolean, p_ate date default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_super_admin();
  if p_ativa and p_ate is not null and p_ate < public.hoje_lisboa() then
    raise exception 'data_passada' using errcode = 'P0001';
  end if;
  update public.inquilinos i
     set cortesia = p_ativa,
         cortesia_ate = case when p_ativa then p_ate end,
         estado_pagamento = case when p_ativa then 'em_dia' else i.estado_pagamento end,
         proximo_vencimento = case
           when p_ativa and p_ate is not null then p_ate + 1
           when p_ativa then null
           else coalesce(i.proximo_vencimento, public.hoje_lisboa()) end
   where i.id = p_inquilino;
  if not found then raise exception 'inquilino_inexistente' using errcode = 'P0001'; end if;
end $$;

-- A implementação de uma barbearia registada no painel (D-189). Não muda depois de paga.
create or replace function public.definir_implementacao(p_inquilino uuid, p_tipo text, p_valor numeric)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_super_admin();
  if p_tipo not in ('nenhuma','essencial','formacao') or p_valor is null or p_valor < 0
     or (p_tipo = 'nenhuma' and p_valor <> 0) then
    raise exception 'implementacao_invalida' using errcode = 'P0001';
  end if;
  update public.inquilinos set implementacao = p_tipo, implementacao_sem_iva = round(p_valor, 2)
   where id = p_inquilino and implementacao_paga_em is null;
  if not found then raise exception 'implementacao_paga' using errcode = 'P0001'; end if;
end $$;

revoke all on function public.definir_cortesia(uuid, boolean, date),
  public.definir_implementacao(uuid, text, numeric) from public, anon;
grant execute on function public.definir_cortesia(uuid, boolean, date),
  public.definir_implementacao(uuid, text, numeric) to authenticated;
grant execute on function public.definir_cortesia(uuid, boolean, date),
  public.definir_implementacao(uuid, text, numeric) to service_role;
