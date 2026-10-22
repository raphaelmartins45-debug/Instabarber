-- Antes de repor só os dados de uma cópia (L.7, P-13), num alvo com as mesmas migrações e sem
-- dados reais: esvazia as tabelas de public e os buckets do Storage, que as migrações preencheram.
-- Nunca correr na produção.
do $$
declare t text;
begin
  select string_agg(format('%I.%I', schemaname, tablename), ', ') into t
    from pg_tables where schemaname = 'public';
  execute 'truncate ' || t || ' cascade';
end $$;
truncate storage.objects, storage.buckets cascade;
