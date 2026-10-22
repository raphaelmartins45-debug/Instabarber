# Fase 3C — Finanças da Performa LAB

| | |
| --- | --- |
| **Foco** | Custos, contas a pagar, indicadores, ponto de equilíbrio, objetivo, previsões e lembretes de vencimento |
| **Resultado verificável** | Com custos e barbearias registados, o Resumo mostra receita, custos e lucro; o ecrã dá o ponto de equilíbrio e quantas barbearias faltam para o objetivo; um lembrete de vencimento sai por WhatsApp e por e-mail; o CSV do mês abre no Excel. |
| **Dias estimados** | 5 (extensão; não conta para os 47 das nove fases) |

## Antes de começar

Depende das Fases 1 a 3 (Admin com 2FA, `mensalidade.ts`, recebimentos) e, para a taxa de conversão, da 3B. Apresenta o resumo do que vais construir e espera pela minha confirmação.

## Ler nesta fase

- `CLAUDE.md` (todo)
- `docs/parte-o-financas-da-performa-lab.md` (toda)
- `docs/parte-d-planos-funcionalidades-e-pacotes.md` — D.5 e D.7
- `docs/parte-e-especificacao-das-quatro-camadas.md` — E.1, separador Pagamentos
- `docs/parte-f-regras-de-negocio.md` — F.4 (mensagens de serviço)
- `docs/parte-l-publicacao-dominios-e-custos.md` — L.2 e L.5
- `docs/esquema/` — secção 18 das tabelas, secção 8C das funções, `testes/50_financas.sql`
- `docs/manual-do-operador.md` — P-08, P-09, P-25 a P-27
- `DECISOES.md` — D-40, D-41 e D-43

## O que construir (por camadas)

**Camada 1 — Custos e contas a pagar**
- [ ] CRUD de custos e de contas a pagar; estado calculado ao ler; «Gerar as contas do próximo mês».
- [ ] Alertas no painel geral: contas a vencer em 7 dias e atrasadas.

**Camada 2 — Resumo e ponto de equilíbrio**
- [ ] `lib/financas/indicadores.ts`: MRR (anual a 10/12), recebido ÷ 1,23, lucro estimado e de caixa, ARPU, em atraso. Testes Vitest.
- [ ] Gráficos de 12 meses (Recharts) e ponto de equilíbrio (O.6).

**Camada 3 — Lembretes de vencimento**
- [ ] Separador Vencimentos sobre `vencimentos_proximos`, com filtros.
- [ ] Botão WhatsApp (`wa.me`, abrir, confirmar) e botão E-mail (Resend, `registar_email_lembrete`).
- [ ] Três textos-modelo em `lib/financas/mensagens.ts`, com o valor de `mensalidade.ts`.

**Camada 4 — Objetivo e previsões**
- [ ] Metas por mês e «quantas barbearias faltam» (O.7).
- [ ] `lib/regras/previsao.ts`: três cenários a 12 meses, pressupostos editáveis, aviso «Não é uma promessa». Testes Vitest.

**Camada 5 — Exportar**
- [ ] CSV (`;`, UTF-8 com BOM) e PDF por período, com auditoria.

## Não fazer nesta fase

Ligação ao banco, leitura de faturas, IVA/IRC, envio automático ou agendado de lembretes, dependências novas.

## Verificar

- [ ] Os 389 testes SQL a passar (`scripts/testar-sql.sh`).
- [ ] Sem 2FA, nada de Finanças é visível; `/admin/financas` responde 404 fora do domínio principal.
- [ ] O lucro e o ponto de equilíbrio batem com um exemplo feito à mão (valores sem IVA).
- [ ] O lembrete por WhatsApp só fica «confirmado» depois de o operador confirmar; o de e-mail fica «enviado» ou «falhou».
- [ ] Os ficheiros exportados dizem «Não é documento fiscal».
- [ ] `typecheck`, `lint`, `test` e `build` sem erros. Atualizar o `PROGRESSO.md`.
