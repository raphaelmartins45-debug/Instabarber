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
| 0 | Preparação | Pendente | — | — |
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
| Landing page (`landing/index.html`) | Fechada | 21/10/2026 | Versão 27 publicada; auditoria 0 problemas; sem rolagem horizontal em 1440 px e 390 px (mobile automático); sem «ao vivo» (D-65), sem rótulos de exemplo nos ecrãs (D-66) |
| Instagram: imagens, reels, legendas, voz | Entregue ao criativo (conversa própria) | 21/10/2026 | `marketing/instagram/` + `InstaBarber-Kit-Redes-Sociais.zip`; regras em CLAUDE.md secções 11 e 12; D-61 a D-70 |
| Estrutura de pastas do negócio | Entregue | 21/10/2026 | `InstaBarber-Estrutura-de-Pastas.zip` |

## Próximo passo

Fase 0 (Preparação), com início a 22/10/2026. Antes de escrever código: resumo do que se vai construir e **espera pela confirmação do dono** (regra de trabalho do projeto). Ler só `fases/fase-0.md` e `CLAUDE.md`.

- 22/10/2026 · D-72: Pro com 3 profissionais incluídos (landing, docs, esquema e testes SQL atualizados; 396 verificações sem falhas).
- 22/10/2026 · D-84: landing no ar em instabarber.pt e www.instabarber.pt (Vercel, HTTPS). Passo 0: faltam .env.local, Resend e confirmação do Zoho.
- 22/10/2026 · D-85: regime de IVA normal. Resend verificado (domínio instabarber.pt), .env.local completo.
- 22/10/2026 · Passo 0 concluído (domínio, landing no ar, Resend verificado, .env.local, IVA confirmado com o contabilista). Fase 0: resumo apresentado, à espera de confirmação do dono antes de escrever código.
