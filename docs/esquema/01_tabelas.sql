-- =============================================================================
-- InstaBarber · Esquema da base de dados · versão 10.1
-- Ficheiro 01 de 04 — tabelas, chaves e restrições.
--
-- Regras deste ficheiro:
--   * Identificadores só em ASCII, minúsculas e underscore.
--   * Todas as tabelas operacionais têm inquilino_id.
--   * Referências entre tabelas do mesmo inquilino usam chaves compostas
--     (inquilino_id, id): uma linha de uma barbearia nunca aponta para uma
--     linha de outra, mesmo que o código tenha um erro.
--   * O histórico protege-se com ON DELETE NO ACTION (verificado no fim da
--     instrução): não se apaga um serviço com visitas, mas eliminar a
--     barbearia inteira apaga tudo de uma vez (eliminar_inquilino, ficheiro 02).
--   * Valores em euros: numeric(10,2). No TypeScript convertem-se para
--     cêntimos inteiros em lib/formatacao/dinheiro.ts.
--   * Datas e horas: timestamptz (guardado em UTC). Tudo o que é hora local
--     calcula-se com 'Europe/Lisbon' nas funções do ficheiro 02.
--   * Valores de dinheiro registados, nunca cobrados: a versão 1 não processa
--     pagamentos nem emite documentos fiscais. Os módulos de pagamentos e de
--     faturação existem desligados (secção final).
-- =============================================================================

create extension if not exists btree_gist;

-- -----------------------------------------------------------------------------
-- 1 · Inquilinos (barbearias)
-- -----------------------------------------------------------------------------
create table inquilinos (
  id                            uuid primary key default gen_random_uuid(),
  slug                          text not null unique
                                check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
                                       and length(slug) between 3 and 40
                                       and slug not in ('admin','app','api','b','www','apoio','ajuda',
                                                        'entrar','login','registo','adesao','termos',
                                                        'privacidade','static','_next','instabarber',
                                                        'performa','performalab','conta','minha-area')),
  nome                          text not null,
  vertical                      text not null default 'barbearia' check (vertical in ('barbearia')),

  -- Preparação para outros países (Parte P). DORMENTE: cada coluna só aceita hoje o valor de
  -- Portugal. Ativar um país é uma migração que alarga estas restrições (P.3), nunca código por barbearia.
  pais                          char(2) not null default 'PT' check (pais in ('PT')),
  fuso                          text not null default 'Europe/Lisbon' check (fuso in ('Europe/Lisbon')),
  moeda                         char(3) not null default 'EUR' check (moeda in ('EUR')),
  idioma                        text not null default 'pt-PT' check (idioma in ('pt-PT')),
  responsavel                   text,
  nif                           text check (nif ~ '^[0-9]{9}$'),
  ano_abertura                  integer check (ano_abertura between 1900 and 2100),
  descricao                     text,
  historia                      text check (length(historia) <= 600),
  cidade                        text,
  morada                        text,
  codigo_postal                 text check (codigo_postal ~ '^[0-9]{4}-[0-9]{3}$'),
  telefone                      text check (telefone ~ '^\+[1-9][0-9]{7,14}$'),
  whatsapp                      text check (whatsapp ~ '^\+[1-9][0-9]{7,14}$'),
  email                         text,
  instagram                     text,
  facebook                      text,
  tiktok                        text,
  google_maps_url               text,
  google_avaliacao_url          text,           -- ligação para deixar avaliação no Google
  livro_reclamacoes_url         text,           -- ligação para o Livro de Reclamações eletrónico
  logo_url                      text,
  capa_cor                      text not null default '#F5A623' check (capa_cor ~ '^#[0-9A-Fa-f]{6}$'),
  capa_foto_url                 text,
  galeria_urls                  text[] not null default '{}' check (cardinality(galeria_urls) <= 6),
  mostrar_mapa                  boolean not null default true,
  mostrar_historia              boolean not null default true,

  -- Horário da barbearia (hora local de Lisboa)
  hora_abertura                 time not null default '09:00',
  hora_fecho                    time not null default '19:30',
  dias_descanso                 smallint[] not null default '{0,1}',  -- 0 = domingo
  intervalo_almoco_inicio       time,
  intervalo_almoco_fim          time,
  fecha_feriados                boolean not null default true,

  -- Parâmetros do motor de agenda (F.7)
  granularidade_min             integer not null default 30 check (granularidade_min in (5,10,15,20,30,60)),
  intervalo_marcacoes_min       integer not null default 0  check (intervalo_marcacoes_min between 0 and 60),
  antecedencia_minima_min       integer not null default 60 check (antecedencia_minima_min between 0 and 2880),
  antecedencia_cancelamento_min integer not null default 120 check (antecedencia_cancelamento_min between 0 and 2880),
  janela_marcacao_dias          integer not null default 60 check (janela_marcacao_dias between 1 and 365),
  aberto                        boolean not null default true,         -- interruptor da Gestão do sistema

  -- Ofertas e regras decididas pelo gestor
  selos_necessarios             integer not null default 10 check (selos_necessarios between 1 and 50),
  premio_ativo                  boolean not null default false,
  premio_servico_id             uuid,                                  -- FK composta acrescentada abaixo
  desconto_aniversario_ativo    boolean not null default false,
  desconto_aniversario_percent  numeric(5,2) check (desconto_aniversario_percent between 0 and 100),
  limite_faltas                 integer not null default 2 check (limite_faltas between 0 and 10), -- 0 = desligado
  modelo_caixa_omissao          text not null default 'A' check (modelo_caixa_omissao in ('A','B','C')),

  -- Campos protegidos: só o super_admin os altera (trigger no ficheiro 02)
  plano                         text not null default 'basic' check (plano in ('basic','pro')),
  periodicidade                 text not null default 'mensal' check (periodicidade in ('mensal','anual')),
  profissionais_contratados     integer not null default 1 check (profissionais_contratados >= 1),
  estado                        text not null default 'pendente'
                                check (estado in ('pendente','ativo','suspenso','cancelado')),
  estado_pagamento              text not null default 'em_dia' check (estado_pagamento in ('em_dia','em_atraso')),
  proximo_vencimento            date,
  dominio_proprio               text unique,
  aprovado_em                   timestamptz,
  criado_em                     timestamptz not null default now(),

  check (hora_abertura < hora_fecho),
  check ((intervalo_almoco_inicio is null) = (intervalo_almoco_fim is null)),
  check (intervalo_almoco_inicio is null or intervalo_almoco_inicio < intervalo_almoco_fim),
  check (dias_descanso <@ array[0,1,2,3,4,5,6]::smallint[]),
  check (plano = 'pro' or profissionais_contratados = 1),
  check (plano = 'basic' or profissionais_contratados >= 3),
  check (not desconto_aniversario_ativo or desconto_aniversario_percent is not null)
);

-- -----------------------------------------------------------------------------
-- 2 · Perfis da equipa e da plataforma
--     O cliente final NÃO tem perfil: é identificado por clientes.auth_user_id.
--     Um utilizador pode ter perfis em várias barbearias.
-- -----------------------------------------------------------------------------
create table perfis (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  inquilino_id  uuid references inquilinos(id) on delete cascade,
  papel         text not null check (papel in ('super_admin','proprietario','profissional')),
  nome          text,
  email         text,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  check ((papel = 'super_admin') = (inquilino_id is null)),
  unique nulls not distinct (user_id, inquilino_id, papel)
);
create index perfis_user on perfis (user_id) where ativo;

-- -----------------------------------------------------------------------------
-- 3 · Profissionais, horários e ausências
-- -----------------------------------------------------------------------------
create table profissionais (
  id                    uuid primary key default gen_random_uuid(),
  inquilino_id          uuid not null references inquilinos(id) on delete cascade,
  perfil_id             uuid unique references perfis(id) on delete set null,
  nome                  text not null,
  nome_apresentado      text not null,              -- o que aparece na agenda e na página pública
  email                 text,
  nif                   text check (nif ~ '^[0-9]{9}$'),
  foto_url              text,
  especialidades        text[] not null default '{}',
  comissao_percent      numeric(5,2) not null default 50 check (comissao_percent between 0 and 100),
  modelo_caixa          text not null default 'A' check (modelo_caixa in ('A','B','C')),
  renda_valor           numeric(10,2) check (renda_valor >= 0),
  renda_dia_vencimento  integer check (renda_dia_vencimento between 1 and 28),
  portfolio_visivel     boolean not null default false,
  -- Preparação fiscal, desligada na versão 1 (G.4). Invisível para a barbearia.
  regime_iva            text check (regime_iva in ('isento_art53','normal')),
  modo_emissao          text not null default 'nenhum' check (modo_emissao in ('nenhum','certificado','portal')),
  ordem                 integer not null default 0,
  ativo                 boolean not null default true,
  desativado_em         timestamptz,
  criado_em             timestamptz not null default now(),
  unique (inquilino_id, id),
  check (modelo_caixa <> 'C' or renda_valor is not null)
);

-- Horário de trabalho por profissional. Sem linhas, vale o horário da barbearia.
-- Várias linhas no mesmo dia permitem pausas.
create table horarios_profissional (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null,
  profissional_id  uuid not null,
  dia_semana       smallint not null check (dia_semana between 0 and 6),
  inicio           time not null,
  fim              time not null,
  check (inicio < fim),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete cascade
);

-- Férias, folgas e ausências. profissional_id nulo = a barbearia inteira fecha.
create table ausencias (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null references inquilinos(id) on delete cascade,
  profissional_id  uuid,
  inicio           timestamptz not null,
  fim              timestamptz not null,
  tipo             text not null default 'folga' check (tipo in ('ferias','folga','formacao','doenca','outro')),
  motivo           text,
  criado_por       uuid references auth.users(id) on delete set null,
  criado_em        timestamptz not null default now(),
  check (fim > inicio),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete cascade
);
create index ausencias_periodo on ausencias using gist (inquilino_id, tstzrange(inicio, fim, '[)'));

-- Feriados. inquilino_id nulo = feriado nacional (carregado pela plataforma).
create table feriados (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid references inquilinos(id) on delete cascade,
  data          date not null,
  nome          text not null,
  unique nulls not distinct (inquilino_id, data)
);

-- -----------------------------------------------------------------------------
-- 4 · Serviços e comissões
-- -----------------------------------------------------------------------------
create table servicos (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  nome          text not null,
  nome_en       text,
  nome_fr       text,
  descricao     text,
  descricao_en  text,
  descricao_fr  text,
  categoria     text,
  duracao_min   integer not null check (duracao_min between 5 and 480),
  preco         numeric(10,2) not null check (preco >= 0),  -- preço final ao cliente (IVA incluído, se houver)
  ativo         boolean not null default true,
  ordem         integer not null default 0,
  criado_em     timestamptz not null default now(),
  unique (inquilino_id, id)
);

alter table inquilinos
  add constraint inquilinos_premio_fk foreign key (id, premio_servico_id)
  references servicos (inquilino_id, id) on delete set null (premio_servico_id);

-- Percentagem de comissão por serviço. Sem linha, vale profissionais.comissao_percent.
create table comissoes_servico (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null,
  profissional_id  uuid not null,
  servico_id       uuid not null,
  percentagem      numeric(5,2) not null check (percentagem between 0 and 100),
  criado_em        timestamptz not null default now(),
  unique (profissional_id, servico_id),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete cascade,
  foreign key (inquilino_id, servico_id) references servicos (inquilino_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- 5 · Clientes
-- -----------------------------------------------------------------------------
create table clientes (
  id                       uuid primary key default gen_random_uuid(),
  inquilino_id             uuid not null references inquilinos(id) on delete cascade,
  nome                     text not null,
  telefone                 text check (telefone ~ '^\+[1-9][0-9]{7,14}$'),  -- nulo só depois de anonimizado
  data_nascimento          date,                                    -- opcional: alimenta a campanha de aniversário
  email                    text,
  nif                      text check (nif ~ '^[0-9]{9}$'),         -- opcional: só se o cliente quiser fatura com contribuinte
  notas                    text,
  auth_user_id             uuid unique references auth.users(id) on delete set null, -- uma conta por cliente e por barbearia
  origem                   text not null default 'online'
                           check (origem in ('online','balcao','qr','loja','fila','importacao')),
  consentimento_mensagens  boolean not null default false,
  consentimento_em         timestamptz,
  nao_contactar            boolean not null default false,
  codigo_convite           text unique check (codigo_convite ~ '^[A-Z0-9]{6}$'),
  convidado_por            uuid,
  faltas_perdoadas_em      timestamptz,                             -- o gestor volta a permitir marcação online
  anonimizado_em           timestamptz,
  criado_por               uuid default auth.uid() references auth.users(id) on delete set null,
  criado_em                timestamptz not null default now(),
  unique (inquilino_id, telefone),
  unique (inquilino_id, id),
  check (not consentimento_mensagens or consentimento_em is not null),
  check (telefone is not null or anonimizado_em is not null),
  check (convidado_por is null or convidado_por <> id),
  foreign key (inquilino_id, convidado_por) references clientes (inquilino_id, id) on delete set null (convidado_por)
);

-- Ficha técnica: notas e fotografias do corte, por cliente.
create table fichas_tecnicas (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null,
  cliente_id       uuid not null,
  profissional_id  uuid,
  nota             text,
  foto_path        text,   -- caminho no bucket privado 'fichas'
  criado_por       uuid references auth.users(id) on delete set null,
  criado_em        timestamptz not null default now(),
  check (nota is not null or foto_path is not null),
  foreign key (inquilino_id, cliente_id) references clientes (inquilino_id, id) on delete cascade,
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete set null (profissional_id)
);

-- Códigos de verificação de acesso do cliente (B9). O código é gerado pelo
-- servidor e enviado pela barbearia por wa.me; expira em 15 minutos.
create table codigos_acesso (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null,
  cliente_id    uuid not null,
  codigo        text not null check (codigo ~ '^[0-9]{6}$'),
  expira_em     timestamptz not null,
  tentativas    integer not null default 0 check (tentativas <= 5),
  enviado_em    timestamptz,
  usado_em      timestamptz,
  criado_em     timestamptz not null default now(),
  foreign key (inquilino_id, cliente_id) references clientes (inquilino_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- 6 · Clube de assinatura e cartões oferta
--     (antes das marcações, que apontam para os créditos)
-- -----------------------------------------------------------------------------
create table clubes (
  id                uuid primary key default gen_random_uuid(),
  inquilino_id      uuid not null references inquilinos(id) on delete cascade,
  nome              text not null,
  preco_mensal      numeric(10,2) not null check (preco_mensal >= 0),  -- preço final ao cliente
  validade_dias     integer not null default 30 check (validade_dias between 7 and 92),
  transita_credito  boolean not null default false,
  renovacao_auto    boolean not null default true,
  ativo             boolean not null default true,
  criado_em         timestamptz not null default now(),
  unique (inquilino_id, id)
);

create table clube_servicos (
  id              uuid primary key default gen_random_uuid(),
  inquilino_id    uuid not null,
  clube_id        uuid not null,
  servico_id      uuid not null,
  quantidade_mes  integer not null check (quantidade_mes > 0),
  unique (clube_id, servico_id),
  foreign key (inquilino_id, clube_id) references clubes (inquilino_id, id) on delete cascade,
  foreign key (inquilino_id, servico_id) references servicos (inquilino_id, id) on delete no action
);

create table subscricoes (
  id                 uuid primary key default gen_random_uuid(),
  inquilino_id       uuid not null,
  cliente_id         uuid not null,
  clube_id           uuid not null,
  inicio             date not null,
  proxima_renovacao  date not null,
  estado             text not null default 'ativa' check (estado in ('ativa','cancelada','suspensa')),
  cancelada_em       timestamptz,
  criado_em          timestamptz not null default now(),
  unique (inquilino_id, id),
  foreign key (inquilino_id, cliente_id) references clientes (inquilino_id, id) on delete no action,
  foreign key (inquilino_id, clube_id) references clubes (inquilino_id, id) on delete no action
);

-- Um ciclo por período pago. pago_em regista o recebimento ao balcão.
create table ciclos_clube (
  id             uuid primary key default gen_random_uuid(),
  inquilino_id   uuid not null,
  subscricao_id  uuid not null,
  inicio         date not null,
  fim            date not null,
  valor          numeric(10,2) not null check (valor >= 0),
  pago_em        timestamptz,
  metodo         text check (metodo in ('dinheiro','mbway','transferencia','cartao')),
  unique (subscricao_id, inicio),
  unique (inquilino_id, id),
  check (fim > inicio),
  foreign key (inquilino_id, subscricao_id) references subscricoes (inquilino_id, id) on delete cascade
);

create table creditos_clube (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null,
  ciclo_id      uuid not null,
  servico_id    uuid not null,
  quantidade    integer not null check (quantidade >= 0),
  usados        integer not null default 0 check (usados >= 0),
  unique (ciclo_id, servico_id),
  unique (inquilino_id, id),
  check (usados <= quantidade),
  foreign key (inquilino_id, ciclo_id) references ciclos_clube (inquilino_id, id) on delete cascade,
  foreign key (inquilino_id, servico_id) references servicos (inquilino_id, id) on delete no action
);

-- Cartões oferta: vendidos e pagos ao balcão; o sistema só regista saldo e usos.
create table cartoes_oferta (
  id                  uuid primary key default gen_random_uuid(),
  inquilino_id        uuid not null references inquilinos(id) on delete cascade,
  codigo              text not null check (codigo ~ '^[A-Z0-9]{8}$'),
  valor_inicial       numeric(10,2) not null check (valor_inicial > 0),
  comprador_nome      text not null,
  comprador_cliente_id uuid,
  beneficiario_nome   text,
  vendido_em          timestamptz not null default now(),
  vendido_por         uuid references auth.users(id) on delete set null,
  metodo              text check (metodo in ('dinheiro','mbway','transferencia','cartao')),
  valido_ate          date not null,
  anulado_em          timestamptz,
  unique (inquilino_id, codigo),
  unique (inquilino_id, id),
  foreign key (inquilino_id, comprador_cliente_id) references clientes (inquilino_id, id) on delete set null (comprador_cliente_id)
);

-- -----------------------------------------------------------------------------
-- 7 · Marcações e serviços prestados
-- -----------------------------------------------------------------------------
create table marcacoes (
  id                    uuid primary key default gen_random_uuid(),
  inquilino_id          uuid not null references inquilinos(id) on delete cascade,
  cliente_id            uuid,
  profissional_id       uuid,                   -- nulo = marcação sem profissional (órfã)
  servico_id            uuid not null,
  inicio                timestamptz not null,
  fim                   timestamptz not null,   -- calculado: inicio + duração do serviço
  fim_bloqueio          timestamptz not null,   -- calculado: fim + intervalo entre marcações
  periodo               tstzrange generated always as (tstzrange(inicio, fim_bloqueio, '[)')) stored,
  estado                text not null default 'agendada'
                        check (estado in ('reservada','agendada','concluida','falta','cancelada')),
  reservada_ate         timestamptz,            -- vaga presa enquanto o cliente preenche (10 min)
  token_reserva_hash    text,                   -- só quem reservou confirma
  origem                text not null default 'online' check (origem in ('online','balcao','qr','fila')),
  valor_tabela          numeric(10,2) not null check (valor_tabela >= 0),
  desconto_percent      numeric(5,2) not null default 0 check (desconto_percent between 0 and 100),
  valor_cobrado         numeric(10,2) not null check (valor_cobrado >= 0),
  credito_id            uuid,
  cartao_oferta_id      uuid,
  notas                 text,
  lembrete_aberto_em    timestamptz,            -- ligação wa.me aberta (não é prova de envio)
  confirmacao_email_em  timestamptz,
  lembrete_email_em     timestamptz,
  cancelada_em          timestamptz,
  cancelada_por         uuid references auth.users(id) on delete set null,
  motivo_cancelamento   text,
  concluida_em          timestamptz,
  criado_por            uuid references auth.users(id) on delete set null,
  criado_em             timestamptz not null default now(),
  unique (inquilino_id, id),
  check (fim > inicio),
  check (fim_bloqueio >= fim),
  check (estado in ('reservada','cancelada') or cliente_id is not null),  -- reserva expirada nunca teve cliente
  check ((estado = 'reservada') = (reservada_ate is not null)),
  check (estado <> 'cancelada' or cancelada_em is not null),
  foreign key (inquilino_id, cliente_id)      references clientes (inquilino_id, id)      on delete no action,
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete set null (profissional_id),
  foreign key (inquilino_id, servico_id)      references servicos (inquilino_id, id)      on delete no action,
  foreign key (inquilino_id, credito_id)      references creditos_clube (inquilino_id, id) on delete set null (credito_id),
  foreign key (inquilino_id, cartao_oferta_id) references cartoes_oferta (inquilino_id, id) on delete set null (cartao_oferta_id),
  -- O que trava duas marcações no mesmo período para o mesmo profissional.
  -- Canceladas e faltas libertam o horário.
  constraint sem_sobreposicao exclude using gist (profissional_id with =, periodo with &&)
    where (estado in ('reservada','agendada','concluida') and profissional_id is not null)
);
create index marcacoes_agenda on marcacoes (inquilino_id, inicio);
create index marcacoes_cliente on marcacoes (inquilino_id, cliente_id, inicio desc);
create index marcacoes_profissional on marcacoes (profissional_id, inicio);

-- Serviço prestado. Criado só por concluir_marcacao(); guarda a fotografia dos
-- valores no momento (comissão, modelo de caixa) para o histórico não mudar.
create table visitas (
  id                uuid primary key default gen_random_uuid(),
  inquilino_id      uuid not null,
  marcacao_id       uuid not null unique,
  cliente_id        uuid not null,
  profissional_id   uuid,
  servico_id        uuid not null,
  data              timestamptz not null,
  valor_tabela      numeric(10,2) not null,
  valor_cobrado     numeric(10,2) not null,
  base_comissao     numeric(10,2) not null,     -- valor_tabela com crédito do clube; senão valor_cobrado
  comissao_percent  numeric(5,2) not null,
  comissao_valor    numeric(10,2) not null,
  modelo_caixa      text not null check (modelo_caixa in ('A','B','C')),
  emitente          text check (emitente in ('barbearia','profissional')),  -- preparação fiscal (G.4)
  criado_em         timestamptz not null default now(),
  unique (inquilino_id, id),
  foreign key (inquilino_id, marcacao_id)     references marcacoes (inquilino_id, id)     on delete no action,
  foreign key (inquilino_id, cliente_id)      references clientes (inquilino_id, id)      on delete no action,
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete set null (profissional_id),
  foreign key (inquilino_id, servico_id)      references servicos (inquilino_id, id)      on delete no action
);
create index visitas_cliente on visitas (inquilino_id, cliente_id, data desc);
create index visitas_profissional on visitas (profissional_id, data desc);

-- Livro de selos: o saldo é a soma. Nada se reescreve.
create table movimentos_selos (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null,
  cliente_id    uuid not null,
  tipo          text not null check (tipo in ('visita','convite','resgate','ajuste')),
  quantidade    integer not null check (quantidade <> 0),
  visita_id     uuid,
  servico_id    uuid,                      -- prémio resgatado
  valor_tabela  numeric(10,2),             -- valor do prémio no momento do resgate
  criado_por    uuid references auth.users(id) on delete set null,
  criado_em     timestamptz not null default now(),
  check (tipo <> 'resgate' or quantidade < 0),
  check (tipo not in ('visita','convite') or quantidade > 0),
  foreign key (inquilino_id, cliente_id) references clientes (inquilino_id, id) on delete no action,
  foreign key (inquilino_id, visita_id)  references visitas (inquilino_id, id)  on delete no action,
  foreign key (inquilino_id, servico_id) references servicos (inquilino_id, id) on delete no action
);
create unique index movimentos_selos_visita on movimentos_selos (visita_id, tipo) where visita_id is not null;

create table movimentos_cartao (
  id                uuid primary key default gen_random_uuid(),
  inquilino_id      uuid not null,
  cartao_id         uuid not null,
  valor             numeric(10,2) not null check (valor > 0),   -- valor usado
  marcacao_id       uuid,
  registado_por     uuid references auth.users(id) on delete set null,
  criado_em         timestamptz not null default now(),
  foreign key (inquilino_id, cartao_id)   references cartoes_oferta (inquilino_id, id) on delete no action,
  foreign key (inquilino_id, marcacao_id) references marcacoes (inquilino_id, id)    on delete set null (marcacao_id)
);

-- -----------------------------------------------------------------------------
-- 8 · Preços por período, promoções, portfólio
-- -----------------------------------------------------------------------------
create table periodos_desconto (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  dia_semana    smallint not null check (dia_semana between 0 and 6),
  hora_inicio   time not null,
  hora_fim      time not null,
  percentagem   numeric(5,2) not null check (percentagem > 0 and percentagem <= 100),
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  check (hora_inicio < hora_fim)
);

create table promocoes (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  titulo        text not null,
  descricao     text,
  ativa         boolean not null default true,
  inicio        date,
  fim           date,
  criado_em     timestamptz not null default now(),
  check (fim is null or inicio is null or fim >= inicio)
);

create table portfolio_fotos (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null,
  profissional_id  uuid not null,
  foto_url         text not null,
  legenda          text,
  ordem            integer not null default 0,
  visivel          boolean not null default false,
  criado_em        timestamptz not null default now(),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete cascade
);

-- -----------------------------------------------------------------------------
-- 9 · Filas
-- -----------------------------------------------------------------------------
-- Fila de espera: por dia e por serviço, nunca por hora (F.4.1).
create table fila_espera (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null,
  cliente_id    uuid not null,
  servico_id    uuid not null,
  dia           date not null,
  estado        text not null default 'aguarda'
                check (estado in ('aguarda','avisado','aceite','expirado','removido')),
  avisado_em    timestamptz,
  expira_em     timestamptz,                -- avisado_em + 30 minutos
  marcacao_id   uuid,
  criado_em     timestamptz not null default now(),
  check (estado <> 'avisado' or expira_em is not null),
  foreign key (inquilino_id, cliente_id)  references clientes (inquilino_id, id)  on delete cascade,
  foreign key (inquilino_id, servico_id)  references servicos (inquilino_id, id)  on delete cascade,
  foreign key (inquilino_id, marcacao_id) references marcacoes (inquilino_id, id) on delete set null (marcacao_id)
);
create unique index fila_espera_unica on fila_espera (cliente_id, servico_id, dia)
  where estado in ('aguarda','avisado');

-- Fila presencial do dia (entrada por QR, F.4.3).
create table fila_presencial (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null,
  cliente_id       uuid not null,
  servico_id       uuid,
  dia              date not null,
  estado           text not null default 'aguarda'
                   check (estado in ('aguarda','em_atendimento','atendido','saiu')),
  profissional_id  uuid,
  entrou_em        timestamptz not null default now(),
  chamado_em       timestamptz,
  foreign key (inquilino_id, cliente_id)      references clientes (inquilino_id, id)      on delete cascade,
  foreign key (inquilino_id, servico_id)      references servicos (inquilino_id, id)      on delete set null (servico_id),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete set null (profissional_id)
);
create unique index fila_presencial_unica on fila_presencial (cliente_id, dia)
  where estado in ('aguarda','em_atendimento');

-- -----------------------------------------------------------------------------
-- 10 · Loja de produtos (pagamento ao balcão)
-- -----------------------------------------------------------------------------
create table produtos (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  nome          text not null,
  descricao     text,
  foto_url      text,
  custo         numeric(10,2) not null check (custo >= 0),        -- sem IVA
  iva_percent   numeric(5,2) not null default 23 check (iva_percent in (0, 4, 5, 6, 9, 12, 13, 16, 22, 23)),
  preco_venda   numeric(10,2) not null check (preco_venda >= 0),  -- com IVA, o que o cliente paga
  stock         integer not null default 0 check (stock >= 0),
  stock_minimo  integer not null default 0 check (stock_minimo >= 0),
  mostrar_esgotado boolean not null default true,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  unique (inquilino_id, id)
);

create table pedidos_loja (
  id             uuid primary key default gen_random_uuid(),
  numero         bigint generated always as identity,
  inquilino_id   uuid not null references inquilinos(id) on delete cascade,
  cliente_id     uuid not null,
  estado         text not null default 'novo' check (estado in ('novo','pronto','levantado','cancelado')),
  total          numeric(10,2) not null check (total >= 0),
  criado_em      timestamptz not null default now(),
  pronto_em      timestamptz,
  levantado_em   timestamptz,
  cancelado_em   timestamptz,
  unique (inquilino_id, id),
  foreign key (inquilino_id, cliente_id) references clientes (inquilino_id, id) on delete no action
);

create table pedido_linhas (
  id              uuid primary key default gen_random_uuid(),
  inquilino_id    uuid not null,
  pedido_id       uuid not null,
  produto_id      uuid not null,
  quantidade      integer not null check (quantidade > 0),
  preco_unitario  numeric(10,2) not null,   -- no momento da encomenda
  custo_unitario  numeric(10,2) not null,   -- regravado ao levantar
  iva_percent     numeric(5,2) not null,
  foreign key (inquilino_id, pedido_id)  references pedidos_loja (inquilino_id, id) on delete cascade,
  foreign key (inquilino_id, produto_id) references produtos (inquilino_id, id)     on delete no action
);

-- -----------------------------------------------------------------------------
-- 11 · Mensagens
-- -----------------------------------------------------------------------------
create table mensagens (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null references inquilinos(id) on delete cascade,
  cliente_id       uuid,
  profissional_id  uuid,                     -- quem abriu a ligação
  tipo             text not null check (tipo in ('lembrete','aniversario','recuperacao','posvenda','avaliacao',
                                                 'confirmacao','fila','loja','acesso','cartao')),
  canal            text not null default 'whatsapp' check (canal in ('whatsapp','email')),
  conteudo         text,
  referencia_id    uuid,                     -- marcação, pedido, entrada de fila…
  estado           text not null default 'preparada'
                   check (estado in ('preparada','ligacao_aberta','envio_confirmado_manualmente','cancelada',
                                     'enviado','falhou')),
  aberta_em        timestamptz,
  criado_por       uuid references auth.users(id) on delete set null,
  criado_em        timestamptz not null default now(),
  -- 'enviado' e 'falhou' só existem no e-mail automático; no WhatsApp nada é dado como enviado.
  check (canal = 'email' or estado not in ('enviado','falhou')),
  check (canal = 'whatsapp' or estado in ('enviado','falhou')),
  foreign key (inquilino_id, cliente_id)      references clientes (inquilino_id, id)      on delete cascade,
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete set null (profissional_id)
);
create index mensagens_cliente on mensagens (inquilino_id, cliente_id, criado_em desc);

-- -----------------------------------------------------------------------------
-- 12 · Financeiro da barbearia
-- -----------------------------------------------------------------------------
create table custos_fixos (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  descricao     text not null,
  valor         numeric(10,2) not null check (valor >= 0),
  vencimento    date not null,
  pago          boolean not null default false,
  pago_em       timestamptz,
  recorrente    boolean not null default true,
  check (pago = (pago_em is not null))
);

create table despesas (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  descricao     text not null,
  valor         numeric(10,2) not null check (valor >= 0),
  data          date not null,
  categoria     text,
  pago          boolean not null default false,
  pago_em       timestamptz,
  check (pago = (pago_em is not null))
);

-- profissional_id nulo = objetivo da barbearia.
create table objetivos (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null references inquilinos(id) on delete cascade,
  profissional_id  uuid,
  mes              date not null check (extract(day from mes) = 1),
  valor            numeric(10,2) not null check (valor >= 0),
  unique nulls not distinct (inquilino_id, profissional_id, mes),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete cascade
);

-- Acertos mensais (F.4.11). Uma correção é um acerto de tipo 'correcao'.
create table acertos (
  id                uuid primary key default gen_random_uuid(),
  inquilino_id      uuid not null,
  profissional_id   uuid not null,
  mes_referencia    date not null check (extract(day from mes_referencia) = 1),
  tipo              text not null default 'normal' check (tipo in ('normal','correcao')),
  modelo            text not null check (modelo in ('A','B','C')),
  receita           numeric(10,2) not null default 0,
  parte_barbeiro    numeric(10,2) not null default 0,
  parte_barbearia   numeric(10,2) not null default 0,
  sentido           text not null check (sentido in ('a_pagar','a_receber')),
  estado            text not null default 'aberto' check (estado in ('aberto','liquidado')),
  valor_liquidado   numeric(10,2),
  metodo            text check (metodo in ('dinheiro','mbway','transferencia')),
  liquidado_em      timestamptz,
  nota              text,
  criado_em         timestamptz not null default now(),
  check (estado = 'aberto' or (liquidado_em is not null and valor_liquidado is not null)),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete no action
);
create unique index acertos_mes on acertos (profissional_id, mes_referencia) where tipo = 'normal';

-- -----------------------------------------------------------------------------
-- 13 · Funcionalidades (grelha D.3)
-- -----------------------------------------------------------------------------
create table funcionalidades (
  chave      text primary key check (chave ~ '^[a-z_]+$'),
  nome       text not null,
  descricao  text,
  grupo      text not null check (grupo in ('operacao','presenca','retencao','financeiro','receita')),
  mostra_upgrade boolean not null default false,  -- fora do plano: mostra a chamada de upgrade em vez de desaparecer
  ordem      integer not null default 0
);

create table pacote_funcionalidades (
  plano   text not null check (plano in ('basic','pro')),
  chave   text not null references funcionalidades(chave) on delete cascade,
  primary key (plano, chave)
);

-- O pacote sugere, o interruptor decide. Só o super_admin escreve (B2).
create table inquilino_funcionalidades (
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  chave         text not null references funcionalidades(chave) on delete cascade,
  ativa         boolean not null default false,
  bonus         boolean not null default false,
  alterado_por  uuid references auth.users(id) on delete set null,
  alterado_em   timestamptz not null default now(),
  primary key (inquilino_id, chave)
);

-- -----------------------------------------------------------------------------
-- 14 · Adesões e cobrança da plataforma (registo manual)
-- -----------------------------------------------------------------------------
create table pedidos_adesao (
  id                     uuid primary key default gen_random_uuid(),
  estado                 text not null default 'pendente' check (estado in ('pendente','aprovado','rejeitado')),
  -- identidade
  nome                   text not null,
  responsavel            text,
  nif                    text check (nif ~ '^[0-9]{9}$'),
  ano_abertura           integer,
  descricao              text,
  vertical               text not null default 'barbearia' check (vertical in ('barbearia')),
  -- contactos
  telefone               text,
  whatsapp               text,
  email                  text,
  cidade                 text,
  morada                 text,
  instagram              text,
  facebook               text,
  tiktok                 text,
  google_maps_url        text,
  -- horário
  hora_abertura          time,
  hora_fecho             time,
  dias_descanso          smallint[],
  intervalo_almoco_inicio time,
  intervalo_almoco_fim   time,
  -- conteúdo
  servicos               jsonb not null default '[]',   -- [{nome, duracao_min, preco}]
  equipa                 jsonb not null default '[]',   -- [{nome, email}]
  logo_path              text,
  capa_path              text,
  galeria_paths          text[] not null default '{}',
  -- contratação
  plano                  text not null default 'pro' check (plano in ('basic','pro')),
  periodicidade          text not null default 'mensal' check (periodicidade in ('mensal','anual')),
  profissionais          integer not null default 2 check (profissionais >= 1),
  mensalidade_calculada  numeric(10,2) not null,
  modelo_caixa           text not null default 'A' check (modelo_caixa in ('A','B','C')),
  preferencia_pagamento  text check (preferencia_pagamento in ('mbway','transferencia','dinheiro')),
  -- acesso (nunca palavra-passe)
  email_acesso           text not null,
  -- perfil de comunicação
  publico_alvo           text,
  tom_comunicacao        text,
  observacoes            text,
  aceitou_termos_em      timestamptz not null,
  -- decisão
  inquilino_id           uuid references inquilinos(id) on delete set null,
  revisto_por            uuid references auth.users(id) on delete set null,
  motivo_rejeicao        text,
  submetido_em           timestamptz not null default now(),
  decidido_em            timestamptz,
  check (estado <> 'rejeitado' or motivo_rejeicao is not null),
  check (plano = 'pro' or profissionais = 1),
  check (plano = 'basic' or profissionais >= 2)
);
create index pedidos_pendentes on pedidos_adesao (submetido_em desc) where estado = 'pendente';

-- Faturas que a Performa LAB emite fora da plataforma (número do seu programa certificado).
create table faturas_plataforma (
  id              uuid primary key default gen_random_uuid(),
  inquilino_id    uuid not null references inquilinos(id) on delete cascade,
  numero          text not null,
  valor           numeric(10,2) not null check (valor >= 0),
  periodo_inicio  date not null,
  periodo_fim     date not null,
  emitida_em      date not null,
  paga_em         date,
  unique (numero)
);

create table recebimentos (
  id              uuid primary key default gen_random_uuid(),
  inquilino_id    uuid not null references inquilinos(id) on delete cascade,
  fatura_id       uuid references faturas_plataforma(id) on delete set null,
  valor           numeric(10,2) not null check (valor > 0),
  metodo          text not null check (metodo in ('dinheiro','mbway','transferencia')),
  data            date not null,
  nota            text,
  registado_por   uuid references auth.users(id) on delete set null,
  criado_em       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 15 · Auditoria
-- -----------------------------------------------------------------------------
create table auditoria (
  id            bigint generated always as identity primary key,
  inquilino_id  uuid references inquilinos(id) on delete set null,
  user_id       uuid references auth.users(id) on delete set null,
  accao         text not null,
  entidade      text,
  entidade_id   uuid,
  detalhes      jsonb,
  criado_em     timestamptz not null default now()
);
create index auditoria_inquilino on auditoria (inquilino_id, criado_em desc);

-- Limites de pedidos nas entradas públicas (F.6). Só a chave de serviço lhe toca.
create table limites_pedidos (
  chave          text primary key,          -- ex.: 'reservar:ip:203.0.113.7'
  janela_inicio  timestamptz not null,
  contagem       integer not null default 0
);

-- -----------------------------------------------------------------------------
-- 16 · Módulos preparados e desligados: pagamentos e faturação (G.4)
--     Só o super_admin os vê. Nada aparece à barbearia enquanto estiverem
--     desligados. Nenhuma tabela anterior depende destas.
-- -----------------------------------------------------------------------------
create table modulos_plataforma (
  chave         text primary key check (chave in ('pagamentos','faturacao')),
  ativo         boolean not null default false,
  alterado_por  uuid references auth.users(id) on delete set null,
  alterado_em   timestamptz not null default now()
);

create table inquilino_modulos (
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  chave         text not null references modulos_plataforma(chave),
  ativo         boolean not null default false,
  alterado_por  uuid references auth.users(id) on delete set null,
  alterado_em   timestamptz not null default now(),
  primary key (inquilino_id, chave)
);

-- Ligações a fornecedores externos (MB WAY, programa de faturação), por
-- barbearia ou por profissional. Os segredos vivem no Supabase Vault;
-- aqui fica só a referência.
create table ligacoes_externas (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null references inquilinos(id) on delete cascade,
  profissional_id  uuid,
  tipo             text not null check (tipo in ('pagamentos','faturacao')),
  fornecedor       text not null check (fornecedor in ('simulado','ifthenpay','eupago','stripe','moloni','invoicexpress')),
  estado           text not null default 'pendente' check (estado in ('pendente','ligada','erro','desligada')),
  segredo_ref      uuid,                       -- id do segredo no Vault
  criado_em        timestamptz not null default now(),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete cascade
);

create table pagamentos (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null references inquilinos(id) on delete cascade,
  finalidade       text not null check (finalidade in ('sinal','clube','mensalidade')),
  referencia_id    uuid not null,             -- marcação, ciclo do clube ou fatura da plataforma
  recebedor        text not null check (recebedor in ('barbearia','profissional','performa')),
  profissional_id  uuid,
  fornecedor       text not null,
  metodo           text not null default 'mbway' check (metodo in ('mbway','multibanco','cartao')),
  valor            numeric(10,2) not null check (valor > 0),
  estado           text not null default 'pendente'
                   check (estado in ('pendente','pago','falhou','expirado','reembolsado')),
  id_externo       text unique,               -- idempotência do webhook
  dados            jsonb,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now(),
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete no action
);

create table documentos_fiscais (
  id               uuid primary key default gen_random_uuid(),
  inquilino_id     uuid not null,
  visita_id        uuid,
  emitente         text not null check (emitente in ('barbearia','profissional')),
  profissional_id  uuid,
  modo             text not null check (modo in ('certificado','portal')),
  tipo             text not null default 'fatura_recibo' check (tipo in ('fatura','fatura_recibo','fatura_simplificada')),
  numero           text,                      -- devolvido pelo programa ou escrito à mão (Portal das Finanças)
  estado           text not null default 'por_emitir' check (estado in ('por_emitir','emitido','anulado','erro')),
  valor            numeric(10,2) not null,
  emitido_em       timestamptz,
  criado_em        timestamptz not null default now(),
  check (estado <> 'emitido' or numero is not null),
  foreign key (inquilino_id) references inquilinos(id) on delete cascade,
  foreign key (inquilino_id, visita_id) references visitas (inquilino_id, id) on delete no action,
  foreign key (inquilino_id, profissional_id) references profissionais (inquilino_id, id) on delete no action
);

-- -----------------------------------------------------------------------------
-- Todas as tabelas com inquilino_id ligam-se diretamente à barbearia, para que
-- eliminar a barbearia apague tudo numa só instrução (RGPD, fim do contrato).
-- -----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select c.table_name from information_schema.columns c
     where c.table_schema = 'public' and c.column_name = 'inquilino_id' and c.table_name <> 'inquilinos'
       and c.table_name in (select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE')
       and not exists (
         select 1 from pg_constraint k
          where k.conrelid = format('public.%I', c.table_name)::regclass and k.contype = 'f'
            and k.confrelid = 'public.inquilinos'::regclass
            and k.conkey = array[(select attnum from pg_attribute where attrelid = format('public.%I', c.table_name)::regclass and attname = 'inquilino_id')])
  loop
    execute format('alter table public.%I add constraint %I foreign key (inquilino_id) references public.inquilinos(id) on delete cascade',
                   r.table_name, r.table_name || '_inquilino_fk');
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Índices por inquilino nas tabelas mais consultadas (RLS filtra sempre por eles)
-- -----------------------------------------------------------------------------
create index profissionais_inquilino on profissionais (inquilino_id) where ativo;
create index servicos_inquilino      on servicos (inquilino_id) where ativo;
create index clientes_inquilino      on clientes (inquilino_id);
create index clientes_auth           on clientes (auth_user_id) where auth_user_id is not null;
create index produtos_inquilino      on produtos (inquilino_id) where ativo;
create index subscricoes_cliente     on subscricoes (inquilino_id, cliente_id);

-- -----------------------------------------------------------------------------
-- 17 · Comercial: leads, briefings, propostas e contratos (Parte N)
--      Tabelas da plataforma, não de uma barbearia: não têm inquilino_id até o
--      lead virar cliente. Só o super_admin as lê e escreve (03_rls.sql).
--      Todas as mudanças de estado passam pelas funções do ficheiro 02.
-- -----------------------------------------------------------------------------
create table leads (
  id                  uuid primary key default gen_random_uuid(),
  nome_contacto       text not null check (length(trim(nome_contacto)) > 0),
  nome_barbearia      text,
  cidade              text,
  telefone            text,
  email               text,
  n_barbeiros         text,                       -- o que o visitante indicou: '1', '2', '3 ou mais'
  origem              text not null default 'landing'
                      check (origem in ('landing','whatsapp','email','indicacao','visita','outro')),
  estado              text not null default 'novo'
                      check (estado in ('novo','contactado','demonstracao','proposta','ganho','perdido')),
  motivo_perda        text,
  proxima_acao        text,
  proxima_acao_em     date,
  ultimo_contacto_em  timestamptz not null default now(),
  inquilino_id        uuid references inquilinos(id) on delete set null,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),
  check (telefone is not null or email is not null),
  check (estado <> 'perdido' or motivo_perda is not null)
);
create index leads_funil on leads (estado, proxima_acao_em);
create index leads_email on leads (lower(email)) where email is not null;
create index leads_telefone on leads (telefone) where telefone is not null;

create table lead_eventos (
  id          bigint generated always as identity primary key,
  lead_id     uuid not null references leads(id) on delete cascade,
  tipo        text not null check (tipo in ('nota','chamada','mensagem','estado','proposta','contrato','sistema')),
  texto       text,
  detalhes    jsonb,
  criado_por  uuid references auth.users(id) on delete set null,
  criado_em   timestamptz not null default now()
);
create index lead_eventos_lead on lead_eventos (lead_id, criado_em desc);

-- O briefing é um por lead; os campos estão descritos na N.4 e validados com Zod.
create table briefings (
  lead_id        uuid primary key references leads(id) on delete cascade,
  dados          jsonb not null default '{}',
  atualizado_por uuid references auth.users(id) on delete set null,
  atualizado_em  timestamptz not null default now()
);

-- Texto jurídico e condições comerciais, versionados. Um modelo só serve para
-- gerar documentos depois de aprovado: o texto é revisto por um jurista (N.8).
create table modelos_documento (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('contrato','condicoes_proposta')),
  versao        integer not null check (versao >= 1),
  estado        text not null default 'rascunho' check (estado in ('rascunho','aprovado','arquivado')),
  titulo        text not null,
  corpo         text not null,                    -- Markdown com {{marcadores}}
  aprovado_por  uuid references auth.users(id) on delete set null,
  aprovado_em   timestamptz,
  criado_em     timestamptz not null default now(),
  unique (tipo, versao),
  check (estado <> 'aprovado' or (aprovado_por is not null and aprovado_em is not null))
);

-- Numeração própria dos documentos comerciais (PRP-2026-0001, CTR-2026-0001).
-- Não é numeração fiscal.
create table numeracao_comercial (
  serie   text not null check (serie in ('PRP','CTR')),
  ano     integer not null,
  ultimo  integer not null default 0,
  primary key (serie, ano)
);

create table propostas (
  id                      uuid primary key default gen_random_uuid(),
  lead_id                 uuid not null references leads(id) on delete cascade,
  numero                  text not null unique,
  versao                  integer not null check (versao >= 1),
  estado                  text not null default 'rascunho'
                          check (estado in ('rascunho','enviada','aceite','recusada','substituida')),
  plano                   text not null check (plano in ('basic','pro')),
  periodicidade           text not null default 'mensal' check (periodicidade in ('mensal','anual')),
  profissionais           integer not null check (profissionais >= 1),
  dominio_proprio         boolean not null default false,
  desafio_90              boolean not null default false,
  -- valores calculados por lib/regras/mensalidade.ts (D.7); aqui só se guardam e se conferem
  mensalidade_sem_iva     numeric(10,2) not null check (mensalidade_sem_iva > 0),
  valor_periodo_sem_iva   numeric(10,2) not null check (valor_periodo_sem_iva > 0),
  valor_periodo_com_iva   numeric(10,2) not null check (valor_periodo_com_iva > 0),
  iva_taxa                numeric(4,2) not null default 23 check (iva_taxa in (0, 23)),  -- 0 = Prestadora isenta (art. 53.º do CIVA); o preço final ao cliente é o mesmo
  condicoes_lancamento    text,
  validade_dias           integer not null default 15 check (validade_dias between 1 and 90),
  valida_ate              date,
  dados                   jsonb not null default '{}',   -- fotografia completa do que foi proposto
  pdf_path                text,
  enviada_em              timestamptz,
  decidida_em             timestamptz,
  motivo_recusa           text,
  criado_por              uuid references auth.users(id) on delete set null,
  criado_em               timestamptz not null default now(),
  unique (lead_id, versao),
  check (plano = 'pro' or profissionais = 1),
  check (plano = 'basic' or profissionais >= 2),
  check (not desafio_90 or plano = 'pro'),
  check (valor_periodo_com_iva = round(valor_periodo_sem_iva * (1 + iva_taxa / 100), 2)),
  check (estado <> 'recusada' or motivo_recusa is not null)
);
create index propostas_lead on propostas (lead_id, versao desc);

create table contratos (
  id                  uuid primary key default gen_random_uuid(),
  proposta_id         uuid not null references propostas(id) on delete no action,
  lead_id             uuid not null references leads(id) on delete no action,
  modelo_id           uuid not null references modelos_documento(id) on delete no action,
  numero              text not null unique,
  estado              text not null default 'rascunho'
                      check (estado in ('rascunho','enviado','assinado','terminado','cancelado')),
  dados               jsonb not null,             -- contratante: razao_social, nif, morada, representante, cargo
  texto               text not null check (length(trim(texto)) > 0),   -- texto final, fotografado na geração
  pdf_path            text,
  pdf_assinado_path   text,
  assinado_em         date,
  data_inicio         date,
  inquilino_id        uuid references inquilinos(id) on delete set null,
  criado_por          uuid references auth.users(id) on delete set null,
  criado_em           timestamptz not null default now(),
  check (estado not in ('assinado','terminado') or (pdf_assinado_path is not null and assinado_em is not null))
);
create unique index contratos_um_ativo on contratos (proposta_id) where estado in ('rascunho','enviado','assinado');
create index contratos_lead on contratos (lead_id);

-- Convite para o formulário de adesão, já preenchido com os dados do contrato (D.12).
-- Guarda-se só o hash do código; o código vai na ligação e usa-se uma vez.
create table convites_adesao (
  id           uuid primary key default gen_random_uuid(),
  contrato_id  uuid not null references contratos(id) on delete cascade,
  token_hash   text not null unique,
  dados        jsonb not null,
  expira_em    timestamptz not null,
  usado_em     timestamptz,
  criado_em    timestamptz not null default now()
);

alter table pedidos_adesao add column contrato_id uuid references contratos(id) on delete set null;

-- Estado efetivo da proposta: uma proposta enviada passa a expirada ao fim da validade,
-- sem tarefa agendada (D-16).
create view propostas_com_estado with (security_invoker = true) as
  select p.*,
         case when p.estado = 'enviada' and p.valida_ate < (now() at time zone 'Europe/Lisbon')::date
              then 'expirada' else p.estado end as estado_efetivo
    from propostas p;

-- -----------------------------------------------------------------------------
-- 18 · Finanças da Performa LAB (Parte O)
--      Só o super_admin com dois fatores. Valores sem IVA, em euros, registados à mão.
--      A plataforma regista; não cobra nem emite documentos fiscais.
-- -----------------------------------------------------------------------------
create table custos_plataforma (
  id             uuid primary key default gen_random_uuid(),
  descricao      text not null check (length(trim(descricao)) > 0),
  categoria      text not null check (categoria in ('infraestrutura','dominios','ferramentas','contabilidade','marketing','outros')),
  tipo           text not null default 'fixo' check (tipo in ('fixo','variavel')),
  valor_sem_iva  numeric(10,2) not null check (valor_sem_iva >= 0),
  periodicidade  text not null default 'mensal' check (periodicidade in ('mensal','anual','unico')),
  data_inicio    date not null,
  data_fim       date,
  ativo          boolean not null default true,
  nota           text,
  criado_em      timestamptz not null default now(),
  check (data_fim is null or data_fim >= data_inicio)
);

create table contas_pagar (
  id             uuid primary key default gen_random_uuid(),
  custo_id       uuid references custos_plataforma(id) on delete set null,
  fornecedor     text not null check (length(trim(fornecedor)) > 0),
  descricao      text,
  valor_sem_iva  numeric(10,2) not null check (valor_sem_iva >= 0),
  valor_com_iva  numeric(10,2) not null,
  vencimento     date not null,
  pago_em        date,
  nota           text,
  criado_em      timestamptz not null default now(),
  check (valor_com_iva >= valor_sem_iva)
);
create index contas_pagar_abertas on contas_pagar (vencimento) where pago_em is null;

-- Objetivo de faturação por mês. A conta «quantos clientes faltam» é de lib/regras/previsao.ts.
create table metas_faturacao (
  id             uuid primary key default gen_random_uuid(),
  mes            date not null unique check (extract(day from mes) = 1),
  valor_sem_iva  numeric(10,2) not null check (valor_sem_iva > 0),
  base           text not null default 'mrr' check (base in ('mrr','recebido')),
  nota           text,
  criado_em      timestamptz not null default now()
);

-- Lembretes de vencimento aos inquilinos (mesmo modelo dos lembretes da barbearia).
-- WhatsApp: o sistema prepara, o operador abre a conversa e confirma à mão.
-- E-mail: enviado pelo servidor (Resend) quando o operador carrega no botão; 'enviado' e 'falhou' só aqui.
create table lembretes_vencimento (
  id            uuid primary key default gen_random_uuid(),
  inquilino_id  uuid not null references inquilinos(id) on delete cascade,
  fatura_id     uuid references faturas_plataforma(id) on delete set null,
  vencimento    date not null,
  canal         text not null check (canal in ('whatsapp','email')),
  conteudo      text not null check (length(trim(conteudo)) > 0),
  estado        text not null default 'preparada'
                check (estado in ('preparada','ligacao_aberta','envio_confirmado_manualmente','enviado','falhou','cancelada')),
  aberta_em     timestamptz,
  criado_por    uuid references auth.users(id) on delete set null,
  criado_em     timestamptz not null default now(),
  check (canal = 'email' or estado not in ('enviado','falhou')),
  check (canal = 'whatsapp' or estado not in ('ligacao_aberta','envio_confirmado_manualmente'))
);
create index lembretes_vencimento_inquilino on lembretes_vencimento (inquilino_id, criado_em desc);

-- Conta com estado efetivo, sem tarefa agendada (D-16).
create view contas_pagar_com_estado with (security_invoker = true) as
  select c.*,
         case when c.pago_em is not null then 'paga'
              when c.vencimento < (now() at time zone 'Europe/Lisbon')::date then 'atrasada'
              else 'pendente' end as estado_efetivo
    from contas_pagar c;
-- A vista vencimentos_proximos está em 02_funcoes.sql (secção 8C), porque usa e_super_admin().
