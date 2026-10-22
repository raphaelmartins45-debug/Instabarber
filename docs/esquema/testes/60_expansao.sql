-- =============================================================================
-- Testes da preparação para outros países (Parte P): colunas dormentes.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
select teste.ok((select pais = 'PT' and fuso = 'Europe/Lisbon' and moeda = 'EUR' and idioma = 'pt-PT'
                   from inquilinos order by criado_em limit 1),
                'P: uma barbearia nasce com Portugal, Europe/Lisbon, EUR e pt-PT');
select teste.erro($$update inquilinos set pais = 'ES'$$, 'P: outro país está desativado');
select teste.erro($$update inquilinos set pais = 'BR', moeda = 'BRL', idioma = 'pt-BR', fuso = 'America/Sao_Paulo'$$, 'P: o Brasil está desativado');
select teste.erro($$update inquilinos set moeda = 'USD'$$, 'P: outra moeda está desativada');
select teste.erro($$update inquilinos set idioma = 'es-ES'$$, 'P: outro idioma está desativado');
select teste.erro($$update inquilinos set fuso = 'Europe/Madrid'$$, 'P: outro fuso está desativado');
select teste.erro($$update inquilinos set pais = null$$, 'P: o país não pode ficar vazio');
rollback;
