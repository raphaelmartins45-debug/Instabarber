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
| 1 | Base de dados | Pendente | — | — |
| 2 | Autenticação e papéis | Pendente | — | — |
| 3 | Administração e adesão | Pendente | — | — |
| 3B | Comercial (CRM, propostas e contratos) | Pendente | — | — |
| 3C | Finanças da Performa LAB | Pendente | — | — |
| 4 | Painel da barbearia | Pendente | — | — |
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
| Ícone do atalho no iPhone | Resolvido | 22/10/2026 | Com o favicon novo (D-110, ficheiros `ib2-*`) o iOS mostra o ícone no «Adicionar à Tela de Início» (confirmado pelo dono). Falta só o ícone dinâmico por barbearia nos painéis, antes da Fase 4. |
| SEO da landing | Feito (D-105) | 22/10/2026 | Título, descrição, JSON-LD, `sitemap.xml`, `robots.txt`. Falta o dono registar o domínio no Google Search Console e submeter o sitemap |

## Próximo passo

Fase 0 (Preparação), com início a 22/10/2026. Antes de escrever código: resumo do que se vai construir e **espera pela confirmação do dono** (regra de trabalho do projeto). Ler só `fases/fase-0.md` e `CLAUDE.md`.

- 22/10/2026 · D-72: Pro com 3 profissionais incluídos (landing, docs, esquema e testes SQL atualizados; 396 verificações sem falhas).
- 22/10/2026 · D-84: landing no ar em instabarber.pt e www.instabarber.pt (Vercel, HTTPS). Passo 0: faltam .env.local, Resend e confirmação do Zoho.
- 22/10/2026 · D-85: regime de IVA normal. Resend verificado (domínio instabarber.pt), .env.local completo.
- 22/10/2026 · Passo 0 concluído (domínio, landing no ar, Resend verificado, .env.local, IVA confirmado com o contabilista). Fase 0: resumo apresentado, à espera de confirmação do dono antes de escrever código.
- 22/10/2026 · Fase 0, código: Next.js 15.5.28, React 19.2.9, rota `/api/contacto` e `/api/medicao`, landing ligada à rota (D-98 a D-100). Verificado: typecheck, lint, 27 testes Vitest, 6 Playwright, 396 testes SQL (PostgreSQL 16 local), build. À espera do dono: (1) decidir a vulnerabilidade de `braces` (D-98); (2) mudar na Vercel o Root Directory para a raiz, preset Next.js, e colar `RESEND_API_KEY`, `EMAIL_REMETENTE` e `EMAIL_COMERCIAL`; (3) pedido de teste real na landing (e o mesmo com a chave errada).
- 22/10/2026 · D-98: o dono mantém o `eslint-config-next` e aceita a exceção do `braces` (só ferramenta de lint, sem correção publicada). Faltam a Vercel e o teste real.
