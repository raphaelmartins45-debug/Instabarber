-- =============================================================================
-- Testes do endurecimento das funções (D-192): quem não tem sessão só executa as funções
-- security definer que a página pública e as políticas RLS precisam; as funções SQL simples
-- têm search_path fixo.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
-- Lista fechada: uma função security definer nova fica fechada ao anon até entrar aqui de propósito.
select teste.ok(not exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prosecdef
     and has_function_privilege('anon', p.oid, 'execute')
     and p.proname not in (
    'barbearia_suspensa', 'calcular_preco', 'clientes_do_profissional', 'confirmar_reserva',
    'contrato_do_cliente', 'criar_pedido_loja', 'e_comercial', 'e_dono_plataforma', 'e_super_admin',
    'entrar_fila_espera', 'entrar_fila_presencial', 'estado_fila_presencial', 'funcionalidade_ativa',
    'inquilinos_onde', 'ler_convite_adesao', 'meus_clientes', 'meus_leads', 'meus_profissionais',
    'modulo_ativo', 'pasta_lead_acessivel', 'pode_carregar_comprovativo', 'pedir_codigo_acesso', 'posicao_fila_espera',
    'reclamar_email_confirmacao', 'registar_carregamento_contrato', 'registar_email_confirmacao',
    'reservar_vaga', 'submeter_lead', 'submeter_pedido_adesao', 'usar_convite_adesao', 'vagas_livres')),
  'END: o anon só executa as funções security definer da lista');

select teste.ok(not has_function_privilege('anon', 'public.apagar_auditoria_antiga(integer)', 'execute')
            and not has_function_privilege('anon', 'public.saude_carteira(uuid)', 'execute')
            and not has_function_privilege('anon', 'public.marcar_comissao_paga(uuid, date)', 'execute'),
  'END: o anon não executa as funções da equipa InstaBarber');
select teste.ok(has_function_privilege('authenticated', 'public.apagar_auditoria_antiga(integer)', 'execute')
            and has_function_privilege('authenticated', 'public.saude_carteira(uuid)', 'execute')
            and has_function_privilege('authenticated', 'public.meus_comunicados(uuid)', 'execute'),
  'END: quem tem sessão continua a executá-las (cada uma verifica o papel)');
select teste.ok(has_function_privilege('anon', 'public.e_comercial()', 'execute')
            and has_function_privilege('anon', 'public.pasta_lead_acessivel(text)', 'execute'),
  'END: o anon executa as funções usadas nas políticas RLS sem papel');

select teste.ok((select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                  where n.nspname = 'public'
                    and p.proname in ('e_sistema', 'campos_alterados', 'hora_local', 'instante_lisboa')
                    and p.proconfig @> array['search_path=""']) = 4,
  'END: as funções SQL simples têm search_path fixo');

select teste.anonimo();
select teste.erro($$select public.saude_carteira(null)$$, 'END: o anon não chama saude_carteira');
select teste.ok(public.hora_local('2026-07-01 12:00+00') = '2026-07-01 13:00'::timestamp
            and public.instante_lisboa('2026-01-15', '09:00') = '2026-01-15 09:00+00'::timestamptz,
  'END: hora_local e instante_lisboa dão o mesmo resultado');
rollback;
