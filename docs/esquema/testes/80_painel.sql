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

-- Política de faltas: duas faltas (o limite por omissão) bloqueiam a marcação online.
reset role;
-- Na mesma instrução: uma falta não passa pela validação do horário (o teste corre a qualquer hora).
update marcacoes set inicio = now() - interval '2 days', estado = 'falta'
 where id = '50000000-0000-0000-0000-000000000002';
insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem, estado)
values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002',
        now() - interval '9 days', 'balcao', 'falta');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok(marcacao_online_bloqueada('40000000-0000-0000-0000-000000000002'),
                'PAINEL: com duas faltas a marcação online fica bloqueada');
update clientes set faltas_perdoadas_em = now() where id = '40000000-0000-0000-0000-000000000002';
select teste.ok(not marcacao_online_bloqueada('40000000-0000-0000-0000-000000000002'),
                'PAINEL: o gestor volta a permitir a marcação online');
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.erro($$select marcacao_online_bloqueada('40000000-0000-0000-0000-000000000002')$$,
                  'PAINEL: outra barbearia não pergunta pelo cliente');

-- Clube: inscrição, ciclo por pagar, créditos, renovação no mesmo dia do mês e transitar crédito.
reset role;
insert into clubes (id, inquilino_id, nome, preco_mensal, transita_credito)
values ('60000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', 'Plano Cabelo', 25, true);
insert into clube_servicos (inquilino_id, clube_id, servico_id, quantidade_mes)
values ('aaaaaaaa-0000-0000-0000-000000000000', '60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 2);
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select inscrever_clube('40000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '2027-01-31')$$,
                  'PAINEL: o barbeiro não inscreve clientes no clube');
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.erro($$select inscrever_clube('40000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '2027-01-31')$$,
                  'PAINEL: outra barbearia também não');
select teste.como('10000000-0000-0000-0000-000000000002');
create temp table s as
  select inscrever_clube('40000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '2027-01-31') as id;
grant select on s to authenticated;
select teste.ok((select proxima_renovacao = '2027-02-28' from subscricoes where id = (select id from s)),
                'PAINEL: inscrição a 31 renova no último dia de fevereiro');
select teste.ok((select pago_em is null and valor = 25 and fim = '2027-03-02' from ciclos_clube where subscricao_id = (select id from s)),
                'PAINEL: o primeiro ciclo nasce por pagar, com o preço e a validade do plano');
select teste.ok((select quantidade = 2 from creditos_clube cc join ciclos_clube ci on ci.id = cc.ciclo_id
                  where ci.subscricao_id = (select id from s)),
                'PAINEL: o ciclo traz os créditos do plano');
update ciclos_clube set pago_em = now(), metodo = 'mbway' where subscricao_id = (select id from s);
select renovar_subscricao((select id from s));
select teste.ok((select quantidade = 4 from creditos_clube cc join ciclos_clube ci on ci.id = cc.ciclo_id
                  where ci.subscricao_id = (select id from s) and ci.inicio = '2027-02-28'),
                'PAINEL: o crédito não usado de um ciclo pago transita para o seguinte');
select teste.ok((select proxima_renovacao = '2027-03-31' from subscricoes where id = (select id from s)),
                'PAINEL: a renovação volta ao dia 31 em março');
update subscricoes set estado = 'cancelada', cancelada_em = now() where id = (select id from s);
select teste.erro($$select renovar_subscricao((select id from s))$$, 'PAINEL: subscrição cancelada não renova');
rollback;