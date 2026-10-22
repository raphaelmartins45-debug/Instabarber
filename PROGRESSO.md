# PROGRESSO.md — InstaBarber

Estado real de cada fase. Atualizado pelo Claude Code no fim de cada fase.
Uma fase só passa a **Concluída** quando o resultado verificável foi observado
e o dono confirmou. Estados: Pendente · Em curso · Concluída.

## Especificação

| Versão | Data | Estado | Verificação |
| --- | --- | --- | --- |
| 10.1 | 21/10/2026 | Concluída | Esquema aplicado num PostgreSQL 16.15 limpo; 201 testes SQL a passar (81 isolamento, 54 agenda, 66 regras) |
| 10.2 | 21/10/2026 | Concluída | Módulo Comercial (Parte N) no esquema; 307 testes SQL a passar (201 anteriores + 106 comerciais) |
| 10.3 | 21/10/2026 | Concluída | Finanças da Performa LAB (Parte O) no esquema; 383 testes SQL a passar (307 anteriores + 76 de finanças) |
| 10.4 | 21/10/2026 | Concluída | Regime de IVA da Prestadora (D-45): `propostas.iva_taxa`; 389 testes SQL a passar (+6) |
| 10.5 | 21/10/2026 | Concluída | Parte P (roteiro de expansões, dormente); `inquilinos.pais/fuso/moeda/idioma`; 396 testes SQL a passar (+7) |

## Fases

| Fase | Foco | Estado | Concluída em | Resultado verificado |
| --- | --- | --- | --- | --- |
| 0 | Preparação | Concluída | 22/10/2026 | Código a 22/10/2026: typecheck, lint e build sem erros; 27 testes Vitest, 6 Playwright (computador e telemóvel), 396 testes SQL; `npm audit --omit=dev` 0. Deploy Next.js na Vercel em produção (instabarber.pt); pedido de teste real chegou a comercial@ e a resposta chegou ao visitante (e-mail timbrado, D-101 a D-104); com a chave do Resend errada aparece «Não conseguimos enviar». Depois disso: builds da Vercel verdes em cada alteração (e-mail, SEO, ícones); os testes Vitest não foram repetidos desde o e-mail timbrado e correm-se no início da Fase 1. Por limpar: campo `calculadora` e respetivo evento de medição na rota de contacto |
| 1 | Base de dados | Concluída | 22/10/2026 | **Supabase local** (PostgreSQL 17.11, D-110): migrações 01 a 04 aplicadas sem erros; RLS ativo nas 59 tabelas de `public`; 396 testes SQL a passar (81 isolamento, 54 agenda, 66 regras, 112 comercial, 76 finanças, 7 expansão), um deles corrigido com autorização do dono (D-108); antes, o mesmo em 15.19 e em 16.15 com o shim. **Projeto de ensaio** `instabarber-ensaio` (PostgreSQL 17.11, eu-west-2 por decisão do dono, D-111): as mesmas migrações aplicadas, RLS em 59 de 59, buckets `publico` público, `fichas` e `comercial` privados, 31 funcionalidades e 39 feriados carregados, 396 testes SQL a passar. `types/database.ts` gerado (igual em 15 e 17); primeiros repositórios só de leitura (D-109). typecheck, lint e build sem erros; 38 testes Vitest (5 de integração com o Supabase local); `npm audit --omit=dev` 0. Confirmada pelo dono a 22/10/2026 |
| 2 | Autenticação e papéis | Concluída | 22/10/2026 | Supabase local (PostgreSQL 17): **30 testes Playwright** a passar (15 cenários × computador e telemóvel, duas corridas seguidas): o anónimo é encaminhado para a entrada certa; gestor, barbeiro, super_admin e cliente entram cada um no seu painel; `/admin` num subdomínio responde 404 sem redirecionar; super_admin sem segundo fator fica na verificação e com TOTP entra; convite do barbeiro de ponta a ponta (e-mail no Mailpit, palavra-passe definida, ligação de uso único); código de acesso do cliente certo, errado e expirado; conta em duas barbearias com escolha e troca; menu sem a Loja no Basic. 70 testes Vitest (5 de integração); 396 testes SQL; typecheck, lint e build sem erros; `npm audit --omit=dev` 0 (só a exceção do `braces`, D-98). Sem rolagem lateral a 390 px nos ecrãs novos. Ensaio: Auth configurado (SMTP do Resend, TOTP, registo fechado, modelos em português) e conta do super_admin criada sem palavra-passe (D-115). Variáveis do ensaio na Vercel (Preview) e pré-visualização publicada; e-mail de palavra-passe do super_admin enviado pelo Resend. Confirmada pelo dono a 22/10/2026 |
| 3 | Administração e adesão | Concluída (por confirmar) | 22/10/2026 | Supabase local: **32 testes Playwright** (16 cenários × computador e telemóvel), incluindo o resultado verificável — adesão em quatro passos com logótipo e resumo em PDF, aprovação pelo super_admin com 2FA (barbearia ativa, pacote, serviços, conta do dono), mensalidade Pro com 4 profissionais 60,27 € (D.5), entrada do dono no painel, importação CSV (2 válidas, 1 com erro), exportação ZIP e vista de apoio; o fluxo completo demora cerca de 10 segundos. **412 testes SQL** no local e no ensaio (migração 05, D-116); 112 testes Vitest, mais 5 de integração com o Supabase local (mensalidade com os exemplos da D.5); typecheck, lint e build sem erros. Documentos legais publicados (D-117). Dados da Prestadora no `.env.local`: as três páginas legais respondem 200 com nome, NIF e morada. **Falta:** pendentes 1 e 2 |
| 3B | Comercial (CRM, propostas e contratos) | Adiada | — | Por ordem do dono, a Fase 4 avança primeiro (D-120; pendente 3) |
| 3C | Finanças da Performa LAB | Adiada | — | Como a 3B (D-120) |
| 4 | Painel da barbearia | Em curso | — | — |
| 5 | Motor de agenda e cliente | Pendente | — | — |
| 6 | Mensagens, filas, loja, relatório e módulos desligados | Pendente | — | — |
| 7 | Publicação | Pendente | — | — |
| 8 | Operação | Pendente | — | — |
| 9 | Manuais operacionais (final) | Pendente | — | — |

## Trabalho paralelo (fora das fases)

| Trabalho | Estado | Data | Verificação |
| --- | --- | --- | --- |
| Landing page (`landing/index.html`) | Fechada (servida pelo Next.js desde a Fase 0, D-99) | 21/10/2026 | Versão 27 publicada; auditoria 0 problemas; sem rolagem horizontal em 1440 px e 390 px (mobile automático); sem «ao vivo» (D-65), sem rótulos de exemplo nos ecrãs (D-66) |
| Instagram: imagens, reels, legendas, voz | Entregue ao criativo (conversa própria) | 21/10/2026 | `marketing/instagram/` + `InstaBarber-Kit-Redes-Sociais.zip`; regras em CLAUDE.md secções 11 e 12; D-61 a D-70 |
| Estrutura de pastas do negócio | Entregue | 21/10/2026 | `InstaBarber-Estrutura-de-Pastas.zip` |
| Ícone do atalho no iPhone | Por resolver | 22/10/2026 | O favicon do separador mostra o «IB» novo, mas «Adicionar à Tela de Início» no iOS continua com o ícone antigo, mesmo depois de nomes novos (`ib-180.png`, D-107). Voltar a isto para replicar a solução nos ícones dos painéis (gestor, barbeiro, cliente). Nos painéis e nas páginas públicas das barbearias o ícone e o manifesto têm de ser dinâmicos por inquilino (a partir de `logo_path`, com o «IB» como alternativa); resolver antes da Fase 4 |
| SEO da landing | Feito (D-105) | 22/10/2026 | Título, descrição, JSON-LD, `sitemap.xml`, `robots.txt`. Falta o dono registar o domínio no Google Search Console e submeter o sitemap |

## Pendentes do dono

O dono está ausente e autorizou avançar sem esperar (D-120). Tudo o que depende da aprovação dele fica aqui, numerado. Cada decisão tomada por mim está aplicada e pode ser revertida.

1. **Confirmar a Fase 3** (resultado verificável na linha da Fase 3).
2. **Variáveis na Vercel.** O modo automático não me deixa escrever segredos na Vercel. Opções: autorizar a ação (permissão de Bash para a API `api.vercel.com/v10/projects/.../env`) ou pô-las à mão em Vercel → `instabarber-landing` → Settings → Environment Variables, com os valores do `.env.local`:
   - Preview e Production: `PRESTADORA_NOME`, `PRESTADORA_NIF`, `PRESTADORA_MORADA`, `PRESTADORA_QUALIDADE`, `PRESTADORA_ASSINANTE`, `PRESTADORA_REGIME_IVA=normal`, `EMAIL_NOTIFICACOES=geral@instabarber.pt`, `TELEFONE_COMERCIAL`.
   - Só Preview (a Production já as tem): `RESEND_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_COMERCIAL`, `TELEFONE_COMERCIAL_TXT`.
   - **Não** pôr as do Supabase na Production: a produção usa o projeto de Frankfurt (Fase 7).
3. **Ordem das fases.** Interpretei «avança para a Fase 4» como saltar a 3B e a 3C por agora; ficam para depois da Fase 4. Confirmar ou indicar outra ordem.
4. **Revogar as chaves** que passaram pelo chat quando as fases acabarem: token do Supabase, palavra-passe da base de dados, chave de serviço do Supabase, chave do Resend e token da Vercel.
5. Registar o domínio no Google Search Console e submeter o sitemap (trabalho paralelo, SEO).

## Próximo passo

Fase 4 (Painel da barbearia) em curso, sem esperar pela confirmação da Fase 3 (D-120).

- 22/10/2026 · D-72: Pro com 3 profissionais incluídos (landing, docs, esquema e testes SQL atualizados; 396 verificações sem falhas).
- 22/10/2026 · D-84: landing no ar em instabarber.pt e www.instabarber.pt (Vercel, HTTPS). Passo 0: faltam .env.local, Resend e confirmação do Zoho.
- 22/10/2026 · D-85: regime de IVA normal. Resend verificado (domínio instabarber.pt), .env.local completo.
- 22/10/2026 · Passo 0 concluído (domínio, landing no ar, Resend verificado, .env.local, IVA confirmado com o contabilista). Fase 0: resumo apresentado, à espera de confirmação do dono antes de escrever código.
- 22/10/2026 · Fase 0, código: Next.js 15.5.28, React 19.2.9, rota `/api/contacto` e `/api/medicao`, landing ligada à rota (D-98 a D-100). Verificado: typecheck, lint, 27 testes Vitest, 6 Playwright, 396 testes SQL (PostgreSQL 16 local), build. À espera do dono: (1) decidir a vulnerabilidade de `braces` (D-98); (2) mudar na Vercel o Root Directory para a raiz, preset Next.js, e colar `RESEND_API_KEY`, `EMAIL_REMETENTE` e `EMAIL_COMERCIAL`; (3) pedido de teste real na landing (e o mesmo com a chave errada).
- 22/10/2026 · D-98: o dono mantém o `eslint-config-next` e aceita a exceção do `braces` (só ferramenta de lint, sem correção publicada). Faltam a Vercel e o teste real.
- 22/10/2026 · Fase 1 retomada com o resumo confirmado. Supabase local com as migrações e 396 testes SQL a passar depois da correção do teste do bucket comercial (D-108, autorizada). Tipos e repositórios (D-109). À espera do dono: `SUPABASE_ACCESS_TOKEN`, identificador do projeto de ensaio (eu-central-1) e palavra-passe da base de dados, e a versão do PostgreSQL desse projeto.
- 22/10/2026 · Credenciais recebidas, mas o `instabarber-ensaio` ficou em eu-west-2 (Londres) e em PostgreSQL 17. Nada aplicado lá. Supabase local passado a 17 e verificação repetida: 396 testes SQL, RLS em 59 de 59 (D-110). À espera do dono: projeto novo em Frankfurt.
- 22/10/2026 · O dono mantém o ensaio em Londres (D-111). Migrações aplicadas no ensaio pela Management API; RLS em 59 de 59; 396 testes SQL a passar. Fase 1 à espera de confirmação.
- 22/10/2026 · Fase 1 confirmada pelo dono. Início da Fase 2: resumo apresentado, à espera de confirmação.
- 22/10/2026 · Fase 2, código: entrada da equipa, recuperação e convite por ligação segura, 2FA TOTP do super_admin, middleware da L.4, menus pelas funcionalidades, troca de barbearia, acesso do cliente por código (api/acesso) e limites de pedidos (D-112 a D-115). Verificado: 30 Playwright, 70 Vitest, 396 SQL, typecheck, lint, build. Auth do ensaio configurado; super_admin criado no ensaio, sem palavra-passe.
- 22/10/2026 · Fase 2 confirmada pelo dono. Início da Fase 3: resumo apresentado, à espera de confirmação.
- 22/10/2026 · Fase 3, código: mensalidade (D.7), formulário de adesão com PDF, Admin (painel geral, barbearias com dez separadores, pedidos, funcionalidades, pagamentos), aprovação com conta do dono e boas-vindas, importação CSV, exportação, eliminação, vista de apoio, documentos legais, navegação inferior no telemóvel (D-116 a D-119). Migração 05 aplicada no ensaio.
