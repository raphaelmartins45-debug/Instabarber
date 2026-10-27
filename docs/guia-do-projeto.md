# Guia do projeto · ponto de entrada

**Para uma sessão nova do Claude Code (ou qualquer pessoa) que chega ao InstaBarber sem memória.**
Lê isto depois do `CLAUDE.md` e antes de abrir código. Em 10 minutos ficas a saber o que é o
projeto, como foi construído, onde está cada coisa e como se trabalha sem partir nada.

Frase que o dono cola numa sessão nova:

> Sou o dono do InstaBarber. Lê o CLAUDE.md e o docs/guia-do-projeto.md, confirma em que estado
> está o projeto e espera pelo meu pedido.

Atualizado a 27/10/2026. **Quem mudar o projeto atualiza este guia no mesmo commit** quando mudar
algo que aqui está (uma fase, um ambiente, um script, uma armadilha nova).

---

## 1 · O projeto em dez linhas

- **O quê:** SaaS de gestão para barbearias em Portugal: marcação online, agenda, clientes,
  mensagens por WhatsApp (`wa.me`), fidelização, loja, equipa e comissões, financeiro e relatório
  mensal. Uma base de dados para todas as barbearias (inquilinos), isoladas por RLS.
- **De quem:** InstaBarber, da Performa LAB. A Prestadora é a Michelle, isenta de IVA (art. 53.º,
  D-173). O dono faz a operação e a parte comercial (D-175).
- **No ar:** `instabarber.pt` (landing, adesão, entrada, Admin), `instabarber.pt/<slug>` e
  `<slug>.instabarber.pt` (página de cada barbearia).
- **Utilizadores:** dono da plataforma e gestor (Admin, dois passos), comercial (área Comercial),
  gestor da barbearia, barbeiro, cliente final.
- **Stack:** Next.js 15 (App Router), React 19, TypeScript estrito, Tailwind 4, Supabase
  (PostgreSQL, Auth, Storage; Frankfurt), Vercel (fra1), Resend. Detalhe no `CLAUDE.md` §2.
- **Dinheiro:** a plataforma **regista**, nunca cobra; não emite documentos fiscais.
- **Preços:** Basic 19,99 €, Pro 39,99 € por mês; ao preço não acresce IVA.

---

## 2 · Onde está cada coisa (ler por esta ordem, só o que o pedido precisa)

| Ficheiro | Para quê |
| --- | --- |
| `CLAUDE.md` | Regras fixas. Lido sempre |
| **Este guia** | Ponto de entrada: história, ambientes, receitas, armadilhas |
| `docs/mapa-do-sistema.md` | **Pedidos de manutenção:** classifica o pedido e diz onde mexer e como verificar |
| `docs/mapa-gerado.md` | Lista gerada das rotas e ficheiros (`scripts/gerar-mapa.sh`; não se edita) |
| `PROGRESSO.md` | Estado real: fases, trabalhos paralelos, pendentes do dono, módulos por ativar |
| `DECISOES.md` | As decisões (D-01 a D-175), com data. **Prevalece** quando duas regras se contradizem |
| `docs/esquema/` | Fonte única da base de dados (tabelas, funções, RLS, dados iniciais) e os testes SQL |
| `supabase/migrations/` | As migrações aplicadas (01 a 17), copiadas do esquema |
| `fases/` | O plano de cada fase e os critérios (J.1, verificados em `fases/verificacao-j1.md`) |
| `docs/parte-*.md` | A especificação, uma Parte por ficheiro (índice em `docs/00-indice.md`) |
| `docs/manual-do-operador.md` | Os procedimentos manuais P-00 a P-30 |
| `docs/manuais/` | Formação, calendário, resolução de problemas, respostas de apoio |
| `docs/futuro/` | Ideias planeadas e não construídas (CRM da Performa LAB) |
| `docs/atualizacoes/`, `docs/parte-p-…` | **Dormentes.** Só por ordem do dono |

Código: `app/` (rotas), `components/` (um componente por ficheiro), `lib/repositorios/` (todas as
consultas), `lib/regras/` (regras puras, com testes), `lib/i18n/` (todo o texto), `lib/validacao/`
(Zod), `e2e/` (Playwright), `scripts/` (ferramentas).

---

## 3 · Como foi construído (linha do tempo)

Cada fase termina com um resultado verificável, registado no `PROGRESSO.md`. Detalhe de cada
decisão no `DECISOES.md`.

| Fase | Data | O que se construiu | Migração | Decisões principais |
| --- | --- | --- | --- | --- |
| 0 · Preparação | 22/10/2026 | Repositório, dependências, deploy na Vercel | — | D-99 (landing servida pelo Next.js) |
| 1 · Base de dados | 22/10/2026 | Esquema completo, RLS em todas as tabelas, 396 testes SQL | 01–04 | D-110, D-111 |
| 2 · Autenticação | 22/10/2026 | Cinco papéis, convites, código do cliente, dois passos | — | D-112 a D-115 |
| 3 · Administração e adesão | 22/10/2026 | Admin (ficha com separadores), formulário de adesão, aprovação | 05 | — |
| 4 · Painel da barbearia | 22/10/2026 | Agenda, clientes (radar), equipa, financeiro, comissões, Gestão do sistema | 06 | — |
| 5 · Agenda e cliente | 22/10/2026 | Página pública, marcação com reserva de 10 min, área de cliente | 07 | D-125 |
| 6 · Mensagens e relatório | 22/10/2026 | Filas, loja, clube, mensagens em lote, relatório mensal, módulos desligados | 08 | D-126 |
| Redesenho, lote A | 22–23/10/2026 | Tokens, temas (escuro e claro), componentes base, casca | — | D-134, D-135 |
| 7 · Publicação | 24/10/2026 | Produção em Frankfurt, domínio, subdomínios, correio | 09 | D-137, D-142 |
| 3B · Comercial | 24/10/2026 | CRM: funil, leads, briefing, proposta, contrato, convite | 10 | D-149 a D-152 |
| 3C · Finanças | 25/10/2026 | Finanças da Performa LAB: custos, vencimentos, objetivo, exportação | — | D-153 |
| Trabalho paralelo | 25/10/2026 | Retenção da auditoria; saúde e métricas; apoio e comunicados | 11, 12 | D-157 a D-160 |
| Equipa InstaBarber | 25/10/2026 | Papéis gestor e comercial, condições comerciais, desempenho | 13 | D-161 |
| Painel comercial | 25/10/2026 | Agenda «Hoje», mensagens, carteira, distribuição, comissões, demonstração | 14 | D-162 |
| 8 · Operação | Desde 25/10/2026 | Restauro testado, ciclo completo em produção, verificação J.1 | — | D-157, D-167, D-169 |
| Pagamentos da mensalidade | 26/10/2026 | Comprovativos (MB WAY e transferência) com aprovação | 15 | D-168 |
| Fatura automática | 26/10/2026 | InvoiceXpress, **construído e desligado** até à ativação | 16 | D-170 |
| Landing e entrada | 26/10/2026 | Ícone em relevo, título com Portugal, entrada com a marca da barbearia | — | D-171, D-172 |
| Isenção de IVA | 27/10/2026 | Preços 19,99 € e 39,99 €, sem IVA a acrescer | — | D-173 |
| Ficha de prospeção | 27/10/2026 | Campos de prospeção no lead, duplicados, fim do contrato na agenda | 17 | D-174 |
| 9 · Manuais | Desde 27/10/2026 | Formação, calendário, resolução de problemas, respostas de apoio | — | D-175 |
| Línguas e tradução | 27/10/2026 | Língua do telemóvel com ensaio; tradução dos serviços pelo DeepL, **desligada** até à chave | — | D-176 |

**Em aberto:** ver `PROGRESSO.md` («Pendentes do dono», «Módulo pendente de ativação») e a lista
da Fase 9 em `fases/fase-9-manuais.md`.

---

## 4 · Os três ambientes

| | Local | Ensaio | Produção |
| --- | --- | --- | --- |
| Para quê | Desenvolver e testar tudo | Confirmar migrações antes da produção | O sistema real |
| Base de dados | Supabase local (Docker), `127.0.0.1:54322` | Projeto Supabase `msjbcosrgastzaixhtyp` | Projeto Supabase de Frankfurt (`SUPABASE_PRODUCAO_REF`) |
| Aplicação | `npm run dev` ou `scripts/e2e-local.sh` | — | Vercel, projeto `instabarber-landing`, ramo `main` |
| Testes | Todos: SQL, Vitest, Playwright | Testes SQL (`scripts/testar-sql-ensaio.py`) | **Nunca testes.** Só migrações e `scripts/sql/verificar-rls.sql` |

**Ramo de trabalho:** o indicado na sessão (até agora, `claude/peaceful-tesla-b3i3cg`). O `main`
é o que está no ar: a Vercel publica cada push para o `main`.

---

## 5 · Chaves e acessos (sem valores)

Os valores **nunca** vão para o Git. Estão no `.env.local` (ignorado pelo Git) e, como cópia, no
gestor de palavras-passe do dono. **Numa sessão nova, o contentor não tem o `.env.local`:** o dono
cola-o ou configura as variáveis no ambiente da sessão.

| Variável | Para quê | Onde se obtém |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | A aplicação (ensaio no `.env.local`; produção na Vercel) | Supabase → projeto → Settings → API |
| `SUPABASE_PROJECT_REF`, `SUPABASE_ACCESS_TOKEN` | Management API do **ensaio** (testes SQL, migrações) | Ref no endereço do projeto; token em Supabase → Account → Access Tokens |
| `SUPABASE_PRODUCAO_REF`, `SUPABASE_PRODUCAO_ACCESS_TOKEN`, `SUPABASE_PRODUCAO_URL`, `SUPABASE_PRODUCAO_ANON_KEY`, `SUPABASE_PRODUCAO_SERVICE_ROLE_KEY` | Migrações e cópias da **produção** | Igual, no projeto de produção |
| `SUPABASE_ENSAIO_DB_PASSWORD` | Ligação direta ao ensaio (raramente) | Supabase → Settings → Database |
| `COPIA_SENHA` | Cifrar e decifrar as cópias de segurança | Só no gestor de palavras-passe do dono. **Sem ela, as cópias não abrem** |
| `VERCEL_TOKEN` | CLI da Vercel (estado dos deploys, variáveis) | Vercel → Account → Tokens. Âmbito `raphaels-projects-6bccea88` |
| `RESEND_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_NOTIFICACOES`, `EMAIL_COMERCIAL` | E-mails | Resend → API Keys |
| `TELEFONE_COMERCIAL`, `TELEFONE_COMERCIAL_TXT` | WhatsApp comercial nos e-mails | Dono |
| `PRESTADORA_NOME`, `_NIF`, `_MORADA`, `_QUALIDADE`, `_ASSINANTE`, `PRESTADORA_REGIME_IVA` | Contratos, propostas, faturas; regime `isento` | Dono (e Vercel → Settings → Environment Variables) |
| `ROOT_DOMAIN` | Domínio principal (`instabarber.pt`; `localhost` nos ensaios) | — |
| `FATURACAO_PLATAFORMA`, `INVOICEXPRESS_CONTA`, `INVOICEXPRESS_CHAVE` | Fatura automática (desligada até haver os três) | InvoiceXpress (ver PROGRESSO) |
| `DEEPL_CHAVE` | Tradução automática dos serviços (desligada sem ela, D-176) | DeepL → conta gratuita da API → Account → API Keys |

**Regras:** nunca escrever um valor num ficheiro do repositório, num commit ou numa mensagem; a
chave de serviço só em código de servidor (`CLAUDE.md` §3); revogar e trocar no fim da construção
(P-17).

---

## 6 · Ferramentas (`scripts/`)

| Script | O que faz |
| --- | --- |
| `e2e-local.sh [spec] [args]` | Repõe a base local, constrói e corre o Playwright (semeia os papéis em `e2e/semear.ts`) |
| `testar-sql.sh` | Testes SQL na base local (`SUPABASE_DB_URL=…54322/postgres npm run test:sql`) |
| `testar-sql-ensaio.py` | Testes SQL no **ensaio**, numa transação desfeita; recusa outro projeto |
| `comparar-esquema.sh` | Confirma que `docs/esquema` é igual às migrações (local) |
| `sql-remoto.py ensaio\|producao ficheiro.sql` | Corre SQL pela Management API |
| `aplicar-migracao.sh ensaio\|producao <migração>` | Aplica e regista a migração; na produção, verifica o RLS |
| `copia-api.py` | Cópia cifrada da produção (P-13). Ver o cabeçalho para as variáveis |
| `restaurar-copia-api.py` | Restauro de uma cópia no Supabase local (P-14); recusa a produção |
| `enviar-copia.mjs` | Envia a cópia cifrada para geral@ (para o Drive) |
| `gerar-mapa.sh` | Regenera o `docs/mapa-gerado.md` (no fim de cada mudança com rotas novas) |
| `supabase-env.sh` | Variáveis do Supabase local |
| `auditar-landing.py`, `testar-formulario-landing.py` | Verificações da landing |

---

## 7 · Receitas

### Mudar um texto, uma cor ou um ecrã
1. `docs/mapa-do-sistema.md`: classificar o pedido e encontrar o ficheiro.
2. Texto: `lib/i18n/pt-PT/…` (nunca no componente). Cor: só os hexadecimais da Parte I (tokens).
3. `npm run typecheck`, `npm run lint`, `npx vitest run`, `npm run build`; o e2e do ecrã.
4. Commit no ramo; publicar (abaixo).

### Corrigir um erro
1. Reproduzir: local primeiro; na produção, só leitura (vista de apoio, P-11).
2. Escrever o teste que falha (Vitest, SQL ou Playwright), corrigir, ver passar.
3. Se a regra for de gravação (vaga, preço, comissão, selos, stock), a correção é em SQL
   (`docs/esquema/02_funcoes.sql` → migração).

### Alterar a base de dados (P-16, autorizado pelo dono: D-160)
1. Mudar primeiro `docs/esquema/` (01 tabelas, 02 funções, 03 RLS) e acrescentar testes em
   `docs/esquema/testes/` (registar o ficheiro em `scripts/testar-sql.sh` e em
   `scripts/testar-sql-ensaio.py`).
2. Criar `supabase/migrations/AAAAMMDDHHMMSS_nome.sql` com a mesma mudança.
3. Local: `npx supabase db reset`, `npm run test:sql`, `scripts/comparar-esquema.sh`,
   `npm run db:types`, e o resto dos testes.
4. Ensaio: `scripts/aplicar-migracao.sh ensaio …` e `scripts/testar-sql-ensaio.py`.
5. Cópia cifrada da produção (`copia-api.py`), verificada (`gpg -d … | tar xz` e
   `sha256sum -c SHA256SUMS`), enviada com `enviar-copia.mjs`.
6. Produção: `scripts/aplicar-migracao.sh producao …` (`sem_rls` tem de ser 0).
7. Publicar a aplicação.
**Um teste de isolamento que falhe para tudo** (`CLAUDE.md` §3).

### Publicar
Com todos os testes a passar: `git push origin HEAD:main` (só avanço rápido do `main`). A Vercel
publica; confirmar com
`npx -y vercel@latest ls instabarber-landing --prod --scope raphaels-projects-6bccea88 --token "$VERCEL_TOKEN"`
até «Ready», e abrir `https://instabarber.pt` e `https://instabarber.pt/api/saude` (200).
**Voltar atrás:** Vercel → Deployments → versão anterior → «Promote».

### No fim de cada mudança
`DECISOES.md` (decisão nova, com data), `PROGRESSO.md` (o que se verificou), `scripts/gerar-mapa.sh`
e `docs/mapa-do-sistema.md` (rotas e ficheiros novos), e este guia se mudou alguma coisa daqui.

---

## 8 · Armadilhas já encontradas

| Sintoma | Causa | O que fazer |
| --- | --- | --- |
| `relation "inquilinos" does not exist` nos testes SQL; `db reset` falha | O Docker morreu | `(dockerd > /dev/null 2>&1 &)`, esperar, `npx supabase start`, `npx supabase db reset` |
| `duplicate key … users_pkey` nos testes SQL | Correram duas vezes sobre a mesma base | `npx supabase db reset` e correr uma vez |
| Esquema `teste` já existe | Uma corrida anterior parou a meio | `drop schema if exists teste cascade` |
| Testes Playwright com resultados estranhos | Duas corridas ao mesmo tempo sobre a mesma base | Uma de cada vez; em segundo plano, nunca com `&` |
| Clique «interceptado» no telemóvel | A página ficou mais larga do que o ecrã (ex.: `<select>` com opções compridas, `<fieldset>` sem `min-w-0`) | Largura fixa ou `w-full min-w-0` no campo; os e2e do CRM confirmam a largura |
| `getByLabel` apanha dois elementos | `<select>` dentro do próprio `<label>` (o nome inclui as opções) ou rótulos que contêm outros | Rótulo com `htmlFor`, separado do campo; `exact: true` no teste |
| Botão que não responde logo a seguir a carregar a página | Ainda não ficou interativo (hidratação) | No teste, `waitForLoadState("networkidle")` antes do clique |
| Lead criado num teste vai para outro comercial | O gatilho `preparar_lead` distribui os leads | No teste SQL, `update … set responsavel_id = …` depois de inserir |
| Cópia: `Cannot POST /v1/projects//database/query` | Falta o ref (`SUPABASE_COPIA_REF`) | Usar `SUPABASE_PRODUCAO_REF` |
| Leituras da produção recusadas pelo modo automático | Política de segurança da sessão | Testar no local ou no ensaio; na produção, só migrações e `verificar-rls.sql` |
| A ferramenta do Drive não carrega a cópia | Ficheiro grande demais para a ferramenta | Enviar por e-mail (`enviar-copia.mjs`); o dono guarda no Drive |
| CLI da Vercel não encontra o projeto | Pasta não ligada | Passar `--project instabarber-landing` e `--scope` |

---

## 9 · Teste de arranque (para confirmar que o guia chega)

Numa sessão nova, só com o `CLAUDE.md`, este guia e o mapa, deve conseguir-se responder sem
explorar o código:

1. Onde muda o texto do botão «Criar lead»? (`lib/i18n/pt-PT/comercial.ts`, `criar`)
2. Como se aplica uma migração à produção? (secção 7, P-16)
3. Que testes nunca correm na produção? (secção 4)
4. Onde está a regra da mensalidade? (`lib/regras/mensalidade.ts`, D-45 e D-173)
5. O que fazer se alguém vir dados de outra barbearia? (`docs/manuais/resolucao-de-problemas.md`)

InstaBarber · Performa LAB
