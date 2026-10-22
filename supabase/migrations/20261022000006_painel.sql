-- =============================================================================
-- Migração 06 · Painel da barbearia (Fase 4, D-121). As mesmas alterações estão em
-- docs/esquema/02_funcoes.sql, testadas em docs/esquema/testes/80_painel.sql.
-- =============================================================================

-- Clube de assinatura (F.4.2): cada ciclo nasce por pagar, com os créditos do plano (e, se o
-- plano transita crédito, o que ficou por usar no ciclo anterior). A renovação é no mesmo dia do
-- mês da inscrição (29 a 31 passa ao último dia do mês). Sem tarefas agendadas (D-26): renova-se
-- quando o gestor abre o clube ou carrega em «Renovar ciclo» (D-122).
create or replace function public.abrir_ciclo_clube(p_subscricao uuid, p_inicio date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare s public.subscricoes%rowtype; c public.clubes%rowtype; v_ciclo uuid; v_anterior uuid;
begin
  select * into s from public.subscricoes where id = p_subscricao;
  select * into c from public.clubes where id = s.clube_id;
  select id into v_anterior from public.ciclos_clube where subscricao_id = s.id order by inicio desc limit 1;
  insert into public.ciclos_clube (inquilino_id, subscricao_id, inicio, fim, valor)
  values (s.inquilino_id, s.id, p_inicio, p_inicio + c.validade_dias, c.preco_mensal)
  returning id into v_ciclo;
  insert into public.creditos_clube (inquilino_id, ciclo_id, servico_id, quantidade)
  select s.inquilino_id, v_ciclo, cs.servico_id,
         cs.quantidade_mes + case when c.transita_credito then coalesce(
           (select greatest(cc.quantidade - cc.usados, 0) from public.creditos_clube cc
             join public.ciclos_clube ci on ci.id = cc.ciclo_id
            where cc.ciclo_id = v_anterior and cc.servico_id = cs.servico_id and ci.pago_em is not null), 0) else 0 end
    from public.clube_servicos cs where cs.clube_id = c.id;
  return v_ciclo;
end $$;

create or replace function public.inscrever_clube(p_cliente uuid, p_clube uuid, p_inicio date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.clubes%rowtype; v_sub uuid;
begin
  select * into c from public.clubes where id = p_clube;
  if not found or c.inquilino_id not in (select public.inquilinos_onde(array['proprietario'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if not c.ativo then raise exception 'plano_inativo' using errcode = 'P0001'; end if;
  if not public.funcionalidade_ativa(c.inquilino_id, 'clube_assinatura') then
    raise exception 'indisponivel' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.clientes where id = p_cliente and inquilino_id = c.inquilino_id) then
    raise exception 'cliente_invalido' using errcode = 'P0001';
  end if;
  insert into public.subscricoes (inquilino_id, cliente_id, clube_id, inicio, proxima_renovacao)
  values (c.inquilino_id, p_cliente, c.id, p_inicio, (p_inicio + interval '1 month')::date)
  returning id into v_sub;
  perform public.abrir_ciclo_clube(v_sub, p_inicio);
  return v_sub;
end $$;

create or replace function public.renovar_subscricao(p_subscricao uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare s public.subscricoes%rowtype; v_ciclo uuid; v_n integer;
begin
  select * into s from public.subscricoes where id = p_subscricao for update;
  if not found or s.inquilino_id not in (select public.inquilinos_onde(array['proprietario'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if s.estado <> 'ativa' then raise exception 'subscricao_inativa' using errcode = 'P0001'; end if;
  v_ciclo := public.abrir_ciclo_clube(s.id, s.proxima_renovacao);
  select count(*) into v_n from public.ciclos_clube where subscricao_id = s.id;
  update public.subscricoes set proxima_renovacao = (s.inicio + make_interval(months => v_n))::date where id = s.id;
  return v_ciclo;
end $$;

-- A ficha do cliente mostra se a política de faltas lhe bloqueou a marcação online (F.8). Só a
-- equipa da barbearia do cliente pergunta; a regra continua a ser pode_marcar_online() (D-121).
create or replace function public.marcacao_online_bloqueada(p_cliente uuid) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_inq uuid;
begin
  select inquilino_id into v_inq from public.clientes where id = p_cliente;
  if v_inq is null or v_inq not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return not public.pode_marcar_online(p_cliente);
end $$;

-- Cartões oferta (F.4.9): vendidos e pagos ao balcão. O código de oito caracteres gera-se aqui,
-- único na barbearia; o uso verifica validade e saldo com o cartão bloqueado (D-121).
create or replace function public.vender_cartao_oferta(
  p_inquilino uuid, p_valor numeric, p_comprador text, p_beneficiario text default null,
  p_metodo text default null, p_valido_ate date default null, p_comprador_cliente uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_codigo text; v_alfabeto text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if p_inquilino not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if not public.funcionalidade_ativa(p_inquilino, 'cartoes_oferta') then
    raise exception 'indisponivel' using errcode = 'P0001';
  end if;
  loop
    select string_agg(substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::integer, 1), '')
      into v_codigo from generate_series(1, 8);
    exit when not exists (select 1 from public.cartoes_oferta where inquilino_id = p_inquilino and codigo = v_codigo);
  end loop;
  insert into public.cartoes_oferta (inquilino_id, codigo, valor_inicial, comprador_nome, comprador_cliente_id,
                                     beneficiario_nome, metodo, valido_ate, vendido_por)
  values (p_inquilino, v_codigo, p_valor, trim(p_comprador), p_comprador_cliente, nullif(trim(p_beneficiario), ''),
          p_metodo, coalesce(p_valido_ate, public.hoje_lisboa() + interval '1 year')::date, auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.usar_cartao_oferta(
  p_inquilino uuid, p_codigo text, p_valor numeric, p_marcacao uuid default null)
returns numeric language plpgsql security definer set search_path = '' as $$
declare c public.cartoes_oferta%rowtype; v_saldo numeric;
begin
  if p_inquilino not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_valor is null or p_valor <= 0 then raise exception 'valor_invalido' using errcode = 'P0001'; end if;
  select * into c from public.cartoes_oferta
   where inquilino_id = p_inquilino and codigo = upper(trim(p_codigo)) for update;
  if not found or c.anulado_em is not null or c.valido_ate < public.hoje_lisboa() then
    raise exception 'cartao_invalido' using errcode = 'P0001';
  end if;
  select c.valor_inicial - coalesce(sum(m.valor), 0) into v_saldo from public.movimentos_cartao m where m.cartao_id = c.id;
  if v_saldo < p_valor then raise exception 'cartao_saldo' using errcode = 'P0001'; end if;
  insert into public.movimentos_cartao (inquilino_id, cartao_id, valor, marcacao_id, registado_por)
  values (p_inquilino, c.id, p_valor, p_marcacao, auth.uid());
  if p_marcacao is not null then
    update public.marcacoes set cartao_oferta_id = c.id where id = p_marcacao and inquilino_id = p_inquilino;
  end if;
  return v_saldo - p_valor;
end $$;

revoke execute on function public.vender_cartao_oferta(uuid, numeric, text, text, text, date, uuid),
  public.usar_cartao_oferta(uuid, text, numeric, uuid), public.marcacao_online_bloqueada(uuid),
  public.abrir_ciclo_clube(uuid, date), public.inscrever_clube(uuid, uuid, date), public.renovar_subscricao(uuid)
  from public, anon, authenticated;
grant execute on function public.vender_cartao_oferta(uuid, numeric, text, text, text, date, uuid),
  public.usar_cartao_oferta(uuid, text, numeric, uuid), public.marcacao_online_bloqueada(uuid),
  public.inscrever_clube(uuid, uuid, date), public.renovar_subscricao(uuid)
  to authenticated;
