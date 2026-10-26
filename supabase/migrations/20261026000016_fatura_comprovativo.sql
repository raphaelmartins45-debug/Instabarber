-- =============================================================================
-- Migração 16 · Fatura-recibo emitida pelo programa certificado (D-170): regista o número dado
-- pelo InvoiceXpress e liga a fatura ao recebimento e ao comprovativo aprovados. A emissão em si
-- fica desligada até haver conta e chave. Igual em docs/esquema/02, testada em 96d_comprovativos.
-- =============================================================================
-- A fatura-recibo emitida pelo programa certificado (D-170): regista-a com o número que ele deu,
-- paga na data do comprovativo, e liga-a ao recebimento e ao comprovativo aprovados. Só para
-- comprovativos aprovados sem fatura (uma fatura já emitida não se emite outra vez).
create or replace function public.registar_fatura_do_comprovativo(p_id uuid, p_numero text, p_emitida date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.comprovativos_pagamento%rowtype; v_fatura uuid;
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_numero, ''))) < 3 then raise exception 'numero' using errcode = 'P0001'; end if;
  select * into c from public.comprovativos_pagamento where id = p_id for update;
  if not found or c.estado <> 'aprovado' then raise exception 'nao_aprovado' using errcode = 'P0001'; end if;
  if c.fatura_id is not null then raise exception 'ja_tem_fatura' using errcode = 'P0001'; end if;
  insert into public.faturas_plataforma (inquilino_id, numero, valor, periodo_inicio, periodo_fim, emitida_em, paga_em)
  values (c.inquilino_id, trim(p_numero), c.valor, c.periodo_inicio, c.periodo_fim, p_emitida, c.pago_em)
  returning id into v_fatura;
  update public.recebimentos set fatura_id = v_fatura where id = c.recebimento_id;
  update public.comprovativos_pagamento set fatura_id = v_fatura where id = p_id;
  perform public.registar_auditoria(c.inquilino_id, 'fatura_emitida', 'faturas_plataforma', v_fatura,
    jsonb_build_object('numero', trim(p_numero), 'comprovativo', p_id));
  return v_fatura;
end $$;

revoke all on function public.registar_fatura_do_comprovativo(uuid, text, date) from public, anon;
grant execute on function public.registar_fatura_do_comprovativo(uuid, text, date) to authenticated;
