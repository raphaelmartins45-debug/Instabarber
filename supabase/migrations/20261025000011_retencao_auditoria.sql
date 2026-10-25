-- =============================================================================
-- Migração 11 · Retenção da auditoria (D-157). A mesma função está em
-- docs/esquema/02_funcoes.sql, testada em docs/esquema/testes/99_retencao.sql.
-- =============================================================================
-- Rotina mensal à mão (P-24, D-157): apaga os registos de auditoria com mais do prazo de
-- conservação (24 meses por omissão; nunca menos de 12). O próprio apagamento fica registado.
create or replace function public.apagar_auditoria_antiga(p_meses integer default 24) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_n integer;
begin
  perform public.exigir_super_admin();
  if p_meses is null or p_meses < 12 then raise exception 'prazo_invalido' using errcode = 'P0001'; end if;
  with apagados as (
    delete from public.auditoria where criado_em < now() - make_interval(months => p_meses)
    returning 1)
  select count(*) into v_n from apagados;
  perform public.registar_auditoria(null, 'auditoria_antiga_apagada', 'auditoria', null,
    jsonb_build_object('n', v_n, 'meses', p_meses));
  return v_n;
end $$;

grant execute on function public.apagar_auditoria_antiga(integer) to authenticated;
