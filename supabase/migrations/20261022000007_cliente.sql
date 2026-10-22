-- =============================================================================
-- Migração 07 · Marcação pública e área de cliente (Fase 5, D-125). As mesmas alterações estão
-- em docs/esquema/02_funcoes.sql, testadas em docs/esquema/testes/90_cliente.sql.
-- =============================================================================

-- A vista pública ganha a antecedência de cancelamento e a janela de marcação (colunas no fim).
create or replace view publico_inquilinos as
  select id, slug, nome, vertical, descricao,
         case when mostrar_historia then historia end as historia,
         cidade, morada, codigo_postal, telefone, whatsapp, instagram, facebook, tiktok,
         case when mostrar_mapa then google_maps_url end as google_maps_url,
         google_avaliacao_url, livro_reclamacoes_url, logo_url, capa_cor, capa_foto_url, galeria_urls,
         hora_abertura, hora_fecho, dias_descanso, intervalo_almoco_inicio, intervalo_almoco_fim,
         aberto, public.funcionalidade_ativa(id, 'multilinguagem') as multilinguagem_ativa,
         dominio_proprio, selos_necessarios,
         -- A marcação pública mostra a regra de cancelamento (H.2) e só os dias da janela (D-125).
         antecedencia_cancelamento_min, janela_marcacao_dias
    from inquilinos where estado = 'ativo';

-- Código de convite pessoal (F.4.5): seis caracteres, gerado no primeiro acesso à área de
-- cliente. Só o próprio cliente o pede; o cliente não altera a sua ficha diretamente (D-125).
create or replace function public.meu_codigo_convite(p_inquilino uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare c public.clientes%rowtype; v_codigo text; v_alfabeto text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  select * into c from public.clientes
   where inquilino_id = p_inquilino and auth_user_id = auth.uid() and anonimizado_em is null for update;
  if not found then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if c.codigo_convite is not null then return c.codigo_convite; end if;
  loop
    select string_agg(substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::integer, 1), '')
      into v_codigo from generate_series(1, 6);
    exit when not exists (select 1 from public.clientes where codigo_convite = v_codigo);
  end loop;
  update public.clientes set codigo_convite = v_codigo where id = c.id;
  return v_codigo;
end $$;

-- O cartão de selos do próprio cliente (E.4): saldo, selos necessários e o nome do prémio
-- quando ativo. A página pública não mostra a fidelização; só a área de cliente (D-125).
create or replace function public.meu_cartao_selos(p_inquilino uuid)
returns table (selos integer, necessarios integer, premio text)
language sql stable security definer set search_path = '' as $$
  select coalesce((select sum(m.quantidade)::integer from public.movimentos_selos m where m.cliente_id = c.id), 0),
         i.selos_necessarios,
         case when i.premio_ativo then (select s.nome from public.servicos s where s.id = i.premio_servico_id) end
    from public.clientes c join public.inquilinos i on i.id = c.inquilino_id
   where c.inquilino_id = p_inquilino and c.auth_user_id = auth.uid()
     and public.funcionalidade_ativa(p_inquilino, 'fidelizacao_selos')
$$;

revoke execute on function public.meu_codigo_convite(uuid), public.meu_cartao_selos(uuid) from public, anon, authenticated;
grant execute on function public.meu_codigo_convite(uuid), public.meu_cartao_selos(uuid) to authenticated;
