# Fase 3B — Comercial

| | |
| --- | --- |
| **Foco** | CRM, propostas e contratos no Admin |
| **Resultado verificável** | Um lead entra pelo formulário do site, passa pelo funil, recebe proposta em PDF, o contrato é gerado da proposta aceite, assinado, e o convite de adesão chega ao dono com os dados preenchidos. |
| **Dias estimados** | 6 (extensão; não conta para os 47 dias das nove fases) |

## Antes de começar

Depende das Fases 1 a 3 concluídas: Admin com 2FA, formulário de adesão, `mensalidade.ts`. Apresenta o resumo do que vais construir e espera pela minha confirmação.

## Ler nesta fase

- `CLAUDE.md` (todo)
- `docs/parte-n-comercial-crm-propostas-e-contratos.md` (toda)
- `docs/parte-d-planos-funcionalidades-e-pacotes.md` — D.3, D.5, D.7, D.8, D.9, D.12
- `docs/parte-h-conformidade-legal-e-protecao-de-dados.md` — H.1
- `docs/esquema/` — secção 17 das tabelas, funções comerciais, `testes/40_comercial.sql`
- `docs/comercial/` (contrato, Acordo de Subcontratação e notas para o jurista, em rascunho)
- `DECISOES.md` — D-36 a D-39 e D-42

## O que construir (por camadas, cada uma útil sozinha)

**Camada 1A — Formulário que grava (~0,5 dia; D-46)**
- [ ] A rota de contacto já existe desde a Fase 0 (e-mail ao comercial@). Acrescentar-lhe o limite por IP (`consumir_limite`) e a chamada a `submeter_lead()`, para o pedido ficar gravado no CRM. A confirmação «Pedido enviado» e o botão verde de WhatsApp já estão na landing.
- [ ] Texto junto ao botão e Política de Privacidade atualizados.

**Camada 1 — Leads e funil**
- [ ] Separador Comercial no Admin: Funil, Leads (lista e ficha com histórico).
- [ ] Aba «Incompletos» nos Leads: quem fez o passo 1 do formulário e não completou o passo 2 (D-50). Só mostra quem enviou o contacto; nada do que não foi enviado se guarda.
- [ ] Rota do formulário do site a chamar `submeter_lead()` (limite por IP, honeypot, e-mail para comercial@ pelo Resend).
- [ ] Landing e Política de Privacidade atualizadas: o pedido passa a ser guardado (12 meses).
- [ ] Alertas no painel geral: leads novos há mais de dois dias úteis; propostas a expirar.

**Camada 2 — Briefing e proposta**
- [ ] Briefing em sete passos (N.4) com validação Zod; preço calculado por `mensalidade.ts`.
- [ ] Proposta: versões, `criar_proposta`, PDF com jsPDF (N.5), «Marcar como enviada», aceitar/recusar.

**Camada 3 — Modelos e contrato**
- [ ] Separador Modelos: editar rascunho, pré-visualizar, aprovar (N.8), marcadores validados.
- [ ] `gerar_contrato`, PDF com anexos, estados, registo de assinatura com carregamento do PDF assinado.

**Camada 4 — Adesão**
- [ ] Convite de adesão com formulário pré-preenchido (nunca com palavra-passe) e ligação ao inquilino na aprovação.

## Não fazer nesta fase

Envio automático de propostas, assinatura eletrónica integrada, e-mail em massa, automações, tarefas agendadas, dependências novas.

## Verificar

- [ ] Os 389 testes SQL a passar (`scripts/testar-sql.sh`).
- [ ] Sem 2FA, nada do comercial é visível; `/admin/comercial` responde 404 fora do domínio principal.
- [ ] O PDF da proposta e do contrato abrem, com logótipo, dados e valores iguais à D.5, e dizem «Não é documento fiscal».
- [ ] Um contrato assinado não se altera; um lead ganho só por assinatura.
- [ ] O modelo de contrato só gera com estado aprovado.
- [ ] `typecheck`, `lint`, `test` e `build` sem erros. Atualizar o `PROGRESSO.md`.
