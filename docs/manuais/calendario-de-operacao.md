# Calendário de operação

Tudo o que tem data na operação do InstaBarber, numa só página: o que fazer todos os dias, todas as
semanas, todos os meses e todos os anos, e os marcos que dependem do crescimento. Cada linha aponta
para o procedimento do `docs/manual-do-operador.md` (P-NN) que diz como se faz.

Por agora é o dono quem faz tudo (D-175). Tempo previsto com poucas barbearias: **10 minutos por
dia, 30 minutos por semana e uma manhã no início de cada mês.**

---

## Todos os dias (10 min)

Abrir **instabarber.pt/admin** (painel geral) e percorrer, por esta ordem:

| O quê | Onde | Prazo | Procedimento |
| --- | --- | --- | --- |
| Pedidos de adesão novos | Painel geral → lista «Pedidos pendentes» | Responder no próprio dia | P-03 |
| Comprovativos de pagamento | Painel geral → «Comprovativos por confirmar» → «Conferir» | Conferir com o extrato do banco ou o MB WAY e aprovar no próprio dia | P-08 |
| Alertas: atrasos, suspensões, sinais de abandono, comissões | Painel geral → alertas | Tratar ou agendar | P-09, M.2 |
| Leads novos (site e prospeção) | Comercial → Desempenho → «Hoje» e Funil | Primeiro contacto no próprio dia útil | P-21 |
| Correio de apoio@ e privacidade@ | Zoho | Apoio: no próprio dia útil. RGPD: registar no dia; prazo legal de 30 dias | P-11, P-12 |

**Se o painel não abrir ou estiver lento:** ver o aviso do serviço de monitorização (P-28) e o
guia de resolução de problemas.

---

## Todas as semanas (30 min, de preferência à segunda-feira)

| O quê | Onde | Procedimento |
| --- | --- | --- |
| **Cópia de segurança da produção** (cifrada, guardada no Drive, pasta «InstaBarber · Cópias de segurança») | `scripts/copia-api.py` ou pedido ao Claude Code | P-13 |
| Vencimentos dos próximos 7 dias e mensalidades em atraso | Admin → Finanças → Vencimentos | P-25, P-09 |
| Leads parados e propostas a expirar | Comercial → Funil e «Hoje» | P-21, P-22 |
| Barbearias com pouca utilização: contacto pessoal | Admin → Gestão do negócio → «Saúde das barbearias» | M.2 |

**A cópia semanal é a única cópia que existe.** O Supabase está no plano gratuito (D-157), que não
faz cópias diárias. Não saltar semanas; guardar 30 dias e apagar as mais antigas.

---

## Todos os meses

### No dia 1 (uma manhã)

| O quê | Onde | Procedimento |
| --- | --- | --- |
| Faturas das mensalidades pagas no mês anterior (taxa 0 %, motivo M10) | Programa de faturação certificado da Prestadora, até o InvoiceXpress ser ativado (D-170) | P-08 |
| Custos fixos, contas a pagar, resumo e objetivo do mês | Admin → Gestão do negócio → Finanças | P-26 |
| **Faturação acumulada do ano** comparada com o limite da isenção de IVA | Admin → Finanças → Resumo (soma do ano) | Ver «Limite da isenção» abaixo |
| Apagar leads inativos (12 meses) e auditoria com mais de 24 meses | Comercial → Leads (fim da lista); painel geral → «Atividade recente» | P-24 |
| Disponibilidade do mês anterior (objetivo 99,5 %) | Serviço de monitorização | P-28 |

### No fim do mês (ou do trimestre)

| O quê | Onde | Procedimento |
| --- | --- | --- |
| Exportar os números para o contabilista | Admin → Finanças → Exportar | P-27 |

---

## A cada três meses

| O quê | Próxima data | Procedimento |
| --- | --- | --- |
| **Testar um restauro** da cópia mais recente, no Supabase local ou no ensaio (nunca na produção) | Até 25/01/2027 (último: 25/10/2026) | P-14 |
| Rever preços e planos com os números do trimestre | Janeiro de 2027 | D.5 |
| Rever as barbearias em risco e o que dizem as do relatório mensal | Janeiro de 2027 | M.2 |

---

## Todos os anos

| O quê | Quando | Procedimento |
| --- | --- | --- |
| Feriados nacionais do ano seguinte | Até 1 de dezembro. A base já tem 2026, 2027 e 2028: o próximo é o de 2029, até 01/12/2028 | P-15 |
| Lembrar às barbearias o feriado municipal e o Carnaval | Dezembro, com os feriados | P-15 |
| Renovar os domínios instabarber.pt, .es, .eu e .online | Antes de 20 de outubro (registados a 20/10/2026, renovação anual). Primeira renovação: 20/10/2027 | L.3 |
| Rever os documentos legais (Termos, Privacidade, Acordo de Subcontratação) com o jurista | Uma vez por ano, e sempre que mudarem os preços ou o regime de IVA | H.4 |
| Rever os acessos: contas de administrador, chaves e quem tem os dois passos | Uma vez por ano, e sempre que alguém sai | P-17 |

---

## Limite da isenção de IVA (vigiar todos os meses)

A Prestadora está isenta de IVA pelo artigo 53.º do CIVA **até 15.000 € de faturação no ano**
(D-173). Ao preço não acresce IVA enquanto durar a isenção.

| Faturação acumulada do ano | O que fazer |
| --- | --- |
| Até 12.000 € | Nada; continuar a vigiar no dia 1 |
| **12.000 €** | Avisar o contabilista e decidir: abrir a Lda. ou preparar a passagem ao regime normal |
| **15.000 €** | A isenção acaba. Confirmar com o contabilista desde quando se cobra IVA (acima de 18.750 € no próprio ano, acaba logo na fatura que passa o limite) |
| Passagem ao regime normal | `PRESTADORA_REGIME_IVA=normal` na Vercel; aviso prévio de preço às barbearias (cláusula 6.3); o IVA a 23 % acresce (39,99 € → 49,19 €). Ver `docs/mudanca-regime-iva.md` |

**Plano do dono:** ao chegar a cerca de **1.000 € por mês**, abrir a Lda. (regime normal de IVA).
Os contratos já assinados passam para a Lda. por cessão da posição contratual, com o consentimento
de cada barbearia (cláusula 19).

---

## Marcos que dependem do crescimento

| Quando | O quê | Porquê |
| --- | --- | --- |
| **Primeira barbearia real a pagar** | Passar a Vercel do plano Hobby para o Pro | O Hobby não permite uso comercial nos termos da Vercel (D-15). É só configuração |
| Primeira barbearia real | Ponderar o Supabase Pro (cópias diárias, sem pausas) | O gratuito pausa o projeto ao fim de uma semana sem atividade e não faz cópias diárias. A monitorização da P-28 mantém-no ativo |
| Primeiro pagamento de mensalidade | Ativar a fatura-recibo automática do InvoiceXpress | Os dados que faltam estão no PROGRESSO, «Módulo pendente de ativação» |
| Cerca de 1.000 € por mês | Abrir a Lda. | Ver «Limite da isenção» |
| Primeiro comercial | Formação pelo `formacao-comercial.md`; ligar as condições comerciais, se houver descontos ou taxa de migração | D-161, D-175 |
| Fim da construção do sistema | Revogar as chaves usadas durante o desenvolvimento (Supabase, Vercel, Resend) e criar novas | P-17 |

InstaBarber · Performa LAB
