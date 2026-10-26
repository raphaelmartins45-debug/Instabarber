-- =============================================================================
-- Migração 17 · Ficha de prospeção do lead (D-174): os dados da visita ou do primeiro contacto,
-- e os leads parecidos (telemóvel, Instagram, morada). Igual em docs/esquema/01 e 02, testada em
-- docs/esquema/testes/96e_prospecao.sql.
-- =============================================================================
-- Ficha de prospeção do lead (D-174): o que o comercial apura na visita ou no primeiro contacto.
-- Colunas no próprio lead para filtrar, procurar duplicados e lembrar o fim do contrato atual.
alter table leads drop constraint if exists leads_origem_check;
alter table leads add constraint leads_origem_check
  check (origem in ('landing','whatsapp','email','indicacao','visita','instagram','outro'));
alter table leads
  add column instagram          text check (char_length(instagram) <= 60),
  add column morada             text check (char_length(morada) <= 200),
  add column google_nota        numeric(2,1) check (google_nota between 0 and 5),
  add column google_avaliacoes  integer check (google_avaliacoes >= 0),
  add column contacto_cargo     text check (char_length(contacto_cargo) <= 60),
  add column fala_com_decisor   boolean,
  add column origem_detalhe     text check (char_length(origem_detalhe) <= 120),
  add column consentimento_contacto boolean not null default false,
  add column cadeiras           smallint check (cadeiras between 1 and 50),
  add column como_marcam        text check (como_marcam in ('telefone','whatsapp','caderno','sistema','outro')),
  add column sistema_atual      text check (char_length(sistema_atual) <= 80),
  add column custo_atual        numeric(10,2) check (custo_atual >= 0),
  add column fim_contrato_atual date,
  add column temperatura        text check (temperatura in ('frio','morno','quente'));
create index leads_instagram on leads (lower(instagram)) where instagram is not null;
create index leads_fim_contrato on leads (fim_contrato_atual) where fim_contrato_atual is not null;

-- Leads parecidos com o que se vai criar (D-174): mesmo telemóvel, mesmo Instagram ou mesma morada.
-- Devolve o nome só dos que o utilizador pode abrir; dos outros diz apenas que existem.
create or replace function public.leads_semelhantes(p_telefone text, p_instagram text, p_morada text)
returns table (id uuid, nome text, acessivel boolean)
language plpgsql stable security definer set search_path = '' as $$
declare v_ig text := nullif(lower(trim(both '@ ' from coalesce(p_instagram, ''))), '');
        v_mor text := nullif(lower(trim(coalesce(p_morada, ''))), '');
begin
  perform public.exigir_comercial_ou_admin();
  return query
    select l.id,
           case when public.lead_acessivel(l.id) then coalesce(l.nome_barbearia, l.nome_contacto) end,
           public.lead_acessivel(l.id)
      from public.leads l
     where (nullif(trim(p_telefone), '') is not null and l.telefone = trim(p_telefone))
        or (v_ig is not null and lower(trim(both '@ ' from l.instagram)) = v_ig)
        or (v_mor is not null and lower(trim(l.morada)) = v_mor)
     order by l.criado_em desc limit 5;
end $$;

revoke all on function public.leads_semelhantes(text, text, text) from public, anon;
grant execute on function public.leads_semelhantes(text, text, text) to authenticated;
