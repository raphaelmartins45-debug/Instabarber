begin;
-- O endereço instabarber.pt/demo é da demonstração comercial (D-207): nenhuma barbearia pode ter o slug «demo».
alter table public.inquilinos drop constraint inquilinos_slug_check;
alter table public.inquilinos add constraint inquilinos_slug_check
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
         and length(slug) between 3 and 40
         and slug not in ('admin','app','api','b','www','apoio','ajuda',
                          'entrar','login','registo','adesao','termos',
                          'privacidade','static','_next','instabarber',
                          'performa','performalab','conta','minha-area','demo'));
commit;
