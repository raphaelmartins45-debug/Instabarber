-- =============================================================================
-- Testes dos comprovativos de pagamento (D-168): o dono envia o comprovativo do período a pagar
-- (fatura por pagar ou próximo vencimento); a outra barbearia não o vê; só o super_admin aprova
-- (recebimento, fatura paga, em dia, vencimento avançado, reativação) ou recusa com motivo.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
reset role;
update inquilinos set periodicidade = 'mensal', proximo_vencimento = date '2026-11-01',
       estado_pagamento = 'em_atraso'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';

-- Envio pelo dono A ---------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select inicio = date '2026-11-01' and fim = date '2026-11-30' and fatura_id is null
                   from periodo_a_pagar('aaaaaaaa-0000-0000-0000-000000000000')),
  'COMP: sem fatura por pagar, o período começa no próximo vencimento (um mês)');
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg');
select teste.erro($$insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'bbbbbbbb-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000009.jpg')$$,
  'COMP: o dono A não carrega na pasta da B');
select teste.erro($$select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 47.97,
  hoje_lisboa(), 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000002.jpg')$$,
  'COMP: o ficheiro tem de existir no bucket');
select teste.erro($$select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'dinheiro', 47.97,
  hoje_lisboa(), 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg')$$,
  'COMP: só MB Way ou transferência');
select teste.erro($$select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 47.97,
  hoje_lisboa() + 1, 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg')$$,
  'COMP: a data do pagamento não pode ser futura');
select teste.ok(enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 47.97, hoje_lisboa(),
  'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg') is not null,
  'COMP: o dono envia o comprovativo');
select teste.erro($$select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 47.97,
  hoje_lisboa(), 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg')$$,
  'COMP: um só comprovativo em análise por período');
select teste.ok((select count(*) = 1 and bool_and(estado = 'pendente') from comprovativos_pagamento),
  'COMP: o dono vê o seu comprovativo em análise');
select teste.erro($$select aprovar_comprovativo((select id from comprovativos_pagamento limit 1))$$,
  'COMP: o dono não aprova');
select teste.zero($$update comprovativos_pagamento set estado = 'aprovado'$$, 'COMP: o dono não muda o estado à mão');

-- Isolamento -----------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000005');
select teste.ok((select count(*) from comprovativos_pagamento) = 0, 'COMP: a barbearia B não vê o da A');
select teste.ok((select count(*) from storage.objects where bucket_id = 'comprovativos') = 0,
  'COMP: a barbearia B não vê o ficheiro da A');
select teste.erro($$select enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'mbway', 1,
  hoje_lisboa(), 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000001.jpg')$$,
  'COMP: o dono B não envia pela A');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.ok((select count(*) from comprovativos_pagamento) = 0, 'COMP: o barbeiro não vê os pagamentos');

-- Aprovação pela Performa LAB ---------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from storage.objects where bucket_id = 'comprovativos') = 1,
  'COMP: o super_admin lê o ficheiro');
select teste.ok(aprovar_comprovativo((select id from comprovativos_pagamento limit 1)) is not null,
  'COMP: o super_admin aprova');
select teste.ok((select count(*) = 1 and bool_and(metodo = 'mbway' and valor = 47.97 and nota = 'Comprovativo aprovado')
                   from recebimentos where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'COMP: a aprovação regista o recebimento');
select teste.ok((select estado_pagamento = 'em_dia' and proximo_vencimento = date '2026-12-01'
                   from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'COMP: a barbearia fica em dia e o vencimento avança um mês');
select teste.ok((select estado = 'aprovado' and recebimento_id is not null and decidido_em is not null
                   from comprovativos_pagamento limit 1), 'COMP: o comprovativo fica aprovado');
select teste.erro($$select aprovar_comprovativo((select id from comprovativos_pagamento limit 1))$$,
  'COMP: não se aprova duas vezes');
select teste.ok((select count(*) from auditoria where accao in ('comprovativo_enviado','comprovativo_aprovado')) = 2,
  'COMP: envio e aprovação ficam em auditoria');

-- Fatura-recibo do programa certificado (D-170) --------------------------------------
select teste.erro($$select registar_fatura_do_comprovativo((select id from comprovativos_pagamento limit 1), '', hoje_lisboa())$$,
  'FAT: o número da fatura é obrigatório');
select teste.ok(registar_fatura_do_comprovativo((select id from comprovativos_pagamento limit 1), 'FR 2026/1', hoje_lisboa()) is not null,
  'FAT: regista a fatura-recibo emitida');
select teste.ok((select f.paga_em = c.pago_em and f.valor = c.valor and f.periodo_inicio = c.periodo_inicio
                   from comprovativos_pagamento c join faturas_plataforma f on f.id = c.fatura_id limit 1),
  'FAT: a fatura fica paga na data do comprovativo, com o valor e o período');
select teste.ok((select r.fatura_id = c.fatura_id from comprovativos_pagamento c join recebimentos r on r.id = c.recebimento_id limit 1),
  'FAT: o recebimento fica ligado à fatura');
select teste.erro($$select registar_fatura_do_comprovativo((select id from comprovativos_pagamento limit 1), 'FR 2026/2', hoje_lisboa())$$,
  'FAT: não se emite segunda fatura para o mesmo comprovativo');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$select registar_fatura_do_comprovativo(gen_random_uuid(), 'FR 2026/3', hoje_lisboa())$$,
  'FAT: o dono não regista faturas');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');

-- Fatura por pagar, recusa e reativação ----------------------------------------------
reset role;
insert into faturas_plataforma (id, inquilino_id, numero, valor, periodo_inicio, periodo_fim, emitida_em) values
  ('c1000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', 'FT 2026/99', 47.97,
   date '2026-12-01', date '2026-12-31', date '2026-11-25');
update inquilinos set estado = 'suspenso', estado_pagamento = 'em_atraso'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000003.pdf');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok((select fatura_id = 'c1000000-0000-0000-0000-000000000001' from periodo_a_pagar('aaaaaaaa-0000-0000-0000-000000000000')),
  'COMP: com uma fatura por pagar, o período é o dela');
select teste.ok(enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'transferencia', 47.97, hoje_lisboa(),
  'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000003.pdf') is not null,
  'COMP: suspensa, o dono ainda envia o comprovativo (M.4)');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$select recusar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'), '')$$,
  'COMP: recusar pede motivo');
select recusar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'), 'Valor não confere');
select teste.ok((select estado = 'recusado' and motivo = 'Valor não confere' from comprovativos_pagamento
                  where caminho like '%3.pdf'), 'COMP: recusado com o motivo');
select teste.ok((select paga_em is null from faturas_plataforma where id = 'c1000000-0000-0000-0000-000000000001'),
  'COMP: a recusa não paga a fatura');
reset role;
insert into storage.objects (bucket_id, name) values
  ('comprovativos', 'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000004.png');
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.ok(enviar_comprovativo('aaaaaaaa-0000-0000-0000-000000000000', 'transferencia', 47.97, hoje_lisboa(),
  'aaaaaaaa-0000-0000-0000-000000000000/c0000000-0000-0000-0000-000000000004.png') is not null,
  'COMP: depois da recusa, envia-se outro');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select aprovar_comprovativo((select id from comprovativos_pagamento where estado = 'pendente'));
select teste.ok((select paga_em = hoje_lisboa() from faturas_plataforma where id = 'c1000000-0000-0000-0000-000000000001'),
  'COMP: aprovar paga a fatura do período');
select teste.ok((select estado = 'ativo' and estado_pagamento = 'em_dia' and proximo_vencimento = date '2027-01-01'
                   from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'COMP: a barbearia suspensa por falta de pagamento é reativada e o vencimento avança');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');
select teste.erro($$select aprovar_comprovativo(gen_random_uuid())$$, 'COMP: sem dois fatores, não aprova');
rollback;
