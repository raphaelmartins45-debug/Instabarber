-- =============================================================================
-- Migração 05 · InstaBarber Admin (Fase 3, D-116). As mesmas alterações estão em
-- docs/esquema/02_funcoes.sql e 03_rls.sql, testadas em docs/esquema/testes/70_admin.sql.
-- =============================================================================

-- Ações do InstaBarber Admin que ficam em auditoria (aprovação, vista de apoio, importação,
-- exportação, eliminação). Só o super_admin com dois fatores; o autor é sempre auth.uid().
create or replace function public.registar_auditoria_admin(
  p_inquilino uuid, p_accao text, p_entidade text, p_entidade_id uuid, p_detalhes jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if p_accao !~ '^[a-z_]{3,60}$' then raise exception 'accao_invalida' using errcode = 'P0001'; end if;
  perform public.registar_auditoria(p_inquilino, p_accao, p_entidade, p_entidade_id, p_detalhes);
end $$;

revoke execute on function public.registar_auditoria_admin(uuid, text, text, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.registar_auditoria_admin(uuid, text, text, uuid, jsonb) to authenticated, service_role;

-- Importação de clientes pelo InstaBarber Admin (E.1): o super_admin com dois fatores cria
-- clientes de qualquer barbearia. Não lhes altera nem apaga nada.
create policy clientes_admin_criar on clientes for insert with check ((select public.e_super_admin()));

-- O super_admin carrega o logótipo, a capa e a galeria pela ficha da barbearia e na
-- aprovação da adesão (E.1, D.8.1).
create policy storage_publico_admin on storage.objects for all
  using (bucket_id = 'publico' and (select public.e_super_admin()))
  with check (bucket_id = 'publico' and (select public.e_super_admin()));

-- O formulário de adesão é público e mostra o que cada plano inclui (D.9): o catálogo e os
-- pacotes leem-se sem conta. Não dizem nada sobre nenhuma barbearia.
create policy funcionalidades_ler_publico on funcionalidades for select to anon using (true);
create policy pacotes_ler_publico on pacote_funcionalidades for select to anon using (true);
