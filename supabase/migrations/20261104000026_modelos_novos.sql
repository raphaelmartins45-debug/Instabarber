-- Mais quatro modelos da página pública (D-204): Produto, Pedido, Noite e Bento.
alter table public.inquilinos drop constraint inquilinos_estilo_pagina_check;
alter table public.inquilinos add constraint inquilinos_estilo_pagina_check
  check (estilo_pagina in ('monumento','sala_escura','cartaz','cartao','palco','bairro','anuario','vitrine',
                           'produto','pedido','noite','bento'));

-- As regras da agenda que dependem da hora usam o relógio da agenda (D-202): em produção é a
-- hora real; os testes fixam-no e deixam de depender do dia em que correm.
create or replace function public.orfas_ao_desativar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.ativo and not new.ativo then
    update public.marcacoes set profissional_id = null
     where profissional_id = new.id and estado in ('reservada','agendada') and inicio > public.agora();
  end if;
  return new;
end $$;

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
       where x.cliente_id = v_cliente and x.estado = 'agendada' and x.inicio > public.agora()) >= 3 then
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
  if m.inicio > public.agora() then raise exception 'ainda_nao_comecou' using errcode = 'P0001'; end if;
  update public.marcacoes set estado = 'falta' where id = m.id;
end $$;
