-- =============================================================================
-- Migração 09 · Suspensão sem perder dados (Fase 7, M.4, D-127). A mesma alteração está em
-- docs/esquema/02_funcoes.sql, testada em docs/esquema/testes/97_suspensao.sql.
-- =============================================================================

-- Barbearia suspensa (M.4): a página pública mostra só um aviso neutro, sem expor a razão nem
-- dados; o slug diz apenas se existe uma barbearia suspensa com ele (Fase 7, D-127).
create or replace function public.barbearia_suspensa(p_slug text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.inquilinos where slug = p_slug and estado = 'suspenso')
$$;

revoke execute on function public.barbearia_suspensa(text) from public, anon, authenticated;
grant execute on function public.barbearia_suspensa(text) to anon, authenticated, service_role;
