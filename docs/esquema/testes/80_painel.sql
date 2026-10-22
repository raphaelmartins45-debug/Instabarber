-- =============================================================================
-- Testes do painel da barbearia (Fase 4, D-121): cartões oferta vendidos e usados
-- ao balcão, com código único, validade e saldo verificados na base de dados.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- O gestor da barbearia A vende um cartão de 30 €.
select teste.como('10000000-0000-0000-0000-000000000002');
create temp table c as
  select vender_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000', 30, 'Ana Compradora', 'Rui', 'dinheiro') as id;
grant select on c to authenticated;
select teste.ok((select codigo ~ '^[A-HJ-NP-Z2-9]{8}$' from cartoes_oferta where id = (select id from c)),
                'PAINEL: o cartão nasce com um código de oito caracteres');
select teste.ok((select valido_ate = hoje_lisboa() + 365 or valido_ate = hoje_lisboa() + 366
                   from cartoes_oferta where id = (select id from c)),
                'PAINEL: validade por omissão de um ano');

-- O barbeiro usa 20 € no fecho de uma marcação dele.
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.ok(usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000',
                  (select lower(codigo) from cartoes_oferta where id = (select id from c)), 20,
                  '50000000-0000-0000-0000-000000000001') = 10,
                'PAINEL: o uso desconta e devolve o saldo (o código aceita minúsculas)');
select teste.ok((select cartao_oferta_id = (select id from c) from marcacoes
                  where id = '50000000-0000-0000-0000-000000000001'),
                'PAINEL: a marcação fica ligada ao cartão');
select teste.erro($$select usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000',
                    (select codigo from cartoes_oferta where id = (select id from c)), 10.01)$$,
                  'PAINEL: não se usa mais do que o saldo');
select teste.erro($$select usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000',
                    (select codigo from cartoes_oferta where id = (select id from c)), 0)$$,
                  'PAINEL: o valor a usar é positivo');
select teste.erro($$select usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000', 'ZZZZZZZZ', 1)$$,
                  'PAINEL: código inexistente recusado');

-- Outra barbearia não vende nem usa cartões da A.
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.erro($$select usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000',
                    (select codigo from cartoes_oferta where id = (select id from c)), 1)$$,
                  'PAINEL: o gestor de outra barbearia não usa o cartão');
select teste.erro($$select vender_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000', 10, 'X')$$,
                  'PAINEL: nem vende cartões em nome dela');
select teste.anonimo();
select teste.erro($$select vender_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000', 10, 'X')$$,
                  'PAINEL: sem sessão não se vende');

-- Anulado ou expirado: não aceita usos.
select teste.como('10000000-0000-0000-0000-000000000002');
update cartoes_oferta set anulado_em = now() where id = (select id from c);
select teste.erro($$select usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000',
                    (select codigo from cartoes_oferta where id = (select id from c)), 1)$$,
                  'PAINEL: cartão anulado não aceita usos');
create temp table c2 as
  select vender_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000', 10, 'Bruno', null, 'mbway',
                              hoje_lisboa() - 1) as id;
grant select on c2 to authenticated;
select teste.erro($$select usar_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000',
                    (select codigo from cartoes_oferta where id = (select id from c2)), 1)$$,
                  'PAINEL: cartão expirado não aceita usos');

-- Com a funcionalidade desligada, não se vende.
reset role;
update inquilino_funcionalidades set ativa = false
 where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'cartoes_oferta';
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$select vender_cartao_oferta('aaaaaaaa-0000-0000-0000-000000000000', 10, 'X')$$,
                  'PAINEL: sem a funcionalidade cartoes_oferta não se vende');
rollback;
