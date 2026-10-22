-- RLS ativo em todas as tabelas de public (L.8, Fase 7). Em produção, é a única verificação que
-- se corre: deve devolver sem_rls = 0.
select count(*) filter (where not c.relrowsecurity) as sem_rls,
       count(*) as tabelas,
       coalesce(string_agg(c.relname, ', ') filter (where not c.relrowsecurity), '') as em_falta
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r';
