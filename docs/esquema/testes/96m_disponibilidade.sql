-- =============================================================================
-- Testes da disponibilidade (D-202): nenhuma marcação numa hora que já passou, venha de onde
-- vier; o horário do barbeiro cabe no da barbearia; o barbeiro gere o seu horário e bloqueia as
-- suas horas (e só as suas); um bloqueio nunca fica por cima de marcações.
-- O relógio da agenda está parado em 20/10/2026, 08:00 (05_dados_teste.sql).
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- Barbearia A: aberta das 09:00 às 19:30, descanso ao domingo e à segunda; Rafael (…01) tem uma
-- marcação na quarta, 4/11, às 10:00; Diogo (…02) está livre.

-- Horas passadas
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-10-19', '10:00'), false) = 'passado',
  'DISP: ao balcão também não se marca numa hora que já passou');
-- A meio do dia: o relógio passa para as 14:00 de Lisboa (desfeito no fim, com o rollback).
create or replace function public.agora() returns timestamptz
language sql stable set search_path = '' as $$ select timestamptz '2026-10-20 13:00+00' $$;
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-10-20', '11:00'), false) = 'passado',
  'DISP: hoje, as 11:00 já passaram');
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-10-20', '15:00'), false) is null,
  'DISP: hoje, as 15:00 estão livres');
select teste.ok((select min(hora_local(inicio))::time from vagas_livres('aaaaaaaa-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000001', '2026-10-20', '20000000-0000-0000-0000-000000000002', false)) = '14:00',
  'DISP: as vagas de hoje começam à hora do relógio');
create or replace function public.agora() returns timestamptz
language sql stable set search_path = '' as $$ select timestamptz '2026-10-20 08:00+00' $$;
select teste.erro($$insert into marcacoes (inquilino_id, profissional_id, servico_id, inicio, origem)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
          '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-10-19', '15:00'), 'balcao')$$,
  'DISP: a base de dados recusa gravar uma marcação no passado');

-- O horário do barbeiro cabe no da barbearia
select teste.erro($$insert into horarios_profissional (inquilino_id, profissional_id, dia_semana, inicio, fim)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 3, '08:00', '13:00')$$,
  'DISP: o horário do barbeiro não começa antes da abertura');
select teste.erro($$insert into horarios_profissional (inquilino_id, profissional_id, dia_semana, inicio, fim)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 0, '10:00', '13:00')$$,
  'DISP: nem num dia de descanso da barbearia');

-- O barbeiro gere o seu horário, e só o seu
select teste.como('10000000-0000-0000-0000-000000000004');
insert into horarios_profissional (inquilino_id, profissional_id, dia_semana, inicio, fim)
values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002', 3, '14:00', '19:30');
select teste.ok((select count(*) = 1 from horarios_profissional where profissional_id = '20000000-0000-0000-0000-000000000002'),
  'DISP: o Diogo grava o seu horário');
select teste.erro($$insert into horarios_profissional (inquilino_id, profissional_id, dia_semana, inicio, fim)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001', 3, '14:00', '19:30')$$,
  'DISP: o Diogo não mexe no horário do Rafael');
reset role;
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04', '10:00'), false) = 'fora_do_horario',
  'DISP: com o horário dele, de manhã não há vaga');

-- Bloqueios
select teste.como('10000000-0000-0000-0000-000000000004');
insert into ausencias (id, inquilino_id, profissional_id, inicio, fim, tipo, motivo)
values ('70000000-0000-0000-0000-0000000000d1', 'aaaaaaaa-0000-0000-0000-000000000000',
        '20000000-0000-0000-0000-000000000002', instante_lisboa('2026-11-04', '15:00'),
        instante_lisboa('2026-11-04', '16:00'), 'bloqueio', 'Dentista');
select teste.ok((select criado_por = '10000000-0000-0000-0000-000000000004' from ausencias
  where id = '70000000-0000-0000-0000-0000000000d1'), 'DISP: o Diogo bloqueia uma hora e fica como autor');
select teste.erro($$insert into ausencias (inquilino_id, profissional_id, inicio, fim, tipo)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
          instante_lisboa('2026-11-05', '15:00'), instante_lisboa('2026-11-05', '16:00'), 'bloqueio')$$,
  'DISP: o Diogo não bloqueia horas do Rafael');
reset role;
select teste.ok(validar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04', '15:00'), false) = 'ausencia',
  'DISP: a hora bloqueada sai das vagas');
-- O dono marca férias ao Diogo: o Diogo não as apaga.
insert into ausencias (id, inquilino_id, profissional_id, inicio, fim, tipo, criado_por)
values ('70000000-0000-0000-0000-0000000000d2', 'aaaaaaaa-0000-0000-0000-000000000000',
        '20000000-0000-0000-0000-000000000002', instante_lisboa('2026-12-01', '00:00'),
        instante_lisboa('2026-12-02', '00:00'), 'ferias', '10000000-0000-0000-0000-000000000002');
select teste.como('10000000-0000-0000-0000-000000000004');
delete from ausencias where id = '70000000-0000-0000-0000-0000000000d2';
delete from ausencias where id = '70000000-0000-0000-0000-0000000000d1';
reset role;
select teste.ok((select count(*) = 1 from ausencias where id = '70000000-0000-0000-0000-0000000000d2'),
  'DISP: as férias marcadas pelo dono ficam');
select teste.ok((select count(*) = 0 from ausencias where id = '70000000-0000-0000-0000-0000000000d1'),
  'DISP: o Diogo apaga o seu bloqueio');

-- Um bloqueio nunca fica por cima de marcações
select teste.erro($$insert into ausencias (inquilino_id, profissional_id, inicio, fim, tipo)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '20000000-0000-0000-0000-000000000001',
          instante_lisboa('2026-11-04', '09:30'), instante_lisboa('2026-11-04', '11:00'), 'bloqueio')$$,
  'DISP: bloquear por cima da marcação do Rafael é recusado');
select teste.erro($$insert into ausencias (inquilino_id, profissional_id, inicio, fim, tipo)
  values ('aaaaaaaa-0000-0000-0000-000000000000', null,
          instante_lisboa('2026-11-04', '00:00'), instante_lisboa('2026-11-05', '00:00'), 'outro')$$,
  'DISP: fechar a barbearia num dia com marcações também é recusado');
rollback;
