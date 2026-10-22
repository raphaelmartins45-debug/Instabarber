-- =============================================================================
-- Dados de teste: duas barbearias (A e B), os cinco papéis, serviços,
-- profissionais, clientes e marcações. Datas futuras fixas (quarta-feira,
-- 4 de novembro de 2026). Só para testes; nunca em produção.
-- =============================================================================

create schema teste;

create function teste.ok(c boolean, n text) returns void language plpgsql as $$
begin
  if c is not true then raise exception 'FALHOU: %', n; end if;
  raise notice 'ok   %', n;
end $$;

-- A instrução tem de dar erro.
create function teste.erro(q text, n text) returns void language plpgsql as $$
begin
  begin
    execute q;
  exception when others then
    raise notice 'ok   % [%]', n, sqlerrm;
    return;
  end;
  raise exception 'FALHOU (não deu erro): %', n;
end $$;

-- A instrução não pode afetar nenhuma linha (o RLS esconde-as).
create function teste.zero(q text, n text) returns void language plpgsql as $$
declare k integer;
begin
  execute q;
  get diagnostics k = row_count;
  if k <> 0 then raise exception 'FALHOU (% linhas afetadas): %', k, n; end if;
  raise notice 'ok   %', n;
end $$;

-- Muda a sessão para um utilizador (papel authenticated) ou para anónimo.
create function teste.como(u uuid, aal text default 'aal1') returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'aal', aal, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;
create function teste.anonimo() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
end $$;
grant usage on schema teste to anon, authenticated, service_role;
grant execute on all functions in schema teste to anon, authenticated, service_role;

-- Utilizadores
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'admin@performa.pt'),
  ('10000000-0000-0000-0000-000000000002', 'dono@a.pt'),
  ('10000000-0000-0000-0000-000000000003', 'barbeiro1@a.pt'),
  ('10000000-0000-0000-0000-000000000004', 'barbeiro2@a.pt'),
  ('10000000-0000-0000-0000-000000000005', 'dono@b.pt'),
  ('10000000-0000-0000-0000-000000000006', 'barbeiro1@b.pt'),
  ('10000000-0000-0000-0000-000000000007', '351912000001.a@clientes.instabarber.pt'),
  ('10000000-0000-0000-0000-000000000008', '351913000001.b@clientes.instabarber.pt');

-- Barbearias
insert into inquilinos (id, slug, nome, plano, profissionais_contratados, estado, nif) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'barbearia-a', 'Barbearia A', 'pro', 3, 'ativo', '500000001'),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'barbearia-b', 'Barbearia B', 'pro', 3, 'ativo', '500000002');

insert into perfis (user_id, inquilino_id, papel, nome) values
  ('10000000-0000-0000-0000-000000000001', null, 'super_admin', 'Performa LAB'),
  ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000000', 'proprietario', 'Dono A'),
  ('10000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000000', 'profissional', 'Rafael'),
  ('10000000-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000000', 'profissional', 'Diogo'),
  ('10000000-0000-0000-0000-000000000005', 'bbbbbbbb-0000-0000-0000-000000000000', 'proprietario', 'Dono B'),
  ('10000000-0000-0000-0000-000000000006', 'bbbbbbbb-0000-0000-0000-000000000000', 'profissional', 'Tiago');

insert into profissionais (id, inquilino_id, perfil_id, nome, nome_apresentado, ordem) values
  ('20000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000',
   (select id from perfis where user_id = '10000000-0000-0000-0000-000000000003'), 'Rafael Costa', 'Rafael', 1),
  ('20000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000000',
   (select id from perfis where user_id = '10000000-0000-0000-0000-000000000004'), 'Diogo Lima', 'Diogo', 2),
  ('20000000-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000000',
   (select id from perfis where user_id = '10000000-0000-0000-0000-000000000006'), 'Tiago Sousa', 'Tiago', 1);

insert into servicos (id, inquilino_id, nome, duracao_min, preco) values
  ('30000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', 'Corte', 30, 15.00),
  ('30000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000000', 'Barba', 20, 10.00),
  ('30000000-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000000', 'Corte', 30, 14.00);

insert into clientes (id, inquilino_id, nome, telefone, auth_user_id, origem) values
  ('40000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', 'João', '+351912000001',
   '10000000-0000-0000-0000-000000000007', 'online'),
  ('40000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000000', 'Pedro', '+351912000002', null, 'balcao'),
  ('40000000-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000000', 'Miguel', '+351913000001',
   '10000000-0000-0000-0000-000000000008', 'online');

select aplicar_pacote('aaaaaaaa-0000-0000-0000-000000000000');
select aplicar_pacote('bbbbbbbb-0000-0000-0000-000000000000');

-- Marcações ao balcão na quarta-feira, 4 de novembro de 2026
insert into marcacoes (id, inquilino_id, cliente_id, profissional_id, servico_id, inicio, origem) values
  ('50000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04', '10:00'), 'balcao'),
  ('50000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', instante_lisboa('2026-11-04', '11:00'), 'balcao'),
  ('50000000-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000000', '40000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', instante_lisboa('2026-11-04', '10:00'), 'balcao');

insert into custos_fixos (inquilino_id, descricao, valor, vencimento) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'Renda', 800, '2026-11-08');
insert into pedidos_adesao (nome, email_acesso, mensalidade_calculada, aceitou_termos_em)
  values ('Barbearia Nova', 'nova@x.pt', 39, now());
