# Verificação dos critérios de aceitação (J.1) · Fase 8

Feita a 26/10/2026. Cada critério de `criterios-de-aceitacao.md` com a prova. Legenda:
**✓ T** verificado por teste automático (corre antes de cada publicação); **✓ P** verificado na
produção ou à mão nesta data; **⏳** depende do dono ou de uma barbearia real.

Contagens atuais: 621 verificações SQL (local e ensaio), 326 testes Vitest, 68 ensaios de ponta a
ponta (computador e telemóvel). O critério ainda diz «389 testes»: é o número de quando a J.1 foi
escrita; vale o atual.

## Segurança e isolamento

| Critério | Estado | Prova |
| --- | --- | --- |
| Testes SQL no local e no ensaio | ✓ T | `npm run test:sql` (621) e o ensaio com as mesmas migrações (621, D-168) |
| Uma barbearia nunca lê dados de outra | ✓ T | `10_isolamento.sql`, isolamento em cada ficheiro novo (`96*`); `verificar-rls.sql` na produção: 66/66 tabelas com RLS |
| Profissional vê só o seu; não altera a comissão | ✓ T | `10_isolamento.sql`, `80_painel.sql`; e2e `equipa.spec.ts` |
| Dono não liga funcionalidades nem muda o plano | ✓ T | `proteger_inquilino()` e `70_admin.sql` |
| Cliente final vê só o seu e não escreve | ✓ T | `90_cliente.sql` |
| super_admin sem segundo fator não vê nada | ✓ T | `70_admin.sql` (aal1), e2e `equipa.spec.ts` |
| `/admin` só no domínio principal | ✓ T + ✓ P | e2e `encaminhamento.spec.ts`; em produção o subdomínio responde 404 |
| Chave de serviço fora do browser | ✓ P | nenhum ficheiro de `.next/static` contém a chave (ensaio nem produção); nenhum componente cliente a lê |
| `.env.local` ignorado, sem chaves no repositório | ✓ P | `.gitignore` (`.env*`); `git grep` da chave da produção: 0 |

## Comercial (Fase 3B)

| Critério | Estado | Prova |
| --- | --- | --- |
| Só super_admin com dois fatores (e o comercial só o seu, D-161) | ✓ T | `40_comercial.sql`, `96b_equipa_plataforma.sql`; e2e `equipa-plataforma.spec.ts` |
| Site cria lead, repetido não duplica, abuso limitado | ✓ T | `98_comercial_site.sql`; e2e `landing.spec.ts`, `comercial.spec.ts` |
| Proposta pela D.7, imutável depois de enviada | ✓ T | `40_comercial.sql`, `lib/pdf/proposta.test.ts` |
| Contrato só de proposta aceite e modelo aprovado; assinado não muda | ✓ T | `40_comercial.sql` |
| Convite pré-preenche sem palavra-passe e liga o contrato | ✓ T | `40_comercial.sql`, `lib/adesao` |
| PDFs dizem «Não é documento fiscal» | ✓ T | `lib/pdf/proposta.test.ts`, `resumo-contratacao.test.ts` |

## Finanças da Performa LAB (Fase 3C)

| Critério | Estado | Prova |
| --- | --- | --- |
| Só super_admin com dois fatores | ✓ T | `50_financas.sql` |
| Indicadores sem IVA, batem com o exemplo à mão | ✓ T | `lib/financas/indicadores.test.ts` |
| Quantas Basic, Pro e da mistura faltam | ✓ T | `lib/regras/previsao.test.ts` |
| Previsões com pressupostos e sem promessa | ✓ T | `lib/regras/previsao.test.ts`; e2e `financas.spec.ts` |
| Lembretes confirmados à mão, nada automático | ✓ T | `50_financas.sql` |
| Exportações dizem «Não é documento fiscal» | ✓ T | `lib/financas/exportacao.test.ts`, e2e `financas.spec.ts` |

## Administração e adesão

| Critério | Estado | Prova |
| --- | --- | --- |
| Barbearia nova em menos de 5 minutos | ✓ T + ✓ P | e2e `adesao.spec.ts` (13 s); ciclo em produção (D-167) |
| Mensalidade em tempo real pela D.5 | ✓ T | `lib/regras/mensalidade.test.ts`; e2e `adesao.spec.ts` (60,27 €) |
| Mostra o contratado e recalcula | ✓ T | e2e `adesao.spec.ts` |
| Nunca recolhe palavra-passe; PDF sem ela | ✓ T | `lib/adesao/resumo.test.ts` |
| Pedido aparece em Pedidos e notifica | ✓ T + ✓ P | e2e `adesao.spec.ts`; produção (D-167); lista no painel geral (D-165) |
| Aprovar num clique; dono define a palavra-passe | ✓ T + ✓ P | e2e `adesao.spec.ts`; produção: e-mail de boas-vindas e ligação (D-167) |
| Importação CSV sem consentimento | ✓ T | e2e `adesao.spec.ts`; `70_admin.sql` |

## Painel da barbearia e do profissional

| Critério | Estado | Prova |
| --- | --- | --- |
| Marca e cor sem intervenção técnica | ✓ T | e2e `painel.spec.ts`, `design.spec.ts`; campo de ficheiro (D-164) |
| Funcionalidade inativa sai; «Upgrade» aparece desativada | ✓ T | `lib/funcionalidades/menus.test.ts`, `80_painel.sql` |
| Basic: lembrete e selos sim; lote e recuperação com upgrade | ✓ T | `lib/funcionalidades/menus.test.ts`, `95_mensagens_filas.sql` |
| Basic com um só profissional ativo | ✓ T | `30_regras.sql` |
| Convite do barbeiro; NIF nunca é palavra-passe | ✓ T + ✓ P | e2e `equipa.spec.ts`; produção (D-167) |
| Classificação por profissional e pela barbearia | ✓ T | `lib/regras/classificacao.test.ts` |
| Objetivos aparecem na área do profissional | ✓ T | `lib/regras/objetivos.test.ts`; e2e `painel.spec.ts` |
| Comissões (por serviço, hora morta, clube, passado) | ✓ T | `30_regras.sql` |
| Acertos nos três modelos, liquidado não muda | ✓ T | `lib/regras/acertos.test.ts`, `30_regras.sql` |
| Loja: margem, stock ao levantar, custo não muda o passado | ✓ T | `lib/regras/loja.test.ts`, `30_regras.sql`; e2e `fase6.spec.ts` |
| Ausências tiram vagas | ✓ T | `20_agenda.sql` |

## Agenda e cliente final

| Critério | Estado | Prova |
| --- | --- | --- |
| Marcar sem conta, reserva de 10 minutos visível | ✓ T + ✓ P | e2e `marcacao.spec.ts`; produção (D-167) |
| Número novo cria acesso; número com ficha só pelo código | ✓ T + ✓ P | e2e `cliente.spec.ts`; produção (D-167) |
| Duas reservas na mesma vaga: uma recusada | ✓ T | e2e `marcacao.spec.ts`; `sem_sobreposicao` em `20_agenda.sql` |
| Cancelada ou falta liberta o horário | ✓ T | `20_agenda.sql` |
| Mudança de hora com vagas certas | ✓ T | `20_agenda.sql`, `lib/regras/horario.test.ts`, `lib/formatacao/datas.test.ts` |
| Acesso pelo código, nunca de outro | ✓ T | e2e `cliente.spec.ts`; `90_cliente.sql` |
| Política de faltas bloqueia online | ✓ T | e2e `marcacao.spec.ts` |
| Marcação do cliente aparece logo na agenda | ✓ P | produção: marcada na página pública e concluída na agenda (D-167) |

## Mensagens e relatório

| Critério | Estado | Prova |
| --- | --- | --- |
| Lote, recuperação, lembretes e filas por wa.me com registo | ✓ T | `95_mensagens_filas.sql`; e2e `fase6.spec.ts` |
| Sem consentimento ou «não contactar» fora das promoções | ✓ T | `95_mensagens_filas.sql`, `70_admin.sql` |
| E-mail de confirmação chega | ✓ P | produção: recebido com o .ics (D-167); ligação à página corrigida |
| Relatório com 9 blocos, 12 meses, valores iguais | ✓ T + ✓ P | `lib/regras/relatorio.test.ts`; e2e `fase6.spec.ts`; produção (D-167) |
| PDF com cor e logótipo; o do profissional com o nome | ✓ T | `lib/pdf` e e2e `painel.spec.ts` |

## Módulos desligados

| Critério | Estado | Prova |
| --- | --- | --- |
| Sem pagamentos nem faturas na barbearia; webhook 404 | ✓ T | e2e `fase6.spec.ts` |
| Ligar e desligar no Admin, com auditoria | ✓ T | e2e `fase6.spec.ts` |

Nota: os comprovativos de pagamento da mensalidade (D-168) **não** são o módulo de pagamentos: a
barbearia envia o comprovativo do que pagou à InstaBarber; nada é cobrado.

## Operação

| Critério | Estado | Prova |
| --- | --- | --- |
| Exportar CSV e eliminar barbearia cancelada | ✓ T | e2e `adesao.spec.ts` (exportar), `30_regras.sql` (`eliminar_inquilino`); ⏳ eliminar a barbearia de ensaio na produção (dono) |
| Domínio próprio +5,00 € pela D.7 | ✓ T | `lib/regras/mensalidade.test.ts` |
| Manual do operador revisto com capturas | ⏳ | a fazer com o sistema real (próximo passo da Fase 8) |

## Interface

| Critério | Estado | Prova |
| --- | --- | --- |
| Telemóvel real iOS e Android | ⏳ | o dono usa no telemóvel; falta registar iOS e Android com criar, consultar, alterar e apagar |
| Paridade e cartões abaixo de 768 px | ✓ T | todos os e2e correm também no projeto «telemovel» |
| Admin no telemóvel por passos | ✓ T | e2e `adesao.spec.ts` no telemóvel |
| Página pública: capa, três ações, contraste 4,5:1 | ✓ T | `lib/regras/contraste.test.ts`; e2e `marcacao.spec.ts` |
| Pública indexável com dados estruturados; painéis não | ✓ P | produção: dois blocos `application/ld+json`; painéis e área de cliente pedem entrada; as entradas, os painéis e o Admin passam a `noindex` (26/10/2026) |
| Bloco sem conteúdo não ocupa espaço | ✓ P | produção: a barbearia de ensaio sem galeria nem história não mostra esses blocos |
| Multilinguagem | ✓ T | `lib/i18n/publico/index.test.ts` |
| Sem inglês nem brasileirismos nos painéis | ✓ P | pesquisa nos textos (`lib/i18n`, componentes): nenhum termo do Brasil |
| Preço final igual em qualquer regime de IVA | ✓ T | `lib/regras/mensalidade.test.ts` (D-45, D-85) |

## Processo

| Critério | Estado | Prova |
| --- | --- | --- |
| PROGRESSO.md reflete o estado | ✓ P | atualizado a 26/10/2026 |
| typecheck, lint, test, test:sql, build antes de cada entrega | ✓ T | corrido em cada publicação desta fase |
| Restauração testada antes do primeiro cliente real | ✓ P | item 44 (25/10/2026) |

## O que falta para fechar a Fase 8

1. Primeira barbearia real, acompanhada na primeira semana (dono).
2. Testes num telemóvel real, iOS e Android (dono, com a lista que preparo).
3. Revisão do manual do operador com capturas.
4. Apagar a barbearia de ensaio da produção (dono, sessão de administrador).
