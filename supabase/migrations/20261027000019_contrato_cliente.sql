-- Contrato enviado ao cliente e carregado por ele; telefone da equipa InstaBarber (D-181).
-- O cliente recebe por e-mail uma ligação de uso próprio (só o hash fica aqui), descarrega o
-- contrato e carrega o PDF assinado; o contrato fica «carregado» até a equipa o conferir. A
-- aprovação usa assinar_contrato(), como o carregamento feito pela equipa.

-- 1 · Telefone de quem está na equipa InstaBarber, para o folheto de visita
alter table public.perfis
  add column telefone text,
  add constraint perfis_telefone check (telefone is null or telefone ~ '^\+[1-9][0-9]{7,14}$');

-- Cada pessoa da equipa muda só o seu telefone (os administradores e o comercial).
create or replace function public.mudar_meu_telefone(p_telefone text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform public.exigir_comercial_ou_admin();
  if p_telefone is not null and p_telefone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'telefone_invalido' using errcode = 'P0001';
  end if;
  update public.perfis set telefone = p_telefone
   where user_id = auth.uid() and inquilino_id is null;
end $$;

-- 2 · O contrato enviado ao cliente e carregado por ele
alter table public.contratos
  drop constraint contratos_estado_check,
  add constraint contratos_estado_check
    check (estado in ('rascunho','enviado','carregado','assinado','terminado','cancelado')),
  add column envio_token_hash text unique,
  add column envio_expira_em timestamptz,
  add column enviado_cliente_em timestamptz,
  add column carregado_path text,
  add column carregado_em timestamptz,
  add column recusa_motivo text,
  add constraint contratos_carregado
    check (estado <> 'carregado' or (carregado_path is not null and carregado_em is not null));

drop index public.contratos_um_ativo;
create unique index contratos_um_ativo on public.contratos (proposta_id)
  where estado in ('rascunho','enviado','carregado','assinado');

-- Guarda o hash da ligação enviada ao cliente (válida p_dias) e marca o contrato como enviado.
-- O motivo de uma recusa anterior fica até o cliente carregar outra vez.
create or replace function public.preparar_envio_contrato(p_contrato uuid, p_token text, p_dias integer default 30)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('rascunho','enviado') then
    raise exception 'contrato_nao_enviavel' using errcode = 'P0001';
  end if;
  if p_token is null or length(p_token) < 32 then raise exception 'token_fraco' using errcode = 'P0001'; end if;
  if p_dias is null or p_dias not between 1 and 60 then raise exception 'prazo_invalido' using errcode = 'P0001'; end if;
  update public.contratos
     set estado = 'enviado',
         envio_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex'),
         envio_expira_em = now() + make_interval(days => p_dias),
         enviado_cliente_em = now()
   where id = p_contrato;
  perform public.evento_lead(v.lead_id, 'contrato',
    'Contrato ' || v.numero || ' enviado ao cliente por e-mail.', jsonb_build_object('contrato', p_contrato));
end $$;

-- O que a página do cliente mostra: só com a ligação certa, dentro do prazo e antes de assinado.
create or replace function public.contrato_do_cliente(p_token text)
returns table (id uuid, lead_id uuid, numero text, estado text, contratante text, recusa_motivo text)
language sql stable security definer set search_path = '' as $$
  select c.id, c.lead_id, c.numero, c.estado, c.dados ->> 'razao_social', c.recusa_motivo
    from public.contratos c
   where c.envio_token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
     and c.envio_expira_em > now()
     and c.estado in ('enviado','carregado')
$$;

-- O cliente carregou o PDF assinado (no caminho que a aplicação lhe deu): fica por conferir.
create or replace function public.registar_carregamento_contrato(p_token text, p_path text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  select * into v from public.contratos
   where envio_token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex')
     and envio_expira_em > now() and estado in ('enviado','carregado')
   for update;
  if v.id is null then return false; end if;
  if p_path is distinct from 'leads/' || v.lead_id || '/contratos/' || v.id || '-carregado.pdf' then
    return false;
  end if;
  update public.contratos
     set estado = 'carregado', carregado_path = p_path, carregado_em = now(), recusa_motivo = null
   where id = v.id;
  insert into public.lead_eventos (lead_id, tipo, texto, detalhes)
  values (v.lead_id, 'contrato', 'O cliente carregou o contrato ' || v.numero || ' assinado.',
          jsonb_build_object('contrato', v.id));
  return true;
end $$;

-- A equipa recusa o PDF carregado (ilegível, sem assinatura…): volta a «enviado», com o motivo.
create or replace function public.recusar_carregamento_contrato(p_contrato uuid, p_motivo text)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null or v.estado <> 'carregado' then
    raise exception 'contrato_nao_carregado' using errcode = 'P0001';
  end if;
  if coalesce(trim(p_motivo), '') = '' then raise exception 'motivo_obrigatorio' using errcode = 'P0001'; end if;
  update public.contratos
     set estado = 'enviado', recusa_motivo = left(trim(p_motivo), 400),
         carregado_path = null, carregado_em = null
   where id = p_contrato;
  perform public.evento_lead(v.lead_id, 'contrato',
    'Contrato ' || v.numero || ' carregado recusado: ' || left(trim(p_motivo), 400), jsonb_build_object('contrato', p_contrato));
end $$;

-- assinar_contrato() aceita também o contrato carregado pelo cliente (a aprovação da equipa).
create or replace function public.assinar_contrato(p_contrato uuid, p_data date, p_pdf_assinado text, p_inicio date default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v public.contratos%rowtype;
begin
  perform public.exigir_comercial_ou_admin();
  select * into v from public.contratos where id = p_contrato for update;
  if v.id is not null then perform public.exigir_lead(v.lead_id); end if;
  if v.id is null then raise exception 'contrato_inexistente' using errcode = 'P0001'; end if;
  if v.estado not in ('rascunho','enviado','carregado') then raise exception 'contrato_nao_assinavel' using errcode = 'P0001'; end if;
  if p_data is null or coalesce(trim(p_pdf_assinado), '') = '' then
    raise exception 'assinatura_incompleta' using errcode = 'P0001';
  end if;
  update public.contratos
     set estado = 'assinado', assinado_em = p_data, pdf_assinado_path = p_pdf_assinado,
         data_inicio = coalesce(p_inicio, data_inicio), envio_token_hash = null
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

revoke all on function public.mudar_meu_telefone(text),
  public.preparar_envio_contrato(uuid, text, integer), public.contrato_do_cliente(text),
  public.registar_carregamento_contrato(text, text), public.recusar_carregamento_contrato(uuid, text)
  from public, anon;
grant execute on function public.mudar_meu_telefone(text),
  public.preparar_envio_contrato(uuid, text, integer),
  public.recusar_carregamento_contrato(uuid, text)
  to authenticated;
grant execute on function public.contrato_do_cliente(text),
  public.registar_carregamento_contrato(text, text)
  to anon, authenticated;
grant execute on function public.mudar_meu_telefone(text),
  public.preparar_envio_contrato(uuid, text, integer), public.contrato_do_cliente(text),
  public.registar_carregamento_contrato(text, text), public.recusar_carregamento_contrato(uuid, text)
  to service_role;
