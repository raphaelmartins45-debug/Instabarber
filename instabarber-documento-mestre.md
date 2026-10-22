*InstaBarber · Performa LAB*

# Documento Mestre de Engenharia

*Especificação técnica completa · arquitetura, stack fixa, base de dados, regras de negócio, ecrãs, publicação e operação · versão 10.3 · 21 de outubro de 2026*

Este documento contém o necessário para construir a plataforma InstaBarber. Está
dividido em Partes, uma por ficheiro, e é lido por fases: cada ficheiro em
`fases/` diz que secções ler. O esquema da base de dados vive em
`docs/esquema/` como SQL executável e testado.

O documento mestre (`instabarber-documento-mestre.md`) é gerado a partir destes
ficheiros por `scripts/gerar-mestre.sh`. Não se edita à mão.

## Índice das Partes

| Parte | Ficheiro | Conteúdo |
| --- | --- | --- |
| A | `parte-a-contexto-e-visao-do-produto.md` | O problema, a proposta, as quatro camadas, a vertical futura |
| B | `parte-b-arquitetura-tecnica.md` | Stack, princípios, `package.json`, pastas, convenções, autenticação |
| C | `parte-c-modelo-de-dados.md` | O modelo de dados explicado; o SQL está em `docs/esquema/` |
| D | `parte-d-planos-funcionalidades-e-pacotes.md` | Planos, grelha de funcionalidades, mensalidade, adesão |
| E | `parte-e-especificacao-das-quatro-camadas.md` | Ecrãs das quatro camadas, página pública, relatório mensal |
| F | `parte-f-regras-de-negocio.md` | Regras de negócio, motor de agenda (F.7), faltas (F.8) |
| G | `parte-g-integracoes.md` | Supabase, Resend, WhatsApp, módulos de pagamentos e faturação desligados |
| H | `parte-h-conformidade-legal-e-protecao-de-dados.md` | RGPD, obrigações do consumidor, regras fiscais |
| I | `parte-i-identidade-visual.md` | Paleta, tipografia, regras por camada, mobile, idiomas |
| J | `parte-j-plano-de-execucao.md` | As nove fases, critérios de aceitação, alteração de plano, nota da marca |
| K | `parte-k-comando-de-arranque.md` | O texto que arranca o trabalho no Claude Code |
| L | `parte-l-publicacao-dominios-e-custos.md` | Infraestrutura, chaves, domínios, custos, cópias de segurança |
| M | `parte-m-operacao-e-suporte.md` | Rotina, suporte, suspensão, violação de dados, evolução |
| N | `parte-n-comercial-crm-propostas-e-contratos.md` | Módulo Comercial: funil, briefing, propostas e contratos |
| O | `parte-o-financas-da-performa-lab.md` | Módulo Finanças: custos, contas, ponto de equilíbrio, objetivo, previsões, lembretes de vencimento |
| P | `parte-p-roteiro-de-expansoes.md` | **Dormente.** Roteiro de expansões: preparação feita, procedimento por país, Espanha, Brasil, outros países, MB Way online. Não faz parte das fases |
| — | `manual-do-operador.md` | Os processos manuais da Performa LAB, passo a passo |

## Registo de versões

| Versão | Data | Principais alterações |
| --- | --- | --- |
| 10.0 | 20/10/2026 | Endereços de correio, regra de quem liga funcionalidades, ecrãs da loja |
| 10.1 | 21/10/2026 | Palavra-passe na primeira marcação, sem tarefas agendadas, domínio próprio como extra, exportação de dados, manual do operador. Auditoria: versões seguras, esquema SQL único testado, matriz RLS, motor de agenda, acesso do cliente por código, convites da equipa, funções novas, módulos de pagamentos e faturação desligados, fases revistas |
| 10.2 | 21/10/2026 | Módulo Comercial (Parte N, Fase 3B): leads, briefing, propostas, contratos, convite de adesão; 106 testes SQL novos (307) |
| 10.3 | 21/10/2026 | Módulo Finanças da Performa LAB (Parte O, Fase 3C): custos, contas a pagar, ponto de equilíbrio, objetivo, previsões e lembretes de vencimento por WhatsApp e e-mail; 76 testes SQL novos (383) |
| 10.4 | 21/10/2026 | Regime de IVA da Prestadora (D-45), preço final igual com ou sem isenção, `propostas.iva_taxa`, dados mínimos da Prestadora por variáveis de ambiente, assinatura sem nome pessoal; 389 testes SQL (+6) |
| 10.5 | 21/10/2026 | Parte P, roteiro de expansões (dormente); colunas `pais`, `fuso`, `moeda` e `idioma` em `inquilinos` (só Portugal aceite); regra de textos em `lib/i18n/`; 396 testes SQL (+7) |


---

## Parte A · Contexto e visão do produto

O InstaBarber é uma plataforma SaaS multi-inquilino que serve barbearias, operada
pela Performa LAB. Cada barbearia recebe uma aplicação web com a sua própria
marca, com níveis de acesso distintos, e o cliente final dessa barbearia acede
por telemóvel sem instalar nada.

### A.1 · O problema que resolve

- O barbeiro guarda centenas de clientes na memória e no telefone, mas não sabe quem parou de aparecer. Cada cliente perdido é receita parada, sem que ele tenha como medir o tamanho dessa perda.
- Os marketplaces de beleza cobram comissões de 20 a 25 por cento sobre clientes novos, além da subscrição, o que pesa no estabelecimento pequeno.
- Os sistemas de agenda existentes oferecem calendário e contactos, mas raramente transformam o dado em ação comercial — não mostram quanto dinheiro está parado, nem escrevem a mensagem que o traz de volta.
- O estabelecimento independente não tem orçamento para uma agência, e o resultado é conteúdo fraco, sem fotografia profissional e sem presença digital consistente.

### A.2 · A proposta

O InstaBarber entrega à barbearia uma aplicação com a sua marca, que faz três
coisas que o mercado não junta: identifica automaticamente os clientes em risco
de se perderem, calcula em euros quanto isso representa, e escreve a mensagem
que os convida a voltar. A isso acrescenta a gestão do dia — agenda, equipa,
comissões, despesas e objetivos — e uma página pública que o cliente final usa
para marcar sem telefonar.

As mensagens abrem-se por ligação direta ao WhatsApp, sem intermediários e sem
custo por mensagem. É uma decisão deliberada de produto: mantém o serviço
acessível a um estabelecimento pequeno e evita uma despesa variável que cresce
com o sucesso.

Sem comissões sobre clientes, sem custo por mensagem, preço fixo por plano.

### A.3 · As quatro camadas: nomes e endereços

| Camada | Nome no produto | Para quem | Função principal |
| --- | --- | --- | --- |
| 1 | **InstaBarber Admin** | Performa LAB | Aprovar barbearias, configurar, ligar funcionalidades, registar pagamentos |
| 2 | **InstaBarber Gestão** | Dono / gestor da barbearia | Agenda, clientes, equipa, financeiro, comunicações e Gestão do sistema |
| 3 | **InstaBarber Equipa** | Cada barbeiro | A agenda, os clientes, a faturação e as metas dele |
| 4 | **Página pública** e **Minha área** | Cliente da barbearia | Marcar, ver serviços, selos, histórico, clube e contactos |

As camadas distinguem-se pelo papel do utilizador autenticado e pelas políticas
de acesso da base de dados, nunca por aplicações separadas.

#### Como cada um chega lá

| Quem | Link direto | Pela página pública da barbearia | Entra com |
| --- | --- | --- | --- |
| Performa LAB | `instabarber.pt/admin` (só no domínio principal) | Nunca | E-mail, palavra-passe e 2FA |
| Dono | `instabarber.pt/app`, ou o endereço da barbearia + `/app` | «Entrar → Sou o gestor» | E-mail e palavra-passe |
| Barbeiro | O mesmo `/app`; abre a área dele (`/app/equipa/[id]`) | «Entrar → Sou o barbeiro» | E-mail e palavra-passe |
| Cliente | O endereço da barbearia; a área dele em `…/minha-area` | «Entrar → Sou cliente» | Telemóvel e palavra-passe (marcar não exige entrar) |

- **O endereço da barbearia** tem três formas (L.3): `instabarber.pt/barbearia-central`, `barbearia-central.instabarber.pt` ou um domínio próprio.
- **O dono e o barbeiro usam o mesmo ecrã de entrada.** O sistema identifica o papel pelo perfil e abre o painel certo. Quem tem perfis em várias barbearias escolhe em qual entra.
- **O InstaBarber Admin só existe no domínio principal.** Em qualquer endereço de barbearia (subdomínio ou domínio próprio), `/admin` responde «página não encontrada». O link não está publicado em lado nenhum (DECISOES D-33).
- **A Minha área tem a marca da barbearia.** O cliente vê o logótipo, a cor e o nome da barbearia; o InstaBarber aparece só numa linha discreta no rodapé.
- Os nomes vivem em `lib/vertical/barbearia.ts`, como todo o texto dos painéis.

### A.4 · Visão futura — Insta Beauty (não é requisito de construção)

A arquitetura é deliberadamente vertical-agnóstica. O núcleo comum —
autenticação, agenda, clientes, fidelização, mensagens, objetivos e financeiro —
serve qualquer negócio de serviços com marcação. O que muda entre verticais é
configuração e apresentação.

A segunda marca prevista, Insta Beauty, dirige-se numa fase futura a estúdios de
estética, cabeleireiras e nail designers. Fica fora da versão 1. Quando avançar,
exigirá:

- Vocabulário: «serviço» passa a «tratamento», «profissional» a «técnica», «corte» a «sessão».
- Catálogo por categorias: cabelo, unhas, estética facial, estética corporal, depilação, massagem.
- Gestão de recursos e salas, não apenas de profissionais.
- Fidelização por pacotes de sessões e cartões de valor.
- Preços por zona do corpo e por combinação de tratamentos.
- Consentimento de imagem para publicações de antes e depois.
- Histórico de preferências: produtos, sensibilidade, tonalidade formulada.
- Lembretes de manutenção por periodicidade do tratamento.

**Regra de implementação, já na versão 1:** o núcleo não contém vocabulário de
barbearia. Os rótulos vivem em `lib/vertical/barbearia.ts`, e o campo
`inquilinos.vertical` determina que conjunto de rótulos a aplicação carrega.


---

## Parte B · Arquitetura técnica

### B.1 · Stack obrigatória

Esta é a stack fechada. Não substituir nenhuma peça sem autorização escrita. As
versões exatas estão na B.3.

| Peça | Tecnologia | Nota de uso |
| --- | --- | --- |
| Runtime | Node.js 22 LTS | A mesma versão em desenvolvimento e na Vercel |
| Linguagem | TypeScript 5.7 | Modo estrito, sem exceções |
| Framework | Next.js 15.5.7 ou superior da série 15 | Um só deploy serve as quatro camadas. Abaixo da 15.5.7 há a CVE-2025-66478; a CVE-2025-29927 (bypass do middleware) fecha na 15.2.3 |
| React | 19.2.1 ou superior | Abaixo há a CVE-2025-55182 (execução remota de código) |
| Estilo | Tailwind CSS 4 e shadcn/ui | Componentes acessíveis, sem CSS solto |
| Base de dados | PostgreSQL 15 via Supabase | Região eu-central-1, Frankfurt. Esquema em `docs/esquema/` |
| Autenticação | Supabase Auth | E-mail e palavra-passe para a equipa; código por WhatsApp para o cliente (B.6). Sem SMS |
| Ficheiros | Supabase Storage | Buckets `publico` e `fichas` (C.8) |
| Cliente Supabase | `@supabase/supabase-js` 2 e `@supabase/ssr` | O pacote ssr gere as sessões no servidor |
| Alojamento | Vercel | Domínio próprio, HTTPS automático, funções em fra1 |
| Pagamentos | Nenhum processador ativo | Módulo preparado e desligado (G.4) |
| Estado de servidor | TanStack Query 5 | Cache, revalidação e estados de carregamento |
| Estado de interface | Zustand 5 | Apenas o que é local ao ecrã |
| Formulários | React Hook Form 7 com Zod 3 | Um esquema Zod partilhado entre cliente e servidor |
| Gráficos | Recharts 2 | Evolução no relatório e no painel |
| Datas | date-fns 4 e date-fns-tz 3 | Fuso Europe/Lisbon obrigatório |
| PDF | jsPDF 2 | Resumo da contratação e relatório mensal, gerados no servidor |
| E-mail | Resend 4 | Convites, confirmação de adesão, confirmação de marcação |
| Mensagens | Ligação direta `wa.me` | Sem API de operadora. Sem custo por mensagem |
| Testes unitários | Vitest 2 | `lib/regras` e formatação |
| Testes da base de dados | SQL em `docs/esquema/testes` | Isolamento, agenda e regras |
| Testes ponta a ponta | Playwright 1 | Marcação, adesão, convite, código de acesso |
| Formatação | ESLint 9 e Prettier 3 | `eslint .` com a configuração do Next.js |

### B.2 · Princípios de arquitetura

- **Uma única aplicação.** Não há um projeto por camada nem por barbearia. O que distingue as camadas é o papel do utilizador e as políticas de acesso na base de dados.
- **Personalização por configuração, nunca por código.** Cada barbearia é uma linha na tabela de inquilinos. Acrescentar uma barbearia é preencher um formulário.
- **Isolamento na base de dados.** Nenhuma consulta devolve registos de outro inquilino, mesmo que o código tenha um erro. Garantem-no o RLS e as chaves compostas `(inquilino_id, id)`, não a disciplina de programação.
- **A base de dados é a autoridade sobre o que se grava.** Vaga válida, preço, comissão, selos e stock decidem-se em funções SQL testadas (F.7, `docs/esquema/02_funcoes.sql`). O TypeScript chama-as.
- **O cliente final nunca vê dados que não sejam os seus**, mesmo alterando endereços.
- **Nenhum custo variável por mensagem.** O WhatsApp é por ligação `wa.me`. O único envio automático é o e-mail transacional.
- **Nenhum pagamento nem documento fiscal na versão 1.** O dinheiro regista-se; os módulos de pagamentos e faturação existem desligados (G.4).
- **Português de Portugal em toda a interface.** Inglês e francês só na página pública e na área de cliente, quando a funcionalidade `multilinguagem` estiver ligada.

### B.3 · Ficheiro package.json de referência

Cria-se na Fase 0, antes de qualquer outra coisa, e as versões ficam fixas no
`package-lock.json`. Antes de continuar, `npm audit` sem vulnerabilidades altas
ou críticas.

```json
{
  "name": "instabarber",
  "private": true,
  "engines": { "node": ">=22.0.0 <23" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:sql": "bash scripts/testar-sql.sh",
    "test:e2e": "playwright test",
    "db:migrate": "supabase db push",
    "db:types": "supabase gen types typescript --local > types/database.ts"
  },
  "dependencies": {
    "next": "15.5.7",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "@supabase/supabase-js": "2.47.12",
    "@supabase/ssr": "0.5.2",
    "@tanstack/react-query": "5.62.11",
    "zustand": "5.0.2",
    "react-hook-form": "7.54.2",
    "@hookform/resolvers": "3.9.1",
    "zod": "3.24.1",
    "recharts": "2.15.0",
    "date-fns": "4.1.0",
    "date-fns-tz": "3.2.0",
    "jspdf": "2.5.2",
    "resend": "4.0.1",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "tailwind-merge": "3.0.1",
    "lucide-react": "0.469.0",
    "server-only": "0.0.1"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "tailwindcss": "4.0.0",
    "@tailwindcss/postcss": "4.0.0",
    "postcss": "8.4.49",
    "tw-animate-css": "1.2.5",
    "eslint": "9.18.0",
    "eslint-config-next": "15.5.7",
    "@eslint/eslintrc": "3.2.0",
    "prettier": "3.4.2",
    "vitest": "2.1.8",
    "@playwright/test": "1.49.1",
    "@types/node": "22.10.5",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "supabase": "2.6.8"
  }
}
```

Regras deste ficheiro:

- `next`, `react`, `react-dom` e `eslint-config-next` nunca abaixo das versões mostradas. Se houver uma versão de correção mais recente na mesma série (15.5.x, 19.2.x), usa-se essa.
- Se uma versão fixada já não existir no registo npm, usa-se a mais recente da mesma série menor e regista-se no `DECISOES.md`.
- Os pacotes `@radix-ui/react-*` que o CLI do shadcn/ui instala para cada componente estão autorizados. Mais nenhum pacote entra sem autorização.
- `server-only` faz falhar a compilação se um ficheiro de servidor (como `lib/supabase/servico.ts`) for importado no browser.
- Nunca intervalos (`^`, `~`) no `package.json`.

### B.4 · Estrutura de pastas

Uma estrutura, sem alternativas. Rotas e pastas só em ASCII.

```
instabarber/
├── middleware.ts                      Resolve o inquilino pelo host (L.4) e protege as camadas
├── app/
│   ├── layout.tsx                     Layout raiz, fontes (Inter local) e tema
│   ├── globals.css                    Variáveis CSS da marca
│   ├── (institucional)/page.tsx       Página da Performa LAB no domínio principal
│   ├── (adesao)/adesao/               Formulário de adesão em quatro passos (D.8)
│   ├── (auth)/entrar/                 Entrada da equipa; definir palavra-passe por convite
│   ├── (admin)/admin/                 CAMADA 1 — Performa LAB (só super_admin com 2FA)
│   │   ├── page.tsx                   Painel geral e alertas
│   │   ├── barbearias/                Lista; barbearias/[id]/ ficha com separadores
│   │   ├── pedidos/                   Pedidos de adesão
│   │   ├── funcionalidades/           Grelha por inquilino
│   │   ├── pagamentos/                Faturas e recebimentos da plataforma
│   │   └── modulos/                   Pagamentos e faturação (desligados, G.4)
│   ├── (app)/app/                     CAMADAS 2 e 3 — Barbearia e profissional
│   │   ├── page.tsx                   Início com resumo do dia
│   │   ├── agenda/                    Agenda do dia e por profissional
│   │   ├── clientes/                  Lista, radar, ficha ([id]), envio em lote
│   │   ├── equipa/                    Desempenho; equipa/[id]/ painel do profissional
│   │   ├── financeiro/                Objetivos, custos, despesas, comissões e acertos
│   │   ├── loja/                      Produtos e pedidos
│   │   ├── relatorio/                 Relatório mensal e PDF
│   │   ├── sistema/                   Gestão do sistema (só o gestor)
│   │   └── plano/                     O meu plano (leitura)
│   ├── (publico)/b/[slug]/            CAMADA 4 — rota interna; o público nunca vê "/b/"
│   │   ├── page.tsx                   Página pública (E.6)
│   │   ├── servicos/                  Serviços e preços
│   │   ├── marcar/                    Marcação (E.4)
│   │   ├── loja/                      Encomenda de produtos
│   │   ├── fila/                      Fila presencial por QR
│   │   ├── entrar/                    Acesso do cliente por código
│   │   └── minha-area/                Selos, histórico, próxima marcação, clube
│   └── api/
│       ├── adesoes/route.ts           Formulário de adesão (limite por IP, honeypot)
│       ├── acesso/route.ts            Verifica o código e cria a conta do cliente (chave de serviço)
│       ├── relatorios/route.ts        Gera o PDF do relatório no servidor
│       └── webhooks/pagamentos/route.ts  Responde 404 enquanto o módulo estiver desligado
├── components/
│   ├── ui/                            shadcn/ui, sem lógica de negócio
│   ├── nucleo/                        Partilhados por todas as camadas
│   ├── admin/                         Só camada 1
│   ├── barbearia/                     Só camadas 2 e 3
│   └── cliente/                       Só camada 4
├── lib/
│   ├── supabase/
│   │   ├── browser.ts                 Cliente do browser (chave anónima)
│   │   ├── servidor.ts                Cliente do servidor, com a sessão do utilizador
│   │   └── servico.ts                 Chave de serviço. import "server-only". NUNCA no browser
│   ├── repositorios/                  Todas as consultas, uma pasta por domínio
│   ├── regras/                        Funções puras com testes (mensalidade, classificação, objetivos, recomendações, acertos, wa.me)
│   ├── funcionalidades/               Leitura das chaves ativas e montagem dos menus
│   ├── vertical/barbearia.ts          Vocabulário da vertical
│   ├── i18n/                          pt-PT.ts (base, todos os textos visíveis, painéis incluídos), en.ts, fr.ts (só página pública e área de cliente). Outros idiomas: Parte P
│   ├── validacao/                     Esquemas Zod partilhados
│   ├── formatacao/                    dinheiro.ts (cêntimos), datas.ts (Europe/Lisbon), telefone.ts (E.164)
│   ├── email/                         Modelos dos e-mails transacionais
│   ├── pagamentos/                    Módulo desligado (G.4): interface, adaptador manual e simulado
│   └── faturacao/                     Módulo desligado (G.4): interface, modo manual, certificado e portal
├── supabase/migrations/               Cópia exata de docs/esquema/01…04
├── scripts/
│   ├── testar-sql.sh                  Corre docs/esquema/testes na base local
│   └── gerar-mestre.sh                Gera o documento mestre a partir das Partes
├── types/database.ts                  Tipos gerados do esquema
├── docs/ fases/                       A especificação
├── CLAUDE.md  DECISOES.md  PROGRESSO.md
└── .env.local                         Chaves. Nunca para o Git
```

### B.5 · Convenções de código

- Pastas de rota em kebab-case e ASCII; componentes em PascalCase; funções em camelCase; tipos em PascalCase. Tabelas e colunas em português, minúsculas, ASCII, com underscore. Sem abreviaturas inventadas.
- Cada ficheiro de `lib/regras` exporta funções puras: recebem dados, devolvem resultado, não consultam nem escrevem. Cada uma tem testes.
- Nenhum componente fala com o Supabase. Toda a leitura passa por `lib/repositorios`; toda a escrita por Server Action ou rota de servidor, com validação Zod.
- As escritas que têm função SQL própria (reservar, confirmar, concluir, marcar falta, levantar pedido, anonimizar, aplicar pacote) chamam-na por RPC. Nunca se reimplementa a regra em TypeScript.
- Validação em dois níveis, com o mesmo esquema: no formulário, para resposta imediata; no servidor, como autoridade. Nunca só no cliente.
- Regras de importação: `components/nucleo` pode ser importado por qualquer camada; `components/admin` só pela camada 1; `components/barbearia` só pelas camadas 2 e 3; `components/cliente` só pela camada 4.
- `lib/supabase/servico.ts` começa com `import "server-only"`: uma importação acidental no browser falha na compilação.
- Datas: `timestamptz` na base de dados; conversão para Lisboa só em `lib/formatacao/datas.ts` ou nas funções SQL. Aritmética manual de horas é proibida.
- Dinheiro: cêntimos inteiros no TypeScript; `lib/formatacao/dinheiro.ts` converte de e para `numeric(10,2)` e formata em «12,30 €».
- Telefones em E.164 (`+351912345678`). A máscara portuguesa de nove dígitos acrescenta `+351`.
- Nenhum texto visível fica dentro de um componente: vive em `lib/vertical` (painéis) ou `lib/i18n` (página pública e área de cliente).
- Um componente por ficheiro. Acima de 200 linhas, dividir antes de acrescentar.
- Erros das funções SQL chegam como códigos (`ocupado`, `reserva_expirada`, `bloqueado_por_faltas`…). A interface traduz cada código numa frase em `lib/vertical`; nunca mostra a mensagem técnica.

### B.6 · Autenticação e sessões

| Quem | Como entra | Como recupera | Detalhe |
| --- | --- | --- | --- |
| Super administrador | E-mail, palavra-passe e segundo fator TOTP | Pela Performa LAB | As políticas exigem sessão `aal2`; sem ela não vê nada (H) |
| Dono da barbearia | E-mail e palavra-passe | Ligação por e-mail | Conta criada na aprovação da adesão; define a palavra-passe pela ligação (D.10) |
| Barbeiro | E-mail e palavra-passe | Ligação por e-mail | Convite por e-mail enviado quando o gestor o regista (E.3). O NIF nunca é palavra-passe |
| Cliente final | Telemóvel e palavra-passe | Código enviado pela barbearia | Conta opcional; marcar não exige conta. Número novo escolhe a palavra-passe na primeira marcação; número com ficha cria o acesso pelo código (F.9) |

- **Uma conta de equipa, vários perfis.** Um utilizador pode ser dono numa barbearia e barbeiro noutra. O RLS verifica a pertença; o painel abre a barbearia do endereço onde se entrou e permite trocar.
- **Conta do cliente por barbearia.** A conta de autenticação do cliente usa um e-mail técnico `<telefone>.<inquilino_id>@clientes.instabarber.pt`, criado com a chave de serviço: pela rota `api/acesso` depois de verificar o código, ou na confirmação da primeira marcação quando `pode_criar_acesso_direto()` o permite. O cliente só vê telemóvel e palavra-passe.
- **Sessões:** cookies `httpOnly` geridos pelo `@supabase/ssr`. O endereço de cada barbearia (subdomínio ou domínio próprio) tem a sua sessão; os endereços de retorno do Supabase Auth incluem o domínio principal e os domínios próprios ativos.
- O middleware só decide o encaminhamento. A autorização está no servidor e na base de dados; esconder um botão não é segurança.


---

## Parte C · Modelo de dados

O esquema completo vive em `docs/esquema/`, como SQL executável e testado. Esta
Parte explica-o. **Em caso de diferença, vale o SQL.** O esquema foi validado a
21 de outubro de 2026 num PostgreSQL 16 limpo: os quatro ficheiros aplicam-se de
uma vez e os 389 testes passam.

### C.1 · Princípios do esquema

- **Um só esquema, quatro ficheiros, por esta ordem:** `01_tabelas.sql`, `02_funcoes.sql`, `03_rls.sql`, `04_dados_iniciais.sql`. Na Fase 1 copiam-se para `supabase/migrations/` sem alterações.
- **Identificadores só em ASCII**: `marcacoes`, `servicos`, `pedidos_adesao`. Nunca acentos.
- **Todas as tabelas operacionais têm `inquilino_id`.** As referências entre tabelas do mesmo inquilino usam chaves compostas `(inquilino_id, id)`: uma marcação da barbearia A não pode, fisicamente, apontar para um barbeiro da barbearia B.
- **O histórico nunca se reescreve.** Comissão, percentagem, modelo de caixa, custo e IVA ficam gravados no momento (`visitas`, `pedido_linhas`); acertos liquidados não se alteram; selos são um livro de movimentos.
- **Datas em `timestamptz`** (UTC). A hora de Lisboa calcula-se só nas funções `hora_local()` e `instante_lisboa()`.
- **Dinheiro em `numeric(10,2)`.** Os preços de serviços, clube e cartões são o valor final ao cliente; os produtos guardam custo sem IVA, taxa e preço com IVA.
- **Nada se apaga em cascata quando tem valor financeiro.** Clientes não se apagam: anonimizam-se (`anonimizar_cliente()`). Um serviço, cliente ou profissional com histórico não se apaga (`ON DELETE NO ACTION`). A única exceção é eliminar uma barbearia cancelada inteira, no fim do contrato (`eliminar_inquilino()`).

### C.2 · Mapa das tabelas

| Domínio | Tabelas | Regras que importam |
| --- | --- | --- |
| Barbearias | `inquilinos` | Campos protegidos (plano, estado, cobrança, domínio, slug) só o super_admin altera — gatilho `proteger_inquilino`. Slugs reservados na própria tabela |
| Pessoas da equipa | `perfis`, `profissionais`, `horarios_profissional`, `ausencias` | O cliente não tem perfil. Um utilizador pode ter perfis em várias barbearias. O barbeiro só altera nome apresentado, foto e portfólio — gatilho `proteger_profissional`. O número de profissionais ativos nunca passa o contratado |
| Calendário | `feriados` | Nacionais com `inquilino_id` nulo, carregados pela plataforma; cada barbearia acrescenta os seus (municipal, Carnaval, dias fechados) |
| Serviços | `servicos`, `comissoes_servico` | Nomes e descrições em PT obrigatórios; EN e FR opcionais. Comissão por serviço substitui a de omissão do profissional |
| Clientes | `clientes`, `fichas_tecnicas`, `codigos_acesso` | Um cliente por telefone (E.164) e por barbearia. Consentimento com data. `auth_user_id` só depois de verificado o código (B.6) |
| Agenda | `marcacoes` | Estados: `reservada`, `agendada`, `concluida`, `falta`, `cancelada`. A restrição `sem_sobreposicao` trava duas marcações ativas sobrepostas para o mesmo profissional; canceladas e faltas libertam o horário |
| Serviços prestados | `visitas`, `movimentos_selos` | A visita só nasce por `concluir_marcacao()` e guarda base, percentagem e valor da comissão, modelo de caixa e emitente |
| Clube | `clubes`, `clube_servicos`, `subscricoes`, `ciclos_clube`, `creditos_clube` | Um ciclo por período pago; o pagamento regista-se (`pago_em`, `metodo`). Créditos só valem em ciclos pagos e em curso |
| Cartões oferta | `cartoes_oferta`, `movimentos_cartao` | Vendidos ao balcão; o saldo é o valor inicial menos os usos (vista `saldo_cartoes`) |
| Preço e montra | `periodos_desconto`, `promocoes`, `portfolio_fotos` | Até seis fotografias por barbeiro |
| Filas | `fila_espera`, `fila_presencial` | Um cliente uma vez por serviço e dia; prazos por `expira_em`, sem tarefas agendadas |
| Loja | `produtos`, `pedidos_loja`, `pedido_linhas` | O stock só desconta em `levantar_pedido()` |
| Mensagens | `mensagens` | WhatsApp: `preparada` → `ligacao_aberta` → `envio_confirmado_manualmente`. `enviado`/`falhou` só existem no e-mail |
| Financeiro | `custos_fixos`, `despesas`, `objetivos`, `acertos` | Objetivo com profissional nulo = da barbearia. Acerto liquidado não se reescreve; corrige-se com um acerto `correcao` |
| Grelha | `funcionalidades`, `pacote_funcionalidades`, `inquilino_funcionalidades` | Só o super_admin escreve. `mostra_upgrade` diz quais aparecem com a chamada de upgrade (D.3) |
| Plataforma | `pedidos_adesao`, `faturas_plataforma`, `recebimentos`, `auditoria`, `limites_pedidos` | A palavra-passe nunca entra no pedido. Faturas da Performa LAB com o número do seu programa certificado |
| Desligados (G.4) | `modulos_plataforma`, `inquilino_modulos`, `ligacoes_externas`, `pagamentos`, `documentos_fiscais` | Só o super_admin. Nenhuma tabela anterior depende destas |

### C.3 · As funções que gravam

O TypeScript chama estas funções por RPC e nunca reimplementa a regra.

| Função | Quem chama | O que faz |
| --- | --- | --- |
| `vagas_livres(inquilino, servico, dia, profissional?)` | Público, equipa | Vagas do dia com preço e desconto (F.7) |
| `validar_vaga(...)` | Equipa | Motivo de recusa, ou nulo se a vaga é válida |
| `calcular_preco(inquilino, servico, inicio)` | Público, equipa | Valor de tabela, desconto de hora morta e valor cobrado |
| `reservar_vaga(...)` | Público | Prende a vaga 10 minutos e devolve um token |
| `confirmar_reserva(...)` | Público | Com o token, cria ou encontra o cliente e passa a `agendada` |
| `cancelar_minha_marcacao(...)` | Cliente com conta | Respeita a antecedência de cancelamento |
| `concluir_marcacao(marcacao, modo, valor?)` | Gestor, barbeiro da marcação | Modo `normal`, `credito_clube` ou `premio`; grava a visita, a comissão e os selos |
| `marcar_falta(marcacao)` | Gestor, barbeiro da marcação | Depois da hora marcada |
| `entrar_fila_espera(...)`, `entrar_fila_presencial(...)` | Público | Com as funcionalidades ligadas |
| `criar_pedido_loja(...)`, `levantar_pedido(...)` | Público / equipa | Total calculado na base; stock só ao levantar |
| `submeter_pedido_adesao(jsonb)` | Público (via rota com limite) | Recusa qualquer campo de palavra-passe |
| `pedir_codigo_acesso(...)` | Público | Gera o código, que aparece à equipa para envio por wa.me; resposta igual exista ou não o número |
| `verificar_codigo_acesso(...)` | Só servidor (chave de serviço) | Valida o código (15 min, 5 tentativas, uso único) |
| `procurar_cliente_por_telefone(...)` | Equipa | Procura exata, para marcar ao balcão |
| `anonimizar_cliente(cliente)` | Gestor, super_admin | Direito de eliminação (H) |
| `consumir_limite(chave, máximo, janela)` | Só servidor (chave de serviço) | Limites de pedidos nas entradas públicas (F.6) |
| `pode_criar_acesso_direto(cliente)` | Só servidor (chave de serviço) | Se um número novo pode escolher a palavra-passe na primeira marcação, sem código (F.9) |
| `aplicar_pacote(inquilino)` | Super_admin | Marca as funcionalidades do plano (aprovação e «Repor pacote») |
| `eliminar_inquilino(inquilino, slug)` | Super_admin | Apaga uma barbearia cancelada e todos os dados; devolve as contas de autenticação a apagar (manual, P-18) |

As funções `security definer` têm `search_path` vazio. A execução é retirada a
todos e dada só a quem consta da tabela.

### C.4 · Vistas

- **Públicas** (`publico_inquilinos`, `publico_servicos`, `publico_profissionais`, `publico_portfolio`, `publico_produtos`, `publico_promocoes`, `publico_periodos_desconto`): a única forma de o anónimo ler dados. Só barbearias ativas, só colunas seguras (sem NIF nem dados de cobrança), e respeitam as funcionalidades ligadas.
- **Internas**, com as permissões de quem consulta: `saldo_selos`, `saldo_cartoes`, `cliente_por_profissional` (base da classificação por profissional, F.1).

### C.5 · Matriz de acesso (RLS)

Todas as tabelas do esquema `public` têm RLS ativo. Resumo por papel; o
detalhe está em `03_rls.sql`. O super_admin, com dois fatores, lê todas as
tabelas (vista de apoio e exportação dos dados de uma barbearia que sai).

| Área | Anónimo | Cliente | Profissional | Proprietário | Super_admin |
| --- | --- | --- | --- | --- | --- |
| Barbearia (`inquilinos`) | Vista pública | Vista pública | Lê a sua | Lê e altera (sem campos protegidos) | Tudo |
| Equipa, horários, ausências | Vista pública | Vista pública | Lê; altera nome, foto e portfólio próprios | Tudo na sua | Tudo |
| Serviços e comissões | Vista pública | Vista pública | Lê serviços e as suas comissões | Tudo na sua | Tudo |
| Clientes e fichas | — | A sua ficha | Os seus clientes | Todos os da sua | Leitura |
| Marcações e visitas | Funções públicas | As suas | As suas | Todas as da sua | Leitura |
| Selos | — | Os seus | Dos seus clientes | Lê e ajusta | — |
| Clube | — | O seu plano | Lê | Tudo na sua | — |
| Loja | Vista e função | Os seus pedidos | Lê, marca pronto, levanta | Tudo na sua | — |
| Mensagens | — | — | As que abriu | Todas | — |
| Financeiro e acertos | — | — | Os seus objetivos e acertos | Tudo na sua | — |
| Grelha de funcionalidades | — | — | Lê | Lê | Escreve |
| Adesões, faturas, auditoria | Função de adesão | — | — | Lê as suas faturas | Tudo |
| Módulos desligados (G.4) | — | — | — | — | Tudo |

Uma barbearia suspensa perde o acesso aos dados; o dono continua a ver a ficha
da barbearia e as faturas, para regularizar.

### C.6 · Testes obrigatórios

`docs/esquema/testes` contém cinco conjuntos que correm na Fase 1 e antes de
cada entrega (`npm run test:sql`):

- `10_isolamento.sql` — 81 testes: duas barbearias, cinco papéis, leitura, escrita, funções e Storage.
- `20_agenda.sql` — 54 testes: horário, almoço, ausências, feriados, horário próprio, janela, reservas, expiração, concorrência, cancelamentos e os dois dias de mudança de hora.
- `30_regras.sql` — 66 testes: comissão, clube, prémio, convite, faltas, loja, acertos, limite de profissionais, código de acesso, limites de pedidos, alteração de plano, fila de espera, acesso direto, leitura do super_admin, eliminação de uma barbearia, anonimização.
- `50_financas.sql` — 76 testes: custos, contas a pagar e estado efetivo, metas, lembretes de vencimento (WhatsApp e e-mail, estados e recusas), vista dos vencimentos, isolamento por papel e eliminação da barbearia.
- `40_comercial.sql` — 112 testes: NIF, numeração, leads do site (duplicados e limite), funil, propostas e validade, contratos e assinatura, convites de adesão, isolamento por papel e retenção.

Nenhuma fase de segurança se considera concluída pela existência das políticas:
os testes correm e o resultado mostra-se.

### C.7 · Storage

| Bucket | Caminho | Quem escreve | Quem lê |
| --- | --- | --- | --- |
| `publico` | `<inquilino_id>/…` (logótipo, capa, galeria, produtos) | Proprietário | Todos |
| `publico` | `<inquilino_id>/portfolio/<profissional_id>/…` | O barbeiro e o proprietário | Todos |
| `fichas` | `<inquilino_id>/<cliente_id>/…` | Proprietário; barbeiro para os seus clientes | Os mesmos |
| Adesão | URL assinado criado pela rota `api/adesoes` | Formulário | Super_admin |

Formatos e tamanhos das imagens: D.8.1.

### C.8 · Tarefas da plataforma sobre os dados

- **Feriados nacionais:** carregados até 2028 em `04_dados_iniciais.sql`. A Performa LAB acrescenta o ano seguinte antes de 1 de dezembro (M.1).
- **Reservas expiradas:** libertam-se sozinhas na marcação seguinte do mesmo profissional; não precisam de tarefa agendada.
- **Tipos TypeScript:** `npm run db:types` depois de cada migração.


---

## Parte D · Planos, funcionalidades e pacotes

Existem dois planos, o Basic e o Pro. O Basic é o produto completo para quem
trabalha sozinho. O Pro acrescenta três ideias: mais do que um profissional
(com metas por barbeiro), a abertura de mensagens pelo sistema (individual de
recuperação, aniversário e avaliação, e todas as mensagens em lote) e os
módulos de receita (clube, loja, QR, preços por período, cartões oferta). O que
cada plano inclui está na grelha D.3, que é a única fonte.

### D.1 · Os planos

| | Basic | Pro |
| --- | --- | --- |
| Mensalidade sem IVA | 19,99 € | 39,00 € |
| Mensalidade com IVA (23 %) | 24,59 € | 47,97 € |
| Plano anual (10 mensalidades) | 199,90 € (245,88 € com IVA) | 390,00 € (479,70 € com IVA) |
| Profissionais incluídos | 1 | 3 |
| Profissional adicional | Não disponível | 10,00 € por mês (12,30 € com IVA), ou 100,00 € por ano, a partir do 4.º |
| Domínio próprio (extra) | 5,00 € por mês (6,15 € com IVA), ou 50,00 € por ano | Igual |
| Radar de clientes perdidos | Vê a lista e o valor em euros | Igual, e abre as mensagens |
| Lembrete de marcação | Individual, por wa.me | Individual e em lote |
| Fidelização por selos | Sim | Sim |
| Lista de aniversariantes | Sim | Sim |
| Mensagens de recuperação, aniversário e avaliação | Não (aparece a chamada de upgrade) | Sim, individual e em lote |
| Metas por profissional | Não (aparece a chamada de upgrade) | Sim |

O **preço final** que a barbearia paga é o da linha «com IVA (23 %)»: 24,59 € e
47,97 €. Enquanto a Prestadora estiver isenta de IVA (artigo 53.º do CIVA,
D-45), não se acrescenta IVA: a fatura diz «IVA – Regime de Isenção» e o valor
«sem IVA» é igual ao preço final. Quando passar ao regime normal, o IVA a 23 %
passa a estar incluído no preço final, ou o preço sobe por aviso (contrato,
cláusula 6.3), conforme o dono decidir nessa altura. O regime vem da variável
`PRESTADORA_REGIME_IVA` (`isento` ou `normal`). A Performa LAB fatura fora da
plataforma.

**A regra do upgrade.** No Basic o radar funciona: mostra quem se está a perder
e quanto vale. O que falta é abrir a mensagem que o traz de volta. A chamada de
upgrade fala de tempo e de clientes recuperados, nunca de funcionalidades técnicas.

### D.2 · Texto da chamada de upgrade

```
DISPONÍVEL NO PLANO PRO

No Pro, o WhatsApp abre com a mensagem pronta — o cliente certo, com o nome
e o tempo sem vir já preenchidos — e só tens de carregar em enviar.
Recuperas quem se está a perder sem escrever uma linha.

Com 3 profissionais incluídos e todas as funções ativas.

Passar para o Pro — 39 €/mês (47,97 € com IVA)
```

No radar, onde o número dói, uma chamada mais curta: «42 clientes perdidos ·
630 € a recuperar. As mensagens de recuperação fazem parte do plano Pro.» Os
dois números são sempre calculados, nunca escritos à mão.

A chamada aparece só nas funcionalidades marcadas «Upgrade» na grelha D.3.

### D.3 · Grelha de funcionalidades

#### Quem liga

Só a Performa LAB liga e desliga funcionalidades, no painel de administração.
A barbearia vê, em «O meu plano», o que está incluído e o que não está, em modo
de leitura. A base de dados recusa qualquer escrita da barbearia na grelha.

#### O que acontece quando uma funcionalidade não está ativa

- **«Sai»:** desaparece do painel — menu, ecrã, botão e rota. Quem escrever o endereço à mão recebe erro de acesso. Não fica cinzenta.
- **«Upgrade»:** o botão aparece desativado, com a chamada da D.2. Só nas mensagens e nas metas.
- Desligar não apaga dados. Os registos voltam a aparecer quando se ligar outra vez.
- A verificação faz-se no servidor e na base de dados. O menu de cada painel monta-se a partir das funcionalidades ativas, nunca de uma lista fixa no código (`lib/funcionalidades`).

| Aba do painel | Chave necessária |
| --- | --- |
| Clientes | `gestao_clientes` |
| Agenda | `agenda_basica` |
| Equipa | `painel_profissional` |
| Financeiro | `financeiro_objetivos` |
| Comissões e acertos | `comissoes_acertos` |
| Loja | `loja_produtos` |
| Relatório | `relatorio_mensal` |
| O meu plano | Sempre visível |

#### Os três estados no painel de administração

| Estado | Significado |
| --- | --- |
| No pacote | Vem do plano contratado. Só muda com mudança de plano |
| Bónus | Ligada fora do pacote. Fica em auditoria e não altera o preço |
| Inativa | Desligada. Sai do painel da barbearia (ou mostra o upgrade) |

#### A grelha

Gerada a partir de `docs/esquema/04_dados_iniciais.sql`. A `multilinguagem` não
pertence a nenhum pacote: a Performa LAB liga-a como bónus.

| Chave | Funcionalidade | Grupo | Basic | Pro | Fora do plano |
| --- | --- | --- | --- | --- | --- |
| `agenda_basica` | Agenda e marcações | Operação | Sim | Sim | Sai |
| `gestao_clientes` | Gestão de clientes | Operação | Sim | Sim | Sai |
| `profissionais_adicionais` | Vários profissionais | Operação | Não | Sim | Sai |
| `painel_profissional` | Painel por profissional | Operação | Sim | Sim | Sai |
| `metas_profissional` | Metas por profissional | Operação | Não | Sim | Upgrade |
| `ficha_tecnica` | Ficha técnica do cliente | Operação | Sim | Sim | Sai |
| `politica_faltas` | Política de faltas | Operação | Sim | Sim | Sai |
| `qr_entrada` | Entrada por QR code na loja | Operação | Não | Sim | Sai |
| `pagina_publica` | Página pública | Presença | Sim | Sim | Sai |
| `lembretes_marcacao` | Lembrete individual por WhatsApp | Presença | Sim | Sim | Sai |
| `confirmacao_email` | Confirmação por e-mail | Presença | Sim | Sim | Sai |
| `portfolio_barbeiro` | Portfólio do barbeiro | Presença | Sim | Sim | Sai |
| `pedido_avaliacao` | Pedido de avaliação no Google | Presença | Não | Sim | Upgrade |
| `multilinguagem` | Página em PT, EN e FR | Presença | Não | Não | Sai |
| `clientes_perdidos` | Radar de clientes perdidos | Retenção | Sim | Sim | Sai |
| `envio_mensagens` | Abrir mensagem individual | Retenção | Não | Sim | Upgrade |
| `envio_lote` | Abrir mensagens em lote | Retenção | Não | Sim | Upgrade |
| `campanha_aniversario` | Campanha de aniversário | Retenção | Sim | Sim | Sai |
| `fila_espera` | Fila de espera | Retenção | Não | Sim | Sai |
| `marcacao_rapida` | Repetir o último serviço | Retenção | Sim | Sim | Sai |
| `fidelizacao_selos` | Fidelização por selos | Retenção | Sim | Sim | Sai |
| `financeiro_objetivos` | Painel financeiro | Financeiro | Sim | Sim | Sai |
| `contas_a_pagar` | Contas a pagar | Financeiro | Sim | Sim | Sai |
| `painel_gestao` | Painel de gestão | Financeiro | Sim | Sim | Sai |
| `comissoes_acertos` | Comissões e acertos | Financeiro | Sim | Sim | Sai |
| `relatorios_por_profissional` | Relatórios por profissional | Financeiro | Sim | Sim | Sai |
| `relatorio_mensal` | Relatório mensal | Financeiro | Sim | Sim | Sai |
| `clube_assinatura` | Clube de assinatura | Receita | Não | Sim | Sai |
| `loja_produtos` | Loja de produtos | Receita | Não | Sim | Sai |
| `precos_dinamicos` | Preços por período de ocupação | Receita | Não | Sim | Sai |
| `cartoes_oferta` | Cartões oferta | Receita | Não | Sim | Sai |

### D.4 · Comportamento da grelha

- Na aprovação, `aplicar_pacote()` marca as funcionalidades do plano, com bónus a falso.
- O super_admin pode ligar ou desligar qualquer funcionalidade sem mudar o plano. Fora do plano, grava bónus, fica realçada a dourado e entra em auditoria com autor e data.
- Uma funcionalidade do plano desligada pelo administrador continua no preço e aparece no resumo como «desativada pela Performa LAB».
- O preço segue sempre o plano, o número de profissionais contratados e o domínio próprio, quando existe. Os bónus nunca alteram a mensalidade.
- «Repor pacote» chama `aplicar_pacote()` outra vez.

### D.5 · Cálculo da mensalidade

```
Basic   19,99 € por mês, sempre 1 profissional
Pro     39,00 € por mês, 3 profissionais incluídos
        + 10,00 € por mês por cada profissional a partir do 4.º
Extra   + 5,00 € por mês com domínio próprio, em qualquer plano

extras      = max(0, profissionais − incluídos)
mensalidade = base + extras × valor_por_extra + (domínio próprio ? 5,00 : 0)
anual       = mensalidade × 10
preço final = valor × 1,23, arredondado ao cêntimo (igual em qualquer regime)
regime normal:  sem IVA = valor; IVA = preço final − valor
regime isento:  sem IVA = preço final; IVA = 0

Exemplos (sem IVA / com IVA):
  Basic, 1 profissional ......... 19,99 € / 24,59 €
  Pro, 3 profissionais .......... 39,00 € / 47,97 €
  Pro, 4 profissionais .......... 49,00 € / 60,27 €
  Pro, 5 profissionais .......... 59,00 € / 72,57 €
  Pro, 8 profissionais .......... 89,00 € / 109,47 €
```

O número de profissionais ativos nunca passa o contratado: a base de dados
recusa (gatilho `limitar_profissionais`). Para acrescentar um barbeiro, a
Performa LAB aumenta o número contratado.

### D.6 · O seletor de profissionais no formulário de adesão

- No Basic, o contador fica fixo em 1, com a nota de que o plano admite um profissional.
- No Pro, os botões de mais e menos sobem e descem o número, com o mínimo de 3.
- Por baixo, a conta em linguagem corrente: «3 incluídos + 2 extra a 10,00 € = 20,00 € a mais» (para 5 profissionais).
- A caixa de preço mostra o total com e sem IVA, a periodicidade (mensal ou anual) e a decomposição.
- O número de profissionais e a mensalidade entram no resumo da contratação e na notificação à Performa LAB.

### D.7 · Uma só fórmula em todo o sistema

A fórmula vive em `lib/regras/mensalidade.ts` e é usada pelo formulário, pelo
painel de administração e pelo registo de recebimentos. Trabalha em cêntimos.

```ts
export type Plano = "basic" | "pro";
export type Periodicidade = "mensal" | "anual";

const BASE_CENT: Record<Plano, number> = { basic: 1999, pro: 3900 };
const INCLUIDOS: Record<Plano, number> = { basic: 1, pro: 2 };
const EXTRA_CENT: Record<Plano, number> = { basic: 0, pro: 1000 };
export const DOMINIO_PROPRIO_CENT = 500;
export const TAXA_IVA = 0.23;
export type RegimeIva = "normal" | "isento"; // PRESTADORA_REGIME_IVA (D-45)

export function calcularMensalidadeCent(plano: Plano, nProfissionais: number, dominioProprio = false): number {
  if (plano === "basic" && nProfissionais !== 1) throw new Error("basic_um_profissional");
  if (plano === "pro" && nProfissionais < 2) throw new Error("pro_minimo_dois");
  const extras = Math.max(0, nProfissionais - INCLUIDOS[plano]);
  return BASE_CENT[plano] + extras * EXTRA_CENT[plano] + (dominioProprio ? DOMINIO_PROPRIO_CENT : 0);
}

export function calcularPrecoCent(
  plano: Plano, nProfissionais: number, periodicidade: Periodicidade, dominioProprio = false, regime: RegimeIva = "normal",
) {
  const mensal = calcularMensalidadeCent(plano, nProfissionais, dominioProprio);
  const valor = periodicidade === "anual" ? mensal * 10 : mensal;
  const final = Math.round(valor * (1 + TAXA_IVA)); // o que o cliente paga, em qualquer regime
  return regime === "isento"
    ? { semIva: final, comIva: final, ivaTaxa: 0 }
    : { semIva: valor, comIva: final, ivaTaxa: 23 };
}
```

Duplicar esta fórmula é a forma mais rápida de o sistema começar a cobrar
valores diferentes conforme o ecrã.

### D.8 · O formulário de adesão

Quatro passos: identidade; contactos e horário; serviços e equipa; confirmação
da contratação. Também pergunta o modelo de caixa (F.4.11).

- O pedido grava-se pela rota `api/adesoes`, que aplica o limite por IP e por e-mail e o campo honeypot, e chama `submeter_pedido_adesao()`. Não há modo de demonstração no fluxo de produção.
- O formulário nunca recolhe palavra-passe. A função recusa o pedido se encontrar um campo desses.
- O dono aceita os Termos de Uso, a Política de Privacidade e o Acordo de Subcontratação; a data fica gravada.

#### D.8.1 · Imagens

O logótipo é obrigatório; a fachada e a galeria são opcionais. Carregam-se por
URL assinado criado pela rota.

```
LOGÓTIPO            PNG, SVG ou WEBP · fundo transparente · até 1 MB · mínimo 512 × 512 px · 1
FOTOGRAFIA DE FACHADA  JPG ou WEBP · até 3 MB · mínimo 1600 × 900 px (16:9) · 1
GALERIA             JPG ou WEBP · até 3 MB cada · mínimo 1200 × 800 px · até 6, incluindo a fachada
```

- O fundo transparente da logo é o requisito mais importante. Se vier com fundo branco, o formulário avisa e deixa continuar: explica que vai aparecer um quadrado branco sobre a capa.
- A primeira posição da galeria é sempre a fachada. Sem fachada, a capa usa a cor da logo num gradiente.
- Debaixo do botão de carregamento, uma linha com o essencial; no e-mail de boas-vindas, a instrução completa.

#### D.8.2 · O que acontece quando o dono confirma

```
1. O dono clica em «Enviar para a Performa LAB».
2. O pedido grava-se em pedidos_adesao, com estado pendente. Não se cria conta nenhuma.
3. A Performa LAB recebe um e-mail curto:
     Nova adesão: Barbearia Central · Pro · 3 profissionais · 39,00 € (47,97 € com IVA)/mês · prefere MB WAY
   com a ligação para o separador Pedidos.
4. O administrador abre o pedido e decide:
     Aprovar  → cria o inquilino ativo, aplica a marca e o pacote, cria a conta do dono
     Ajustar  → abre a ficha completa antes de aprovar
     Rejeitar → arquiva com motivo obrigatório e responde por e-mail
5. Na aprovação, o dono recebe o e-mail de boas-vindas com o endereço da
   barbearia e a ligação para definir a palavra-passe.
```

### D.9 · O que está a contratar

O passo final mostra a lista completa do que fica incluído, gerada a partir da
grelha D.3 para o plano escolhido, com o nome do plano e o preço no topo. No
Basic, o que é só do Pro aparece esbatido, com a nota «disponível no Pro». A
lista recalcula quando muda o plano, a periodicidade ou o número de profissionais.

### D.10 · Credenciais de acesso

O formulário recolhe apenas o e-mail de acesso, validado no momento. A conta
do dono cria-se só na aprovação, no Supabase Auth, e o dono define a
palavra-passe pela ligação segura que recebe por e-mail. A aprovação, a
ativação e as falhas ficam em auditoria. Nenhuma conta se considera operacional
antes de o primeiro acesso ter sido testado.

### D.11 · Resumo da contratação

O formulário gera um PDF para o dono guardar: o «Resumo da contratação».

- Contém o contratante, o plano, a periodicidade, o número de profissionais com a decomposição do preço (com e sem IVA), a lista de funcionalidades incluídas e o e-mail de acesso.
- Nunca contém palavra-passe.
- Identidade da Performa LAB: cabeçalho escuro, dourado, paginação no rodapé.
- Leva no rodapé: **«Não é documento fiscal. A fatura é emitida pela Performa LAB pelos seus meios.»**

### D.12 · Fluxo completo da adesão

```
1. A Performa LAB envia a proposta ao dono da barbearia.
2. O dono aceita e recebe a ligação do formulário.
3. Preenche os quatro passos, escolhe o plano, a periodicidade e os profissionais, e confirma.
4. Recebe o resumo da contratação em PDF; a Performa LAB recebe a notificação.
5. O pedido entra no separador Pedidos, pendente.
6. A Performa LAB revê e aprova: inquilino ativo, pacote aplicado, conta do dono criada.
7. O dono define a palavra-passe pela ligação recebida e entra.
8. A Performa LAB importa os clientes e os serviços, se o dono os trouxer de outro sistema (E.1).
```

### D.13 · Preferência de pagamento

No fim do formulário, o dono escolhe como prefere pagar. Não é uma cobrança: diz
à Performa LAB como responder.

| Escolha | O que a Performa LAB faz |
| --- | --- |
| MB WAY | Envia o pedido de pagamento para o número indicado |
| Transferência bancária | Envia o IBAN por e-mail |
| Dinheiro | Combina a entrega em mão |

Não se recolhem dados de cartão nem de conta. A preferência entra no pedido, no
resumo e na notificação, e aparece em destaque no cartão do pedido.


---

## Parte E · Especificação das quatro camadas

Cada ecrã mostra só o que as funcionalidades ativas permitem (D.3). Abaixo de
768 px, tudo funciona no telemóvel (I.3.1).

### E.1 · Camada 1 — InstaBarber Admin (Performa LAB)

Acesso em `instabarber.pt/admin`, só no domínio principal (A.3). Só entra o super_admin com sessão de dois fatores. É aqui
que a Performa LAB aprova, configura, liga funcionalidades e regista pagamentos.

#### Painel geral

- Quatro indicadores: barbearias ativas, receita recorrente mensal (com e sem IVA), adesões no mês, pedidos pendentes.
- Alertas: mensalidades em atraso, barbearias suspensas, vencimentos nos próximos sete dias, barbearias com sinais de abandono (M.2), feriados do ano seguinte por carregar (a partir de novembro).
- Atividade recente, lida da auditoria.

#### Barbearias

- Lista com pesquisa e filtros por estado, plano e periodicidade. Colunas: nome, plano, estado, funcionalidades ativas, endereço público, mensalidade.
- A ficha do inquilino tem **dez separadores**: Identidade, Marca, Contactos, Horário, Serviços, Equipa, Funcionalidades, Pagamentos, Importação, Auditoria. Cada separador grava de forma independente, com confirmação visual.
- **Importação** (nova): carrega um CSV de clientes (nome, telemóvel, e-mail, data de nascimento, notas) e um de serviços (nome, duração, preço). Mostra a pré-visualização, as linhas com erro (telemóvel inválido, duplicado) e só grava as válidas. Os clientes importados ficam com origem «importação» e **sem consentimento para mensagens promocionais** até o darem.
- Ações rápidas: suspender, reativar, cancelar, **exportar dados** (da barbearia inteira em CSV, num ficheiro comprimido, para lhe entregar quando sai — RGPD, art. 28.º, n.º 3, g; ou de um só cliente, a pedido escrito da barbearia) e **eliminar definitivamente** (só com a barbearia cancelada, pedindo o slug como confirmação; chama `eliminar_inquilino()` e apaga as contas que ficam sem uso). Os procedimentos estão no manual do operador (P-12, P-18).
- **Domínio próprio**, no separador Identidade: o domínio e o interruptor do extra (+5,00 € por mês); a mensalidade recalcula com a D.7. O procedimento de ligação está no manual do operador.
- **Vista de apoio**: o super_admin abre o painel da barbearia em modo só de leitura, com a sua própria sessão (o RLS já lhe dá leitura). Exige justificação escrita, dura no máximo 30 minutos, mostra uma faixa visível e fica em auditoria. Nunca se partilham palavras-passe.

#### Comercial

Separador do Admin para o processo de venda, da primeira conversa ao contrato assinado: Funil, Leads, Propostas, Contratos e Modelos. Especificado na Parte N; é construído na Fase 3B. O formulário da landing alimenta-o e o convite de adesão pré-preenche o formulário D.8.

#### Finanças

Separador do Admin para o dinheiro da Performa LAB: custos, contas a pagar, lucro, ponto de equilíbrio, objetivo de faturação, previsões, exportação e lembretes de vencimento aos inquilinos (WhatsApp e e-mail). Especificado na Parte O; é construído na Fase 3C. Lê os recebimentos e as faturas do separador Pagamentos.

#### Pedidos de adesão

- Lista dos pedidos pendentes, com plano, profissionais, mensalidade e preferência de pagamento em destaque.
- Cada pedido abre com os dados, as imagens e a verificação das imagens (D.8.1).
- **Aprovar** cria o inquilino ativo, gera o slug, aplica o pacote, cria a conta do dono e envia o e-mail de boas-vindas. **Rejeitar** pede motivo e responde por e-mail. **Ajustar** abre a ficha completa antes de aprovar. A mensalidade é recalculada com `lib/regras/mensalidade.ts`.

#### Funcionalidades

- Seletor de inquilino no topo.
- A grelha D.3 por grupos: caixa, nome, descrição e etiqueta de estado (no pacote, bónus, inativa). Bónus realçados a dourado.
- Painel lateral com o contador de ativas, o resumo e a mensalidade.
- «Guardar alterações» aplica e escreve em auditoria. «Repor pacote» volta ao plano.

#### Pagamentos

- Indicadores: receita do mês, mensalidades em dia e em atraso, valor em atraso, projeção anual.
- Tabela de barbearias com plano, periodicidade, estado de pagamento, próximo vencimento e valor.
- Faturas da Performa LAB: número (do programa certificado da Performa LAB), período, valor, emitida, paga.
- Registo de recebimentos: data, método (dinheiro, MB WAY, transferência), valor e fatura. Sem cobrança automática.

#### Módulos (pagamentos e faturação)

Ecrã próprio, descrito na G.4: interruptor geral por módulo e ligação por
barbearia. Desligados por omissão. Nada disto aparece à barbearia.

### E.2 · Camada 2 — InstaBarber Gestão (painel da barbearia)

Acesso em `/app`. Entra o proprietário; os profissionais entram na sua área
(E.3). Todos os dados pertencem só àquela barbearia.

#### Início

- Faixa de ação: «Registar serviço ao balcão» e «Marcar cliente».
- Quatro indicadores: faturado hoje, previsão do dia, faturado no mês, falta para o objetivo com os dias de funcionamento restantes. «Faturado» segue a definição única da F.4.11.
- Marcações de hoje: horário, cliente, serviço, profissional e valor; concluídas a verde. Cada linha tem «Concluir», «Faltou» e o botão de lembrete.
- **Pedidos de acesso** (B9): clientes que pediram código para entrar na área deles. Cada linha mostra o nome, o telemóvel, o tempo restante (15 minutos) e o botão «Enviar código por WhatsApp», que abre o wa.me com o código já escrito.
- Contas a pagar pendentes, com «Paguei».
- Clientes a contactar, com botão de mensagem (Pro) ou chamada de upgrade (Basic).

#### Clientes

- Quatro indicadores: perdidos, em risco, faturação a recuperar, ticket médio.
- Filtros: ativos, em risco, perdidos, sem histórico, **não registados** (entraram por QR, loja ou fila sem conta), e campo de busca.
- Faixa de ação que muda com o filtro, com «Enviar em lote» e o contador de destinatários (Pro).
- Tabela: cliente, estado, última visita, dias sem vir, ticket, selos e botão de mensagem.
- **Ficha do cliente**: dados, consentimento (com data), histórico de visitas, selos e resgates, plano do clube, pedidos da loja, **ficha técnica** (notas e fotografias do corte, por barbeiro, `ficha_tecnica`), faltas e o botão «Voltar a permitir marcação online» quando a política de faltas o bloqueou.
- **Envio em lote**: janela com pré-visualização, fila de destinatários e botão que percorre a fila por ordem; cada clique abre uma conversa. Clientes sem consentimento ou com «não contactar» nunca entram na fila de mensagens promocionais.
- Cada mensagem abre o WhatsApp do próprio cliente, com o nome, os dias sem vir, o último serviço e a data, e a ligação para a página pública.

#### Agenda

- Agenda do dia por horário e por profissional, com serviços e valores; vagas livres assinaladas; ausências e férias a cinzento com o motivo.
- Botão de lembrete por marcação: abre o WhatsApp do cliente com nome, serviço, data, hora, barbeiro e, se a marcação for nesse dia, quantos minutos faltam (D-54), e regista `lembrete_aberto_em`. Disponível nos dois planos (`lembretes_marcacao`).
- «Lembretes em lote» no topo: fila das marcações por atender sem lembrete, uma conversa de cada vez (Pro, `envio_lote`).
- **Marcar ao balcão**: escolhe cliente (procura pelo telemóvel ou cria), serviço, profissional e hora; a base de dados valida a vaga e aplica o preço do período.
- **Concluir**: abre a confirmação com o valor (editável, por exemplo um extra pago ao balcão) e, quando aplicável, as opções «Usar crédito do clube», «Usar prémio de selos» e «Pagar com cartão oferta». Chama `concluir_marcacao()`.
- Indicadores do dia: marcações, faturação, ocupação.

#### Equipa

- Um separador por profissional, com quatro indicadores: faturado hoje, previsão do dia, faturado no mês, falta para o objetivo diário.
- Agenda do dia daquele profissional e progresso para o objetivo (Pro: `metas_profissional`).

#### Financeiro

- Objetivo do mês: faturado, falta e barra de progresso.
- Objetivos por profissional (Pro).
- Custos fixos e despesas, com «Paguei» e remover.
- Resumo do mês: faturação, custos, despesas, comissões, resultado e margem.
- **Comissões e acertos** (`comissoes_acertos`): uma linha por barbeiro com modelo, serviços, receita, acerto, liquidado e saldo; «Registar acerto» (F.4.11). Nota fixa: «Os acertos são controlo interno. Não substituem faturas nem recibos verdes.»

#### Gestão do sistema — só o gestor

A única forma de alterar a configuração da barbearia. O barbeiro não tem acesso,
nem pelo menu nem por endereço direto. Secções (cada uma só aparece com a
funcionalidade ativa):

- **Estado:** interruptor aberto/fechado — fechado, a página pública não aceita marcações; o balcão continua.
- **Marca:** cor da capa (paleta proposta a partir do logótipo, com pré-visualização em tempo real), logótipo, fachada, galeria, história, mostrar mapa e história.
- **Horário:** abertura, fecho, dias de descanso, almoço, fechar nos feriados nacionais, e os parâmetros da agenda — granularidade, intervalo entre marcações, antecedência mínima, antecedência de cancelamento e janela de marcação (F.7).
- **Ausências e feriados:** férias, folgas e formações por barbeiro ou da barbearia inteira; feriados próprios (municipal, Carnaval, dias fechados).
- **Equipa:** registo de barbeiros com nome, e-mail e NIF (opcional). Ao gravar, o barbeiro recebe um **convite por e-mail** para definir a palavra-passe (E.3). Para cada um: horário próprio, comissão por omissão e por serviço, modelo de caixa (com «Aplicar a todos»), renda no modelo C, cancelar e repor acesso.
- **Serviços:** nome, descrição, duração e preço final. Com `multilinguagem`, campos opcionais em inglês e francês (F.3.2).
- **Fidelização:** selos necessários (por omissão 10), prémio ativo e qual o serviço (F.2.1).
- **Aniversário:** desconto ativo e percentagem (F.3.1).
- **Faltas:** limite de faltas para bloquear a marcação online (F.8).
- **Ligações:** endereço para avaliação no Google e do Livro de Reclamações eletrónico.
- **Clube, loja, períodos de desconto, cartões oferta:** com as respetivas funcionalidades (F.4).
- **Marcações sem profissional:** a lista das órfãs, com atribuição manual.

Regra de separação: o barbeiro acompanha o próprio trabalho; só o gestor
governa a barbearia.

#### O meu plano

Sempre visível, em modo de leitura: plano, periodicidade, profissionais
contratados, mensalidade com e sem IVA, próximo vencimento, faturas e
recebimentos, o que está incluído e o que não está. Sem botões de ativação:
«Para mudar o plano, fale com a Performa LAB», com ligação para o apoio@.

### E.3 · Camada 3 — InstaBarber Equipa (painel do profissional)

Acesso em `/app/equipa/[id]`. O cabeçalho identifica sempre quem está a ver:
«Vista do Carlos»; na vista do gestor, «Vista do gestor».

#### Registo de um barbeiro novo

1. O gestor preenche nome, e-mail e NIF (opcional) na Gestão do sistema.
2. Ao gravar, o servidor cria a conta no Supabase Auth com **convite por e-mail** (enviado pelo Resend), o perfil de profissional ligado ao inquilino e a linha em `profissionais`.
3. O barbeiro abre a ligação do convite e define a sua palavra-passe. **O NIF nunca é palavra-passe.**
4. Se o barbeiro não entrar em 24 horas, o gestor vê um aviso com «Reenviar convite».
5. O nome do barbeiro aparece de imediato na agenda, na marcação pública e nos painéis do gestor.

O mesmo barbeiro pode trabalhar em várias barbearias com a mesma conta: cada
barbearia acrescenta-lhe um perfil.

#### E.3.1 · Perfil do barbeiro

- **Fotografia:** a que aparece na marcação pública.
- **Nome apresentado:** pode adotar um apelido; é o que aparece na agenda e nos relatórios.
- **Portfólio:** até seis fotografias, com o interruptor «Tornar visível» (`portfolio_barbeiro`).
- **Alterar palavra-passe** e **terminar sessão em todos os dispositivos**.
- Esqueceu-se da palavra-passe: ligação por e-mail, pedida no ecrã de entrada ou pelo gestor.

#### Regra de ouro do isolamento por profissional

A classificação de clientes é feita por profissional, nunca por barbearia. Um
cliente que deixou de vir ao Carlos pode estar a ser atendido pelo Rui. Se o
painel do Carlos o mostrar como perdido, o dado é falso e o barbeiro perde a
confiança no sistema. A classificação usa a vista `cliente_por_profissional`
(C.4), e o RLS garante que cada barbeiro só vê as suas marcações, visitas e
clientes (C.5).

#### Indicadores próprios

- Faturado hoje, com o número de serviços concluídos.
- Previsão do dia: o agendado e ainda não atendido.
- Faturado no mês e percentagem do objetivo individual (Pro).
- Falta para o objetivo do dia.
- Ticket médio do próprio barbeiro.
- Taxa de regresso dos seus clientes.

#### Agenda própria

- Só as marcações dele; ausências marcadas.
- Lembrete individual por marcação, assinado com o nome dele. «Lembretes em lote» no Pro.
- Vagas livres dele, para encaixar um cliente sem marcação («Marcar ao balcão» só para si).
- Concluir e marcar falta nas suas marcações.

#### Clientes próprios

- Lista dos clientes dele (os que marcou ou atendeu, e os que registou ao balcão), por estado.
- Ficha técnica dos seus clientes.
- Mensagem individual e em lote (Pro), assinadas com o nome dele, enviadas do WhatsApp do dispositivo dele.

#### Metas e acerto

- Objetivo mensal definido pelo gestor; barra de progresso e valor necessário por dia; histórico de seis meses (Pro). No Basic, a chamada de upgrade.
- «A minha folha de acerto» (F.4.11): leitura, com o sinal certo conforme o modelo.

### E.4 · Camada 4 — Cliente final (página pública e Minha área)

O cliente chega pela página pública (E.6). Vê a barbearia, os serviços e os
preços, e marca **sem precisar de conta**. A conta é opcional e dá acesso à área
de cliente: selos, histórico, próxima marcação, clube e encomendas.

Fronteira: o cliente vê apenas os seus dados. Não existe caminho — nem por
menu, nem por endereço — para dados de outro cliente ou da barbearia.

#### Marcação

1. **Serviço.**
2. **Barbeiro**, se a barbearia tiver mais de um ativo: primeiro nome, fotografia, portfólio (quando visível) e «Sem preferência», que entrega a marcação a quem estiver livre.
3. **Dia e hora**: só as vagas que `vagas_livres()` devolve, com o preço; nas horas mortas, o preço normal riscado e o preço com desconto.
4. **A vaga fica reservada por 10 minutos** (`reservar_vaga()`), com a contagem visível. Se o tempo acabar, a vaga é libertada e o cliente volta ao passo 3.
5. **Dados:** nome, telemóvel (máscara portuguesa de nove dígitos), e-mail (opcional: «para receber a confirmação»), data de nascimento (opcional: «para receber os parabéns»), código de convite (opcional) e a caixa de consentimento para mensagens promocionais, desmarcada por omissão. Por baixo, **«Criar acesso à minha área» com palavra-passe (opcional)**: se o número for novo na barbearia, a conta fica criada logo; se já tiver ficha, a confirmação diz «Para criar o acesso, peça o código na sua área» (F.9).
6. **Confirmação** (`confirmar_reserva()`): resumo com serviço, barbeiro, data, hora e valor; «Adicionar ao calendário»; e-mail de confirmação quando há e-mail e `confirmacao_email` está ligada.

Mensagens de recusa, sempre em linguagem corrente: vaga ocupada entretanto,
reserva expirada, marcação online bloqueada por faltas («Fale com a
barbearia»), limite de três marcações futuras.

O cliente que já marcou antes, com sessão iniciada, vê **«Repetir o último
serviço»**: o mesmo serviço e o mesmo barbeiro, no primeiro horário livre (`marcacao_rapida`).

#### Acesso à área de cliente (B9)

- **Entrar:** telemóvel e palavra-passe.
- **Número novo:** a palavra-passe escolhe-se na primeira marcação (acima); não há código.
- **Criar acesso para um número que já tem ficha, ou esqueci-me da palavra-passe:** o cliente escreve o telemóvel e pede um código. O ecrã diz: «A barbearia vai enviar-lhe um código de 6 dígitos por WhatsApp. O código é válido durante 15 minutos.» Fora do horário: «Receberá o código quando a barbearia abrir.» A resposta é igual exista ou não o número.
- O código aparece no painel da barbearia (E.2, Pedidos de acesso), que o envia por wa.me.
- Com o código certo, o cliente define a palavra-passe; a rota `api/acesso` cria ou atualiza a conta (B.6).
- Cinco tentativas por código; três pedidos por hora.

#### Minha área

- Cartão de selos, com os completos a dourado, barra de progresso, quantos faltam e o nome do prémio (quando ativo).
- Próxima marcação, com «Cancelar» até à antecedência definida (por omissão, 2 horas antes).
- Histórico: serviço, barbeiro, data e valor.
- Plano do clube: nome, próxima renovação, consumo do mês por serviço.
- Encomendas da loja e o estado.
- O código de convite pessoal, para partilhar.
- Botões: marcar, repetir o último serviço, falar no WhatsApp, ligar.

### E.5 · Relatório mensal

O documento que o dono e cada barbeiro consultam no fim do mês. Existe nos dois
painéis, com o mesmo motor de cálculo e o mesmo gerador de PDF, com âmbitos
diferentes: o gestor vê a barbearia, o barbeiro vê o que produziu. É o principal
argumento de renovação.

**Não é enviado por e-mail** (DECISOES D-11): consulta-se no painel e
descarrega-se em PDF.

#### Onde vive

- No painel da barbearia, aba «Relatório», entre o Financeiro e a Gestão do sistema.
- No painel do profissional, aba «O meu relatório».
- Abre com o mês corrente.

#### A barra de controlo

| Elemento | Comportamento |
| --- | --- |
| Seletor de mês | Setas pelos últimos doze meses; o mês por extenso |
| Exibir relatório | Recalcula e mostra |
| Descarregar relatório | Gera o PDF no servidor (`api/relatorios`) com a marca da barbearia |

#### Os nove blocos

| N.º | Bloco | O que mostra | Camada |
| --- | --- | --- | --- |
| 1 | Resumo do mês | Faturação com variação face ao mês anterior, resultado e margem, clientes atendidos, perdidos e recuperados | Ambas |
| 2 | Evolução da faturação | Barras dos seis meses, com o mês do relatório destacado | Ambas |
| 3 | Desempenho por profissional / O meu desempenho | Faturação, serviços, ticket médio, objetivo atingido e comissão | Gestor / Profissional |
| 4 | Serviços | Quantidade, receita e peso de cada serviço | Ambas |
| 5 | Retenção de clientes | Recuperados, ligações abertas, clientes novos, ativos e em risco | Ambas |
| 6 | Fidelização | Selos atribuídos, cartões completos, prémios resgatados, convites | Ambas |
| 7 | Financeiro | Receita própria (modelo A), rendas de cadeira (C), parte da casa recebida (B), comissões pagas, custos, despesas, resultado com margem. Com as funcionalidades ativas, linhas do clube (mensalidades recebidas, subscritores, créditos por usar) e da loja (receita sem IVA, custo, margem, produtos abaixo do mínimo) | Gestor |
| 8 | Operação | Taxa de faltas, ocupação média, melhor e pior dia, antecedência média das marcações | Ambas |
| 9 | O que fazer no próximo mês | Até quatro recomendações com valores em euros (F.5) | Ambas |

#### O bloco que vende o sistema

O bloco 5 fecha com a caixa **«O sistema pagou-se sozinho»**, que compara a
faturação recuperada com o valor da subscrição no mesmo período.

- **Recuperada** = valor cobrado das visitas de clientes que estavam «em risco» ou «perdidos», feitas até 30 dias depois de uma mensagem de recuperação aberta para eles.
- No Basic, sem mensagens, a caixa mostra os clientes que voltaram sozinhos e a chamada de upgrade.
- Os dois números são sempre calculados, nunca escritos à mão.

```
Recuperou 167,20 € em clientes que não voltavam.
A subscrição do sistema custou 47,97 € (com IVA) no mesmo período.
```

#### O gerador de PDF

- Um só gerador para as duas camadas: recebe o âmbito e devolve o documento.
- Cabeçalho escuro da Performa LAB, barra na cor da barbearia, logótipo; paginação em todas as páginas.
- No painel do profissional, o título identifica o barbeiro e o documento não inclui o financeiro da barbearia.
- Nome do ficheiro: `Relatorio-<mes>-<ano>-<nome>.pdf`, em ASCII.
- Rodapé: «Relatório de gestão. Não é documento fiscal.»

#### Regra de consistência dos números

Todos os valores vêm do mesmo cálculo que alimenta o resto do painel. Um
relatório com uma faturação diferente da do Início destrói a confiança no
sistema. Uma só função por indicador, usada por todos os ecrãs.

### E.6 · A página pública — a porta de entrada

A página pública é o endereço principal de cada barbearia e a porta de entrada
das três pessoas que a usam: o cliente que quer marcar, o gestor e o barbeiro.
É também a página que os motores de busca encontram. Lê só das vistas
`publico_*` e das funções públicas (C.3, C.4).

#### A capa é o cabeçalho

A página não tem barra branca por cima com o logótipo pequeno. A capa é o
cabeçalho, e a marca vive dentro dela.

```
┌──────────────────────────────────────────────┐
│  Barbearia Exemplo                  [ Entrar ] │
│  Rua da Demo, 12 · Viseu                     │
│                                              │
│  [ BARBEARIA EM VISEU ]        ╭──────────╮  │
│                                │          │  │
│  ┌──────────────────────────┐  │    BJ    │  │
│  │ Faça a sua marcação      │  │  VISEU   │  │
│  └──────────────────────────┘  │          │  │
│  ┌──────────────────────────┐  ╰──────────╯  │
│  │ Fale connosco            │                │
│  └──────────────────────────┘                │
│  ┌──────────────────────────┐                │
│  │ Prefere ligar?           │                │
│  └──────────────────────────┘                │
│                                              │
│  ● Aberto agora · fecha às 19:30             │
└──────────────────────────────────────────────┘
```

No computador, duas colunas: à esquerda as três ações, à direita o logótipo em
grande, com um halo suave. No telemóvel, o logótipo sobe e as ações ficam por
baixo, com a largura toda.

#### As três ações, sempre à vista

| Ação | Peso | O que faz |
| --- | --- | --- |
| Faça a sua marcação | Botão principal, na cor da marca | Abre o fluxo de marcação |
| Fale connosco | Botão verde | Abre o WhatsApp da barbearia |
| Prefere ligar? | Botão discreto, com o número | Inicia a chamada |

Além da capa, as três ações ficam numa barra fixa no fundo do ecrã enquanto a
página rola. Se a barbearia estiver fechada no interruptor, «Faça a sua
marcação» dá lugar a «Marcações temporariamente indisponíveis».

#### O logótipo dentro da capa

Em círculo, com o nome e a localidade por baixo, sobre dois anéis concêntricos
discretos e um halo da cor da marca. A cor da capa é escolhida pelo dono a
partir do logótipo. O texto sobre a capa é branco ou preto conforme o
contraste, com o mínimo de 4,5 para 1.

#### A barra fina ao rolar

Quando a capa sai do ecrã, sobe uma barra fina com o logótipo pequeno, o nome,
«Entrar» e «Marcar».

#### A entrada das três pessoas

«Entrar», no cabeçalho, abre a escolha:

| Escolha | Vai para | Entra com |
| --- | --- | --- |
| Sou o gestor | InstaBarber Gestão (`/app`) | E-mail e palavra-passe |
| Sou o barbeiro | InstaBarber Equipa (a área dele) | E-mail e palavra-passe |
| Sou cliente | Minha área desta barbearia | Telemóvel e palavra-passe, ou pedido de código |

Os três acessos repetem-se no rodapé, em texto.

#### O que a página mostra por baixo da capa

Cada bloco aparece só se tiver conteúdo e se a funcionalidade estiver ativa:

- **Serviços:** nome, descrição, duração e preço final (com IVA, se o houver); um toque começa a marcação.
- **Promoções em vigor.**
- **Os barbeiros:** primeiro nome, fotografia e portfólio.
- **A história**, quando o dono a escreveu.
- **Onde estamos:** mapa e ligação para o Google Maps.
- **Horário**, com aberto ou fechado no momento.
- **Loja:** produtos ativos, com «esgotado» quando o dono assim quer.
- **Contactos:** WhatsApp, telefone, redes sociais.
- **Rodapé:** Política de Privacidade, Termos, Livro de Reclamações eletrónico (obrigatório, H.2), ligação para avaliar no Google, e os três acessos.

#### A fidelização não aparece nesta página

O cartão de selos e o prémio vivem só na área de cliente. Uma página pública
que prometesse «dez selos, um corte grátis» anunciaria uma oferta que a
barbearia pode ter desligado.

#### A página é indexável

Título com o nome e a localidade, descrição com os serviços principais, e dados
estruturados `HairSalon` (schema.org) com morada, horário e serviços com preços.
A área de cliente, os painéis e o fluxo de marcação têm `noindex`.

#### Idiomas

Com `multilinguagem` ligada, a página e a área de cliente seguem a I.3.2.


---

## Parte F · Regras de negócio

Duas casas para as regras, nunca as duas para a mesma regra:

- **Na base de dados** (`docs/esquema/02_funcoes.sql`), as regras que decidem o que se grava: vaga válida, preço com desconto, comissão, selos, crédito do clube, stock, faltas, código de acesso. O TypeScript chama-as e não as reimplementa.
- **Em `lib/regras`**, funções puras com testes Vitest para o que se calcula e mostra: classificação de clientes, objetivos, mensalidade, acertos, recomendações, texto das mensagens wa.me.

### F.1 · Classificação de clientes

Cada cliente tem uma frequência habitual: a média dos intervalos entre visitas
consecutivas, ignorando intervalos superiores a 180 dias (interrupção, não
padrão). A classificação compara os dias desde a última visita com essa média.

| Estado | Condição | Ação sugerida |
| --- | --- | --- |
| Ativo | Dias sem vir abaixo de 1,5 × a frequência | Mensagem de pós-venda |
| Em risco | Entre 1,5 e 2 × a frequência | Convite a regressar |
| Perdido | Acima de 2 × a frequência | Campanha de reativação |
| Sem histórico | Nenhuma visita concluída | Sem classificação |

- **Com uma ou duas visitas**, usa-se a frequência de 30 dias por omissão. O cliente que veio uma vez há quatro meses é «perdido» — e é o grupo maior, por isso não pode ficar de fora (DECISOES D-22).
- **No painel do barbeiro**, só conta o histórico com esse barbeiro (`cliente_por_profissional`). **No painel do gestor**, conta o histórico com a barbearia inteira: um cliente que trocou de barbeiro não está perdido para a barbearia.
- **Faturação a recuperar** (estimativa): soma, para os clientes perdidos, do ticket médio de cada um multiplicado por 0,4 — a probabilidade estimada de regresso após contacto. O fator vive em `lib/regras/classificacao.ts` e é o mesmo da F.5.
- Clientes anonimizados ou com «não contactar» não entram nas listas de mensagens, mas contam para os totais.

### F.2 · Fidelização por selos (`fidelizacao_selos`)

- Cada serviço concluído credita um selo. Os selos são um livro de movimentos (`movimentos_selos`); o saldo é a soma (`saldo_selos`). Nada se reescreve.
- O número de selos necessários é configuração do gestor, por omissão 10.
- O resgate consome os selos necessários e **o excedente transita** (DECISOES D-24).
- O resgate faz-se ao concluir o serviço do prémio, no modo `premio` de `concluir_marcacao()`: o serviço entra como prestado, com valor cobrado zero, e o movimento guarda o serviço e o valor de tabela do prémio naquele momento.
- O serviço feito com o prémio não credita selo.
- Com a funcionalidade desligada, os selos deixam de se creditar; os que existem ficam.
- O saldo aparece na ficha do cliente, na agenda (ao concluir) e na área de cliente.

#### F.2.1 · O prémio

O prémio do cartão completo é decidido pelo dono na Gestão do sistema: se está
ativo, e qual é — escolhido da lista de serviços ativos, nunca escrito à mão.
Por omissão, o serviço de menor preço. Com o prémio ativo, só esse serviço pode
ser resgatado com selos. Com o prémio desativado, o cartão conta selos, não
anuncia nada, e o gestor decide o que dar quando o cartão completa.

O prémio aparece na área de cliente, com o nome exato do serviço. É o cliente que
o pede ao balcão; não há mensagem a anunciá-lo.

### F.3 · Objetivos

- O objetivo mensal é definido por barbearia e por profissional (Pro), no Financeiro.
- Objetivo diário = objetivo mensal ÷ dias de funcionamento do mês, excluindo dias de descanso, feriados nacionais (quando a barbearia fecha nos feriados), feriados próprios e dias de ausência da barbearia inteira.
- Valor em falta = objetivo − faturado acumulado, nunca abaixo de zero.
- Valor necessário por dia restante = valor em falta ÷ dias de funcionamento que faltam.
- Alterar um objetivo reflete-se de imediato na camada Equipa.

#### F.3.1 · Desconto de aniversário (`campanha_aniversario`)

Decisão do dono, na Gestão do sistema: se está ativo e de quanto é. Sem ele, a
campanha é só a lista de aniversariantes do mês (clientes com data de
nascimento).

A mensagem de aniversário é sempre uma felicitação, em nome do barbeiro que a
abre. **Nunca menciona o desconto.** Quem comunica o desconto é o barbeiro, ao
balcão: a plataforma não promete ao cliente o que a barbearia ainda tem de
cumprir. Quando ativo, o desconto aparece na lista como nota interna.

Abrir a mensagem é do Pro (`envio_mensagens`); a lista existe nos dois planos.

#### F.3.2 · Serviços em três línguas (`multilinguagem`)

- Com a funcionalidade desligada, o formulário de serviços mostra um só nome e uma só descrição. O dono nunca vê campos de outras línguas.
- Ligada, aparecem os campos de inglês e francês ao lado do português, sempre opcionais. Cada campo tem o atalho «copiar do português».
- Nunca há tradução automática. O que o dono não escrever mostra-se em português.
- Na página pública, o cliente em inglês vê `nome_en` quando existe, senão o português. O mesmo para o francês.
- Desligar não apaga os textos; voltam quando se ligar.

### F.4 · Módulos

#### F.4.1 · Fila de espera (`fila_espera`)

Serve para não perder o cliente que quer marcar e não encontra horário.

- O cliente escolhe o serviço, vê que não há vagas no dia e entra na fila (`entrar_fila_espera()`): indica o serviço e o dia, nunca a hora.
- Um cliente fica uma vez na fila do mesmo serviço e dia; se tentar outra vez, vê a posição que já tem.
- Quando uma marcação é cancelada, a barbearia vê a vaga e a fila no mesmo ecrã e abre o aviso por wa.me com um clique (Pro): nome, serviço, o horário que abriu e o prazo.
- **Prazo de resposta: 30 minutos**, gravado em `expira_em` no momento do aviso. Passado o prazo, o barbeiro passa ao seguinte com um botão. Não há tarefa agendada: o estado «expirado» calcula-se na leitura.
- Enquanto o cliente não aceita, a vaga continua livre na página pública. Só fica ocupada quando a marcação é criada; se outro a ocupar entretanto, o sistema avisa o barbeiro.
- A fila de um dia expira no fim desse dia.
- No Basic, a lista existe; o aviso por wa.me mostra a chamada de upgrade.

#### F.4.2 · Clube de assinatura (`clube_assinatura`)

Receita previsível para a barbearia e cliente mensal em vez de ocasional.

Configuração do gestor, na Gestão do sistema:

```
NOME DO PLANO ........... texto, por exemplo «Plano Cabelo»
PREÇO MENSAL ............ preço final ao cliente
SERVIÇOS INCLUÍDOS ...... da lista de serviços ativos, cada um com quantidade mensal
VALIDADE DO CRÉDITO ..... dias, por omissão 30
TRANSITAR CRÉDITO ....... se sim, o não usado passa para o ciclo seguinte
RENOVAÇÃO ............... automática no mesmo dia do mês (dia 29 a 31 passa ao último dia do mês) ou manual
```

- O gestor inscreve o cliente na área do clube; o cliente vê o plano na área dele.
- **O pagamento é registado, não cobrado.** Cada ciclo nasce por registar; ao receber (dinheiro, MB WAY, transferência, cartão), o gestor marca «Pago», e só então os créditos do ciclo valem.
- Ao concluir um serviço incluído, «Usar crédito do clube» chama `concluir_marcacao()` no modo `credito_clube`: o valor cobrado fica a zero, o valor de tabela mantém-se, e o crédito desconta. Sem crédito, o serviço é cobrado normalmente.
- O desconto de hora morta não se acumula com o crédito.
- Planos desativados deixam de aceitar subscrições; os existentes mantêm-se até ao fim do ciclo.
- Cliente que cancela mantém o crédito do ciclo já pago e não renova.
- O serviço com crédito fica atribuído ao barbeiro que o fez, com comissão sobre o valor de tabela (F.4.8). O clube não está ligado a um barbeiro (DECISOES D-12).
- O gestor vê: subscritores ativos, mensalidades recebidas no mês e créditos por usar — crédito não usado é receita recebida e serviço não prestado.
- O clube é um instrumento de recorrência, não de margem por serviço.

#### F.4.3 · Entrada por QR code e clientes não registados (`qr_entrada`)

O código fica afixado à porta, no balcão ou junto ao posto de trabalho, e abre
a página da fila presencial. Dois caminhos:

```
ENTRAR SEM REGISTO      vai direto à fila
CRIAR ACESSO            ganha selos e vê o histórico
```

- «Entrar sem registo» pede nome, telemóvel e a caixa de consentimento (desmarcada). Entra na fila do dia (`entrar_fila_presencial()`) e é atendido por quem estiver livre. Fica uma ficha de cliente, sem conta.
- **Estado em tempo real:** a página mostra a posição na fila e uma estimativa de espera («faltam cerca de 8 minutos»), calculada a partir das marcações por terminar e da duração dos serviços.
- O cliente sem conta pode criar acesso mais tarde pelo código (F.9).
- No painel, «Clientes não registados» aparece como filtro da lista de clientes. Só recebem mensagens promocionais com consentimento.

#### F.4.4 · Loja de produtos (`loja_produtos`)

A loja vive num bloco da página pública e numa aba do painel, com dois
separadores, Produtos e Pedidos. **O pagamento é feito ao balcão, no
levantamento. Não há cobrança online.**

**Indicadores no topo:** produtos ativos; pedidos por preparar («novo»); prontos
a levantar; abaixo do stock mínimo.

**Produtos.** Nome, descrição, fotografia (JPG ou WEBP, até 3 MB), custo sem
IVA (obrigatório), taxa de IVA (6, 13 ou 23 %, por omissão 23; nas Regiões
Autónomas, as taxas regionais), preço de venda com IVA, stock, stock mínimo,
ativo e «mostrar quando esgotado». A lista mostra o estado: EM STOCK, REPOR
STOCK (a amarelo, no mínimo ou abaixo), ESGOTADO (a vermelho).

**Margem**, calculada e mostrada enquanto o dono escreve:

```
preço sem IVA = preço de venda ÷ (1 + taxa de IVA)
margem        = preço sem IVA − custo
margem %      = margem ÷ preço sem IVA × 100

Exemplo, IVA 23 %: custo 6,50 € · preço 12,00 € · sem IVA 9,76 € · margem 3,26 € · 33,4 %
```

A margem calcula-se sempre sobre o preço sem IVA: o IVA não é receita da
barbearia. Margem negativa avisa e marca o produto, mas não bloqueia — vender
abaixo do custo é decisão do dono.

**Pedidos.** Quatro estados: Novo → Pronto → Levantado, ou Cancelado.

| Botão | Efeito |
| --- | --- |
| Marcar pronto | Novo → Pronto; o cliente vê o aviso na área dele |
| Avisar | Abre o WhatsApp do cliente com o aviso de pedido pronto |
| Levantado | `levantar_pedido()`: desconta o stock e regrava custo e IVA da linha |
| Cancelar | Encerra sem entrega |

- A encomenda é feita na página pública com nome, telemóvel e consentimento, com ou sem conta (`criar_pedido_loja()`). Só produtos ativos com stock; o total calcula-se na base de dados com os preços em vigor.
- O stock só muda ao levantar. O custo e o IVA gravados na linha não mudam se o produto mudar depois.
- Desligada a funcionalidade, a aba e o bloco público desaparecem.

#### F.4.5 · Marcação rápida e convite

**Repetir o último serviço** (`marcacao_rapida`). Na área de cliente e na
página pública com sessão iniciada: o mesmo serviço e o mesmo barbeiro, no
primeiro horário livre. O cliente só confirma ou escolhe outra hora.

**Trazer um amigo** (com `fidelizacao_selos`). Cada cliente tem um código
pessoal de seis caracteres (letras maiúsculas e números), gerado no primeiro
acesso à área dele. Quem marca pela primeira vez com esse código fica com
`convidado_por` preenchido; quando conclui o primeiro serviço, quem convidou
ganha um selo. Uma só vez por convidado; um cliente só pode ser convidado uma
vez; ninguém se convida a si próprio.

#### F.4.6 · Portfólio do barbeiro (`portfolio_barbeiro`)

Cada barbeiro tem «Os meus trabalhos»: até seis fotografias, com as regras da
galeria. O bloco nasce desligado e aparece na escolha do barbeiro quando ele
liga «Tornar visível» e há pelo menos uma fotografia visível. A primeira é a
que aparece na lista.

#### F.4.7 · Preços por período de ocupação (`precos_dinamicos`)

O dono define descontos para as horas de pouca procura, sem mexer nos preços
dos serviços: dia ou dias da semana, janela de horas e percentagem (por
exemplo, terça e quarta das 14h às 17h, menos 20 %).

- Dois períodos sobrepostos: vale o de maior percentagem; nunca se somam.
- O desconto calcula-se em `calcular_preco()` e fica gravado na marcação (`desconto_percent`, `valor_cobrado`), seja ela pública ou ao balcão.
- A página pública mostra o preço normal riscado e o preço com desconto.
- Não se aplica a serviços com crédito do clube.
- Faturação e comissões usam o valor efetivamente cobrado.

#### F.4.8 · Comissões por serviço (`comissoes_acertos`)

O dono define, na ficha de cada barbeiro, a percentagem que fica para o
barbeiro: uma de omissão (por omissão 50 %) e, se quiser, uma por serviço. O
painel mostra ao lado o valor em euros sobre o preço do serviço.

**Base da comissão — uma só regra (DECISOES D-25):**

```
base = valor de tabela      quando o serviço sai do crédito do clube
base = valor cobrado        em todos os outros casos (com o desconto de hora morta)
comissão = base × percentagem ÷ 100, arredondada ao cêntimo
```

O barbeiro que prestou um serviço do clube não pode receber zero por o cliente
ter plano. A percentagem e o valor ficam gravados na visita por
`concluir_marcacao()`; mudar as percentagens depois não muda o histórico. Um
barbeiro desativado mantém as comissões geradas.

#### F.4.9 · Cartões oferta (`cartoes_oferta`)

Vendidos e pagos ao balcão; a plataforma regista o cartão e o saldo.

- Ao vender: valor, comprador, beneficiário (opcional), método de pagamento e validade (por omissão, um ano). O sistema gera um código de oito caracteres e um cartão em PDF com a marca da barbearia e a frase «Não é documento fiscal».
- Ao usar: no fecho do serviço ou do pedido, «Pagar com cartão oferta» pede o código e o valor a descontar; grava um movimento. O saldo é o valor inicial menos os usos.
- Cartões expirados ou anulados não aceitam usos.
- A venda do cartão não entra na faturação de serviços; o uso também não reduz a faturação (é um meio de pagamento).

#### F.4.10 · Mensagens por WhatsApp

O envio faz-se por ligação direta `wa.me`, sem API e sem custo por mensagem.
É uma decisão de produto. O InstaBarber prepara a mensagem e abre a conversa
com o texto preenchido; o responsável confirma o envio no WhatsApp. A plataforma
não envia nada sozinha, não confirma entrega e não garante leitura. O estado
`ligacao_aberta` significa só que a ligação foi acionada.

- Formato: `https://wa.me/351XXXXXXXXX?text=` seguido do texto codificado. O número é sempre o do cliente.
- Cada mensagem é personalizada com o nome próprio, os dias sem vir, o último serviço e a data, e a ligação para a página pública. O texto gera-se em `lib/regras/mensagens.ts`.
- Cada clique grava uma linha em `mensagens`: registo da tentativa, nunca prova de envio.
- Cliente com «não contactar», anonimizado ou sem consentimento nunca aparece nas listas de mensagens promocionais (recuperação, aniversário, pós-venda, avaliação). Lembretes de marcação, avisos de fila, de pedido e códigos de acesso são mensagens de serviço e não precisam de consentimento promocional.
- Planos: o lembrete individual existe nos dois; recuperação, aniversário, avaliação e tudo o que é em lote são do Pro.

#### F.4.11 · Comissões e acertos

Calcula o que cada barbeiro tem a receber ou a entregar no fim do mês,
conforme o modelo de caixa. Em Portugal há três formas de o dinheiro entrar
numa barbearia, e cada uma muda o sentido do acerto.

| Modelo | Quem recebe do cliente | Quem fatura ao cliente (G.4) | O que se acerta |
| --- | --- | --- | --- |
| A · A barbearia recebe | A barbearia | A barbearia | A barbearia paga a comissão ao barbeiro |
| B · O barbeiro recebe | O barbeiro | O barbeiro | O barbeiro entrega a parte da casa |
| C · Cadeira alugada | O barbeiro | O barbeiro | O barbeiro paga a renda fixa |

**O modelo é de cada profissional** (`profissionais.modelo_caixa`): o mesmo
espaço pode ter contratados e cadeiras alugadas. O formulário de adesão define
o modelo por omissão; a Gestão do sistema ajusta barbeiro a barbeiro, com
«Aplicar a todos». O barbeiro não escolhe o seu modelo. A plataforma pode
desligar modelos (o C, por exemplo) com sub-interruptores no painel de
administração.

**Como o acerto do mês é montado** (`lib/regras/acertos.ts`, a partir das
visitas concluídas no mês, com os valores gravados):

```
Modelo A   a pagar ao barbeiro   = Σ comissão de todas as visitas
           a receber do barbeiro = 0
Modelo B   a pagar ao barbeiro   = Σ comissão das visitas com crédito do clube
           a receber do barbeiro = Σ (valor cobrado − comissão) das restantes visitas
Modelo C   a pagar ao barbeiro   = Σ comissão das visitas com crédito do clube
           a receber do barbeiro = renda do mês

saldo = a pagar − a receber
sentido = 'a_pagar' se saldo > 0 (a barbearia deve), senão 'a_receber' (o barbeiro deve)
```

Os serviços do clube são sempre devidos ao barbeiro que os fez, em qualquer
modelo: a mensalidade do clube foi recebida pela barbearia.

**Onde o gestor controla.** Financeiro → Comissões e acertos: uma linha por
barbeiro com modelo, serviços, receita, acerto, liquidado e saldo.

```
Barbeiro  Modelo                 Serviços  Receita    Acerto    Liquidado  Saldo
Rafael    A · barbearia recebe      118    2.140,00 €  749,00 €  749,00 €    0,00 €  liquidado
Diogo     B · barbeiro recebe        92    1.758,00 €  615,30 €  400,00 €  215,30 €  a receber
Tiago     C · cadeira alugada        64    1.120,00 €  500,00 €    0,00 €  500,00 €  a receber
```

«Registar acerto» pede data, método (dinheiro, MB WAY, transferência), valor e
nota. O mês fecha quando o gestor regista o acerto. Um acerto liquidado não se
reescreve: corrige-se com um acerto de tipo «correção», de sinal contrário. O
barbeiro vê a sua folha de acerto e o histórico, em leitura.

**Faturação e receita — duas palavras, duas contas (DECISOES D-23):**

- **Faturação de serviços** (Início, objetivos, ticket médio, bloco 1 do relatório): Σ valor cobrado das visitas, todos os modelos. Mede a atividade.
- **Receita da barbearia** (bloco 7): receita própria do modelo A + parte da casa recebida no modelo B + rendas do modelo C + mensalidades do clube + receita da loja sem IVA − comissões pagas.

Uma só função calcula cada uma (`lib/regras/financeiro.ts`). Nota fixa no ecrã:
**«Os acertos são controlo interno. Não substituem faturas nem recibos verdes.»**

#### F.4.12 · E-mails automáticos (`confirmacao_email`)

O único envio automático da plataforma, pelo Resend, e só quando o cliente deu
o e-mail.

- **Confirmação de marcação**, no momento em que é confirmada, com serviço, barbeiro, data, hora, morada, ligação para o calendário e a regra de cancelamento.
- **Não há lembrete por e-mail.** O lembrete é por WhatsApp (F.7), que em Portugal chega a quase todos os clientes; a plataforma não tem tarefas agendadas (DECISOES D-16).
- **Exceção, fora da barbearia:** o Admin pode enviar por e-mail, a pedido do operador e nunca agendado, o lembrete de vencimento da mensalidade a um inquilino (Parte O, D-41). Não passa por `mensagens`: fica em `lembretes_vencimento`.
- Cada envio grava uma linha em `mensagens` (canal `email`, estado `enviado` ou `falhou`) e a data na marcação.
- Remetente da plataforma, com o nome da barbearia; resposta para o e-mail da barbearia.

#### F.4.13 · Pedido de avaliação (`pedido_avaliacao`)

Depois de concluído o serviço, a agenda mostra «Pedir avaliação»: abre o
WhatsApp do cliente com um agradecimento e a ligação para avaliar no Google
(configurada na Gestão do sistema). No máximo um pedido por cliente a cada 90
dias. É do Pro, com consentimento.

#### F.4.14 · Ficha técnica (`ficha_tecnica`)

Notas e fotografias do corte na ficha do cliente (máquina, pente, produtos,
preferências), com data e barbeiro. O barbeiro vê e escreve as fichas dos seus
clientes; o gestor, todas. As fotografias ficam no bucket privado `fichas`. Os
dados de saúde nunca se registam (H.1).

### F.5 · Recomendações do relatório

O bloco final do relatório não é texto fixo. Avaliam-se as regras por esta
ordem e mostram-se as primeiras quatro que se verificarem. Cada uma resulta de
um número presente no relatório.

1. Mais de vinte clientes perdidos: sugerir a campanha, com o valor a recuperar (fator 0,4 da F.1).
2. Um dia da semana abaixo de 50 % de ocupação: sugerir um preço por período nesse dia, com a receita adicional estimada.
3. Ticket médio abaixo do do mês anterior: sugerir a combinação de serviços mais procurada.
4. Cartões de selos completos por resgatar: lembrar que um prémio por usar é uma visita garantida.
5. Objetivo acima de 80 % mas não fechado: o valor necessário por dia útil restante.

Máximo de quatro. Mais do que isso deixa de ser um plano.

### F.6 · Segurança aplicacional

- Toda a escrita passa por Server Action, rota de servidor ou função SQL, com validação Zod antes de chegar à base de dados.
- Nenhuma consulta confia em identificadores enviados pelo browser: o RLS e as chaves compostas confirmam inquilino, utilizador, profissional e cliente.
- **Limites nas entradas públicas**, contados na base de dados por `consumir_limite()` e aplicados na rota ou Server Action antes da função SQL: reservar vaga (10 por hora por IP), adesão (3 por hora por IP e por e-mail, com honeypot), pedido de código (3 por hora por número, na base de dados), encomendas e filas (10 por hora por IP).
- A chave de serviço só é usada em `lib/supabase/servico.ts`, para: criar contas (dono, barbeiros, clientes), verificar o código de acesso, contar os limites de pedidos (`consumir_limite()`, tabela `limites_pedidos`) e criar URLs assinados da adesão.
- Palavras-passe só no Supabase Auth, nunca noutro sítio.
- A vista de apoio do administrador exige justificação e fica em auditoria (E.1).
- Cabeçalhos de segurança: CSP sem `unsafe-eval`, `frame-ancestors 'none'`, HSTS.
- Os erros das funções SQL nunca se mostram ao utilizador como texto técnico (B.5).

### F.7 · Motor de agenda

A autoridade é a base de dados: `validar_vaga()`, `vagas_livres()`,
`reservar_vaga()`, `confirmar_reserva()` e a restrição `sem_sobreposicao`. O
ecrã só mostra o que estas funções devolvem. Os testes estão em
`docs/esquema/testes/20_agenda.sql`.

#### Parâmetros da barbearia

| Parâmetro | Omissão | Efeito |
| --- | --- | --- |
| Abertura e fecho | 09:00–19:30 | O serviço tem de começar e acabar dentro do horário |
| Dias de descanso | Domingo e segunda | Sem vagas |
| Almoço | Nenhum | O serviço não pode tocar o intervalo |
| Fechar nos feriados nacionais | Sim | Feriados próprios fecham sempre |
| Granularidade | 30 min | As vagas começam de 30 em 30 minutos a partir da meia-noite local |
| Intervalo entre marcações | 0 min | Tempo de limpeza depois de cada serviço |
| Antecedência mínima | 60 min | Não se marca online para daqui a menos de uma hora |
| Antecedência de cancelamento | 120 min | O cliente cancela até 2 horas antes |
| Janela de marcação | 60 dias | Não se marca online para além disso |
| Aberto | Sim | Fechado, a página pública não aceita marcações |

#### Uma vaga é válida quando, por esta ordem

| Verificação | Código de recusa |
| --- | --- |
| A barbearia está ativa (e aberta, na página pública) | `barbearia_indisponivel`, `barbearia_fechada` |
| O serviço está ativo e é da barbearia | `servico_invalido` |
| O profissional está ativo e é da barbearia | `profissional_invalido` |
| Página pública: respeita a antecedência mínima e a janela | `antecedencia`, `fora_da_janela` |
| O serviço acaba no mesmo dia | `fora_do_horario` |
| Não é feriado nacional (se a barbearia fecha) nem feriado próprio | `feriado` |
| Com horário próprio do barbeiro: cabe inteiro numa das faixas desse dia. Sem horário próprio: não é dia de descanso, cabe no horário e não toca o almoço | `fora_do_horario`, `dia_de_descanso`, `intervalo_almoco` |
| Não coincide com ausência do barbeiro nem da barbearia | `ausencia` |
| Não se sobrepõe a uma marcação agendada, concluída ou reservada em vigor, contando o intervalo entre marcações | `ocupado` |

Ao balcão (marcação da equipa), não se aplicam a antecedência, a janela nem o
interruptor «aberto».

#### A marcação pública, passo a passo

1. `vagas_livres()` devolve as vagas do dia para um barbeiro ou para todos, com o preço.
2. `reservar_vaga()` prende a vaga **10 minutos** (estado `reservada`, `reservada_ate`) e devolve um token. Em «Sem preferência», escolhe quem tem menos marcações nesse dia; em empate, a ordem da equipa.
3. `confirmar_reserva()` com o token: encontra ou cria o cliente pelo telemóvel (sem nunca reescrever dados existentes), verifica a política de faltas e o limite de três marcações futuras, aplica o código de convite, e passa a `agendada`.
4. Uma reserva não confirmada expira. Não há tarefa agendada: deixa de contar como ocupada e é cancelada na marcação seguinte desse barbeiro.

#### Concorrência

Duas pessoas na mesma vaga ao mesmo segundo: a restrição `sem_sobreposicao`
deixa passar uma e recusa a outra com `ocupado`. A interface mostra «Esta hora
acabou de ser ocupada» e volta às vagas.

#### Mudança de hora

As datas guardam-se em UTC e a grelha calcula-se em hora local de Lisboa, a
partir da meia-noite local. Nos dias de mudança de hora (último domingo de março
e de outubro), as vagas continuam às 09:00, 09:30… locais e o número de vagas é
o de um dia normal. Testado em 25/10/2026 e 28/03/2027.

#### Cancelamentos, faltas e órfãs

- Cancelada ou falta: o horário fica livre de imediato.
- O cliente com conta cancela na área dele até à antecedência de cancelamento; depois disso, só a barbearia. O cliente sem conta liga ou escreve à barbearia.
- Um barbeiro desativado deixa as suas marcações futuras sem profissional; o gestor reatribui-as na Gestão do sistema.

#### Lembrete

O lembrete é por WhatsApp: individual, da agenda, nos dois planos; em lote, no
Pro («Lembretes em lote» percorre as marcações do dia uma a uma). Não há
lembrete por e-mail (F.4.12). A mensagem diz o nome do cliente, o serviço, a data, a hora, o barbeiro e, se a marcação for nesse dia, quantos minutos faltam, calculados em Europe/Lisbon no momento de preparar (D-54).

### F.8 · Política de faltas (`politica_faltas`)

- A equipa marca «Faltou» depois da hora marcada (`marcar_falta()`); antes, não é possível.
- Com a funcionalidade ligada e um limite definido (por omissão 2; 0 desliga), o cliente que acumule esse número de faltas nos últimos 180 dias deixa de poder confirmar marcações online. Ao balcão continua a poder marcar.
- O gestor vê o bloqueio na ficha e pode «Voltar a permitir marcação online»: as faltas anteriores deixam de contar.
- A mensagem ao cliente é neutra: «Para marcar, fale com a barbearia.»
- A taxa de faltas entra no bloco 8 do relatório.
- Sinal ou pagamento antecipado não existe na versão 1 (G.4).

### F.9 · Acesso do cliente

Marcar não exige conta. A conta dá acesso à área de cliente: selos, histórico,
próxima marcação, clube e encomendas (DECISOES D-06 e D-28).

#### Número novo: palavra-passe na primeira marcação

No passo dos dados (E.4), o cliente pode escolher logo uma palavra-passe. A
conta cria-se sem código **só se o número for novo nessa barbearia**: ficha
criada nesta marcação, sem histórico, sem selos, sem plano e sem encomendas
(`pode_criar_acesso_direto()`, chamada pelo servidor com a chave de serviço).
Não há histórico para proteger, por isso não há risco.

#### Número que já tem ficha, ou palavra-passe esquecida: código

Se o número já tem ficha (atendido ao balcão, por QR, importado) ou o cliente
se esqueceu da palavra-passe, a conta cria-se ou recupera-se por um código que
a barbearia envia por WhatsApp:

1. O cliente escreve o telemóvel e pede o código (`pedir_codigo_acesso()`). A resposta é igual exista ou não o número.
2. Se o número é de um cliente da barbearia, o código de 6 dígitos aparece no painel da barbearia em «Pedidos de acesso», válido 15 minutos.
3. Alguém da equipa carrega em «Enviar código por WhatsApp»; abre-se o wa.me para o número do cliente com o código escrito.
4. O cliente escreve o código e escolhe a palavra-passe. A rota `api/acesso` chama `verificar_codigo_acesso()` com a chave de serviço e cria (ou atualiza) a conta do cliente nessa barbearia.
5. Limites: 5 tentativas por código, 3 pedidos por hora por número, código de uso único.

**Número registado por outra pessoa.** Se alguém criar a conta com o número de
um terceiro, o verdadeiro dono pede «Esqueci-me da palavra-passe», recebe o
código no seu telemóvel e define uma palavra-passe nova: a conta passa a ser
dele. Só quem tem o telemóvel recebe o código.

Cada barbearia tem a sua conta de cliente: quem trabalha numa barbearia não
consegue usar um código para entrar na conta do mesmo cliente noutra. Quem lê o
código no painel já tem acesso à ficha do cliente nessa barbearia; o código não
lhe dá mais do que isso.


---

## Parte G · Integrações

| Serviço | Função | Configuração |
| --- | --- | --- |
| Supabase | Base de dados, autenticação, ficheiros | Região eu-central-1. Chaves em variáveis de ambiente, nunca no repositório |
| Resend | E-mails transacionais | Convites da equipa, boas-vindas, notificação de adesão à Performa LAB, confirmação de marcação ao cliente. Região de envio na UE. Também configurado como SMTP do Supabase Auth |
| WhatsApp por ligação | Comunicação com clientes | `wa.me`, sem API e sem custo. O clique abre o WhatsApp com o texto pronto |
| Google | Mapa e avaliações | Só ligações (Google Maps e página de avaliação). Sem API, sem chave |
| Livro de Reclamações | Obrigação legal | Ligação para o livro eletrónico, configurada por barbearia |
| Pagamentos | Nenhum ativo | Módulo preparado e desligado (G.4) |
| Faturação | Nenhuma ativa | Módulo preparado e desligado (G.4) |

### G.1 · Cobrança da plataforma (registo manual)

A Performa LAB emite as suas faturas fora da plataforma, no seu programa de
faturação certificado, e regista na plataforma o número, o valor e o
recebimento (dinheiro, MB WAY ou transferência). Tabelas: `faturas_plataforma`
e `recebimentos`; o estado vive em `inquilinos.estado_pagamento` e
`proximo_vencimento`, alterados só pelo super_admin.

### G.2 · E-mail (Resend)

| E-mail | Quando | Para quem |
| --- | --- | --- |
| Nova adesão | Pedido submetido | Performa LAB (geral@) |
| Boas-vindas e definir palavra-passe | Pedido aprovado | Dono da barbearia |
| Resposta de rejeição | Pedido rejeitado | Dono da barbearia |
| Convite de barbeiro | Barbeiro registado na Gestão do sistema | Barbeiro |
| Recuperar palavra-passe | Pedido da equipa | Dono ou barbeiro |
| Confirmação de marcação | Marcação confirmada, com e-mail e `confirmacao_email` | Cliente |

Os modelos vivem em `lib/email/`, em português de Portugal. Nenhum leva
palavra-passe. Não há lembrete por e-mail: o lembrete é por WhatsApp (F.7) e a
plataforma não tem tarefas agendadas (DECISOES D-16).

### G.3 · WhatsApp

Regras na F.4.10. A ligação monta-se em `lib/regras/mensagens.ts`, com o
número do cliente em E.164 sem o «+».

### G.4 · Pagamentos e faturação: preparados e desligados

Os dois módulos são construídos e testados na versão 1, mas ficam desligados ao
nível da plataforma e são invisíveis para as barbearias. Nada nas outras
funções depende deles (DECISOES D-01, D-02).

#### Como fica separado do resto

| Camada | Garantia |
| --- | --- |
| Código | Dois módulos isolados, `lib/pagamentos` e `lib/faturacao`. O núcleo chama só uma interface (`registarRecebimento`, `prepararDocumento`). Desligado, a interface usa o adaptador «manual», que faz exatamente o que a versão 1 faz: regista |
| Interruptor | No painel de administração, sem mexer no código: um interruptor geral por módulo (`modulos_plataforma`) e uma ligação por barbearia (`inquilino_modulos`). Desligados por omissão. Toda a alteração fica em auditoria |
| Grelha D.3 | Os módulos **não** entram na grelha: a barbearia vê a grelha em leitura, e o que lá estiver aparece-lhe |
| Base de dados | `pagamentos`, `documentos_fiscais` e `ligacoes_externas` com RLS só para o super_admin. Nenhuma tabela existente depende delas |
| Rotas | `api/webhooks/pagamentos` responde 404 enquanto o módulo estiver desligado |
| Chaves | Nenhuma chave real na versão 1. Os testes usam o adaptador «simulado». O interruptor geral não liga se faltarem as chaves do fornecedor; o painel diz quais faltam |
| Testes | Um teste ponta a ponta prova que, com tudo desligado, adesão, agenda, clube, loja e acertos se comportam como sem o módulo; outro prova que nenhum ecrã da barbearia mostra pagamentos ou faturas |

O código desligado não é código morto (CLAUDE.md, regra 13).

#### Pagamentos (MB WAY)

- Operações: pedido de pagamento, consulta de estado, webhook com verificação de assinatura e idempotência (`pagamentos.id_externo` único), reembolso.
- Finalidades previstas: sinal da marcação, ciclo do clube, mensalidade InstaBarber.
- **O dinheiro tem de chegar a quem fatura**: no modelo A, à conta da barbearia; nos modelos B e C, só se o barbeiro tiver conta própria no fornecedor (`ligacoes_externas` por profissional). A alternativa — a barbearia receber e acertar no fim do mês — mistura dinheiro de quem não fatura e precisa de parecer de um contabilista antes de ser ativada.
- O fornecedor fica atrás de um adaptador (ifthenpay, Eupago ou Stripe). Por escolher (DECISOES D-05). As APIs chamam-se com `fetch`, sem SDK.

#### Faturação

**Quem emite** decide-se por profissional, pelo modelo de caixa, e fica
gravado em cada visita (`visitas.emitente`):

| Modelo | Fatura ao cliente | Documento entre barbeiro e barbearia, que o acerto prepara |
| --- | --- | --- |
| A | A barbearia | O barbeiro independente fatura à barbearia a sua comissão |
| B | O barbeiro | A barbearia fatura ao barbeiro a parte da casa |
| C | O barbeiro | A barbearia fatura ao barbeiro a renda da cadeira |

**Três modos de emissão**, escolhidos na ativação para cada emitente
(`profissionais.modo_emissao`, e o equivalente da barbearia):

1. **Programa certificado ligado** (Moloni ou InvoiceXpress): o emitente liga a sua conta e o documento sai ao concluir o serviço. Os trabalhadores independentes podem usar programa certificado em vez do Portal das Finanças.
2. **Portal das Finanças, à mão**: não se conhece forma oficial de emitir faturas-recibo do Portal por API (a confirmar com o contabilista). O sistema prepara os dados (NIF do cliente, serviço, valor, isenção de IVA quando aplicável), o barbeiro emite no Portal e regista o número; o sistema mostra o que falta emitir (`documentos_fiscais` em «por emitir»).
3. **Nenhum**: tudo como na versão 1.

Dados guardados desde já, invisíveis enquanto o módulo estiver desligado:
regime de IVA e modo de emissão do profissional, emitente de cada visita, NIF
opcional do cliente.

**Certificar o próprio InstaBarber** como programa de faturação (assinatura
encadeada, SAF-T, ATCUD, QR code, comunicação à AT) fica para depois dos 50
clientes (DECISOES D-04).

**Antes de ativar para qualquer barbearia:** parecer de um contabilista
certificado sobre o desenho, porque quem fatura depende do contrato real entre
a barbearia e cada barbeiro.

#### Ativação, quando chegar a altura

1. Contrato com o fornecedor de pagamentos e, por emitente, conta no programa de faturação.
2. As chaves do fornecedor coladas uma vez no painel da Vercel (L.2). É configuração, não código.
3. No painel de administração: ligar o interruptor geral; depois, barbearia a barbearia.
4. Na faturação, a barbearia (ou o barbeiro) liga a sua conta no ecrã que lhe aparece só depois da ativação.


---

## Parte H · Conformidade legal e proteção de dados

O sistema trata dados pessoais de terceiros em nome das barbearias. A Performa
LAB é **subcontratante**; a barbearia é **responsável pelo tratamento**. Esta
distinção tem consequências práticas desde o primeiro dia.

### H.1 · Proteção de dados

- Servidores na União Europeia (Supabase em Frankfurt; funções Vercel em fra1; Resend na região da UE).
- Acordo de subcontratação (art. 28.º do RGPD) com cada barbearia, aceite na adesão, com a lista de subcontratantes ulteriores: Supabase, Vercel, Resend, Zoho.
- Política de Privacidade e Termos ligados a partir da página de cada barbearia e do formulário de adesão.
- **Consentimento** explícito, registado com data e hora (`consentimento_em`), para mensagens promocionais. A caixa nasce desmarcada em todos os formulários (marcação, QR, loja, fila). Clientes importados ficam sem consentimento até o darem.
- **Minimização:** data de nascimento, e-mail e NIF do cliente são opcionais, com a finalidade escrita ao lado do campo.
- **Direito de eliminação:** `anonimizar_cliente()` apaga os dados pessoais (nome, telefone, e-mail, NIF, data de nascimento, notas, fichas técnicas, conteúdo das mensagens, conta) e mantém os registos financeiros anonimizados pelo prazo legal.
- **Dados de saúde:** a plataforma não tem campos para eles. Os campos de notas e a ficha técnica mostram o aviso «Não registe dados de saúde», e a política de utilização proíbe-o. Não há deteção automática: a responsabilidade é de quem escreve.
- Cópias nativas do Supabase Pro (7 dias) e cópia externa com 30 dias de retenção. Restauro testado antes do primeiro cliente (L.7).
- Autenticação de dois fatores obrigatória para o super_admin, exigida pela própria base de dados (sessão `aal2`).
- Auditoria das ações sensíveis: funcionalidades, módulos, campos protegidos do inquilino, anonimizações, vista de apoio.
- **Fim do contrato:** a Performa LAB entrega à barbearia os dados exportados e, passado o prazo do Acordo de Subcontratação (por omissão, 30 dias depois da entrega), elimina-os (art. 28.º, n.º 3, g; manual do operador, P-18). As cópias de segurança apagam-se ao fim de 30 dias.
- **Leads comerciais (Parte N):** a Performa LAB é responsável pelos dados das pessoas de contacto que pedem informação (nome, telefone, e-mail, barbearia), com base em diligências pré-contratuais. Um lead sem contrato apaga-se 12 meses depois do último contacto (manual do operador, P-24); contratos e propostas ligadas a contratos guardam-se pelos prazos legais. A Política de Privacidade do site diz o que se guarda e por quanto tempo quando o módulo entrar (Fase 3B).
- Violação de dados: procedimento na M.6.

### H.2 · Obrigações perante o consumidor

- **Livro de Reclamações:** a página pública de cada barbearia liga para o Livro de Reclamações eletrónico, configurado na Gestão do sistema.
- **Preços com IVA:** todos os preços mostrados ao cliente final (serviços, clube, loja, cartões oferta) são preços finais. Os preços sem IVA aparecem só nos painéis.
- **Cancelamento:** a regra de cancelamento da barbearia (antecedência) aparece na confirmação da marcação.

### H.3 · Regras fiscais na versão 1

- A plataforma **não emite documentos fiscais nem processa pagamentos** (DECISOES D-01).
- Nenhum documento gerado se chama «recibo» ou «fatura». Os PDF (resumo da contratação, relatório, cartão oferta) dizem «Não é documento fiscal».
- Os acertos entre barbearia e barbeiros são controlo interno e não substituem faturas nem recibos verdes.
- Os módulos preparados para a faturação seguem a G.4 e precisam de parecer de um contabilista antes de serem ativados.

### H.4 · Documentos legais

Três documentos redigidos, a publicar e a ligar ao formulário de adesão:

- **Termos de Uso**: obrigações de cada parte, preços (com e sem IVA, mensal e anual), cancelamento e foro.
- **Política de Privacidade**: as duas situações (a barbearia como titular; o cliente final, cujo responsável é a barbearia), bases jurídicas, prazos de conservação, direitos e o contacto privacidade@instabarber.pt.
- **Acordo de Subcontratação**, nos termos do art. 28.º do RGPD.

Seguem o RGPD e a Lei n.º 58/2019, mas **devem ser revistos por um jurista
antes da publicação**. É um custo único e recomenda-se vivamente.


---

## Parte I · Identidade visual

Esta Parte lê-se a partir da Fase 3: a qualidade da interface faz parte do
requisito desde o primeiro ecrã.

### I.1 · Paleta

| Elemento | Hexadecimal | Uso |
| --- | --- | --- |
| Preto principal | `#12100E` | Cabeçalhos, rodapés, faixas de destaque, botão primário |
| Dourado | `#F5A623` | Marcadores, realces, foco dos campos |
| Dourado escuro | `#C9821A` | Títulos de secção, ligações |
| Amarelo claro | `#FDF3E3` | Fundos de aviso e cartões em destaque |
| Fundo de página | `#F7F5F1` | Fundo geral da aplicação |
| Linha | `#E6E1D8` | Contornos e separadores |
| Verde | `#1F8A5F` | Valores positivos e confirmações |
| Vermelho | `#C0392B` | Alertas e valores negativos |
| Cinza de texto | `#8A847C` | Texto secundário |

A cor da capa de cada barbearia é escolhida pelo dono (E.6) e só se aplica à
página pública e ao cabeçalho dos PDF. O texto sobre ela é branco ou preto
conforme o contraste, sempre com o mínimo de 4,5 para 1.

### I.2 · Tipografia e componentes

- Família Inter, servida localmente com `next/font`, pesos 400 a 900. Sem Google Fonts.
- Corpo a 14 px; títulos de página a 20–22 px com peso 800; títulos de secção a 15 px; etiquetas a 10–11 px em maiúsculas, com espaçamento de letras.
- Cartões com raio de 16–18 px, contorno de 1 px e fundo branco.
- Botões primários a preto com texto branco; secundários com contorno e fundo branco; ação positiva a verde claro.
- Nas páginas do cliente final, os botões de ação têm título em negrito e uma linha secundária em cinzento claro.
- Nos formulários, etiqueta em maiúsculas pequenas por cima do campo; o foco aplica contorno dourado.
- Funcionalidades fora do plano marcadas «Upgrade» (D.3): botão desativado com o cadeado discreto e a chamada da D.2 num painel de amarelo claro.

### I.3 · Regras de interface por camada

- **Camada 1:** densidade alta, tabelas, filtros e separadores. Ferramenta de trabalho, otimizada para ler dados.
- **Camadas 2 e 3:** equilíbrio entre indicadores e listas, com faixas de ação no topo de cada página.
- **Camada 4:** interface de telemóvel, largura máxima de 460 px, botões grandes, uma ação por ecrã, botão de voltar sempre presente.

#### I.3.1 · Paridade mobile nas quatro camadas

Os quatro painéis — administração, barbearia, profissional e cliente — são
operacionais num telemóvel, com as mesmas funções. Não existe ação possível no
computador e impossível no telemóvel.

Abaixo de 768 px:

- Os separadores laterais passam a navegação inferior, com ícone e rótulo curto, no máximo cinco entradas visíveis; o resto num menu «Mais».
- As tabelas passam a cartões empilhados, um registo por bloco, com pares rótulo-valor. Nenhuma tabela mantém colunas.
- Formulários com um campo por linha, rótulos acima e botões em largura total.
- Qualquer ação destrutiva — apagar, cancelar, suspender, anonimizar — pede confirmação explícita, nunca fica a um toque.
- Valores e datas com o mesmo formato do computador. Nenhum número é abreviado.
- A ficha do inquilino no painel de administração, com dez separadores, passa a um fluxo de passos com indicador de posição.
- Alvos de toque com 44 px no mínimo. Nenhum botão encosta à margem do ecrã.

#### I.3.2 · Idiomas da página pública e da área de cliente

A aplicação é escrita em português de Portugal. Com a funcionalidade
`multilinguagem`, ligada pela Performa LAB, a página pública e a área de
cliente têm também inglês e francês. Mais nenhuma parte tem tradução: painéis,
administração, formulário de adesão, e-mails e relatórios são sempre em
português de Portugal.

**Língua de abertura**, com a funcionalidade ligada: a do dispositivo de quem
visita, olhando só aos dois primeiros caracteres do código. `pt` abre em
português; `fr` em francês; qualquer outro em inglês. Sem variantes: pt-BR abre
em português de Portugal, fr-CA em francês.

**Seletor manual** PT · EN · FR no rodapé da página e na área de cliente. Troca
a língua sem recarregar e sem deixar texto na língua anterior. Com a
funcionalidade desligada, não aparece.

**Textos da interface** (botões, menus, avisos, erros): nas três línguas,
escritos à mão, em `lib/i18n/pt.ts`, `en.ts` e `fr.ts`. Nada é traduzido
automaticamente: um tradutor automático devolveria «Skin cleaning» onde o
correto é «Facial treatment».

**Texto do dono** (nome e descrição dos serviços): o dono pode escrever as
versões em inglês e francês, sempre opcionais (F.3.2). O que não escrever
aparece em português. A história da barbearia aparece sempre como o dono a
escreveu.


---

## Parte J · Plano de execução

Nove fases, de 0 a 8. Cada fase termina com um resultado verificável, e não se
avança sem ele confirmado pelo dono. Cada fase entrega os seus ecrãs já
adaptados ao telemóvel: a responsividade não é uma fase nem trabalho do fim.

| Fase | Foco | Resultado verificável | Dias |
| --- | --- | --- | --- |
| 0 | Preparação | Repositório com o `package.json` da B.3, `npm audit` limpo, `.env*` no `.gitignore`, deploy em branco na Vercel | 2 |
| 1 | Base de dados | Esquema de `docs/esquema` aplicado no Supabase local e no projeto de ensaio; os 389 testes SQL a passar; tipos gerados | 2 |
| 2 | Autenticação e papéis | Cinco papéis a entrar, cada um no seu painel; convite do barbeiro; código de acesso do cliente; 2FA do super_admin; uma conta em duas barbearias | 4 |
| 3 | Administração e adesão | Uma barbearia criada de ponta a ponta pela interface: formulário, pedido, aprovação, pacote, convite do dono, importação CSV | 6 |
| 4 | Painel da barbearia | O dia a dia gerido no sistema: agenda ao balcão, clientes, radar, ficha técnica, ausências, equipa, financeiro, comissões e acertos, Gestão do sistema, O meu plano | 10 |
| 5 | Motor de agenda e cliente | Um cliente entra pela página pública e marca sem conta; duas reservas simultâneas não ocupam o mesmo horário; política de faltas; área de cliente | 7 |
| 6 | Mensagens, módulos e relatório | Mensagens abertas e registadas; e-mails de confirmação; filas; clube, loja e cartões oferta; relatório mensal; módulos de pagamentos e faturação desligados e invisíveis | 11 |
| 7 | Publicação | Produção com domínio, HTTPS, subdomínios, cópias de segurança e documentos legais publicados | 3 |
| 8 | Operação | Barbearia real em uso, rotina de operação, restauro testado | 2 |
| | **Total** | | **47** |

**Extensões:** a Fase 3B (Comercial, Parte N) e a Fase 3C (Finanças da Performa LAB, Parte O) entram depois da Fase 3: 6 e 5 dias, fora do total acima. A Fase 9 (manuais operacionais, 7 dias) vem depois da Fase 8. A 3C entrega: custos e contas a pagar, lucro, ponto de equilíbrio, objetivo com «quantas barbearias faltam», previsões e lembretes de vencimento. Resultado: um lead percorre o funil, recebe proposta em PDF, o contrato sai da proposta aceite e o convite de adesão chega ao dono preenchido.

Cada ficheiro de `fases/` diz que secções ler e o que entregar. Os critérios
abaixo são copiados para `fases/criterios-de-aceitacao.md` pelo
`scripts/gerar-mestre.sh`.

### J.1 · Critérios de aceitação

O sistema está concluído quando todos os pontos abaixo estiverem verificados,
cada um testado com o utilizador do papel certo.

**Segurança e isolamento**
- Os 389 testes de `docs/esquema/testes` passam no Supabase local e num projeto de ensaio com as mesmas migrações da produção (nunca na produção: criam dados de teste).
- Uma barbearia nunca lê dados de outra, mesmo com o identificador correto.
- Um profissional vê só as marcações, os clientes e os valores dele; não altera a própria comissão.
- O dono não liga funcionalidades nem muda o plano, nem por pedido direto à base de dados.
- O cliente final vê apenas o que é seu e não escreve em nenhuma tabela.
- O super_admin sem segundo fator não vê nada.
- O InstaBarber Admin só abre em `instabarber.pt/admin`; nos endereços das barbearias, `/admin` responde «página não encontrada».
- A chave de serviço não aparece em nenhum ficheiro que chegue ao browser.
- `.env.local` está no `.gitignore` e nenhuma chave está no repositório.

**Comercial (Fase 3B)**
- O módulo Comercial só abre ao super_admin com segundo fator, em `instabarber.pt/admin`.
- O formulário do site cria um lead; um contacto repetido não cria outro e o abuso é limitado.
- A proposta usa a fórmula da D.7, com e sem IVA, e depois de enviada não se altera.
- O contrato só se gera de uma proposta aceite e de um modelo aprovado; assinado, não se altera; o lead passa a ganho só por assinatura.
- O convite de adesão pré-preenche o formulário sem palavra-passe e liga o contrato ao inquilino na aprovação.
- Os PDFs dizem «Não é documento fiscal».

**Finanças da Performa LAB (Fase 3C)**
- O módulo Finanças só abre ao super_admin com segundo fator, em `instabarber.pt/admin`.
- Todos os indicadores, o lucro, o ponto de equilíbrio e as metas calculam-se sem IVA, e batem com um exemplo feito à mão.
- O objetivo mostra quantas barbearias Basic, quantas Pro e quantas da mistura atual faltam.
- As previsões mostram os pressupostos e dizem que não são promessa.
- O lembrete de vencimento por WhatsApp só fica confirmado depois de o operador confirmar; o de e-mail fica enviado ou falhou; nada é automático nem agendado.
- Os ficheiros exportados dizem «Não é documento fiscal».

**Administração e adesão**
- O administrador cria uma barbearia nova em menos de cinco minutos, com logótipo, serviços e equipa.
- O formulário calcula a mensalidade em tempo real, com e sem IVA, mensal e anual, e a conta bate com a D.5.
- O formulário mostra o que está contratado e recalcula quando muda o plano, a periodicidade ou os profissionais.
- O formulário nunca recolhe palavra-passe; o resumo da contratação em PDF nunca a imprime e diz «Não é documento fiscal».
- O pedido aparece em Pedidos sem intervenção manual; a notificação indica barbearia, plano, profissionais, mensalidade e preferência de pagamento.
- Aprovar cria o inquilino ativo com a marca e o pacote aplicados, num só clique; o dono define a palavra-passe pela ligação recebida.
- A importação CSV grava os clientes válidos, mostra os inválidos e não dá consentimento a ninguém.

**Painel da barbearia e do profissional**
- A barbearia vê a sua marca e a sua cor sem intervenção técnica.
- Uma funcionalidade inativa não aparece (menu, botão, rota), exceto as marcadas «Upgrade», que aparecem desativadas com a chamada.
- No Basic, o lembrete individual e os selos funcionam; as mensagens de recuperação e em lote mostram a chamada de upgrade e não abrem por endereço direto.
- No Basic, não é possível ter mais de um profissional ativo.
- O barbeiro registado recebe o convite por e-mail e define a sua palavra-passe; o NIF nunca é palavra-passe.
- A classificação no painel do barbeiro usa só o histórico com ele; no painel do gestor, o histórico com a barbearia.
- Os objetivos definidos no Financeiro aparecem na área do profissional.
- Comissões: a percentagem por serviço substitui a de omissão; hora morta → comissão sobre o preço com desconto; crédito do clube → comissão sobre o valor de tabela; alterar percentagens não muda o passado.
- Os acertos seguem os três modelos e um acerto liquidado não se reescreve.
- Loja: margem sobre o preço sem IVA; margem negativa avisa e não bloqueia; o stock só desconta ao levantar; alterar o custo não muda vendas registadas.
- Ausências e férias tiram as vagas do barbeiro na página pública.

**Agenda e cliente final**
- Um cliente marca pela página pública sem criar conta; a vaga fica reservada 10 minutos com contagem visível.
- Um número novo escolhe a palavra-passe na primeira marcação e entra logo na área de cliente; um número que já tem ficha só cria acesso pelo código.
- Duas reservas simultâneas na mesma vaga: uma é recusada.
- Uma marcação cancelada ou falta liberta o horário.
- Nos dias de mudança de hora, as vagas aparecem às horas locais certas.
- O cliente cria ou recupera o acesso pelo código enviado pela barbearia; sem o código, ninguém define a palavra-passe de outro.
- Com a política de faltas, o cliente acima do limite não confirma marcações online até o gestor o permitir.
- Uma marcação criada pelo cliente aparece de imediato na agenda da barbearia e do profissional.

**Mensagens e relatório**
- O envio em lote abre o WhatsApp do cliente certo, com a mensagem personalizada e o registo gravado; o mesmo mecanismo na recuperação, nos lembretes e nas filas.
- Clientes sem consentimento ou com «não contactar» nunca entram em mensagens promocionais.
- A confirmação por e-mail chega ao cliente que deu e-mail.
- O relatório mostra os nove blocos e percorre os últimos doze meses; os valores coincidem com os do Início e do Financeiro.
- O PDF do relatório sai com a cor e o logótipo da barbearia, e o do profissional com o nome dele.

**Módulos desligados**
- Com os módulos desligados, nenhum ecrã da barbearia mostra pagamentos ou faturas, e a rota do webhook responde 404.
- Ligar e desligar um módulo faz-se no painel de administração e fica em auditoria.

**Operação**
- O administrador exporta os dados de uma barbearia em CSV e elimina uma barbearia cancelada, com as contas que ficam sem uso.
- Ligar o domínio próprio acrescenta 5,00 € à mensalidade, pela fórmula da D.7.
- O manual do operador foi revisto com o sistema real: cada procedimento feito uma vez, com capturas de ecrã.

**Interface**
- As quatro camadas foram testadas num telemóvel real, iOS e Android, com criar, consultar, alterar e apagar.
- Nenhuma ação existe no computador e falta no telemóvel; abaixo de 768 px, as tabelas são cartões.
- O painel de administração funciona no telemóvel, com os dez separadores por passos.
- A página pública abre no endereço da barbearia, com a capa a servir de cabeçalho, as três ações fixas no fundo e contraste mínimo de 4,5 para 1.
- A página pública é indexável com dados estruturados; a área de cliente e os painéis não.
- Um bloco sem conteúdo não ocupa espaço.
- Com `multilinguagem` desligada, só português e sem seletor; ligada, a língua do dispositivo, o seletor PT · EN · FR sem recarregar, e os nomes dos serviços em inglês ou francês quando o dono os escreveu.
- Os painéis não têm vestígios de inglês ou francês; nenhum texto está em português do Brasil.
- Preços finais ao cliente iguais em qualquer regime de IVA da Prestadora: com a isenção, a taxa é 0 % e a fatura diz «IVA – Regime de Isenção».

**Processo**
- O `PROGRESSO.md` reflete o estado real de cada fase.
- Antes de cada entrega: `typecheck`, `lint`, `test`, `test:sql` e `build` sem erros; sem código morto (com a exceção da regra 13); uma funcionalidade, um só gerador.
- Uma restauração de cópia de segurança foi testada antes do primeiro cliente real.

### J.2 · Alteração do plano

- **Basic para Pro:** a Performa LAB muda o plano e o número de profissionais contratados no painel e chama «Repor pacote». Ficam disponíveis os três profissionais incluídos, as metas, as mensagens de recuperação, aniversário e avaliação, o envio em lote e os módulos de receita.
- **Pro para Basic:** no painel de administração, a Performa LAB escolhe com o dono o profissional que fica como titular; os restantes são desativados antes da mudança (a base de dados não aceita mais profissionais ativos do que os contratados). Perdem o acesso ao painel; os dados, o histórico e o nome nos registos ficam. As marcações futuras deles passam para a lista de marcações sem profissional.
- **Mensal para anual, ou o contrário:** muda a periodicidade e a próxima fatura; não mexe nas funcionalidades.
- Toda a alteração fica em auditoria com data e autor. Não há cobrança automática: a Performa LAB emite a fatura pelos seus meios.

### J.3 · O ficheiro PROGRESSO.md

Mantido na raiz e atualizado no fim de cada fase: estado (Pendente, Em curso,
Concluída), data, resultado verificado e testes. Uma fase só passa a Concluída
quando o resultado foi observado e o dono confirmou — não quando o código foi
escrito.

### J.4 · O que o assistente reporta em cada fase

- **No início:** o que vai construir, os ficheiros que vai criar e o que não vai fazer nesta fase. Espera a confirmação.
- **Durante:** um aviso curto sempre que uma decisão não estiver prevista. Decisões de produto nunca se tomam sozinhas.
- **No fim:** o resultado verificável, o resultado dos testes e o que ficou por fazer.
- **Em caso de falha:** o erro, a causa, a correção, e se a fase fica concluída ou volta a Em curso.
- **Sempre:** atualizar o `PROGRESSO.md` antes de começar a fase seguinte.

### Nota sobre a marca — ler antes de publicar

O nome InstaBarber refere-se ao instante: marca-se num instante, encontra-se o
cliente perdido num instante, fecha-se a conta num instante. Não tem relação
com o Instagram nem com a Meta.

Existe uma marca INSTA registada na União Europeia, detida pela Meta. O registo
português da marca InstaBarber não foi pedido, deliberadamente, e não deve ser
pedido durante a versão 1: é no pedido de registo que uma oposição aparece.
Antes de investir em publicidade paga, pedir parecer a um advogado de marcas.

Três regras para todo o material, digital e impresso:

- Não imitar nada do Instagram: nem o gradiente, nem a câmara, nem a tipografia, nem o tom.
- Não usar a palavra em contextos que sugiram rede social ou partilha de fotografias. O produto é um sistema de gestão para barbearias.
- Escrever sempre «InstaBarber», com as duas maiúsculas, e nunca «Insta».

O código não depende do nome: o domínio vive nas variáveis de ambiente e os
rótulos em `lib/vertical`.


---

## Parte K · Comando de arranque

O texto abaixo copia-se para o Claude Code no início do trabalho, com o
repositório da especificação aberto. Não se cola o documento mestre: o Claude
Code lê o `CLAUDE.md` e os ficheiros de cada fase.

```
Constrói a plataforma InstaBarber conforme a especificação deste repositório,
versão 10.1.

1. Lê o CLAUDE.md. As regras dele não se negociam.
2. Lê o fases/README.md e o fases/fase-0.md. Não leias o documento mestre.
3. Em cada fase, lê só as secções que o ficheiro da fase indica.
4. Antes de escrever código, apresenta o resumo da fase — o que vais construir,
   os ficheiros que vais criar e o que não vais fazer — e espera pela minha
   confirmação.
5. O esquema da base de dados é o de docs/esquema/. Copia-o para
   supabase/migrations/ sem o reescrever; se precisares de o alterar, propõe a
   alteração e o teste primeiro.
6. Se faltar uma chave em .env.local, para e pede-a. Nunca inventes valores.
7. Decisão de produto não especificada: pergunta. Decisão técnica menor:
   escolhe a mais simples e regista no DECISOES.md.
8. No fim de cada fase: typecheck, lint, test, test:sql e build sem erros,
   o resultado verificável mostrado, e o PROGRESSO.md atualizado. Não avances
   sem a minha confirmação.

Começa pela Fase 0.
```

### K.1 · Notas para quem executa

- Em caso de conflito entre a especificação e uma sugestão do assistente, prevalece a especificação; entre duas partes da especificação, prevalece o `DECISOES.md`.
- A qualidade da interface é parte do requisito, não um acabamento.
- Nenhuma funcionalidade está concluída se não estiver testada com um utilizador real do papel certo.


---

## Parte L · Publicação, domínios e custos

O que acontece depois de o sistema estar construído: onde vive, como cada
barbearia ganha o seu endereço, e quanto custa manter tudo a funcionar.

### L.1 · As peças de infraestrutura

| Peça | Para que serve | Plano |
| --- | --- | --- |
| Supabase | Base de dados, autenticação e ficheiros | Free durante a construção; **Pro desde a primeira barbearia real** (cópias de segurança diárias; o projeto gratuito pausa por inatividade) |
| Vercel | Alojamento, HTTPS, publicação a cada alteração, funções em fra1 | **Hobby** até ao ponto de equilíbrio, por decisão do dono (DECISOES D-15); Pro quando a receita o permitir |
| Domínio | `instabarber.pt` e os defensivos | Anual |
| Resend | E-mail transacional | Gratuito até 3.000 e-mails por mês |
| Zoho Mail | Correio da Performa LAB | Mail Lite |

**Risco registado sobre a Vercel:** os termos da Vercel reservam o plano Hobby
a uso pessoal e não comercial. Com barbearias a pagar, a Vercel pode suspender
o projeto. A passagem para o Pro é só configuração (mudar o plano e confirmar a
região das funções); nada no código depende do plano. Os valores e termos dos
planos mudam: confirmar diretamente no Supabase e na Vercel antes de decidir.

### L.2 · As chaves e as variáveis de ambiente

#### Como as chaves circulam

```
A TUA MÁQUINA — .env.local
  As chaves verdadeiras. O Claude Code lê-as daqui para correr a aplicação, as
  migrações e os testes. Nunca sai da máquina.

O REPOSITÓRIO — .env.example
  Os nomes das variáveis com valores falsos, como modelo. É este que vai para o Git.

A PRODUÇÃO — painel da Vercel
  As chaves verdadeiras, coladas à mão, uma vez.
```

Regras:

- O Claude Code lê as chaves do `.env.local`. Não as pede no chat, não as escreve no código, não as guarda em ficheiros do repositório.
- Se faltar uma variável, o Claude Code para e pede o valor. Não inventa nem usa um valor de exemplo.
- Todas as chaves passam por `process.env`, lidas em ficheiros de servidor. Só as `NEXT_PUBLIC_` chegam ao browser.
- A chave de serviço do Supabase só existe em `lib/supabase/servico.ts` (com `import "server-only"`). Se aparecer num componente de cliente, a construção para.
- O `.gitignore` tem `.env*` e `!.env.example` antes do primeiro commit. A Fase 0 confirma-o.

```
# .env.example (vai para o Git; valores falsos)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx          # só no servidor
RESEND_API_KEY=xxxxx                     # e-mails transacionais
ROOT_DOMAIN=instabarber.pt               # domínio raiz da plataforma
EMAIL_REMETENTE=nao-responder@instabarber.pt
EMAIL_NOTIFICACOES=geral@instabarber.pt  # onde chegam as adesões
EMAIL_COMERCIAL=comercial@instabarber.pt # onde chegam os pedidos de contacto da landing
# Dados mínimos da Prestadora para o contrato (D-44). Valores reais só no .env.local e na Vercel
PRESTADORA_NOME=xxxxx
PRESTADORA_NIF=999999999
PRESTADORA_MORADA=xxxxx
PRESTADORA_QUALIDADE=xxxxx
PRESTADORA_ASSINANTE=xxxxx
PRESTADORA_REGIME_IVA=isento             # isento (art. 53.º do CIVA) ou normal (D-45)
# Módulos desligados (G.4): só quando forem ativados
# PAGAMENTOS_FORNECEDOR=…  PAGAMENTOS_CHAVE=…  PAGAMENTOS_SEGREDO_WEBHOOK=…

# .gitignore (obrigatório)
.env*
!.env.example
dados-locais/
node_modules/
.next/
```

O que é preciso, e quando:

```
Fase 0 ... a chave do Resend e o domínio verificado (SPF e DKIM), para o formulário de contacto da landing (D-46). O resto monta-se com o .env.example.
Fase 1 ... o projeto Supabase e a palavra-passe da base de dados.
Fase 2 ... a chave do Resend (convites e recuperação de palavra-passe).
Fase 7 ... o domínio apontado e as chaves no painel da Vercel.
```

**Regra absoluta:** a chave de serviço ignora todas as regras de isolamento.
Nunca no browser, nunca no código do cliente.

#### Os endereços de correio da plataforma

Cinco endereços no domínio da marca: uma caixa e quatro alias que entregam
nessa caixa.

```
geral@instabarber.pt ............ caixa ..... o principal. Faturas e o que vem de fora
raphaelmartins@instabarber.pt ... alias ..... correio que o dono envia em nome próprio
comercial@instabarber.pt ........ alias ..... propostas, prospeção e negociação
apoio@instabarber.pt ............ alias ..... suporte às barbearias
privacidade@instabarber.pt ...... alias ..... exercício de direitos do RGPD
```

O endereço segue a natureza da mensagem, não quem a escreve: matéria comercial
sai do comercial@; a palavra do dono, do raphaelmartins@; operação corrente, do
geral@; problema de uma barbearia, do apoio@; proteção de dados, do privacidade@.

- Assinatura única nos cinco: «InstaBarber · Performa LAB», sem nome pessoal (D-44).
- O raphaelmartins escreve-se junto e em minúsculas, nunca com ponto.
- O privacidade@ consta da Política de Privacidade publicada antes da primeira barbearia real.
- Serviço: Zoho Mail, plano Mail Lite (cerca de 1 € por mês), com o domínio verificado por registo TXT. O plano gratuito foi descartado: só dá webmail e pode não estar disponível em Portugal.
- O e-mail transacional (`EMAIL_REMETENTE`) sai pelo Resend, com o domínio verificado (SPF e DKIM).

### L.3 · O endereço de cada barbearia

#### Domínios registados

Registados a 20 de outubro de 2026, com renovação anual:

| Domínio | Referência | Uso |
| --- | --- | --- |
| instabarber.pt | 5311150 | O domínio da plataforma. O único que serve a aplicação |
| instabarber.es | 5311151 | Defensivo, sem uso |
| instabarber.eu | 5311152 | Defensivo, sem uso |
| instabarber.online | 5311153 | Defensivo, sem uso |

#### As três formas

A plataforma suporta as três ao mesmo tempo; o middleware decide pela ordem da
L.4. Internamente, todas servem a rota `/b/[slug]`, que nunca aparece ao público.

**Forma 1 · Caminho no domínio da plataforma** — `instabarber.pt/barbearia-exemplo`

Zero configuração: funciona no instante da aprovação. É a forma recomendada
para começar. O slug não pode ser um dos reservados (`admin`, `app`, `api`,
`b`, `adesao`, `entrar`, `termos`, `privacidade`…); a base de dados recusa-os.

**Forma 2 · Subdomínio** — `barbearia-exemplo.instabarber.pt`

Com um registo wildcard, qualquer subdomínio novo funciona sem tocar no DNS.
**Na Vercel, um domínio wildcard exige que o domínio use os nameservers da
Vercel** (método de nameservers); o certificado de cada subdomínio é emitido
automaticamente. Configura-se uma vez, na Fase 7.

**Forma 3 · Domínio próprio da barbearia** — `barbeariaexemplo.pt`

```
A barbearia compra o domínio em seu nome. No painel do registador:
  raiz (@) ... registo A com o endereço IP que a Vercel indicar ao adicionar o domínio
  www ........ CNAME para o destino que a Vercel indicar
Um CNAME na raiz não é válido na maioria dos registadores: usa-se sempre o registo A.

Depois, o administrador:
  1. grava o domínio em inquilinos.dominio_proprio;
  2. adiciona o domínio ao projeto na Vercel;
  3. acrescenta-o aos endereços de retorno do Supabase Auth;
  4. confirma o HTTPS e testa.
```

É a forma que faz a barbearia sentir que tem uma aplicação feita para ela. É um
extra de 5,00 € por mês (6,15 € com IVA), ligado na ficha da barbearia (D.1).
O procedimento completo está no manual do operador (P-10).

### L.4 · Como o sistema sabe qual barbearia carregar

Um único `middleware.ts` resolve o inquilino antes de qualquer página:

```
1. Ler o host do pedido.
2. Se o host for um dominio_proprio registado     → esse inquilino.
3. Senão, se for <slug>.instabarber.pt            → o inquilino com esse slug
   (ex.: barbearia-exemplo.instabarber.pt → slug = barbearia-exemplo).
4. Senão, se for instabarber.pt/<slug>            → o primeiro segmento do caminho
   (ex.: instabarber.pt/barbearia-exemplo → slug = barbearia-exemplo),
   desde que não seja um caminho reservado.
5. instabarber.pt sem slug                         → página institucional da Performa LAB.
6. Slug inexistente ou barbearia não ativa         → «Barbearia não encontrada»
   (suspensa: «Temporariamente indisponível para marcações», M.4).
7. Reescrever para /b/<slug>/… e deixar /app e /api seguirem o seu caminho.
8. /admin só no domínio principal (instabarber.pt). Em qualquer host de barbearia
   (subdomínio ou domínio próprio) responde 404 — nunca redireciona.
```

O middleware só encaminha. A autorização está no servidor e no RLS.

### L.5 · Ligar uma barbearia nova — procedimento

```
Forma 1 (caminho):       aprovar o pedido; confirmar o slug. Fica acessível.
Forma 2 (subdomínio):    aprovar; com o wildcard ativo, nada mais. Testar e enviar o endereço.
Forma 3 (domínio próprio): pedir à barbearia os registos DNS (L.3); gravar o domínio;
                         adicioná-lo na Vercel e no Supabase Auth; confirmar HTTPS; testar.
Em todas: enviar à barbearia o endereço da página pública e o do painel.
```

### L.6 · Custos ao longo do crescimento

#### Mensais

| Serviço | Plano | Custo mensal | Quando começa |
| --- | --- | --- | --- |
| Claude Code | Pro | 17 € | Já |
| Zoho Mail | Mail Lite | 1 € | Já |
| Vercel | Hobby | 0 € | Já (decisão D-15) |
| Supabase | Free → Pro | 0 € → cerca de 25 USD | Pro com a primeira barbearia real |
| Programa de faturação da Performa LAB | Moloni ou equivalente certificado | 6,49 a 15,90 € | Com a primeira fatura emitida |
| Contabilista certificado | — | A orçamentar | Com a atividade da Performa LAB |
| Vercel | Pro | cerca de 20 USD | Quando a receita o permitir |
| Resend | Pago | cerca de 20 USD | Acima de 3.000 e-mails por mês |

#### Anuais

| Domínio | Custo anual | Nota |
| --- | --- | --- |
| instabarber.pt | cerca de 10 € | Indispensável |
| instabarber.es, .eu, .online | cerca de 10 € cada | Defensivos, renovação opcional |

#### Ponto de equilíbrio

Com Claude Code, Zoho, Supabase Pro e o programa de faturação, os custos fixos
ficam perto de 50 a 60 € por mês, antes do contabilista e da Vercel Pro. Com
uma mensalidade média de cerca de 35 € sem IVA, duas barbearias pagam a
infraestrutura. O contabilista é, em regra, o maior custo fixo: se custar 200 a
250 € por mês, o ponto de equilíbrio fica entre **8 e 10 barbearias**, e a
Vercel Pro entra a seguir. Nenhum destes
valores cresce com as mensagens, porque o WhatsApp é por ligação direta.

### L.7 · Cópias de segurança e recuperação

- Supabase Pro: cópias diárias nativas, com 7 dias de retenção.
- Cópia externa com 30 dias de retenção: `supabase db dump` guardado fora do Supabase, feita à mão todas as semanas e antes de qualquer alteração de esquema em produção (DECISOES D-16). O procedimento está no manual do operador (P-13).
- Testar uma restauração completa antes do primeiro cliente real. Uma cópia que nunca foi restaurada não é uma cópia.
- Chaves de acesso num gestor de palavras-passe, com acesso de emergência.

### L.8 · Publicação passo a passo

```
1.  Projeto Supabase na região eu-central-1 (Frankfurt).
2.  Aplicar docs/esquema/01…04. Correr os testes de docs/esquema/testes num projeto de ensaio com as
    mesmas migrações (nunca na produção: criam dados de teste). Não avançar com falhas.
3.  Ativar o 2FA (TOTP) no Supabase Auth e criar a conta do super_admin.
4.  Configurar o Resend como SMTP do Supabase Auth e verificar o domínio de envio.
5.  Projeto na Vercel ligado ao repositório; funções em fra1.
6.  Variáveis de ambiente no painel da Vercel (L.2).
7.  Domínio instabarber.pt com os nameservers da Vercel; HTTPS; www para o domínio principal.
8.  Wildcard *.instabarber.pt, se se usar a Forma 2.
9.  Endereços de retorno do Supabase Auth: domínio principal e subdomínios.
10. Publicar os Termos, a Política de Privacidade e o Acordo de Subcontratação, revistos por um jurista.
11. Ciclo completo com uma barbearia de ensaio: formulário, pedido, aprovação, convite,
    marcação sem conta, código de acesso, conclusão, relatório.
12. Testar uma restauração de cópia de segurança.
13. Só depois, abrir a primeira barbearia real.
```


---

## Parte M · Operação e suporte

Construir o sistema é metade do trabalho. A outra metade é mantê-lo a
funcionar com clientes reais a depender dele.

### M.1 · Rotina de operação

| Frequência | Tarefa | Porquê |
| --- | --- | --- |
| Diária | Ver pedidos de adesão novos e aprovar | Uma barbearia que espera dois dias perde o entusiasmo |
| Diária | Ver os erros registados | Uma falha silenciosa num sábado à noite custa clientes |
| Semanal | Rever leads parados e propostas a expirar (Comercial, P-21) | Um contacto que espera uma semana arrefece |
| Semanal | Cópia externa da base de dados (manual do operador, P-13) | É a proteção contra perda de dados |
| Semanal | Rever barbearias com pouca utilização (M.2) | Quem não usa, cancela |
| Mensal | Emitir as faturas da Performa LAB no programa certificado e registar os recebimentos | A cobrança é manual, por decisão de produto |
| Mensal | Rever as mensalidades em atraso | Antes de chegar à suspensão |
| Semanal | Vencimentos dos próximos 7 dias: enviar lembretes (P-25) | Evita atrasos antes de chegarem à suspensão |
| Mensal | Registar custos e contas do mês e rever o objetivo (P-26) | Saber o lucro e o ponto de equilíbrio |
| Mensal | Apagar leads sem contrato com mais de 12 meses (P-24) | Retenção de dados pessoais (H.1) |
| Trimestral | Rever preços e planos | O mercado e os custos mudam |
| Anual (até 1 de dezembro) | Carregar os feriados nacionais do ano seguinte | As datas da Páscoa e do Corpo de Deus mudam |

O relatório mensal de cada barbearia não se envia: a barbearia descarrega-o
no painel (DECISOES D-11).

### M.2 · Sinais de alerta numa barbearia

Os sinais que precedem um cancelamento. Vê-los antes, não depois.

- Não abre o painel há mais de dez dias. É o sinal mais forte e o mais fácil de medir.
- Não tem marcações novas há mais de uma semana.
- Nunca carregou o logótipo nem personalizou a marca.
- Nunca abriu uma mensagem de recuperação (Pro) ou nunca viu o radar (Basic).
- Ficou suspensa por falta de pagamento e não voltou a contactar.
- Mais profissionais contratados do que ativos: paga por algo que não usa.

Para cada sinal, um contacto previsto: uma chamada ou uma mensagem pessoal a
perguntar o que falta, nunca uma mensagem automática genérica.

### M.3 · Suporte a uma barbearia

```
NÍVEL 1 — Utilização (a maioria dos casos)
  Não consigo entrar; esqueci-me da palavra-passe.        → ligação de recuperação por e-mail
  O meu barbeiro não recebeu o convite.                    → «Reenviar convite» na Gestão do sistema
  Um cliente não recebe o código.                          → ver «Pedidos de acesso» no Início
  Não sei como registar um serviço.                        → guia rápido ou chamada de cinco minutos

NÍVEL 2 — Configuração
  O horário está errado e a agenda não abre as horas certas.
  Quero mais um profissional.  Quero mudar do Basic para o Pro.
                                                           → o administrador ajusta no painel

NÍVEL 3 — Técnico
  Marcação duplicada para o mesmo profissional.  Erro ao gravar.  Dados em falta.
                                                           → investigar na auditoria, corrigir,
                                                             dizer ao cliente o que aconteceu e o que foi feito

REGRA: um problema de nível 3 num sábado à noite vale mais do que dez
melhorias. A confiança perde-se numa noite e ganha-se em meses.
```

### M.4 · Suspender sem perder dados

Quando uma barbearia não paga, suspende-se o acesso, nunca os dados.

- A suspensão (estado `suspenso`) corta o acesso da equipa aos dados (o RLS deixa de os mostrar) e tira a página pública das marcações. O dono continua a ver «O meu plano» e as faturas, para regularizar.
- A página pública mostra um aviso neutro: «Temporariamente indisponível para marcações». Não expõe a razão.
- Ao reativar, tudo volta como estava, incluindo as marcações futuras.
- Após 12 meses de suspensão sem contacto, e cumprindo a política de conservação, os dados podem ser eliminados. O cliente é avisado antes, por escrito, e recebe a exportação dos dados (manual do operador, P-18).

### M.5 · Como dar suporte sem te afogares

A partir de vinte a trinta barbearias, o suporte começa a competir com as
vendas pelo teu tempo.

- Uma página de ajuda com as dez perguntas mais frequentes, em vídeos de um minuto.
- Resolver no painel de administração em vez de ensinar: acrescentar um barbeiro é um clique.
- Um vídeo de boas-vindas gravado para cada barbearia nova, com o painel dela.
- Só a partir de trinta clientes vale a pena um assistente a meio tempo.

### M.6 · Quando ocorrer uma violação de dados

O RGPD dá ao responsável pelo tratamento 72 horas para notificar a Comissão
Nacional de Proteção de Dados. O plano tem de estar escrito antes de ser preciso.

```
1. Conter: cortar o acesso, revogar chaves comprometidas, fechar a exposição.
2. Avaliar: que dados, de quantas pessoas, que risco real.
3. Registar: hora da descoberta, causa, dados afetados, ações tomadas.
4. Informar as barbearias afetadas sem demora injustificada. A notificação à CNPD
   em 72 horas é delas, como responsáveis pelo tratamento; a Performa LAB dá-lhes
   a informação de que precisam.
5. Informar os titulares, se o risco for elevado (decisão do responsável).
6. Corrigir a causa e registar o que mudou.
```

Manter um documento com este plano, os contactos e o registo de incidentes. É
exigido pelo RGPD e demonstra diligência numa inspeção.

### M.7 · Evolução do produto depois do lançamento

Cada passo só se justifica quando o anterior está estável.

1. Corrigir tudo o que os clientes reportarem. Nenhuma funcionalidade nova compete com um erro por resolver.
2. Cópia externa automática, se um dia a cópia semanal à mão deixar de chegar (exige autorizar uma tarefa agendada).
3. Notificações push no telemóvel do barbeiro (exige a dependência `web-push`).
4. O assistente de contas automatizado, quando o número de clientes pesar no teu tempo.

**Plano dos 50 clientes** — gatilho: 50 barbearias ativas a pagar.

1. Escolher o fornecedor de pagamentos (D-05) e ativar o MB WAY (G.4): sinal nas marcações, cobrança do clube e cobrança automática das mensalidades InstaBarber.
2. Ativar a faturação por programa certificado ou portal (G.4), depois do parecer do contabilista.
3. Avaliar certificar o próprio InstaBarber na AT.
4. Multi-loja.
5. Reserva a partir do Google.
6. O agente de atendimento no WhatsApp, vendido como serviço à parte: tem custo por conversa e exige preço próprio. Não faz parte do Pro nem substitui as ligações `wa.me`.
7. O marketplace entre barbearias, quando houver escala para ele ter conteúdo.

### M.8 · Manual do operador

Os processos manuais da Performa LAB estão escritos, passo a passo, no
`docs/manual-do-operador.md`: da proposta comercial e da aprovação de uma
barbearia à cópia de segurança, ao restauro e à saída de uma barbearia. Serve
para qualquer pessoa conseguir operar a gestão do InstaBarber sem depender de
quem a construiu.

O manual escreve-se já, a partir da especificação. Na Fase 8 é revisto com o
sistema real: cada procedimento é feito uma vez, os passos corrigem-se e
acrescentam-se as capturas de ecrã. Qualquer mudança no produto que mexa num
procedimento atualiza o manual no mesmo dia.

### M.9 · Regras de qualidade em todas as fases

**Nunca deixar código morto.** Quando uma funcionalidade sai, sai por
completo: função, componentes, rotas, estilos, tipos e testes. Depois de
remover, procurar o nome em todo o projeto. A única exceção é o código
desligado por interruptor, com testes e registado no `DECISOES.md` (G.4).

**Validar antes de entregar.** `npm run typecheck`, `lint`, `test`,
`test:sql` e `build` sem erros. O `typecheck` apanha o que a leitura deixa
passar.

**Uma funcionalidade, um só gerador.** Quando um valor é calculado em mais do
que um sítio, os sítios divergem. Cada cálculo relevante vive numa função —
SQL ou `lib/regras` — e todos os ecrãs a usam.


---

## Parte N · Comercial: CRM, propostas e contratos

O separador **Comercial** do InstaBarber Admin acompanha uma barbearia desde o
primeiro contacto até ao contrato assinado e à criação da conta. É uma
ferramenta interna da Performa LAB: nenhuma barbearia o vê. O esquema SQL está
em `docs/esquema/` (secção 17 das tabelas, 8B das funções) e tem 112 testes
próprios em `testes/40_comercial.sql`.

### N.1 · O que é, e o que não é

**É:** um funil de vendas simples, um briefing que recolhe o que se ouviu, um
gerador de propostas em PDF, um gerador de contratos em PDF a partir da proposta
aceite, e a passagem do contrato assinado para o formulário de adesão.

**Não é:**
- Um CRM genérico: sem automações, sem e-mails em massa, sem pontuação de leads, sem várias equipas.
- Um sistema de assinatura eletrónica: o contrato assina-se fora (N.7) e carrega-se assinado.
- Um sistema de faturação: as propostas e os contratos são documentos comerciais. Não são documentos fiscais (H.3, D-01).
- Um envio automático: o sistema prepara os documentos e as mensagens; quem envia é o operador, e confirma no sistema (CLAUDE.md, regra 7).

**Regras que se mantêm:** uma só aplicação; nada de código por cliente (os
textos jurídicos são modelos em configuração, N.8); isolamento por RLS; zero
cálculos de data fora de Europe/Lisbon; nenhuma dependência nova (PDF com jsPDF,
a fórmula do preço de D.7).

### N.2 · Onde vive

- Rota `instabarber.pt/admin/comercial`, só no domínio principal (D-33), só para o super_admin com dois fatores.
- Cinco separadores: **Funil**, **Leads**, **Propostas**, **Contratos**, **Modelos**.
- Ficheiros: `app/(admin)/admin/comercial/`, `lib/comercial/` (briefing, proposta, contrato, marcadores), `lib/repositorios/comercial.ts`. A fórmula do preço é a de `lib/regras/mensalidade.ts` (D.7): não se duplica.
- Armazenamento: bucket privado `comercial` (`leads/<lead_id>/…`), só o super_admin lê e escreve.

### N.3 · O funil e os leads

| Estado | Significado | Como se entra |
| --- | --- | --- |
| Novo | Pediu contacto e ninguém falou com ele | Formulário do site, ou lead criado à mão |
| Contactado | Houve uma primeira conversa | À mão |
| Demonstração | Demonstração marcada ou feita | À mão |
| Proposta | Há uma proposta criada | Automático ao criar a primeira proposta |
| Ganho | Contrato assinado | **Só** ao assinar o contrato (`assinar_contrato`) |
| Perdido | Não avançou | À mão, com motivo obrigatório |

Um lead ganho não volta atrás. Um lead perdido pode ser reaberto.

**O lead.** Nome do contacto, barbearia, cidade, telefone, e-mail (pelo menos um
dos dois), número de barbeiros indicado, origem (site, WhatsApp, e-mail,
indicação, visita, outro), próxima ação e data.

**O histórico** de cada lead é uma linha do tempo: notas, chamadas, mensagens,
mudanças de estado, propostas e contratos. Mudanças de estado, propostas e
contratos escrevem-se sozinhas; notas, chamadas e mensagens registam-se à mão e
atualizam o «último contacto» e a próxima ação.

**O ecrã Funil** mostra as colunas por estado, com o número de leads e o valor
potencial (a mensalidade das propostas enviadas). Os cartões com a próxima ação
vencida ficam realçados. Sem tarefas agendadas (D-16): quem vê é quem abre o
ecrã. Alerta no painel geral do Admin: leads novos há mais de dois dias úteis, e
propostas enviadas a expirar nos próximos três dias.

**O formulário do site** (landing, I.3 e H.1) chama `submeter_lead()`:
- Valida nome, contacto e e-mail. A rota aplica o limite por IP e o campo honeypot; a função aplica o limite por contacto (três pedidos por hora).
- Responde sempre «recebido» a quem não abusa. Se o contacto já tem um lead aberto, não cria outro: acrescenta uma linha ao histórico.
- Envia um e-mail curto a `comercial@instabarber.pt` pelo Resend, com a ligação para o lead.
- A Política de Privacidade do site passa a dizer que o pedido se guarda (H.1).

### N.4 · O briefing

Um formulário em passos, por lead, preenchido durante ou logo depois da conversa
de 20 minutos. Guarda-se em `briefings.dados`, validado com Zod, e pode ser
editado até se criar a proposta. Os campos marcados com * entram na proposta.

| Passo | Campos |
| --- | --- |
| 1 · Barbearia | Nome comercial*, firma, NIF, morada, cidade, ano de abertura, n.º de cadeiras, horário |
| 2 · Equipa | N.º de barbeiros*, regime de cada um (empregado ou independente), modelo de caixa A/B/C (F.4.11), quem decide |
| 3 · Situação atual | Como marcam hoje* (telefone, WhatsApp, caderno, outro sistema), sistema atual e custo, clientes ativos (estimativa)*, valor médio de uma visita*, faltas por semana |
| 4 · Dores e objetivos | Dores* (faltas, clientes que desaparecem, financeiro desorganizado, comissões, fidelização, presença online), objetivo principal nos próximos três meses* |
| 5 · Plano recomendado | Plano, profissionais, periodicidade, domínio próprio. O preço calcula-se em tempo real com `mensalidade.ts`, com e sem IVA |
| 6 · Condições | Barbearia piloto (sim/não) e condições de lançamento (texto livre), desafio de 90 dias (só Pro), validade da proposta em dias (por omissão 15), data de arranque pretendida |
| 7 · Contacto e decisor | Nome, cargo, e-mail, telemóvel de quem decide* |

O passo 3 alimenta uma conta de apoio à proposta: **«o que isto vale para si»**.
Calcula-se com a regra da F.1 (clientes que deixaram de vir × valor da visita ×
0,4) e compara-se com a mensalidade. É sempre apresentada como estimativa, nunca
como promessa, e só aparece se o operador preencher os números no briefing.

### N.5 · A proposta

**Gerar.** «Gerar proposta» a partir do briefing cria uma **versão** (`criar_proposta`),
com número `PRP-AAAA-NNNN`, e fotografa tudo em `propostas.dados`. Uma versão
nova substitui a anterior ainda aberta. Estados: rascunho → enviada → aceite ou
recusada; substituída quando há versão nova; **expirada** é calculada ao ler
(a validade conta desde o envio, em hora de Lisboa), sem tarefa agendada.

**Depois de enviada, o preço e o conteúdo não mudam** (gatilho na base de dados).
Para mudar, cria-se uma versão nova. Os valores guardados batem com a fórmula: a
base de dados recusa um valor com IVA que não seja o sem IVA × 1,23 arredondado.

**O PDF** (jsPDF, A4, identidade da Performa LAB: cabeçalho preto, dourado,
paginação no rodapé, logótipo InstaBarber de `public/marca/`):

1. **Capa:** logótipo, «Proposta comercial», nome da barbearia, número, data, validade, contacto de quem propõe.
2. **O que ouvimos:** a situação atual e os objetivos, nas palavras do briefing.
3. **A solução:** as funcionalidades do plano, ligadas às dores marcadas (por exemplo, faltas → lembrete de marcação; clientes que desaparecem → radar e mensagem de recuperação). Gerado a partir da grelha D.3, só com o que o plano inclui.
4. **O que fica incluído:** a lista completa da D.9.
5. **Investimento:** plano, profissionais, periodicidade, decomposição (D.5), preço com e sem IVA, domínio próprio se houver. A conta do desafio e o «o que isto vale para si», se existirem.
6. **Desafio de 90 dias** (se Pro): as condições da D-36, tal como estão na landing.
7. **Condições de lançamento** (se piloto): o texto livre do passo 6.
8. **Como arrancamos:** os passos da D.12 (aceitar, formulário de adesão, importação dos clientes, primeira semana — P-04), sem prometer prazos que o operador não tenha escrito.
9. **Condições:** modelo `condicoes_proposta` (validade, sem fidelização, cancelamento, dados na UE, «Não é documento fiscal»).
10. **Próximo passo e assinatura:** «InstaBarber · Performa LAB», com o e-mail e o telefone comerciais (só a proposta leva o telefone; o contrato leva apenas nome, NIF e domicílio da Prestadora).

O logótipo do cliente, se o operador o carregar no lead, aparece na capa ao
lado do da Performa LAB. É opcional.

**Enviar.** O sistema não envia a proposta. O operador descarrega o PDF, envia-o
por e-mail ou WhatsApp (o ecrã oferece o texto de acompanhamento pronto, com
`wa.me` e `mailto`) e carrega «Marcar como enviada». Só então começa a validade.

**Decidir.** «Aceite» ou «Recusada» (com motivo). Uma proposta expirada não se
aceita: gera-se uma versão nova com preços e validade renovados.

### N.6 · O contrato

**Gerar.** Só de uma proposta **aceite**. O operador confirma os dados do
contratante, que vêm do briefing e da proposta: firma, NIF (validado pelo dígito de
controlo), morada, representante e cargo. «Gerar contrato» (`gerar_contrato`):
- exige um **modelo aprovado** (N.8); com o modelo em rascunho, recusa;
- substitui os marcadores `{{…}}` do modelo pelos dados da proposta aceite (plano, profissionais, preços com e sem IVA, periodicidade, domínio, desafio, validade) e **fotografa o texto final**;
- dá o número `CTR-AAAA-NNNN`; gerar outra vez cancela o rascunho anterior (só há um contrato ativo por proposta);
- gera o PDF, com a proposta aceite em anexo.

**Anexos.** I — Proposta aceite (a fotografia, não a versão atual); II — Termos de Uso e Política de Privacidade; III — Acordo de Subcontratação (RGPD, art. 28.º; rascunho em `docs/comercial/modelo-acordo-subcontratacao.md`); IV — Desafio de 90 dias, se existir. O modelo base está em `docs/comercial/modelo-contrato.md`.

**Estados.** Rascunho → enviado → assinado → terminado; cancelado (só antes de
assinado). Depois de assinado, o texto, os dados, o número e o PDF assinado **não
se alteram** (gatilho). Muda-se com um aditamento: contrato novo.

### N.7 · Assinar e fechar o negócio

1. O operador descarrega o PDF e envia-o. A assinatura faz-se **fora do sistema**: assinatura digital qualificada (por exemplo, a Chave Móvel Digital, gratuita) ou impressão, assinatura e digitalização. Uma resposta de e-mail a dizer «aceito» não substitui o contrato assinado. A escolha entre estas vias e o valor probatório de cada uma é para o jurista confirmar (N.8).
2. Com o ficheiro assinado: «Registar assinatura» pede a data e o PDF assinado (`assinar_contrato`). Sem o ficheiro, não regista.
3. O lead passa a **Ganho**, fica em auditoria e o histórico regista-o.
4. «Criar convite de adesão» (`criar_convite_adesao`) gera uma ligação de uso único, válida 14 dias, para o formulário de adesão **já preenchido** com o que se sabe: nome, contacto, plano, profissionais, periodicidade, domínio. O dono completa o resto (D.8). A ligação leva um código, de que só se guarda o hash; nunca leva palavra-passe.
5. Quando o dono envia o formulário, o pedido fica ligado ao contrato (`usar_convite_adesao`). Na aprovação (P-03), o inquilino criado liga-se ao contrato e ao lead (`ligar_contrato_inquilino`) e a data de início fica definida.

### N.8 · Os modelos de documento

Os textos jurídicos e comerciais são **dados**, não código (regra: configuração,
nunca código por cliente). Vivem em `modelos_documento`, em Markdown com
marcadores.

- Dois tipos: `contrato` e `condicoes_proposta`. Cada um com versões numeradas.
- Estados: **rascunho** (não gera documentos), **aprovado** (gera), **arquivado**. Aprovar exige quem aprovou e quando; fica registado.
- O ecrã Modelos permite editar um rascunho e pré-visualizar com dados de exemplo. Um modelo aprovado não se edita: cria-se uma versão nova. Os contratos já gerados guardam o texto que usaram.
- **Marcadores** aceites: `{{contratante.razao_social}}`, `{{contratante.nif}}`, `{{contratante.morada}}`, `{{contratante.representante}}`, `{{contratante.cargo}}`, `{{proposta.numero}}`, `{{plano}}`, `{{profissionais}}`, `{{periodicidade}}`, `{{valor_sem_iva}}`, `{{valor_com_iva}}`, `{{iva_texto}}` (por exemplo, «Isento de IVA, nos termos do artigo 53.º do CIVA.», ou «IVA à taxa de 23 % incluído.»), `{{dominio_proprio}}`, `{{data_inicio}}`, `{{data_assinatura}}`, `{{contrato.numero}}`, `{{prestadora.nome}}`, `{{prestadora.nif}}`, `{{prestadora.morada}}`, `{{prestadora.qualidade}}`, `{{prestadora.assinante}}` (os dados mínimos de quem presta o serviço: vêm das variáveis `PRESTADORA_*` do ambiente, nunca do texto do modelo nem do repositório. O contrato fotografa-os ao ser gerado), `{{contratante.email}}`, `{{condicoes_lancamento}}` e `{{desafio}}` (texto do desafio de 90 dias, ou «Não aplicável»). Os marcadores opcionais (`{{dominio_proprio}}`, `{{condicoes_lancamento}}`, `{{desafio}}`) preenchem-se com «Não aplicável» quando a proposta não os tem. Um marcador desconhecido, ou um obrigatório sem valor, impede a geração e diz qual.
- **Revisão jurídica.** Os modelos entregues em `docs/comercial/` (contrato, Acordo de Subcontratação e condições da proposta, com as `notas-para-o-jurista.md`) apoiam-se na lei portuguesa e europeia aplicável (cláusulas contratuais gerais, pagamentos em atraso entre empresas, RGPD, Regulamento dos Dados, assinatura eletrónica) e são **rascunhos para um jurista rever**: preço, responsabilidade, foro, prazos e a validade da assinatura escolhida. O sistema não impede um modelo de ser aprovado sem revisão: a aprovação é uma decisão do dono, e a regra é que só se aprova depois do parecer.

### N.9 · Dados pessoais no comercial

- A Performa LAB é **responsável** pelos dados dos leads (pessoas de contacto de empresas), com base em diligências pré-contratuais a pedido do titular (H.1).
- Prazo: um lead que não chega a cliente é apagado 12 meses depois do último contacto. Como não há tarefas agendadas, é um procedimento mensal à mão (P-24, `apagar_leads_inativos`). Os leads com contrato nunca se apagam por esta via: seguem os prazos legais de conservação dos contratos e da faturação.
- A Política de Privacidade do site e a landing dizem o que se guarda e por quanto tempo, e têm de ser atualizadas na Fase 3B, quando o formulário passar a gravar.
- Pedidos de apagamento de um lead (P-12) apagam o lead, o briefing, as propostas e o histórico, desde que não exista contrato.

### N.10 · Segurança

- Todas as tabelas e funções do comercial só respondem ao super_admin com dois fatores (`aal2`). Sem segundo fator, nada se vê e nenhuma função corre. Os testes cobrem dono, barbeiro, cliente final, visitante e super_admin sem 2FA.
- O visitante só pode executar `submeter_lead`, `ler_convite_adesao` e `usar_convite_adesao`; a primeira não revela se o contacto já existe, e as outras só devolvem algo a quem tem o código.
- Funções internas (numeração, histórico) não se chamam de fora.
- Ações sensíveis em auditoria: assinatura de contratos e apagamento de leads.

### N.11 · Ordem de construção e dependências

A **Fase 3B** (fases/fase-3b.md) vem logo depois da Fase 3, porque precisa do
Admin com 2FA, do formulário de adesão e da fórmula do preço. Entrega-se por
camadas, cada uma útil sozinha: (1) leads e funil, com o formulário do site;
(2) briefing e proposta em PDF; (3) modelos e contrato; (4) convite de adesão e
ligação ao inquilino. Antes de a camada 3 ser usada com um cliente real, o
modelo de contrato tem de ter parecer jurídico.


---

## Parte O · Finanças da Performa LAB

O separador **Finanças** do InstaBarber Admin dá à Performa LAB o que o dono de
uma barbearia tem no seu Financeiro: o dinheiro que entra, o que sai, o lucro, o
ponto de equilíbrio e o objetivo do mês. Soma-lhe uma coisa que a barbearia não
precisa: lembrar os inquilinos de que a mensalidade vence. O esquema SQL está em
`docs/esquema/` (secção 18 das tabelas, 8C das funções) e tem 76 testes próprios
em `testes/50_financas.sql`.

### O.1 · O que é, e o que não é

**É:** um registo de custos e contas a pagar, indicadores de receita e lucro,
ponto de equilíbrio, objetivo de faturação com «quantos clientes faltam»,
previsões com cenários, exportação para o contabilista, e lembretes de vencimento
por WhatsApp e por e-mail.

**Não é:**
- Contabilidade: não apura IVA nem IRC e não substitui o contabilista nem o programa certificado (H.3, P-08).
- Faturação ou cobrança: a plataforma **regista**. As faturas saem do programa certificado; os recebimentos registam-se à mão (D-01). Nenhum PDF ou CSV se chama «fatura» ou «recibo»: dizem «Não é documento fiscal».
- Ligação ao banco, leitura automática de faturas ou conciliação bancária.
- Uma promessa: as previsões são cenários, com os pressupostos à vista.

**Regras que se mantêm:** só o super_admin com dois fatores e só em `instabarber.pt/admin` (D-33); sem dependências novas (Recharts e jsPDF já estão na stack); nenhuma data calculada fora de Europe/Lisbon; preços pela fórmula de `lib/regras/mensalidade.ts` (D.7), nunca duplicada.

### O.2 · Onde vive

- Rota `instabarber.pt/admin/financas`, com cinco separadores: **Resumo**, **Custos e contas**, **Objetivo e previsões**, **Vencimentos** e **Exportar**.
- Código: `app/(admin)/admin/financas/`, `lib/financas/` (custos, indicadores, mensagens de vencimento, exportação), `lib/regras/previsao.ts` (puro, com testes Vitest) e `lib/repositorios/financas.ts`.
- Os recebimentos e as faturas da plataforma continuam no separador **Pagamentos** (E.1). Este módulo **lê-os**; não os duplica.

### O.3 · Valores: sempre sem IVA

O IVA não é receita nem custo, quando a Prestadora está no regime normal. Todos
os indicadores, o lucro, o ponto de equilíbrio e as metas calculam-se **sem
IVA**. Com a Prestadora isenta (art. 53.º do CIVA, D-45), não há IVA a
liquidar, o valor «sem IVA» das mensalidades é igual ao preço final, e o IVA
pago nos custos **não é dedutível**: conta como custo, pelo valor **com IVA**.
O regime vem de `PRESTADORA_REGIME_IVA`.

| Origem | Como entra |
| --- | --- |
| Mensalidades (inquilinos) | `mensalidade.ts` devolve sem e com IVA; usa-se o valor sem IVA |
| Faturas e recebimentos | Guardam o valor faturado (P-08, confirmado pelo dono). No regime normal, o módulo divide por 1,23 e arredonda ao cêntimo; no isento, o valor é o mesmo |
| Custos | Registados sem IVA |
| Contas a pagar | Registam o valor sem IVA e com IVA; o lucro usa o valor sem IVA no regime normal e o valor com IVA no regime isento |

### O.4 · Custos e contas a pagar

**Custos** (`custos_plataforma`): a lista do que a operação custa. Cada custo tem
descrição, categoria (infraestrutura, domínios, ferramentas, contabilidade,
marketing, outros), tipo (**fixo** ou **variável**), valor sem IVA, periodicidade
(mensal, anual, único), data de início e, se acabar, de fim. O equivalente
mensal calcula-se na aplicação: o anual divide-se por 12.

Os custos de partida (L.5) vêm pré-carregados como sugestão, que o operador
confirma: Supabase, Vercel, Resend, Zoho, domínios `.pt`, `.es`, `.eu` e `.online`.
Os valores em dólares registam-se **já convertidos para euros**, à mão, pelo valor
da fatura. A passagem da Vercel do Hobby para o Pro (CLAUDE.md §8) altera o custo
a partir da data em que acontece: acrescenta-se um custo novo e dá-se fim ao anterior.

**Contas a pagar** (`contas_pagar`): fornecedor, descrição, valor sem e com IVA,
vencimento e data de pagamento. O estado é calculado ao ler (D-16): **pendente**,
**atrasada** (vencida e por pagar) ou **paga**. Pode ligar-se a um custo; apagar o
custo não apaga a conta. Uma conta recorrente cria-se com «Gerar as contas do
próximo mês» a partir dos custos ativos, à mão e uma vez por mês (sem tarefas agendadas).

Alertas no painel geral do Admin: contas a vencer nos próximos sete dias e contas atrasadas.

### O.5 · O Resumo

| Indicador | Como se calcula |
| --- | --- |
| **Receita recorrente (MRR)** | Soma da mensalidade sem IVA das barbearias **ativas**. O plano anual conta 10/12 do mensal (dez mensalidades por doze meses) |
| **Receita recebida no mês** | Recebimentos do mês ÷ 1,23 (regime normal) ou o próprio valor (isento) |
| **Custos do mês** | Custos fixos e variáveis ativos (equivalente mensal) |
| **Lucro estimado** | MRR − custos do mês |
| **Lucro de caixa** | Receita recebida − contas pagas no mês (sem IVA) |
| **Margem** | Lucro estimado ÷ MRR |
| **Valor médio por barbearia (ARPU)** | MRR ÷ barbearias ativas |
| **Em atraso** | Valor com IVA e número de barbearias com `estado_pagamento = em_atraso` |
| **Saídas (churn)** | Barbearias canceladas no mês ÷ ativas no início do mês (só mostra com mais de 10 barbearias) |

O ecrã mostra os últimos 12 meses em Recharts (receita, custos, lucro) e a
distribuição por plano. Os dois lucros aparecem sempre juntos: a diferença entre
eles são as mensalidades por receber.

### O.6 · Ponto de equilíbrio

**Custos fixos mensais ÷ (valor médio por barbearia − custo variável por
barbearia) = número de barbearias necessário.**

- O valor médio vem da mistura real de planos; sem barbearias, usa-se uma mistura escolhida pelo operador (por omissão, metade Basic e metade Pro).
- O ecrã dá também as respostas «só Basic» e «só Pro», e a mistura atual, com a barra de quantas faltam.
- Se a margem por barbearia for zero ou negativa, o ecrã diz que o ponto de equilíbrio não existe com estes custos, em vez de mostrar um número absurdo.
- Mostra o mês em que a previsão base o atinge (O.8).

### O.7 · Objetivo de faturação e «quantos clientes faltam»

O operador define o objetivo por mês (`metas_faturacao`): um valor sem IVA e a
base sobre que se mede, **receita recorrente** (por omissão) ou **recebido**.
Sem meta para o mês, o ecrã usa a última definida.

O ecrã responde a quatro perguntas:
1. Quanto falta (meta − MRR atual) e quantos por cento está cumprido.
2. **Quantas barbearias faltam**, em três respostas: só Basic (N), só Pro (M) e a mistura atual. Cálculo: ⌈falta ÷ valor médio do plano⌉, com o valor sem IVA de `mensalidade.ts` (um profissional extra no Pro conta no cálculo se o operador indicar a média de profissionais).
3. Quantas das que faltam já estão a caminho: propostas **enviadas** no Comercial (Parte N), com a taxa de conversão histórica (propostas aceites ÷ decididas). Só se mostra com 10 ou mais propostas decididas; antes disso o ecrã mostra o número de propostas abertas, sem taxa.
4. Em que mês, no cenário base, a meta é atingida.

### O.8 · Previsões

Uma projeção a 12 meses, em três cenários, calculada em `lib/regras/previsao.ts`
(função pura, testada). Cada mês:

`MRR(m+1) = MRR(m) + novas(m) × valor médio − MRR(m) × saídas`

- **Novas barbearias por mês:** por omissão a média dos últimos três meses; o operador pode fixar o número. Sem histórico, o operador escreve o seu pressuposto.
- **Saídas mensais (%):** por omissão a observada; enquanto houver menos de 10 barbearias, um pressuposto declarado de 3 % (aprovado pelo dono), marcado como tal no ecrã.
- **Mistura de planos:** a atual, ou a escolhida.
- **Cenários:** base (os valores acima); pessimista (metade das novas barbearias, saídas × 1,5); otimista (novas × 1,5, saídas × 0,5).
- **Custos:** os custos ativos, incluindo os que têm data de início futura (por exemplo, a Vercel Pro).
- **Resultado:** MRR, custos e lucro por mês; o mês em que cruza o ponto de equilíbrio; o mês em que atinge a meta; a pergunta «e se tiver N barbearias Pro?», que dá o MRR, o lucro e a margem.

O ecrã escreve por cima do gráfico: **«Projeção com os pressupostos abaixo. Não é uma promessa.»**
Cada pressuposto é editável, e mudar um recalcula tudo na hora, sem gravar nada.

### O.9 · Lembretes de vencimento

O mesmo modelo dos lembretes da barbearia (E.2): o sistema **prepara** a
mensagem; quem envia é o operador.

**Separador Vencimentos.** Lista as barbearias ativas e suspensas com
`proximo_vencimento` definido (vista `vencimentos_proximos`), por ordem de data,
com: nome, plano, valor com IVA, vencimento, dias que faltam (negativo = em
atraso), estado de pagamento e data do último lembrete. Filtros: **próximos 7
dias** (por omissão), próximos 15, em atraso, todos. O número de vencimentos
próximos aparece como alerta no painel geral.

**Dois botões por linha:**
- **WhatsApp:** prepara a mensagem, abre a conversa por `wa.me` com o texto pronto e regista `ligacao_aberta`. Depois de enviar, o operador carrega em «Confirmei o envio» (`envio_confirmado_manualmente`). Nada é dado como enviado sem a confirmação (CLAUDE.md, regra 7). Sem custo por mensagem.
- **E-mail:** prepara a mensagem e envia-a **no momento do clique** pelo Resend, em nome de `apoio@instabarber.pt`, para o e-mail da barbearia. O resultado fica `enviado` ou `falhou`; um envio falhado pode repetir-se. É um e-mail transacional enviado por uma pessoa, não uma tarefa agendada (D-16).

Antes de enviar, o operador vê o texto e pode editá-lo. O sistema recusa preparar
um lembrete a uma barbearia sem WhatsApp/telefone (no primeiro caso), sem e-mail
(no segundo), cancelada ou sem vencimento. Um lembrete preparado ou falhado pode
cancelar-se; um confirmado ou enviado já não se altera. Cada lembrete guarda o
vencimento a que se refere e liga-se à fatura em aberto, se houver.

**Três textos-modelo** (editáveis em `lib/financas/mensagens.ts`, pt-PT, assinados «InstaBarber · Performa LAB»), escolhidos pelos dias que faltam:

| Quando | Tom | Conteúdo |
| --- | --- | --- |
| Faltam 1 a 7 dias | Aviso amigável | Nome, barbearia, plano, valor com IVA, data de vencimento, formas de pagamento (MB WAY, transferência) |
| Vence hoje | Lembrete curto | O mesmo, com «vence hoje» |
| Em atraso | Amigável e firme | «Venceu em …», pede resposta; segue o escalão da P-09 (até 7 dias, 15 dias, 30 dias) |

O valor vem de `mensalidade.ts`; nunca se escreve à mão. As mensagens são de
serviço (relação contratual B2B) e dispensam consentimento promocional (F.4).

### O.10 · Exportar

- **CSV** (separador `;`, codificação UTF-8 com BOM, para abrir no Excel em Portugal) e **PDF** (jsPDF, identidade da Performa LAB) por mês, trimestre ou ano.
- Conteúdos: resumo do período; recebimentos; custos e contas a pagar; barbearias ativas com plano e mensalidade; objetivo e cumprimento.
- Cada ficheiro diz «Não é documento fiscal» e o período, com valores sem IVA e com IVA em colunas separadas.
- Exportar fica em auditoria.

### O.11 · Segurança e dados pessoais

- As tabelas `custos_plataforma`, `contas_pagar` e `metas_faturacao` só respondem ao super_admin com `aal2`. `lembretes_vencimento` só se lê assim e só se escreve pelas cinco funções, que fazem cumprir os estados. A vista `vencimentos_proximos` devolve zero linhas a qualquer outro papel, incluindo o dono da própria barbearia.
- Os testes cobrem dono, barbeiro, cliente final, visitante e super_admin sem segundo fator, mais as transições de estado e a eliminação da barbearia (que apaga os seus lembretes).
- Dados pessoais: os lembretes contêm o texto enviado ao dono da barbearia. Guardam-se enquanto a barbearia existir e apagam-se com ela (P-18).
- Os valores dos custos não são dados pessoais. Ficheiros de contas (PDF da fatura de um fornecedor), se se guardarem, vão para o bucket privado `comercial`, pasta `financas/`.

### O.12 · Ordem de construção

A **Fase 3C** (fases/fase-3c.md) segue a Fase 3B, porque usa a ficha dos
inquilinos, os recebimentos e a mensalidade, e o Comercial para o canal de
vendas. Por camadas: (1) custos e contas a pagar; (2) Resumo e ponto de
equilíbrio; (3) lembretes de vencimento; (4) objetivo e previsões; (5)
exportação. A camada 3 é a mais útil logo desde o primeiro cliente.


---

## Manual do operador — InstaBarber · Performa LAB

Este manual descreve, passo a passo, tudo o que a Performa LAB faz à mão para
operar o InstaBarber. Foi escrito para que qualquer pessoa com os acessos certos
consiga gerir a plataforma sem depender de quem a construiu.

**Estado:** escrito a 21 de outubro de 2026 a partir da especificação 10.1. Na
Fase 8 é revisto com o sistema real: cada procedimento é feito uma vez, os
passos corrigem-se e acrescentam-se capturas de ecrã. Uma mudança no produto
que mexa num procedimento atualiza este manual no mesmo dia.

### Índice dos procedimentos

| N.º | Procedimento | Quando |
| --- | --- | --- |
| P-01 | Rotina do operador | Diária, semanal, mensal, anual |
| P-02 | Enviar uma proposta e o formulário de adesão | Uma barbearia interessada |
| P-03 | Rever e aprovar um pedido de adesão | Pedido novo no painel |
| P-04 | Pôr a barbearia a funcionar (primeira semana) | Depois da aprovação |
| P-05 | Importar clientes e serviços | A barbearia traz dados de outro sistema |
| P-06 | Ligar e desligar funcionalidades | Pedido da barbearia ou bónus |
| P-07 | Mudar de plano, de periodicidade ou de profissionais | Pedido da barbearia |
| P-08 | Faturar e registar recebimentos | Todos os meses |
| P-09 | Mensalidade em atraso, suspensão e reativação | Pagamento falhado |
| P-10 | Ligar o domínio próprio de uma barbearia | Extra contratado |
| P-11 | Apoio a uma barbearia | Pedido de ajuda |
| P-12 | Pedidos de proteção de dados (RGPD) | E-mail no privacidade@ |
| P-13 | Cópia de segurança semanal | Todas as semanas |
| P-14 | Testar um restauro | Antes do primeiro cliente e a cada três meses |
| P-15 | Carregar os feriados do ano seguinte | Até 1 de dezembro |
| P-16 | Alterar o esquema da base de dados em produção | Nova versão com migração |
| P-17 | Contas de administrador e chaves | Nova pessoa na operação, chave exposta |
| P-18 | Saída de uma barbearia: exportar e eliminar | Cancelamento |
| P-19 | Violação de dados | Suspeita de acesso indevido |
| P-20 | Ativar pagamentos ou faturação (futuro) | Plano dos 50 clientes |
| P-21 | Tratar um lead no Comercial | Pedido do site ou contacto novo |
| P-22 | Preparar e enviar uma proposta (briefing e PDF) | Depois da conversa com a barbearia |
| P-23 | Gerar o contrato, assinar e converter em adesão | Proposta aceite |
| P-24 | Apagar leads antigos | Todos os meses |
| P-25 | Lembrar uma barbearia do vencimento (WhatsApp ou e-mail) | Vencimento nos próximos 7 dias |
| P-26 | Registar custos e contas a pagar, rever o resumo e o objetivo | Todos os meses |
| P-27 | Exportar os números para o contabilista | Fim de cada mês ou trimestre |

---

### P-00 · Antes de começar: acessos e regras

**Acessos de que o operador precisa**, todos guardados no gestor de
palavras-passe da Performa LAB, com acesso de emergência:

| Acesso | Para quê |
| --- | --- |
| Painel de administração (`instabarber.pt/admin`) com 2FA | Quase tudo deste manual |
| Supabase (projeto de produção e projeto de ensaio) | Cópias, restauro, feriados, chaves, contas de administrador |
| Vercel | Domínios, variáveis de ambiente, publicações |
| Zoho Mail (geral@ e alias) | Correio da Performa LAB |
| Resend | Estado dos e-mails transacionais |
| Registador de domínios | instabarber.pt e defensivos |
| Programa de faturação certificado da Performa LAB | Emitir as faturas das mensalidades |
| Disco ou nuvem cifrados (na UE) | Guardar as cópias de segurança |

**Regras de ouro**

1. Nunca partilhar palavras-passe, nem com a barbearia, nem entre operadores. Cada pessoa tem a sua conta com 2FA.
2. Nunca colar a chave de serviço do Supabase em lado nenhum fora do painel da Vercel e do gestor de palavras-passe.
3. Tudo o que se faz no painel de administração fica em auditoria. Escrever sempre a justificação quando o painel a pedir.
4. O endereço de correio segue a natureza da mensagem: comercial@ para propostas, apoio@ para ajuda, privacidade@ para RGPD, geral@ para o resto (L.2).
5. Na dúvida sobre dados de clientes finais, lembrar: a barbearia é a responsável pelo tratamento; a Performa LAB só age por instrução escrita dela.

---

### P-01 · Rotina do operador

| Frequência | Tarefa | Procedimento |
| --- | --- | --- |
| Diária | Pedidos de adesão novos (resposta no próprio dia) | P-03 |
| Diária | Leads novos no Comercial | P-21 |
| Semanal | Leads parados e propostas a expirar | P-21, P-22 |
| Mensal | Apagar leads com mais de 12 meses | P-24 |
| Semanal | Vencimentos dos próximos 7 dias | P-25 |
| Mensal | Custos, contas a pagar, resumo e objetivo | P-26 |
| Mensal | Exportar para o contabilista | P-27 |
| Diária | Alertas do painel geral: atrasos, suspensões, sinais de abandono | P-09, M.2 |
| Diária | Correio do apoio@ e do privacidade@ | P-11, P-12 |
| Semanal | Cópia de segurança externa | P-13 |
| Semanal | Barbearias com pouca utilização: contacto pessoal | M.2 |
| Mensal (dia 1) | Emitir faturas e registar recebimentos | P-08 |
| Mensal | Rever mensalidades em atraso | P-09 |
| Trimestral | Testar um restauro; rever preços e planos | P-14 |
| Anual (até 1 de dezembro) | Feriados do ano seguinte | P-15 |
| Anual | Renovar os domínios; rever os documentos legais | L.3, H.4 |

---

### P-02 · Enviar uma proposta e o formulário de adesão

**Quando:** uma barbearia mostra interesse. **De:** comercial@.

> **Antes da Fase 3B** (módulo Comercial), faz-se à mão como abaixo. **Depois**, o passo 1 faz-se com P-22 e o passo 2 com o convite de adesão de P-23.

1. Enviar a proposta: planos (Basic 19,99 €, Pro 39 €, com e sem IVA), plano anual (dez mensalidades), extra de domínio próprio, o que inclui cada plano (grelha D.3) e que não há comissões nem custos por mensagem.
2. Quando o dono aceitar, enviar a ligação do formulário: `instabarber.pt/adesao`.
3. Juntar ao e-mail a lista do que convém ter à mão: logótipo com fundo transparente (PNG ou SVG, mínimo 512 × 512 px), fotografia da fachada, lista de serviços com duração e preço, nomes e e-mails dos barbeiros, e o ficheiro de clientes se vier de outro sistema (P-05).

**Confirmar:** o pedido aparece no separador Pedidos quando o dono o enviar.

---

### P-03 · Rever e aprovar um pedido de adesão

**Quando:** chega o e-mail «Nova adesão» ao geral@ ou o pedido aparece no painel.

1. Abrir `Admin → Pedidos` e o pedido pendente.
2. **Verificar os dados:** nome, NIF (nove dígitos), morada, telefone e WhatsApp, horário, serviços (duração e preço), equipa (nomes e e-mails válidos).
3. **Verificar as imagens:** logótipo com fundo transparente e legível em círculo; fachada em 16:9. Se o logótipo tiver fundo branco, pedir uma versão transparente antes de aprovar (ou aprovar e trocar depois no separador Marca).
4. **Verificar a mensalidade:** plano, periodicidade e número de profissionais; o valor tem de bater com os exemplos da D.5.
5. **Escolher o endereço (slug):** curto, minúsculas, sem acentos, com hífenes (`barbearia-central`). O sistema recusa slugs reservados.
6. Decidir:
   - **Aprovar** — cria a barbearia, aplica o pacote, cria a conta do dono e envia-lhe o e-mail de boas-vindas.
   - **Ajustar** — abre a ficha completa para corrigir antes de aprovar.
   - **Rejeitar** — escrever o motivo (obrigatório); o dono recebe a resposta por e-mail.
7. Ver a preferência de pagamento no cartão do pedido e responder como indicado (P-08).

**Confirmar:** a barbearia aparece em `Admin → Barbearias` como ativa; a página pública abre em `instabarber.pt/<slug>`; o dono recebeu o e-mail (ver no Resend se não chegar).

**Se correr mal:** o dono não recebeu o e-mail → verificar o endereço no pedido, ver o estado no Resend e reenviar a ligação de definição de palavra-passe a partir da ficha.

---

### P-04 · Pôr a barbearia a funcionar (primeira semana)

1. Ligar ao dono no dia da aprovação (cinco minutos): confirmar que entrou e definiu a palavra-passe.
2. Na ficha, confirmar a cor da capa, o horário, os dias de descanso e o intervalo de almoço.
3. Se a barbearia trouxer clientes de outro sistema, importá-los (P-05).
4. Pedir ao dono que registe os barbeiros na Gestão do sistema (cada um recebe um convite por e-mail). Confirmar dois dias depois que todos entraram; senão, «Reenviar convite».
5. Gravar e enviar o vídeo de boas-vindas com o painel da própria barbearia (M.5).
6. Pedir ao dono que preencha a ligação de avaliação no Google e a do Livro de Reclamações eletrónico (Gestão do sistema → Ligações).
7. Ao fim de sete dias, ver se há marcações e se o painel foi aberto. Se não, ligar.

---

### P-05 · Importar clientes e serviços

**Quando:** a barbearia vem do Booksy, Fresha ou de outro sistema.

1. Pedir ao dono a exportação de clientes do sistema antigo, em CSV.
2. Preparar o ficheiro de clientes com estas colunas, nesta ordem: `nome`, `telemovel`, `email`, `data_nascimento` (AAAA-MM-DD), `notas`. O telemóvel pode vir com ou sem +351.
3. Preparar o de serviços: `nome`, `duracao_min`, `preco` (preço final ao cliente, com vírgula ou ponto).
4. `Admin → Barbearias → <barbearia> → Importação`: carregar o ficheiro e ver a pré-visualização.
5. Rever as linhas com erro (telemóvel inválido, duplicado). Corrigir no ficheiro e voltar a carregar, ou seguir só com as válidas.
6. Gravar.

**Atenção:** os clientes importados ficam **sem consentimento** para mensagens promocionais, mesmo que o tivessem no sistema antigo: o consentimento não se transfere. Recebem lembretes de marcação; para campanhas, o consentimento dá-se na próxima marcação.

**Confirmar:** o número de clientes na barbearia bate com o ficheiro, menos os rejeitados.

---

### P-06 · Ligar e desligar funcionalidades

**Quando:** a barbearia pede uma funcionalidade, ou a Performa LAB oferece um bónus.

1. `Admin → Funcionalidades`, escolher a barbearia.
2. Marcar ou desmarcar a funcionalidade. Fora do plano, fica como **bónus** (realce dourado) e não muda o preço.
3. A `multilinguagem` não está em nenhum plano: liga-se sempre aqui.
4. «Guardar alterações». Para voltar ao plano contratado, «Repor pacote».

**Confirmar:** o resumo lateral mostra o estado certo; a alteração aparece na auditoria.

---

### P-07 · Mudar de plano, de periodicidade ou de profissionais

**Basic para Pro**

1. Ficha da barbearia → Pagamentos: plano «Pro», profissionais contratados (mínimo 2).
2. `Admin → Funcionalidades` → «Repor pacote».
3. Avisar o dono do novo valor e de que já pode registar o segundo barbeiro.

**Pro para Basic**

1. Combinar com o dono qual o profissional que fica.
2. Na Gestão do sistema da barbearia (vista de apoio, ou pelo dono), desativar os restantes. As marcações futuras deles ficam «sem profissional» para o dono reatribuir.
3. Ficha → Pagamentos: plano «Basic», profissionais contratados 1. O sistema recusa enquanto houver mais de um ativo.
4. «Repor pacote».

**Mais um profissional no Pro:** aumentar os profissionais contratados; a mensalidade recalcula (+10 € por mês).

**Mensal para anual, ou o contrário:** mudar a periodicidade e ajustar a data do próximo vencimento.

**Confirmar:** a mensalidade no painel bate com a D.5; a alteração está na auditoria.

---

### P-08 · Faturar e registar recebimentos

**Quando:** no dia 1 de cada mês (mensais) e nos vencimentos anuais.

1. `Admin → Pagamentos`: ver as barbearias com vencimento no mês e o valor de cada uma.
2. No **programa de faturação certificado da Performa LAB** (fora da plataforma), emitir a fatura de cada uma com o valor com IVA.
3. Na plataforma, registar a fatura: número (o do programa certificado), período, valor e data.
4. Pedir o pagamento segundo a preferência de cada barbearia: pedido MB WAY para o número indicado, IBAN por e-mail (geral@) ou entrega em mão.
5. Quando o dinheiro entrar, registar o recebimento: data, método, valor e a fatura a que corresponde. O estado passa a «em dia».

**Nunca** emitir faturas pela plataforma: ela não é programa certificado (H.3).

---

### P-09 · Mensalidade em atraso, suspensão e reativação

1. **Até 7 dias de atraso:** lembrete amigável por e-mail (apoio@), com o IBAN ou novo pedido MB WAY. Marcar «em atraso». (A partir da Fase 3C, usar o P-25.)
2. **15 dias:** chamada telefónica.
3. **30 dias:** aviso escrito de suspensão, com a data.
4. **Suspender:** ficha → ação rápida «Suspender». A equipa deixa de ver os dados; o dono continua a ver «O meu plano»; a página pública mostra «Temporariamente indisponível para marcações». Os dados ficam intactos.
5. **Reativar:** quando o pagamento entrar, registar o recebimento e «Reativar». Tudo volta como estava.
6. **12 meses suspensa sem contacto:** aviso escrito e, sem resposta, seguir a P-18.

---

### P-10 · Ligar o domínio próprio de uma barbearia

**Quando:** a barbearia contrata o extra (5,00 € por mês sem IVA). Cerca de 15 minutos.

1. A barbearia compra o domínio em nome dela (ex.: `barbeariaexemplo.pt`).
2. No painel da **Vercel**, projeto InstaBarber → Domínios → adicionar `barbeariaexemplo.pt` e `www.barbeariaexemplo.pt`. A Vercel mostra os registos DNS a criar.
3. Enviar à barbearia (ou criar por ela, com o acesso dela) os registos, no painel do registador:
   - raiz (`@`): registo **A** com o endereço IP indicado pela Vercel;
   - `www`: registo **CNAME** com o destino indicado pela Vercel.
   Nunca CNAME na raiz.
4. Esperar que a Vercel mostre o domínio como válido e o HTTPS emitido (minutos a algumas horas).
5. No **Supabase** → Authentication → URL Configuration: acrescentar `https://barbeariaexemplo.pt/**` aos endereços autorizados.
6. No painel de administração → ficha → Identidade: escrever o domínio e ligar o extra. A mensalidade recalcula.
7. Testar: abrir o domínio, ver a página pública, entrar como cliente de ensaio e como dono.

**Para desligar:** retirar o domínio da ficha (o extra sai), da Vercel e do Supabase.

---

### P-11 · Apoio a uma barbearia

**Nível 1 — utilização**

| Pedido | Resposta |
| --- | --- |
| O dono ou um barbeiro esqueceu-se da palavra-passe | Ecrã de entrada → «Esqueci-me da palavra-passe»: recebe uma ligação por e-mail. Nunca definir a palavra-passe por ele |
| Um barbeiro não recebeu o convite | Gestão do sistema → Equipa → «Reenviar convite»; ver o estado no Resend |
| Um cliente não recebe o código de acesso | O código aparece no Início da barbearia, em «Pedidos de acesso»; alguém tem de carregar em «Enviar código por WhatsApp» nos 15 minutos |
| Um cliente quer escolher a palavra-passe | Número novo: na primeira marcação. Número com ficha: pede o código na área de cliente |
| Um cliente foi bloqueado por faltas | Ficha do cliente → «Voltar a permitir marcação online» |
| «Não sei fazer X» | Vídeo de um minuto da página de ajuda, ou chamada de cinco minutos |

**Nível 2 — configuração:** horário, mais um profissional, mudança de plano → P-06, P-07, ou a ficha da barbearia.

**Nível 3 — técnico** (marcação duplicada, erro ao gravar, dados em falta):

1. Abrir a **vista de apoio** da barbearia (ficha → «Vista de apoio»): escrever a justificação; só leitura, 30 minutos, fica em auditoria.
2. Reproduzir o problema e ver a auditoria.
3. Registar o caso (data, barbearia, descrição, causa, correção) e passar a correção ao desenvolvimento.
4. Dizer ao dono o que aconteceu e o que foi feito.

Um problema de nível 3 num sábado à noite passa à frente de tudo.

---

### P-12 · Pedidos de proteção de dados (RGPD)

**Quando:** chega um pedido ao privacidade@ ou a uma barbearia. Prazo de resposta ao titular: **um mês** (RGPD, art. 12.º, n.º 3).

1. **Identificar quem é o responsável.** Para dados de clientes finais, é a barbearia: reencaminhar-lhe o pedido no próprio dia e oferecer ajuda. Para dados da própria barbearia (dono, faturas), é a Performa LAB.
2. **Acesso ou portabilidade:** a barbearia vê tudo na ficha do cliente; se precisar de um ficheiro, a Performa LAB exporta só esse cliente (ficha, marcações, visitas, selos) a pedido escrito da barbearia.
3. **Eliminação:** a barbearia faz «Anonimizar cliente» na ficha. Por instrução escrita da barbearia, o operador pode fazê-lo pela vista de apoio. Os registos financeiros ficam, anonimizados.
4. **Oposição a mensagens:** marcar «Não contactar» na ficha.
5. Registar o pedido, a data, a resposta e a data da resposta.

---

### P-13 · Cópia de segurança semanal

**Quando:** todas as semanas, e sempre antes de uma alteração ao esquema (P-16). Cerca de 10 minutos. O Supabase Pro já faz cópias diárias (7 dias); esta é a cópia **fora** do Supabase, guardada 30 dias.

**Precisa de:** a CLI do Supabase instalada no computador do operador e a ligação à base de dados de produção (Supabase → Connect → «Session pooler»), guardada no gestor de palavras-passe.

1. Num terminal, numa pasta com a data (ex.: `copia-2026-11-02`):

   ```bash
   supabase db dump --db-url "$URL_PRODUCAO" -f roles.sql --role-only
   supabase db dump --db-url "$URL_PRODUCAO" -f schema.sql
   supabase db dump --db-url "$URL_PRODUCAO" -f data.sql --use-copy --data-only
   ```

2. **Ficheiros do Storage** (logótipos, galerias, portfólios, fichas técnicas): o `db dump` não os inclui. Descarregar os buckets `publico` e `fichas` com `supabase storage cp` (comando experimental da CLI) ou pelo painel do Supabase.
3. Comprimir a pasta num ficheiro cifrado com palavra-passe forte (guardada no gestor de palavras-passe).
4. Guardar no disco ou na nuvem cifrados da Performa LAB, na UE.
5. Apagar as cópias com mais de 30 dias.

**Confirmar:** os três ficheiros têm tamanho maior do que zero e o `data.sql` cresce de semana para semana. Registar a data da cópia.

**A cópia contém dados pessoais:** nunca por e-mail, nunca em pastas partilhadas sem cifra.

---

### P-14 · Testar um restauro

**Quando:** antes do primeiro cliente real, e depois a cada três meses. Uma cópia que nunca foi restaurada não é uma cópia.

1. Usar o **projeto de ensaio** do Supabase (nunca o de produção).
2. Decifrar a cópia mais recente (P-13).
3. Restaurar:

   ```bash
   psql --single-transaction --variable ON_ERROR_STOP=1 \
     --file roles.sql --file schema.sql \
     --command 'SET session_replication_role = replica' \
     --file data.sql --dbname "$URL_ENSAIO"
   ```

4. Verificar: número de barbearias, clientes e marcações igual ao da produção; RLS ativo em todas as tabelas; entrar como uma barbearia de ensaio.
5. Registar a data, o tempo que demorou e qualquer problema. Limpar o projeto de ensaio no fim.

---

### P-15 · Carregar os feriados do ano seguinte

**Quando:** até 1 de dezembro de cada ano. A base de dados já tem 2026, 2027 e 2028.

1. Supabase → SQL Editor (projeto de produção).
2. Inserir os 13 feriados nacionais obrigatórios. Três mudam com a Páscoa: Sexta-feira Santa (Páscoa − 2 dias), Páscoa, e Corpo de Deus (Páscoa + 60 dias).

   | Ano | Sexta-feira Santa | Páscoa | Corpo de Deus |
   | --- | --- | --- | --- |
   | 2029 | 30/03 | 01/04 | 31/05 |
   | 2030 | 19/04 | 21/04 | 20/06 |
   | 2031 | 11/04 | 13/04 | 12/06 |
   | 2032 | 26/03 | 28/03 | 27/05 |

   ```sql
   insert into feriados (inquilino_id, data, nome) values
     (null, '2029-01-01', 'Ano Novo'),          (null, '2029-03-30', 'Sexta-feira Santa'),
     (null, '2029-04-01', 'Páscoa'),            (null, '2029-04-25', 'Dia da Liberdade'),
     (null, '2029-05-01', 'Dia do Trabalhador'), (null, '2029-05-31', 'Corpo de Deus'),
     (null, '2029-06-10', 'Dia de Portugal'),   (null, '2029-08-15', 'Assunção de Nossa Senhora'),
     (null, '2029-10-05', 'Implantação da República'), (null, '2029-11-01', 'Dia de Todos os Santos'),
     (null, '2029-12-01', 'Restauração da Independência'), (null, '2029-12-08', 'Imaculada Conceição'),
     (null, '2029-12-25', 'Natal');
   ```

3. Lembrar às barbearias, por e-mail, que acrescentem o feriado municipal e o Carnaval se fecharem (Gestão do sistema → Ausências e feriados).

**Confirmar:** `select count(*) from feriados where inquilino_id is null and extract(year from data) = 2029;` devolve 13.

---

### P-16 · Alterar o esquema da base de dados em produção

**Quando:** uma nova versão traz uma migração.

1. Confirmar que a alteração entrou primeiro em `docs/esquema/` e que os testes SQL passam no projeto de ensaio.
2. Fazer a cópia de segurança (P-13) e confirmar os ficheiros.
3. Escolher a hora de menor uso (por exemplo, segunda-feira de manhã cedo, quando a maioria das barbearias está fechada).
4. Aplicar a migração (`npm run db:migrate` contra a produção).
5. Confirmar: RLS ativo em todas as tabelas; entrar como barbearia de ensaio e fazer uma marcação.
6. Se algo correr mal: parar, avisar as barbearias se houver impacto, e restaurar a partir da cópia (P-14, agora na produção).

---

### P-17 · Contas de administrador e chaves

**Nova pessoa na operação**

1. Supabase → Authentication → criar o utilizador com o e-mail da pessoa.
2. SQL Editor: `insert into perfis (user_id, papel, nome) values ('<id do utilizador>', 'super_admin', '<nome>');`
3. A pessoa entra, define a palavra-passe e **ativa o 2FA** (aplicação de autenticação). Sem 2FA, não vê nada.
4. Dar-lhe acesso ao gestor de palavras-passe só com o que precisa.

**Pessoa que sai:** `update perfis set ativo = false where user_id = '<id>';` e retirar-lhe os acessos externos (Vercel, Supabase, Zoho, gestor de palavras-passe).

**Chave exposta** (chave de serviço num e-mail, num repositório, num ecrã partilhado):

1. Supabase → definições da API: gerar uma chave nova e revogar a antiga.
2. Vercel → variáveis de ambiente: substituir `SUPABASE_SERVICE_ROLE_KEY` e publicar outra vez.
3. Atualizar o `.env.local` de quem desenvolve.
4. Ver a auditoria e os registos do Supabase à procura de uso indevido; se houver, seguir a P-19.

---

### P-18 · Saída de uma barbearia: exportar e eliminar

**Quando:** a barbearia cancela, ou ao fim de 12 meses suspensa sem contacto (P-09).

1. **Cancelar:** ficha → ação rápida «Cancelar». A página pública e o painel deixam de funcionar.
2. **Exportar:** ficha → «Exportar dados». Gera um ficheiro comprimido com os CSV de clientes, marcações, visitas, serviços, equipa, financeiro, clube e loja.
3. **Entregar** o ficheiro ao dono por ligação segura (cifrada, com prazo), nunca em anexo simples. Registar a data da entrega.
4. **Esperar o prazo** combinado no Acordo de Subcontratação (por omissão, 30 dias depois da entrega), para o dono confirmar que recebeu tudo.
5. **Eliminar:** ficha → «Eliminar definitivamente». O painel pede o slug da barbearia como confirmação, chama `eliminar_inquilino()` e apaga a seguir as contas de autenticação que ficaram sem uso.
6. **Storage:** apagar as pastas da barbearia nos buckets `publico` e `fichas`.
7. **Domínio próprio**, se existia: retirá-lo da Vercel e do Supabase (P-10).
8. Registar a eliminação (data, quem, o que foi apagado). As cópias de segurança antigas apagam-se sozinhas ao fim de 30 dias (P-13).

---

### P-19 · Violação de dados

Seguir a M.6. Resumo para o operador:

1. **Conter já:** revogar chaves (P-17), suspender contas suspeitas, fechar a exposição.
2. **Registar:** hora da descoberta, o que se sabe, quem descobriu.
3. **Avaliar:** que dados, de que barbearias, quantas pessoas, que risco.
4. **Informar as barbearias afetadas sem demora** (privacidade@): elas são as responsáveis e têm 72 horas para notificar a CNPD. Dar-lhes toda a informação.
5. Corrigir a causa e registar o que mudou.

---

### P-20 · Ativar pagamentos ou faturação (futuro)

**Quando:** no plano dos 50 clientes (M.7), e só depois do parecer do contabilista.

1. Escolher o fornecedor de pagamentos e assinar o contrato; cada emitente abre a sua conta no programa de faturação.
2. Colar as chaves do fornecedor no painel da Vercel e publicar.
3. `Admin → Módulos`: ligar o interruptor geral (o painel diz se falta alguma chave).
4. Ligar o módulo para uma barbearia piloto; acompanhar uma semana.
5. Só depois, alargar às outras, uma a uma.

---

### P-21 · Tratar um lead no Comercial

**Quando:** chega o e-mail «Novo pedido de contacto» ao comercial@, ou há alguém novo para registar. **Disponível a partir da Fase 3B.**

1. Abrir `Admin → Comercial → Leads` e o lead novo (ou criar um à mão: nome, barbearia, telefone ou e-mail, origem).
2. Responder no próprio dia (pelo telefone, WhatsApp ou comercial@) e registar na ficha o que foi dito: nota, chamada ou mensagem. Definir a **próxima ação** e a data.
3. Mudar o estado: Novo → Contactado → Demonstração → Proposta. Perdido pede sempre o motivo.
4. À semana, abrir o Funil e tratar os cartões com a ação vencida e as propostas a expirar.

**Confirmar:** o lead tem estado, último contacto e próxima ação atualizados.

---

### P-22 · Preparar e enviar uma proposta (briefing e PDF)

**Quando:** depois da conversa com a barbearia. **De:** comercial@.

1. Na ficha do lead, abrir o **Briefing** e preencher os sete passos (N.4) durante ou logo a seguir à conversa. Os números do passo 3 são estimativas e assim aparecem na proposta.
2. Conferir o plano recomendado e o preço (com e sem IVA) no passo 5. Se a barbearia é piloto, escrever as condições de lançamento no passo 6.
3. **Gerar proposta**, abrir o PDF e ler-o inteiro (nome, NIF, valores, validade).
4. Enviar o PDF por e-mail ou WhatsApp (o ecrã dá o texto pronto) e carregar em **Marcar como enviada**: só então começa a validade.
5. Quando a barbearia responder, marcar **Aceite** ou **Recusada** (com motivo). Se for preciso mudar algo, gerar uma versão nova: a enviada nunca se edita.

**Confirmar:** a proposta está «enviada» com a data de validade e o lead no estado Proposta.

---

### P-23 · Gerar o contrato, assinar e converter em adesão

**Quando:** a proposta foi aceite. **Pré-requisito:** existe um modelo de contrato **aprovado** (N.8) com parecer jurídico.

1. Na proposta aceite, **Gerar contrato**. Confirmar firma, NIF, morada e representante da barbearia.
2. Abrir o PDF, ler-o e enviá-lo; **Marcar como enviado**.
3. Assinar fora do sistema (Chave Móvel Digital ou impressão e digitalização). Receber o PDF assinado.
4. **Registar assinatura**: data e PDF assinado. O lead passa a Ganho.
5. **Criar convite de adesão** e enviar a ligação ao dono: o formulário abre preenchido e ele completa o resto.
6. Quando o pedido chegar, seguir o P-03. Na aprovação, o contrato fica ligado à barbearia.

**Confirmar:** contrato «assinado» com PDF, lead «ganho», pedido de adesão ligado ao contrato.

---

### P-24 · Apagar leads antigos

**Quando:** todos os meses, no dia 1. **Disponível a partir da Fase 3B.**

1. Em `Admin → Comercial → Leads`, filtrar por «sem contacto há mais de 12 meses» e confirmar que nenhum tem contrato.
2. Executar **Apagar leads inativos (12 meses)** e anotar quantos foram apagados.
3. Para um pedido de apagamento de um lead, ver o P-12.

**Confirmar:** o número apagado está registado na auditoria.

---

### P-25 · Lembrar uma barbearia do vencimento (WhatsApp ou e-mail)

**Quando:** uma vez por semana, ou quando o alerta do painel geral mostrar vencimentos próximos. **Disponível a partir da Fase 3C.**

1. `Admin → Finanças → Vencimentos`: o filtro «próximos 7 dias» mostra quem vence; «em atraso» mostra quem já venceu.
2. Escolher a barbearia e ler o texto proposto (muda com os dias que faltam). Corrigir o que for preciso.
3. **WhatsApp:** carregar em «WhatsApp», enviar a mensagem na conversa que abre e voltar para carregar em «Confirmei o envio».
4. **E-mail:** carregar em «E-mail». O sistema envia de apoio@ no momento e mostra «enviado» ou «falhou». Se falhar, tentar de novo ou usar o WhatsApp.
5. Em atraso, seguir os escalões da P-09 (7 dias, 15 dias, 30 dias com aviso escrito).
6. Quando o dinheiro entrar, registar o recebimento (P-08).

**Confirmar:** a linha mostra a data do último lembrete e o estado «confirmado» ou «enviado». Sem WhatsApp ou e-mail na ficha da barbearia, o sistema recusa: completar a ficha primeiro.

---

### P-26 · Registar custos e contas a pagar, rever o resumo e o objetivo

**Quando:** no início de cada mês. **Disponível a partir da Fase 3C.**

1. `Admin → Finanças → Custos e contas`: confirmar os custos fixos ativos e acrescentar os novos (valor **sem IVA**, em euros).
2. Carregar em «Gerar as contas do próximo mês» e conferir os valores com as faturas dos fornecedores.
3. Registar a data de pagamento das contas pagas.
4. Abrir o **Resumo**: ler receita recorrente, custos, lucro estimado e lucro de caixa; verificar o que está em atraso.
5. Em **Objetivo e previsões**: definir ou ajustar o objetivo do mês, rever os pressupostos e anotar quantas barbearias faltam.

**Confirmar:** nenhuma conta vencida por pagar sem motivo, e a meta do mês definida.

---

### P-27 · Exportar os números para o contabilista

**Quando:** no fim de cada mês ou trimestre. **Disponível a partir da Fase 3C.**

1. `Admin → Finanças → Exportar`, escolher o período.
2. Descarregar o CSV (abre no Excel) e o PDF de resumo.
3. Enviar ao contabilista por e-mail (geral@). Os ficheiros dizem «Não é documento fiscal»: as faturas continuam a ser as do programa certificado.

**Confirmar:** a exportação aparece na auditoria.


---

## Anexo · Esquema da base de dados

O SQL completo está em `docs/esquema/` (01 a 04) e não se reproduz aqui.
