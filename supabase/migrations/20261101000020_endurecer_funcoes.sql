-- Endurecimento das funções (D-189), a partir dos avisos de segurança do Supabase de 01/11/2026.
--
-- 1 · As funções criadas depois da migração 02 receberam EXECUTE para anon pelos privilégios por
--     omissão do Supabase, embora o esquema só as dê a authenticated. Cada uma já recusava quem
--     não tem papel; retira-se o acesso para ficar como o esquema diz (02_funcoes.sql, secção 9).
--     Ficam com anon as quatro que entram em políticas RLS sem papel: e_dono_plataforma(),
--     e_comercial(), meus_leads() e pasta_lead_acessivel(text). Sem elas, as consultas de quem
--     não tem sessão a essas tabelas e ao Storage davam erro de permissão.
-- 2 · search_path fixo nas quatro funções SQL simples que não o tinham (só usam o pg_catalog).

revoke execute on function
  public.apagar_auditoria_antiga(integer),
  public.carteira_comercial(uuid),
  public.escolher_comercial(),
  public.fixar_texto_contrato(uuid, text),
  public.lead_acessivel(uuid),
  public.marcar_comissao_paga(uuid, date),
  public.marcar_comunicado_lido(uuid, uuid),
  public.meus_comunicados(uuid),
  public.preparar_demonstracao(),
  public.registar_taxa_paga(uuid, date),
  public.saude_carteira(uuid)
  from public, anon;

grant execute on function
  public.apagar_auditoria_antiga(integer),
  public.carteira_comercial(uuid),
  public.escolher_comercial(),
  public.fixar_texto_contrato(uuid, text),
  public.lead_acessivel(uuid),
  public.marcar_comissao_paga(uuid, date),
  public.marcar_comunicado_lido(uuid, uuid),
  public.meus_comunicados(uuid),
  public.preparar_demonstracao(),
  public.registar_taxa_paga(uuid, date),
  public.saude_carteira(uuid)
  to authenticated;

grant execute on function public.e_dono_plataforma(), public.e_comercial(), public.meus_leads(),
  public.pasta_lead_acessivel(text) to anon;

alter function public.e_sistema() set search_path = '';
alter function public.campos_alterados(jsonb, jsonb) set search_path = '';
alter function public.hora_local(timestamptz) set search_path = '';
alter function public.instante_lisboa(date, time) set search_path = '';
