-- =============================================================================
-- Testes do histórico de cortes (D-179): a entrada liga-se à marcação do mesmo cliente;
-- fotografias só com consentimento; o cliente vê só as entradas visíveis, sem a nota interna, e
-- retira o consentimento (as fotografias saem). Isolamento entre barbearias.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- A ficha técnica ligada nas duas barbearias.
insert into inquilino_funcionalidades (inquilino_id, chave, ativa) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'ficha_tecnica', true),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'ficha_tecnica', true)
on conflict (inquilino_id, chave) do update set ativa = true;

-- O barbeiro Rafael (A) regista o corte do João (cliente dele), ligado à marcação.
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$insert into fichas_tecnicas (inquilino_id, cliente_id, profissional_id, marcacao_id, nota, foto_path)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
          '20000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Pente 2',
          'aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000001/a.jpg')$$,
  'HIST: sem o consentimento do cliente, a fotografia é recusada');
update clientes set consentimento_fotos = true, consentimento_fotos_em = now()
 where id = '40000000-0000-0000-0000-000000000001';
insert into fichas_tecnicas (id, inquilino_id, cliente_id, profissional_id, marcacao_id, nota, nota_cliente,
                             foto_path, foto2_path, visivel_cliente)
values ('60000000-0000-0000-0000-0000000000f1', 'aaaaaaaa-0000-0000-0000-000000000000',
        '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000001', 'Pente 2 dos lados; reclama do pescoço',
        'Degradê baixo, risca à esquerda',
        'aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000001/a.jpg',
        'aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000001/b.jpg', true);
select teste.ok((select count(*) = 1 from fichas_tecnicas where id = '60000000-0000-0000-0000-0000000000f1'),
  'HIST: com consentimento, regista a entrada com duas fotografias e as duas notas');
select teste.erro($$insert into fichas_tecnicas (inquilino_id, cliente_id, marcacao_id, nota)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
          '50000000-0000-0000-0000-000000000001', 'Outra')$$,
  'HIST: uma só entrada por marcação');
select teste.erro($$insert into fichas_tecnicas (inquilino_id, cliente_id, marcacao_id, nota)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
          '50000000-0000-0000-0000-000000000002', 'De outro cliente')$$,
  'HIST: a marcação tem de ser do mesmo cliente');
select teste.erro($$insert into fichas_tecnicas (inquilino_id, cliente_id, nota, foto2_path)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', 'x', 'p/x.jpg')$$,
  'HIST: a segunda fotografia só com a primeira');
insert into fichas_tecnicas (id, inquilino_id, cliente_id, profissional_id, nota)
values ('60000000-0000-0000-0000-0000000000f2', 'aaaaaaaa-0000-0000-0000-000000000000',
        '40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Só interna');

-- O cliente João vê a sua entrada visível, sem a nota interna, com as fotografias.
select teste.como('10000000-0000-0000-0000-000000000007');
select teste.ok((select count(*) = 1 and bool_and(nota = 'Degradê baixo, risca à esquerda' and servico = 'Corte'
                   and profissional = 'Rafael' and foto2_path is not null)
                   from meu_historico_cortes('aaaaaaaa-0000-0000-0000-000000000000')),
  'HIST: o cliente vê só a entrada visível, com a nota para ele e as fotografias');
select teste.ok((select count(*) = 0 from fichas_tecnicas), 'HIST: o cliente não lê a tabela (nem a nota interna)');
select teste.ok(foto_do_cliente('aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000001/a.jpg', true),
  'HIST: a fotografia da sua entrada visível é dele');
select teste.ok(not foto_do_cliente('aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000002/z.jpg', false),
  'HIST: a fotografia de outro cliente não é dele');
select teste.ok((select count(*) = 0 from meu_historico_cortes('bbbbbbbb-0000-0000-0000-000000000000')),
  'HIST: nada noutra barbearia');

-- O Miguel (cliente da B) não vê o histórico do João.
select teste.como('10000000-0000-0000-0000-000000000008');
select teste.ok((select count(*) = 0 from meu_historico_cortes('aaaaaaaa-0000-0000-0000-000000000000')),
  'HIST: o cliente de outra barbearia não vê nada');
select teste.ok(not foto_do_cliente('aaaaaaaa-0000-0000-0000-000000000000/40000000-0000-0000-0000-000000000001/a.jpg', false),
  'HIST: nem as fotografias');
select teste.ok((select count(*) = 0 from minhas_fotos_historico('aaaaaaaa-0000-0000-0000-000000000000')),
  'HIST: nem os caminhos das fotografias de outra barbearia');
select teste.erro($$select mudar_consentimento_fotos('aaaaaaaa-0000-0000-0000-000000000000', false)$$,
  'HIST: não mexe no consentimento de outra barbearia');

-- O João retira o consentimento: as fotografias saem e o histórico fica só com a nota.
select teste.como('10000000-0000-0000-0000-000000000007');
select teste.ok((select count(*) = 2 from minhas_fotos_historico('aaaaaaaa-0000-0000-0000-000000000000')),
  'HIST: o cliente sabe os caminhos das suas fotografias, para as apagar');
select mudar_consentimento_fotos('aaaaaaaa-0000-0000-0000-000000000000', false);
reset role;
select teste.ok((select foto_path is null and foto2_path is null and nota_cliente is not null
                   from fichas_tecnicas where id = '60000000-0000-0000-0000-0000000000f1'),
  'HIST: ao retirar o consentimento, as fotografias saem e as notas ficam');
select teste.ok((select not consentimento_fotos and consentimento_fotos_em is null
                   from clientes where id = '40000000-0000-0000-0000-000000000001'),
  'HIST: o consentimento fica retirado');
select teste.ok((select count(*) = 1 from fichas_tecnicas where id = '60000000-0000-0000-0000-0000000000f2'),
  'HIST: a entrada só com a nota interna fica');

-- O Diogo (outro barbeiro da A) não regista no cliente do Rafael.
select teste.como('10000000-0000-0000-0000-000000000004');
select teste.erro($$insert into fichas_tecnicas (inquilino_id, cliente_id, nota)
  values ('aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001', 'Intruso')$$,
  'HIST: o colega não escreve no histórico de um cliente que não é dele');
rollback;
