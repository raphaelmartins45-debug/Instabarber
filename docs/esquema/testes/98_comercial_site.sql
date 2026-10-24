-- =============================================================================
-- Testes do formulário do site em dois passos no CRM (Fase 3B, D-146): o passo 1 cria o
-- lead; o passo 2 completa só os campos vazios do lead aberto e fica no histórico; um lead
-- do site sem o passo 2 é «incompleto».
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
select teste.anonimo();
select teste.ok(submeter_lead('{"nome":"Rui Lopes","telefone":"912 000 111","email":"rui@corte.pt"}'),
                'SITE: o passo 1 cria o lead');
select teste.ok(submeter_lead('{"nome":"Ana Reis","email":"ana@navalha.pt"}'),
                'SITE: outro visitante faz só o passo 1');
select teste.ok(submeter_lead('{"passo":"2","nome":"Rui Lopes","telefone":"912000111","email":"rui@corte.pt","barbearia":"Corte Fino","cidade":"Braga","barbeiros":"3 ou mais","distrito":"Braga","dificuldade":"Faltas"}'),
                'SITE: o passo 2 do mesmo contacto é aceite');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from leads) = 2, 'SITE: o passo 2 não cria outro lead');
select teste.ok((select nome_barbearia || '/' || cidade || '/' || n_barbeiros from leads where email = 'rui@corte.pt')
                = 'Corte Fino/Braga/3 ou mais', 'SITE: o passo 2 preenche barbearia, cidade e barbeiros');
select teste.ok((select detalhes ->> 'dificuldade' from lead_eventos e join leads l on l.id = e.lead_id
                  where l.email = 'rui@corte.pt' and e.detalhes ->> 'passo' = '2') = 'Faltas',
                'SITE: a dificuldade fica no histórico do passo 2');
select teste.ok((select count(*) from leads l where l.origem = 'landing' and not exists (
                   select 1 from lead_eventos e where e.lead_id = l.id and e.detalhes ->> 'passo' = '2')) = 1,
                'SITE: só o lead sem passo 2 é incompleto');

update leads set nome_barbearia = 'Nome certo' where email = 'rui@corte.pt';
select teste.anonimo();
select teste.ok(submeter_lead('{"passo":"2","nome":"Rui Lopes","email":"rui@corte.pt","barbearia":"Outro nome"}'),
                'SITE: um passo 2 repetido é aceite');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select nome_barbearia from leads where email = 'rui@corte.pt') = 'Nome certo',
                'SITE: o passo 2 nunca escreve por cima de um campo já preenchido');
select teste.anonimo();
select teste.zero($$select 1 from lead_eventos$$, 'SITE: o visitante não lê o histórico');
rollback;
