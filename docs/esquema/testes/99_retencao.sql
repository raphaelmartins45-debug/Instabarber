-- =============================================================================
-- Testes da retenção da auditoria (D-157): só o super_admin com dois fatores apaga, nunca com
-- menos de 12 meses, e só os registos mais antigos do que o prazo; o apagamento fica registado.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auditoria (inquilino_id, accao, criado_em) values
  (null, 'teste_antigo', now() - interval '30 months'),
  (null, 'teste_antigo', now() - interval '25 months'),
  (null, 'teste_recente', now() - interval '23 months');

select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$select apagar_auditoria_antiga(24)$$, 'RET: o dono não apaga a auditoria');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.erro($$select apagar_auditoria_antiga(24)$$, 'RET: o super_admin sem dois fatores não apaga');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$select apagar_auditoria_antiga(6)$$, 'RET: o prazo nunca é inferior a 12 meses');
select teste.ok(apagar_auditoria_antiga(24) = 2, 'RET: apaga só os registos com mais de 24 meses');
select teste.ok((select count(*) from auditoria where accao = 'teste_recente') = 1,
                'RET: os registos dentro do prazo ficam');
select teste.ok((select (detalhes ->> 'n')::int from auditoria where accao = 'auditoria_antiga_apagada'
                  order by id desc limit 1) = 2, 'RET: o apagamento fica registado com o número');
rollback;
