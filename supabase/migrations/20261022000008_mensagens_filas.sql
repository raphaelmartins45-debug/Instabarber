-- =============================================================================
-- Migração 08 · Filas, e-mail de confirmação, clube na página pública e auditoria do
-- interruptor geral dos módulos (Fase 6, D-126). As mesmas alterações estão em
-- docs/esquema/02_funcoes.sql, testadas em docs/esquema/testes/95_mensagens_filas.sql.
-- =============================================================================

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

-- Quem pode executar: retira-se o EXECUTE por omissão e dá-se só o necessário.
revoke execute on function public.posicao_fila_espera(uuid), public.estado_fila_presencial(uuid),
  public.reclamar_email_confirmacao(uuid), public.registar_email_confirmacao(uuid, boolean),
  public.avisar_fila_espera(uuid), public.auditar_modulo_plataforma() from public, anon, authenticated;
grant execute on function public.posicao_fila_espera(uuid), public.estado_fila_presencial(uuid),
  public.reclamar_email_confirmacao(uuid), public.registar_email_confirmacao(uuid, boolean),
  public.avisar_fila_espera(uuid), public.auditar_modulo_plataforma() to service_role;
grant execute on function public.posicao_fila_espera(uuid), public.estado_fila_presencial(uuid),
  public.reclamar_email_confirmacao(uuid), public.registar_email_confirmacao(uuid, boolean)
  to anon, authenticated;
grant execute on function public.avisar_fila_espera(uuid) to authenticated;
revoke all on publico_clubes from anon, authenticated;
grant select on publico_clubes to anon, authenticated;
