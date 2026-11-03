-- =============================================================================
-- Testes das campanhas comerciais (D-190): as campanhas começam desligadas; o comercial lê-as mas
-- não as muda; a proposta só usa uma campanha ligada, dentro da data, com vagas, para o plano e a
-- periodicidade certos, com o pacote e o preço da implementação que ela fixa; a comissão é metade
-- do preço normal do pacote. Na barbearia: meses de oferta no primeiro período (Anual 14), o
-- semestral de seis meses e a condição temporária contada desde o primeiro pagamento.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values ('10000000-0000-0000-0000-0000000000e1', 'e1@instabarber.pt');
reset role;
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000e1', null, 'comercial', 'E1');
update inquilinos set proximo_vencimento = date '2026-11-01', estado_pagamento = 'em_dia',
       periodicidade = 'mensal', primeiro_pagamento_em = null, campanha_id = null
 where id in ('aaaaaaaa-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000000');

-- Catálogo -----------------------------------------------------------------------------
select teste.ok((select count(*) = 8 and bool_and(not ativa) from campanhas_comerciais),
  'CAMP: há oito campanhas de partida, todas desligadas');
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select teste.ok((select count(*) from campanhas_comerciais) = 8, 'CAMP: o comercial lê as campanhas');
select teste.zero($$update campanhas_comerciais set ativa = true$$, 'CAMP: o comercial não liga campanhas');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select count(*) from campanhas_comerciais) = 0, 'CAMP: a barbearia não vê as campanhas');

-- Proposta com campanha ------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, telefone, responsavel_id) values
  ('f0000000-0000-0000-0000-0000000000e1', 'Do E1', '918000001', '10000000-0000-0000-0000-0000000000e1');
update leads set responsavel_id = '10000000-0000-0000-0000-0000000000e1' where id = 'f0000000-0000-0000-0000-0000000000e1';
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','anual','mensalidade_sem_iva',39.99,
    'valor_periodo_sem_iva',399.90,'valor_periodo_com_iva',491.88,'implementacao','essencial','taxa_migracao_sem_iva',0,
    'campanha_id',(select id from campanhas_comerciais where chave = 'anual14_pro')))$$,
  'CAMP: desligada, a campanha não entra na proposta');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update campanhas_comerciais set ativa = true where chave in ('anual14_pro', 'muda_ja', 'semestral');
select teste.como('10000000-0000-0000-0000-0000000000e1', 'aal2');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','basic','profissionais',1,'periodicidade','anual','mensalidade_sem_iva',19.99,
    'valor_periodo_sem_iva',199.90,'valor_periodo_com_iva',245.88,'implementacao','essencial','taxa_migracao_sem_iva',0,
    'campanha_id',(select id from campanhas_comerciais where chave = 'anual14_pro')))$$,
  'CAMP: a campanha do Pro não serve para o Basic');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','mensal','mensalidade_sem_iva',39.99,
    'valor_periodo_sem_iva',39.99,'valor_periodo_com_iva',49.19,'implementacao','essencial','taxa_migracao_sem_iva',0,
    'campanha_id',(select id from campanhas_comerciais where chave = 'anual14_pro')))$$,
  'CAMP: o Anual 14 só serve com pagamento anual');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','anual','mensalidade_sem_iva',39.99,
    'valor_periodo_sem_iva',399.90,'valor_periodo_com_iva',491.88,'implementacao','essencial','taxa_migracao_sem_iva',50,
    'campanha_id',(select id from campanhas_comerciais where chave = 'anual14_pro')))$$,
  'CAMP: a implementação tem o preço da campanha (oferta no Anual 14 do Pro)');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','mensal','mensalidade_sem_iva',39.99,
    'valor_periodo_sem_iva',39.99,'valor_periodo_com_iva',49.19,'implementacao','essencial','taxa_migracao_sem_iva',50,
    'campanha_id',(select id from campanhas_comerciais where chave = 'muda_ja')))$$,
  'CAMP: o Muda já fixa a Implementação com Formação');
select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','mensal','mensalidade_sem_iva',39.99,
    'valor_periodo_sem_iva',39.99,'valor_periodo_com_iva',49.19,'implementacao','formacao','taxa_migracao_sem_iva',50,
    'campanha_id',(select id from campanhas_comerciais where chave = 'muda_ja')));
select teste.ok((select implementacao = 'formacao' and taxa_migracao_sem_iva = 50 and comissao_sem_iva = 50
                   from propostas where estado = 'rascunho'),
  'CAMP: no Muda já cobra 50 € e a comissão é metade do preço normal da Formação (50 €)');
select criar_proposta('f0000000-0000-0000-0000-0000000000e1',
  jsonb_build_object('plano','pro','profissionais',3,'periodicidade','anual','mensalidade_sem_iva',39.99,
    'valor_periodo_sem_iva',399.90,'valor_periodo_com_iva',491.88,'implementacao','essencial','taxa_migracao_sem_iva',0,
    'campanha_id',(select id from campanhas_comerciais where chave = 'anual14_pro')));
select teste.ok((select taxa_migracao_sem_iva = 0 and comissao_sem_iva = 25 and campanha_id is not null
                   from propostas where estado = 'rascunho'),
  'CAMP: no Anual 14 do Pro a implementação é oferta e a comissão (25 €) fica na proposta');

-- Prazos e vagas -------------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update campanhas_comerciais set valida_ate = hoje_lisboa() - 1 where chave = 'semestral';
select teste.ok(not campanha_disponivel((select id from campanhas_comerciais where chave = 'semestral'), 'pro', 'semestral'),
  'CAMP: depois da data de fim, a campanha deixa de estar disponível');
update campanhas_comerciais set valida_ate = null, vagas = 1 where chave = 'semestral';
select definir_campanha('bbbbbbbb-0000-0000-0000-000000000000', (select id from campanhas_comerciais where chave = 'semestral'));
select teste.ok(not campanha_disponivel((select id from campanhas_comerciais where chave = 'semestral'), 'pro', 'semestral'),
  'CAMP: com as vagas preenchidas, a campanha deixa de estar disponível');

-- Semestral na barbearia ------------------------------------------------------------------
select teste.ok((select periodicidade = 'semestral' and implementacao = 'essencial' and implementacao_sem_iva = 0
                   from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'CAMP: a campanha passa à barbearia a periodicidade e a implementação oferecida');
select teste.ok((select inicio = date '2026-11-01' and fim = date '2027-04-30'
                   from periodo_a_pagar('bbbbbbbb-0000-0000-0000-000000000000')),
  'CAMP: o semestral paga seis meses de uma vez');

-- Anual 14 na barbearia: 12 meses + 2 de oferta no primeiro período ---------------------------
select definir_campanha('aaaaaaaa-0000-0000-0000-000000000000', (select id from campanhas_comerciais where chave = 'anual14_pro'));
select teste.ok((select inicio = date '2026-11-01' and fim = date '2027-12-31'
                   from periodo_a_pagar('aaaaaaaa-0000-0000-0000-000000000000')),
  'CAMP: no Anual 14, o primeiro período vai até ao fim do 14.º mês');
reset role;
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000e1.jpg');
select teste.como('10000000-0000-0000-0000-000000000002');
select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'transferencia', 399.90, hoje_lisboa(),
  'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000e1.jpg');
select teste.erro($$select definir_campanha('aaaaaaaa-0000-0000-0000-000000000000', null)$$,
  'CAMP: o dono não muda a campanha');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select aprovar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'));
select teste.ok((select proximo_vencimento = date '2028-01-01' and primeiro_pagamento_em = hoje_lisboa()
                   from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'CAMP: aprovado o primeiro pagamento, o vencimento seguinte é depois dos 14 meses');
select teste.ok((select fim = date '2028-12-31' from periodo_a_pagar('aaaaaaaa-0000-0000-0000-000000000000')),
  'CAMP: os meses de oferta só contam no primeiro período');
select teste.erro($$select definir_campanha('aaaaaaaa-0000-0000-0000-000000000000', null)$$,
  'CAMP: depois do primeiro pagamento, a campanha não muda');

-- Condição temporária: conta desde o primeiro pagamento --------------------------------------
reset role;
update inquilinos set campanha_id = (select id from campanhas_comerciais where chave = 'sobe_pro'),
       periodicidade = 'mensal', primeiro_pagamento_em = null, proximo_vencimento = date '2026-11-01'
 where id = 'bbbbbbbb-0000-0000-0000-000000000000';
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'bbbbbbbb-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000e2.jpg');
select teste.como('10000000-0000-0000-0000-000000000005');
select enviar_comprovativo('bbbbbbbb-0000-0000-0000-000000000000', 'mbway', 20.00, hoje_lisboa(),
  'bbbbbbbb-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000e2.jpg');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select aprovar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'));
select teste.ok((select campanha_ate = date '2027-01-31' from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'CAMP: a condição de três meses conta desde o primeiro período pago');

-- A campanha da própria barbearia ------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select nome = 'Anual 14' from campanha_da_barbearia('aaaaaaaa-0000-0000-0000-000000000000')),
  'CAMP: o dono lê a campanha da sua barbearia');
select teste.erro($$select * from campanha_da_barbearia('bbbbbbbb-0000-0000-0000-000000000000')$$,
  'CAMP: o dono não lê a campanha de outra barbearia');

-- Só a Performa LAB --------------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$update inquilinos set campanha_id = null where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'CAMP: o dono não tira a campanha à mão');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.zero($$update campanhas_comerciais set ativa = false where chave = 'muda_ja'$$,
  'CAMP: sem dois fatores, não muda campanhas');
rollback;
