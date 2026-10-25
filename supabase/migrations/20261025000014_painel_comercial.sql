-- =============================================================================
-- Migração 14 · Painel comercial (D-162): distribuição dos leads, comissões com estado, risco da
-- carteira e barbearia de demonstração. As mesmas alterações estão em docs/esquema/01 a 03,
-- testadas em docs/esquema/testes/96c_painel_comercial.sql.
-- =============================================================================
-- A barbearia de demonstração (D-162): dados fictícios para mostrar o sistema. Fica fora das
-- contas, da saúde, das métricas, dos comunicados e do sitemap. Só pode haver uma.
alter table inquilinos add column demonstracao boolean not null default false;
create unique index inquilinos_uma_demonstracao on inquilinos (demonstracao) where demonstracao;

-- Comissões dos comerciais (D-162): a taxa de migração do contrato que o comercial fechou.
-- «pendente» até a barbearia pagar a taxa; depois «a_pagar», com prazo de 10 dias; «paga».
create table comissoes_comerciais (
  id             uuid primary key default gen_random_uuid(),
  contrato_id    uuid not null unique references contratos(id) on delete cascade,
  comercial_id   uuid references auth.users(id) on delete set null,
  valor          numeric(10,2) not null check (valor > 0),
  estado         text not null default 'pendente' check (estado in ('pendente','a_pagar','paga')),
  taxa_paga_em   date,
  vence_em       date,
  paga_em        date,
  criado_em      timestamptz not null default now(),
  check ((estado = 'pendente') = (taxa_paga_em is null)),
  check ((taxa_paga_em is null) = (vence_em is null)),
  check ((estado = 'paga') = (paga_em is not null))
);
create index comissoes_comercial on comissoes_comerciais (comercial_id, estado);

alter table public.comissoes_comerciais enable row level security;
create policy comissoes_comerciais_admin_ler on public.comissoes_comerciais for select using ((select public.e_super_admin()));

-- -----------------------------------------------------------------------------
-- 8F · Painel comercial (D-162): distribuição dos leads, comissões, risco da carteira e a
--      barbearia de demonstração.
-- -----------------------------------------------------------------------------
-- Um comercial ativo ao acaso; nulo sem comerciais (os leads ficam no geral).
create or replace function public.escolher_comercial() returns uuid
language sql volatile security definer set search_path = '' as $$
  select user_id from public.perfis
   where papel = 'comercial' and ativo and inquilino_id is null
   order by random() limit 1
$$;

-- Quem cria o lead fica registado; o lead criado por um comercial é dele; os outros vão para um
-- comercial ao acaso (ficam no geral enquanto não houver comerciais). Pela API (não pelas funções,
-- que correm como dono das tabelas), o comercial não muda o estado, a barbearia ligada, o
-- responsável nem o autor. Sem security definer: current_user diz quem chama.
create or replace function public.preparar_lead() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.criado_por := coalesce(new.criado_por, auth.uid());
    if public.e_comercial() and not public.e_super_admin() then
      new.responsavel_id := auth.uid();
    elsif new.responsavel_id is null then
      new.responsavel_id := public.escolher_comercial();
    end if;
    return new;
  end if;
  if current_user = 'authenticated' and not public.e_super_admin()
     and (new.estado, new.inquilino_id, new.responsavel_id, new.criado_por)
         is distinct from (old.estado, old.inquilino_id, old.responsavel_id, old.criado_por) then
    raise exception 'campo_protegido' using errcode = '42501';
  end if;
  return new;
end $$;

-- O primeiro comercial ativo recebe todos os leads em aberto do geral; um comercial desativado
-- passa os seus leads em aberto a outro ao acaso (ou ao geral, se não houver).
create or replace function public.distribuir_leads_comercial() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.papel = 'comercial' and new.ativo and new.inquilino_id is null
     and (tg_op = 'INSERT' or not old.ativo or old.papel <> 'comercial')
     and (select count(*) from public.perfis
           where papel = 'comercial' and ativo and inquilino_id is null) = 1 then
    with atribuidos as (
      update public.leads set responsavel_id = new.user_id, atualizado_em = now()
       where responsavel_id is null and estado not in ('ganho','perdido')
      returning id)
    insert into public.lead_eventos (lead_id, tipo, texto)
    select id, 'sistema', 'Atribuído automaticamente ao comercial.' from atribuidos;
  end if;
  if tg_op = 'UPDATE' and old.papel = 'comercial' and old.ativo
     and (not new.ativo or new.papel <> 'comercial') then
    update public.leads set responsavel_id = public.escolher_comercial(), atualizado_em = now()
     where responsavel_id = old.user_id and estado not in ('ganho','perdido');
  end if;
  return null;
end $$;
create trigger perfis_distribuir_leads after insert or update of ativo, papel on perfis
  for each row execute function public.distribuir_leads_comercial();

-- A barbearia pagou a taxa de migração: a comissão vence 10 dias depois (D-162).
create or replace function public.registar_taxa_paga(p_comissao uuid, p_data date) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_super_admin();
  if p_data is null then raise exception 'data_obrigatoria' using errcode = 'P0001'; end if;
  update public.comissoes_comerciais
     set estado = 'a_pagar', taxa_paga_em = p_data, vence_em = p_data + 10
   where id = p_comissao and estado = 'pendente';
  if not found then raise exception 'comissao_invalida' using errcode = 'P0001'; end if;
  perform public.registar_auditoria(null, 'comissao_taxa_paga', 'comissoes_comerciais', p_comissao,
    jsonb_build_object('data', p_data));
end $$;

create or replace function public.marcar_comissao_paga(p_comissao uuid, p_data date) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_super_admin();
  if p_data is null then raise exception 'data_obrigatoria' using errcode = 'P0001'; end if;
  update public.comissoes_comerciais set estado = 'paga', paga_em = p_data
   where id = p_comissao and estado = 'a_pagar';
  if not found then raise exception 'comissao_invalida' using errcode = 'P0001'; end if;
  perform public.registar_auditoria(null, 'comissao_paga', 'comissoes_comerciais', p_comissao,
    jsonb_build_object('data', p_data));
end $$;

-- Saúde das barbearias da carteira de um comercial (D-162): só contagens, para o comercial
-- analisar o risco e cuidar do cliente. As mesmas contagens da página Saúde do admin.
create or replace function public.saude_carteira(p_user uuid default null)
returns table (inquilino_id uuid, nome text, responsavel text, telefone text, estado text,
               estado_pagamento text, aprovada_em date, tem_logotipo boolean,
               servicos_ativos integer, profissionais_ativos integer, profissionais_com_acesso integer,
               clientes integer, marcacoes_total integer, marcacoes_online integer, concluidas integer,
               marcacoes_30 integer, marcacoes_anteriores_30 integer, ultima_marcacao date)
language plpgsql stable security definer set search_path = '' as $$
declare v_user uuid := coalesce(p_user, auth.uid()); v_hoje date := public.hoje_lisboa();
begin
  if not (public.e_super_admin() or (public.e_comercial() and v_user = auth.uid())) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  return query
    with carteira as (
      select i.* from public.leads l join public.inquilinos i on i.id = l.inquilino_id
       where l.responsavel_id = v_user and i.estado in ('ativo','suspenso')),
    m as (
      select mc.inquilino_id, public.hora_local(mc.inicio)::date as dia, mc.origem, mc.concluida_em
        from public.marcacoes mc
       where mc.inquilino_id in (select id from carteira) and mc.estado not in ('cancelada','reservada'))
    select c.id, c.nome, c.responsavel, coalesce(c.whatsapp, c.telefone), c.estado, c.estado_pagamento,
           public.hora_local(c.aprovado_em)::date, c.logo_url is not null,
           (select count(*)::integer from public.servicos s where s.inquilino_id = c.id and s.ativo),
           (select count(*)::integer from public.profissionais p where p.inquilino_id = c.id and p.ativo),
           (select count(*)::integer from public.profissionais p
             where p.inquilino_id = c.id and p.ativo and p.perfil_id is not null),
           (select count(*)::integer from public.clientes k
             where k.inquilino_id = c.id and k.anonimizado_em is null),
           (select count(*)::integer from m where m.inquilino_id = c.id),
           (select count(*)::integer from m where m.inquilino_id = c.id and m.origem = 'online'),
           (select count(*)::integer from m where m.inquilino_id = c.id and m.concluida_em is not null),
           (select count(*)::integer from m where m.inquilino_id = c.id
             and m.dia > v_hoje - 30 and m.dia <= v_hoje),
           (select count(*)::integer from m where m.inquilino_id = c.id
             and m.dia > v_hoje - 60 and m.dia <= v_hoje - 30),
           (select max(m.dia) from m where m.inquilino_id = c.id and m.dia <= v_hoje)
      from carteira c
     order by c.nome;
end $$;

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
  -- A taxa de migração é a comissão do comercial responsável, se estiver ativo (D-162).
  insert into public.comissoes_comerciais (contrato_id, comercial_id, valor)
  select v.id, l.responsavel_id, p.taxa_migracao_sem_iva
    from public.leads l join public.propostas p on p.id = v.proposta_id
   where l.id = v.lead_id and p.taxa_migracao_sem_iva > 0
     and exists (select 1 from public.perfis pf
                  where pf.user_id = l.responsavel_id and pf.papel = 'comercial' and pf.ativo
                    and pf.inquilino_id is null)
  on conflict (contrato_id) do nothing;
end $$;

-- Prepara (ou refaz) a barbearia de demonstração com dados fictícios relativos a hoje: serviços,
-- três profissionais sem conta, clientes com telefones inexistentes (+999…), marcações
-- concluídas nos últimos 30 dias e agendadas nos próximos 7 (D-162). Só os administradores.
create or replace function public.preparar_demonstracao() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid; v_hoje date := public.hoje_lisboa(); v_dia date; v_hora time;
  v_prof uuid[]; v_serv uuid[]; v_cli uuid[]; v_p uuid; v_s uuid; v_c uuid; v_m public.marcacoes%rowtype;
  v_nomes text[] := array['Rui Almeida','Tiago Santos','João Ferreira','Miguel Costa','André Pereira',
    'Pedro Oliveira','Diogo Martins','Bruno Sousa','Ricardo Gomes','Nuno Lopes','Hugo Marques',
    'Carlos Ribeiro','Fábio Carvalho','Luís Teixeira','Paulo Moreira','Vasco Correia','Gonçalo Pinto',
    'Rafael Mendes','Daniel Nunes','Sérgio Rocha','Filipe Barros','Marco Vieira','Duarte Fonseca',
    'Henrique Cardoso','Tomás Antunes','Rodrigo Matos','Simão Leite','Afonso Freitas','Martim Araújo',
    'Leonardo Cunha','Francisco Reis','Gabriel Faria','Samuel Batista','Lucas Tavares','Vítor Moura',
    'Ivo Pacheco','Jorge Simões','Mário Neves','Alexandre Lobo','Emanuel Dias'];
  v_horas time[] := array['10:00','11:00','12:00','14:30','15:30','16:30','17:30','18:30']::time[];
  v_estado text; i integer;
begin
  perform public.exigir_super_admin();
  -- Recomeça do zero: a barbearia antiga e tudo o que é dela saem em cascata.
  delete from public.inquilinos where demonstracao;
  insert into public.inquilinos (slug, nome, responsavel, cidade, plano, periodicidade,
    profissionais_contratados, estado, estado_pagamento, demonstracao, aprovado_em, descricao, capa_cor)
  values ('demonstracao', 'Barbearia Demonstração', 'Demonstração', 'Viseu', 'pro', 'mensal', 3,
    'ativo', 'em_dia', true, now(), 'Barbearia fictícia para mostrar o InstaBarber.', '#F5A623')
  returning id into v_id;
  perform public.aplicar_pacote(v_id);

  insert into public.servicos (inquilino_id, nome, duracao_min, preco, ordem) values
    (v_id, 'Corte', 30, 15, 1), (v_id, 'Barba', 20, 10, 2), (v_id, 'Corte e barba', 45, 22, 3),
    (v_id, 'Corte de criança', 30, 12, 4);
  select array_agg(id order by ordem) into v_serv from public.servicos where inquilino_id = v_id;

  insert into public.profissionais (inquilino_id, nome, nome_apresentado, comissao_percent, ordem) values
    (v_id, 'Carlos Demonstração', 'Carlos', 50, 1), (v_id, 'Tiago Demonstração', 'Tiago', 45, 2),
    (v_id, 'Marta Demonstração', 'Marta', 50, 3);
  select array_agg(id order by ordem) into v_prof from public.profissionais where inquilino_id = v_id;
  insert into public.horarios_profissional (inquilino_id, profissional_id, dia_semana, inicio, fim)
  select v_id, p, d, '09:00', '19:30' from unnest(v_prof) p, generate_series(2, 6) d;

  for i in 1 .. array_length(v_nomes, 1) loop
    insert into public.clientes (inquilino_id, nome, telefone, origem)
    values (v_id, v_nomes[i], '+9990000' || lpad(i::text, 4, '0'),
            (array['online','balcao','qr'])[1 + i % 3]);
  end loop;
  select array_agg(id) into v_cli from public.clientes where inquilino_id = v_id;

  -- Últimos 30 dias: marcações concluídas (com a visita registada) e algumas faltas.
  for v_dia in select d::date from generate_series(v_hoje - 30, v_hoje - 1, interval '1 day') d loop
    continue when extract(dow from v_dia) in (0, 1);
    foreach v_p in array v_prof loop
      foreach v_hora in array v_horas loop
        continue when random() > 0.6;
        v_s := v_serv[1 + floor(random() * array_length(v_serv, 1))::integer];
        v_c := v_cli[1 + floor(random() * array_length(v_cli, 1))::integer];
        v_estado := case when random() < 0.06 then 'falta' else 'concluida' end;
        insert into public.marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio,
                                      estado, origem, concluida_em)
        values (v_id, v_c, v_p, v_s, public.instante_lisboa(v_dia, v_hora), v_estado,
                case when random() < 0.4 then 'online' else 'balcao' end,
                case when v_estado = 'concluida'
                     then public.instante_lisboa(v_dia, v_hora) + interval '40 minutes' end)
        returning * into v_m;
        if v_estado = 'concluida' then
          insert into public.visitas (inquilino_id, marcacao_id, cliente_id, profissional_id, servico_id,
                                      data, valor_tabela, valor_cobrado, base_comissao, comissao_percent,
                                      comissao_valor, modelo_caixa, emitente)
          select v_id, v_m.id, v_m.cliente_id, v_p, v_s, v_m.inicio, v_m.valor_tabela, v_m.valor_cobrado,
                 v_m.valor_cobrado, pr.comissao_percent, round(v_m.valor_cobrado * pr.comissao_percent / 100, 2),
                 pr.modelo_caixa, 'barbearia'
            from public.profissionais pr where pr.id = v_p;
        end if;
      end loop;
    end loop;
  end loop;

  -- Próximos 7 dias: marcações agendadas (as que não cabem na agenda ficam de fora).
  for v_dia in select d::date from generate_series(v_hoje + 1, v_hoje + 7, interval '1 day') d loop
    foreach v_p in array v_prof loop
      foreach v_hora in array v_horas loop
        continue when random() > 0.45;
        begin
          insert into public.marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, estado, origem)
          values (v_id, v_cli[1 + floor(random() * array_length(v_cli, 1))::integer], v_p,
                  v_serv[1 + floor(random() * array_length(v_serv, 1))::integer],
                  public.instante_lisboa(v_dia, v_hora), 'agendada', 'balcao');
        exception when others then null;
        end;
      end loop;
    end loop;
  end loop;

  perform public.registar_auditoria(null, 'demonstracao_preparada', 'inquilinos', v_id, null);
  return v_id;
end $$;

-- Comissões (D-162): os administradores leem (política *_admin_ler) e escrevem pelas funções;
-- o comercial vê as suas.
create policy comissoes_comercial_ler on comissoes_comerciais for select
  using (comercial_id = (select auth.uid()) and (select public.e_comercial()));

-- Painel comercial (D-162): cada função verifica o papel.
revoke all on function public.distribuir_leads_comercial() from public, anon, authenticated;
grant execute on function public.escolher_comercial() to authenticated;
grant execute on function public.registar_taxa_paga(uuid, date), public.marcar_comissao_paga(uuid, date),
  public.saude_carteira(uuid), public.preparar_demonstracao() to authenticated;
