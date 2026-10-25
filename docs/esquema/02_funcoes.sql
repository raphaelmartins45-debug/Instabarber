-- =============================================================================
-- InstaBarber · Esquema da base de dados · versão 10.1
-- Ficheiro 02 de 04 — funções, gatilhos e vistas.
--
-- Princípio (F.7): as regras que decidem o que se grava — vaga válida, preço
-- com desconto, comissão, selos — vivem aqui, em funções SQL testadas. A base
-- de dados é a autoridade final; o TypeScript chama-as e mostra o resultado.
-- Regras de apresentação e de relatório vivem em lib/regras.
--
-- Todas as funções SECURITY DEFINER têm search_path vazio e nomes qualificados.
-- No fim do ficheiro, a execução é retirada a todos e dada só a quem precisa.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1 · Quem é quem (usadas pelas políticas RLS)
-- -----------------------------------------------------------------------------

-- Super administrador da Performa LAB, com sessão de dois fatores (aal2).
create or replace function public.e_super_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis
                 where user_id = auth.uid() and papel in ('super_admin','gestor_plataforma') and ativo)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- Inquilinos onde o utilizador tem um dos papéis pedidos.
-- Por omissão, só barbearias ativas: uma barbearia suspensa perde o acesso aos dados.
create or replace function public.inquilinos_onde(p_papeis text[], p_so_ativos boolean default true)
returns setof uuid
language sql stable security definer set search_path = '' as $$
  select p.inquilino_id
    from public.perfis p
    join public.inquilinos i on i.id = p.inquilino_id
   where p.user_id = auth.uid() and p.ativo and p.papel = any (p_papeis)
     and (not p_so_ativos or i.estado = 'ativo')
$$;

-- Os registos de profissional do utilizador (um por barbearia onde trabalha).
create or replace function public.meus_profissionais() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select pr.id
    from public.profissionais pr
    join public.perfis p on p.id = pr.perfil_id
    join public.inquilinos i on i.id = pr.inquilino_id
   where p.user_id = auth.uid() and p.ativo and pr.ativo
     and p.papel = 'profissional' and i.estado = 'ativo'
$$;

-- As fichas de cliente ligadas à conta do utilizador (cliente final).
create or replace function public.meus_clientes() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select c.id from public.clientes c
    join public.inquilinos i on i.id = c.inquilino_id
   where c.auth_user_id = auth.uid() and i.estado = 'ativo'
$$;

-- Clientes que um profissional pode ver: os que marcaram ou foram atendidos com
-- ele, e os que ele próprio registou ao balcão.
create or replace function public.clientes_do_profissional() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select m.cliente_id from public.marcacoes m
   where m.profissional_id in (select public.meus_profissionais()) and m.cliente_id is not null
  union
  select c.id from public.clientes c
   where c.criado_por = auth.uid()
     and c.inquilino_id in (select pr.inquilino_id from public.profissionais pr
                             where pr.id in (select public.meus_profissionais()))
$$;

create or replace function public.funcionalidade_ativa(p_inquilino uuid, p_chave text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select ativa from public.inquilino_funcionalidades
                    where inquilino_id = p_inquilino and chave = p_chave), false)
$$;

create or replace function public.modulo_ativo(p_inquilino uuid, p_chave text) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select ativo from public.modulos_plataforma where chave = p_chave), false)
     and coalesce((select ativo from public.inquilino_modulos
                    where inquilino_id = p_inquilino and chave = p_chave), false)
$$;

-- Sessões de sistema (migrações, chave de serviço, funções desta base).
create or replace function public.e_sistema() returns boolean
language sql stable as $$
  select current_user in ('postgres','service_role','supabase_admin')
$$;

create or replace function public.campos_alterados(p_antes jsonb, p_depois jsonb) returns text[]
language sql immutable as $$
  select coalesce(array_agg(k), '{}') from jsonb_object_keys(p_depois) k
   where p_antes -> k is distinct from p_depois -> k
$$;

-- -----------------------------------------------------------------------------
-- 2 · Auditoria
-- -----------------------------------------------------------------------------
create or replace function public.registar_auditoria(
  p_inquilino uuid, p_accao text, p_entidade text, p_entidade_id uuid, p_detalhes jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.auditoria (inquilino_id, user_id, accao, entidade, entidade_id, detalhes)
  values (p_inquilino, auth.uid(), p_accao, p_entidade, p_entidade_id, p_detalhes);
end $$;

-- Ações do InstaBarber Admin que ficam em auditoria (aprovação, vista de apoio, importação,
-- exportação, eliminação). Só o super_admin com dois fatores; o autor é sempre auth.uid().
create or replace function public.registar_auditoria_admin(
  p_inquilino uuid, p_accao text, p_entidade text, p_entidade_id uuid, p_detalhes jsonb)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if p_accao !~ '^[a-z_]{3,60}$' then raise exception 'accao_invalida' using errcode = 'P0001'; end if;
  perform public.registar_auditoria(p_inquilino, p_accao, p_entidade, p_entidade_id, p_detalhes);
end $$;

-- -----------------------------------------------------------------------------
-- 3 · Gatilhos de proteção
-- -----------------------------------------------------------------------------

-- Campos do inquilino que só a Performa LAB altera (B2, D.3).
create or replace function public.proteger_inquilino() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
  v_protegidos text[] := array['slug','vertical','plano','periodicidade','profissionais_contratados',
                               'estado','estado_pagamento','proximo_vencimento','dominio_proprio',
                               'aprovado_em','criado_em','desconto_mensalidade_pct'];
begin
  if v_mudou && v_protegidos and not (public.e_super_admin() or public.e_sistema()) then
    raise exception 'campo_protegido' using errcode = '42501',
      detail = array_to_string(array(select unnest(v_mudou) intersect select unnest(v_protegidos)), ',');
  end if;
  return new;
end $$;
create trigger inquilinos_proteger before update on inquilinos
  for each row execute function public.proteger_inquilino();

-- Regista em auditoria as alterações aos campos protegidos (plano, estado…).
create or replace function public.auditar_inquilino() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
begin
  if v_mudou && array['plano','periodicidade','profissionais_contratados','estado','estado_pagamento',
                      'proximo_vencimento','dominio_proprio','slug','desconto_mensalidade_pct'] then
    perform public.registar_auditoria(new.id, 'inquilino_alterado', 'inquilinos', new.id,
      jsonb_build_object('campos', to_jsonb(v_mudou)));
  end if;
  return new;
end $$;
create trigger inquilinos_auditar after update on inquilinos
  for each row execute function public.auditar_inquilino();

-- O barbeiro altera na sua ficha só o nome apresentado, a fotografia e o portfólio (E.3.1).
-- Comissão, modelo de caixa e renda são do gestor: quem tem interesse na conta não a muda (B3).
create or replace function public.proteger_profissional() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_mudou text[] := public.campos_alterados(to_jsonb(old), to_jsonb(new));
begin
  if public.e_super_admin() or public.e_sistema()
     or new.inquilino_id in (select public.inquilinos_onde(array['proprietario'])) then
    if new.ativo is false and old.ativo is true then new.desativado_em := now(); end if;
    return new;
  end if;
  if not (v_mudou <@ array['nome_apresentado','foto_url','portfolio_visivel']) then
    raise exception 'campo_protegido' using errcode = '42501', detail = array_to_string(v_mudou, ',');
  end if;
  return new;
end $$;
create trigger profissionais_proteger before update on profissionais
  for each row execute function public.proteger_profissional();

-- Número de profissionais ativos nunca passa o contratado (Basic = 1).
create or replace function public.limitar_profissionais() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_limite integer; v_ativos integer;
begin
  if new.ativo then
    select profissionais_contratados into v_limite from public.inquilinos where id = new.inquilino_id;
    select count(*) into v_ativos from public.profissionais
     where inquilino_id = new.inquilino_id and ativo and id <> new.id;
    if v_ativos + 1 > v_limite then
      raise exception 'limite_profissionais' using errcode = 'P0001',
        detail = format('contratados: %s', v_limite);
    end if;
  end if;
  return new;
end $$;
create trigger profissionais_limite before insert or update of ativo on profissionais
  for each row execute function public.limitar_profissionais();

-- Baixar os profissionais contratados exige desativar antes os que passam do novo número (J.2).
create or replace function public.validar_contratados() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.profissionais_contratados < (select count(*) from public.profissionais
                                       where inquilino_id = new.id and ativo) then
    raise exception 'limite_profissionais' using errcode = 'P0001',
      detail = 'desative primeiro os profissionais que passam do novo número';
  end if;
  return new;
end $$;
create trigger inquilinos_contratados before update of profissionais_contratados on inquilinos
  for each row execute function public.validar_contratados();

-- Profissional desativado: as marcações futuras ficam sem profissional (órfãs) para o gestor reatribuir.
create or replace function public.orfas_ao_desativar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.ativo and not new.ativo then
    update public.marcacoes set profissional_id = null
     where profissional_id = new.id and estado in ('reservada','agendada') and inicio > now();
  end if;
  return new;
end $$;
create trigger profissionais_orfas after update of ativo on profissionais
  for each row execute function public.orfas_ao_desativar();

-- Só as funcionalidades e os módulos: qualquer alteração fica em auditoria.
create or replace function public.auditar_interruptor() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.registar_auditoria(new.inquilino_id, tg_table_name || '_' || lower(tg_op), tg_table_name, null,
    jsonb_build_object('chave', new.chave, 'antes', case when tg_op = 'UPDATE' then to_jsonb(old) end, 'depois', to_jsonb(new)));
  return new;
end $$;
create trigger inquilino_funcionalidades_auditar after insert or update on inquilino_funcionalidades
  for each row execute function public.auditar_interruptor();
create trigger inquilino_modulos_auditar after insert or update on inquilino_modulos
  for each row execute function public.auditar_interruptor();

-- Até seis fotografias de portfólio por barbeiro.
create or replace function public.limitar_portfolio() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.portfolio_fotos where profissional_id = new.profissional_id) >= 6 then
    raise exception 'limite_portfolio' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger portfolio_limite before insert on portfolio_fotos
  for each row execute function public.limitar_portfolio();

-- Um acerto liquidado não se reescreve; corrige-se com um acerto de correção.
create or replace function public.proteger_acerto() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado = 'liquidado' then
    raise exception 'acerto_liquidado' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger acertos_proteger before update or delete on acertos
  for each row execute function public.proteger_acerto();

-- -----------------------------------------------------------------------------
-- 4 · Motor de agenda (F.7)
--     Tudo em hora de Lisboa. As datas guardam-se em UTC (timestamptz) e a
--     conversão faz-se só aqui, com 'Europe/Lisbon' — é isto que torna as
--     mudanças de hora (último domingo de março e de outubro) corretas.
-- -----------------------------------------------------------------------------

create or replace function public.hora_local(p timestamptz) returns timestamp
language sql immutable as $$ select p at time zone 'Europe/Lisbon' $$;

create or replace function public.instante_lisboa(p_dia date, p_hora time) returns timestamptz
language sql immutable as $$ select (p_dia + p_hora) at time zone 'Europe/Lisbon' $$;

-- Valida uma vaga. Devolve nulo se é válida, ou o código do motivo.
-- p_publico = verdadeiro aplica as regras da página pública (aberto, antecedência, janela).
create or replace function public.validar_vaga(
  p_inquilino uuid, p_profissional uuid, p_servico uuid, p_inicio timestamptz,
  p_publico boolean default true, p_ignorar uuid default null)
returns text
language plpgsql stable security definer set search_path = '' as $$
declare
  t public.inquilinos%rowtype;
  v_duracao integer;
  v_fim timestamptz;
  v_ini_l timestamp; v_fim_l timestamp;
  v_dia date; v_dow integer;
  v_tem_horario boolean;
begin
  select * into t from public.inquilinos where id = p_inquilino;
  if not found or t.estado <> 'ativo' then return 'barbearia_indisponivel'; end if;
  if p_publico and not t.aberto then return 'barbearia_fechada'; end if;

  select duracao_min into v_duracao from public.servicos
   where id = p_servico and inquilino_id = p_inquilino and ativo;
  if not found then return 'servico_invalido'; end if;

  if not exists (select 1 from public.profissionais
                  where id = p_profissional and inquilino_id = p_inquilino and ativo) then
    return 'profissional_invalido';
  end if;

  v_fim   := p_inicio + make_interval(mins => v_duracao);
  v_ini_l := public.hora_local(p_inicio);
  v_fim_l := public.hora_local(v_fim);
  v_dia   := v_ini_l::date;
  v_dow   := extract(dow from v_ini_l)::integer;

  if p_publico then
    if p_inicio < now() + make_interval(mins => t.antecedencia_minima_min) then return 'antecedencia'; end if;
    if v_dia > (public.hora_local(now())::date + t.janela_marcacao_dias) then return 'fora_da_janela'; end if;
  end if;

  if v_fim_l::date <> v_dia and v_fim_l::time <> '00:00' then return 'fora_do_horario'; end if;

  if exists (select 1 from public.feriados f
              where f.data = v_dia
                and ((f.inquilino_id is null and t.fecha_feriados) or f.inquilino_id = p_inquilino)) then
    return 'feriado';
  end if;

  select exists (select 1 from public.horarios_profissional where profissional_id = p_profissional)
    into v_tem_horario;

  if v_tem_horario then
    -- Horário próprio: o serviço cabe inteiro numa das linhas desse dia.
    if not exists (select 1 from public.horarios_profissional h
                    where h.profissional_id = p_profissional and h.dia_semana = v_dow
                      and v_ini_l::time >= h.inicio and v_fim_l <= v_dia + h.fim) then
      return 'fora_do_horario';
    end if;
  else
    if v_dow = any (t.dias_descanso) then return 'dia_de_descanso'; end if;
    if v_ini_l::time < t.hora_abertura or v_fim_l > v_dia + t.hora_fecho then return 'fora_do_horario'; end if;
    if t.intervalo_almoco_inicio is not null
       and v_ini_l < v_dia + t.intervalo_almoco_fim and v_fim_l > v_dia + t.intervalo_almoco_inicio then
      return 'intervalo_almoco';
    end if;
  end if;

  if exists (select 1 from public.ausencias a
              where a.inquilino_id = p_inquilino
                and (a.profissional_id is null or a.profissional_id = p_profissional)
                and tstzrange(a.inicio, a.fim, '[)') && tstzrange(p_inicio, v_fim, '[)')) then
    return 'ausencia';
  end if;

  if exists (select 1 from public.marcacoes m
              where m.profissional_id = p_profissional
                and m.id is distinct from p_ignorar
                and (m.estado in ('agendada','concluida')
                     or (m.estado = 'reservada' and m.reservada_ate > now()))
                and m.periodo && tstzrange(p_inicio, v_fim + make_interval(mins => t.intervalo_marcacoes_min), '[)')) then
    return 'ocupado';
  end if;

  return null;
end $$;

-- Preço de uma marcação: valor de tabela e desconto de hora morta (F.4.7).
-- Dois períodos sobrepostos: vale o de maior percentagem; nunca se somam.
create or replace function public.calcular_preco(p_inquilino uuid, p_servico uuid, p_inicio timestamptz)
returns table (valor_tabela numeric, desconto_percent numeric, valor_cobrado numeric)
language plpgsql stable security definer set search_path = '' as $$
declare v_preco numeric; v_desc numeric := 0; v_l timestamp := public.hora_local(p_inicio);
begin
  select s.preco into v_preco from public.servicos s where s.id = p_servico and s.inquilino_id = p_inquilino;
  if not found then raise exception 'servico_invalido' using errcode = 'P0001'; end if;
  if public.funcionalidade_ativa(p_inquilino, 'precos_dinamicos') then
    select coalesce(max(pd.percentagem), 0) into v_desc from public.periodos_desconto pd
     where pd.inquilino_id = p_inquilino and pd.ativo
       and pd.dia_semana = extract(dow from v_l)
       and v_l::time >= pd.hora_inicio and v_l::time < pd.hora_fim;
  end if;
  return query select v_preco, v_desc, round(v_preco * (1 - v_desc / 100), 2);
end $$;

-- Vagas livres de um dia, para a página pública e para o painel.
-- Com p_profissional nulo, devolve as vagas de todos ("Sem preferência").
create or replace function public.vagas_livres(
  p_inquilino uuid, p_servico uuid, p_dia date, p_profissional uuid default null, p_publico boolean default true)
returns table (profissional_id uuid, inicio timestamptz, valor_tabela numeric, desconto_percent numeric, valor_cobrado numeric)
language plpgsql stable security definer set search_path = '' as $$
declare t public.inquilinos%rowtype;
begin
  select * into t from public.inquilinos where id = p_inquilino;
  if not found then return; end if;
  return query
    -- Grelha em hora local a partir da meia-noite de Lisboa: nos dias de mudança
    -- de hora as vagas continuam às 09:00, 09:30… e não deslizam uma hora.
    with grelha as (
      select pr.id as prof, public.instante_lisboa(p_dia, time '00:00' + make_interval(mins => m)) as ini
        from public.profissionais pr
        cross join generate_series(0, 24 * 60 - t.granularidade_min, t.granularidade_min) as m
       where pr.inquilino_id = p_inquilino and pr.ativo
         and (p_profissional is null or pr.id = p_profissional)
    )
    select g.prof, g.ini, p.valor_tabela, p.desconto_percent, p.valor_cobrado
      from grelha g
      cross join lateral public.calcular_preco(p_inquilino, p_servico, g.ini) p
     where public.hora_local(g.ini)::date = p_dia
       and public.validar_vaga(p_inquilino, g.prof, p_servico, g.ini, p_publico) is null
     order by g.ini, g.prof;
end $$;

-- Prepara as colunas calculadas e valida qualquer marcação, venha de onde vier.
create or replace function public.marcacoes_antes_gravar() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_dur integer; v_int integer; v_motivo text; v_preco record;
begin
  if tg_op = 'INSERT' or new.inicio is distinct from old.inicio or new.servico_id is distinct from old.servico_id then
    select s.duracao_min into v_dur from public.servicos s
     where s.id = new.servico_id and s.inquilino_id = new.inquilino_id;
    select i.intervalo_marcacoes_min into v_int from public.inquilinos i where i.id = new.inquilino_id;
    new.fim := new.inicio + make_interval(mins => v_dur);
    new.fim_bloqueio := new.fim + make_interval(mins => v_int);
  end if;

  if tg_op = 'INSERT' and new.valor_tabela is null then
    select * into v_preco from public.calcular_preco(new.inquilino_id, new.servico_id, new.inicio);
    new.valor_tabela := v_preco.valor_tabela;
    new.desconto_percent := v_preco.desconto_percent;
    new.valor_cobrado := coalesce(new.valor_cobrado, v_preco.valor_cobrado);
  end if;

  if new.estado in ('reservada','agendada') and new.profissional_id is not null
     and (tg_op = 'INSERT'
          or new.inicio is distinct from old.inicio
          or new.profissional_id is distinct from old.profissional_id
          or new.servico_id is distinct from old.servico_id
          or old.estado not in ('reservada','agendada')) then
    -- Liberta reservas de 10 minutos que já expiraram para este profissional.
    update public.marcacoes set estado = 'cancelada', reservada_ate = null, token_reserva_hash = null,
           cancelada_em = now(), motivo_cancelamento = 'reserva_expirada'
     where profissional_id = new.profissional_id and estado = 'reservada' and reservada_ate <= now()
       and id is distinct from new.id;
    v_motivo := public.validar_vaga(new.inquilino_id, new.profissional_id, new.servico_id, new.inicio,
                                    new.origem = 'online', new.id);
    if v_motivo is not null then
      raise exception '%', v_motivo using errcode = 'P0001';
    end if;
  end if;

  if new.estado = 'cancelada' and old.estado is distinct from 'cancelada' then
    new.cancelada_em := coalesce(new.cancelada_em, now());
    new.cancelada_por := coalesce(new.cancelada_por, auth.uid());
  end if;
  return new;
end $$;
create trigger marcacoes_validar before insert or update on marcacoes
  for each row execute function public.marcacoes_antes_gravar();

-- Encontra ou cria o cliente pelo telefone, sem nunca reescrever dados já existentes.
create or replace function public.cliente_por_telefone(
  p_inquilino uuid, p_nome text, p_telefone text, p_origem text,
  p_email text default null, p_data_nascimento date default null, p_consentimento boolean default false)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  select id into v_id from public.clientes where inquilino_id = p_inquilino and telefone = p_telefone;
  if v_id is null then
    insert into public.clientes (inquilino_id, nome, telefone, email, data_nascimento, origem,
                                 consentimento_mensagens, consentimento_em)
    values (p_inquilino, trim(p_nome), p_telefone, nullif(trim(p_email), ''), p_data_nascimento, p_origem,
            coalesce(p_consentimento, false), case when p_consentimento then now() end)
    returning id into v_id;
  else
    update public.clientes
       set email = coalesce(email, nullif(trim(p_email), '')),
           data_nascimento = coalesce(data_nascimento, p_data_nascimento),
           consentimento_mensagens = consentimento_mensagens or coalesce(p_consentimento, false),
           consentimento_em = case when not consentimento_mensagens and p_consentimento then now() else consentimento_em end
     where id = v_id;
  end if;
  return v_id;
end $$;

-- Política de faltas (F.8): bloqueia a marcação online a partir do limite.
create or replace function public.pode_marcar_online(p_cliente uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select case when i.limite_faltas = 0 or not public.funcionalidade_ativa(i.id, 'politica_faltas') then true
         else (select count(*) from public.marcacoes m
                where m.cliente_id = c.id and m.estado = 'falta'
                  and m.inicio > greatest(coalesce(c.faltas_perdoadas_em, '-infinity'), now() - interval '180 days')
              ) < i.limite_faltas end
    from public.clientes c join public.inquilinos i on i.id = c.inquilino_id
   where c.id = p_cliente
$$;

-- Passo 1 da marcação pública: prende a vaga por 10 minutos.
create or replace function public.reservar_vaga(
  p_inquilino uuid, p_servico uuid, p_inicio timestamptz, p_profissional uuid default null)
returns table (marcacao_id uuid, token text, reservada_ate timestamptz, profissional_id uuid,
               valor_tabela numeric, desconto_percent numeric, valor_cobrado numeric)
language plpgsql security definer set search_path = '' as $$
declare v_prof uuid := p_profissional; v_token text; v_id uuid; v_ate timestamptz; v_preco record;
begin
  if v_prof is null then
    -- "Sem preferência": quem tem menos marcações nesse dia, depois pela ordem da equipa.
    select pr.id into v_prof from public.profissionais pr
     where pr.inquilino_id = p_inquilino and pr.ativo
       and public.validar_vaga(p_inquilino, pr.id, p_servico, p_inicio, true) is null
     order by (select count(*) from public.marcacoes m
                where m.profissional_id = pr.id and m.estado in ('reservada','agendada','concluida')
                  and public.hora_local(m.inicio)::date = public.hora_local(p_inicio)::date),
              pr.ordem, pr.id
     limit 1;
    if v_prof is null then raise exception 'ocupado' using errcode = 'P0001'; end if;
  end if;

  select * into v_preco from public.calcular_preco(p_inquilino, p_servico, p_inicio);
  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  v_ate := now() + interval '10 minutes';
  begin
    insert into public.marcacoes (inquilino_id, profissional_id, servico_id, inicio, estado, reservada_ate,
                                  token_reserva_hash, origem, valor_tabela, desconto_percent, valor_cobrado)
    values (p_inquilino, v_prof, p_servico, p_inicio, 'reservada', v_ate,
            encode(sha256(convert_to(v_token, 'UTF8')), 'hex'), 'online',
            v_preco.valor_tabela, v_preco.desconto_percent, v_preco.valor_cobrado)
    returning id into v_id;
  exception when exclusion_violation then
    raise exception 'ocupado' using errcode = 'P0001';
  end;
  return query select v_id, v_token, v_ate, v_prof, v_preco.valor_tabela, v_preco.desconto_percent, v_preco.valor_cobrado;
end $$;

-- Passo 2: o cliente dá os dados e a vaga passa a marcação. Não exige conta (E.4).
create or replace function public.confirmar_reserva(
  p_marcacao uuid, p_token text, p_nome text, p_telefone text,
  p_email text default null, p_data_nascimento date default null,
  p_consentimento boolean default false, p_codigo_convite text default null)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare m public.marcacoes%rowtype; v_cliente uuid; v_novo boolean; v_convidou uuid;
begin
  select * into m from public.marcacoes
   where id = p_marcacao and estado = 'reservada'
     and token_reserva_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
   for update;
  if not found or m.reservada_ate <= now() then
    raise exception 'reserva_expirada' using errcode = 'P0001';
  end if;

  v_novo := not exists (select 1 from public.clientes where inquilino_id = m.inquilino_id and telefone = p_telefone);
  v_cliente := public.cliente_por_telefone(m.inquilino_id, p_nome, p_telefone, 'online',
                                           p_email, p_data_nascimento, p_consentimento);

  if not public.pode_marcar_online(v_cliente) then
    raise exception 'bloqueado_por_faltas' using errcode = 'P0001';
  end if;
  if (select count(*) from public.marcacoes x
       where x.cliente_id = v_cliente and x.estado = 'agendada' and x.inicio > now()) >= 3 then
    raise exception 'limite_marcacoes' using errcode = 'P0001';
  end if;

  if v_novo and p_codigo_convite is not null then
    select id into v_convidou from public.clientes
     where inquilino_id = m.inquilino_id and codigo_convite = upper(p_codigo_convite);
    if v_convidou is not null and v_convidou <> v_cliente then
      update public.clientes set convidado_por = v_convidou where id = v_cliente;
    end if;
  end if;

  update public.marcacoes
     set cliente_id = v_cliente, estado = 'agendada', reservada_ate = null, token_reserva_hash = null
   where id = m.id;
  return m.id;
end $$;

-- O cliente com conta cancela até à antecedência definida pela barbearia.
create or replace function public.cancelar_minha_marcacao(p_marcacao uuid, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare m public.marcacoes%rowtype; v_ant integer;
begin
  select * into m from public.marcacoes where id = p_marcacao
     and cliente_id in (select public.meus_clientes()) and estado = 'agendada' for update;
  if not found then raise exception 'marcacao_invalida' using errcode = 'P0001'; end if;
  select antecedencia_cancelamento_min into v_ant from public.inquilinos where id = m.inquilino_id;
  if m.inicio < now() + make_interval(mins => v_ant) then
    raise exception 'fora_do_prazo_cancelamento' using errcode = 'P0001';
  end if;
  update public.marcacoes set estado = 'cancelada', cancelada_em = now(), cancelada_por = auth.uid(),
         motivo_cancelamento = coalesce(p_motivo, 'cancelada_pelo_cliente')
   where id = m.id;
end $$;

-- Conclui um serviço: grava a visita com a fotografia dos valores, consome crédito
-- do clube ou o prémio, credita selos e o selo do convite. Uma só fórmula (F.4.8):
-- base da comissão = valor de tabela com crédito do clube; senão, o valor cobrado.
create or replace function public.concluir_marcacao(
  p_marcacao uuid, p_modo text default 'normal', p_valor_cobrado numeric default null)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  m public.marcacoes%rowtype; pr public.profissionais%rowtype; t public.inquilinos%rowtype;
  v_credito uuid; v_cobrado numeric; v_pct numeric; v_base numeric; v_visita uuid; v_saldo integer;
begin
  if p_modo not in ('normal','credito_clube','premio') then raise exception 'modo_invalido' using errcode = 'P0001'; end if;
  select * into m from public.marcacoes where id = p_marcacao for update;
  if not found or m.estado <> 'agendada' then raise exception 'marcacao_invalida' using errcode = 'P0001'; end if;
  if not (m.inquilino_id in (select public.inquilinos_onde(array['proprietario']))
          or m.profissional_id in (select public.meus_profissionais())) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if m.profissional_id is null then raise exception 'sem_profissional' using errcode = 'P0001'; end if;
  select * into pr from public.profissionais where id = m.profissional_id;
  select * into t from public.inquilinos where id = m.inquilino_id;

  v_cobrado := coalesce(p_valor_cobrado, m.valor_cobrado);

  if p_modo = 'credito_clube' then
    select cc.id into v_credito
      from public.creditos_clube cc
      join public.ciclos_clube ci on ci.id = cc.ciclo_id
      join public.subscricoes s on s.id = ci.subscricao_id
     where s.cliente_id = m.cliente_id and s.inquilino_id = m.inquilino_id
       and cc.servico_id = m.servico_id and cc.usados < cc.quantidade
       and public.hora_local(now())::date >= ci.inicio and public.hora_local(now())::date < ci.fim
       and ci.pago_em is not null
     order by ci.fim limit 1 for update of cc;
    if v_credito is null then raise exception 'sem_credito' using errcode = 'P0001'; end if;
    update public.creditos_clube set usados = usados + 1 where id = v_credito;
    v_cobrado := 0;
  elsif p_modo = 'premio' then
    if t.premio_ativo and m.servico_id is distinct from t.premio_servico_id then
      raise exception 'servico_nao_e_premio' using errcode = 'P0001';
    end if;
    select coalesce(sum(quantidade), 0) into v_saldo from public.movimentos_selos where cliente_id = m.cliente_id;
    if v_saldo < t.selos_necessarios then raise exception 'selos_insuficientes' using errcode = 'P0001'; end if;
    v_cobrado := 0;
  end if;

  v_pct := coalesce((select cs.percentagem from public.comissoes_servico cs
                      where cs.profissional_id = pr.id and cs.servico_id = m.servico_id), pr.comissao_percent);
  v_base := case when v_credito is not null then m.valor_tabela else v_cobrado end;

  update public.marcacoes set estado = 'concluida', concluida_em = now(), valor_cobrado = v_cobrado,
         credito_id = v_credito
   where id = m.id;

  insert into public.visitas (inquilino_id, marcacao_id, cliente_id, profissional_id, servico_id, data,
                              valor_tabela, valor_cobrado, base_comissao, comissao_percent, comissao_valor,
                              modelo_caixa, emitente)
  values (m.inquilino_id, m.id, m.cliente_id, pr.id, m.servico_id, m.inicio,
          m.valor_tabela, v_cobrado, v_base, v_pct, round(v_base * v_pct / 100, 2),
          pr.modelo_caixa, case pr.modelo_caixa when 'A' then 'barbearia' else 'profissional' end)
  returning id into v_visita;

  if p_modo = 'premio' then
    insert into public.movimentos_selos (inquilino_id, cliente_id, tipo, quantidade, visita_id, servico_id, valor_tabela, criado_por)
    values (m.inquilino_id, m.cliente_id, 'resgate', -t.selos_necessarios, v_visita, m.servico_id, m.valor_tabela, auth.uid());
  elsif public.funcionalidade_ativa(m.inquilino_id, 'fidelizacao_selos') then
    insert into public.movimentos_selos (inquilino_id, cliente_id, tipo, quantidade, visita_id, criado_por)
    values (m.inquilino_id, m.cliente_id, 'visita', 1, v_visita, auth.uid());
    -- Convite: o primeiro serviço do convidado dá um selo a quem convidou, uma só vez.
    if (select count(*) from public.visitas where cliente_id = m.cliente_id) = 1 then
      insert into public.movimentos_selos (inquilino_id, cliente_id, tipo, quantidade, visita_id)
      select m.inquilino_id, c.convidado_por, 'convite', 1, v_visita
        from public.clientes c where c.id = m.cliente_id and c.convidado_por is not null;
    end if;
  end if;
  return v_visita;
end $$;

create or replace function public.marcar_falta(p_marcacao uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare m public.marcacoes%rowtype;
begin
  select * into m from public.marcacoes where id = p_marcacao for update;
  if not found or m.estado <> 'agendada' then raise exception 'marcacao_invalida' using errcode = 'P0001'; end if;
  if not (m.inquilino_id in (select public.inquilinos_onde(array['proprietario']))
          or m.profissional_id in (select public.meus_profissionais())) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if m.inicio > now() then raise exception 'ainda_nao_comecou' using errcode = 'P0001'; end if;
  update public.marcacoes set estado = 'falta' where id = m.id;
end $$;

-- -----------------------------------------------------------------------------
-- 5 · Entradas públicas (sem conta)
-- -----------------------------------------------------------------------------

create or replace function public.entrar_fila_espera(
  p_inquilino uuid, p_servico uuid, p_dia date, p_nome text, p_telefone text, p_consentimento boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_cliente uuid; v_id uuid;
begin
  if not public.funcionalidade_ativa(p_inquilino, 'fila_espera') then raise exception 'indisponivel' using errcode = 'P0001'; end if;
  if p_dia < public.hora_local(now())::date then raise exception 'dia_invalido' using errcode = 'P0001'; end if;
  v_cliente := public.cliente_por_telefone(p_inquilino, p_nome, p_telefone, 'fila', null, null, p_consentimento);
  select id into v_id from public.fila_espera
   where cliente_id = v_cliente and servico_id = p_servico and dia = p_dia and estado in ('aguarda','avisado');
  if v_id is null then
    insert into public.fila_espera (inquilino_id, cliente_id, servico_id, dia)
    values (p_inquilino, v_cliente, p_servico, p_dia) returning id into v_id;
  end if;
  return v_id;
end $$;

create or replace function public.entrar_fila_presencial(
  p_inquilino uuid, p_nome text, p_telefone text, p_servico uuid default null, p_consentimento boolean default false)
returns table (entrada_id uuid, posicao integer)
language plpgsql security definer set search_path = '' as $$
declare v_cliente uuid; v_id uuid; v_dia date := public.hora_local(now())::date;
begin
  if not public.funcionalidade_ativa(p_inquilino, 'qr_entrada') then raise exception 'indisponivel' using errcode = 'P0001'; end if;
  v_cliente := public.cliente_por_telefone(p_inquilino, p_nome, p_telefone, 'qr', null, null, p_consentimento);
  select id into v_id from public.fila_presencial
   where cliente_id = v_cliente and dia = v_dia and estado in ('aguarda','em_atendimento');
  if v_id is null then
    insert into public.fila_presencial (inquilino_id, cliente_id, servico_id, dia)
    values (p_inquilino, v_cliente, p_servico, v_dia) returning id into v_id;
  end if;
  return query
    select v_id, (select count(*)::integer from public.fila_presencial f
                   where f.inquilino_id = p_inquilino and f.dia = v_dia and f.estado = 'aguarda'
                     and f.entrou_em <= (select entrou_em from public.fila_presencial where id = v_id));
end $$;

-- Encomenda na loja: o total calcula-se aqui, com os preços em vigor.
create or replace function public.criar_pedido_loja(
  p_inquilino uuid, p_nome text, p_telefone text, p_linhas jsonb, p_consentimento boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_cliente uuid; v_pedido uuid; v_total numeric := 0; l record; p public.produtos%rowtype;
begin
  if not public.funcionalidade_ativa(p_inquilino, 'loja_produtos') then raise exception 'indisponivel' using errcode = 'P0001'; end if;
  if jsonb_typeof(p_linhas) <> 'array' or jsonb_array_length(p_linhas) = 0 then raise exception 'pedido_vazio' using errcode = 'P0001'; end if;
  v_cliente := public.cliente_por_telefone(p_inquilino, p_nome, p_telefone, 'loja', null, null, p_consentimento);
  insert into public.pedidos_loja (inquilino_id, cliente_id, total) values (p_inquilino, v_cliente, 0) returning id into v_pedido;
  for l in select (e ->> 'produto_id')::uuid as produto_id, (e ->> 'quantidade')::integer as quantidade
             from jsonb_array_elements(p_linhas) e loop
    select * into p from public.produtos where id = l.produto_id and inquilino_id = p_inquilino and ativo;
    if not found then raise exception 'produto_invalido' using errcode = 'P0001'; end if;
    if l.quantidade is null or l.quantidade < 1 or l.quantidade > p.stock then
      raise exception 'stock_insuficiente' using errcode = 'P0001';
    end if;
    insert into public.pedido_linhas (inquilino_id, pedido_id, produto_id, quantidade, preco_unitario, custo_unitario, iva_percent)
    values (p_inquilino, v_pedido, p.id, l.quantidade, p.preco_venda, p.custo, p.iva_percent);
    v_total := v_total + p.preco_venda * l.quantidade;
  end loop;
  update public.pedidos_loja set total = v_total where id = v_pedido;
  return v_pedido;
end $$;

-- Levantar: só aqui o stock desconta, e o custo e o IVA ficam regravados (F.4.4).
create or replace function public.levantar_pedido(p_pedido uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare pe public.pedidos_loja%rowtype; l record;
begin
  select * into pe from public.pedidos_loja where id = p_pedido for update;
  if not found or pe.estado not in ('novo','pronto') then raise exception 'pedido_invalido' using errcode = 'P0001'; end if;
  if pe.inquilino_id not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  for l in select pl.id, pl.produto_id, pl.quantidade from public.pedido_linhas pl where pl.pedido_id = pe.id loop
    update public.produtos set stock = stock - l.quantidade where id = l.produto_id and stock >= l.quantidade;
    if not found then raise exception 'stock_insuficiente' using errcode = 'P0001'; end if;
    update public.pedido_linhas pl set custo_unitario = p.custo, iva_percent = p.iva_percent
      from public.produtos p where p.id = l.produto_id and pl.id = l.id;
  end loop;
  update public.pedidos_loja set estado = 'levantado', levantado_em = now() where id = pe.id;
end $$;

-- Código de convite pessoal (F.4.5): seis caracteres, gerado no primeiro acesso à área de
-- cliente. Só o próprio cliente o pede; o cliente não altera a sua ficha diretamente (D-125).
create or replace function public.meu_codigo_convite(p_inquilino uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare c public.clientes%rowtype; v_codigo text; v_alfabeto text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  select * into c from public.clientes
   where inquilino_id = p_inquilino and auth_user_id = auth.uid() and anonimizado_em is null for update;
  if not found then raise exception 'sem_permissao' using errcode = '42501'; end if;
  if c.codigo_convite is not null then return c.codigo_convite; end if;
  loop
    select string_agg(substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::integer, 1), '')
      into v_codigo from generate_series(1, 6);
    exit when not exists (select 1 from public.clientes where codigo_convite = v_codigo);
  end loop;
  update public.clientes set codigo_convite = v_codigo where id = c.id;
  return v_codigo;
end $$;

-- O cartão de selos do próprio cliente (E.4): saldo, selos necessários e o nome do prémio
-- quando ativo. A página pública não mostra a fidelização; só a área de cliente (D-125).
create or replace function public.meu_cartao_selos(p_inquilino uuid)
returns table (selos integer, necessarios integer, premio text)
language sql stable security definer set search_path = '' as $$
  select coalesce((select sum(m.quantidade)::integer from public.movimentos_selos m where m.cliente_id = c.id), 0),
         i.selos_necessarios,
         case when i.premio_ativo then (select s.nome from public.servicos s where s.id = i.premio_servico_id) end
    from public.clientes c join public.inquilinos i on i.id = c.inquilino_id
   where c.inquilino_id = p_inquilino and c.auth_user_id = auth.uid()
     and public.funcionalidade_ativa(p_inquilino, 'fidelizacao_selos')
$$;

-- Clube de assinatura (F.4.2): cada ciclo nasce por pagar, com os créditos do plano (e, se o
-- plano transita crédito, o que ficou por usar no ciclo anterior). A renovação é no mesmo dia do
-- mês da inscrição (29 a 31 passa ao último dia do mês). Sem tarefas agendadas (D-26): renova-se
-- quando o gestor abre o clube ou carrega em «Renovar ciclo» (D-122).
create or replace function public.abrir_ciclo_clube(p_subscricao uuid, p_inicio date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare s public.subscricoes%rowtype; c public.clubes%rowtype; v_ciclo uuid; v_anterior uuid;
begin
  select * into s from public.subscricoes where id = p_subscricao;
  select * into c from public.clubes where id = s.clube_id;
  select id into v_anterior from public.ciclos_clube where subscricao_id = s.id order by inicio desc limit 1;
  insert into public.ciclos_clube (inquilino_id, subscricao_id, inicio, fim, valor)
  values (s.inquilino_id, s.id, p_inicio, p_inicio + c.validade_dias, c.preco_mensal)
  returning id into v_ciclo;
  insert into public.creditos_clube (inquilino_id, ciclo_id, servico_id, quantidade)
  select s.inquilino_id, v_ciclo, cs.servico_id,
         cs.quantidade_mes + case when c.transita_credito then coalesce(
           (select greatest(cc.quantidade - cc.usados, 0) from public.creditos_clube cc
             join public.ciclos_clube ci on ci.id = cc.ciclo_id
            where cc.ciclo_id = v_anterior and cc.servico_id = cs.servico_id and ci.pago_em is not null), 0) else 0 end
    from public.clube_servicos cs where cs.clube_id = c.id;
  return v_ciclo;
end $$;

create or replace function public.inscrever_clube(p_cliente uuid, p_clube uuid, p_inicio date)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.clubes%rowtype; v_sub uuid;
begin
  select * into c from public.clubes where id = p_clube;
  if not found or c.inquilino_id not in (select public.inquilinos_onde(array['proprietario'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if not c.ativo then raise exception 'plano_inativo' using errcode = 'P0001'; end if;
  if not public.funcionalidade_ativa(c.inquilino_id, 'clube_assinatura') then
    raise exception 'indisponivel' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.clientes where id = p_cliente and inquilino_id = c.inquilino_id) then
    raise exception 'cliente_invalido' using errcode = 'P0001';
  end if;
  insert into public.subscricoes (inquilino_id, cliente_id, clube_id, inicio, proxima_renovacao)
  values (c.inquilino_id, p_cliente, c.id, p_inicio, (p_inicio + interval '1 month')::date)
  returning id into v_sub;
  perform public.abrir_ciclo_clube(v_sub, p_inicio);
  return v_sub;
end $$;

create or replace function public.renovar_subscricao(p_subscricao uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare s public.subscricoes%rowtype; v_ciclo uuid; v_n integer;
begin
  select * into s from public.subscricoes where id = p_subscricao for update;
  if not found or s.inquilino_id not in (select public.inquilinos_onde(array['proprietario'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if s.estado <> 'ativa' then raise exception 'subscricao_inativa' using errcode = 'P0001'; end if;
  v_ciclo := public.abrir_ciclo_clube(s.id, s.proxima_renovacao);
  select count(*) into v_n from public.ciclos_clube where subscricao_id = s.id;
  update public.subscricoes set proxima_renovacao = (s.inicio + make_interval(months => v_n))::date where id = s.id;
  return v_ciclo;
end $$;

-- A ficha do cliente mostra se a política de faltas lhe bloqueou a marcação online (F.8). Só a
-- equipa da barbearia do cliente pergunta; a regra continua a ser pode_marcar_online() (D-121).
create or replace function public.marcacao_online_bloqueada(p_cliente uuid) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare v_inq uuid;
begin
  select inquilino_id into v_inq from public.clientes where id = p_cliente;
  if v_inq is null or v_inq not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return not public.pode_marcar_online(p_cliente);
end $$;

-- Cartões oferta (F.4.9): vendidos e pagos ao balcão. O código de oito caracteres gera-se aqui,
-- único na barbearia; o uso verifica validade e saldo com o cartão bloqueado (D-121).
create or replace function public.vender_cartao_oferta(
  p_inquilino uuid, p_valor numeric, p_comprador text, p_beneficiario text default null,
  p_metodo text default null, p_valido_ate date default null, p_comprador_cliente uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_codigo text; v_alfabeto text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if p_inquilino not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if not public.funcionalidade_ativa(p_inquilino, 'cartoes_oferta') then
    raise exception 'indisponivel' using errcode = 'P0001';
  end if;
  loop
    select string_agg(substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::integer, 1), '')
      into v_codigo from generate_series(1, 8);
    exit when not exists (select 1 from public.cartoes_oferta where inquilino_id = p_inquilino and codigo = v_codigo);
  end loop;
  insert into public.cartoes_oferta (inquilino_id, codigo, valor_inicial, comprador_nome, comprador_cliente_id,
                                     beneficiario_nome, metodo, valido_ate, vendido_por)
  values (p_inquilino, v_codigo, p_valor, trim(p_comprador), p_comprador_cliente, nullif(trim(p_beneficiario), ''),
          p_metodo, coalesce(p_valido_ate, public.hoje_lisboa() + interval '1 year')::date, auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.usar_cartao_oferta(
  p_inquilino uuid, p_codigo text, p_valor numeric, p_marcacao uuid default null)
returns numeric language plpgsql security definer set search_path = '' as $$
declare c public.cartoes_oferta%rowtype; v_saldo numeric;
begin
  if p_inquilino not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_valor is null or p_valor <= 0 then raise exception 'valor_invalido' using errcode = 'P0001'; end if;
  select * into c from public.cartoes_oferta
   where inquilino_id = p_inquilino and codigo = upper(trim(p_codigo)) for update;
  if not found or c.anulado_em is not null or c.valido_ate < public.hoje_lisboa() then
    raise exception 'cartao_invalido' using errcode = 'P0001';
  end if;
  select c.valor_inicial - coalesce(sum(m.valor), 0) into v_saldo from public.movimentos_cartao m where m.cartao_id = c.id;
  if v_saldo < p_valor then raise exception 'cartao_saldo' using errcode = 'P0001'; end if;
  insert into public.movimentos_cartao (inquilino_id, cartao_id, valor, marcacao_id, registado_por)
  values (p_inquilino, c.id, p_valor, p_marcacao, auth.uid());
  if p_marcacao is not null then
    update public.marcacoes set cartao_oferta_id = c.id where id = p_marcacao and inquilino_id = p_inquilino;
  end if;
  return v_saldo - p_valor;
end $$;

-- Formulário de adesão. A rota de servidor aplica o limite por IP e o honeypot;
-- a mensalidade vem de lib/regras/mensalidade.ts e o administrador revê-a ao aprovar.
create or replace function public.submeter_pedido_adesao(p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if p ? 'palavra_passe' or p ? 'password' then raise exception 'campo_proibido' using errcode = 'P0001'; end if;
  insert into public.pedidos_adesao (
    nome, responsavel, nif, ano_abertura, descricao, telefone, whatsapp, email, cidade, morada,
    instagram, facebook, tiktok, google_maps_url, hora_abertura, hora_fecho, dias_descanso,
    intervalo_almoco_inicio, intervalo_almoco_fim, servicos, equipa, logo_path, capa_path, galeria_paths,
    plano, periodicidade, profissionais, mensalidade_calculada, modelo_caixa, preferencia_pagamento,
    email_acesso, publico_alvo, tom_comunicacao, observacoes, aceitou_termos_em)
  values (
    p ->> 'nome', p ->> 'responsavel', p ->> 'nif', (p ->> 'ano_abertura')::integer, p ->> 'descricao',
    p ->> 'telefone', p ->> 'whatsapp', p ->> 'email', p ->> 'cidade', p ->> 'morada',
    p ->> 'instagram', p ->> 'facebook', p ->> 'tiktok', p ->> 'google_maps_url',
    (p ->> 'hora_abertura')::time, (p ->> 'hora_fecho')::time,
    coalesce((select array_agg(x::smallint) from jsonb_array_elements_text(p -> 'dias_descanso') x), '{}'),
    (p ->> 'intervalo_almoco_inicio')::time, (p ->> 'intervalo_almoco_fim')::time,
    coalesce(p -> 'servicos', '[]'), coalesce(p -> 'equipa', '[]'),
    p ->> 'logo_path', p ->> 'capa_path',
    coalesce((select array_agg(x) from jsonb_array_elements_text(p -> 'galeria_paths') x), '{}'),
    coalesce(p ->> 'plano', 'pro'), coalesce(p ->> 'periodicidade', 'mensal'),
    coalesce((p ->> 'profissionais')::integer, 2), (p ->> 'mensalidade_calculada')::numeric,
    coalesce(p ->> 'modelo_caixa', 'A'), p ->> 'preferencia_pagamento',
    p ->> 'email_acesso', p ->> 'publico_alvo', p ->> 'tom_comunicacao', p ->> 'observacoes',
    case when (p ->> 'aceitou_termos')::boolean then now() end)
  returning id into v_id;
  return v_id;
end $$;

-- -----------------------------------------------------------------------------
-- 6 · Acesso do cliente por código enviado pela barbearia (B9)
-- -----------------------------------------------------------------------------

-- O cliente pede acesso. Responde sempre igual, exista ou não o número, para
-- não revelar quem é cliente. O código aparece no painel da barbearia, que o
-- envia por wa.me. Só quem tem o telemóvel o recebe.
create or replace function public.pedir_codigo_acesso(p_inquilino uuid, p_telefone text) returns void
language plpgsql security definer set search_path = '' as $$
declare v_cliente uuid;
begin
  select id into v_cliente from public.clientes where inquilino_id = p_inquilino and telefone = p_telefone;
  if v_cliente is null then return; end if;
  if (select count(*) from public.codigos_acesso
       where cliente_id = v_cliente and criado_em > now() - interval '1 hour') >= 3 then
    return;
  end if;
  update public.codigos_acesso set expira_em = now() where cliente_id = v_cliente and usado_em is null and expira_em > now();
  insert into public.codigos_acesso (inquilino_id, cliente_id, codigo, expira_em)
  values (p_inquilino, v_cliente, lpad(floor(random() * 1000000)::integer::text, 6, '0'), now() + interval '15 minutes');
end $$;

-- Verifica o código. Só a rota de servidor (chave de serviço) a chama, e é ela
-- que cria ou atualiza a conta de autenticação e liga clientes.auth_user_id.
create or replace function public.verificar_codigo_acesso(p_inquilino uuid, p_telefone text, p_codigo text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare c public.codigos_acesso%rowtype;
begin
  select ca.* into c from public.codigos_acesso ca
    join public.clientes cl on cl.id = ca.cliente_id
   where ca.inquilino_id = p_inquilino and cl.telefone = p_telefone
     and ca.usado_em is null and ca.expira_em > now()
   order by ca.criado_em desc limit 1 for update of ca;
  if not found then return null; end if;
  if c.codigo <> p_codigo then
    update public.codigos_acesso set tentativas = least(tentativas + 1, 5),
           expira_em = case when tentativas + 1 >= 5 then now() else expira_em end
     where id = c.id;
    return null;
  end if;
  update public.codigos_acesso set usado_em = now() where id = c.id;
  return c.cliente_id;
end $$;

-- Palavra-passe escolhida na primeira marcação, sem código (DECISOES D-28).
-- Só para números novos: ficha criada nesta marcação, sem histórico, sem conta.
-- Um número que já tem ficha cria o acesso pelo código (F.9).
create or replace function public.pode_criar_acesso_direto(p_cliente uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select c.auth_user_id is null and c.anonimizado_em is null and c.origem = 'online'
     and c.criado_em > now() - interval '30 minutes'
     and not exists (select 1 from public.visitas v where v.cliente_id = c.id)
     and not exists (select 1 from public.movimentos_selos s where s.cliente_id = c.id)
     and not exists (select 1 from public.subscricoes s where s.cliente_id = c.id)
     and not exists (select 1 from public.pedidos_loja p where p.cliente_id = c.id)
     and (select count(*) from public.marcacoes m where m.cliente_id = c.id) <= 1
    from public.clientes c where c.id = p_cliente
$$;

-- -----------------------------------------------------------------------------
-- 7 · Gestão
-- -----------------------------------------------------------------------------

-- Procura exata pelo telefone, para o barbeiro marcar ao balcão um cliente que ainda não atendeu.
create or replace function public.procurar_cliente_por_telefone(p_inquilino uuid, p_telefone text)
returns table (id uuid, nome text)
language sql stable security definer set search_path = '' as $$
  select c.id, c.nome from public.clientes c
   where c.inquilino_id = p_inquilino and c.telefone = p_telefone
     and p_inquilino in (select public.inquilinos_onde(array['proprietario','profissional']))
$$;

-- Direito de eliminação (H): apaga os dados pessoais e mantém os registos
-- financeiros anonimizados. Só o proprietário da barbearia ou o super_admin (B4).
create or replace function public.anonimizar_cliente(p_cliente uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_inq uuid;
begin
  select inquilino_id into v_inq from public.clientes where id = p_cliente;
  if v_inq is null then raise exception 'cliente_invalido' using errcode = 'P0001'; end if;
  if not (public.e_super_admin() or v_inq in (select public.inquilinos_onde(array['proprietario']))) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  update public.clientes
     set nome = 'Cliente eliminado', telefone = null, email = null, nif = null, data_nascimento = null,
         notas = null, auth_user_id = null, codigo_convite = null, consentimento_mensagens = false,
         consentimento_em = null, nao_contactar = true, anonimizado_em = now()
   where id = p_cliente;
  delete from public.fichas_tecnicas where cliente_id = p_cliente;
  delete from public.codigos_acesso where cliente_id = p_cliente;
  update public.mensagens set conteudo = null where cliente_id = p_cliente;
  update public.marcacoes set notas = null where cliente_id = p_cliente;
  perform public.registar_auditoria(v_inq, 'cliente_anonimizado', 'clientes', p_cliente, null);
end $$;

-- Elimina uma barbearia e todos os seus dados (fim do contrato, RGPD art. 28.º).
-- Só o super_admin, só barbearias canceladas, e só depois de exportar os dados
-- (manual do operador, P-18). Devolve as contas de autenticação que ficam sem
-- uso, para o servidor as apagar com a chave de serviço.
create or replace function public.eliminar_inquilino(p_inquilino uuid, p_confirmacao text)
returns table (user_id uuid)
language plpgsql security definer set search_path = '' as $$
declare v_slug text; v_estado text; v_contas uuid[];
begin
  if not (public.e_super_admin() or public.e_sistema()) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select slug, estado into v_slug, v_estado from public.inquilinos where id = p_inquilino;
  if v_slug is null then raise exception 'inquilino_invalido' using errcode = 'P0001'; end if;
  if v_estado <> 'cancelado' then raise exception 'inquilino_nao_cancelado' using errcode = 'P0001'; end if;
  if p_confirmacao is distinct from v_slug then raise exception 'confirmacao_errada' using errcode = 'P0001'; end if;
  -- contas que deixam de ter uso: clientes desta barbearia e equipa sem outros perfis
  select array_agg(distinct u) into v_contas from (
    select c.auth_user_id as u from public.clientes c where c.inquilino_id = p_inquilino and c.auth_user_id is not null
    union
    select p.user_id from public.perfis p where p.inquilino_id = p_inquilino
       and not exists (select 1 from public.perfis o where o.user_id = p.user_id and o.inquilino_id is distinct from p_inquilino)
  ) x;
  update public.pedidos_adesao set inquilino_id = null where inquilino_id = p_inquilino;
  delete from public.inquilinos where id = p_inquilino;
  perform public.registar_auditoria(null, 'inquilino_eliminado', 'inquilinos', p_inquilino,
    jsonb_build_object('slug', v_slug, 'contas', coalesce(cardinality(v_contas), 0)));
  return query select unnest(coalesce(v_contas, '{}'::uuid[]));
end $$;

-- Aplica o pacote do plano às funcionalidades do inquilino (aprovação e "Repor pacote").
create or replace function public.aplicar_pacote(p_inquilino uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_plano text;
begin
  if not (public.e_super_admin() or public.e_sistema()) then raise exception 'sem_permissao' using errcode = '42501'; end if;
  select plano into v_plano from public.inquilinos where id = p_inquilino;
  insert into public.inquilino_funcionalidades (inquilino_id, chave, ativa, bonus, alterado_por)
  select p_inquilino, f.chave,
         exists (select 1 from public.pacote_funcionalidades pf where pf.plano = v_plano and pf.chave = f.chave),
         false, auth.uid()
    from public.funcionalidades f
  on conflict (inquilino_id, chave) do update
    set ativa = excluded.ativa, bonus = false, alterado_por = excluded.alterado_por, alterado_em = now();
end $$;

-- Limite de pedidos (F.6): devolve verdadeiro se o pedido pode seguir.
-- Janela fixa: ao fim de p_janela, a contagem recomeça.
create or replace function public.consumir_limite(p_chave text, p_max integer, p_janela interval)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_contagem integer;
begin
  insert into public.limites_pedidos as l (chave, janela_inicio, contagem)
  values (p_chave, now(), 1)
  on conflict (chave) do update
    set contagem = case when l.janela_inicio < now() - p_janela then 1 else l.contagem + 1 end,
        janela_inicio = case when l.janela_inicio < now() - p_janela then now() else l.janela_inicio end
  returning contagem into v_contagem;
  return v_contagem <= p_max;
end $$;

-- -----------------------------------------------------------------------------
-- 8 · Vistas
-- -----------------------------------------------------------------------------

-- Vistas internas: correm com as permissões de quem consulta (RLS aplica-se).
create view saldo_selos with (security_invoker = true) as
  select inquilino_id, cliente_id, sum(quantidade)::integer as selos
    from movimentos_selos group by inquilino_id, cliente_id;

create view saldo_cartoes with (security_invoker = true) as
  select c.inquilino_id, c.id as cartao_id, c.codigo,
         c.valor_inicial - coalesce((select sum(mc.valor) from movimentos_cartao mc where mc.cartao_id = c.id), 0) as saldo,
         c.valido_ate, c.anulado_em
    from cartoes_oferta c;

-- Classificação por profissional (E.3): só o histórico com aquele profissional.
create view cliente_por_profissional with (security_invoker = true) as
  select v.inquilino_id, v.cliente_id, v.profissional_id,
         max(v.data) as ultima_visita, count(*)::integer as visitas,
         round(avg(v.valor_cobrado), 2) as ticket_medio
    from visitas v where v.profissional_id is not null
   group by v.inquilino_id, v.cliente_id, v.profissional_id;

-- Vistas públicas: só colunas seguras, só barbearias ativas, respeitando as
-- funcionalidades ligadas. Correm com as permissões do dono da vista e são a
-- ÚNICA forma de o público ler dados da barbearia (B11).
create view publico_inquilinos as
  select id, slug, nome, vertical, descricao,
         case when mostrar_historia then historia end as historia,
         cidade, morada, codigo_postal, telefone, whatsapp, instagram, facebook, tiktok,
         case when mostrar_mapa then google_maps_url end as google_maps_url,
         google_avaliacao_url, livro_reclamacoes_url, logo_url, capa_cor, capa_foto_url, galeria_urls,
         hora_abertura, hora_fecho, dias_descanso, intervalo_almoco_inicio, intervalo_almoco_fim,
         aberto, public.funcionalidade_ativa(id, 'multilinguagem') as multilinguagem_ativa,
         dominio_proprio, selos_necessarios,
         -- A marcação pública mostra a regra de cancelamento (H.2) e só os dias da janela (D-125).
         antecedencia_cancelamento_min, janela_marcacao_dias
    from inquilinos where estado = 'ativo';

create view publico_servicos as
  select s.id, s.inquilino_id, s.nome, s.nome_en, s.nome_fr, s.descricao, s.descricao_en, s.descricao_fr,
         s.categoria, s.duracao_min, s.preco, s.ordem
    from servicos s join inquilinos i on i.id = s.inquilino_id
   where s.ativo and i.estado = 'ativo';

create view publico_profissionais as
  select p.id, p.inquilino_id, p.nome_apresentado, p.foto_url, p.ordem,
         (p.portfolio_visivel and public.funcionalidade_ativa(p.inquilino_id, 'portfolio_barbeiro')) as portfolio_visivel
    from profissionais p join inquilinos i on i.id = p.inquilino_id
   where p.ativo and i.estado = 'ativo';

create view publico_portfolio as
  select f.id, f.inquilino_id, f.profissional_id, f.foto_url, f.legenda, f.ordem
    from portfolio_fotos f
    join profissionais p on p.id = f.profissional_id
    join inquilinos i on i.id = f.inquilino_id
   where f.visivel and p.portfolio_visivel and p.ativo and i.estado = 'ativo'
     and public.funcionalidade_ativa(f.inquilino_id, 'portfolio_barbeiro');

create view publico_produtos as
  select pr.id, pr.inquilino_id, pr.nome, pr.descricao, pr.foto_url, pr.preco_venda, (pr.stock = 0) as esgotado
    from produtos pr join inquilinos i on i.id = pr.inquilino_id
   where pr.ativo and i.estado = 'ativo' and (pr.stock > 0 or pr.mostrar_esgotado)
     and public.funcionalidade_ativa(pr.inquilino_id, 'loja_produtos');

create view publico_promocoes as
  select pm.id, pm.inquilino_id, pm.titulo, pm.descricao, pm.inicio, pm.fim
    from promocoes pm join inquilinos i on i.id = pm.inquilino_id
   where pm.ativa and i.estado = 'ativo'
     and (pm.inicio is null or pm.inicio <= public.hora_local(now())::date)
     and (pm.fim is null or pm.fim >= public.hora_local(now())::date);

create view publico_periodos_desconto as
  select pd.id, pd.inquilino_id, pd.dia_semana, pd.hora_inicio, pd.hora_fim, pd.percentagem
    from periodos_desconto pd join inquilinos i on i.id = pd.inquilino_id
   where pd.ativo and i.estado = 'ativo'
     and public.funcionalidade_ativa(pd.inquilino_id, 'precos_dinamicos');

-- -----------------------------------------------------------------------------
-- 8B · Comercial (Parte N)
-- -----------------------------------------------------------------------------

-- NIF português: nove dígitos, primeiro dígito válido e dígito de controlo certo.
create or replace function public.nif_valido(p_nif text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare v_soma integer := 0; v_ctrl integer;
begin
  if p_nif is null or p_nif !~ '^[0-9]{9}$' then return false; end if;
  if substr(p_nif, 1, 1) not in ('1','2','3','5','6','8','9') then return false; end if;
  for i in 1..8 loop v_soma := v_soma + substr(p_nif, i, 1)::integer * (10 - i); end loop;
  v_ctrl := 11 - (v_soma % 11);
  if v_ctrl >= 10 then v_ctrl := 0; end if;
  return v_ctrl = substr(p_nif, 9, 1)::integer;
end $$;

-- Só o super_admin (com dois fatores) mexe no módulo comercial.
create or replace function public.exigir_super_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.e_super_admin() then raise exception 'sem_permissao' using errcode = '42501'; end if;
end $$;

create or replace function public.hoje_lisboa() returns date
language sql stable set search_path = '' as $$ select (now() at time zone 'Europe/Lisbon')::date $$;

create or replace function public.proximo_numero_comercial(p_serie text) returns text
language plpgsql security definer set search_path = '' as $$
declare v_ano integer := extract(year from (now() at time zone 'Europe/Lisbon'))::integer; v_n integer;
begin
  if p_serie not in ('PRP','CTR') then raise exception 'serie_invalida' using errcode = 'P0001'; end if;
  insert into public.numeracao_comercial as n (serie, ano, ultimo) values (p_serie, v_ano, 1)
  on conflict (serie, ano) do update set ultimo = n.ultimo + 1
  returning ultimo into v_n;
  return p_serie || '-' || v_ano || '-' || lpad(v_n::text, 4, '0');
end $$;

create or replace function public.evento_lead(p_lead uuid, p_tipo text, p_texto text, p_detalhes jsonb default null)
returns void language sql security definer set search_path = '' as $$
  insert into public.lead_eventos (lead_id, tipo, texto, detalhes, criado_por)
  values (p_lead, p_tipo, p_texto, p_detalhes, auth.uid());
$$;

-- O formulário do site. A rota aplica o limite por IP e o honeypot; aqui vale o
-- limite por contacto. Responde sempre «recebido» (verdadeiro) a quem não é abusivo,
-- exista ou não já um lead com o mesmo contacto.
-- O formulário tem dois passos (D-50): o passo 1 cria o lead; o passo 2 («passo»: 2) completa
-- só os campos ainda vazios do lead aberto e regista a dificuldade e o distrito no histórico.
-- Um lead do site sem o evento do passo 2 está «incompleto» (D-150).
create or replace function public.submeter_lead(p jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_nome text := nullif(trim(coalesce(p ->> 'nome', '')), '');
  v_tel  text := nullif(regexp_replace(coalesce(p ->> 'telefone', ''), '[^0-9+]', '', 'g'), '');
  v_mail text := nullif(lower(trim(coalesce(p ->> 'email', ''))), '');
  v_barb text := nullif(trim(coalesce(p ->> 'barbearia', '')), '');
  v_cid  text := nullif(trim(coalesce(p ->> 'cidade', '')), '');
  v_nb   text := nullif(trim(coalesce(p ->> 'barbeiros', '')), '');
  v_passo2 boolean := coalesce(p ->> 'passo', '') = '2';
  v_det  jsonb := case when coalesce(p ->> 'passo', '') = '2' then jsonb_strip_nulls(jsonb_build_object(
                    'passo', 2,
                    'distrito', nullif(trim(coalesce(p ->> 'distrito', '')), ''),
                    'dificuldade', nullif(trim(coalesce(p ->> 'dificuldade', '')), ''))) end;
  v_id   uuid;
begin
  if v_nome is null then raise exception 'nome_obrigatorio' using errcode = 'P0001'; end if;
  if v_tel is null and v_mail is null then raise exception 'contacto_obrigatorio' using errcode = 'P0001'; end if;
  if v_mail is not null and v_mail !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'email_invalido' using errcode = 'P0001';
  end if;
  if not public.consumir_limite('lead:' || coalesce(v_mail, v_tel), 3, interval '1 hour') then
    return false;
  end if;
  select id into v_id from public.leads
   where estado not in ('ganho','perdido')
     and ((v_mail is not null and lower(email) = v_mail) or (v_tel is not null and telefone = v_tel))
   order by criado_em desc limit 1;
  if v_id is not null then
    update public.leads
       set nome_barbearia = coalesce(nome_barbearia, case when v_passo2 then v_barb end),
           cidade = coalesce(cidade, case when v_passo2 then v_cid end),
           n_barbeiros = coalesce(n_barbeiros, case when v_passo2 then v_nb end),
           atualizado_em = now()
     where id = v_id;
    insert into public.lead_eventos (lead_id, tipo, texto, detalhes)
    values (v_id, 'sistema',
            case when v_passo2 then 'Completou o passo 2 do formulário do site.'
                 else 'Voltou a pedir contacto pelo formulário do site.' end,
            v_det);
    return true;
  end if;
  insert into public.leads (nome_contacto, nome_barbearia, cidade, telefone, email, n_barbeiros, origem)
  values (v_nome, v_barb, v_cid, v_tel, v_mail, v_nb, 'landing')
  returning id into v_id;
  insert into public.lead_eventos (lead_id, tipo, texto, detalhes)
  values (v_id, 'sistema', 'Pedido recebido pelo formulário do site.', v_det);
  return true;
end $$;

create or replace function public.registar_evento_lead(
  p_lead uuid, p_tipo text, p_texto text, p_proxima_acao text default null, p_proxima_acao_em date default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_lead(p_lead);
  if p_tipo not in ('nota','chamada','mensagem') then raise exception 'tipo_invalido' using errcode = 'P0001'; end if;
  if coalesce(trim(p_texto), '') = '' then raise exception 'texto_obrigatorio' using errcode = 'P0001'; end if;
  perform public.evento_lead(p_lead, p_tipo, p_texto);
  update public.leads
     set ultimo_contacto_em = now(), atualizado_em = now(),
         proxima_acao = p_proxima_acao, proxima_acao_em = p_proxima_acao_em
   where id = p_lead;
  if not found then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
end $$;

-- «ganho» só chega por assinar_contrato(); um lead ganho não volta atrás.
create or replace function public.mudar_estado_lead(p_lead uuid, p_estado text, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_atual text;
begin
  perform public.exigir_lead(p_lead);
  if p_estado not in ('novo','contactado','demonstracao','proposta','perdido') then
    raise exception 'estado_invalido' using errcode = 'P0001';
  end if;
  select estado into v_atual from public.leads where id = p_lead for update;
  if v_atual is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_atual = 'ganho' then raise exception 'lead_ganho_e_final' using errcode = 'P0001'; end if;
  if p_estado = 'perdido' and coalesce(trim(p_motivo), '') = '' then
    raise exception 'motivo_obrigatorio' using errcode = 'P0001';
  end if;
  update public.leads
     set estado = p_estado,
         motivo_perda = case when p_estado = 'perdido' then p_motivo else null end,
         atualizado_em = now()
   where id = p_lead;
  perform public.evento_lead(p_lead, 'estado', null, jsonb_build_object('de', v_atual, 'para', p_estado, 'motivo', p_motivo));
end $$;

-- Cria uma versão nova da proposta. As versões anteriores ainda abertas ficam «substituída».
-- Os preços chegam calculados por lib/regras/mensalidade.ts; as restrições da tabela conferem-nos.
create or replace function public.criar_proposta(p_lead uuid, p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_versao integer; v_id uuid; v_estado text;
  v_cfg public.configuracao_comercial%rowtype;
  v_desc numeric := coalesce((p ->> 'desconto_mensalidade_pct')::numeric, 0);
  v_taxa numeric := coalesce((p ->> 'taxa_migracao_sem_iva')::numeric, 0);
  v_desc_taxa numeric := coalesce((p ->> 'desconto_taxa_pct')::numeric, 0);
begin
  perform public.exigir_lead(p_lead);
  select * into v_cfg from public.configuracao_comercial;
  if v_desc > 0 and not coalesce(v_cfg.descontos_ativos, false) then
    raise exception 'descontos_desligados' using errcode = 'P0001';
  end if;
  if not coalesce(v_cfg.taxa_migracao_ativa, false) and (v_taxa <> 0 or v_desc_taxa <> 0) then
    raise exception 'taxa_migracao_desligada' using errcode = 'P0001';
  end if;
  if not public.e_super_admin() and (v_desc > v_cfg.desconto_max_mensalidade_pct
                                     or v_desc_taxa > v_cfg.desconto_max_taxa_pct) then
    raise exception 'desconto_acima_do_limite' using errcode = 'P0001';
  end if;
  if coalesce(v_cfg.taxa_migracao_ativa, false)
     and v_taxa <> round(v_cfg.taxa_migracao_sem_iva * (1 - v_desc_taxa / 100), 2) then
    raise exception 'taxa_migracao_invalida' using errcode = 'P0001';
  end if;
  select estado into v_estado from public.leads where id = p_lead for update;
  if v_estado is null then raise exception 'lead_inexistente' using errcode = 'P0001'; end if;
  if v_estado in ('ganho','perdido') then raise exception 'lead_fechado' using errcode = 'P0001'; end if;
  select coalesce(max(versao), 0) + 1 into v_versao from public.propostas where lead_id = p_lead;
  update public.propostas set estado = 'substituida' where lead_id = p_lead and estado in ('rascunho','enviada');
  insert into public.propostas (lead_id, numero, versao, plano, periodicidade, profissionais, dominio_proprio, desafio_90,
    mensalidade_sem_iva, valor_periodo_sem_iva, valor_periodo_com_iva, iva_taxa, condicoes_lancamento, validade_dias, dados,
    desconto_mensalidade_pct, taxa_migracao_sem_iva, desconto_taxa_pct, criado_por)
  values (p_lead, public.proximo_numero_comercial('PRP'), v_versao, p ->> 'plano',
    coalesce(p ->> 'periodicidade', 'mensal'), (p ->> 'profissionais')::integer,
    coalesce((p ->> 'dominio_proprio')::boolean, false), coalesce((p ->> 'desafio_90')::boolean, false),
    (p ->> 'mensalidade_sem_iva')::numeric, (p ->> 'valor_periodo_sem_iva')::numeric, (p ->> 'valor_periodo_com_iva')::numeric,
    coalesce((p ->> 'iva_taxa')::numeric, 23),
    nullif(p ->> 'condicoes_lancamento', ''), coalesce((p ->> 'validade_dias')::integer, 15),
    coalesce(p -> 'dados', '{}'), v_desc, v_taxa, v_desc_taxa, auth.uid())
  returning id into v_id;
  if v_estado in ('novo','contactado','demonstracao') then
    update public.leads set estado = 'proposta', atualizado_em = now() where id = p_lead;
  end if;
  perform public.evento_lead(p_lead, 'proposta', 'Proposta criada (versão ' || v_versao || ').', jsonb_build_object('proposta', v_id));
  return v_id;
end $$;

-- Depois de enviada, a proposta não muda de preço nem de conteúdo: faz-se uma versão nova.
create or replace function public.proteger_proposta() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado <> 'rascunho' and (
       new.plano, new.periodicidade, new.profissionais, new.dominio_proprio, new.desafio_90,
       new.mensalidade_sem_iva, new.valor_periodo_sem_iva, new.valor_periodo_com_iva,
       new.condicoes_lancamento, new.validade_dias, new.dados, new.desconto_mensalidade_pct,
       new.taxa_migracao_sem_iva, new.desconto_taxa_pct, new.numero, new.versao, new.lead_id)
     is distinct from (
       old.plano, old.periodicidade, old.profissionais, old.dominio_proprio, old.desafio_90,
       old.mensalidade_sem_iva, old.valor_periodo_sem_iva, old.valor_periodo_com_iva,
       old.condicoes_lancamento, old.validade_dias, old.dados, old.desconto_mensalidade_pct,
       old.taxa_migracao_sem_iva, old.desconto_taxa_pct, old.numero, old.versao, old.lead_id) then
    raise exception 'proposta_imutavel' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger proposta_imutavel before update on propostas for each row execute function public.proteger_proposta();

create or replace function public.marcar_proposta_enviada(p_proposta uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.propostas%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.propostas where id = p_proposta for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'proposta_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'rascunho' then raise exception 'proposta_nao_e_rascunho' using errcode = 'P0001'; end if;
  update public.propostas
     set estado = 'enviada', enviada_em = now(), valida_ate = public.hoje_lisboa() + validade_dias
   where id = p_proposta;
  perform public.evento_lead(v.lead_id, 'proposta', 'Proposta ' || v.numero || ' enviada.', jsonb_build_object('proposta', p_proposta));
end $$;

create or replace function public.decidir_proposta(p_proposta uuid, p_aceite boolean, p_motivo text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.propostas%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.propostas where id = p_proposta for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'proposta_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'enviada' then raise exception 'proposta_nao_enviada' using errcode = 'P0001'; end if;
  if v.valida_ate < public.hoje_lisboa() then raise exception 'proposta_expirada' using errcode = 'P0001'; end if;
  if not p_aceite and coalesce(trim(p_motivo), '') = '' then raise exception 'motivo_obrigatorio' using errcode = 'P0001'; end if;
  update public.propostas
     set estado = case when p_aceite then 'aceite' else 'recusada' end,
         decidida_em = now(), motivo_recusa = case when p_aceite then null else p_motivo end
   where id = p_proposta;
  perform public.evento_lead(v.lead_id, 'proposta',
    'Proposta ' || v.numero || case when p_aceite then ' aceite.' else ' recusada.' end,
    jsonb_build_object('proposta', p_proposta, 'motivo', p_motivo));
end $$;

-- Gera o contrato a partir de uma proposta aceite. O texto já vem preenchido
-- (lib/comercial/contrato.ts) e fica fotografado. Exige um modelo aprovado.
create or replace function public.gerar_contrato(p_proposta uuid, p_modelo uuid, p_dados jsonb, p_texto text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_prop public.propostas%rowtype; v_mod public.modelos_documento%rowtype; v_id uuid;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v_prop from public.propostas where id = p_proposta for update;
  if v_prop.id is not null then perform public.exigir_lead(v_prop.lead_id); end if;
  if v_prop.id is null then raise exception 'proposta_inexistente' using errcode = 'P0001'; end if;
  if v_prop.estado <> 'aceite' then raise exception 'proposta_nao_aceite' using errcode = 'P0001'; end if;
  select * into v_mod from public.modelos_documento where id = p_modelo;
  if v_mod.id is null or v_mod.tipo <> 'contrato' then raise exception 'modelo_invalido' using errcode = 'P0001'; end if;
  if v_mod.estado <> 'aprovado' then raise exception 'modelo_nao_aprovado' using errcode = 'P0001'; end if;
  if coalesce(trim(p_dados ->> 'razao_social'), '') = '' or coalesce(trim(p_dados ->> 'morada'), '') = ''
     or coalesce(trim(p_dados ->> 'representante'), '') = '' then
    raise exception 'dados_contratante_em_falta' using errcode = 'P0001';
  end if;
  if not public.nif_valido(p_dados ->> 'nif') then raise exception 'nif_invalido' using errcode = 'P0001'; end if;
  if exists (select 1 from public.contratos where proposta_id = p_proposta and estado in ('assinado')) then
    raise exception 'contrato_ja_assinado' using errcode = 'P0001';
  end if;
  update public.contratos set estado = 'cancelado'
   where proposta_id = p_proposta and estado in ('rascunho','enviado');
  insert into public.contratos (proposta_id, lead_id, modelo_id, numero, dados, texto, criado_por)
  values (p_proposta, v_prop.lead_id, p_modelo, public.proximo_numero_comercial('CTR'), p_dados, p_texto, auth.uid())
  returning id into v_id;
  perform public.evento_lead(v_prop.lead_id, 'contrato', 'Contrato gerado a partir da proposta ' || v_prop.numero || '.',
    jsonb_build_object('contrato', v_id));
  return v_id;
end $$;

create or replace function public.marcar_contrato_enviado(p_contrato uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'rascunho' then raise exception 'contrato_nao_e_rascunho' using errcode = 'P0001'; end if;
  update public.contratos set estado = 'enviado' where id = p_contrato;
  perform public.evento_lead(v.lead_id, 'contrato', 'Contrato enviado para assinatura.', jsonb_build_object('contrato', p_contrato));
end $$;

-- Depois de assinado, o texto, os dados e o ficheiro assinado não se alteram.
create or replace function public.proteger_contrato() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado in ('assinado','terminado') and (
       new.proposta_id, new.lead_id, new.modelo_id, new.numero, new.dados, new.texto, new.pdf_assinado_path, new.assinado_em)
     is distinct from (
       old.proposta_id, old.lead_id, old.modelo_id, old.numero, old.dados, old.texto, old.pdf_assinado_path, old.assinado_em) then
    raise exception 'contrato_imutavel' using errcode = 'P0001';
  end if;
  if old.estado in ('assinado','terminado') and new.estado not in ('assinado','terminado') then
    raise exception 'contrato_imutavel' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger contrato_imutavel before update on contratos for each row execute function public.proteger_contrato();

-- Assinar fecha o negócio: o lead passa a «ganho». Exige o PDF assinado.
create or replace function public.assinar_contrato(p_contrato uuid, p_data date, p_pdf_assinado text, p_inicio date default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('rascunho','enviado') then raise exception 'contrato_nao_assinavel' using errcode = 'P0001'; end if;
  if p_data is null or coalesce(trim(p_pdf_assinado), '') = '' then
    raise exception 'assinatura_incompleta' using errcode = 'P0001';
  end if;
  update public.contratos
     set estado = 'assinado', assinado_em = p_data, pdf_assinado_path = p_pdf_assinado,
         data_inicio = coalesce(p_inicio, data_inicio)
   where id = p_contrato;
  update public.leads set estado = 'ganho', motivo_perda = null, atualizado_em = now() where id = v.lead_id;
  perform public.evento_lead(v.lead_id, 'contrato', 'Contrato ' || v.numero || ' assinado.', jsonb_build_object('contrato', p_contrato));
  perform public.registar_auditoria(null, 'contrato_assinado', 'contratos', p_contrato, jsonb_build_object('numero', v.numero));
end $$;

-- O convite leva os dados do contrato para o formulário de adesão (D.12).
create or replace function public.criar_convite_adesao(p_contrato uuid, p_token text, p_dados jsonb, p_dias integer default 14)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype; v_id uuid;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null or v.estado <> 'assinado' then raise exception 'contrato_nao_assinado' using errcode = 'P0001'; end if;
  if p_token is null or length(p_token) < 32 then raise exception 'token_fraco' using errcode = 'P0001'; end if;
  if p_dados ? 'palavra_passe' or p_dados ? 'password' then raise exception 'campo_proibido' using errcode = 'P0001'; end if;
  update public.convites_adesao set expira_em = now() where contrato_id = p_contrato and usado_em is null and expira_em > now();
  insert into public.convites_adesao (contrato_id, token_hash, dados, expira_em)
  values (p_contrato, encode(sha256(convert_to(p_token, 'UTF8')), 'hex'), p_dados, now() + make_interval(days => p_dias))
  returning id into v_id;
  perform public.evento_lead(v.lead_id, 'contrato', 'Convite de adesão criado.', jsonb_build_object('convite', v_id));
  return v_id;
end $$;

-- Quem abre a ligação do convite vê os dados já preenchidos. Código errado, usado ou expirado: nulo.
create or replace function public.ler_convite_adesao(p_token text) returns jsonb
language sql stable security definer set search_path = '' as $$
  select dados from public.convites_adesao
   where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
     and usado_em is null and expira_em > now()
$$;

-- No envio do formulário, o convite liga-se ao pedido e gasta-se.
create or replace function public.usar_convite_adesao(p_token text, p_pedido uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v public.convites_adesao%rowtype;
begin
  select * into v from public.convites_adesao
   where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
     and usado_em is null and expira_em > now() for update;
  if v.id is null then return false; end if;
  update public.pedidos_adesao set contrato_id = v.contrato_id
   where id = p_pedido and contrato_id is null and submetido_em > now() - interval '1 day';
  if not found then return false; end if;
  update public.convites_adesao set usado_em = now() where id = v.id;
  return true;
end $$;

-- Na aprovação do pedido, liga o contrato à barbearia criada.
create or replace function public.ligar_contrato_inquilino(p_contrato uuid, p_inquilino uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is null or v.estado <> 'assinado' then raise exception 'contrato_nao_assinado' using errcode = 'P0001'; end if;
  update public.contratos set inquilino_id = p_inquilino, data_inicio = coalesce(data_inicio, public.hoje_lisboa()) where id = p_contrato;
  update public.leads set inquilino_id = p_inquilino where id = v.lead_id;
  -- O desconto da proposta aceite passa para a mensalidade da barbearia (D-161).
  update public.inquilinos
     set desconto_mensalidade_pct = (select desconto_mensalidade_pct from public.propostas where id = v.proposta_id)
   where id = p_inquilino;
  perform public.evento_lead(v.lead_id, 'contrato', 'Barbearia criada e ligada ao contrato.', jsonb_build_object('inquilino', p_inquilino));
end $$;

-- Rotina mensal à mão (manual do operador): apaga os leads que não chegaram a
-- cliente e estão parados há mais do prazo. Os que têm contrato ficam sempre.
create or replace function public.apagar_leads_inativos(p_meses integer default 12) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_n integer;
begin
  perform public.exigir_super_admin();
  if p_meses < 1 then raise exception 'prazo_invalido' using errcode = 'P0001'; end if;
  with apagados as (
    delete from public.leads l
     where l.estado <> 'ganho'
       and not exists (select 1 from public.contratos c where c.lead_id = l.id)
       and greatest(l.ultimo_contacto_em, l.atualizado_em) < now() - make_interval(months => p_meses)
    returning 1)
  select count(*) into v_n from apagados;
  perform public.registar_auditoria(null, 'leads_inativos_apagados', 'leads', null, jsonb_build_object('n', v_n, 'meses', p_meses));
  return v_n;
end $$;

-- Rotina mensal à mão (P-24, D-157): apaga os registos de auditoria com mais do prazo de
-- conservação (24 meses por omissão; nunca menos de 12). O próprio apagamento fica registado.
create or replace function public.apagar_auditoria_antiga(p_meses integer default 24) returns integer
language plpgsql security definer set search_path = '' as $$
declare v_n integer;
begin
  perform public.exigir_super_admin();
  if p_meses is null or p_meses < 12 then raise exception 'prazo_invalido' using errcode = 'P0001'; end if;
  with apagados as (
    delete from public.auditoria where criado_em < now() - make_interval(months => p_meses)
    returning 1)
  select count(*) into v_n from apagados;
  perform public.registar_auditoria(null, 'auditoria_antiga_apagada', 'auditoria', null,
    jsonb_build_object('n', v_n, 'meses', p_meses));
  return v_n;
end $$;

-- -----------------------------------------------------------------------------
-- 8D · Comunicados aos gestores (D-160). A tabela só se lê pelo super_admin (RLS);
--      o gestor (proprietário) lê e marca como lidos os da sua barbearia por estas funções.
-- -----------------------------------------------------------------------------
create or replace function public.comunicado_para(p_comunicado uuid, p_inquilino uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.comunicados c join public.inquilinos i on i.id = p_inquilino
     where c.id = p_comunicado and c.inicio <= now() and (c.fim is null or c.fim > now())
       and (c.destino = 'todas' or (c.destino = 'plano' and c.plano = i.plano)
            or (c.destino = 'barbearia' and c.inquilino_id = i.id)))
$$;

create or replace function public.exigir_gestor(p_inquilino uuid) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_inquilino is null
     or p_inquilino not in (select public.inquilinos_onde(array['proprietario'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
end $$;

-- Os comunicados em vigor para a barbearia que o gestor ainda não marcou como lidos.
create or replace function public.meus_comunicados(p_inquilino uuid)
returns table (id uuid, titulo text, texto text, inicio timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.exigir_gestor(p_inquilino);
  return query
    select c.id, c.titulo, c.texto, c.inicio from public.comunicados c
     where public.comunicado_para(c.id, p_inquilino)
       and not exists (select 1 from public.comunicado_leituras l
                        where l.comunicado_id = c.id and l.inquilino_id = p_inquilino)
     order by c.inicio desc;
end $$;

create or replace function public.marcar_comunicado_lido(p_comunicado uuid, p_inquilino uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_gestor(p_inquilino);
  if not public.comunicado_para(p_comunicado, p_inquilino) then
    raise exception 'comunicado_invalido' using errcode = 'P0001';
  end if;
  insert into public.comunicado_leituras (comunicado_id, inquilino_id, lido_por)
  values (p_comunicado, p_inquilino, auth.uid())
  on conflict (comunicado_id, inquilino_id) do nothing;
end $$;

-- -----------------------------------------------------------------------------
-- 8E · Equipa InstaBarber (D-161): o dono gere as contas; o comercial trabalha os seus leads.
-- -----------------------------------------------------------------------------
-- Só o dono (super_admin com dois fatores): contas da equipa InstaBarber.
create or replace function public.e_dono_plataforma() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis
                 where user_id = auth.uid() and papel = 'super_admin' and ativo)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- Comercial com dois fatores.
create or replace function public.e_comercial() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis
                 where user_id = auth.uid() and papel = 'comercial' and ativo)
     and coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

-- Os leads de que o comercial é responsável (vazio para quem não é comercial).
create or replace function public.meus_leads() returns setof uuid
language sql stable security definer set search_path = '' as $$
  select id from public.leads where responsavel_id = auth.uid() and public.e_comercial()
$$;

create or replace function public.lead_acessivel(p_lead uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.e_super_admin() or p_lead in (select public.meus_leads())
$$;

-- Para as políticas do Storage: a pasta leads/<id>/ de um lead acessível.
create or replace function public.pasta_lead_acessivel(p_nome text) returns boolean
language sql stable security definer set search_path = '' as $$
  select (storage.foldername(p_nome))[1] = 'leads'
     and exists (select 1 from public.leads l
                  where l.id::text = (storage.foldername(p_nome))[2]
                    and public.lead_acessivel(l.id))
$$;

create or replace function public.exigir_lead(p_lead uuid) returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if p_lead is null or not public.lead_acessivel(p_lead) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
end $$;

-- Quem cria o lead fica registado; o lead criado por um comercial é dele. Pela API (não pelas
-- funções, que correm como dono das tabelas), o comercial não muda o estado, a barbearia
-- ligada, o responsável nem o autor. Sem security definer: current_user diz quem chama.
create or replace function public.preparar_lead() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.criado_por := coalesce(new.criado_por, auth.uid());
    if public.e_comercial() and not public.e_super_admin() then new.responsavel_id := auth.uid(); end if;
    return new;
  end if;
  if current_user = 'authenticated' and not public.e_super_admin()
     and (new.estado, new.inquilino_id, new.responsavel_id, new.criado_por)
         is distinct from (old.estado, old.inquilino_id, old.responsavel_id, old.criado_por) then
    raise exception 'campo_protegido' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger leads_preparar before insert or update on leads
  for each row execute function public.preparar_lead();

-- A carteira de um comercial: as barbearias dos leads que ganhou (D-161). Só colunas de
-- estado, nunca dados dos clientes da barbearia. O comercial vê só a sua.
create or replace function public.carteira_comercial(p_user uuid default null)
returns table (inquilino_id uuid, nome text, plano text, estado text, estado_pagamento text,
               aprovado_em timestamptz, lead_id uuid)
language plpgsql stable security definer set search_path = '' as $$
declare v_user uuid := coalesce(p_user, auth.uid());
begin
  if not (public.e_super_admin() or (public.e_comercial() and v_user = auth.uid())) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return query
    select i.id, i.nome, i.plano, i.estado, i.estado_pagamento, i.aprovado_em, l.id
      from public.leads l join public.inquilinos i on i.id = l.inquilino_id
     where l.responsavel_id = v_user
     order by i.nome;
end $$;

create or replace function public.exigir_comercial_ou_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (public.e_super_admin() or public.e_comercial()) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
end $$;

-- O texto final do contrato com o número, enquanto é rascunho (D-161): o comercial do lead
-- também o fixa, sem poder alterar o contrato diretamente.
create or replace function public.fixar_texto_contrato(p_contrato uuid, p_texto text) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado <> 'rascunho' then raise exception 'contrato_nao_e_rascunho' using errcode = 'P0001'; end if;
  if coalesce(trim(p_texto), '') = '' then raise exception 'texto_obrigatorio' using errcode = 'P0001'; end if;
  update public.contratos set texto = p_texto where id = p_contrato;
end $$;


-- -----------------------------------------------------------------------------
-- 8C · Finanças da Performa LAB (Parte O): lembretes de vencimento
--      As tabelas de custos, contas e metas escrevem-se por RLS (só super_admin).
--      Os lembretes só se escrevem por estas funções, que fazem cumprir os estados.
-- -----------------------------------------------------------------------------
create or replace function public.preparar_lembrete_vencimento(p_inquilino uuid, p_canal text, p_conteudo text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v public.inquilinos%rowtype; v_id uuid; v_fatura uuid;
begin
  perform public.exigir_super_admin();
  if p_canal not in ('whatsapp','email') then raise exception 'canal_invalido' using errcode = 'P0001'; end if;
  if coalesce(trim(p_conteudo), '') = '' then raise exception 'texto_obrigatorio' using errcode = 'P0001'; end if;
  select * into v from public.inquilinos where id = p_inquilino;
  if not found then raise exception 'inquilino_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('ativo','suspenso') then raise exception 'inquilino_sem_contrato_ativo' using errcode = 'P0001'; end if;
  if v.proximo_vencimento is null then raise exception 'sem_vencimento' using errcode = 'P0001'; end if;
  if p_canal = 'whatsapp' and coalesce(v.whatsapp, v.telefone) is null then raise exception 'sem_whatsapp' using errcode = 'P0001'; end if;
  if p_canal = 'email' and coalesce(trim(v.email), '') = '' then raise exception 'sem_email' using errcode = 'P0001'; end if;
  select f.id into v_fatura from public.faturas_plataforma f
   where f.inquilino_id = p_inquilino and f.paga_em is null
   order by f.emitida_em desc limit 1;
  insert into public.lembretes_vencimento (inquilino_id, fatura_id, vencimento, canal, conteudo, criado_por)
  values (p_inquilino, v_fatura, v.proximo_vencimento, p_canal, p_conteudo, auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.abrir_lembrete_vencimento(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.lembretes_vencimento%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.lembretes_vencimento where id = p_id for update;
  if not found then raise exception 'lembrete_inexistente' using errcode = 'P0001'; end if;
  if v.canal <> 'whatsapp' then raise exception 'so_whatsapp' using errcode = 'P0001'; end if;
  if v.estado not in ('preparada','ligacao_aberta') then raise exception 'estado_invalido' using errcode = 'P0001'; end if;
  update public.lembretes_vencimento set estado = 'ligacao_aberta', aberta_em = now() where id = p_id;
end $$;

create or replace function public.confirmar_lembrete_vencimento(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.lembretes_vencimento%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.lembretes_vencimento where id = p_id for update;
  if not found then raise exception 'lembrete_inexistente' using errcode = 'P0001'; end if;
  if v.canal <> 'whatsapp' then raise exception 'so_whatsapp' using errcode = 'P0001'; end if;
  if v.estado <> 'ligacao_aberta' then raise exception 'abrir_primeiro' using errcode = 'P0001'; end if;
  update public.lembretes_vencimento set estado = 'envio_confirmado_manualmente' where id = p_id;
end $$;

-- Chamada pelo servidor depois de tentar o envio pelo Resend.
create or replace function public.registar_email_lembrete(p_id uuid, p_ok boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.lembretes_vencimento%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.lembretes_vencimento where id = p_id for update;
  if not found then raise exception 'lembrete_inexistente' using errcode = 'P0001'; end if;
  if v.canal <> 'email' then raise exception 'so_email' using errcode = 'P0001'; end if;
  if v.estado not in ('preparada','falhou') then raise exception 'estado_invalido' using errcode = 'P0001'; end if;
  update public.lembretes_vencimento set estado = case when p_ok then 'enviado' else 'falhou' end, aberta_em = now() where id = p_id;
end $$;

create or replace function public.cancelar_lembrete_vencimento(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.lembretes_vencimento%rowtype;
begin
  perform public.exigir_super_admin();
  select * into v from public.lembretes_vencimento where id = p_id for update;
  if not found then raise exception 'lembrete_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('preparada','ligacao_aberta','falhou') then raise exception 'estado_invalido' using errcode = 'P0001'; end if;
  update public.lembretes_vencimento set estado = 'cancelada' where id = p_id;
end $$;

-- Barbearias com vencimento à vista e o último lembrete desse vencimento. O filtro por dias é da aplicação.
create view vencimentos_proximos with (security_invoker = true) as
  select i.id as inquilino_id, i.nome, i.slug, i.plano, i.periodicidade, i.estado, i.estado_pagamento,
         i.proximo_vencimento,
         i.proximo_vencimento - (now() at time zone 'Europe/Lisbon')::date as dias,
         i.whatsapp, i.email,
         (select max(l.criado_em) from lembretes_vencimento l
           where l.inquilino_id = i.id and l.vencimento = i.proximo_vencimento and l.estado <> 'cancelada') as ultimo_lembrete_em
    from inquilinos i
   where i.estado in ('ativo','suspenso') and i.proximo_vencimento is not null
     and (select public.e_super_admin());

-- -----------------------------------------------------------------------------
-- 8C · Filas, e-mail de confirmação e módulos (Fase 6, D-126)
-- -----------------------------------------------------------------------------

-- Posição na fila de espera de um serviço e dia (F.4.1); 0 fora da fila. O id da entrada
-- só o conhece quem entrou.
create or replace function public.posicao_fila_espera(p_entrada uuid) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.fila_espera e
    join public.fila_espera f on f.inquilino_id = e.inquilino_id and f.servico_id = e.servico_id
                             and f.dia = e.dia and f.estado in ('aguarda','avisado')
                             and (f.criado_em, f.id) <= (e.criado_em, e.id)
   where e.id = p_entrada and e.estado in ('aguarda','avisado')
$$;

-- Aviso de vaga (F.4.1, Pro): o prazo de resposta de 30 minutos grava-se aqui, no momento do aviso.
create or replace function public.avisar_fila_espera(p_entrada uuid) returns timestamptz
language plpgsql security definer set search_path = '' as $$
declare e public.fila_espera%rowtype;
begin
  select * into e from public.fila_espera where id = p_entrada for update;
  if not found or e.inquilino_id not in (select public.inquilinos_onde(array['proprietario','profissional'])) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if not public.funcionalidade_ativa(e.inquilino_id, 'envio_mensagens') then
    raise exception 'indisponivel' using errcode = 'P0001';
  end if;
  if e.estado <> 'aguarda' or e.dia < public.hora_local(now())::date then
    raise exception 'entrada_invalida' using errcode = 'P0001';
  end if;
  update public.fila_espera set estado = 'avisado', avisado_em = now(), expira_em = now() + interval '30 minutes'
   where id = e.id;
  return now() + interval '30 minutes';
end $$;

-- Estado de uma entrada na fila presencial (F.4.3), para a página da fila: posição e os números
-- da estimativa de espera (o cálculo vive em lib/regras/fila.ts).
create or replace function public.estado_fila_presencial(p_entrada uuid)
returns table (estado text, posicao integer, minutos_a_frente integer, minutos_em_curso integer,
               profissionais integer)
language sql stable security definer set search_path = '' as $$
  with e as (
    select f.* from public.fila_presencial f
     where f.id = p_entrada and f.dia = public.hora_local(now())::date
  ), duracao as (
    select coalesce(round(avg(s.duracao_min))::integer, 30) as media
      from public.servicos s where s.inquilino_id = (select inquilino_id from e) and s.ativo
  )
  select e.estado,
         case when e.estado = 'aguarda' then
           (select count(*)::integer from public.fila_presencial f
             where f.inquilino_id = e.inquilino_id and f.dia = e.dia and f.estado = 'aguarda'
               and (f.entrou_em, f.id) <= (e.entrou_em, e.id))
         else 0 end,
         (select coalesce(sum(coalesce(s.duracao_min, (select media from duracao))), 0)::integer
            from public.fila_presencial f left join public.servicos s on s.id = f.servico_id
           where f.inquilino_id = e.inquilino_id and f.dia = e.dia and f.estado = 'aguarda'
             and (f.entrou_em, f.id) < (e.entrou_em, e.id)),
         (select coalesce(sum(greatest(0, ceil(extract(epoch from (m.fim - now())) / 60))), 0)::integer
            from public.marcacoes m
           where m.inquilino_id = e.inquilino_id and m.estado = 'agendada'
             and m.inicio <= now() and m.fim > now())
         + (select coalesce(sum(greatest(0, ceil(extract(epoch from (
                    f.chamado_em + make_interval(mins => coalesce(s.duracao_min, (select media from duracao)))
                    - now())) / 60))), 0)::integer
              from public.fila_presencial f left join public.servicos s on s.id = f.servico_id
             where f.inquilino_id = e.inquilino_id and f.dia = e.dia and f.estado = 'em_atendimento'
               and f.chamado_em is not null),
         (select greatest(count(*), 1)::integer from public.profissionais p
           where p.inquilino_id = e.inquilino_id and p.ativo)
    from e
$$;

-- E-mail de confirmação (F.4.12): quem acabou de confirmar pede os dados uma só vez, nos 15
-- minutos seguintes à reserva, e só com a funcionalidade ligada e e-mail dado. A data fica na
-- marcação no momento do pedido, para não haver dois envios.
create or replace function public.reclamar_email_confirmacao(p_marcacao uuid)
returns table (para text, cliente text, servico text, barbeiro text, inicio timestamptz, fim timestamptz,
               barbearia text, morada text, email_barbearia text, cancelamento_min integer,
               slug text, dominio text)
language plpgsql security definer set search_path = '' as $$
declare m public.marcacoes%rowtype;
begin
  select * into m from public.marcacoes x
   where x.id = p_marcacao and x.estado = 'agendada' and x.origem = 'online'
     and x.confirmacao_email_em is null and x.criado_em > now() - interval '15 minutes'
   for update;
  if not found or not public.funcionalidade_ativa(m.inquilino_id, 'confirmacao_email') then return; end if;
  if not exists (select 1 from public.clientes c where c.id = m.cliente_id and c.email is not null
                    and c.anonimizado_em is null) then
    return;
  end if;
  update public.marcacoes set confirmacao_email_em = now() where id = m.id;
  return query
    select c.email, c.nome, s.nome, coalesce(p.nome_apresentado, p.nome), m.inicio, m.fim, i.nome,
           concat_ws(', ', i.morada, i.codigo_postal, i.cidade), i.email, i.antecedencia_cancelamento_min,
           i.slug, i.dominio_proprio
      from public.clientes c, public.servicos s, public.inquilinos i, public.profissionais p
     where c.id = m.cliente_id and s.id = m.servico_id and i.id = m.inquilino_id and p.id = m.profissional_id;
end $$;

-- O resultado do envio fica em mensagens (canal email, «enviado» ou «falhou»), uma vez por marcação.
create or replace function public.registar_email_confirmacao(p_marcacao uuid, p_enviado boolean)
returns void language sql security definer set search_path = '' as $$
  insert into public.mensagens (inquilino_id, cliente_id, tipo, canal, referencia_id, estado)
  select m.inquilino_id, m.cliente_id, 'confirmacao', 'email', m.id,
         case when p_enviado then 'enviado' else 'falhou' end
    from public.marcacoes m
   where m.id = p_marcacao and m.confirmacao_email_em > now() - interval '15 minutes'
     and not exists (select 1 from public.mensagens x
                      where x.referencia_id = m.id and x.canal = 'email' and x.tipo = 'confirmacao')
$$;

-- O interruptor geral dos módulos (G.4) também fica em auditoria.
create or replace function public.auditar_modulo_plataforma() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.registar_auditoria(null, 'modulos_plataforma_' || lower(tg_op), 'modulos_plataforma', null,
    jsonb_build_object('chave', new.chave, 'antes', case when tg_op = 'UPDATE' then to_jsonb(old) end,
                       'depois', to_jsonb(new)));
  return new;
end $$;
create trigger modulos_plataforma_auditar after insert or update on modulos_plataforma
  for each row execute function public.auditar_modulo_plataforma();

-- Planos do clube na página pública (F.4.2): nome, preço, validade e serviços incluídos.
create view publico_clubes as
  select c.id, c.inquilino_id, c.nome, c.preco_mensal, c.validade_dias,
         (select coalesce(jsonb_agg(jsonb_build_object('servico', s.nome, 'quantidade', cs.quantidade_mes)
                                    order by s.nome), '[]'::jsonb)
            from public.clube_servicos cs join public.servicos s on s.id = cs.servico_id
           where cs.clube_id = c.id) as servicos
    from public.clubes c join public.inquilinos i on i.id = c.inquilino_id
   where c.ativo and i.estado = 'ativo' and public.funcionalidade_ativa(c.inquilino_id, 'clube_assinatura');

-- Barbearia suspensa (M.4): a página pública mostra só um aviso neutro, sem expor a razão nem
-- dados; o slug diz apenas se existe uma barbearia suspensa com ele (Fase 7, D-127).
create or replace function public.barbearia_suspensa(p_slug text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.inquilinos where slug = p_slug and estado = 'suspenso')
$$;

-- -----------------------------------------------------------------------------
-- 9 · Quem pode executar o quê
--     O Postgres dá EXECUTE a todos por omissão, e o Supabase expõe as funções
--     por RPC. Retira-se tudo e dá-se só o necessário.
-- -----------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon, authenticated;

-- Usadas dentro das políticas RLS e das vistas: têm de ser executáveis por quem consulta.
grant execute on function public.e_super_admin(), public.inquilinos_onde(text[], boolean),
  public.meus_profissionais(), public.meus_clientes(), public.clientes_do_profissional(),
  public.funcionalidade_ativa(uuid, text), public.modulo_ativo(uuid, text), public.e_sistema(),
  public.campos_alterados(jsonb, jsonb), public.hora_local(timestamptz), public.instante_lisboa(date, time)
  to anon, authenticated;

-- Página pública (sem conta)
grant execute on function public.vagas_livres(uuid, uuid, date, uuid, boolean),
  public.calcular_preco(uuid, uuid, timestamptz),
  public.reservar_vaga(uuid, uuid, timestamptz, uuid),
  public.confirmar_reserva(uuid, text, text, text, text, date, boolean, text),
  public.entrar_fila_espera(uuid, uuid, date, text, text, boolean),
  public.entrar_fila_presencial(uuid, text, text, uuid, boolean),
  public.criar_pedido_loja(uuid, text, text, jsonb, boolean),
  public.submeter_pedido_adesao(jsonb),
  public.pedir_codigo_acesso(uuid, text)
  to anon, authenticated;

-- Utilizadores com sessão (cada função verifica o papel por dentro)
grant execute on function public.cancelar_minha_marcacao(uuid, text),
  public.concluir_marcacao(uuid, text, numeric), public.marcar_falta(uuid),
  public.levantar_pedido(uuid), public.procurar_cliente_por_telefone(uuid, text),
  public.anonimizar_cliente(uuid), public.aplicar_pacote(uuid), public.eliminar_inquilino(uuid, text),
  public.registar_auditoria_admin(uuid, text, text, uuid, jsonb),
  public.validar_vaga(uuid, uuid, uuid, timestamptz, boolean, uuid),
  public.vender_cartao_oferta(uuid, numeric, text, text, text, date, uuid),
  public.usar_cartao_oferta(uuid, text, numeric, uuid),
  public.marcacao_online_bloqueada(uuid),
  public.inscrever_clube(uuid, uuid, date), public.renovar_subscricao(uuid),
  public.meu_codigo_convite(uuid), public.meu_cartao_selos(uuid)
  to authenticated;

-- Só a chave de serviço (rotas de servidor)
grant execute on function public.verificar_codigo_acesso(uuid, text, text),
  public.consumir_limite(text, integer, interval),
  public.pode_criar_acesso_direto(uuid) to service_role;

-- Comercial (Parte N): o site chama o formulário e o convite; o resto é do super_admin (cada função verifica).
grant execute on function public.submeter_lead(jsonb), public.ler_convite_adesao(text),
  public.usar_convite_adesao(text, uuid) to anon, authenticated;
grant execute on function public.registar_evento_lead(uuid, text, text, text, date),
  public.mudar_estado_lead(uuid, text, text), public.criar_proposta(uuid, jsonb),
  public.marcar_proposta_enviada(uuid), public.decidir_proposta(uuid, boolean, text),
  public.gerar_contrato(uuid, uuid, jsonb, text), public.marcar_contrato_enviado(uuid),
  public.assinar_contrato(uuid, date, text, date), public.criar_convite_adesao(uuid, text, jsonb, integer),
  public.ligar_contrato_inquilino(uuid, uuid), public.apagar_leads_inativos(integer),
  public.apagar_auditoria_antiga(integer),
  public.nif_valido(text), public.hoje_lisboa() to authenticated;

-- Finanças da Performa LAB (Parte O): cada função verifica o super_admin.
grant execute on function public.preparar_lembrete_vencimento(uuid, text, text),
  public.abrir_lembrete_vencimento(uuid), public.confirmar_lembrete_vencimento(uuid),
  public.registar_email_lembrete(uuid, boolean), public.cancelar_lembrete_vencimento(uuid) to authenticated;

-- Funções internas que só correm dentro de outras (registar_auditoria,
-- cliente_por_telefone, pode_marcar_online e as funções de gatilho) não ficam
-- expostas: sem EXECUTE para anon nem authenticated.
grant execute on all functions in schema public to service_role;

-- Vistas públicas: só leitura
revoke all on publico_inquilinos, publico_servicos, publico_profissionais, publico_portfolio,
  publico_produtos, publico_promocoes, publico_periodos_desconto from anon, authenticated;
grant select on publico_inquilinos, publico_servicos, publico_profissionais, publico_portfolio,
  publico_produtos, publico_promocoes, publico_periodos_desconto to anon, authenticated;

-- Fase 6 (D-126)
grant execute on function public.posicao_fila_espera(uuid), public.estado_fila_presencial(uuid),
  public.reclamar_email_confirmacao(uuid), public.registar_email_confirmacao(uuid, boolean)
  to anon, authenticated;
grant execute on function public.avisar_fila_espera(uuid) to authenticated;
revoke all on publico_clubes from anon, authenticated;
grant select on publico_clubes to anon, authenticated;
grant execute on function public.barbearia_suspensa(text) to anon, authenticated;

-- Comunicados (D-160): cada função verifica o gestor da barbearia.
revoke all on function public.comunicado_para(uuid, uuid), public.exigir_gestor(uuid) from public, anon, authenticated;
grant execute on function public.meus_comunicados(uuid), public.marcar_comunicado_lido(uuid, uuid)
  to authenticated;

-- Equipa InstaBarber (D-161): cada função verifica o papel.
revoke all on function public.preparar_lead(), public.exigir_lead(uuid),
  public.exigir_comercial_ou_admin() from public, anon, authenticated;
grant execute on function public.fixar_texto_contrato(uuid, text), public.e_dono_plataforma(),
  public.e_comercial(), public.meus_leads(),
  public.lead_acessivel(uuid), public.pasta_lead_acessivel(text), public.carteira_comercial(uuid)
  to authenticated;
