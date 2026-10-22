-- =============================================================================
-- Testes da suspensão sem perder dados (Fase 7, M.4, D-127): a página pública sabe que a
-- barbearia está suspensa sem ver os dados; a equipa deixa de ver os dados; o gestor continua a
-- ver o seu plano e as faturas; ao reativar, tudo volta.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
update inquilinos set estado = 'suspenso' where id = 'bbbbbbbb-0000-0000-0000-000000000000';
insert into faturas_plataforma (inquilino_id, numero, valor, periodo_inicio, periodo_fim, emitida_em)
values ('bbbbbbbb-0000-0000-0000-000000000000', 'FT 2026/99', 47.97, '2026-10-01', '2026-10-31', '2026-10-01');

select teste.anonimo();
select teste.ok(barbearia_suspensa('barbearia-b'), 'SUSP: a página pública sabe que a B está suspensa');
select teste.ok(not barbearia_suspensa('barbearia-a'), 'SUSP: a A, ativa, não está suspensa');
select teste.ok(not barbearia_suspensa('nao-existe'), 'SUSP: um slug inexistente não está suspenso');
select teste.ok((select count(*) = 0 from publico_inquilinos where slug = 'barbearia-b'),
                'SUSP: a vista pública não mostra a barbearia suspensa');

select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) = 0 from clientes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'),
                'SUSP: o gestor suspenso deixa de ver os clientes');
select teste.ok((select count(*) = 1 from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
                'SUSP: o gestor suspenso continua a ver o seu plano');
select teste.ok((select count(*) = 1 from faturas_plataforma where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'),
                'SUSP: o gestor suspenso continua a ver as faturas');
select teste.como('10000000-0000-0000-0000-000000000006');
select teste.ok((select count(*) = 0 from marcacoes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'),
                'SUSP: o barbeiro da barbearia suspensa não vê marcações');

reset role;
update inquilinos set estado = 'ativo' where id = 'bbbbbbbb-0000-0000-0000-000000000000';
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) = 1 from clientes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000')
                and (select count(*) = 1 from marcacoes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'),
                'SUSP: ao reativar, os clientes e as marcações voltam como estavam');
rollback;
