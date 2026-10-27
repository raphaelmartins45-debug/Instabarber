-- =============================================================================
-- Testes do contrato enviado ao cliente (D-181): a ligação guarda só o hash e expira; o cliente
-- (anónimo) vê só o seu contrato e regista o carregamento no caminho certo; a equipa recusa ou
-- aprova (assinar_contrato). O telefone da equipa InstaBarber, só o próprio.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-0000000000e1', 'e1@instabarber.pt'),
  ('10000000-0000-0000-0000-0000000000e2', 'e2@instabarber.pt');
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000e1', null, 'comercial', 'E1'),
  ('10000000-0000-0000-0000-0000000000e2', null, 'comercial', 'E2');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into modelos_documento (id, tipo, versao, titulo, corpo, estado, aprovado_por, aprovado_em) values
  ('d0000000-0000-0000-0000-0000000000e1', 'contrato', 21, 'Contrato', 'Texto', 'aprovado',
   '10000000-0000-0000-0000-000000000001', now());
insert into leads (id, nome_contacto, telefone, responsavel_id) values
  ('f0000000-0000-0000-0000-0000000000e1', 'Do E1', '917000001', '10000000-0000-0000-0000-0000000000e1');
update leads set responsavel_id = '10000000-0000-0000-0000-0000000000e1'
 where id = 'f0000000-0000-0000-0000-0000000000e1';

select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}');
select marcar_proposta_enviada((select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000e1'));
select decidir_proposta((select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000e1'), true);
select gerar_contrato((select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000e1'),
  'd0000000-0000-0000-0000-0000000000e1',
  '{"razao_social":"Barbearia E1 Lda","nif":"501964843","morada":"Rua A","representante":"Rui","email":"rui@exemplo.pt"}', 'Texto');
create temp table c as select id, numero from contratos where lead_id = 'f0000000-0000-0000-0000-0000000000e1';
grant select on c to anon, authenticated;

select teste.erro($$select preparar_envio_contrato((select id from c), 'curto')$$,
  'CLI: a ligação pede um código forte');
select preparar_envio_contrato((select id from c), repeat('a', 40));
select teste.ok((select estado = 'enviado' and envio_token_hash = encode(sha256(convert_to(repeat('a', 40), 'UTF8')), 'hex')
                   and envio_expira_em > now() + interval '29 days' from contratos where id = (select id from c)),
  'CLI: enviar guarda só o hash, válido 30 dias, e marca o contrato como enviado');

-- O outro comercial não envia o contrato de um lead que não é dele.
select teste.como('10000000-0000-0000-0000-0000000000e2', 'aal2');
select teste.erro($$select preparar_envio_contrato((select id from c), repeat('b', 40))$$,
  'CLI: o comercial de outro lead não envia o contrato');

-- O cliente, sem conta, com a ligação.
select teste.anonimo();
select teste.ok((select count(*) = 0 from contratos), 'CLI: o anónimo não lê a tabela dos contratos');
select teste.ok((select count(*) = 0 from contrato_do_cliente(repeat('z', 40))), 'CLI: ligação errada não mostra nada');
select teste.ok((select numero = (select numero from c) and contratante = 'Barbearia E1 Lda'
                   from contrato_do_cliente(repeat('a', 40))),
  'CLI: com a ligação certa, o cliente vê o seu contrato');
select teste.ok(not registar_carregamento_contrato(repeat('a', 40), 'leads/outro/contratos/x-carregado.pdf'),
  'CLI: o carregamento noutro caminho é recusado');
select teste.ok(registar_carregamento_contrato(repeat('a', 40),
  'leads/f0000000-0000-0000-0000-0000000000e1/contratos/' || (select id from c) || '-carregado.pdf'),
  'CLI: o carregamento no caminho certo fica registado');

reset role;
select teste.ok((select estado = 'carregado' and carregado_em is not null from contratos where id = (select id from c)),
  'CLI: o contrato carregado fica por conferir');
select teste.ok((select count(*) = 1 from lead_eventos where lead_id = 'f0000000-0000-0000-0000-0000000000e1'
                   and texto like 'O cliente carregou%'),
  'CLI: o carregamento fica no histórico do lead');

-- A equipa recusa: volta a enviado, com o motivo, e o cliente vê-o.
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select teste.erro($$select recusar_carregamento_contrato((select id from c), '  ')$$, 'CLI: recusar pede o motivo');
select recusar_carregamento_contrato((select id from c), 'Falta a assinatura na página 3.');
-- Uma ligação nova (a que segue no e-mail da recusa) mantém o motivo à vista.
select preparar_envio_contrato((select id from c), repeat('a', 40));
select teste.anonimo();
select teste.ok((select estado = 'enviado' and recusa_motivo = 'Falta a assinatura na página 3.'
                   from contrato_do_cliente(repeat('a', 40))),
  'CLI: depois da recusa, o cliente vê o motivo e pode carregar outra vez');
-- Ligação expirada: não serve; dentro do prazo, volta a servir.
reset role;
update contratos set envio_expira_em = now() - interval '1 minute' where id = (select id from c);
select teste.anonimo();
select teste.ok((select count(*) = 0 from contrato_do_cliente(repeat('a', 40))), 'CLI: a ligação expirada não serve');
reset role;
update contratos set envio_expira_em = now() + interval '1 day' where id = (select id from c);
select teste.anonimo();
select registar_carregamento_contrato(repeat('a', 40),
  'leads/f0000000-0000-0000-0000-0000000000e1/contratos/' || (select id from c) || '-carregado.pdf');

-- A equipa aprova: assinado, lead ganho, e a ligação deixa de servir.
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select assinar_contrato((select id from c), current_date,
  'leads/f0000000-0000-0000-0000-0000000000e1/contratos/' || (select id from c) || '-carregado.pdf');
reset role;
select teste.ok((select estado = 'assinado' and envio_token_hash is null from contratos where id = (select id from c))
                and (select estado = 'ganho' from leads where id = 'f0000000-0000-0000-0000-0000000000e1'),
  'CLI: aprovar o carregado assina o contrato e ganha o lead');
select teste.anonimo();
select teste.ok((select count(*) = 0 from contrato_do_cliente(repeat('a', 40))),
  'CLI: depois de assinado, a ligação já não mostra o contrato');
select teste.ok(not registar_carregamento_contrato(repeat('a', 40),
  'leads/f0000000-0000-0000-0000-0000000000e1/contratos/' || (select id from c) || '-carregado.pdf'),
  'CLI: nem aceita outro carregamento');

-- Telefone da equipa: cada um o seu, em E.164.
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select teste.erro($$select mudar_meu_telefone('912345678')$$, 'TEL: só com o indicativo (E.164)');
select mudar_meu_telefone('+351912345678');
reset role;
select teste.ok((select telefone = '+351912345678' from perfis where user_id = '10000000-0000-0000-0000-0000000000e1')
                and (select telefone is null from perfis where user_id = '10000000-0000-0000-0000-0000000000e2'),
  'TEL: muda só o telefone de quem pede');
select teste.como('10000000-0000-0000-0000-000000000002');   -- dono de uma barbearia
select teste.erro($$select mudar_meu_telefone('+351912345678')$$, 'TEL: quem não é da equipa InstaBarber não usa');
rollback;
