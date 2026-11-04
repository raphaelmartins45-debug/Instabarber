-- Demonstração para a equipa comercial (D-207): «Gerar» e «Reset» na página Demo. A função
-- preparar_demonstracao passa a personalizar a barbearia de demonstração (nome, logótipo, cor,
-- versão Basic ou Pro, cidade, WhatsApp, modelo), cria a loja com fotografias e o cartão oferta,
-- liga as contas de demonstração e fica ao alcance dos comerciais.

drop function public.preparar_demonstracao();

-- A barbearia de demonstração (D-162, D-207): «Gerar» e «Reset» da página Demo. Recomeça sempre
-- do zero, com os dados de hoje; com argumentos, fica personalizada para a reunião (nome,
-- logótipo, cor do cabeçalho, versão, cidade, WhatsApp e modelo da página). Liga as contas de
-- demonstração do gestor e do barbeiro. A equipa da InstaBarber toda pode usar (comerciais
-- incluídos).
create or replace function public.preparar_demonstracao(
  p_plano text default 'pro', p_gestor uuid default null, p_barbeiro uuid default null,
  p_nome text default null, p_logo text default null, p_cor text default null,
  p_cidade text default null, p_whatsapp text default null, p_estilo text default 'anuario')
returns uuid
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
  if not (public.e_super_admin() or public.e_comercial()) then
    raise exception 'sem_permissao' using errcode = '42501';
  end if;
  if p_plano not in ('basic','pro') then raise exception 'plano_invalido' using errcode = 'P0001'; end if;
  -- Recomeça do zero: a barbearia antiga e tudo o que é dela saem em cascata.
  delete from public.inquilinos where demonstracao;
  insert into public.inquilinos (slug, nome, responsavel, cidade, plano, periodicidade,
    profissionais_contratados, estado, estado_pagamento, demonstracao, aprovado_em, descricao, capa_cor,
    logo_url, whatsapp, estilo_pagina)
  values ('demonstracao', coalesce(nullif(trim(p_nome), ''), 'Barbearia Demonstração'), 'Demonstração',
    coalesce(nullif(trim(p_cidade), ''), 'Viseu'), p_plano, 'mensal', case when p_plano = 'basic' then 1 else 3 end,
    'ativo', 'em_dia', true, now(), 'Barbearia fictícia para mostrar o InstaBarber.',
    coalesce(p_cor, '#111111'), p_logo, p_whatsapp, coalesce(p_estilo, 'anuario'))
  returning id into v_id;
  perform public.aplicar_pacote(v_id);

  insert into public.servicos (inquilino_id, nome, duracao_min, preco, ordem) values
    (v_id, 'Corte', 30, 15, 1), (v_id, 'Barba', 20, 10, 2), (v_id, 'Corte e barba', 45, 22, 3),
    (v_id, 'Corte de criança', 30, 12, 4);
  select array_agg(id order by ordem) into v_serv from public.servicos where inquilino_id = v_id;

  insert into public.profissionais (inquilino_id, nome, nome_apresentado, comissao_percent, ordem) values
    (v_id, 'Carlos Demonstração', 'Carlos', 50, 1);
  -- Na versão Basic, um só barbeiro (o plano tem um profissional).
  if p_plano = 'pro' then
    insert into public.profissionais (inquilino_id, nome, nome_apresentado, comissao_percent, ordem) values
      (v_id, 'Tiago Demonstração', 'Tiago', 45, 2), (v_id, 'Marta Demonstração', 'Marta', 50, 3);
  end if;
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

  -- O WhatsApp de teste (D-207): é o da barbearia (as mensagens dos clientes chegam lá) e o de um
  -- cliente de teste com marcação amanhã (os lembretes da barbearia chegam lá também).
  if p_whatsapp is not null then
    update public.clientes set nome = 'Cliente de teste', telefone = p_whatsapp where id = v_cli[1];
    begin
      insert into public.marcacoes (inquilino_id, cliente_id, profissional_id, servico_id, inicio, estado, origem)
      values (v_id, v_cli[1], v_prof[1], v_serv[1], public.instante_lisboa(v_hoje + 1, '09:00'), 'agendada', 'balcao');
    exception when others then null;
    end;
  end if;

  -- A loja: três produtos com fotografia e o cartão oferta (só aparecem com a loja ligada).
  insert into public.produtos (inquilino_id, nome, descricao, foto_url, custo, preco_venda, stock) values
    (v_id, 'Pomada mate', 'Fixação forte e acabamento seco, sem brilho. 100 ml.', '/marca/loja/pomada.jpg', 5, 14.90, 12),
    (v_id, 'Óleo de barba', 'Óleo leve com cedro e argão. Amacia a barba sem deixar brilho. 30 ml.', '/marca/loja/oleo.jpg', 4, 12.50, 8),
    (v_id, 'Champô de barba', 'Limpeza suave para a barba e a pele. 150 ml.', '/marca/loja/champo.jpg', 3, 9.90, 15),
    (v_id, 'Cartão oferta', 'Ofereça uma experiência na barbearia, com o valor que quiser.', '/marca/loja/cartao-oferta.svg', 0, 25.00, 50);

  -- As contas de demonstração: o gestor e o barbeiro (o Carlos).
  if p_gestor is not null then
    insert into public.perfis (user_id, inquilino_id, papel, nome) values (p_gestor, v_id, 'proprietario', 'Gestor da demonstração');
  end if;
  if p_barbeiro is not null then
    insert into public.perfis (user_id, inquilino_id, papel, nome) values (p_barbeiro, v_id, 'profissional', 'Carlos');
    update public.profissionais set perfil_id = (select id from public.perfis where user_id = p_barbeiro and inquilino_id = v_id)
     where inquilino_id = v_id and ordem = 1;
  end if;

  perform public.registar_auditoria(null, 'demonstracao_preparada', 'inquilinos', v_id, null);
  return v_id;
end $$;

revoke all on function public.preparar_demonstracao(text, uuid, uuid, text, text, text, text, text, text)
  from public, anon;
grant execute on function public.preparar_demonstracao(text, uuid, uuid, text, text, text, text, text, text)
  to authenticated;

create policy storage_publico_demonstracao on storage.objects for all
  using (bucket_id = 'publico' and (storage.foldername(name))[1] = 'demonstracao'
         and ((select public.e_super_admin()) or (select public.e_comercial())))
  with check (bucket_id = 'publico' and (storage.foldername(name))[1] = 'demonstracao'
              and ((select public.e_super_admin()) or (select public.e_comercial())));
