-- =============================================================================
-- Testes do módulo comercial (Parte N): leads, propostas, contratos, convites.
-- Cada bloco corre numa transação desfeita no fim. Para à primeira falha.
-- O super_admin do ficheiro 05 é 10000000-…-000000000001.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

-- ------------------------------------------------------------ NIF e numeração
begin;
select teste.ok(nif_valido('123456789'), 'N: NIF com dígito de controlo certo é válido');
select teste.ok(not nif_valido('123456788'), 'N: NIF com dígito de controlo errado é recusado');
select teste.ok(not nif_valido('423456789') and not nif_valido('12345678') and not nif_valido('abcdefghi') and not nif_valido(null),
  'N: NIF com primeiro dígito inválido, curto, com letras ou nulo é recusado');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.erro($$select proximo_numero_comercial('PRP')$$, 'N: a numeração só se chama por dentro das funções');
rollback;

-- ------------------------------------------------------------ site: submeter_lead
begin;
select teste.anonimo();
select teste.ok(submeter_lead('{"nome":"Miguel Santos","barbearia":"Barbearia Central","cidade":"Viseu","telefone":"912 345 678","email":"Miguel@Central.pt","barbeiros":"2"}'), 'N: o site cria um lead');
select teste.erro($$select submeter_lead('{"nome":"","email":"a@b.pt"}')$$, 'N: lead sem nome é recusado');
select teste.erro($$select submeter_lead('{"nome":"X"}')$$, 'N: lead sem telefone nem e-mail é recusado');
select teste.erro($$select submeter_lead('{"nome":"X","email":"isto não é e-mail"}')$$, 'N: e-mail inválido é recusado');
select teste.zero($$select 1 from leads$$, 'N: o visitante não lê leads');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from leads) = 1, 'N: o super_admin vê o lead criado');
select teste.ok((select telefone from leads) = '912345678' and (select email from leads) = 'miguel@central.pt', 'N: telefone e e-mail ficam normalizados');
select teste.ok((select origem || '/' || estado from leads) = 'landing/novo', 'N: lead do site nasce «novo», origem landing');
select teste.ok((select count(*) from lead_eventos where tipo = 'sistema') = 1, 'N: o pedido fica no histórico');
select teste.anonimo();
select teste.ok(submeter_lead('{"nome":"Miguel","email":"miguel@central.pt"}'), 'N: o mesmo e-mail volta a pedir contacto');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok((select count(*) from leads) = 1, 'N: o mesmo contacto não duplica o lead');
select teste.ok((select count(*) from lead_eventos) = 2, 'N: o segundo pedido fica no histórico do lead');
select teste.anonimo();
select teste.ok(submeter_lead('{"nome":"Miguel","email":"miguel@central.pt"}'), 'N: terceiro pedido ainda passa');
select teste.ok(not submeter_lead('{"nome":"Miguel","email":"miguel@central.pt"}'), 'N: o quarto pedido na mesma hora é travado');
select teste.ok(submeter_lead('{"nome":"Outro","telefone":"+351 933 000 111"}'), 'N: outro contacto não é afetado pelo limite');
rollback;

-- ------------------------------------------------------------ isolamento
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, nome_barbearia, telefone) values ('c0000000-0000-0000-0000-000000000001', 'Rui', 'Barbearia Rui', '911000001');
insert into briefings (lead_id, dados) values ('c0000000-0000-0000-0000-000000000001', '{"clientes_ativos": 300}');
insert into modelos_documento (id, tipo, versao, titulo, corpo) values ('d0000000-0000-0000-0000-000000000001', 'contrato', 1, 'Contrato', 'Texto {{razao_social}}');
select criar_proposta('c0000000-0000-0000-0000-000000000001',
  '{"plano":"pro","profissionais":3,"mensalidade_sem_iva":49.00,"valor_periodo_sem_iva":49.00,"valor_periodo_com_iva":60.27,"desafio_90":true,"dados":{"x":1}}');
select teste.ok((select count(*) from leads) = 1 and (select count(*) from propostas) = 1 and (select count(*) from lead_eventos) >= 1, 'N: o super_admin com dois fatores lê o módulo');

select teste.como('10000000-0000-0000-0000-000000000002');   -- dono da A
select teste.zero($$select 1 from leads$$, 'N: o dono não lê leads');
select teste.zero($$select 1 from lead_eventos$$, 'N: o dono não lê o histórico dos leads');
select teste.zero($$select 1 from briefings$$, 'N: o dono não lê briefings');
select teste.zero($$select 1 from propostas$$, 'N: o dono não lê propostas');
select teste.zero($$select 1 from propostas_com_estado$$, 'N: o dono não lê a vista das propostas');
select teste.zero($$select 1 from contratos$$, 'N: o dono não lê contratos');
select teste.zero($$select 1 from modelos_documento$$, 'N: o dono não lê os modelos de documento');
select teste.zero($$select 1 from numeracao_comercial$$, 'N: o dono não lê a numeração comercial');
select teste.zero($$select 1 from convites_adesao$$, 'N: o dono não lê convites');
select teste.erro($$insert into leads (nome_contacto, telefone) values ('x', '1')$$, 'N: o dono não cria leads');
select teste.zero($$update leads set nome_contacto = 'x'$$, 'N: o dono não altera leads');
select teste.erro($$select mudar_estado_lead('c0000000-0000-0000-0000-000000000001', 'contactado')$$, 'N: o dono não muda o estado de um lead');
select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-000000000001', '{}')$$, 'N: o dono não cria propostas');
select teste.erro($$select apagar_leads_inativos(1)$$, 'N: o dono não apaga leads');
select teste.erro($$insert into storage.objects (bucket_id, name) values ('comercial', 'leads/x.pdf')$$, 'N: o dono não escreve no bucket comercial');

select teste.como('10000000-0000-0000-0000-000000000003');   -- barbeiro da A
select teste.zero($$select 1 from leads$$, 'N: o barbeiro não lê leads');
select teste.zero($$select 1 from contratos$$, 'N: o barbeiro não lê contratos');

select teste.como('10000000-0000-0000-0000-000000000007');   -- cliente final
select teste.zero($$select 1 from leads$$, 'N: o cliente final não lê leads');
select teste.zero($$select 1 from propostas$$, 'N: o cliente final não lê propostas');

select teste.anonimo();
select teste.erro($$select mudar_estado_lead('c0000000-0000-0000-0000-000000000001', 'contactado')$$, 'N: o visitante não executa funções do funil');
select teste.zero($$select 1 from leads$$, 'N: o visitante não vê nenhuma linha das tabelas comerciais');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal1');   -- super_admin sem segundo fator
select teste.zero($$select 1 from leads$$, 'N: o super_admin sem dois fatores não vê leads');
select teste.erro($$select mudar_estado_lead('c0000000-0000-0000-0000-000000000001', 'contactado')$$, 'N: sem dois fatores, nenhuma função do funil corre');
rollback;

-- ------------------------------------------------------------ funil e propostas
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, nome_barbearia, email) values ('c0000000-0000-0000-0000-000000000002', 'Ana', 'Barbearia Ana', 'ana@ana.pt');

select registar_evento_lead('c0000000-0000-0000-0000-000000000002', 'chamada', 'Falámos 10 minutos.', 'Marcar demonstração', current_date + 3);
select teste.ok((select proxima_acao from leads where id = 'c0000000-0000-0000-0000-000000000002') = 'Marcar demonstração', 'N: registar um contacto define a próxima ação');
select teste.erro($$select registar_evento_lead('c0000000-0000-0000-0000-000000000002', 'estado', 'x')$$, 'N: o tipo «estado» não se regista à mão');
select teste.erro($$select registar_evento_lead('c0000000-0000-0000-0000-000000000002', 'nota', '  ')$$, 'N: uma nota vazia é recusada');
select teste.erro($$select mudar_estado_lead('c0000000-0000-0000-0000-000000000002', 'perdido')$$, 'N: «perdido» exige motivo');
select teste.erro($$select mudar_estado_lead('c0000000-0000-0000-0000-000000000002', 'ganho')$$, 'N: «ganho» não se escolhe à mão');
select mudar_estado_lead('c0000000-0000-0000-0000-000000000002', 'contactado');
select teste.ok((select count(*) from lead_eventos where lead_id = 'c0000000-0000-0000-0000-000000000002' and tipo = 'estado') = 1, 'N: a mudança de estado fica no histórico');

select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-000000000002',
  '{"plano":"basic","profissionais":3,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}')$$, 'N: Basic com 3 profissionais é recusado');
select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-000000000002',
  '{"plano":"pro","profissionais":2,"mensalidade_sem_iva":39,"valor_periodo_sem_iva":39,"valor_periodo_com_iva":47.00}')$$, 'N: o valor com IVA tem de bater com o sem IVA');
select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-000000000002',
  '{"plano":"basic","profissionais":1,"desafio_90":true,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}')$$, 'N: o desafio de 90 dias é só do Pro');

select criar_proposta('c0000000-0000-0000-0000-000000000002',
  '{"plano":"pro","profissionais":3,"mensalidade_sem_iva":49.00,"valor_periodo_sem_iva":49.00,"valor_periodo_com_iva":60.27,"desafio_90":true,"validade_dias":15,"dados":{"nota":"v1"}}');
select teste.ok((select numero from propostas where versao = 1) like 'PRP-%-0001', 'N: a primeira proposta é PRP-ano-0001');
select teste.ok((select estado from leads where id = 'c0000000-0000-0000-0000-000000000002') = 'proposta', 'N: criar a proposta leva o lead a «proposta»');
select criar_proposta('c0000000-0000-0000-0000-000000000002',
  '{"plano":"pro","profissionais":2,"mensalidade_sem_iva":39.00,"valor_periodo_sem_iva":390.00,"valor_periodo_com_iva":479.70,"periodicidade":"anual","dados":{"nota":"v2"}}');
select teste.ok((select estado from propostas where versao = 1) = 'substituida' and (select numero from propostas where versao = 2) like 'PRP-%-0002', 'N: a versão nova substitui a anterior e tem número novo');

select marcar_proposta_enviada((select id from propostas where versao = 2));
select teste.ok((select valida_ate from propostas where versao = 2) = hoje_lisboa() + 15, 'N: a validade conta 15 dias desde o envio, em hora de Lisboa');
select teste.erro($$select marcar_proposta_enviada((select id from propostas where versao = 2))$$, 'N: uma proposta enviada não se envia outra vez');
select teste.erro($$update propostas set valor_periodo_sem_iva = 100, valor_periodo_com_iva = 123 where versao = 2$$, 'N: depois de enviada, o preço não muda');
select teste.erro($$update propostas set dados = '{"nota":"mexi"}' where versao = 2$$, 'N: depois de enviada, o conteúdo não muda');
with x as (update propostas set pdf_path = 'leads/c2/proposta.pdf' where versao = 2 returning 1)
select teste.ok((select count(*) from x) = 1, 'N: o caminho do PDF pode ser guardado depois de enviada');

update propostas set valida_ate = hoje_lisboa() - 1 where versao = 2;
select teste.ok((select estado_efetivo from propostas_com_estado where versao = 2) = 'expirada', 'N: uma proposta enviada expira ao fim da validade, sem tarefa agendada');
select teste.erro($$select decidir_proposta((select id from propostas where versao = 2), true)$$, 'N: uma proposta expirada não se aceita');
update propostas set valida_ate = hoje_lisboa() + 5 where versao = 2;
select teste.erro($$select decidir_proposta((select id from propostas where versao = 2), false)$$, 'N: recusar exige motivo');
select decidir_proposta((select id from propostas where versao = 2), true);
select teste.ok((select estado from propostas where versao = 2) = 'aceite', 'N: a proposta fica aceite');
select teste.erro($$select decidir_proposta((select id from propostas where versao = 2), true)$$, 'N: só se decide uma proposta enviada');
rollback;

-- ------------------------------------------------------------ contrato, assinatura, convite
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, nome_barbearia, email) values ('c0000000-0000-0000-0000-000000000003', 'Rui', 'Barbearia Rui', 'rui@rui.pt');
insert into modelos_documento (id, tipo, versao, titulo, corpo) values ('d0000000-0000-0000-0000-000000000002', 'contrato', 1, 'Contrato', 'Contrato com {{razao_social}}');
select criar_proposta('c0000000-0000-0000-0000-000000000003',
  '{"plano":"pro","profissionais":2,"mensalidade_sem_iva":39.00,"valor_periodo_sem_iva":39.00,"valor_periodo_com_iva":47.97,"desafio_90":true,"dados":{"nota":"v1"}}');

select teste.erro($$select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","morada":"Rua A","representante":"Rui"}', 'Texto')$$, 'N: não há contrato de uma proposta por aceitar');
select marcar_proposta_enviada((select id from propostas));
select decidir_proposta((select id from propostas), true);
select teste.erro($$select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","morada":"Rua A","representante":"Rui"}', 'Texto')$$, 'N: um modelo em rascunho não gera contratos');
select teste.erro($$update modelos_documento set estado = 'aprovado' where id = 'd0000000-0000-0000-0000-000000000002'$$, 'N: aprovar um modelo exige quem aprovou e quando');
update modelos_documento set estado = 'aprovado', aprovado_por = '10000000-0000-0000-0000-000000000001', aprovado_em = now()
 where id = 'd0000000-0000-0000-0000-000000000002';
select teste.erro($$select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456788","morada":"Rua A","representante":"Rui"}', 'Texto')$$, 'N: NIF inválido barra o contrato');
select teste.erro($$select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","representante":"Rui"}', 'Texto')$$, 'N: sem morada, não há contrato');
select teste.erro($$select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","morada":"Rua A","representante":"Rui"}', '   ')$$, 'N: texto vazio barra o contrato');

select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","morada":"Rua A","representante":"Rui","cargo":"Gerente"}', 'Contrato com Rui Lda');
select teste.ok((select numero from contratos) like 'CTR-%-0001' and (select estado from contratos) = 'rascunho', 'N: o contrato nasce CTR-ano-0001, em rascunho');
select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","morada":"Rua B","representante":"Rui"}', 'Contrato com Rui Lda, nova morada');
select teste.ok((select count(*) from contratos where estado = 'rascunho') = 1 and (select count(*) from contratos where estado = 'cancelado') = 1, 'N: gerar de novo cancela o rascunho anterior, fica um só ativo');
select teste.erro($$insert into contratos (proposta_id, lead_id, modelo_id, numero, dados, texto)
  select proposta_id, lead_id, modelo_id, 'CTR-X', dados, texto from contratos where estado = 'rascunho'$$, 'N: não há dois contratos ativos para a mesma proposta');
select teste.erro($$select assinar_contrato((select id from contratos where estado = 'rascunho'), current_date, '')$$, 'N: assinar exige o PDF assinado');
select teste.erro($$select criar_convite_adesao((select id from contratos where estado = 'rascunho'), repeat('a', 40), '{"nome":"x"}')$$, 'N: o convite só existe depois de o contrato ser assinado');

select marcar_contrato_enviado((select id from contratos where estado = 'rascunho'));
select assinar_contrato((select id from contratos where estado = 'enviado'), current_date, 'leads/c3/contrato-assinado.pdf');
select teste.ok((select estado from leads where id = 'c0000000-0000-0000-0000-000000000003') = 'ganho', 'N: assinar o contrato faz o lead «ganho»');
select teste.ok((select count(*) from auditoria where accao = 'contrato_assinado') = 1, 'N: a assinatura fica em auditoria');
select teste.erro($$update contratos set texto = 'outro texto' where estado = 'assinado'$$, 'N: contrato assinado não muda de texto');
select teste.erro($$update contratos set dados = '{"razao_social":"X"}' where estado = 'assinado'$$, 'N: contrato assinado não muda de dados');
select teste.erro($$update contratos set estado = 'rascunho' where estado = 'assinado'$$, 'N: contrato assinado não volta a rascunho');
with x as (update contratos set data_inicio = current_date where estado = 'assinado' returning 1)
select teste.ok((select count(*) from x) = 1, 'N: a data de início pode ser definida depois de assinado');
select teste.erro($$select mudar_estado_lead('c0000000-0000-0000-0000-000000000003', 'perdido', 'x')$$, 'N: um lead ganho não volta atrás');
select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-000000000003', '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}')$$, 'N: um lead ganho não recebe propostas novas');
select teste.erro($$select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-000000000002',
  '{"razao_social":"Rui Lda","nif":"123456789","morada":"Rua A","representante":"Rui"}', 'Texto')$$, 'N: não se gera contrato novo sobre uma proposta já assinada');
select teste.erro($$delete from propostas$$, 'N: não se apaga uma proposta com contrato');

-- convite de adesão
select teste.erro($$select criar_convite_adesao((select id from contratos where estado = 'assinado'), 'curto', '{"nome":"x"}')$$, 'N: um código de convite curto é recusado');
select teste.erro($$select criar_convite_adesao((select id from contratos where estado = 'assinado'), repeat('a', 40), '{"nome":"x","palavra_passe":"1234"}')$$, 'N: o convite nunca leva palavra-passe');
select criar_convite_adesao((select id from contratos where estado = 'assinado'), repeat('k', 40), '{"nome":"Barbearia Rui","plano":"pro","profissionais":2}');
select teste.ok((select token_hash from convites_adesao) <> repeat('k', 40), 'N: só se guarda o hash do código do convite');
select teste.anonimo();
select teste.ok((ler_convite_adesao(repeat('k', 40)) ->> 'nome') = 'Barbearia Rui', 'N: quem tem a ligação vê os dados pré-preenchidos');
select teste.ok(ler_convite_adesao(repeat('z', 40)) is null and ler_convite_adesao(null) is null, 'N: código errado ou nulo não devolve nada');
select teste.ok((select submeter_pedido_adesao('{"nome":"Barbearia Rui","email_acesso":"rui@rui.pt","mensalidade_calculada":47.97,"aceitou_termos":true,"plano":"pro","profissionais":2}')) is not null, 'N: o formulário de adesão grava o pedido (controlo)');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok(usar_convite_adesao(repeat('k', 40), (select id from pedidos_adesao where nome = 'Barbearia Rui')), 'N: o envio do formulário gasta o convite e liga o pedido ao contrato');
select teste.ok((select contrato_id from pedidos_adesao where nome = 'Barbearia Rui') = (select id from contratos where estado = 'assinado'), 'N: o pedido de adesão aponta para o contrato');
select teste.ok(not usar_convite_adesao(repeat('k', 40), (select id from pedidos_adesao where nome = 'Barbearia Rui')) and ler_convite_adesao(repeat('k', 40)) is null, 'N: o convite só se usa uma vez');
select criar_convite_adesao((select id from contratos where estado = 'assinado'), repeat('m', 40), '{"nome":"Barbearia Rui"}');
select criar_convite_adesao((select id from contratos where estado = 'assinado'), repeat('n', 40), '{"nome":"Barbearia Rui"}');
select teste.ok(ler_convite_adesao(repeat('m', 40)) is null and ler_convite_adesao(repeat('n', 40)) is not null, 'N: um convite novo anula o anterior');
reset role;   -- os convites só se escrevem pelas funções; o teste força a data como dono da base
update convites_adesao set expira_em = now() - interval '1 minute';
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok(ler_convite_adesao(repeat('n', 40)) is null, 'N: um convite expirado não abre');

select ligar_contrato_inquilino((select id from contratos where estado = 'assinado'), 'aaaaaaaa-0000-0000-0000-000000000000');
select teste.ok((select inquilino_id from contratos where estado = 'assinado') = 'aaaaaaaa-0000-0000-0000-000000000000'
  and (select inquilino_id from leads where id = 'c0000000-0000-0000-0000-000000000003') = 'aaaaaaaa-0000-0000-0000-000000000000', 'N: na aprovação, o contrato e o lead ligam-se à barbearia criada');
select teste.ok((select data_inicio from contratos where estado = 'assinado') is not null, 'N: a data de início fica preenchida');
reset role;   -- storage.buckets tem RLS no Supabase e o authenticated não o lê: verifica-se como dono da base
select teste.ok((select count(*) from storage.buckets where id = 'comercial' and not public) = 1, 'N: o bucket comercial é privado');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into storage.objects (bucket_id, name) values ('comercial', 'leads/c3/contrato-assinado.pdf');
select teste.ok((select count(*) from storage.objects where bucket_id = 'comercial') = 1, 'N: o super_admin guarda ficheiros no bucket comercial');
rollback;

-- ------------------------------------------------------------ RGPD: leads parados
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, email, estado, motivo_perda, ultimo_contacto_em, atualizado_em) values
  ('c0000000-0000-0000-0000-000000000010', 'Velho 1', 'v1@x.pt', 'novo', null, now() - interval '14 months', now() - interval '14 months'),
  ('c0000000-0000-0000-0000-000000000011', 'Velho 2', 'v2@x.pt', 'perdido', 'preço', now() - interval '13 months', now() - interval '13 months'),
  ('c0000000-0000-0000-0000-000000000012', 'Recente', 'r@x.pt', 'novo', null, now() - interval '2 months', now() - interval '2 months'),
  ('c0000000-0000-0000-0000-000000000013', 'Cliente antigo', 'c@x.pt', 'ganho', null, now() - interval '20 months', now() - interval '20 months');
insert into briefings (lead_id, dados) values ('c0000000-0000-0000-0000-000000000010', '{"a":1}');
insert into lead_eventos (lead_id, tipo, texto) values ('c0000000-0000-0000-0000-000000000010', 'nota', 'x');
insert into propostas (lead_id, numero, versao, plano, profissionais, mensalidade_sem_iva, valor_periodo_sem_iva, valor_periodo_com_iva)
  values ('c0000000-0000-0000-0000-000000000010', 'PRP-T-0001', 1, 'basic', 1, 19.99, 19.99, 24.59);
select teste.erro($$select apagar_leads_inativos(0)$$, 'N: o prazo de apagamento tem de ser positivo');
select teste.ok(apagar_leads_inativos(12) = 2, 'N: apaga os leads parados há mais de 12 meses e sem contrato');
select teste.ok((select count(*) from leads) = 2 and exists (select 1 from leads where nome_contacto = 'Recente') and exists (select 1 from leads where nome_contacto = 'Cliente antigo'),
  'N: o lead recente e o cliente (ganho) ficam');
select teste.ok((select count(*) from briefings) = 0 and (select count(*) from propostas) = 0 and (select count(*) from lead_eventos) = 0, 'N: o histórico, o briefing e as propostas dos leads apagados vão com eles');
select teste.ok((select (detalhes ->> 'n')::int from auditoria where accao = 'leads_inativos_apagados') = 2, 'N: o apagamento fica em auditoria, só com a contagem');
rollback;

select 'N: módulo comercial a passar' as "== comercial";

-- ------------------------------------------------------------ regime de IVA da Prestadora (D-45)
begin;
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
insert into leads (id, nome_contacto, telefone) values ('c0000000-0000-0000-0000-0000000000f1', 'Teste IVA', '912000111');
select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-0000000000f1',
  '{"plano":"basic","profissionais":1,"iva_taxa":0,"mensalidade_sem_iva":24.59,"valor_periodo_sem_iva":24.59,"valor_periodo_com_iva":30.24}')$$, 'N: com isenção de IVA, o valor com IVA não pode ser maior que o sem IVA');
select teste.erro($$select criar_proposta('c0000000-0000-0000-0000-0000000000f1',
  '{"plano":"basic","profissionais":1,"iva_taxa":6,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":21.19}')$$, 'N: só se aceita IVA a 0 % (isenta) ou a 23 %');
select criar_proposta('c0000000-0000-0000-0000-0000000000f1',
  '{"plano":"basic","profissionais":1,"iva_taxa":0,"mensalidade_sem_iva":24.59,"valor_periodo_sem_iva":24.59,"valor_periodo_com_iva":24.59}');
select teste.ok((select iva_taxa from propostas where lead_id = 'c0000000-0000-0000-0000-0000000000f1') = 0, 'N: a proposta com isenção guarda IVA a 0 %');
select teste.ok((select valor_periodo_com_iva = valor_periodo_sem_iva from propostas where lead_id = 'c0000000-0000-0000-0000-0000000000f1'), 'N: com isenção, o preço final é o mesmo com e sem IVA');
select teste.ok((select 1 from (select criar_proposta('c0000000-0000-0000-0000-0000000000f1',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}')) x) = 1, 'N: sem indicar a taxa, mantém-se o IVA a 23 %');
select teste.ok((select iva_taxa from propostas where versao = 2) = 23, 'N: a taxa por omissão é 23 %');
rollback;

