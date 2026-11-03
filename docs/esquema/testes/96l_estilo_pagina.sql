-- =============================================================================
-- Testes do estilo da página pública (D-198): começa em «classico»; só os quatro estilos; o dono
-- muda o da sua barbearia e não o de outra; a página pública (anon) lê-o pela vista.
-- =============================================================================
\set QUIET on
\set ON_ERROR_STOP on
set client_min_messages = notice;

begin;
reset role;
select teste.ok((select bool_and(estilo_pagina = 'classico') from inquilinos),
  'ESTILO: as barbearias começam no estilo clássico');
select teste.erro($$update inquilinos set estilo_pagina = 'neon' where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'ESTILO: só os quatro estilos');

select teste.como('10000000-0000-0000-0000-000000000002');
update inquilinos set estilo_pagina = 'luxo' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.zero($$update inquilinos set estilo_pagina = 'urbano' where id = 'bbbbbbbb-0000-0000-0000-000000000000'$$,
  'ESTILO: o dono não muda o estilo de outra barbearia');

update inquilinos set logo_fundo = '#0A0A0A' where id = 'aaaaaaaa-0000-0000-0000-000000000000';
select teste.erro($$update inquilinos set logo_fundo = 'preto' where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'ESTILO: a cor de fundo do logótipo é um hexadecimal');

select teste.anonimo();
select teste.ok((select logo_fundo = '#0A0A0A' from publico_inquilinos
                  where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'ESTILO: a página pública lê a cor de fundo do logótipo');
select teste.ok((select estilo_pagina = 'luxo' from publico_inquilinos
                  where id = 'aaaaaaaa-0000-0000-0000-000000000000'),
  'ESTILO: o dono muda o estilo e a página pública lê-o');
rollback;
