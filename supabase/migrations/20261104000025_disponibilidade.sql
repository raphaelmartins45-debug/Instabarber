-- Disponibilidade (D-202): nenhuma marcação numa hora que já passou, venha de onde vier; o
-- horário de cada barbeiro cabe no da barbearia e só o pode estreitar; o barbeiro gere o seu
-- horário e bloqueia as suas horas; um bloqueio ou ausência nunca fica por cima de marcações.

-- O relógio da agenda: o instante atual. Os testes SQL fixam-no numa data.
create or replace function public.agora() returns timestamptz
language sql stable set search_path = '' as $$ select now() $$;

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

  -- Nunca numa hora que já passou, venha de onde vier: página pública, gestor ou barbeiro (D-202).
  if p_inicio < public.agora() then return 'passado'; end if;

  v_fim   := p_inicio + make_interval(mins => v_duracao);
  v_ini_l := public.hora_local(p_inicio);
  v_fim_l := public.hora_local(v_fim);
  v_dia   := v_ini_l::date;
  v_dow   := extract(dow from v_ini_l)::integer;

  if p_publico then
    if p_inicio < public.agora() + make_interval(mins => t.antecedencia_minima_min) then return 'antecedencia'; end if;
    if v_dia > (public.hora_local(public.agora())::date + t.janela_marcacao_dias) then return 'fora_da_janela'; end if;
  end if;

  if v_fim_l::date <> v_dia and v_fim_l::time <> '00:00' then return 'fora_do_horario'; end if;

  if exists (select 1 from public.feriados f
              where f.data = v_dia
                and ((f.inquilino_id is null and t.fecha_feriados) or f.inquilino_id = p_inquilino)) then
    return 'feriado';
  end if;

  select exists (select 1 from public.horarios_profissional where profissional_id = p_profissional)
    into v_tem_horario;

  -- O horário da barbearia vale sempre; o do profissional só o pode estreitar (D-202).
  if v_dow = any (t.dias_descanso) then return 'dia_de_descanso'; end if;
  if v_ini_l::time < t.hora_abertura or v_fim_l > v_dia + t.hora_fecho then return 'fora_do_horario'; end if;

  if v_tem_horario then
    -- Horário próprio: o serviço cabe inteiro numa das linhas desse dia.
    if not exists (select 1 from public.horarios_profissional h
                    where h.profissional_id = p_profissional and h.dia_semana = v_dow
                      and v_ini_l::time >= h.inicio and v_fim_l <= v_dia + h.fim) then
      return 'fora_do_horario';
    end if;
  else
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

-- Um bloqueio ou ausência nunca fica por cima de marcações: quem bloqueia vê-as e trata
-- delas primeiro (D-202). Com profissional nulo, conta a barbearia inteira.
create or replace function public.ausencias_antes_gravar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.marcacoes m
              where m.inquilino_id = new.inquilino_id
                and (new.profissional_id is null or m.profissional_id = new.profissional_id)
                and (m.estado = 'agendada' or (m.estado = 'reservada' and m.reservada_ate > now()))
                and m.periodo && tstzrange(new.inicio, new.fim, '[)')) then
    raise exception 'marcacoes_no_periodo' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger ausencias_validar before insert or update of inicio, fim, profissional_id on ausencias
  for each row execute function public.ausencias_antes_gravar();

-- O horário de um profissional cabe no horário de funcionamento da barbearia (D-202).
create or replace function public.horarios_antes_gravar() returns trigger
language plpgsql security definer set search_path = '' as $$
declare t public.inquilinos%rowtype;
begin
  select * into t from public.inquilinos where id = new.inquilino_id;
  if new.dia_semana = any (t.dias_descanso) or new.inicio < t.hora_abertura or new.fim > t.hora_fecho then
    raise exception 'fora_do_horario_barbearia' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger horarios_validar before insert or update on horarios_profissional
  for each row execute function public.horarios_antes_gravar();

-- Os bloqueios de horas são um tipo de ausência; quem cria fica registado por omissão.
alter table public.ausencias drop constraint ausencias_tipo_check;
alter table public.ausencias add constraint ausencias_tipo_check
  check (tipo in ('ferias','folga','formacao','doenca','outro','bloqueio'));
alter table public.ausencias alter column criado_por set default auth.uid();

-- O barbeiro gere o seu próprio horário e as suas horas bloqueadas (apaga só o que criou).
create policy horarios_proprio on horarios_profissional for all
  using (profissional_id in (select public.meus_profissionais()))
  with check (profissional_id in (select public.meus_profissionais()));
create policy ausencias_proprio on ausencias for all
  using (profissional_id in (select public.meus_profissionais()) and criado_por = auth.uid())
  with check (profissional_id in (select public.meus_profissionais()) and criado_por = auth.uid());

-- Internas: os gatilhos e o relógio só correm dentro de outras funções.
revoke all on function public.ausencias_antes_gravar(), public.horarios_antes_gravar(), public.agora()
  from public, anon, authenticated;
