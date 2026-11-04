begin;
-- O cartão compacto e o perfil do barbeiro na página pública (D-210): uma apresentação curta e
-- as especialidades, que o próprio barbeiro ou o gestor escrevem no perfil. A equipa da
-- demonstração já as traz, por um gatilho ao criar os barbeiros.

alter table public.profissionais add column apresentacao text
  check (apresentacao is null or char_length(apresentacao) <= 280);

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
  if not (v_mudou <@ array['nome_apresentado','foto_url','portfolio_visivel','apresentacao','especialidades']) then
    raise exception 'campo_protegido' using errcode = '42501', detail = array_to_string(v_mudou, ',');
  end if;
  return new;
end $$;

create or replace view public.publico_profissionais as
  select p.id, p.inquilino_id, p.nome_apresentado, p.foto_url, p.ordem,
         (p.portfolio_visivel and public.funcionalidade_ativa(p.inquilino_id, 'portfolio_barbeiro')) as portfolio_visivel,
         p.apresentacao, p.especialidades
    from public.profissionais p join public.inquilinos i on i.id = p.inquilino_id
   where p.ativo and i.estado = 'ativo';

-- A equipa da demonstração apresenta-se (D-210): ao criar os barbeiros da barbearia de
-- demonstração, a apresentação e as especialidades do cartão e do perfil na página pública.
create or replace function public.apresentar_equipa_demonstracao() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from public.inquilinos where id = new.inquilino_id and demonstracao) then
    new.apresentacao := coalesce(new.apresentacao, case new.ordem
      when 1 then 'Especialista em degradês e barba à navalha. Gosto de conversa boa e de cortes que duram.'
      when 2 then 'Cortes à tesoura e estilos clássicos, com tempo para cada detalhe.'
      else 'Cortes de criança e estilos modernos, com paciência e boa disposição.' end);
    if cardinality(new.especialidades) = 0 then
      new.especialidades := case new.ordem
        when 1 then array['Degradês', 'Barba clássica']
        when 2 then array['Cortes à tesoura', 'Clássicos']
        else array['Cortes de criança', 'Estilos modernos'] end;
    end if;
  end if;
  return new;
end $$;
create trigger profissionais_demonstracao before insert on public.profissionais
  for each row execute function public.apresentar_equipa_demonstracao();

commit;
