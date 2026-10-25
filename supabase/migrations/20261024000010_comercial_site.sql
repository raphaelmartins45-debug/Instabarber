-- =============================================================================
-- Migração 10 · Formulário do site em dois passos no CRM (Fase 3B, D-150). A mesma alteração
-- está em docs/esquema/02_funcoes.sql, testada em docs/esquema/testes/98_comercial_site.sql.
-- =============================================================================

-- O formulário do site. A rota aplica o limite por IP e o honeypot; aqui vale o
-- limite por contacto. Responde sempre «recebido» (verdadeiro) a quem não é abusivo,
-- exista ou não já um lead com o mesmo contacto.
-- O formulário tem dois passos (D-50): o passo 1 cria o lead; o passo 2 («passo»: 2) completa
-- só os campos ainda vazios do lead aberto e regista a dificuldade e o distrito no histórico.
-- Um lead do site sem o evento do passo 2 está «incompleto» (D-150).
create or replace function public.submeter_lead(p jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_nome text := nullif(trim(coalesce(p ->> 'nome', '')), '');
  v_tel  text := nullif(regexp_replace(coalesce(p ->> 'telefone', ''), '[^0-9+]', '', 'g'), '');
  v_mail text := nullif(lower(trim(coalesce(p ->> 'email', ''))), '');
  v_barb text := nullif(trim(coalesce(p ->> 'barbearia', '')), '');
  v_cid  text := nullif(trim(coalesce(p ->> 'cidade', '')), '');
  v_nb   text := nullif(trim(coalesce(p ->> 'barbeiros', '')), '');
  v_passo2 boolean := coalesce(p ->> 'passo', '') = '2';
  v_det  jsonb := case when coalesce(p ->> 'passo', '') = '2' then jsonb_strip_nulls(jsonb_build_object(
                    'passo', 2,
                    'distrito', nullif(trim(coalesce(p ->> 'distrito', '')), ''),
                    'dificuldade', nullif(trim(coalesce(p ->> 'dificuldade', '')), ''))) end;
  v_id   uuid;
begin
  if v_nome is null then raise exception 'nome_obrigatorio' using errcode = 'P0001'; end if;
  if v_tel is null and v_mail is null then raise exception 'contacto_obrigatorio' using errcode = 'P0001'; end if;
  if v_mail is not null and v_mail !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'email_invalido' using errcode = 'P0001';
  end if;
  if not public.consumir_limite('lead:' || coalesce(v_mail, v_tel), 3, interval '1 hour') then
    return false;
  end if;
  select id into v_id from public.leads
   where estado not in ('ganho','perdido')
     and ((v_mail is not null and lower(email) = v_mail) or (v_tel is not null and telefone = v_tel))
   order by criado_em desc limit 1;
  if v_id is not null then
    update public.leads
       set nome_barbearia = coalesce(nome_barbearia, case when v_passo2 then v_barb end),
           cidade = coalesce(cidade, case when v_passo2 then v_cid end),
           n_barbeiros = coalesce(n_barbeiros, case when v_passo2 then v_nb end),
           atualizado_em = now()
     where id = v_id;
    insert into public.lead_eventos (lead_id, tipo, texto, detalhes)
    values (v_id, 'sistema',
            case when v_passo2 then 'Completou o passo 2 do formulário do site.'
                 else 'Voltou a pedir contacto pelo formulário do site.' end,
            v_det);
    return true;
  end if;
  insert into public.leads (nome_contacto, nome_barbearia, cidade, telefone, email, n_barbeiros, origem)
  values (v_nome, v_barb, v_cid, v_tel, v_mail, v_nb, 'landing')
  returning id into v_id;
  insert into public.lead_eventos (lead_id, tipo, texto, detalhes)
  values (v_id, 'sistema', 'Pedido recebido pelo formulário do site.', v_det);
  return true;
end $$;
