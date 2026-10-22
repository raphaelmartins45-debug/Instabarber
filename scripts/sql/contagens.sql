-- Contagem das tabelas principais, para comparar a origem com o restauro (L.7, P-13).
select 'auth.users' as tabela, count(*) from auth.users
union all select 'inquilinos', count(*) from public.inquilinos
union all select 'perfis', count(*) from public.perfis
union all select 'profissionais', count(*) from public.profissionais
union all select 'clientes', count(*) from public.clientes
union all select 'servicos', count(*) from public.servicos
union all select 'marcacoes', count(*) from public.marcacoes
union all select 'visitas', count(*) from public.visitas
union all select 'mensagens', count(*) from public.mensagens
union all select 'auditoria', count(*) from public.auditoria
union all select 'storage.objects', count(*) from storage.objects
order by 1;
