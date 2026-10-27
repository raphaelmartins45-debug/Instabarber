-- =============================================================================
-- InstaBarber · Esquema da base de dados · versão 10.1
-- Ficheiro 03 de 04 — Row Level Security: a matriz papel × tabela × operação.
--
-- Cinco papéis:
--   anon          visitante da página pública, sem sessão
--   cliente       sessão de cliente final (clientes.auth_user_id = auth.uid())
--   profissional  barbeiro, com perfil no inquilino
--   proprietario  dono / gestor da barbearia
--   super_admin   Performa LAB, com sessão de dois fatores
--
-- Regras de leitura da matriz:
--   * Sem política, nada passa. Todas as tabelas do public têm RLS ativo.
--   * Cada política verifica o papel. Nunca só o inquilino (B6, B7).
--   * As funções de apoio devolvem conjuntos e são chamadas dentro de
--     (select …): o Postgres avalia-as uma vez por consulta, não por linha.
--   * O anon nunca lê tabelas: lê as vistas publico_* e chama as funções
--     públicas do ficheiro 02.
--   * O cliente nunca escreve tabelas: usa as funções do ficheiro 02.
-- =============================================================================

do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- Abreviaturas usadas abaixo, por extenso em cada política:
--   PRO  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
--   EQ   inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
--   SA   (select public.e_super_admin())
--   MP   profissional_id in (select public.meus_profissionais())
--   MC   cliente_id in (select public.meus_clientes())

-- -----------------------------------------------------------------------------
-- Inquilinos e perfis
-- -----------------------------------------------------------------------------
create policy inquilinos_ler on inquilinos for select using (
  id in (select public.inquilinos_onde(array['proprietario','profissional'], false))
  or (select public.e_super_admin()));
create policy inquilinos_alterar on inquilinos for update using (
  id in (select public.inquilinos_onde(array['proprietario'])) or (select public.e_super_admin()))
  with check (id in (select public.inquilinos_onde(array['proprietario'])) or (select public.e_super_admin()));
create policy inquilinos_criar on inquilinos for insert with check ((select public.e_super_admin()));
create policy inquilinos_apagar on inquilinos for delete using ((select public.e_super_admin()));

create policy perfis_ler on perfis for select using (
  user_id = auth.uid()
  or inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or (select public.e_super_admin()));
-- Equipa InstaBarber (D-161). Os perfis das barbearias escrevem-se pelos administradores; os
-- da equipa InstaBarber só pelo dono. O comercial trabalha só os leads de que é responsável.
create policy perfis_escrever_barbearia on perfis for all
  using (inquilino_id is not null and (select public.e_super_admin()))
  with check (inquilino_id is not null and (select public.e_super_admin()));
create policy perfis_escrever_plataforma on perfis for all
  using (inquilino_id is null and (select public.e_dono_plataforma()))
  with check (inquilino_id is null and (select public.e_dono_plataforma()));


-- -----------------------------------------------------------------------------
-- Equipa, horários, ausências, feriados
-- -----------------------------------------------------------------------------
create policy profissionais_ler on profissionais for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or (select public.e_super_admin()));
create policy profissionais_criar on profissionais for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'])) or (select public.e_super_admin()));
-- O próprio barbeiro também altera a sua ficha; o gatilho limita os campos (B3).
create policy profissionais_alterar on profissionais for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or id in (select public.meus_profissionais())
  or (select public.e_super_admin()));
create policy profissionais_apagar on profissionais for delete using ((select public.e_super_admin()));

create policy horarios_ler on horarios_profissional for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy horarios_escrever on horarios_profissional for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy ausencias_ler on ausencias for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy ausencias_escrever on ausencias for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy feriados_ler on feriados for select using (
  inquilino_id is null
  or inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy feriados_escrever on feriados for all
  using ((inquilino_id is not null and inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
         or (select public.e_super_admin()))
  with check ((inquilino_id is not null and inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
              or (select public.e_super_admin()));

-- -----------------------------------------------------------------------------
-- Serviços e comissões
-- -----------------------------------------------------------------------------
create policy servicos_ler on servicos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or (select public.e_super_admin()));
create policy servicos_escrever on servicos for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])) or (select public.e_super_admin()))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])) or (select public.e_super_admin()));

-- O barbeiro lê as suas percentagens; só o gestor as escreve (B3).
create policy comissoes_ler on comissoes_servico for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or profissional_id in (select public.meus_profissionais()));
create policy comissoes_escrever on comissoes_servico for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

-- -----------------------------------------------------------------------------
-- Clientes
-- -----------------------------------------------------------------------------
create policy clientes_ler on clientes for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or id in (select public.clientes_do_profissional())
  or (criado_por = auth.uid() and inquilino_id in (select public.inquilinos_onde(array['profissional'])))
  or id in (select public.meus_clientes())
  or (select public.e_super_admin()));
create policy clientes_criar on clientes for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy clientes_alterar on clientes for update
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario']))
         or id in (select public.clientes_do_profissional()))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
-- Importação de clientes pelo InstaBarber Admin (E.1): o super_admin com dois fatores cria
-- clientes de qualquer barbearia. Não lhes altera nem apaga nada.
create policy clientes_admin_criar on clientes for insert with check ((select public.e_super_admin()));
-- Sem DELETE: o direito de eliminação é anonimizar_cliente().

create policy fichas_ler on fichas_tecnicas for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or cliente_id in (select public.clientes_do_profissional()));
create policy fichas_criar on fichas_tecnicas for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or (cliente_id in (select public.clientes_do_profissional())
      and inquilino_id in (select public.inquilinos_onde(array['profissional']))));
create policy fichas_alterar on fichas_tecnicas for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'])) or criado_por = auth.uid());
create policy fichas_apagar on fichas_tecnicas for delete using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'])) or criado_por = auth.uid());

-- A equipa vê os códigos para os enviar por wa.me; ninguém os escreve diretamente.
create policy codigos_ler on codigos_acesso for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy codigos_marcar_enviado on codigos_acesso for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));

-- -----------------------------------------------------------------------------
-- Marcações, visitas e selos
-- -----------------------------------------------------------------------------
create policy marcacoes_ler on marcacoes for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or profissional_id in (select public.meus_profissionais())
  or cliente_id in (select public.meus_clientes())
  or (select public.e_super_admin()));
-- Marcação ao balcão: o gestor para qualquer barbeiro, o barbeiro para si.
-- O cliente não insere: usa reservar_vaga() e confirmar_reserva() (B5).
create policy marcacoes_criar on marcacoes for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or (profissional_id in (select public.meus_profissionais())
      and inquilino_id in (select public.inquilinos_onde(array['profissional']))));
create policy marcacoes_alterar on marcacoes for update
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario']))
         or profissional_id in (select public.meus_profissionais()))
  with check ((inquilino_id in (select public.inquilinos_onde(array['proprietario']))
               or profissional_id in (select public.meus_profissionais()))
              and estado <> 'concluida');   -- concluir só por concluir_marcacao()

create policy visitas_ler on visitas for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or profissional_id in (select public.meus_profissionais())
  or cliente_id in (select public.meus_clientes())
  or (select public.e_super_admin()));
-- Sem escrita direta: só concluir_marcacao().

create policy selos_ler on movimentos_selos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or cliente_id in (select public.clientes_do_profissional())
  or cliente_id in (select public.meus_clientes()));
create policy selos_ajustar on movimentos_selos for insert with check (
  tipo = 'ajuste' and inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

-- -----------------------------------------------------------------------------
-- Clube, cartões oferta
-- -----------------------------------------------------------------------------
create policy clubes_ler on clubes for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or id in (select s.clube_id from public.subscricoes s where s.cliente_id in (select public.meus_clientes())));
create policy clubes_escrever on clubes for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy clube_servicos_ler on clube_servicos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or clube_id in (select s.clube_id from public.subscricoes s where s.cliente_id in (select public.meus_clientes())));
create policy clube_servicos_escrever on clube_servicos for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy subscricoes_ler on subscricoes for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or cliente_id in (select public.meus_clientes()));
create policy subscricoes_escrever on subscricoes for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy ciclos_ler on ciclos_clube for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or subscricao_id in (select s.id from public.subscricoes s where s.cliente_id in (select public.meus_clientes())));
create policy ciclos_escrever on ciclos_clube for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy creditos_ler on creditos_clube for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or ciclo_id in (select c.id from public.ciclos_clube c join public.subscricoes s on s.id = c.subscricao_id
                   where s.cliente_id in (select public.meus_clientes())));
create policy creditos_escrever on creditos_clube for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy cartoes_ler on cartoes_oferta for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy cartoes_vender on cartoes_oferta for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy cartoes_alterar on cartoes_oferta for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy mov_cartao_ler on movimentos_cartao for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy mov_cartao_usar on movimentos_cartao for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));

-- -----------------------------------------------------------------------------
-- Preços por período, promoções, portfólio
-- -----------------------------------------------------------------------------
create policy periodos_ler on periodos_desconto for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy periodos_escrever on periodos_desconto for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy promocoes_ler on promocoes for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy promocoes_escrever on promocoes for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy portfolio_ler on portfolio_fotos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy portfolio_escrever on portfolio_fotos for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario']))
         or profissional_id in (select public.meus_profissionais()))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario']))
              or profissional_id in (select public.meus_profissionais()));

-- -----------------------------------------------------------------------------
-- Filas
-- -----------------------------------------------------------------------------
create policy fila_espera_ler on fila_espera for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or cliente_id in (select public.meus_clientes()));
create policy fila_espera_alterar on fila_espera for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));

create policy fila_presencial_ler on fila_presencial for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or cliente_id in (select public.meus_clientes()));
create policy fila_presencial_alterar on fila_presencial for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));

-- -----------------------------------------------------------------------------
-- Loja
-- -----------------------------------------------------------------------------
create policy produtos_ler on produtos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])));
create policy produtos_escrever on produtos for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy pedidos_ler on pedidos_loja for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or cliente_id in (select public.meus_clientes()));
-- Marcar pronto ou cancelar. Levantar só por levantar_pedido(), que desconta o stock.
create policy pedidos_alterar on pedidos_loja for update
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
              and estado in ('novo','pronto','cancelado'));

create policy pedido_linhas_ler on pedido_linhas for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional']))
  or pedido_id in (select p.id from public.pedidos_loja p where p.cliente_id in (select public.meus_clientes())));

-- -----------------------------------------------------------------------------
-- Mensagens
-- -----------------------------------------------------------------------------
create policy mensagens_ler on mensagens for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or profissional_id in (select public.meus_profissionais()));
create policy mensagens_criar on mensagens for insert with check (
  canal = 'whatsapp'
  and (inquilino_id in (select public.inquilinos_onde(array['proprietario']))
       or (profissional_id in (select public.meus_profissionais())
           and inquilino_id in (select public.inquilinos_onde(array['profissional'])))));
create policy mensagens_alterar on mensagens for update
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario']))
         or profissional_id in (select public.meus_profissionais()))
  with check (canal = 'whatsapp');

-- -----------------------------------------------------------------------------
-- Financeiro
-- -----------------------------------------------------------------------------
create policy custos_gestor on custos_fixos for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));
create policy despesas_gestor on despesas for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

create policy objetivos_ler on objetivos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or profissional_id in (select public.meus_profissionais()));
create policy objetivos_escrever on objetivos for all
  using (inquilino_id in (select public.inquilinos_onde(array['proprietario'])))
  with check (inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

-- Só o gestor regista acertos; o barbeiro lê os seus.
create policy acertos_ler on acertos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario']))
  or profissional_id in (select public.meus_profissionais()));
create policy acertos_criar on acertos for insert with check (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'])));
create policy acertos_alterar on acertos for update using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'])));

-- -----------------------------------------------------------------------------
-- Funcionalidades: a equipa lê; só a Performa LAB liga e desliga (B2)
-- -----------------------------------------------------------------------------
create policy funcionalidades_ler on funcionalidades for select to authenticated using (true);
create policy funcionalidades_escrever on funcionalidades for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

create policy pacotes_ler on pacote_funcionalidades for select to authenticated using (true);
-- O formulário de adesão é público e mostra o que cada plano inclui (D.9): o catálogo e os
-- pacotes leem-se sem conta. Não dizem nada sobre nenhuma barbearia.
create policy funcionalidades_ler_publico on funcionalidades for select to anon using (true);
create policy pacotes_ler_publico on pacote_funcionalidades for select to anon using (true);
create policy pacotes_escrever on pacote_funcionalidades for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

create policy inq_func_ler on inquilino_funcionalidades for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario','profissional'], false))
  or (select public.e_super_admin()));
create policy inq_func_escrever on inquilino_funcionalidades for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- -----------------------------------------------------------------------------
-- Adesões, cobrança da plataforma, auditoria
-- -----------------------------------------------------------------------------
create policy adesoes_admin on pedidos_adesao for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- O gestor vê as suas faturas e recebimentos em "O meu plano", mesmo suspenso.
create policy faturas_ler on faturas_plataforma for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'], false))
  or (select public.e_super_admin()));
create policy faturas_admin on faturas_plataforma for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

create policy recebimentos_ler on recebimentos for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'], false))
  or (select public.e_super_admin()));
create policy recebimentos_admin on recebimentos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

create policy auditoria_admin on auditoria for select using ((select public.e_super_admin()));

-- -----------------------------------------------------------------------------
-- Módulos desligados (G.4): só o super_admin. A barbearia não os vê.
-- -----------------------------------------------------------------------------
create policy modulos_admin on modulos_plataforma for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy inq_modulos_admin on inquilino_modulos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy ligacoes_admin on ligacoes_externas for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy pagamentos_admin on pagamentos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy documentos_admin on documentos_fiscais for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- -----------------------------------------------------------------------------
-- Storage (L5)
--   publico/<inquilino_id>/...                     logótipo, capa, galeria, produtos
--   publico/<inquilino_id>/portfolio/<prof_id>/... portfólio do barbeiro
--   fichas/<inquilino_id>/<cliente_id>/...         fichas técnicas (privado)
--   Uploads do formulário de adesão: URL assinado criado pela rota de servidor.
-- -----------------------------------------------------------------------------
create policy storage_publico_ler on storage.objects for select using (bucket_id = 'publico');
create policy storage_publico_escrever on storage.objects for all
  using (bucket_id = 'publico' and (
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario']) x)
         or ((storage.foldername(name))[2] = 'portfolio'
             and (storage.foldername(name))[3] in (select x::text from public.meus_profissionais() x))))
  with check (bucket_id = 'publico' and (
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario']) x)
         or ((storage.foldername(name))[2] = 'portfolio'
             and (storage.foldername(name))[3] in (select x::text from public.meus_profissionais() x))));

-- O super_admin carrega o logótipo, a capa e a galeria pela ficha da barbearia e na
-- aprovação da adesão (E.1, D.8.1).
create policy storage_publico_admin on storage.objects for all
  using (bucket_id = 'publico' and (select public.e_super_admin()))
  with check (bucket_id = 'publico' and (select public.e_super_admin()));

create policy storage_fichas on storage.objects for all
  using (bucket_id = 'fichas' and (
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario']) x)
         or (storage.foldername(name))[2] in (select x::text from public.clientes_do_profissional() x)))
  with check (bucket_id = 'fichas' and (
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario']) x)
         or (storage.foldername(name))[2] in (select x::text from public.clientes_do_profissional() x)));

-- Histórico de cortes (D-179): o cliente vê as fotografias das suas entradas visíveis e apaga as
-- suas quando retira o consentimento.
create policy storage_fichas_cliente_ler on storage.objects for select
  using (bucket_id = 'fichas' and public.foto_do_cliente(name, true));
create policy storage_fichas_cliente_apagar on storage.objects for delete
  using (bucket_id = 'fichas' and public.foto_do_cliente(name, false));

-- -----------------------------------------------------------------------------
-- Comercial (Parte N): só o super_admin com dois fatores. Nenhum outro papel vê nada.
-- numeracao_comercial e convites_adesao só se tocam pelas funções.
-- -----------------------------------------------------------------------------
create policy leads_admin on leads for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy lead_eventos_admin on lead_eventos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy briefings_admin on briefings for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy modelos_admin on modelos_documento for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy propostas_admin on propostas for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy contratos_admin on contratos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- Finanças da Performa LAB (Parte O): só o super_admin com dois fatores.
-- lembretes_vencimento só se escreve pelas funções (leitura pela política *_admin_ler).
create policy custos_plataforma_admin on custos_plataforma for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy contas_pagar_admin on contas_pagar for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy metas_faturacao_admin on metas_faturacao for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- Apoio e comunicados (D-160): só o super_admin com dois fatores escreve e lê.
-- comunicado_leituras só se escreve por marcar_comunicado_lido() (leitura pela política *_admin_ler).
create policy apoio_registos_admin on apoio_registos for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy comunicados_admin on comunicados for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));

-- Comercial (D-161)
-- Na própria linha (e não por meus_leads()), para o comercial ler o lead que acabou de criar.
create policy leads_comercial_ler on leads for select
  using (responsavel_id = (select auth.uid()) and (select public.e_comercial()));
create policy leads_comercial_criar on leads for insert
  with check ((select public.e_comercial()) and responsavel_id = (select auth.uid()));
create policy leads_comercial_alterar on leads for update
  using (responsavel_id = (select auth.uid()) and (select public.e_comercial()))
  with check (responsavel_id = (select auth.uid()));
create policy lead_eventos_comercial_ler on lead_eventos for select
  using (lead_id in (select public.meus_leads()));
create policy lead_eventos_comercial_criar on lead_eventos for insert
  with check (lead_id in (select public.meus_leads()) and criado_por = (select auth.uid()));
create policy briefings_comercial on briefings for all
  using (lead_id in (select public.meus_leads()))
  with check (lead_id in (select public.meus_leads()));
create policy propostas_comercial_ler on propostas for select
  using (lead_id in (select public.meus_leads()));
create policy contratos_comercial_ler on contratos for select
  using (lead_id in (select public.meus_leads()));
create policy modelos_comercial_ler on modelos_documento for select
  using (estado = 'aprovado' and (select public.e_comercial()));

create policy configuracao_comercial_admin on configuracao_comercial for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy configuracao_comercial_ler on configuracao_comercial for select
  using ((select public.e_comercial()));
create policy metas_comerciais_admin on metas_comerciais for all
  using ((select public.e_super_admin())) with check ((select public.e_super_admin()));
create policy metas_comerciais_ler on metas_comerciais for select
  using (user_id = (select auth.uid()) and (select public.e_comercial()));

create policy storage_comercial_leads on storage.objects for all
  using (bucket_id = 'comercial' and (select public.e_comercial()) and public.pasta_lead_acessivel(name))
  with check (bucket_id = 'comercial' and (select public.e_comercial()) and public.pasta_lead_acessivel(name));

-- Comissões (D-162): os administradores leem (política *_admin_ler) e escrevem pelas funções;
-- o comercial vê as suas.
create policy comissoes_comercial_ler on comissoes_comerciais for select
  using (comercial_id = (select auth.uid()) and (select public.e_comercial()));

create policy storage_comercial on storage.objects for all
  using (bucket_id = 'comercial' and (select public.e_super_admin()))
  with check (bucket_id = 'comercial' and (select public.e_super_admin()));

-- Comprovativos de pagamento (D-168): o dono vê os seus (também suspenso); escreve-se só pelas
-- funções enviar/aprovar/recusar. O ficheiro: o dono carrega e lê na pasta da barbearia; o
-- super_admin lê tudo. Ninguém altera nem apaga pelo Storage.
create policy comprovativos_ler on comprovativos_pagamento for select using (
  inquilino_id in (select public.inquilinos_onde(array['proprietario'], false)));
create policy storage_comprovativos_ler on storage.objects for select
  using (bucket_id = 'comprovativos' and (
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario'], false) x)
         or (select public.e_super_admin())));
create policy storage_comprovativos_carregar on storage.objects for insert
  with check (bucket_id = 'comprovativos' and
         (storage.foldername(name))[1] in (select x::text from public.inquilinos_onde(array['proprietario'], false) x));

-- -----------------------------------------------------------------------------
-- Leitura total pelo super_admin (com dois fatores): vista de apoio e
-- exportação dos dados de uma barbearia que sai (RGPD, art. 28.º, n.º 3, g).
-- As políticas são permissivas: somam-se às anteriores, nunca as alargam a outros papéis.
-- -----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('create policy %I on public.%I for select using ((select public.e_super_admin()))',
                   r.tablename || '_admin_ler', r.tablename);
  end loop;
end $$;
