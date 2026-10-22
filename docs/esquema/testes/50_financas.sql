-- =============================================================================
-- Testes das Finanças da Performa LAB (Parte O): custos, contas a pagar, metas e
-- lembretes de vencimento. Cada bloco corre numa transação desfeita no fim.
-- O super_admin do ficheiro 05 é 10000000-…-000000000001.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

-- ------------------------------------------------------------ custos, contas e metas
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into custos_plataforma (descricao, categoria, tipo, valor_sem_iva, periodicidade, data_inicio)
  values ('Supabase Pro', 'infraestrutura', 'fixo', 22.50, 'mensal', '2026-10-01'),
         ('Domínio instabarber.pt', 'dominios', 'fixo', 12.00, 'anual', '2026-10-01');
select teste.ok((select count(*) from custos_plataforma) = 2, 'O: o super_admin regista custos');
select teste.erro($$insert into custos_plataforma (descricao, categoria, valor_sem_iva, data_inicio) values ('x','inexistente',1,'2026-10-01')$$, 'O: categoria de custo inválida é recusada');
select teste.erro($$insert into custos_plataforma (descricao, categoria, valor_sem_iva, data_inicio) values ('x','outros',-1,'2026-10-01')$$, 'O: custo negativo é recusado');
select teste.erro($$insert into custos_plataforma (descricao, categoria, valor_sem_iva, data_inicio, data_fim) values ('x','outros',1,'2026-10-10','2026-10-01')$$, 'O: custo que acaba antes de começar é recusado');
select teste.erro($$insert into custos_plataforma (descricao, categoria, valor_sem_iva, data_inicio) values ('  ','outros',1,'2026-10-01')$$, 'O: custo sem descrição é recusado');
select teste.erro($$insert into custos_plataforma (descricao, categoria, tipo, valor_sem_iva, data_inicio) values ('x','outros','semestral',1,'2026-10-01')$$, 'O: tipo de custo inválido é recusado');

insert into contas_pagar (custo_id, fornecedor, valor_sem_iva, valor_com_iva, vencimento)
  values ((select id from custos_plataforma where descricao = 'Supabase Pro'), 'Supabase', 22.50, 27.68, public.hoje_lisboa() + 3),
         (null, 'Contabilista', 50.00, 61.50, public.hoje_lisboa() - 2),
         (null, 'Vercel', 18.00, 18.00, public.hoje_lisboa() - 10);
update contas_pagar set pago_em = public.hoje_lisboa() - 8 where fornecedor = 'Vercel';
select teste.ok((select estado_efetivo from contas_pagar_com_estado where fornecedor = 'Supabase') = 'pendente', 'O: conta com vencimento futuro está pendente');
select teste.ok((select estado_efetivo from contas_pagar_com_estado where fornecedor = 'Contabilista') = 'atrasada', 'O: conta vencida e por pagar está atrasada');
select teste.ok((select estado_efetivo from contas_pagar_com_estado where fornecedor = 'Vercel') = 'paga', 'O: conta com data de pagamento está paga');
select teste.erro($$insert into contas_pagar (fornecedor, valor_sem_iva, valor_com_iva, vencimento) values ('x', 10, 9, current_date)$$, 'O: valor com IVA abaixo do valor sem IVA é recusado');
select teste.erro($$insert into contas_pagar (fornecedor, valor_sem_iva, valor_com_iva, vencimento) values ('', 10, 12.3, current_date)$$, 'O: conta sem fornecedor é recusada');
delete from custos_plataforma where descricao = 'Supabase Pro';
select teste.ok((select custo_id is null from contas_pagar where fornecedor = 'Supabase'), 'O: apagar um custo não apaga a conta já registada');

insert into metas_faturacao (mes, valor_sem_iva, nota) values ('2026-12-01', 500.00, 'Primeira meta');
select teste.ok((select base from metas_faturacao) = 'mrr', 'O: a meta nasce sobre a receita recorrente');
select teste.erro($$insert into metas_faturacao (mes, valor_sem_iva) values ('2026-12-01', 600)$$, 'O: não há duas metas para o mesmo mês');
select teste.erro($$insert into metas_faturacao (mes, valor_sem_iva) values ('2027-01-15', 600)$$, 'O: a meta é sempre do dia 1 do mês');
select teste.erro($$insert into metas_faturacao (mes, valor_sem_iva) values ('2027-01-01', 0)$$, 'O: meta de zero euros é recusada');
select teste.erro($$insert into metas_faturacao (mes, valor_sem_iva, base) values ('2027-01-01', 100, 'lucro')$$, 'O: base de meta inválida é recusada');
rollback;

-- ------------------------------------------------------------ isolamento
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into custos_plataforma (descricao, categoria, valor_sem_iva, data_inicio) values ('Resend', 'ferramentas', 0, '2026-10-01');
insert into contas_pagar (fornecedor, valor_sem_iva, valor_com_iva, vencimento) values ('Resend', 0, 0, '2026-11-01');
insert into metas_faturacao (mes, valor_sem_iva) values ('2026-12-01', 500);
update inquilinos set proximo_vencimento = public.hoje_lisboa() + 3, whatsapp = '+351912345678', email = 'dono@a.pt'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'whatsapp', 'Olá, a mensalidade vence em breve.');

select teste.como('10000000-0000-0000-0000-000000000002');   -- dono da A
select teste.zero($$select 1 from custos_plataforma$$, 'O: o dono não lê os custos da plataforma');
select teste.zero($$select 1 from contas_pagar$$, 'O: o dono não lê as contas a pagar');
select teste.zero($$select 1 from contas_pagar_com_estado$$, 'O: o dono não lê a vista das contas');
select teste.zero($$select 1 from metas_faturacao$$, 'O: o dono não lê as metas');
select teste.zero($$select 1 from lembretes_vencimento$$, 'O: o dono não lê os lembretes de vencimento');
select teste.zero($$select 1 from vencimentos_proximos$$, 'O: o dono não lê a vista dos vencimentos');
select teste.erro($$insert into custos_plataforma (descricao, categoria, valor_sem_iva, data_inicio) values ('x','outros',1,'2026-10-01')$$, 'O: o dono não regista custos');
select teste.erro($$insert into metas_faturacao (mes, valor_sem_iva) values ('2027-02-01', 100)$$, 'O: o dono não define metas');
select teste.erro($$insert into lembretes_vencimento (inquilino_id, vencimento, canal, conteudo) values ('aaaaaaaa-0000-0000-0000-000000000000', current_date, 'email', 'x')$$, 'O: o dono não escreve lembretes diretamente');
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'x')$$, 'O: o dono não prepara lembretes de vencimento');

select teste.como('10000000-0000-0000-0000-000000000003');   -- barbeiro da A
select teste.zero($$select 1 from custos_plataforma$$, 'O: o barbeiro não lê custos');
select teste.zero($$select 1 from lembretes_vencimento$$, 'O: o barbeiro não lê lembretes');
select teste.zero($$select 1 from vencimentos_proximos$$, 'O: o barbeiro não lê vencimentos');

select teste.como('10000000-0000-0000-0000-000000000007');   -- cliente final
select teste.zero($$select 1 from contas_pagar$$, 'O: o cliente final não lê contas a pagar');
select teste.zero($$select 1 from metas_faturacao$$, 'O: o cliente final não lê metas');

select teste.anonimo();
select teste.zero($$select 1 from custos_plataforma$$, 'O: o visitante não lê custos');
select teste.zero($$select 1 from vencimentos_proximos$$, 'O: o visitante não lê vencimentos');
select teste.erro($$select abrir_lembrete_vencimento('00000000-0000-0000-0000-000000000000')$$, 'O: o visitante não abre lembretes');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');   -- super_admin sem 2.º fator
select teste.zero($$select 1 from custos_plataforma$$, 'O: o super_admin sem segundo fator não lê custos');
select teste.zero($$select 1 from contas_pagar$$, 'O: o super_admin sem segundo fator não lê contas');
select teste.zero($$select 1 from metas_faturacao$$, 'O: o super_admin sem segundo fator não lê metas');
select teste.zero($$select 1 from vencimentos_proximos$$, 'O: o super_admin sem segundo fator não lê vencimentos');
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'x')$$, 'O: sem segundo fator não se preparam lembretes');
rollback;

-- ------------------------------------------------------------ vencimentos próximos
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update inquilinos set proximo_vencimento = public.hoje_lisboa() + 3 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
update inquilinos set proximo_vencimento = public.hoje_lisboa() - 4, estado_pagamento = 'em_atraso' where id = 'bbbbbbbb-0000-0000-0000-000000000000';
select teste.ok((select count(*) from vencimentos_proximos) = 2, 'O: a vista lista as barbearias com vencimento');
select teste.ok((select dias from vencimentos_proximos where nome = 'Barbearia A') = 3, 'O: faltam 3 dias para o vencimento da A');
select teste.ok((select dias from vencimentos_proximos where nome = 'Barbearia B') = -4, 'O: a B está 4 dias depois do vencimento');
select teste.ok((select ultimo_lembrete_em is null from vencimentos_proximos where nome = 'Barbearia A'), 'O: sem lembretes, a vista não tem data de último lembrete');
update inquilinos set proximo_vencimento = null where id = 'bbbbbbbb-0000-0000-0000-000000000000';
select teste.ok((select count(*) from vencimentos_proximos) = 1, 'O: sem vencimento, a barbearia sai da vista');
update inquilinos set estado = 'cancelado' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok((select count(*) from vencimentos_proximos) = 0, 'O: uma barbearia cancelada sai da vista');
rollback;

-- ------------------------------------------------------------ lembretes por WhatsApp
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update inquilinos set proximo_vencimento = public.hoje_lisboa() + 2, whatsapp = '+351912345678', email = 'dono@a.pt'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
insert into faturas_plataforma (inquilino_id, numero, valor, periodo_inicio, periodo_fim, emitida_em)
  values ('aaaaaaaa-0000-0000-0000-000000000000', 'FT 2026/1', 47.97, '2026-10-01', '2026-10-31', public.hoje_lisboa() - 1);
create temp table t_l (id uuid);
insert into t_l select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'whatsapp', 'Olá! A mensalidade da Barbearia A vence em 2 dias.');
select teste.ok((select estado from lembretes_vencimento where id = (select id from t_l)) = 'preparada', 'O: o lembrete nasce «preparada»');
select teste.ok((select vencimento from lembretes_vencimento where id = (select id from t_l)) = public.hoje_lisboa() + 2, 'O: o lembrete guarda o vencimento a que se refere');
select teste.ok((select fatura_id is not null from lembretes_vencimento where id = (select id from t_l)), 'O: o lembrete liga-se à fatura em aberto');
select teste.erro($$select confirmar_lembrete_vencimento((select id from t_l))$$, 'O: não se confirma o envio sem abrir a conversa');
select abrir_lembrete_vencimento((select id from t_l));
select teste.ok((select estado || '/' || (aberta_em is not null) from lembretes_vencimento where id = (select id from t_l)) = 'ligacao_aberta/true', 'O: abrir regista o estado e a hora');
select teste.ok((select ultimo_lembrete_em is not null from vencimentos_proximos where nome = 'Barbearia A'), 'O: a vista mostra que já houve lembrete');
select teste.erro($$select registar_email_lembrete((select id from t_l), true)$$, 'O: um lembrete de WhatsApp não se dá como enviado por e-mail');
select confirmar_lembrete_vencimento((select id from t_l));
select teste.ok((select estado from lembretes_vencimento where id = (select id from t_l)) = 'envio_confirmado_manualmente', 'O: o envio só é dado como feito depois da confirmação à mão');
select teste.erro($$select abrir_lembrete_vencimento((select id from t_l))$$, 'O: um lembrete confirmado não se reabre');
select teste.erro($$select cancelar_lembrete_vencimento((select id from t_l))$$, 'O: um lembrete confirmado não se cancela');
select teste.zero($$update lembretes_vencimento set estado = 'preparada' returning 1$$, 'O: os estados não se alteram diretamente');
select teste.zero($$delete from lembretes_vencimento returning 1$$, 'O: os lembretes não se apagam diretamente');
rollback;

-- ------------------------------------------------------------ lembretes por e-mail
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update inquilinos set proximo_vencimento = public.hoje_lisboa() + 5, whatsapp = '+351912345678', email = 'dono@a.pt'
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
create temp table t_e (id uuid);
insert into t_e select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'Lembrete: a mensalidade vence em 5 dias.');
select teste.erro($$select abrir_lembrete_vencimento((select id from t_e))$$, 'O: um lembrete de e-mail não abre conversa de WhatsApp');
select teste.erro($$select confirmar_lembrete_vencimento((select id from t_e))$$, 'O: um lembrete de e-mail não se confirma à mão');
select registar_email_lembrete((select id from t_e), false);
select teste.ok((select estado from lembretes_vencimento where id = (select id from t_e)) = 'falhou', 'O: um envio falhado fica «falhou»');
select registar_email_lembrete((select id from t_e), true);
select teste.ok((select estado from lembretes_vencimento where id = (select id from t_e)) = 'enviado', 'O: depois de falhar, pode tentar-se outra vez');
select teste.erro($$select registar_email_lembrete((select id from t_e), true)$$, 'O: um e-mail já enviado não se envia outra vez');
select teste.erro($$select cancelar_lembrete_vencimento((select id from t_e))$$, 'O: um e-mail enviado não se cancela');
insert into t_e select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'Segundo lembrete');
select cancelar_lembrete_vencimento((select id from t_e offset 1 limit 1));
select teste.ok((select count(*) from lembretes_vencimento where estado = 'cancelada') = 1, 'O: um lembrete preparado pode cancelar-se');
select teste.ok((select count(*) from lembretes_vencimento) = 2, 'O: o cancelamento não apaga o registo');
rollback;

-- ------------------------------------------------------------ recusas ao preparar
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'whatsapp', 'x')$$, 'O: sem vencimento definido não há lembrete');
update inquilinos set proximo_vencimento = public.hoje_lisboa() + 1, whatsapp = null, telefone = null, email = null
 where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'whatsapp', 'x')$$, 'O: sem WhatsApp nem telefone não há lembrete por WhatsApp');
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'x')$$, 'O: sem e-mail não há lembrete por e-mail');
update inquilinos set whatsapp = '+351912345678', email = 'dono@a.pt' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'sms', 'x')$$, 'O: canal inválido é recusado');
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', '   ')$$, 'O: texto vazio é recusado');
select teste.erro($$select preparar_lembrete_vencimento('99999999-0000-0000-0000-000000000000', 'email', 'x')$$, 'O: barbearia inexistente é recusada');
update inquilinos set estado = 'cancelado' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.erro($$select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'x')$$, 'O: barbearia cancelada não recebe lembretes');
update inquilinos set estado = 'suspenso' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.ok(preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'Mensalidade em atraso') is not null, 'O: uma barbearia suspensa ainda recebe lembrete');
rollback;

-- ------------------------------------------------------------ apagar a barbearia
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update inquilinos set proximo_vencimento = public.hoje_lisboa() + 1, email = 'dono@a.pt' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select preparar_lembrete_vencimento('aaaaaaaa-0000-0000-0000-000000000000', 'email', 'x');
select teste.ok((select count(*) from lembretes_vencimento) = 1, 'O: o lembrete existe antes de apagar a barbearia');
update inquilinos set estado = 'cancelado' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select count(*) from eliminar_inquilino('aaaaaaaa-0000-0000-0000-000000000000', 'barbearia-a');
select teste.ok((select count(*) from lembretes_vencimento) = 0, 'O: eliminar a barbearia apaga os lembretes de vencimento');
rollback;
