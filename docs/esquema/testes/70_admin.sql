-- =============================================================================
-- Testes do InstaBarber Admin (Fase 3, E.1): importação de clientes, imagens da
-- barbearia e auditoria das ações do administrador. Só com dois fatores.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- Super_admin com dois fatores
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into clientes (inquilino_id, nome, telefone, origem)
values ('aaaaaaaa-0000-0000-0000-000000000000', 'Importado Um', '+351930000001', 'importacao');
select teste.ok((select count(*) from clientes where telefone = '+351930000001' and not consentimento_mensagens) = 1,
                'ADM: o super_admin importa um cliente, sem consentimento');
insert into storage.objects (bucket_id, name) values ('publico', 'aaaaaaaa-0000-0000-0000-000000000000/logo.png');
select teste.ok((select count(*) from storage.objects where name = 'aaaaaaaa-0000-0000-0000-000000000000/logo.png') = 1,
                'ADM: o super_admin carrega o logótipo da barbearia');
select registar_auditoria_admin('aaaaaaaa-0000-0000-0000-000000000000', 'vista_apoio', 'inquilinos',
                                'aaaaaaaa-0000-0000-0000-000000000000', '{"justificacao":"pedido de apoio"}');
select teste.ok((select count(*) from auditoria where accao = 'vista_apoio'
                   and user_id = '10000000-0000-0000-0000-000000000001') = 1,
                'ADM: a ação fica em auditoria com o autor da sessão');
select teste.erro($$select registar_auditoria_admin(null, 'Apagar Tudo!', null, null, null)$$,
                  'ADM: o nome da ação é validado');
select teste.zero($$update clientes set nome = 'x' where telefone = '+351930000001'$$,
                  'ADM: o super_admin não altera clientes');
select teste.zero($$delete from clientes where telefone = '+351930000001'$$,
                  'ADM: o super_admin não apaga clientes');

-- Super_admin sem dois fatores: nada
select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.erro($$insert into clientes (inquilino_id, nome, telefone) values ('aaaaaaaa-0000-0000-0000-000000000000', 'X', '+351930000002')$$,
                  'ADM: sem dois fatores o super_admin não importa clientes');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('publico', 'aaaaaaaa-0000-0000-0000-000000000000/capa.jpg')$$,
                  'ADM: sem dois fatores não carrega imagens');
select teste.erro($$select registar_auditoria_admin(null, 'vista_apoio', null, null, null)$$,
                  'ADM: sem dois fatores não escreve na auditoria');

-- Outros papéis
select teste.como('10000000-0000-0000-0000-000000000002');   -- dono da A
select teste.erro($$select registar_auditoria_admin('aaaaaaaa-0000-0000-0000-000000000000', 'vista_apoio', null, null, null)$$,
                  'ADM: o dono não escreve na auditoria do administrador');
select teste.erro($$insert into clientes (inquilino_id, nome, telefone) values ('bbbbbbbb-0000-0000-0000-000000000000', 'X', '+351930000003')$$,
                  'ADM: o dono da A continua sem criar clientes na B');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('publico', 'bbbbbbbb-0000-0000-0000-000000000000/logo.png')$$,
                  'ADM: o dono da A continua sem escrever nas imagens da B');
select teste.como('10000000-0000-0000-0000-000000000003');   -- barbeiro da A
select teste.erro($$select registar_auditoria_admin(null, 'vista_apoio', null, null, null)$$,
                  'ADM: o barbeiro não escreve na auditoria');
select teste.anonimo();
select teste.erro($$select registar_auditoria_admin(null, 'vista_apoio', null, null, null)$$,
                  'ADM: o anónimo não executa a função');
select teste.ok((select count(*) from funcionalidades) > 0 and (select count(*) from pacote_funcionalidades where plano = 'pro') > 0,
                'ADM: o formulário de adesão lê o catálogo e os pacotes sem conta (D.9)');
select teste.zero($$select 1 from inquilino_funcionalidades$$, 'ADM: sem conta não se lê a grelha de nenhuma barbearia');
rollback;
\echo '== admin: todos os testes passaram'
