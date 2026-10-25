-- =============================================================================
-- Testes da equipa InstaBarber (D-161): o gestor administra sem gerir contas; o comercial só
-- vê e trabalha os leads de que é responsável, com descontos dentro dos limites e só quando
-- ligados; a carteira e as metas são de cada um; o desconto aceite passa para a mensalidade.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000009', 'gestor@instabarber.pt'),
  ('10000000-0000-0000-0000-00000000000a', 'comercial1@instabarber.pt'),
  ('10000000-0000-0000-0000-00000000000b', 'comercial2@instabarber.pt');
insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-000000000009', null, 'gestor_plataforma', 'Gestor'),
  ('10000000-0000-0000-0000-00000000000a', null, 'comercial', 'Ana'),
  ('10000000-0000-0000-0000-00000000000b', null, 'comercial', 'Bruno');

select teste.erro($$insert into perfis (user_id, inquilino_id, papel) values
  ('10000000-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-000000000000', 'comercial')$$,
  'EQ: um comercial não pertence a uma barbearia');
select teste.erro($$insert into perfis (user_id, inquilino_id, papel) values
  ('10000000-0000-0000-0000-00000000000a', null, 'gestor_plataforma')$$,
  'EQ: cada pessoa da equipa tem um só papel na plataforma');

-- Gestor ---------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-000000000009', 'aal2');
select teste.ok(e_super_admin() and not e_dono_plataforma(), 'EQ: o gestor é administrador, não dono');
select teste.ok((select count(*) from inquilinos) = 2, 'EQ: o gestor vê as barbearias');
insert into apoio_registos (inquilino_id, tipo, assunto) values ('aaaaaaaa-0000-0000-0000-000000000000', 'nota', 'x');
select teste.ok((select count(*) from apoio_registos) = 1, 'EQ: o gestor regista apoio');
select teste.erro($$insert into perfis (user_id, inquilino_id, papel) values
  ('10000000-0000-0000-0000-000000000003', null, 'comercial')$$, 'EQ: o gestor não cria contas da equipa');
select teste.zero($$update perfis set ativo = false where papel = 'comercial'$$,
  'EQ: o gestor não desativa contas da equipa');
select teste.como('10000000-0000-0000-0000-000000000009', 'aal1');
select teste.ok((select count(*) from inquilinos) = 0, 'EQ: sem dois fatores o gestor não vê nada');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select teste.ok(e_dono_plataforma(), 'EQ: o super_admin é o dono');
update perfis set nome = 'Ana Silva' where user_id = '10000000-0000-0000-0000-00000000000a';
select teste.ok((select nome from perfis where user_id = '10000000-0000-0000-0000-00000000000a') = 'Ana Silva',
  'EQ: o dono altera as contas da equipa');

-- Leads: o do site fica sem responsável; o do admin pode ser atribuído -----------------------
insert into leads (id, nome_contacto, telefone, responsavel_id) values
  ('e0000000-0000-0000-0000-000000000001', 'Do Bruno', '912000001', '10000000-0000-0000-0000-00000000000b'),
  ('e0000000-0000-0000-0000-000000000002', 'Sem dono', '912000002', null);
-- Com comerciais ativos o lead novo vai para um deles (D-162); este fica no geral de propósito.
update leads set responsavel_id = null where id = 'e0000000-0000-0000-0000-000000000002';

-- Comercial ------------------------------------------------------------------
select teste.como('10000000-0000-0000-0000-00000000000a', 'aal2');
select teste.ok(e_comercial() and not e_super_admin(), 'COMC: o comercial não é administrador');
insert into leads (id, nome_contacto, telefone) values ('e0000000-0000-0000-0000-00000000000a', 'Da Ana', '912000010');
-- Como a aplicação faz (insert … returning): o RLS tem de deixar ler a linha nova.
do $$
declare v uuid;
begin
  insert into leads (nome_contacto, telefone) values ('Outro da Ana', '912000011') returning id into v;
  perform teste.ok(v is not null, 'COMC: lê o lead que acabou de criar');
end $$;
select teste.ok((select responsavel_id = '10000000-0000-0000-0000-00000000000a' and criado_por = responsavel_id
                   from leads where id = 'e0000000-0000-0000-0000-00000000000a'),
  'COMC: o lead que o comercial cria é dele');
select teste.ok((select count(*) from leads) = 2, 'COMC: o comercial só vê os seus leads');
select teste.zero($$update leads set nome_contacto = 'x' where id = 'e0000000-0000-0000-0000-000000000001'$$,
  'COMC: não altera o lead de outro comercial');
select teste.erro($$update leads set responsavel_id = '10000000-0000-0000-0000-00000000000b'
  where id = 'e0000000-0000-0000-0000-00000000000a'$$, 'COMC: não passa o lead a outro');
select teste.erro($$update leads set estado = 'ganho' where id = 'e0000000-0000-0000-0000-00000000000a'$$,
  'COMC: não muda o estado sem as funções');
update leads set cidade = 'Viseu' where id = 'e0000000-0000-0000-0000-00000000000a';
select teste.ok((select cidade from leads where id = 'e0000000-0000-0000-0000-00000000000a') = 'Viseu',
  'COMC: altera os dados do seu lead');
select registar_evento_lead('e0000000-0000-0000-0000-00000000000a', 'chamada', 'Falei com ele.');
select mudar_estado_lead('e0000000-0000-0000-0000-00000000000a', 'contactado');
select teste.ok((select count(*) from lead_eventos) = 2, 'COMC: regista contactos e estados no seu lead');
select teste.erro($$select registar_evento_lead('e0000000-0000-0000-0000-000000000001', 'nota', 'x')$$,
  'COMC: não regista no lead de outro');
select teste.erro($$select registar_evento_lead('e0000000-0000-0000-0000-000000000002', 'nota', 'x')$$,
  'COMC: não regista num lead sem responsável');
select teste.erro($$select criar_proposta('e0000000-0000-0000-0000-000000000001',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59}')$$,
  'COMC: não faz propostas no lead de outro');
select teste.ok((select count(*) from inquilinos) = 0 and (select count(*) from custos_plataforma) = 0
                and (select count(*) from auditoria) = 0 and (select count(*) from apoio_registos) = 0,
  'COMC: não vê barbearias, finanças, auditoria nem apoio');
select teste.ok((select count(*) from configuracao_comercial) = 1, 'COMC: lê as condições comerciais');
select teste.zero($$update configuracao_comercial set descontos_ativos = true$$, 'COMC: não liga os descontos');

-- Descontos e taxa de migração ------------------------------------------------
select teste.erro($$select criar_proposta('e0000000-0000-0000-0000-00000000000a',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":17.99,"valor_periodo_sem_iva":17.99,"valor_periodo_com_iva":22.13,"desconto_mensalidade_pct":10}')$$,
  'DESC: sem os descontos ligados não há desconto');
select teste.erro($$select criar_proposta('e0000000-0000-0000-0000-00000000000a',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"taxa_migracao_sem_iva":100}')$$,
  'DESC: sem a taxa de migração ligada não há taxa');
select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
update configuracao_comercial set descontos_ativos = true, taxa_migracao_ativa = true, taxa_migracao_sem_iva = 200;
select teste.como('10000000-0000-0000-0000-00000000000a', 'aal2');
select teste.erro($$select criar_proposta('e0000000-0000-0000-0000-00000000000a',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":14.99,"valor_periodo_sem_iva":14.99,"valor_periodo_com_iva":18.44,"desconto_mensalidade_pct":25,"taxa_migracao_sem_iva":200}')$$,
  'DESC: o comercial não passa dos 20 % na mensalidade');
select teste.erro($$select criar_proposta('e0000000-0000-0000-0000-00000000000a',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"desconto_taxa_pct":60,"taxa_migracao_sem_iva":80}')$$,
  'DESC: o comercial não passa dos 50 % na taxa de migração');
select teste.erro($$select criar_proposta('e0000000-0000-0000-0000-00000000000a',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":19.99,"valor_periodo_sem_iva":19.99,"valor_periodo_com_iva":24.59,"desconto_taxa_pct":50,"taxa_migracao_sem_iva":150}')$$,
  'DESC: a taxa tem de ser a da configuração com o desconto');
select criar_proposta('e0000000-0000-0000-0000-00000000000a',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":15.99,"valor_periodo_sem_iva":15.99,"valor_periodo_com_iva":19.67,"desconto_mensalidade_pct":20,"desconto_taxa_pct":50,"taxa_migracao_sem_iva":100}');
select teste.ok((select desconto_mensalidade_pct = 20 and taxa_migracao_sem_iva = 100 from propostas_com_estado),
  'DESC: dentro dos limites a proposta fica com o desconto e a taxa');
select teste.ok((select count(*) from propostas) = 1, 'COMC: só vê as suas propostas');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select criar_proposta('e0000000-0000-0000-0000-000000000001',
  '{"plano":"basic","profissionais":1,"mensalidade_sem_iva":13.99,"valor_periodo_sem_iva":13.99,"valor_periodo_com_iva":17.21,"desconto_mensalidade_pct":30,"taxa_migracao_sem_iva":200}');
select teste.ok((select count(*) from propostas where desconto_mensalidade_pct = 30) = 1,
  'DESC: a Performa LAB pode dar mais do que o limite do comercial');
insert into modelos_documento (id, tipo, versao, titulo, corpo, estado, aprovado_por, aprovado_em) values
  ('d0000000-0000-0000-0000-00000000000a', 'contrato', 9, 'Contrato', 'Texto', 'aprovado',
   '10000000-0000-0000-0000-000000000001', now());
insert into metas_comerciais (user_id, mes, leads_novos, ganhos) values
  ('10000000-0000-0000-0000-00000000000a', date_trunc('month', now())::date, 10, 2),
  ('10000000-0000-0000-0000-00000000000b', date_trunc('month', now())::date, 8, 1);

-- O comercial fecha o seu negócio --------------------------------------------
select teste.como('10000000-0000-0000-0000-00000000000a', 'aal2');
select teste.ok((select count(*) from metas_comerciais) = 1, 'COMC: vê só as suas metas');
select teste.ok((select count(*) from modelos_documento) = 1, 'COMC: lê os modelos aprovados');
select marcar_proposta_enviada((select id from propostas));
select decidir_proposta((select id from propostas), true);
select gerar_contrato((select id from propostas), 'd0000000-0000-0000-0000-00000000000a',
  '{"razao_social":"Barbearia Ana Lda","nif":"501964843","morada":"Rua A","representante":"Ana"}', 'Texto');
select fixar_texto_contrato((select id from contratos), 'Texto CTR');
select teste.ok((select texto from contratos) = 'Texto CTR', 'COMC: fixa o texto do seu contrato em rascunho');
select teste.zero($$update contratos set estado = 'assinado'$$, 'COMC: não altera o contrato diretamente');
select assinar_contrato((select id from contratos), current_date, 'leads/e0000000-0000-0000-0000-00000000000a/contratos/x.pdf');
select teste.ok((select estado from leads where id = 'e0000000-0000-0000-0000-00000000000a') = 'ganho',
  'COMC: assina o contrato do seu lead e o lead fica ganho');
select teste.ok(pasta_lead_acessivel('leads/e0000000-0000-0000-0000-00000000000a/contratos/x.pdf')
                and not pasta_lead_acessivel('leads/e0000000-0000-0000-0000-000000000001/contratos/x.pdf'),
  'COMC: só os ficheiros dos seus leads');
select teste.erro($$select ligar_contrato_inquilino((select id from contratos), 'aaaaaaaa-0000-0000-0000-000000000000')$$,
  'COMC: ligar o contrato à barbearia é da Performa LAB');
select teste.erro($$select * from carteira_comercial('10000000-0000-0000-0000-00000000000b')$$,
  'COMC: não vê a carteira de outro');

select teste.como('10000000-0000-0000-0000-000000000001', 'aal2');
select ligar_contrato_inquilino((select id from contratos), 'aaaaaaaa-0000-0000-0000-000000000000');
select teste.ok((select desconto_mensalidade_pct from inquilinos where id = 'aaaaaaaa-0000-0000-0000-000000000000') = 20,
  'DESC: o desconto aceite passa para a mensalidade da barbearia');
select teste.ok((select count(*) from carteira_comercial('10000000-0000-0000-0000-00000000000a')) = 1,
  'COMC: a Performa LAB vê a carteira de cada comercial');

select teste.como('10000000-0000-0000-0000-00000000000a', 'aal2');
select teste.ok((select nome from carteira_comercial()) = 'Barbearia A', 'COMC: a barbearia ganha entra na carteira dele');
select teste.ok((select count(*) from inquilinos) = 0, 'COMC: a carteira não abre a barbearia');

select teste.como('10000000-0000-0000-0000-00000000000b', 'aal2');
select teste.ok((select count(*) from carteira_comercial()) = 0 and (select count(*) from contratos) = 0,
  'COMC: o outro comercial não vê o negócio da Ana');

select teste.como('10000000-0000-0000-0000-000000000002');
select teste.erro($$update inquilinos set desconto_mensalidade_pct = 50 where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'DESC: o dono da barbearia não muda o desconto');
select teste.ok(not e_comercial() and (select count(*) from metas_comerciais) = 0, 'COMC: o dono não é comercial nem vê metas');
rollback;
