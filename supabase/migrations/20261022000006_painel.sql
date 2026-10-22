-- =============================================================================
-- Migração 06 · Painel da barbearia (Fase 4, D-121). As mesmas alterações estão em
-- docs/esquema/02_funcoes.sql, testadas em docs/esquema/testes/80_painel.sql.
-- =============================================================================

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
  public.usar_cartao_oferta(uuid, text, numeric, uuid), public.marcacao_online_bloqueada(uuid)
  from public, anon, authenticated;
grant execute on function public.vender_cartao_oferta(uuid, numeric, text, text, text, date, uuid),
  public.usar_cartao_oferta(uuid, text, numeric, uuid), public.marcacao_online_bloqueada(uuid)
  to authenticated;
