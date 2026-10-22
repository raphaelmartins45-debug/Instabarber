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
