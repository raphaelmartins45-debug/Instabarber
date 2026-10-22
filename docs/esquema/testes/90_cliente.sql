-- =============================================================================
-- Testes da marcação pública e da área de cliente (Fase 5, D-125): código de convite pessoal,
-- vista pública com a regra de cancelamento, e reserva e confirmação sem conta.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- A vista pública mostra a antecedência de cancelamento e a janela (H.2).
select teste.anonimo();
select teste.ok((select antecedencia_cancelamento_min = 120 and janela_marcacao_dias = 60
                   from publico_inquilinos where slug = 'barbearia-a'),
                'CLIENTE: a vista pública traz a regra de cancelamento e a janela');

-- Código de convite: gerado uma vez, pelo próprio cliente.
select teste.como('10000000-0000-0000-0000-000000000007');
create temp table cod as select meu_codigo_convite('aaaaaaaa-0000-0000-0000-000000000000') as c;
grant select on cod to authenticated, anon;
select teste.ok((select c ~ '^[A-HJ-NP-Z2-9]{6}$' from cod), 'CLIENTE: o código tem seis caracteres');
select teste.ok(meu_codigo_convite('aaaaaaaa-0000-0000-0000-000000000000') = (select c from cod),
                'CLIENTE: pedir outra vez devolve o mesmo código');
select teste.erro($$select meu_codigo_convite('bbbbbbbb-0000-0000-0000-000000000000')$$,
                  'CLIENTE: sem ficha nessa barbearia não há código');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select meu_codigo_convite('aaaaaaaa-0000-0000-0000-000000000000')$$,
                  'CLIENTE: um barbeiro não tem código de cliente');
select teste.anonimo();
select teste.erro($$select meu_codigo_convite('aaaaaaaa-0000-0000-0000-000000000000')$$,
                  'CLIENTE: sem sessão não há código');

-- Marcação sem conta com o código de convite: o novo cliente fica convidado por quem partilhou.
create temp table r as
  select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
                              instante_lisboa('2026-11-11', '15:00'), '20000000-0000-0000-0000-000000000001');
grant select on r to anon, authenticated;
select confirmar_reserva((select marcacao_id from r), (select token from r), 'Amigo Novo', '+351939000001',
                         null, null, false, (select lower(c) from cod));
reset role;
select teste.ok((select convidado_por = '40000000-0000-0000-0000-000000000001' from clientes where telefone = '+351939000001'),
                'CLIENTE: quem marca pela primeira vez com o código fica convidado');
rollback;
