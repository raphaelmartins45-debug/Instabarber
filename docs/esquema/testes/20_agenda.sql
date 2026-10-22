-- =============================================================================
-- Testes do motor de agenda (F.7). Barbearia A: 09:00–19:30, descanso ao
-- domingo e à segunda, granularidade 30 min, Corte = 30 min, 15,00 €.
-- Já existem: Rafael (A1) às 10:00 e Diogo (A2) às 11:00 de 4/11/2026.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on

begin;
-- Atalhos para ler os testes
create temp view v as select
  'aaaaaaaa-0000-0000-0000-000000000000'::uuid as a,
  '20000000-0000-0000-0000-000000000001'::uuid as a1,
  '20000000-0000-0000-0000-000000000002'::uuid as a2,
  '30000000-0000-0000-0000-000000000001'::uuid as corte;
grant select on v to anon, authenticated;

-- ------------------------------------------------------------- validação
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','09:00')) is null, 'vaga válida às 09:00') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','10:00')) = 'ocupado', 'vaga ocupada') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','09:45')) = 'ocupado', 'serviço que entra numa marcação existente') from v;
select teste.ok(validar_vaga(a, a2, corte, instante_lisboa('2026-11-04','10:00')) is null, 'o outro barbeiro está livre') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','19:15')) = 'fora_do_horario', 'serviço que acaba depois do fecho') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','19:00')) is null, 'último serviço que cabe até às 19:30') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','08:30')) = 'fora_do_horario', 'antes da abertura') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-08','10:00')) = 'dia_de_descanso', 'domingo é descanso') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-12-08','10:00')) = 'feriado', 'feriado nacional (8 de dezembro)') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-10-21','08:00') - interval '1 day') is not null, 'no passado não se marca') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2027-03-03','10:00')) = 'fora_da_janela', 'fora da janela de 60 dias') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2027-03-03','10:00'), false) is null, 'ao balcão a janela não se aplica') from v;

update inquilinos set intervalo_almoco_inicio = '13:00', intervalo_almoco_fim = '14:00' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','12:45')) = 'intervalo_almoco', 'serviço que entra no almoço') from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-04','14:00')) is null, 'depois do almoço') from v;

insert into ausencias (inquilino_id, profissional_id, inicio, fim, tipo)
select a, a1, instante_lisboa('2026-11-05','00:00'), instante_lisboa('2026-11-06','00:00'), 'ferias' from v;
select teste.ok(validar_vaga(a, a1, corte, instante_lisboa('2026-11-05','10:00')) = 'ausencia', 'L2: férias do barbeiro bloqueiam a agenda dele') from v;
select teste.ok(validar_vaga(a, a2, corte, instante_lisboa('2026-11-05','10:00')) is null, 'L2: o colega continua disponível') from v;
insert into ausencias (inquilino_id, profissional_id, inicio, fim, tipo)
select a, null, instante_lisboa('2026-11-06','14:00'), instante_lisboa('2026-11-06','19:30'), 'outro' from v;
select teste.ok(validar_vaga(a, a2, corte, instante_lisboa('2026-11-06','15:00')) = 'ausencia', 'L2: barbearia fechada à tarde bloqueia todos') from v;

-- Horário próprio do barbeiro: só terças e quartas, das 10:00 às 14:00
insert into horarios_profissional (inquilino_id, profissional_id, dia_semana, inicio, fim)
select a, a2, d, '10:00', '14:00' from v, (values (2),(3)) x(d);
select teste.ok(validar_vaga(a, a2, corte, instante_lisboa('2026-11-04','09:00')) = 'fora_do_horario', 'horário próprio: antes das 10:00') from v;
select teste.ok(validar_vaga(a, a2, corte, instante_lisboa('2026-11-05','10:00')) = 'fora_do_horario', 'horário próprio: quinta não trabalha') from v;
select teste.ok(validar_vaga(a, a2, corte, instante_lisboa('2026-11-04','13:30')) is null, 'horário próprio: dentro do horário dele') from v;
delete from horarios_profissional;
update inquilinos set intervalo_almoco_inicio = null, intervalo_almoco_fim = null where id = 'aaaaaaaa-0000-0000-0000-000000000000';

-- ------------------------------------------------------------- vagas livres
select teste.ok((select count(*) from vagas_livres(a, corte, '2026-11-04', a1)) = 20, 'Rafael tem 20 vagas na quarta (21 menos a das 10:00)') from v;
select teste.ok((select min(hora_local(inicio))::time from vagas_livres(a, corte, '2026-11-04', a1)) = '09:00', 'a primeira vaga é às 09:00') from v;
select teste.ok((select count(*) from vagas_livres(a, corte, '2026-11-04')) = 40, 'sem preferência: vagas dos dois barbeiros') from v;
select teste.ok((select count(*) from vagas_livres(a, corte, '2026-11-08')) = 0, 'domingo sem vagas') from v;

-- ------------------------------------------------------------- mudança de hora
-- Para testar os domingos de mudança de hora, a barbearia abre ao domingo e nos feriados.
update inquilinos set dias_descanso = '{}', fecha_feriados = false where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok((select count(*) from vagas_livres(a, corte, '2026-10-25', a1, false)) = 21, 'DST 25/10/2026: 21 vagas, como num dia normal') from v;
select teste.ok((select min(hora_local(inicio))::time from vagas_livres(a, corte, '2026-10-25', a1, false)) = '09:00', 'DST 25/10/2026: primeira vaga às 09:00 locais') from v;
select teste.ok((select max(hora_local(inicio))::time from vagas_livres(a, corte, '2026-10-25', a1, false)) = '19:00', 'DST 25/10/2026: última vaga às 19:00 locais') from v;
select teste.ok(instante_lisboa('2026-10-25','09:00') = '2026-10-25 09:00:00+00', 'DST 25/10/2026: 09:00 em Lisboa = 09:00 UTC (hora de inverno)');
select teste.ok(instante_lisboa('2026-10-24','09:00') = '2026-10-24 08:00:00+00', 'véspera: 09:00 em Lisboa = 08:00 UTC (hora de verão)');
select teste.ok((select count(*) from vagas_livres(a, corte, '2027-03-28', a1, false)) = 21, 'DST 28/03/2027: 21 vagas') from v;
select teste.ok((select min(hora_local(inicio))::time from vagas_livres(a, corte, '2027-03-28', a1, false)) = '09:00', 'DST 28/03/2027: primeira vaga às 09:00 locais') from v;
select teste.ok((select bool_and(extract(minute from hora_local(inicio)) in (0, 30)) from vagas_livres(a, corte, '2027-03-28', a1, false)), 'DST 28/03/2027: todas as vagas em :00 ou :30') from v;
update inquilinos set dias_descanso = '{0,1}', fecha_feriados = true where id = 'aaaaaaaa-0000-0000-0000-000000000000';

-- ------------------------------------------------------------- preço por período (F.4.7)
insert into periodos_desconto (inquilino_id, dia_semana, hora_inicio, hora_fim, percentagem)
select a, 3, time '14:00', time '17:00', 20 from v union all select a, 3, time '15:00', time '18:00', 10 from v;
update inquilino_funcionalidades set ativa = false where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'precos_dinamicos';
select teste.ok((select desconto_percent from calcular_preco(a, corte, instante_lisboa('2026-11-04','15:00'))) = 0,
  'sem a funcionalidade precos_dinamicos, não há desconto') from v;
update inquilino_funcionalidades set ativa = true where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'precos_dinamicos';
select teste.ok((select (desconto_percent, valor_cobrado) = (20.00, 12.00) from calcular_preco(a, corte, instante_lisboa('2026-11-04','15:00'))),
  'períodos sobrepostos: vale o maior (20 %), nunca a soma') from v;
select teste.ok((select (desconto_percent, valor_cobrado) = (10.00, 13.50) from calcular_preco(a, corte, instante_lisboa('2026-11-04','17:00'))),
  'às 17:00 só vale o de 10 %') from v;
select teste.ok((select desconto_percent from calcular_preco(a, corte, instante_lisboa('2026-11-04','10:00'))) = 0, 'fora do período: preço de tabela') from v;

-- ------------------------------------------------------------- reservar e confirmar (página pública, anónimo)
select teste.anonimo();
create temp table r as select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','15:00'), '20000000-0000-0000-0000-000000000001');
select teste.ok((select valor_cobrado from r) = 12.00, 'a reserva já traz o preço com desconto');
select teste.erro($$select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','15:00'), '20000000-0000-0000-0000-000000000001')$$, 'duas reservas na mesma vaga: a segunda falha');
select teste.ok((select count(*) from vagas_livres('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  '2026-11-04', '20000000-0000-0000-0000-000000000001') where hora_local(inicio)::time = '15:00') = 0, 'a vaga reservada sai da página pública');
select teste.erro($$select confirmar_reserva((select marcacao_id from r), 'token-errado', 'Ana', '+351915555555')$$, 'token errado não confirma');
select teste.ok(confirmar_reserva((select marcacao_id from r), (select token from r), 'Ana', '+351915555555', 'ana@x.pt', null, true) is not null,
  'confirmação com o token certo');
reset role;
select teste.ok((select estado = 'agendada' and cliente_id is not null and reservada_ate is null from marcacoes where id = (select marcacao_id from r)),
  'a reserva passa a marcação agendada, com cliente');
select teste.ok((select consentimento_mensagens and consentimento_em is not null from clientes where telefone = '+351915555555'), 'consentimento registado com data');

-- Sem preferência: Rafael ocupado às 10:00, a vaga vai para o Diogo
select teste.anonimo();
select teste.ok((select profissional_id from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','10:00'))) = '20000000-0000-0000-0000-000000000002', 'sem preferência escolhe quem está livre');
reset role;

-- Reserva expirada liberta a vaga
create temp table r2 as select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','16:00'), '20000000-0000-0000-0000-000000000001');
update marcacoes set reservada_ate = now() - interval '1 minute' where id = (select marcacao_id from r2);
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','16:00')) is null, 'reserva expirada não conta como ocupada');
select teste.ok((select count(*) from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','16:00'), '20000000-0000-0000-0000-000000000001')) = 1, 'nova reserva na vaga expirada');
select teste.ok((select estado = 'cancelada' and motivo_cancelamento = 'reserva_expirada' from marcacoes where id = (select marcacao_id from r2)),
  'a reserva expirada fica cancelada');

-- ------------------------------------------------------------- cancelar e faltar libertam a vaga (B10)
update marcacoes set estado = 'cancelada' where id = '50000000-0000-0000-0000-000000000001';
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','10:00')) is null, 'B10: marcação cancelada liberta o horário');
select teste.ok((select count(*) from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
  instante_lisboa('2026-11-04','10:00'), '20000000-0000-0000-0000-000000000001')) = 1, 'B10: e pode voltar a ser marcado');
update marcacoes set estado = 'falta' where id = '50000000-0000-0000-0000-000000000002';
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','11:00'), false) is null, 'B10: falta liberta o horário para um encaixe');

-- A constraint trava sobreposições mesmo que o código erre
select teste.erro($$insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
          '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','15:15'), 'balcao')$$, 'sobreposição recusada na base de dados');

-- Intervalo entre marcações
update inquilinos set intervalo_marcacoes_min = 10 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
insert into marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem)
values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','17:00'), 'balcao');
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','17:30')) = 'ocupado', 'intervalo de 10 min depois das 17:00–17:30');

-- Barbearia fechada na Gestão do sistema: a página pública não aceita, o balcão sim
update inquilinos set aberto = false where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','09:00')) = 'barbearia_fechada', 'interruptor fechado bloqueia a página pública');
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04','09:00'), false) is null, 'mas não o balcão');
rollback;

\echo '== agenda: todos os testes passaram'
