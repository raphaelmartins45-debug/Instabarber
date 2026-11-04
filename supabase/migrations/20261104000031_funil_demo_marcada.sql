begin;
-- O funil novo (D-211): Novo → Em contacto → Demo marcada → Demo feita → Proposta enviada → Ganho
-- (e o pós-venda, calculado), com Perdido à parte. A demonstração marcada guarda a data e a hora.

alter table public.leads drop constraint leads_estado_check;
update public.leads set estado = 'demo_marcada' where estado = 'demonstracao';
alter table public.leads add constraint leads_estado_check
  check (estado in ('novo','contactado','demo_marcada','demo_feita','proposta','ganho','perdido'));
alter table public.leads add column demo_em timestamptz;

create or replace function public.mudar_estado_lead(p_lead uuid, p_estado text, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_atual text;
begin
  perform public.exigir_lead(p_lead);
  if p_estado not in ('novo','contactado','demo_feita','proposta','perdido') then
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

create or replace function public.marcar_demo_lead(p_lead uuid, p_em timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare v_atual text;
begin
  perform public.exigir_lead(p_lead);
  if p_em is null or p_em <= public.agora() then
    raise exception 'demo_no_passado' using errcode = 'P0001';
  end if;
  select estado into v_atual from public.leads where id = p_lead for update;
  if v_atual is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_atual in ('ganho','perdido') then raise exception 'lead_fechado' using errcode = 'P0001'; end if;
  update public.leads
     set estado = 'demo_marcada', demo_em = p_em,
         proxima_acao = 'Demonstração', proxima_acao_em = (p_em at time zone 'Europe/Lisbon')::date,
         atualizado_em = now()
   where id = p_lead;
  if v_atual <> 'demo_marcada' then
    perform public.evento_lead(p_lead, 'estado', null, jsonb_build_object('de', v_atual, 'para', 'demo_marcada'));
  end if;
  perform public.evento_lead(p_lead, 'sistema',
    'Demonstração marcada para ' || to_char(p_em at time zone 'Europe/Lisbon', 'DD/MM/YYYY "às" HH24:MI') || '.');
end $$;

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
  if v_estado in ('novo','contactado','demo_marcada','demo_feita') then
    update public.leads set estado = 'proposta', atualizado_em = now() where id = p_lead;
  end if;
  perform public.evento_lead(p_lead, 'proposta', 'Proposta criada (versão ' || v_versao || ').', jsonb_build_object('proposta', v_id));
  return v_id;
end $$;

revoke all on function public.marcar_demo_lead(uuid, timestamptz) from public, anon;
grant execute on function public.marcar_demo_lead(uuid, timestamptz) to authenticated;
commit;
