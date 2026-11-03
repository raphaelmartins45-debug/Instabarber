-- O estilo da página pública de cada barbearia (D-198): Clássico, Urbano, Luxo ou Vintage, a
-- letra e o acabamento do nome e dos títulos. O gestor escolhe na Gestão do sistema (Marca).
-- Com ele, a cor de fundo do logótipo, para a capa ter a mesma cor e o logótipo encaixar.

alter table public.inquilinos
  add column estilo_pagina text not null default 'classico'
    check (estilo_pagina in ('classico','urbano','luxo','vintage')),
  -- A cor de fundo do logótipo, lida ao carregá-lo: a capa usa-a para o logótipo encaixar
  add column logo_fundo text check (logo_fundo ~ '^#[0-9A-F]{6}$');

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
         antecedencia_cancelamento_min, janela_marcacao_dias,
         -- O estilo da página pública e a cor de fundo do logótipo (D-198)
         estilo_pagina, logo_fundo
    from inquilinos where estado = 'ativo';
