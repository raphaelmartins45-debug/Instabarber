-- Registo a partir de uma proposta e comprovativos pela equipa (D-196).
-- 1 · Registar uma barbearia pelo painel a partir de uma proposta fecha o negócio sem contrato:
--     proposta aceite, lead ganho e ligado, desconto da mensalidade e comissão pendente do
--     comercial, que passa a «a pagar» com o primeiro comprovativo aprovado.
-- 2 · O comprovativo pode ser enviado pelo dono, pelos administradores ou pelo comercial do lead
--     (na função e no Storage). Aprovar continua a ser só do super_admin.

-- A comissão pode vir da proposta (sem contrato)
alter table public.comissoes_comerciais
  alter column contrato_id drop not null,
  add column proposta_id uuid unique references public.propostas(id) on delete cascade,
  add column inquilino_id uuid references public.inquilinos(id) on delete set null,
  add constraint comissoes_comerciais_origem
    check (contrato_id is not null or proposta_id is not null);

-- Quem pode enviar o comprovativo de uma barbearia (D-196): o dono, os administradores e o
-- comercial responsável pelo lead que deu origem à barbearia. Quem aprova é só o super_admin.
create or replace function public.pode_enviar_comprovativo(p_inquilino uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_inquilino in (select public.inquilinos_onde(array['proprietario'], false))
      or public.e_super_admin()
      or (public.e_comercial() and exists (select 1 from public.leads l
                                            where l.inquilino_id = p_inquilino
                                              and l.responsavel_id = auth.uid()));
$$;

-- Para a política do Storage: a pasta <inquilino>/ de uma barbearia a que se pode enviar.
create or replace function public.pode_carregar_comprovativo(p_nome text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case when (storage.foldername(p_nome))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
              then public.pode_enviar_comprovativo(((storage.foldername(p_nome))[1])::uuid)
              else false end;
$$;

-- Registo pelo painel a partir de uma proposta (D-196): fecha o negócio sem contrato. A proposta
-- fica aceite, o lead ganho e ligado à barbearia, o desconto da mensalidade passa para ela e a
-- comissão do comercial responsável fica pendente até ao primeiro comprovativo aprovado.
create or replace function public.fechar_proposta_no_registo(p_proposta uuid, p_inquilino uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare p public.propostas%rowtype; l public.leads%rowtype;
begin
  perform public.exigir_super_admin();
  select * into p from public.propostas where id = p_proposta for update;
  if not found or p.estado not in ('rascunho','enviada','aceite') then
    raise exception 'proposta_invalida' using errcode = 'P0001';
  end if;
  select * into l from public.leads where id = p.lead_id for update;
  if l.inquilino_id is not null then raise exception 'lead_com_barbearia' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.inquilinos where id = p_inquilino) then
    raise exception 'inquilino_inexistente' using errcode = 'P0001';
  end if;
  update public.propostas set estado = 'aceite', decidida_em = coalesce(decidida_em, now())
   where id = p_proposta;
  update public.leads set estado = 'ganho', motivo_perda = null, inquilino_id = p_inquilino,
         atualizado_em = now()
   where id = l.id;
  update public.inquilinos set desconto_mensalidade_pct = p.desconto_mensalidade_pct where id = p_inquilino;
  insert into public.comissoes_comerciais (proposta_id, inquilino_id, comercial_id, valor)
  select p.id, p_inquilino, l.responsavel_id, p.comissao_sem_iva
   where p.comissao_sem_iva > 0
     and exists (select 1 from public.perfis pf
                  where pf.user_id = l.responsavel_id and pf.papel = 'comercial' and pf.ativo
                    and pf.inquilino_id is null)
  on conflict (proposta_id) do nothing;
  perform public.evento_lead(l.id, 'proposta', 'Barbearia registada pelo painel a partir da proposta '
    || p.numero || '.', jsonb_build_object('proposta', p.id, 'inquilino', p_inquilino));
  perform public.registar_auditoria(p_inquilino, 'proposta_fechada_no_registo', 'propostas', p.id,
    jsonb_build_object('numero', p.numero, 'lead', l.id));
end $$;

-- A barbearia de um lead ganho (D-196), para a ficha do lead: paga quando está ativa e já tem o
-- primeiro pagamento aprovado. Só quem acede ao lead (administradores e o comercial dele).
create or replace function public.barbearia_do_lead(p_lead uuid)
returns table (inquilino_id uuid, nome text, estado text, pago boolean, comprovativo_pendente boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_lead is null or not public.lead_acessivel(p_lead) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return query
    select i.id, i.nome, i.estado, (i.estado = 'ativo' and i.primeiro_pagamento_em is not null),
           exists (select 1 from public.comprovativos_pagamento c
                    where c.inquilino_id = i.id and c.estado = 'pendente')
      from public.leads l join public.inquilinos i on i.id = l.inquilino_id
     where l.id = p_lead;
end $$;

-- O período que a barbearia está a pagar: a fatura mais antiga por pagar ou, sem ela, o período
-- que começa no próximo vencimento (ou hoje, se ainda não houver), de um mês, de seis meses ou de
-- um ano. No primeiro pagamento, os meses de oferta da campanha (D-190) juntam-se ao período.
create or replace function public.periodo_a_pagar(p_inquilino uuid)
returns table (inicio date, fim date, fatura_id uuid, valor_fatura numeric)
language plpgsql stable security definer set search_path = '' as $$
declare v_inicio date; v_per text; v_oferta integer;
begin
  if not public.pode_enviar_comprovativo(p_inquilino) then
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

-- O dono envia o comprovativo (também com a barbearia suspensa, para regularizar, M.4); os
-- administradores e o comercial do lead também podem (D-196). O ficheiro tem de já estar no
-- bucket, na pasta da barbearia.
create or replace function public.enviar_comprovativo(
  p_inquilino uuid, p_metodo text, p_valor numeric, p_pago_em date, p_caminho text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; p record;
begin
  if not public.pode_enviar_comprovativo(p_inquilino) then
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
    -- A comissão do contrato ou, no registo pelo painel (D-196), da proposta.
    update public.comissoes_comerciais k
       set estado = 'a_pagar', taxa_paga_em = c.pago_em, vence_em = c.pago_em + 10
     where k.estado = 'pendente'
       and (k.inquilino_id = c.inquilino_id
            or k.contrato_id in (select ct.id from public.contratos ct where ct.inquilino_id = c.inquilino_id));
  end if;
  update public.comprovativos_pagamento
     set estado = 'aprovado', decidido_por = auth.uid(), decidido_em = now(), recebimento_id = v_rec,
         implementacao_sem_iva = v_impl
   where id = p_id;
  perform public.registar_auditoria(c.inquilino_id, 'comprovativo_aprovado', 'comprovativos_pagamento', p_id,
    jsonb_build_object('valor', c.valor, 'recebimento', v_rec, 'implementacao', v_impl));
  return v_rec;
end $$;

-- Carregam o dono, os administradores e o comercial do lead da barbearia (D-196).
drop policy storage_comprovativos_carregar on storage.objects;
create policy storage_comprovativos_carregar on storage.objects for insert
  with check (bucket_id = 'comprovativos' and public.pode_carregar_comprovativo(name));

revoke all on function public.pode_enviar_comprovativo(uuid), public.pode_carregar_comprovativo(text),
  public.fechar_proposta_no_registo(uuid, uuid), public.barbearia_do_lead(uuid) from public, anon;
grant execute on function public.pode_enviar_comprovativo(uuid), public.barbearia_do_lead(uuid),
  public.fechar_proposta_no_registo(uuid, uuid) to authenticated, service_role;
-- Usada na política do Storage, que vale para todos os papéis; sem sessão devolve falso.
grant execute on function public.pode_carregar_comprovativo(text) to anon, authenticated, service_role;

-- Funções internas que ficaram executáveis por quem tem sessão (privilégios por omissão do
-- Supabase); no esquema não o são (02_funcoes.sql, secção 9).
revoke execute on function public.comunicado_para_equipa(uuid, uuid), public.validar_ficha_tecnica()
  from authenticated;
