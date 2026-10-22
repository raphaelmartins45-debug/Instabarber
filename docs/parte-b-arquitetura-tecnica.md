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
