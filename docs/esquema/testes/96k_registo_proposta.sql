-- =============================================================================
-- Testes do registo a partir de uma proposta e dos comprovativos pela equipa (D-195): só o
-- super_admin fecha a proposta no registo (aceite, lead ganho e ligado, desconto e comissão
-- pendente do comercial); o comercial do lead envia o comprovativo dessa barbearia e de nenhuma
-- outra; com o primeiro comprovativo aprovado, a barbearia fica paga e a comissão a pagar.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-0000000000a1', 'k1@instabarber.pt'),
  ('10000000-0000-0000-0000-0000000000a2', 'k2@instabarber.pt');
reset role;
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000a1', null, 'comercial', 'K1'),
  ('10000000-0000-0000-0000-0000000000a2', null, 'comercial', 'K2');
update inquilinos set periodicidade = 'mensal', proximo_vencimento = date '2026-11-01',
       estado_pagamento = 'em_dia', primeiro_pagamento_em = null, campanha_id = null,
       implementacao = 'nenhuma', implementacao_sem_iva = 0, desconto_mensalidade_pct = 0
 where id = 'bbbbbbbb-0000-0000-0000-000000000000';
update configuracao_comercial set taxa_migracao_ativa = true, descontos_ativos = true;

-- O lead do K1 e a proposta com a Implementação Essencial (50 €, comissão 25 €) -------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, telefone, responsavel_id) values
  ('f0000000-0000-0000-0000-0000000000a1', 'Do K1', '918000101', '10000000-0000-0000-0000-0000000000a1');
update leads set responsavel_id = '10000000-0000-0000-0000-0000000000a1'
 where id = 'f0000000-0000-0000-0000-0000000000a1';
select teste.como('10000000-0000-0000-0000-0000000000a1', 'aal2');
select criar_proposta('f0000000-0000-0000-0000-0000000000a1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','mensal','mensalidade_sem_iva',35.99,
    'valor_periodo_sem_iva',35.99,'valor_periodo_com_iva',35.99,'iva_taxa',0,'desconto_mensalidade_pct',10,
    'implementacao','essencial','taxa_migracao_sem_iva',50)) is not null;

-- Fechar a proposta no registo -------------------------------------------------------------
select teste.erro($$select fechar_proposta_no_registo(
    (select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a1'),
    'bbbbbbbb-0000-0000-0000-000000000000')$$,
  'REGP: o comercial não fecha a proposta no registo');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select fechar_proposta_no_registo(
  (select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a1'),
  'bbbbbbbb-0000-0000-0000-000000000000');
select teste.ok((select estado = 'aceite' and decidida_em is not null from propostas
                  where lead_id = 'f0000000-0000-0000-0000-0000000000a1'),
  'REGP: a proposta fica aceite');
select teste.ok((select estado = 'ganho' and inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000' from leads
                  where id = 'f0000000-0000-0000-0000-0000000000a1'),
  'REGP: o lead fica ganho e ligado à barbearia');
select teste.ok((select desconto_mensalidade_pct = 10 from inquilinos
                  where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'REGP: o desconto da proposta passa para a mensalidade');
select teste.ok((select count(*) = 1 and bool_and(estado = 'pendente' and valor = 25 and contrato_id is null
                  and comercial_id = '10000000-0000-0000-0000-0000000000a1'
                  and inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000')
                   from comissoes_comerciais
                  where proposta_id = (select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a1')),
  'REGP: a comissão do comercial fica pendente, sem contrato');
select teste.erro($$select fechar_proposta_no_registo(
    (select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a1'),
    'aaaaaaaa-0000-0000-0000-000000000000')$$,
  'REGP: um lead já com barbearia não fecha outra vez');
select teste.ok((select count(*) = 1 from lead_eventos where lead_id = 'f0000000-0000-0000-0000-0000000000a1'
                  and texto like 'Barbearia registada pelo painel%'),
  'REGP: fica registado no histórico do lead');

-- Comprovativo enviado pelo comercial do lead ------------------------------------------------
select teste.como('10000000-0000-0000-0000-0000000000a1', 'aal2');
select teste.ok((select not pago and not comprovativo_pendente
                   from barbearia_do_lead('f0000000-0000-0000-0000-0000000000a1')),
  'REGP: antes do comprovativo, a barbearia não está paga');
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'bbbbbbbb-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000a1.pdf');
select teste.erro($$insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000a2.pdf')$$,
  'REGP: o comercial não carrega na pasta de uma barbearia que não é sua');
select teste.erro($$select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 85.99,
  hoje_lisboa(), 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg')$$,
  'REGP: o comercial não envia o comprovativo de outra barbearia');
select teste.ok(enviar_comprovativo('bbbbbbbb-0000-0000-0000-000000000000', 'transferencia', 85.99,
  hoje_lisboa(), 'bbbbbbbb-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000a1.pdf') is not null,
  'REGP: o comercial do lead envia o comprovativo da barbearia');
select teste.ok((select comprovativo_pendente from barbearia_do_lead('f0000000-0000-0000-0000-0000000000a1')),
  'REGP: o comprovativo fica em análise');
select teste.erro($$select aprovar_comprovativo((select id from comprovativos_pagamento
  where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000' and estado = 'pendente'))$$,
  'REGP: o comercial não aprova o comprovativo');

-- Outro comercial não vê nem envia --------------------------------------------------------
select teste.como('10000000-0000-0000-0000-0000000000a2', 'aal2');
select teste.erro($$select barbearia_do_lead('f0000000-0000-0000-0000-0000000000a1')$$,
  'REGP: outro comercial não vê a barbearia do lead');
select teste.ok(not pode_enviar_comprovativo('bbbbbbbb-0000-0000-0000-000000000000'),
  'REGP: outro comercial não envia comprovativos dessa barbearia');

-- Aprovação pelo super_admin -----------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok(pode_enviar_comprovativo('bbbbbbbb-0000-0000-0000-000000000000'),
  'REGP: os administradores também enviam comprovativos');
select aprovar_comprovativo((select id from comprovativos_pagamento
  where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000' and estado = 'pendente')) is not null;
select teste.ok((select pago and not comprovativo_pendente
                   from barbearia_do_lead('f0000000-0000-0000-0000-0000000000a1')),
  'REGP: com o primeiro comprovativo aprovado e o plano ativo, a barbearia está paga');
select teste.ok((select estado = 'a_pagar' and vence_em = hoje_lisboa() + 10 from comissoes_comerciais
                  where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'REGP: a comissão do comercial passa a a pagar');

-- Apagar a barbearia não apaga a comissão (fica o histórico) --------------------------------
reset role;
delete from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000';
select teste.ok((select count(*) = 1 and bool_and(inquilino_id is null) from comissoes_comerciais
                  where proposta_id = (select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a1')),
  'REGP: apagar a barbearia não apaga a comissão do comercial');

-- Sem sessão ------------------------------------------------------------------------------
select teste.anonimo();
select teste.ok(not pode_carregar_comprovativo('bbbbbbbb-0000-0000-0000-000000000000/x.pdf')
            and not pode_carregar_comprovativo('pasta-invalida/x.pdf'),
  'REGP: sem sessão não se carrega nenhum comprovativo');
rollback;
