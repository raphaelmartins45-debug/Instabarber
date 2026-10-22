# Fase 0 — Preparação

| | |
| --- | --- |
| **Foco** | Preparação |
| **Resultado verificável** | Repositório com o `package.json` da B.3, `npm audit` sem vulnerabilidades altas, `.env*` no `.gitignore`, deploy em branco na Vercel. |
| **Dias estimados** | 2 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-b-arquitetura-tecnica.md` — B.1 a B.5
- `docs/parte-l-publicacao-dominios-e-custos.md` — L.2

## Preciso de ti nesta fase

- A chave do Resend (`RESEND_API_KEY`) no `.env.local`, e o domínio `instabarber.pt` verificado no Resend, com os registos SPF e DKIM no DNS. Sem isto não há e-mail de aviso: paro e peço.
- `EMAIL_COMERCIAL=comercial@instabarber.pt` e `EMAIL_REMETENTE` no `.env.local`. O telefone comercial (`TELEFONE_COMERCIAL`, `TELEFONE_COMERCIAL_TXT`) está em `dados-locais/contactos.env`: copiar também para o `.env.local`. É o número da landing (`PHONE`) e o das propostas.

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] Projeto Next.js 15.5 (App Router) com o `package.json` exato da B.3; `npm audit`.
- [ ] TypeScript estrito, ESLint 9 (`eslint .`), Prettier, Tailwind 4 com `@tailwindcss/postcss`, shadcn/ui inicializado.
- [ ] A estrutura de pastas da B.4, só com os ficheiros que já têm conteúdo (nada vazio por antecipação).
- [ ] `lib/supabase/browser.ts`, `servidor.ts` e `servico.ts` (este com `import "server-only"`).
- [ ] `.env.example` e `.gitignore` da L.2 (com `dados-locais/`), confirmados antes do primeiro commit. Copiar `dados-locais/prestadora.env` para o `.env.local`.
- [ ] `middleware.ts` mínimo que deixa passar tudo (a resolução do inquilino é da Fase 2).
- [ ] Vitest e Playwright configurados, com um teste de exemplo de `lib/formatacao`.
- [ ] `scripts/testar-sql.sh` e `scripts/gerar-mestre.sh`.
- [ ] Manter `public/marca/` (D-35) e ligar o favicon (`favicon-32.png`, `ib-180.png`) no layout da raiz.
- [ ] **Rota de contacto da landing** (`app/api/contacto/route.ts`, D-46): aceita duas fases (D-50): a fase 1 (nome completo, telemóvel português e e-mail obrigatórios) devolve uma `ref`; a fase 2 (distrito, cidade, barbearia, barbeiros, dificuldade, `calculadora`, todos opcionais, máx. 300 caracteres no resumo da calculadora) usa essa `ref`. Valida com Zod, com tamanhos máximos, descarta pedidos com o campo `website` preenchido (honeypot), envia o aviso para `EMAIL_COMERCIAL` pelo Resend (remetente `EMAIL_REMETENTE`, `reply-to` o e-mail do visitante, se houver) e responde `ok`; se o Resend falhar, responde erro (a landing mostra «Não conseguimos enviar» e o botão de WhatsApp). Sem base de dados nesta fase: não grava, e o limite por IP fica para a camada 1A da Fase 3B (`consumir_limite`). Testes Vitest com o Resend simulado. Cerca de duas horas, dentro dos 2 dias.
- [ ] Contadores de medição no servidor, sem cookies nem IP guardado (visitas, abertura da calculadora, cliques em «Continuar»; D-50).
- [ ] Resposta automática por e-mail ao visitante, com a referência do pedido (remetente apoio@).
- [ ] Na landing, pôr `ENDPOINT = "/api/contacto"` e retirar o modo de demonstração; o formulário passa a mostrar «Pedido enviado» só quando a rota responde `ok`.
- [ ] Deploy na Vercel com a página de apresentação de `landing/index.html` no domínio principal (D-34), sem tocar na lógica das fases seguintes. Ajustar a Política de Privacidade da landing: o pedido de contacto passa a ser enviado ao comercial por e-mail e conservado na caixa de correio (a gravação no CRM, com os 12 meses, é da Fase 3B).

## Verificação

- [ ] `npm audit`: zero vulnerabilidades altas ou críticas.
- [ ] `typecheck`, `lint`, `test` e `build` sem erros.
- [ ] Endereço do deploy a responder.
- [ ] Um pedido de teste feito na landing chega a comercial@ com todos os dados, e o formulário mostra «Pedido enviado». Com a chave do Resend errada, mostra «Não conseguimos enviar» e o botão de WhatsApp.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
