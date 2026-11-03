-- =============================================================================
-- Testes dos comunicados à equipa InstaBarber (D-191): para os comerciais ou os gestores, todos
-- ou uma pessoa; cada pessoa vê só os seus em vigor e marca-os como lidos; as barbearias não os
-- veem e os comunicados às barbearias não chegam à equipa.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-0000000000f1', 'f1@instabarber.pt'),
  ('10000000-0000-0000-0000-0000000000f2', 'f2@instabarber.pt'),
  ('10000000-0000-0000-0000-0000000000f3', 'f3@instabarber.pt');
reset role;
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000f1', null, 'comercial', 'Comercial 1'),
  ('10000000-0000-0000-0000-0000000000f2', null, 'comercial', 'Comercial 2'),
  ('10000000-0000-0000-0000-0000000000f3', null, 'gestor_plataforma', 'Gestor 1');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into comunicados (id, titulo, texto, destino, destinatario_id) values
  ('c2000000-0000-0000-0000-000000000001', 'Comerciais', 'Para todos os comerciais', 'comerciais', null),
  ('c2000000-0000-0000-0000-000000000002', 'Só o C1', 'Para o comercial 1', 'comerciais', '10000000-0000-0000-0000-0000000000f1'),
  ('c2000000-0000-0000-0000-000000000003', 'Gestores', 'Para os gestores', 'gestores', null),
  ('c2000000-0000-0000-0000-000000000004', 'Barbearias', 'Para as barbearias', 'todas', null);
select teste.erro($$insert into comunicados (titulo, texto, destino, destinatario_id)
  values ('X', 'Y', 'todas', '10000000-0000-0000-0000-0000000000f1')$$,
  'EQCOM: um comunicado às barbearias não leva pessoa da equipa');

select teste.como('10000000-0000-0000-0000-0000000000f1', 'aal2');
select teste.ok((select array_agg(titulo order by titulo) = array['Comerciais','Só o C1'] from meus_comunicados_equipa()),
  'EQCOM: o comercial 1 vê os dos comerciais e o seu');
select teste.ok((select count(*) from comunicados) = 0, 'EQCOM: o comercial não lê a tabela');
select marcar_comunicado_lido_equipa('c2000000-0000-0000-0000-000000000002');
select teste.ok((select array_agg(titulo) = array['Comerciais'] from meus_comunicados_equipa()),
  'EQCOM: marcado como lido, sai da lista');
select teste.erro($$select marcar_comunicado_lido_equipa('c2000000-0000-0000-0000-000000000003')$$,
  'EQCOM: o comercial não marca um comunicado dos gestores');

select teste.como('10000000-0000-0000-0000-0000000000f2', 'aal2');
select teste.ok((select array_agg(titulo) = array['Comerciais'] from meus_comunicados_equipa()),
  'EQCOM: o comercial 2 não vê o do comercial 1');

select teste.como('10000000-0000-0000-0000-0000000000f3', 'aal2');
select teste.ok((select array_agg(titulo) = array['Gestores'] from meus_comunicados_equipa()),
  'EQCOM: o gestor vê só os dos gestores');

select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from meus_comunicados_equipa()) = 0, 'EQCOM: o dono de uma barbearia não vê os da equipa');
select teste.ok((select count(*) from meus_comunicados('aaaaaaaa-0000-0000-0000-000000000000')
                  where titulo in ('Comerciais','Gestores')) = 0,
  'EQCOM: os comunicados da equipa não chegam às barbearias');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) = 1 from comunicado_leituras_equipa
                  where comunicado_id = 'c2000000-0000-0000-0000-000000000002'),
  'EQCOM: a Performa LAB vê quem leu');
reset role;
update perfis set ativo = false where user_id = '10000000-0000-0000-0000-0000000000f2';
select teste.como('10000000-0000-0000-0000-0000000000f2', 'aal2');
select teste.ok((select count(*) from meus_comunicados_equipa()) = 0, 'EQCOM: quem saiu da equipa deixa de os ver');
rollback;
