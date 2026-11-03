-- =============================================================================
-- Testes da implementação e da cortesia (D-189): a proposta escolhe o pacote (Essencial ou com
-- Formação) com o preço da configuração; metade do valor cobrado é a comissão do comercial; a
-- implementação passa para a barbearia na aprovação e cobra-se no primeiro pagamento, que põe a
-- comissão «a pagar». A cortesia tira a barbearia dos vencimentos até uma data. Só o super_admin
-- define uma e outra.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values ('10000000-0000-0000-0000-0000000000d1', 'd1@instabarber.pt');
reset role;
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-0000000000d1', null, 'comercial', 'D1');
update inquilinos set proximo_vencimento = date '2026-11-01', estado_pagamento = 'em_dia', periodicidade = 'mensal'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';

-- Configuração e proposta -----------------------------------------------------------
select teste.ok((select implementacao_essencial_sem_iva = 50 and implementacao_formacao_sem_iva = 100
                   from configuracao_comercial),
  'IMPL: a configuração traz os dois pacotes (50 € e 100 €)');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update configuracao_comercial set taxa_migracao_ativa = true;
insert into modelos_documento (id, tipo, versao, titulo, corpo, estado, aprovado_por, aprovado_em) values
  ('d0000000-0000-0000-0000-0000000000d1', 'contrato', 21, 'Contrato', 'Texto', 'aprovado',
   '10000000-0000-0000-0000-000000000001', now());
insert into leads (id, nome_contacto, telefone, responsavel_id) values
  ('f0000000-0000-0000-0000-0000000000d1', 'Do D1', '917000001', '10000000-0000-0000-0000-0000000000d1');
update leads set responsavel_id = '10000000-0000-0000-0000-0000000000d1' where id = 'f0000000-0000-0000-0000-0000000000d1';

select teste.como('10000000-0000-0000-0000-0000000000d1', 'aal2');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000d1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"implementacao":"completa","taxa_migracao_sem_iva":100}')$$,
  'IMPL: só há os pacotes Essencial e com Formação');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000d1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"implementacao":"essencial","taxa_migracao_sem_iva":100}')$$,
  'IMPL: o valor tem de ser o preço do pacote escolhido');
select teste.erro($$select criar_proposta('f0000000-0000-0000-0000-0000000000d1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"implementacao":"nenhuma","taxa_migracao_sem_iva":50}')$$,
  'IMPL: sem implementação não há valor');
select teste.ok(criar_proposta('f0000000-0000-0000-0000-0000000000d1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}') is not null,
  'IMPL: uma proposta sem implementação continua válida');
select criar_proposta('f0000000-0000-0000-0000-0000000000d1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"implementacao":"formacao","desconto_taxa_pct":20,"taxa_migracao_sem_iva":80}');
select teste.ok((select implementacao = 'formacao' and taxa_migracao_sem_iva = 80 from propostas where estado = 'rascunho'),
  'IMPL: a proposta guarda o pacote com Formação e o valor com o desconto');
select marcar_proposta_enviada((select id from propostas where estado = 'rascunho'));
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$update propostas set implementacao = 'essencial' where estado = 'enviada'$$,
  'IMPL: depois de enviada, o pacote não muda');
select teste.como('10000000-0000-0000-0000-0000000000d1', 'aal2');
select decidir_proposta((select id from propostas where estado = 'enviada'), true);
select gerar_contrato((select id from propostas where estado = 'aceite'), 'd0000000-0000-0000-0000-0000000000d1',
  '{"razao_social":"Barbearia D1 Lda","nif":"501964843","morada":"Rua D","representante":"Rita"}', 'Texto');
select assinar_contrato((select id from contratos), current_date, 'leads/d/contratos/d.pdf');
select teste.ok((select valor = 40 and estado = 'pendente' from comissoes_comerciais),
  'IMPL: a comissão é metade do valor cobrado (o desconto sai dela)');

-- Aprovação: a implementação passa para a barbearia ------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select ligar_contrato_inquilino((select id from contratos), 'aaaaaaaa-0000-0000-0000-000000000000');
select teste.ok((select implementacao = 'formacao' and implementacao_sem_iva = 80 and implementacao_paga_em is null
                   from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'IMPL: na aprovação, a implementação fica por cobrar na barbearia');

-- Só a Performa LAB mexe ------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$update inquilinos set implementacao_sem_iva = 0 where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'IMPL: o dono não apaga a implementação');
select teste.erro($$update inquilinos set cortesia = true where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'CORT: o dono não se põe em cortesia');
select teste.erro($$select definir_cortesia('aaaaaaaa-0000-0000-0000-000000000000', true, null)$$,
  'CORT: só o super_admin define a cortesia');
select teste.erro($$select definir_implementacao('aaaaaaaa-0000-0000-0000-000000000000', 'nenhuma', 0)$$,
  'IMPL: só o super_admin define a implementação');
select teste.como('10000000-0000-0000-0000-0000000000d1', 'aal2');
select teste.erro($$select definir_cortesia('aaaaaaaa-0000-0000-0000-000000000000', true, null)$$,
  'CORT: o comercial não define a cortesia');

-- Primeiro pagamento: mensalidade + implementação --------------------------------------
reset role;
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000d1.jpg'),
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000d2.jpg');
select teste.como('10000000-0000-0000-0000-000000000002');
select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 99.99, hoje_lisboa(),
  'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000d1.jpg');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select aprovar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'));
select teste.ok((select implementacao_paga_em = hoje_lisboa() from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'IMPL: o primeiro pagamento aprovado paga a implementação');
select teste.ok((select implementacao_sem_iva = 80 from comprovativos_pagamento where estado = 'aprovado'),
  'IMPL: o comprovativo guarda a parte da implementação (fatura com duas linhas)');
select teste.ok((select estado = 'a_pagar' and taxa_paga_em = hoje_lisboa() and vence_em = hoje_lisboa() + 10
                   from comissoes_comerciais),
  'IMPL: com a implementação paga, a comissão vence 10 dias depois');
select teste.erro($$select definir_implementacao('aaaaaaaa-0000-0000-0000-000000000000', 'essencial', 50)$$,
  'IMPL: depois de paga, a implementação não muda');
select teste.como('10000000-0000-0000-0000-000000000002');
select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 19.99, hoje_lisboa(),
  'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-0000000000d2.jpg');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select aprovar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'));
select teste.ok((select implementacao_sem_iva = 0 from comprovativos_pagamento where caminho like '%d2.jpg'),
  'IMPL: o segundo pagamento já não leva implementação');

-- Implementação de uma barbearia registada no painel ------------------------------------
select definir_implementacao('bbbbbbbb-0000-0000-0000-000000000000', 'essencial', 50);
select teste.ok((select implementacao = 'essencial' and implementacao_sem_iva = 50 from inquilinos
                  where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'IMPL: o super_admin define a implementação de uma barbearia');
select teste.erro($$select definir_implementacao('bbbbbbbb-0000-0000-0000-000000000000', 'nenhuma', 10)$$,
  'IMPL: sem implementação o valor é zero');

-- Cortesia ---------------------------------------------------------------------------
select teste.erro($$select definir_cortesia('bbbbbbbb-0000-0000-0000-000000000000', true, hoje_lisboa() - 1)$$,
  'CORT: a data de fim não pode ter passado');
select definir_cortesia('bbbbbbbb-0000-0000-0000-000000000000', true, hoje_lisboa() + 30);
select teste.ok((select cortesia and cortesia_ate = hoje_lisboa() + 30 and proximo_vencimento = hoje_lisboa() + 31
                        and estado_pagamento = 'em_dia'
                   from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'CORT: com data, o primeiro vencimento é o dia a seguir ao fim');
select definir_cortesia('bbbbbbbb-0000-0000-0000-000000000000', true, null);
select teste.ok((select cortesia and cortesia_ate is null and proximo_vencimento is null
                   from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'CORT: sem data, não há vencimento');
select teste.ok((select count(*) from vencimentos_proximos where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000') = 0,
  'CORT: em cortesia, a barbearia sai dos vencimentos');
select definir_cortesia('bbbbbbbb-0000-0000-0000-000000000000', false, null);
select teste.ok((select not cortesia and cortesia_ate is null and proximo_vencimento = hoje_lisboa()
                   from inquilinos where id = 'bbbbbbbb-0000-0000-0000-000000000000'),
  'CORT: ao desligar, o vencimento passa a hoje');
select teste.ok((select count(*) from auditoria where accao = 'inquilino_alterado'
                  and entidade_id = 'bbbbbbbb-0000-0000-0000-000000000000') >= 3,
  'CORT: as mudanças ficam em auditoria');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.erro($$select definir_cortesia('bbbbbbbb-0000-0000-0000-000000000000', true, null)$$,
  'CORT: sem dois fatores, não define a cortesia');
rollback;
