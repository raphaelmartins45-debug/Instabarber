-- =============================================================================
-- Testes das regras que gravam dinheiro e selos: comissão (F.4.8), clube
-- (F.4.2), prémio e convite (F.2.1, F.4.5), faltas (F.8), loja (F.4.4),
-- acertos (F.4.11), limite de profissionais (D.5), acesso por código (B9),
-- anonimização (H).
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on

begin;
-- Rafael (A1) conclui o corte das 10:00 do João: 15,00 €, comissão por omissão 50 %
select teste.como('10000000-0000-0000-0000-000000000003');
create temp table v1 as select concluir_marcacao('50000000-0000-0000-0000-000000000001') as id;
reset role;
select teste.ok((select (base_comissao, comissao_percent, comissao_valor, modelo_caixa, emitente) = (15.00, 50.00, 7.50, 'A', 'barbearia')
  from visitas where id = (select id from v1)), 'serviço normal: comissão 50 % sobre o valor cobrado (7,50 €)');
select teste.ok((select selos from saldo_selos where cliente_id = '40000000-0000-0000-0000-000000000001') = 1, 'o serviço concluído credita 1 selo');
select teste.erro($$select concluir_marcacao('50000000-0000-0000-0000-000000000001')$$, 'não se conclui duas vezes');

-- Percentagem por serviço substitui a de omissão
insert into comissoes_servico (inquilino_id, profissional_id, servico_id, percentagem)
values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 40);

-- Serviço com desconto de hora morta: comissão sobre o preço com desconto
update inquilino_funcionalidades set ativa = true where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'precos_dinamicos';
insert into periodos_desconto (inquilino_id, dia_semana, hora_inicio, hora_fim, percentagem)
values ('aaaaaaaa-0000-0000-0000-000000000000', 3, '14:00', '17:00', 20);
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000010', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','15:00'), 'balcao');
select teste.ok((select (valor_tabela, desconto_percent, valor_cobrado) = (15.00, 20.00, 12.00) from marcacoes
  where id = '50000000-0000-0000-0000-000000000010'), 'a marcação ao balcão também leva o desconto do período');
select teste.como('10000000-0000-0000-0000-000000000003');
create temp table v2 as select concluir_marcacao('50000000-0000-0000-0000-000000000010') as id;
reset role;
select teste.ok((select (base_comissao, comissao_percent, comissao_valor) = (12.00, 40.00, 4.80) from visitas where id = (select id from v2)),
  'C5: hora morta → comissão 40 % sobre 12,00 € = 4,80 €');

-- Clube: plano com 2 cortes, ciclo pago; serviço com crédito → cobrado 0, comissão sobre a tabela
insert into clubes (id, inquilino_id, nome, preco_mensal) values
  ('60000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', 'Plano Cabelo', 25);
insert into subscricoes (id, inquilino_id, cliente_id, clube_id, inicio, proxima_renovacao) values
  ('61000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
   '60000000-0000-0000-0000-000000000001', current_date, current_date + 30);
insert into ciclos_clube (id, inquilino_id, subscricao_id, inicio, fim, valor, pago_em, metodo) values
  ('62000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', '61000000-0000-0000-0000-000000000001',
   current_date, current_date + 30, 25, now(), 'mbway');
insert into creditos_clube (inquilino_id, ciclo_id, servico_id, quantidade) values
  ('aaaaaaaa-0000-0000-0000-000000000000', '62000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 2);
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000011', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','09:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000003');
create temp table v3 as select concluir_marcacao('50000000-0000-0000-0000-000000000011', 'credito_clube') as id;
reset role;
select teste.ok((select (valor_cobrado, base_comissao, comissao_valor) = (0.00, 15.00, 6.00) from visitas where id = (select id from v3)),
  'C5: crédito do clube → cobrado 0 €, comissão sobre a tabela (40 % de 15 € = 6 €)');
select teste.ok((select usados from creditos_clube where ciclo_id = '62000000-0000-0000-0000-000000000001') = 1, 'o crédito usado desconta do ciclo');
select teste.ok((select credito_id is not null from marcacoes where id = '50000000-0000-0000-0000-000000000011'), 'a marcação fica ligada ao crédito');

-- Sem crédito do serviço: erro claro
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000012', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', instante_lisboa('2026-11-04','11:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select concluir_marcacao('50000000-0000-0000-0000-000000000012', 'credito_clube')$$, 'barba não está no plano: sem crédito');
reset role;

-- Prémio: 3 selos, prémio = Corte. O João tem 3 selos (3 serviços concluídos)
update inquilinos set selos_necessarios = 3, premio_ativo = true, premio_servico_id = '30000000-0000-0000-0000-000000000001'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok((select selos from saldo_selos where cliente_id = '40000000-0000-0000-0000-000000000001') = 3, 'o João tem 3 selos');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select concluir_marcacao('50000000-0000-0000-0000-000000000012', 'premio')$$, 'o prémio é o Corte, não a Barba');
reset role;
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000013', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','12:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000003');
create temp table v4 as select concluir_marcacao('50000000-0000-0000-0000-000000000013', 'premio') as id;
reset role;
select teste.ok((select valor_cobrado from visitas where id = (select id from v4)) = 0, 'o prémio entra como serviço prestado a 0 €');
select teste.ok((select selos from saldo_selos where cliente_id = '40000000-0000-0000-0000-000000000001') = 0, 'C6: o resgate consome 3 selos; o excedente transitaria');
select teste.ok((select valor_tabela from movimentos_selos where tipo = 'resgate' and visita_id = (select id from v4)) = 15.00,
  'o resgate guarda o valor do prémio no momento');
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000017', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','13:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select concluir_marcacao('50000000-0000-0000-0000-000000000017', 'premio')$$, 'sem selos suficientes não há prémio');
reset role;

-- Convite: o Pedro foi convidado pelo João; o primeiro serviço do Pedro dá 1 selo ao João, uma só vez
update clientes set convidado_por = '40000000-0000-0000-0000-000000000001' where id = '40000000-0000-0000-0000-000000000002';
update marcacoes set estado = 'agendada' where id = '50000000-0000-0000-0000-000000000002';
select teste.como('10000000-0000-0000-0000-000000000004');
select concluir_marcacao('50000000-0000-0000-0000-000000000002');
reset role;
select teste.ok((select selos from saldo_selos where cliente_id = '40000000-0000-0000-0000-000000000001') = 1, 'convite: quem convidou ganha 1 selo');
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000014', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','13:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000004');
select concluir_marcacao('50000000-0000-0000-0000-000000000014');
reset role;
select teste.ok((select selos from saldo_selos where cliente_id = '40000000-0000-0000-0000-000000000001') = 1, 'convite: o segundo serviço já não dá selo');

-- Sem a funcionalidade de selos, não se creditam selos
update inquilino_funcionalidades set ativa = false where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'fidelizacao_selos';
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000015', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','14:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000004');
select concluir_marcacao('50000000-0000-0000-0000-000000000015');
reset role;
select teste.ok((select selos from saldo_selos where cliente_id = '40000000-0000-0000-0000-000000000002') = 2, 'funcionalidade desligada: o Pedro fica com os 2 selos que tinha');

-- Modelo de caixa C: emitente é o barbeiro (preparação fiscal)
update profissionais set modelo_caixa = 'C', renda_valor = 500 where id = '20000000-0000-0000-0000-000000000002';
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('50000000-0000-0000-0000-000000000016', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','15:00'), 'balcao');
select teste.como('10000000-0000-0000-0000-000000000004');
create temp table v5 as select concluir_marcacao('50000000-0000-0000-0000-000000000016') as id;
reset role;
select teste.ok((select (modelo_caixa, emitente) = ('C', 'profissional') from visitas where id = (select id from v5)),
  'modelo C: o emitente fica registado como o barbeiro');

-- O histórico não se reescreve: mudar a percentagem não muda a visita registada
update comissoes_servico set percentagem = 70 where profissional_id = '20000000-0000-0000-0000-000000000001';
select teste.ok((select comissao_valor from visitas where id = (select id from v2)) = 4.80, 'alterar percentagens não altera comissões registadas');
rollback;

-- ------------------------------------------------------------- política de faltas (F.8)
begin;
update inquilinos set limite_faltas = 2 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem, estado)
select 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002',
       '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04', h), 'balcao', 'agendada'
  from (values (time '14:00'), (time '15:00')) x(h);
update marcacoes set estado = 'falta' where cliente_id = '40000000-0000-0000-0000-000000000002' and hora_local(inicio)::time in ('14:00','15:00');
update marcacoes set inicio = inicio - interval '20 days' where estado = 'falta';
select teste.ok(not pode_marcar_online('40000000-0000-0000-0000-000000000002'), 'duas faltas: deixa de marcar online');
select teste.anonimo();
create temp table r as select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','16:00'), '20000000-0000-0000-0000-000000000001');
select teste.erro($$select confirmar_reserva((select marcacao_id from r), (select token from r), 'Pedro', '+351912000002')$$,
  'a confirmação online é recusada a quem atingiu o limite');
reset role;
update clientes set faltas_perdoadas_em = now() where id = '40000000-0000-0000-0000-000000000002';
select teste.ok(pode_marcar_online('40000000-0000-0000-0000-000000000002'), 'o gestor perdoa as faltas e o cliente volta a marcar');
update inquilino_funcionalidades set ativa = false where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'politica_faltas';
update clientes set faltas_perdoadas_em = null where id = '40000000-0000-0000-0000-000000000002';
select teste.ok(pode_marcar_online('40000000-0000-0000-0000-000000000002'), 'funcionalidade desligada: sem bloqueio');
rollback;

-- ------------------------------------------------------------- loja (F.4.4)
begin;
insert into produtos (id, inquilino_id, nome, custo, iva_percent, preco_venda, stock, stock_minimo) values
  ('70000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', 'Pomada', 6.50, 23, 12.00, 5, 2);
select teste.anonimo();
create temp table p as select criar_pedido_loja('aaaaaaaa-0000-0000-0000-000000000000', 'Rui', '+351916666666',
  '[{"produto_id":"70000000-0000-0000-0000-000000000001","quantidade":2}]') as id;
grant select on p to authenticated;
select teste.erro($$select criar_pedido_loja('aaaaaaaa-0000-0000-0000-000000000000', 'Rui', '+351916666666',
  '[{"produto_id":"70000000-0000-0000-0000-000000000001","quantidade":9}]')$$, 'não se encomenda mais do que o stock');
reset role;
select teste.ok((select total from pedidos_loja where id = (select id from p)) = 24.00, 'o total calcula-se na base de dados (2 × 12,00 €)');
select teste.ok((select stock from produtos where id = '70000000-0000-0000-0000-000000000001') = 5, 'encomenda nova não mexe no stock');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$update pedidos_loja set estado = 'levantado' where id = (select id from p)$$, 'levantar só pela função');
select levantar_pedido((select id from p));
reset role;
select teste.ok((select stock from produtos where id = '70000000-0000-0000-0000-000000000001') = 3, 'levantado: o stock desconta');
select teste.erro($$select levantar_pedido((select id from p))$$, 'não se levanta duas vezes');
rollback;

-- ------------------------------------------------------------- acertos e limite de profissionais
begin;
insert into acertos (id, inquilino_id, profissional_id, mes_referencia, modelo, receita, parte_barbeiro, parte_barbearia, sentido)
values ('80000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
        '2026-10-01', 'A', 2140, 749, 1391, 'a_pagar');
update acertos set estado = 'liquidado', valor_liquidado = 749, metodo = 'mbway', liquidado_em = now()
 where id = '80000000-0000-0000-0000-000000000001';
select teste.erro($$update acertos set valor_liquidado = 1 where id = '80000000-0000-0000-0000-000000000001'$$, 'acerto liquidado não se reescreve');
insert into acertos (inquilino_id, profissional_id, mes_referencia, tipo, modelo, receita, parte_barbeiro, parte_barbearia, sentido)
values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', '2026-10-01', 'correcao', 'A', 0, -20, 20, 'a_receber');
select teste.ok((select count(*) from acertos where profissional_id = '20000000-0000-0000-0000-000000000001') = 2, 'correção é um acerto novo');

insert into profissionais (inquilino_id, nome, nome_apresentado) values ('aaaaaaaa-0000-0000-0000-000000000000', 'Terceiro', 'Terceiro');
select teste.erro($$insert into profissionais (inquilino_id, nome, nome_apresentado) values ('aaaaaaaa-0000-0000-0000-000000000000', 'Quarto', 'Quarto')$$,
  'D.5: não passa dos profissionais contratados (3)');
select teste.erro($$update inquilinos set plano = 'basic', profissionais_contratados = 1 where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'J.2: não passa a Basic com três profissionais ativos');
update profissionais set ativo = false where id = '20000000-0000-0000-0000-000000000002';
select teste.ok((select count(*) from marcacoes where id = '50000000-0000-0000-0000-000000000002' and profissional_id is null) = 1,
  'barbeiro desativado: as marcações futuras ficam sem profissional');
update profissionais set ativo = false where nome = 'Terceiro';
update inquilinos set plano = 'basic', profissionais_contratados = 1 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok((select plano = 'basic' from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'J.2: com um só profissional ativo, passa a Basic');
insert into fila_espera (id, inquilino_id, cliente_id, servico_id, dia)
values ('90000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001', '2026-11-04');
update fila_espera set estado = 'avisado', avisado_em = now(), expira_em = now() + interval '30 minutes'
 where id = '90000000-0000-0000-0000-000000000001';
select teste.erro($$update fila_espera set expira_em = null where id = '90000000-0000-0000-0000-000000000001'$$,
  'F.4.1: avisado exige prazo de resposta');
update fila_espera set estado = 'removido' where id = '90000000-0000-0000-0000-000000000001';
select teste.ok((select estado = 'removido' from fila_espera where id = '90000000-0000-0000-0000-000000000001'),
  'F.4.1: quem foi avisado pode ser retirado da fila');
rollback;

-- ------------------------------------------------------------- acesso do cliente por código (B9)
begin;
select teste.anonimo();
select pedir_codigo_acesso('aaaaaaaa-0000-0000-0000-000000000000', '+351912000002');
select pedir_codigo_acesso('aaaaaaaa-0000-0000-0000-000000000000', '+351999999999');
reset role;
select teste.ok((select count(*) from codigos_acesso) = 1, 'número desconhecido não gera código (e a resposta é igual)');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from codigos_acesso) = 1, 'o dono vê o código para o enviar por wa.me');
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) from codigos_acesso) = 0, 'outra barbearia não vê o código');
reset role;
set local role service_role;
select teste.ok(verificar_codigo_acesso('aaaaaaaa-0000-0000-0000-000000000000', '+351912000002', '999999x') is null, 'código errado: recusado');
select teste.ok(verificar_codigo_acesso('aaaaaaaa-0000-0000-0000-000000000000', '+351912000002',
  (select codigo from codigos_acesso limit 1)) = '40000000-0000-0000-0000-000000000002', 'código certo: devolve o cliente');
select teste.ok(verificar_codigo_acesso('aaaaaaaa-0000-0000-0000-000000000000', '+351912000002',
  (select codigo from codigos_acesso limit 1)) is null, 'o código só serve uma vez');
reset role;
rollback;

-- ------------------------------------------------------------- limites de pedidos (F.6)
begin;
set local role service_role;
select teste.ok(consumir_limite('teste:ip:1', 2, interval '1 hour') and consumir_limite('teste:ip:1', 2, interval '1 hour'),
  'os dois primeiros pedidos passam');
select teste.ok(not consumir_limite('teste:ip:1', 2, interval '1 hour'), 'o terceiro na mesma hora é recusado');
reset role;
update limites_pedidos set janela_inicio = now() - interval '2 hours' where chave = 'teste:ip:1';
set local role service_role;
select teste.ok(consumir_limite('teste:ip:1', 2, interval '1 hour'), 'passada a janela, volta a passar');
reset role;
select teste.anonimo();
select teste.erro($$select consumir_limite('x', 1, interval '1 hour')$$, 'o anónimo não mexe nos limites');
select teste.ok((select count(*) from limites_pedidos) = 0, 'nem os lê');
reset role;
rollback;

-- ------------------------------------------------------------- acesso direto na primeira marcação (D-28)
begin;
select teste.anonimo();
create temp table r as select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','16:00'), '20000000-0000-0000-0000-000000000001');
select confirmar_reserva((select marcacao_id from r), (select token from r), 'Nova', '+351917777777');
select teste.erro($$select pode_criar_acesso_direto((select id from clientes limit 1))$$, 'o anónimo não chama a verificação');
reset role;
set local role service_role;
select teste.ok(pode_criar_acesso_direto((select id from clientes where telefone = '+351917777777')), 'número novo: pode escolher a palavra-passe já');
select teste.ok(not pode_criar_acesso_direto('40000000-0000-0000-0000-000000000002'), 'número com ficha antiga: precisa do código');
select teste.ok(not pode_criar_acesso_direto('40000000-0000-0000-0000-000000000001'), 'cliente que já tem conta: precisa do código');
reset role;
rollback;

-- ------------------------------------------------------------- leitura do super_admin para exportação
begin;
insert into produtos (inquilino_id, nome, custo, preco_venda) values ('aaaaaaaa-0000-0000-0000-000000000000', 'Pomada', 6, 12);
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from produtos) = 1 and (select count(*) from visitas) >= 0, 'super_admin lê todas as tabelas para exportar');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.ok((select count(*) from produtos) = 0, 'sem dois fatores, não lê');
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) from produtos) = 0, 'a leitura do super_admin não se estende a outros papéis');
reset role;
rollback;

-- ------------------------------------------------------------- eliminar uma barbearia (fim do contrato)
begin;
insert into visitas (inquilino_id, marcacao_id, cliente_id, profissional_id, servico_id, data, valor_tabela, valor_cobrado,
                     base_comissao, comissao_percent, comissao_valor, modelo_caixa)
values ('bbbbbbbb-0000-0000-0000-000000000000', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', now(), 14, 14, 14, 50, 7, 'A');
insert into movimentos_selos (inquilino_id, cliente_id, tipo, quantidade, visita_id)
select inquilino_id, cliente_id, 'visita', 1, id from visitas where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000';
select teste.erro($$delete from servicos where id = '30000000-0000-0000-0000-000000000003'$$, 'um serviço com visitas não se apaga');
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.erro($$select * from eliminar_inquilino('bbbbbbbb-0000-0000-0000-000000000000', 'barbearia-b')$$, 'o dono não elimina a barbearia');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$select * from eliminar_inquilino('bbbbbbbb-0000-0000-0000-000000000000', 'barbearia-b')$$, 'só se elimina uma barbearia cancelada');
reset role;
update inquilinos set estado = 'cancelado' where id = 'bbbbbbbb-0000-0000-0000-000000000000';
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$select * from eliminar_inquilino('bbbbbbbb-0000-0000-0000-000000000000', 'outra')$$, 'a confirmação tem de ser o slug');
create temp table contas as select * from eliminar_inquilino('bbbbbbbb-0000-0000-0000-000000000000', 'barbearia-b');
reset role;
select teste.ok((select count(*) from clientes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000') = 0
  and (select count(*) from visitas where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000') = 0
  and (select count(*) from movimentos_selos where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000') = 0,
  'a barbearia cancelada é eliminada com todos os dados');
select teste.ok((select count(*) from contas) = 3, 'devolve as três contas sem uso (dono, barbeiro, cliente) para apagar');
select teste.ok((select count(*) from clientes where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000') = 2, 'a outra barbearia fica intacta');
select teste.ok((select count(*) from auditoria where accao = 'inquilino_eliminado') = 1, 'a eliminação fica em auditoria');
rollback;

-- ------------------------------------------------------------- anonimização (H)
begin;
select teste.como('10000000-0000-0000-0000-000000000002');
select anonimizar_cliente('40000000-0000-0000-0000-000000000001');
reset role;
select teste.ok((select nome = 'Cliente eliminado' and telefone is null and auth_user_id is null and anonimizado_em is not null
  from clientes where id = '40000000-0000-0000-0000-000000000001'), 'dados pessoais apagados');
select teste.ok((select count(*) from marcacoes where cliente_id = '40000000-0000-0000-0000-000000000001') = 1, 'os registos ficam, anonimizados');
rollback;

\echo '== regras: todos os testes passaram'
