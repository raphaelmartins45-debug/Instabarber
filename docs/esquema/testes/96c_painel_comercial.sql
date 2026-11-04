-- =============================================================================
-- Testes do painel comercial (D-162): os leads ficam no geral sem comerciais; o primeiro comercial
-- recebe os que estavam em aberto; com mais de um, os novos repartem-se ao acaso; quem sai passa
-- os seus a outro. A comissão nasce na assinatura (taxa de migração) e vence 10 dias depois de a
-- taxa estar paga. A saúde da carteira e a demonstração.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-0000000000c1', 'c1@instabarber.pt'),
  ('10000000-0000-0000-0000-0000000000c2', 'c2@instabarber.pt');

-- Distribuição -----------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, telefone) values
  ('f0000000-0000-0000-0000-000000000001', 'Geral 1', '913000001'),
  ('f0000000-0000-0000-0000-000000000002', 'Geral 2', '913000002');
insert into leads (id, nome_contacto, telefone, estado) values
  ('f0000000-0000-0000-0000-000000000003', 'Já ganho', '913000003', 'ganho');
select teste.ok((select count(*) from leads where responsavel_id is not null) = 0,
  'DIST: sem comerciais, os leads ficam no geral');

reset role;
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000c1', null, 'comercial', 'C1');
select teste.ok((select count(*) from leads where responsavel_id = '10000000-0000-0000-0000-0000000000c1') = 2,
  'DIST: o primeiro comercial recebe os leads em aberto do geral');
select teste.ok((select responsavel_id is null from leads where id = 'f0000000-0000-0000-0000-000000000003'),
  'DIST: os leads ganhos não mudam');
select teste.ok((select count(*) from lead_eventos where texto = 'Atribuído automaticamente ao comercial.') = 2,
  'DIST: a atribuição fica no histórico');
select teste.ok(submeter_lead('{"nome":"Do site","telefone":"914000001"}'), 'DIST: pedido do site recebido');
select teste.ok((select responsavel_id from leads where telefone = '914000001') = '10000000-0000-0000-0000-0000000000c1',
  'DIST: com um só comercial, os novos são dele');

insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000c2', null, 'comercial', 'C2');
select teste.ok((select count(*) from leads where responsavel_id = '10000000-0000-0000-0000-0000000000c2') = 0,
  'DIST: o segundo comercial não tira os leads ao primeiro');
insert into leads (nome_contacto, telefone)
select 'Novo ' || g, '9150000' || lpad(g::text, 2, '0') from generate_series(1, 30) g;
select teste.ok((select count(distinct responsavel_id) from leads where nome_contacto like 'Novo %') = 2
                and (select count(*) from leads where nome_contacto like 'Novo %' and responsavel_id is null) = 0,
  'DIST: com dois comerciais, os novos repartem-se ao acaso');

update perfis set ativo = false where user_id = '10000000-0000-0000-0000-0000000000c1';
select teste.ok((select count(*) from leads where responsavel_id = '10000000-0000-0000-0000-0000000000c1'
                  and estado not in ('ganho','perdido')) = 0,
  'DIST: quem é desativado passa os seus leads em aberto a outro comercial');
update perfis set ativo = true where user_id = '10000000-0000-0000-0000-0000000000c1';

-- Comissões --------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update configuracao_comercial set taxa_migracao_ativa = true, implementacao_formacao_sem_iva = 100;
insert into modelos_documento (id, tipo, versao, titulo, corpo, estado, aprovado_por, aprovado_em) values
  ('d0000000-0000-0000-0000-0000000000c1', 'contrato', 11, 'Contrato', 'Texto', 'aprovado',
   '10000000-0000-0000-0000-000000000001', now());
insert into leads (id, nome_contacto, telefone, responsavel_id) values
  ('f0000000-0000-0000-0000-0000000000c2', 'Do C2', '916000001', '10000000-0000-0000-0000-0000000000c2'),
  ('f0000000-0000-0000-0000-0000000000a0', 'Sem comercial', '916000002', null);
update leads set responsavel_id = null where id = 'f0000000-0000-0000-0000-0000000000a0';

select teste.como('10000000-0000-0000-0000-0000000000c2', 'aal2');
select criar_proposta('f0000000-0000-0000-0000-0000000000c2',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"implementacao":"formacao","taxa_migracao_sem_iva":100}');
select marcar_proposta_enviada((select id from propostas));
select decidir_proposta((select id from propostas), true);
select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-0000000000c1',
  '{"razao_social":"Barbearia C2 Lda","nif":"501964843","morada":"Rua A","representante":"Rui"}', 'Texto');
select assinar_contrato((select id from contratos), current_date, 'leads/x/contratos/x.pdf');
select teste.ok((select count(*) from comissoes_comerciais) = 1
                and (select valor = 50 and estado = 'pendente' from comissoes_comerciais),
  'COMS: o contrato assinado gera a comissão do comercial (metade da implementação), pendente');
select teste.erro($$select registar_taxa_paga((select id from comissoes_comerciais), current_date)$$,
  'COMS: o comercial não regista o pagamento da taxa');

select teste.como('10000000-0000-0000-0000-0000000000c1', 'aal2');
select teste.ok((select count(*) from comissoes_comerciais) = 0, 'COMS: o outro comercial não vê a comissão');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select registar_taxa_paga((select id from comissoes_comerciais), '2026-11-01');
select teste.ok((select estado = 'a_pagar' and vence_em = '2026-11-11' from comissoes_comerciais),
  'COMS: com a taxa paga, a comissão vence 10 dias depois');
select teste.erro($$select registar_taxa_paga((select id from comissoes_comerciais), '2026-11-02')$$,
  'COMS: a taxa não se regista duas vezes');
select marcar_comissao_paga((select id from comissoes_comerciais), '2026-11-10');
select teste.ok((select estado = 'paga' and paga_em = '2026-11-10' from comissoes_comerciais),
  'COMS: a comissão fica paga');

select criar_proposta('f0000000-0000-0000-0000-0000000000a0',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"implementacao":"formacao","taxa_migracao_sem_iva":100}');
select marcar_proposta_enviada((select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a0'));
select decidir_proposta((select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a0'), true);
select gerar_contrato((select id from propostas where lead_id = 'f0000000-0000-0000-0000-0000000000a0'),
  'd0000000-0000-0000-0000-0000000000c1',
  '{"razao_social":"Sem Comercial Lda","nif":"501964843","morada":"Rua B","representante":"Ana"}', 'Texto');
select assinar_contrato((select id from contratos where lead_id = 'f0000000-0000-0000-0000-0000000000a0'),
  current_date, 'leads/y/contratos/y.pdf');
select teste.ok((select count(*) from comissoes_comerciais) = 1,
  'COMS: sem comercial responsável não há comissão');

-- Saúde da carteira ------------------------------------------------------------
select ligar_contrato_inquilino((select id from contratos where lead_id = 'f0000000-0000-0000-0000-0000000000c2'),
  'aaaaaaaa-0000-0000-0000-000000000000');
select teste.como('10000000-0000-0000-0000-0000000000c2', 'aal2');
select teste.ok((select count(*) from saude_carteira()) = 1
                and (select marcacoes_total from saude_carteira()) >= 1,
  'RISCO: o comercial vê a saúde das barbearias da sua carteira');
select teste.ok((select count(*) from marcacoes) = 0, 'RISCO: sem ver as marcações nem os clientes');
select teste.como('10000000-0000-0000-0000-0000000000c1', 'aal2');
select teste.erro($$select * from saude_carteira('10000000-0000-0000-0000-0000000000c2')$$,
  'RISCO: não vê a carteira de outro');
select teste.ok((select count(*) from saude_carteira()) = 0, 'RISCO: a sua carteira está vazia');

-- Demonstração -----------------------------------------------------------------
-- O comercial prepara e personaliza a demonstração (D-207): versão Basic, um só barbeiro.
select preparar_demonstracao('basic', null, null, 'Barbearia do Zé', '/marca/x.png', '#123456', 'Porto', '+351912345678');
reset role;  -- o comercial não lê a barbearia de demonstração; confere-se sem RLS
select teste.ok((select nome = 'Barbearia do Zé' and plano = 'basic' and cidade = 'Porto' and capa_cor = '#123456'
                        and estilo_pagina = 'anuario' and whatsapp = '+351912345678'
                   from inquilinos where demonstracao), 'DEMO: o comercial gera a demonstração personalizada (Moderno)');
select teste.ok((select count(*) from profissionais p join inquilinos i on i.id = p.inquilino_id where i.demonstracao) = 1,
  'DEMO: na versão Basic, um só barbeiro');
select teste.ok((select count(*) from produtos p join inquilinos i on i.id = p.inquilino_id where i.demonstracao) = 4,
  'DEMO: a loja tem três produtos com fotografia e o cartão oferta');
select teste.ok((select count(*) from clientes c join inquilinos i on i.id = c.inquilino_id
                  where i.demonstracao and c.telefone = '+351912345678') = 1,
  'DEMO: o WhatsApp de teste fica também num cliente de teste, para receber os lembretes');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$select preparar_demonstracao()$$, 'DEMO: o dono de uma barbearia não a prepara');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select preparar_demonstracao();
select preparar_demonstracao();
select teste.ok((select count(*) from inquilinos where demonstracao) = 1, 'DEMO: refazer não duplica');
select teste.ok((select nome = 'Barbearia Demonstração' and plano = 'pro' from inquilinos where demonstracao),
  'DEMO: o Reset volta ao nome e à versão de origem');
select teste.ok((select count(*) from servicos s join inquilinos i on i.id = s.inquilino_id where i.demonstracao) = 4
                and (select count(*) from profissionais p join inquilinos i on i.id = p.inquilino_id where i.demonstracao) = 3
                and (select count(*) from clientes c join inquilinos i on i.id = c.inquilino_id where i.demonstracao) = 40,
  'DEMO: serviços, equipa e clientes fictícios');
select teste.ok((select count(*) from visitas v join inquilinos i on i.id = v.inquilino_id where i.demonstracao) > 20,
  'DEMO: histórico de serviços concluídos nos últimos 30 dias');
select teste.ok((select count(*) from marcacoes m join inquilinos i on i.id = m.inquilino_id
                  where i.demonstracao and m.estado = 'agendada') > 5,
  'DEMO: marcações agendadas para os próximos dias');
select teste.ok((select count(*) from publico_profissionais v join inquilinos i on i.id = v.inquilino_id
                  where i.demonstracao and v.apresentacao is not null and cardinality(v.especialidades) = 2) = 3,
  'DEMO: a equipa tem apresentação e especialidades na página pública');
select teste.ok((select bool_and(c.telefone like '+999%') from clientes c join inquilinos i on i.id = c.inquilino_id
                  where i.demonstracao), 'DEMO: telefones que não existem');
-- Código de acesso (D-208): criado pela equipa, válido só para a demonstração atual.
select teste.ok((select length(novo_codigo_demonstracao()) = 6), 'DEMO: a equipa cria um código de 6 algarismos');
create temp table cod as select novo_codigo_demonstracao() c;
grant select on cod to anon, authenticated;
select teste.anonimo();
select teste.ok((select codigo_demonstracao_valido((select c from cod))), 'DEMO: o código certo abre a demonstração');
select teste.ok(not codigo_demonstracao_valido('000000x'), 'DEMO: um código errado não abre');
select teste.erro($$select novo_codigo_demonstracao()$$, 'RISCO: sem sessão não se cria código');
select teste.erro($$select * from demonstracao_codigos$$, 'RISCO: ninguém lê os códigos');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$select novo_codigo_demonstracao()$$, 'RISCO: o dono de uma barbearia não cria código');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select preparar_demonstracao();
select teste.ok(not codigo_demonstracao_valido((select c from cod)), 'DEMO: o Reset invalida o código');
rollback;
