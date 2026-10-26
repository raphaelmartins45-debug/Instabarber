-- =============================================================================
-- Testes da ficha de prospeção (D-174): os campos novos do lead, os limites e os leads parecidos
-- (o comercial vê o nome só dos seus; dos outros sabe apenas que existem).
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values ('10000000-0000-0000-0000-0000000000e1', 'pe1@instabarber.pt');
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000e1', null, 'comercial', 'Prospeção');

select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
insert into leads (id, nome_contacto, nome_barbearia, telefone, origem, instagram, morada, google_nota,
                   google_avaliacoes, contacto_cargo, fala_com_decisor, consentimento_contacto, cadeiras,
                   como_marcam, sistema_atual, custo_atual, fim_contrato_atual, temperatura,
                   responsavel_id, proxima_acao, proxima_acao_em)
values ('e0000000-0000-0000-0000-000000000001', 'Rui', 'Barbearia do Rui', '+351913555001', 'visita',
        '@barbeariarui', 'Rua Direita, 10', 4.7, 123, 'Dono', true, true, 4, 'whatsapp', 'Booksy', 29.90,
        date '2027-01-31', 'quente', '10000000-0000-0000-0000-0000000000e1', 'Demonstração', current_date + 2);
select teste.ok((select temperatura = 'quente' and cadeiras = 4 and fim_contrato_atual = date '2027-01-31'
                   from leads where id = 'e0000000-0000-0000-0000-000000000001'),
  'PROS: o comercial cria o lead com a ficha de prospeção');
select teste.erro($$update leads set temperatura = 'escaldante' where id = 'e0000000-0000-0000-0000-000000000001'$$,
  'PROS: temperatura só frio, morno ou quente');
select teste.erro($$update leads set google_nota = 5.5 where id = 'e0000000-0000-0000-0000-000000000001'$$,
  'PROS: a nota do Google vai de 0 a 5');
select teste.ok((select count(*) = 1 and bool_and(acessivel and nome = 'Barbearia do Rui')
                   from leads_semelhantes('', 'BarbeariaRui', '')),
  'PROS: encontra o lead pelo Instagram, sem @ e sem distinguir maiúsculas');
select teste.ok((select count(*) = 1 from leads_semelhantes('+351913555001', '', '')),
  'PROS: encontra o lead pelo telemóvel');
select teste.ok((select count(*) = 1 from leads_semelhantes('', '', ' rua direita, 10 ')),
  'PROS: encontra o lead pela morada');
select teste.ok((select count(*) = 0 from leads_semelhantes('', '', '')), 'PROS: sem dados, nada');

reset role;
insert into leads (id, nome_contacto, nome_barbearia, telefone, origem, responsavel_id) values
  ('e0000000-0000-0000-0000-000000000002', 'Outro', 'Barbearia Alheia', '+351913555002', 'landing', null);
-- A distribuição pode entregá-lo a este comercial; aqui fica sem responsável.
update leads set responsavel_id = null where id = 'e0000000-0000-0000-0000-000000000002';
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select teste.ok((select bool_and(not acessivel and nome is null) from leads_semelhantes('+351913555002', '', '')),
  'PROS: de um lead que não é seu, o comercial sabe só que existe');

select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$select * from leads_semelhantes('+351913555001', '', '')$$,
  'PROS: o dono de uma barbearia não procura leads');
rollback;
