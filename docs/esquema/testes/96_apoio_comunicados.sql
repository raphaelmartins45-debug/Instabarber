-- =============================================================================
-- Testes do apoio e dos comunicados (D-160): o registo de apoio é só do super_admin com dois
-- fatores; os comunicados chegam só ao gestor da barbearia a que se destinam, dentro do prazo, e
-- a leitura conta por barbearia.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- Apoio ------------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into apoio_registos (inquilino_id, tipo, assunto) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'chamada', 'Dúvida sobre a agenda');
select teste.ok((select count(*) from apoio_registos) = 1, 'APO: o super_admin regista e lê o apoio');
select teste.erro($$insert into apoio_registos (inquilino_id, tipo, assunto, estado)
  values ('aaaaaaaa-0000-0000-0000-000000000000', 'nota', 'x', 'resolvido')$$,
  'APO: resolvido exige a data da resolução');
select teste.erro($$insert into apoio_registos (inquilino_id, tipo, assunto)
  values ('aaaaaaaa-0000-0000-0000-000000000000', 'fax', 'x')$$, 'APO: tipo fora da lista recusado');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.ok((select count(*) from apoio_registos) = 0, 'APO: sem dois fatores, o super_admin não lê');
select teste.erro($$insert into apoio_registos (inquilino_id, tipo, assunto)
  values ('aaaaaaaa-0000-0000-0000-000000000000', 'nota', 'x')$$, 'APO: sem dois fatores, não regista');

select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from apoio_registos) = 0, 'APO: o dono não vê o registo de apoio da própria barbearia');
select teste.erro($$insert into apoio_registos (inquilino_id, tipo, assunto)
  values ('aaaaaaaa-0000-0000-0000-000000000000', 'nota', 'x')$$, 'APO: o dono não regista apoio');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.ok((select count(*) from apoio_registos) = 0, 'APO: o barbeiro não vê o registo de apoio');

-- Comunicados ------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into comunicados (id, titulo, texto, destino, plano, inquilino_id, inicio, fim) values
  ('c0000000-0000-0000-0000-000000000001', 'Para todas', 'x', 'todas', null, null, now() - interval '1 day', null),
  ('c0000000-0000-0000-0000-000000000002', 'Para o Pro', 'x', 'plano', 'pro', null, now() - interval '1 day', null),
  ('c0000000-0000-0000-0000-000000000003', 'Para o Basic', 'x', 'plano', 'basic', null, now() - interval '1 day', null),
  ('c0000000-0000-0000-0000-000000000004', 'Só para a B', 'x', 'barbearia', null, 'bbbbbbbb-0000-0000-0000-000000000000', now() - interval '1 day', null),
  ('c0000000-0000-0000-0000-000000000005', 'Futuro', 'x', 'todas', null, null, now() + interval '1 day', null),
  ('c0000000-0000-0000-0000-000000000006', 'Terminado', 'x', 'todas', null, null, now() - interval '2 days', now() - interval '1 day');
select teste.erro($$insert into comunicados (titulo, texto, destino, plano) values ('x', 'x', 'todas', 'pro')$$,
  'COM: o destino tem de bater certo com o plano e a barbearia');
select teste.erro($$insert into comunicados (titulo, texto, destino) values ('x', 'x', 'barbearia')$$,
  'COM: comunicado para uma barbearia exige a barbearia');

select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from comunicados) = 0, 'COM: o dono não lê a tabela dos comunicados');
select teste.erro($$insert into comunicados (titulo, texto, destino) values ('x', 'x', 'todas')$$,
  'COM: o dono não escreve comunicados');
select teste.ok((select count(*) from meus_comunicados('aaaaaaaa-0000-0000-0000-000000000000')) = 2,
  'COM: o dono A recebe os de todas e do plano dele, em vigor');
select teste.ok(not exists (select 1 from meus_comunicados('aaaaaaaa-0000-0000-0000-000000000000')
  where titulo in ('Para o Basic', 'Só para a B', 'Futuro', 'Terminado')),
  'COM: nem de outro plano, nem de outra barbearia, nem fora do prazo');
select teste.erro($$select * from meus_comunicados('bbbbbbbb-0000-0000-0000-000000000000')$$,
  'COM: o dono A não lê os comunicados da B');
select marcar_comunicado_lido('c0000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000');
select marcar_comunicado_lido('c0000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000');
select teste.ok((select count(*) from meus_comunicados('aaaaaaaa-0000-0000-0000-000000000000')) = 1,
  'COM: depois de «Li» o comunicado sai (marcar duas vezes não dá erro)');
select teste.erro($$select marcar_comunicado_lido('c0000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000000')$$,
  'COM: não se marca um comunicado que não é para a barbearia');
select teste.erro($$select marcar_comunicado_lido('c0000000-0000-0000-0000-000000000004', 'bbbbbbbb-0000-0000-0000-000000000000')$$,
  'COM: o dono A não marca leituras na B');
select teste.ok((select count(*) from comunicado_leituras) = 0, 'COM: o dono não lê a tabela das leituras');
select teste.erro($$insert into comunicado_leituras (comunicado_id, inquilino_id)
  values ('c0000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000000')$$,
  'COM: as leituras só se gravam pela função');

select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select * from meus_comunicados('aaaaaaaa-0000-0000-0000-000000000000')$$,
  'COM: os comunicados são só para o gestor, não para os barbeiros');

select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) from meus_comunicados('bbbbbbbb-0000-0000-0000-000000000000')) = 3,
  'COM: o dono B recebe os de todas, do plano e o só para a B');

select teste.anonimo();
select teste.erro($$select * from meus_comunicados('aaaaaaaa-0000-0000-0000-000000000000')$$,
  'COM: sem sessão não há comunicados');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from comunicado_leituras where comunicado_id = 'c0000000-0000-0000-0000-000000000001') = 1,
  'COM: o super_admin vê quantas barbearias leram');
rollback;
