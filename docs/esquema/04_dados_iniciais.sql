-- =============================================================================
-- InstaBarber · Esquema da base de dados · versão 10.1
-- Ficheiro 04 de 04 — dados da plataforma: grelha de funcionalidades (D.3),
-- pacotes, feriados nacionais, módulos desligados e buckets.
-- A grelha D.3 do documento é gerada a partir DESTE ficheiro: é a fonte única.
-- =============================================================================

insert into funcionalidades (chave, nome, grupo, mostra_upgrade, ordem, descricao) values
  -- Operação
  ('agenda_basica',              'Agenda e marcações',                 'operacao',   false, 10, 'Agenda do dia, por profissional, marcação ao balcão'),
  ('gestao_clientes',            'Gestão de clientes',                 'operacao',   false, 11, 'Lista, ficha e histórico'),
  ('profissionais_adicionais',   'Vários profissionais',               'operacao',   false, 12, 'Mais do que um profissional ativo'),
  ('painel_profissional',        'Painel por profissional',            'operacao',   false, 13, 'Cada barbeiro com a sua área'),
  ('metas_profissional',         'Metas por profissional',             'operacao',   true,  14, 'Objetivo mensal e progresso por barbeiro'),
  ('ficha_tecnica',              'Ficha técnica do cliente',           'operacao',   false, 15, 'Notas e fotografias do corte'),
  ('politica_faltas',            'Política de faltas',                 'operacao',   false, 16, 'Bloqueia a marcação online depois de N faltas'),
  ('qr_entrada',                 'Entrada por QR code na loja',        'operacao',   false, 17, 'Fila presencial do dia'),
  -- Presença
  ('pagina_publica',             'Página pública',                     'presenca',   false, 20, 'Página da barbearia e marcação online'),
  ('lembretes_marcacao',         'Lembrete individual por WhatsApp',   'presenca',   false, 21, 'Abre o WhatsApp do cliente com o lembrete pronto'),
  ('confirmacao_email',          'Confirmação por e-mail',             'presenca',   false, 22, 'E-mail automático no momento da marcação, quando o cliente deu e-mail'),
  ('portfolio_barbeiro',         'Portfólio do barbeiro',              'presenca',   false, 23, 'Fotografias de trabalhos na página pública'),
  ('pedido_avaliacao',           'Pedido de avaliação no Google',      'presenca',   true,  24, 'Mensagem pós-serviço com a ligação de avaliação'),
  ('multilinguagem',             'Página em PT, EN e FR',              'presenca',   false, 25, 'Página pública e área de cliente em três línguas'),
  -- Retenção
  ('clientes_perdidos',          'Radar de clientes perdidos',         'retencao',   false, 30, 'Lista e valor em euros a recuperar'),
  ('envio_mensagens',            'Abrir mensagem individual',          'retencao',   true,  31, 'Recuperação, aniversário e pós-venda por wa.me'),
  ('envio_lote',                 'Abrir mensagens em lote',            'retencao',   true,  32, 'Fila de mensagens e lembretes em lote'),
  ('campanha_aniversario',       'Campanha de aniversário',            'retencao',   false, 33, 'Lista do mês e desconto configurável'),
  ('fila_espera',                'Fila de espera',                     'retencao',   false, 34, 'Lista por dia e serviço, aviso de vaga'),
  ('marcacao_rapida',            'Repetir o último serviço',           'retencao',   false, 35, 'Marcação em dois toques'),
  ('fidelizacao_selos',          'Fidelização por selos',              'retencao',   false, 36, 'Cartão de selos, prémio e convite de amigos'),
  -- Financeiro
  ('financeiro_objetivos',       'Painel financeiro',                  'financeiro', false, 40, 'Objetivos, custos e resultado'),
  ('contas_a_pagar',             'Contas a pagar',                     'financeiro', false, 41, 'Custos fixos e despesas'),
  ('painel_gestao',              'Painel de gestão',                   'financeiro', false, 42, 'Indicadores do dia e do mês'),
  ('comissoes_acertos',          'Comissões e acertos',                'financeiro', false, 43, 'Comissões por serviço e acertos mensais (modelos A, B, C)'),
  ('relatorios_por_profissional','Relatórios por profissional',        'financeiro', false, 44, 'Relatório de cada barbeiro'),
  ('relatorio_mensal',           'Relatório mensal',                   'financeiro', false, 45, 'Nove blocos e PDF com a marca'),
  -- Receita
  ('clube_assinatura',           'Clube de assinatura',                'receita',    false, 50, 'Planos mensais com serviços incluídos'),
  ('loja_produtos',              'Loja de produtos',                   'receita',    false, 51, 'Encomendas com levantamento e pagamento ao balcão'),
  ('precos_dinamicos',           'Preços por período de ocupação',     'receita',    false, 52, 'Desconto nas horas mortas'),
  ('cartoes_oferta',             'Cartões oferta',                     'receita',    false, 53, 'Vendidos e pagos ao balcão, com saldo');

-- Basic: o produto completo para quem trabalha sozinho.
insert into pacote_funcionalidades (plano, chave)
select 'basic', chave from funcionalidades
 where chave in ('agenda_basica','gestao_clientes','painel_profissional','ficha_tecnica','politica_faltas',
                 'pagina_publica','lembretes_marcacao','confirmacao_email','portfolio_barbeiro',
                 'clientes_perdidos','campanha_aniversario','marcacao_rapida','fidelizacao_selos',
                 'financeiro_objetivos','contas_a_pagar','painel_gestao','comissoes_acertos',
                 'relatorios_por_profissional','relatorio_mensal');

-- Pro: tudo, exceto a multilinguagem, que a Performa LAB liga à parte.
insert into pacote_funcionalidades (plano, chave)
select 'pro', chave from funcionalidades where chave <> 'multilinguagem';

-- Feriados nacionais obrigatórios (Código do Trabalho, art. 234.º).
-- Carnaval e feriado municipal são facultativos: cada barbearia acrescenta os seus.
-- Carregar os anos seguintes antes de 1 de dezembro de cada ano (M.1).
insert into feriados (inquilino_id, data, nome) values
  (null, '2026-01-01', 'Ano Novo'),            (null, '2026-04-03', 'Sexta-feira Santa'),
  (null, '2026-04-05', 'Páscoa'),              (null, '2026-04-25', 'Dia da Liberdade'),
  (null, '2026-05-01', 'Dia do Trabalhador'),  (null, '2026-06-04', 'Corpo de Deus'),
  (null, '2026-06-10', 'Dia de Portugal'),     (null, '2026-08-15', 'Assunção de Nossa Senhora'),
  (null, '2026-10-05', 'Implantação da República'), (null, '2026-11-01', 'Dia de Todos os Santos'),
  (null, '2026-12-01', 'Restauração da Independência'), (null, '2026-12-08', 'Imaculada Conceição'),
  (null, '2026-12-25', 'Natal'),
  (null, '2027-01-01', 'Ano Novo'),            (null, '2027-03-26', 'Sexta-feira Santa'),
  (null, '2027-03-28', 'Páscoa'),              (null, '2027-04-25', 'Dia da Liberdade'),
  (null, '2027-05-01', 'Dia do Trabalhador'),  (null, '2027-05-27', 'Corpo de Deus'),
  (null, '2027-06-10', 'Dia de Portugal'),     (null, '2027-08-15', 'Assunção de Nossa Senhora'),
  (null, '2027-10-05', 'Implantação da República'), (null, '2027-11-01', 'Dia de Todos os Santos'),
  (null, '2027-12-01', 'Restauração da Independência'), (null, '2027-12-08', 'Imaculada Conceição'),
  (null, '2027-12-25', 'Natal'),
  (null, '2028-01-01', 'Ano Novo'),            (null, '2028-04-14', 'Sexta-feira Santa'),
  (null, '2028-04-16', 'Páscoa'),              (null, '2028-04-25', 'Dia da Liberdade'),
  (null, '2028-05-01', 'Dia do Trabalhador'),  (null, '2028-06-15', 'Corpo de Deus'),
  (null, '2028-06-10', 'Dia de Portugal'),     (null, '2028-08-15', 'Assunção de Nossa Senhora'),
  (null, '2028-10-05', 'Implantação da República'), (null, '2028-11-01', 'Dia de Todos os Santos'),
  (null, '2028-12-01', 'Restauração da Independência'), (null, '2028-12-08', 'Imaculada Conceição'),
  (null, '2028-12-25', 'Natal');

-- Módulos preparados e desligados (G.4).
insert into modulos_plataforma (chave, ativo) values ('pagamentos', false), ('faturacao', false);

-- Buckets do Storage.
insert into storage.buckets (id, name, public) values
  ('publico', 'publico', true),
  ('fichas',  'fichas',  false),
  ('comercial', 'comercial', false),
  ('comprovativos', 'comprovativos', false)
on conflict (id) do nothing;

-- Condições comerciais (D-161): descontos e taxa de migração desligados.
insert into configuracao_comercial default values on conflict (id) do nothing;

-- Campanhas comerciais de partida (D-190), todas desligadas: a Performa LAB liga as que quiser.
insert into campanhas_comerciais (chave, nome, texto, ordem, planos, periodicidade, implementacao,
  implementacao_sem_iva, meses_oferta, primeiro_mes_gratis, meses_condicao, desconto_temporario_pct,
  profissionais_gratis, dominio_gratis) values
  ('anual14_pro', 'Anual 14', 'Paga o anual e usa 14 meses: aos 12 meses do ano juntamos 2 meses de oferta. A Implementação Essencial é por nossa conta.',
   10, '{pro}', 'anual', 'essencial', 0, 2, false, 0, 0, 0, false),
  ('anual14_basic', 'Anual 14', 'Paga o anual e usa 14 meses: aos 12 meses do ano juntamos 2 meses de oferta. Implementação Essencial a 50 €.',
   11, '{basic}', 'anual', 'essencial', 50, 2, false, 0, 0, 0, false),
  ('semestral', 'Semestral com implementação', 'Paga seis meses de uma vez e a Implementação Essencial é por nossa conta.',
   20, '{basic,pro}', 'semestral', 'essencial', 0, 0, false, 0, 0, 0, false),
  ('primeiro_mes', 'Primeiro mês por nossa conta', 'Paga só a Implementação Essencial (50 €) e o primeiro mês é de oferta. Depois, a mensalidade normal.',
   30, '{basic,pro}', 'mensal', 'essencial', 50, 0, true, 0, 0, 0, false),
  ('muda_ja', 'Muda já', 'Vem de outro sistema? A Implementação com Formação ao preço da Essencial (50 €): importamos os seus clientes, levamos o expositor e formamos a equipa.',
   40, '{basic,pro}', null, 'formacao', 50, 0, false, 0, 0, 0, false),
  ('sobe_pro', 'Sobe para Pro', 'O Pro completo a metade do preço nos três primeiros meses.',
   50, '{pro}', 'mensal', null, null, 0, false, 3, 50, 0, false),
  ('equipa_crescer', 'Equipa a crescer', 'O quarto profissional é de oferta nos primeiros seis meses.',
   60, '{pro}', null, null, null, 0, false, 6, 0, 1, false),
  ('dominio_oferta', 'Domínio de oferta', 'O domínio próprio é por nossa conta no primeiro ano.',
   70, '{basic,pro}', 'anual', null, null, 0, false, 12, 0, 0, true)
on conflict (chave) do nothing;
