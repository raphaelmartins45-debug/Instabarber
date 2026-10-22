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
