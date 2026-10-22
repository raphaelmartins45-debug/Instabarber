-- =============================================================================
-- Testes de isolamento (C.6): duas barbearias × cinco papéis.
-- Cada bloco corre numa transação desfeita no fim. Para à primeira falha.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

-- ---------------------------------------------------------------- dono da A
begin;
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from clientes) = 2, 'dono A vê os 2 clientes da A');
select teste.ok((select count(*) from clientes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000') = 0, 'dono A não vê clientes da B');
select teste.ok((select count(*) from marcacoes) = 2, 'dono A vê só as marcações da A');
select teste.ok((select count(*) from inquilinos) = 1, 'dono A só lê a sua barbearia');
select teste.zero($$update clientes set nome = 'x' where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'$$, 'dono A não altera clientes da B');
select teste.zero($$update inquilinos set nome = 'x' where id = 'bbbbbbbb-0000-0000-0000-000000000000'$$, 'dono A não altera a barbearia B');
select teste.erro($$insert into clientes (inquilino_id, nome, telefone) values ('bbbbbbbb-0000-0000-0000-000000000000', 'x', '+351919999999')$$, 'dono A não cria clientes na B');
select teste.erro($$insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
  values ('bbbbbbbb-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003',
          '30000000-0000-0000-0000-000000000003', instante_lisboa('2026-11-04','15:00'), 'balcao')$$, 'dono A não marca na B');
select teste.erro($$insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000003',
          '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','15:00'), 'balcao')$$, 'chave composta: marcação da A com barbeiro da B é impossível');
select teste.ok((select count(*) from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000') = 1, 'dono A lê a sua barbearia');
select teste.erro($$update inquilinos set plano = 'pro', profissionais_contratados = 8 where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$, 'B2: dono A não muda o plano');
select teste.erro($$update inquilinos set estado_pagamento = 'em_atraso' where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$, 'dono A não muda o estado de pagamento');
with x as (update inquilinos set nome = 'Barbearia A+' where id = 'aaaaaaaa-0000-0000-0000-000000000000' returning 1)
select teste.ok((select count(*) from x) = 1, 'dono A muda o nome da sua barbearia');
select teste.zero($$update inquilino_funcionalidades set ativa = true where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000'$$, 'B2: dono A não liga funcionalidades');
select teste.erro($$insert into inquilino_funcionalidades (inquilino_id, chave, ativa) values ('aaaaaaaa-0000-0000-0000-000000000000', 'multilinguagem', true)$$, 'B2: dono A não acrescenta funcionalidades');
select teste.ok((select count(*) from inquilino_funcionalidades) = 31, 'dono A lê a grelha da sua barbearia');
select teste.erro($$select anonimizar_cliente('40000000-0000-0000-0000-000000000003')$$, 'B4: dono A não anonimiza cliente da B');
select teste.ok((select count(*) from pedidos_adesao) = 0, 'dono A não lê pedidos de adesão');
select teste.ok((select count(*) from modulos_plataforma) = 0, 'dono A não vê os módulos desligados');
select teste.ok((select count(*) from auditoria) = 0, 'dono A não lê a auditoria');
with x as (insert into comissoes_servico (inquilino_id, profissional_id, servico_id, percentagem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 40) returning 1)
select teste.ok((select count(*) from x) = 1, 'dono A define comissões da sua equipa');
select teste.ok((select count(*) from custos_fixos) = 1, 'dono A vê os custos fixos');
rollback;

-- ---------------------------------------------------------------- barbeiro 1 da A
begin;
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.ok((select count(*) from marcacoes) = 1, 'barbeiro A1 vê só as suas marcações');
select teste.ok((select count(*) from clientes) = 1, 'barbeiro A1 vê só os seus clientes');
select teste.ok((select count(*) from custos_fixos) = 0, 'barbeiro A1 não vê o financeiro da barbearia');
select teste.ok((select count(*) from profissionais) = 2, 'barbeiro A1 vê a equipa da A');
select teste.erro($$update profissionais set comissao_percent = 90 where id = '20000000-0000-0000-0000-000000000001'$$, 'B3: barbeiro não sobe a própria comissão');
select teste.erro($$update profissionais set modelo_caixa = 'C', renda_valor = 0 where id = '20000000-0000-0000-0000-000000000001'$$, 'barbeiro não muda o seu modelo de caixa');
with x as (update profissionais set nome_apresentado = 'Rafa' where id = '20000000-0000-0000-0000-000000000001' returning 1)
select teste.ok((select count(*) from x) = 1, 'barbeiro muda o nome apresentado');
select teste.zero($$update profissionais set nome_apresentado = 'x' where id = '20000000-0000-0000-0000-000000000002'$$, 'barbeiro não altera a ficha do colega');
select teste.erro($$insert into comissoes_servico (inquilino_id, profissional_id, servico_id, percentagem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 90)$$, 'B3: barbeiro não cria comissões');
select teste.erro($$insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002',
          '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','15:00'), 'balcao')$$, 'barbeiro não marca para o colega');
with x as (insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
          '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','15:00'), 'balcao') returning 1)
select teste.ok((select count(*) from x) = 1, 'barbeiro marca para si ao balcão');
select teste.erro($$select concluir_marcacao('50000000-0000-0000-0000-000000000002')$$, 'barbeiro não conclui marcação do colega');
select teste.erro($$update marcacoes set estado = 'concluida' where id = '50000000-0000-0000-0000-000000000001'$$, 'concluir só pela função');
select teste.zero($$update inquilinos set nome = 'x'$$, 'barbeiro não altera a barbearia');
select teste.erro($$select anonimizar_cliente('40000000-0000-0000-0000-000000000001')$$, 'B4: barbeiro não anonimiza clientes');
with x as (insert into clientes (inquilino_id, nome, telefone)
  values ('aaaaaaaa-0000-0000-0000-000000000000', 'Novo', '+351914444444') returning id)
select teste.ok((select count(*) from x) = 1, 'barbeiro regista cliente novo e vê-o');
select teste.ok((select count(*) from procurar_cliente_por_telefone('aaaaaaaa-0000-0000-0000-000000000000', '+351912000002')) = 1, 'barbeiro encontra cliente pelo telefone exato');
select teste.ok((select count(*) from procurar_cliente_por_telefone('bbbbbbbb-0000-0000-0000-000000000000', '+351913000001')) = 0, 'barbeiro não procura na B');
rollback;

-- ---------------------------------------------------------------- cliente da A
begin;
select teste.como('10000000-0000-0000-0000-000000000007');
select teste.ok((select count(*) from clientes) = 1, 'cliente vê só a sua ficha');
select teste.ok((select count(*) from marcacoes) = 1, 'cliente vê só as suas marcações');
select teste.ok((select count(*) from profissionais) = 0, 'cliente não lê a tabela da equipa');
select teste.ok((select count(*) from inquilinos) = 0, 'cliente não lê a tabela de inquilinos');
select teste.ok((select count(*) from publico_servicos where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000') = 2, 'cliente lê os serviços pela vista pública');
select teste.erro($$insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, valor_tabela, valor_cobrado)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
          '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','16:00'), 15, 0)$$, 'B5: cliente não insere marcações nem escolhe o preço');
select teste.erro($$insert into movimentos_selos (inquilino_id, cliente_id, tipo, quantidade)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', 'ajuste', 50)$$, 'B7: cliente não cria selos');
select teste.erro($$insert into clubes (inquilino_id, nome, preco_mensal) values ('aaaaaaaa-0000-0000-0000-000000000000', 'x', 0)$$, 'B7: cliente não escreve no clube');
select teste.zero($$update clientes set nome = 'x'$$, 'cliente não altera fichas (nem a sua, diretamente)');
select teste.erro($$select concluir_marcacao('50000000-0000-0000-0000-000000000001')$$, 'cliente não conclui serviços');
rollback;

-- ---------------------------------------------------------------- anónimo
begin;
select teste.anonimo();
select teste.ok((select count(*) from clientes) = 0, 'anónimo não lê clientes');
select teste.ok((select count(*) from marcacoes) = 0, 'anónimo não lê marcações');
select teste.ok((select count(*) from inquilinos) = 0, 'anónimo não lê a tabela de inquilinos');
select teste.ok((select count(*) from publico_inquilinos) = 2, 'anónimo lê a vista pública das barbearias ativas');
select teste.ok(not exists (select 1 from information_schema.columns where table_name = 'publico_inquilinos'
  and column_name in ('nif','estado_pagamento','plano','proximo_vencimento')), 'B11: a vista pública não expõe NIF nem dados de cobrança');
select teste.erro($$select anonimizar_cliente('40000000-0000-0000-0000-000000000001')$$, 'B4: anónimo não executa anonimizar_cliente');
select teste.erro($$select verificar_codigo_acesso('aaaaaaaa-0000-0000-0000-000000000000', '+351912000001', '000000')$$, 'anónimo não verifica códigos (só o servidor)');
select teste.erro($$select registar_auditoria(null, 'x', null, null, null)$$, 'anónimo não escreve na auditoria');
select teste.erro($$insert into pedidos_adesao (nome, email_acesso, mensalidade_calculada, aceitou_termos_em) values ('x','x@x.pt',1,now())$$, 'anónimo não escreve pedidos diretamente');
select teste.ok(submeter_pedido_adesao('{"nome":"Nova","email_acesso":"n@x.pt","mensalidade_calculada":19.99,"plano":"basic","profissionais":1,"aceitou_termos":true}') is not null, 'anónimo submete adesão pela função');
select teste.erro($$select submeter_pedido_adesao('{"nome":"Nova","email_acesso":"n@x.pt","mensalidade_calculada":19.99,"palavra_passe":"x","aceitou_termos":true}')$$, 'o formulário nunca aceita palavra-passe');
rollback;

-- ---------------------------------------------------------------- dono da B (simetria)
begin;
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) from clientes) = 1, 'dono B vê só o seu cliente');
select teste.ok((select count(*) from marcacoes where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000') = 0, 'dono B não vê marcações da A');
select teste.ok((select count(*) from visitas) = 0 and (select count(*) from custos_fixos) = 0, 'dono B não vê o financeiro da A');
rollback;

-- ---------------------------------------------------------------- super_admin
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.ok((select count(*) from pedidos_adesao) = 0, 'super_admin sem dois fatores não lê pedidos');
select teste.zero($$update inquilino_funcionalidades set ativa = true$$, 'super_admin sem dois fatores não liga funcionalidades');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from pedidos_adesao) = 1, 'super_admin com dois fatores lê pedidos');
with x as (update inquilino_funcionalidades set ativa = true, bonus = true
  where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'multilinguagem' returning 1)
select teste.ok((select count(*) from x) = 1, 'super_admin liga uma funcionalidade');
select teste.ok((select count(*) from auditoria where accao like 'inquilino_funcionalidades%') >= 1, 'a ativação fica em auditoria');
select teste.ok((select count(*) from modulos_plataforma) = 2, 'super_admin vê os módulos desligados');
rollback;

-- ---------------------------------------------------------------- barbearia suspensa
begin;
update inquilinos set estado = 'suspenso' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from clientes) = 0, 'barbearia suspensa: o dono deixa de ver os dados');
select teste.ok((select count(*) from inquilinos) = 1, 'barbearia suspensa: o dono ainda vê "O meu plano"');
reset role;
select teste.anonimo();
select teste.ok((select count(*) from publico_inquilinos where slug = 'barbearia-a') = 0, 'barbearia suspensa sai da página pública');
rollback;

-- ---------------------------------------------------------------- Storage
begin;
select teste.como('10000000-0000-0000-0000-000000000002');
with x as (insert into storage.objects (bucket_id, name)
  values ('publico', 'aaaaaaaa-0000-0000-0000-000000000000/logo.png') returning 1)
select teste.ok((select count(*) from x) = 1, 'dono A carrega o logótipo da A');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('publico', 'bbbbbbbb-0000-0000-0000-000000000000/logo.png')$$, 'dono A não escreve na pasta da B');
select teste.como('10000000-0000-0000-0000-000000000003');
with x as (insert into storage.objects (bucket_id, name)
  values ('publico', 'aaaaaaaa-0000-0000-0000-000000000000/portfolio/20000000-0000-0000-0000-000000000001/1.jpg') returning 1)
select teste.ok((select count(*) from x) = 1, 'barbeiro carrega o seu portfólio');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('publico', 'aaaaaaaa-0000-0000-0000-000000000000/portfolio/20000000-0000-0000-0000-000000000002/1.jpg')$$, 'barbeiro não escreve no portfólio do colega');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('publico', 'aaaaaaaa-0000-0000-0000-000000000000/logo2.png')$$, 'barbeiro não muda o logótipo');
with x as (insert into storage.objects (bucket_id, name)
  values ('fichas', 'aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000001/corte.jpg') returning 1)
select teste.ok((select count(*) from x) = 1, 'barbeiro guarda foto na ficha do seu cliente');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('fichas', 'aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000002/corte.jpg')$$, 'barbeiro não escreve na ficha de cliente do colega');
select teste.como('10000000-0000-0000-0000-000000000007');
select teste.ok((select count(*) from storage.objects where bucket_id = 'fichas') = 0, 'cliente não lê fichas técnicas');
rollback;

\echo '== isolamento: todos os testes passaram'
