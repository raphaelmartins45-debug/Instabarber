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
| 4 | Painel da barbearia | Concluída (por confirmar) | 22/10/2026 | Supabase local: **34 testes Playwright** (17 cenários × computador e telemóvel), incluindo o resultado verificável — um dia completo: serviço registado ao balcão, cliente novo marcado na primeira vaga, concluído na agenda (a verde, lembrete wa.me pronto), ficha técnica com nota, comissões e acertos com os dois serviços (32,50 €) e acerto registado (liquidado), despesa no Financeiro, ausência na Gestão do sistema, e o barbeiro a ver a mesma receita na sua folha de acerto sem entrar na Gestão do sistema. Verificado também à mão, no computador e no telemóvel (sem deslocamento lateral): Início, Agenda, Clientes, ficha, Equipa, área do barbeiro, Financeiro (a faturação coincide com a do Início), acertos, as 14 secções da Gestão do sistema, clube (plano, inscrição, «Pago»), cartão oferta com PDF, loja (margem 9,76 € · 3,26 € · 33,4 %, como na F.4.4), O meu plano. **436 testes SQL** (migração 06: cartões oferta, bloqueio por faltas, clube; D-121, D-122); migração 06 aplicada no ensaio. **153 testes Vitest** (classificação, objetivos, acertos, financeiro, loja, ocupação, mensagens, paleta, calendário), mais 5 de integração; typecheck, lint e build sem erros. Ícone e manifesto por barbearia nos painéis (D-123) |
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
| Ícone do atalho no iPhone | Feito nos painéis (D-123); falta confirmar num iPhone (pendente 18) | 22/10/2026 | O favicon do separador mostra o «IB» novo, mas «Adicionar à Tela de Início» no iOS continua com o ícone antigo, mesmo depois de nomes novos (`ib-180.png`, D-107). Voltar a isto para replicar a solução nos ícones dos painéis (gestor, barbeiro, cliente). Nos painéis e nas páginas públicas das barbearias o ícone e o manifesto têm de ser dinâmicos por inquilino (a partir de `logo_path`, com o «IB» como alternativa); resolver antes da Fase 4 |
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

**Decisões da Fase 4 que tomei sem especificação (aplicadas; confirmar ou mudar):**

6. **Textos das mensagens por WhatsApp** (lembrete, pós-venda, convite a regressar, reativação, parabéns) em `lib/i18n/pt-PT/agenda.ts` → `mensagensWhatsApp`. Tom formal («Olá João! Lembramos a sua marcação…»). Validar o texto.
7. **Resumo do mês do Financeiro:** resultado = receita da barbearia (F.4.11) − custos fixos − despesas; margem = resultado ÷ receita. A faturação de serviços e as comissões aparecem como informação.
8. **Custos fixos recorrentes:** ao carregar em «Paguei», cria-se logo o custo do mês seguinte, por pagar, com o mesmo valor.
9. **Cancelar marcação na agenda** (com confirmação). A E.2 não o lista, mas sem isso a agenda do balcão fica sem saída.
10. **Contas a pagar no Início:** custos fixos por pagar com vencimento até ao fim do mês e todas as despesas por pagar.
11. **«Passar para o Pro»** (chamada de upgrade, D.2) abre um e-mail para apoio@, sem botão de ativação.
12. **Envio em lote** (clientes e «Lembretes em lote») fica para a Fase 6, com o registo completo das mensagens. As mensagens individuais já ficam registadas na tabela `mensagens` nesta fase (F.4.10).
13. **Menu:** as entradas «Relatório» (Fase 6) aparecem quando a funcionalidade está ligada; até à Fase 6 a página ainda não existe.
14. **Registar serviço ao balcão:** marca e conclui de seguida, na hora indicada (por omissão a hora atual), com o valor editável.
15. **Confirmar a Fase 4** (resultado verificável na linha da Fase 4).
16. **Taxa de regresso** (indicador do barbeiro, E.3): clientes com duas ou mais visitas com ele ÷ clientes atendidos por ele. A especificação não dá a fórmula.
17. **Clube:** as renovações automáticas em atraso fazem-se quando o gestor abre a secção do clube (não há tarefas agendadas, D-26); o cliente tem de estar registado antes de ser inscrito (procura-se pelo telemóvel). Plano desativado não aceita subscrições novas.
18. **Ícone no iPhone** (trabalho paralelo): os painéis já têm ícone e manifesto por barbearia (D-123). Falta o dono confirmar num iPhone real que «Adicionar ao ecrã principal» mostra o ícone novo.
19. **Testes SQL no ensaio:** a migração 06 foi aplicada no projeto de ensaio, mas os 436 testes SQL só correram no Supabase local (correr no ensaio obriga a apagar e repor os dados de teste fixos, como na Fase 3). Fica para o fecho da Fase 7, antes da produção.

## Próximo passo

Fase 4 concluída (por confirmar, pendente 15). Fase 5 (Motor de agenda e cliente) em curso, sem esperar (D-120).

### Resumo da Fase 4 (D-120: escrito aqui em vez de esperar confirmação)

**Constrói-se** (E.2, E.3, F.1–F.4, I.2–I.3), nas camadas 2 e 3, computador e telemóvel:

1. Regras puras com Vitest em `lib/regras`: `classificacao.ts` (F.1), `objetivos.ts` (F.3), `acertos.ts` e `financeiro.ts` (F.4.11), `loja.ts` (margem, F.4.4).
2. Início do gestor: faixa de ação, quatro indicadores, marcações de hoje (Concluir, Faltou, lembrete), pedidos de acesso, contas a pagar, clientes a contactar.
3. Agenda: dia por profissional, vagas livres, ausências; marcar ao balcão (a base de dados valida e aplica o preço); concluir com `concluir_marcacao()` (normal, crédito do clube, prémio de selos, cartão oferta); faltou; lembrete wa.me com `lembrete_aberto_em`; órfãs com atribuição.
4. Clientes: radar com indicadores e filtros, ficha (consentimento, visitas, selos, clube, loja, faltas, «Voltar a permitir marcação online»), ficha técnica com fotografias no bucket `fichas`, aniversariantes.
5. Equipa: um separador por profissional. Painel do profissional (E.3): indicadores próprios, agenda própria, clientes próprios classificados só com ele, metas, folha de acerto, perfil (nome apresentado, fotografia, portfólio, palavra-passe).
6. Financeiro: objetivo do mês e por profissional, custos fixos e despesas, resumo, comissões e acertos (com correções de sinal contrário).
7. Gestão do sistema: estado, marca, horário, ausências e feriados, equipa (horário, comissões, modelo de caixa, renda, acesso), serviços, fidelização, aniversário, faltas, ligações, clube, loja, períodos de desconto, cartões oferta, órfãs.
8. Loja (produtos e pedidos), clube (planos, inscrições, ciclos «Pago»), cartões oferta (venda com PDF «Não é documento fiscal», uso).
9. O meu plano (leitura) e funcionalidades fora do plano: «Sai» ou «Upgrade».
10. Ícone e manifesto por barbearia nos painéis (pendente do trabalho paralelo, «resolver antes da Fase 4»).

**Não se faz nesta fase:** marcação pela página pública e área de cliente (Fase 5); envio em lote, registo de mensagens na tabela `mensagens`, e-mails automáticos, filas e relatório mensal (Fase 6). Os botões de mensagem individuais abrem o wa.me já nesta fase.

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
