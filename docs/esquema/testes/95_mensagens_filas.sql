-- =============================================================================
-- Testes das filas, do e-mail de confirmação, do clube na página pública e da auditoria do
-- interruptor geral dos módulos (Fase 6, D-126).
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
update inquilino_funcionalidades set ativa = true
 where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000'
   and chave in ('fila_espera','qr_entrada','confirmacao_email','clube_assinatura','envio_mensagens');
create temp table amanha as select (hora_local(now())::date + 1) as d;
grant select on amanha to anon, authenticated;

-- Fila de espera (F.4.1): posição por serviço e dia; uma só entrada por cliente.
select teste.anonimo();
create temp table fe as
  select entrar_fila_espera('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
                            (select d from amanha), 'Ana Fila', '+351939100001') as id1,
         entrar_fila_espera('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
                            (select d from amanha), 'Bruno Fila', '+351939100002') as id2;
grant select on fe to anon, authenticated;
reset role;
update fila_espera set criado_em = criado_em + interval '1 second' where id = (select id2 from fe);
select teste.anonimo();
select teste.ok(posicao_fila_espera((select id1 from fe)) = 1 and posicao_fila_espera((select id2 from fe)) = 2,
                'FILA: a posição segue a ordem de entrada');
select teste.ok(entrar_fila_espera('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
                                   (select d from amanha), 'Ana Fila', '+351939100001') = (select id1 from fe),
                'FILA: quem tenta outra vez fica com a mesma entrada');
select teste.ok(posicao_fila_espera(gen_random_uuid()) = 0, 'FILA: uma entrada desconhecida não tem posição');
select teste.erro($$select avisar_fila_espera((select id1 from fe))$$, 'FILA: sem sessão não se avisa');

-- Aviso: só a equipa da barbearia, com prazo de 30 minutos, uma vez.
select teste.como('10000000-0000-0000-0000-000000000006');
select teste.erro($$select avisar_fila_espera((select id1 from fe))$$, 'FILA: outra barbearia não avisa');
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.ok((select p between now() + interval '29 minutes' and now() + interval '31 minutes'
                   from (select avisar_fila_espera((select id1 from fe)) as p) x),
                'FILA: o aviso grava o prazo de 30 minutos');
select teste.ok((select estado = 'avisado' and expira_em is not null from fila_espera where id = (select id1 from fe)),
                'FILA: a entrada fica avisada');
select teste.erro($$select avisar_fila_espera((select id1 from fe))$$, 'FILA: não se avisa duas vezes');
reset role;
update inquilino_funcionalidades set ativa = false
 where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'envio_mensagens';
select teste.como('10000000-0000-0000-0000-000000000003');
select teste.erro($$select avisar_fila_espera((select id2 from fe))$$, 'FILA: sem mensagens (Basic) não há aviso');
reset role;
update inquilino_funcionalidades set ativa = true
 where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'envio_mensagens';

-- Fila presencial (F.4.3): posição e os números da estimativa de espera.
select teste.anonimo();
create temp table fp as
  select (select entrada_id from entrar_fila_presencial('aaaaaaaa-0000-0000-0000-000000000000', 'Carla QR',
            '+351939200001', '30000000-0000-0000-0000-000000000001')) as id1;
insert into fp select (select entrada_id from entrar_fila_presencial('aaaaaaaa-0000-0000-0000-000000000000',
            'Duarte QR', '+351939200002'));
grant select on fp to anon, authenticated;
reset role;
update fila_presencial set entrou_em = entrou_em + interval '1 second' where id = (select id1 from fp offset 1);
select teste.anonimo();
select teste.ok((select estado = 'aguarda' and posicao = 2 and minutos_a_frente = 30 and profissionais = 2
                   from estado_fila_presencial((select id1 from fp offset 1))),
                'FILA: a segunda pessoa vê a posição 2 e os 30 minutos do serviço à frente');
select teste.ok((select count(*) = 0 from estado_fila_presencial(gen_random_uuid())),
                'FILA: uma entrada desconhecida não devolve nada');

-- E-mail de confirmação (F.4.12): os dados uma só vez, com a funcionalidade ligada e e-mail dado.
create temp table r as
  select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
                              instante_lisboa('2026-11-11', '16:00'), '20000000-0000-0000-0000-000000000001');
grant select on r to anon, authenticated;
select confirmar_reserva((select marcacao_id from r), (select token from r), 'Eva Email', '+351939300001',
                         'eva@exemplo.pt', null, false, null);
select teste.ok((select para = 'eva@exemplo.pt' and servico = 'Corte' and barbeiro = 'Rafael'
                   and cancelamento_min = 120 from reclamar_email_confirmacao((select marcacao_id from r))),
                'EMAIL: quem confirmou recebe os dados do e-mail');
select teste.ok((select count(*) = 0 from reclamar_email_confirmacao((select marcacao_id from r))),
                'EMAIL: o segundo pedido não devolve nada (um só envio)');
select registar_email_confirmacao((select marcacao_id from r), true);
select registar_email_confirmacao((select marcacao_id from r), false);
reset role;
select teste.ok((select count(*) = 1 and bool_and(estado = 'enviado' and canal = 'email')
                   from mensagens where referencia_id = (select marcacao_id from r)),
                'EMAIL: o envio fica uma vez em mensagens');
select teste.ok((select confirmacao_email_em is not null from marcacoes where id = (select marcacao_id from r)),
                'EMAIL: a data fica na marcação');
update inquilino_funcionalidades set ativa = false
 where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000' and chave = 'confirmacao_email';
select teste.anonimo();
create temp table r2 as
  select * from reservar_vaga('aaaaaaaa-0000-0000-0000-000000000000', '30000000-0000-0000-0000-000000000001',
                              instante_lisboa('2026-11-11', '17:00'), '20000000-0000-0000-0000-000000000001');
grant select on r2 to anon, authenticated;
select confirmar_reserva((select marcacao_id from r2), (select token from r2), 'Filipe Email', '+351939300002',
                         'filipe@exemplo.pt', null, false, null);
select teste.ok((select count(*) = 0 from reclamar_email_confirmacao((select marcacao_id from r2))),
                'EMAIL: sem a funcionalidade não há e-mail');
select teste.ok((select count(*) = 0 from reclamar_email_confirmacao('50000000-0000-0000-0000-000000000001')),
                'EMAIL: uma marcação ao balcão não dá e-mail');

-- Clube na página pública: só planos ativos, com os serviços incluídos.
reset role;
insert into clubes (id, inquilino_id, nome, preco_mensal)
values ('60000000-0000-0000-0000-000000000099', 'aaaaaaaa-0000-0000-0000-000000000000', 'Clube Corte', 25);
insert into clube_servicos (inquilino_id, clube_id, servico_id, quantidade_mes)
values ('aaaaaaaa-0000-0000-0000-000000000000', '60000000-0000-0000-0000-000000000099',
        '30000000-0000-0000-0000-000000000001', 2);
select teste.anonimo();
select teste.ok((select count(*) = 1 and bool_and(jsonb_array_length(servicos) = 1 and servicos -> 0 ->> 'servico' = 'Corte')
                   from publico_clubes where inquilino_id = 'aaaaaaaa-0000-0000-0000-000000000000'),
                'CLUBE: a página pública mostra o plano com os serviços');
select teste.ok((select count(*) = 0 from publico_clubes where inquilino_id = 'bbbbbbbb-0000-0000-0000-000000000000'),
                'CLUBE: sem a funcionalidade ou sem planos, nada');

-- Interruptor geral dos módulos (G.4): só o super_admin, em auditoria.
select teste.como('10000000-0000-0000-0000-000000000002');
select teste.zero($$update modulos_plataforma set ativo = true where chave = 'pagamentos'$$,
                  'MODULOS: o gestor não liga o interruptor geral');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update modulos_plataforma set ativo = true where chave = 'pagamentos';
update modulos_plataforma set ativo = false where chave = 'pagamentos';
reset role;
select teste.ok((select count(*) = 2 from auditoria where accao = 'modulos_plataforma_update'
                   and detalhes ->> 'chave' = 'pagamentos'),
                'MODULOS: ligar e desligar o interruptor geral fica em auditoria');
rollback;
