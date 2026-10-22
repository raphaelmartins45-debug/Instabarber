# U-06 · Ativar o MB Way online

| | |
| --- | --- |
| **Estado** | Pronto após P.7 |
| **Risco** | Alto |
| **Depende de** | Fases 5 e 6 (módulos da G.4 construídos e desligados); P.7 |
| **Conflita com** | Nenhum, mas muda uma regra de base do CLAUDE.md |
| **Tempo estimado** | 8 a 12 dias, mais a contratação do prestador |

## Quando se faz
Quando o dono mandar ativar o MB Way online, depois de responder às perguntas de P.7 e de escolher o prestador de pagamentos.

## Decisões do dono necessárias
As cinco perguntas de P.7 (sinal ou total, quem suporta a comissão, conta do prestador por barbearia, faturação, reembolso), mais a escolha do **prestador**, que **não pode deter fundos de terceiros**.

## O que muda (partes do sistema)
`lib/pagamentos` (adaptador do prestador atrás da interface existente), a rota `api/webhooks/pagamentos` (hoje 404), tabelas `pagamentos` e `ligacoes_externas` (já existem, RLS só super_admin: abrir à barbearia só no que for dela), o fluxo de marcação (F.7, F.8), CLAUDE.md §3 (regra «não processa pagamentos»), Partes D, G e H, Termos e contratos.

## Passos
1. Ler P.7, G.4, F.8 e o código real de `lib/pagamentos`.
2. Escrever em `DECISOES.md` a alteração à regra de base, **com ordem expressa do dono**.
3. Obter as chaves do prestador (**sem chaves, parar e pedir**) e pôr só em `.env.local` e no cofre da Vercel.
4. Implementar o adaptador, a verificação de assinatura dos webhooks, a idempotência (cada evento uma só vez), os estados do pagamento, o reembolso e a reconciliação.
5. Ligar por barbearia (`inquilino_modulos`), começando por uma de ensaio; interruptor geral desligado até ao fim.
6. Se houver faturas, ligar a um programa de faturação **certificado** por integração (nunca faturação própria).

## Verificação
Com o módulo desligado, nada muda (teste ponta a ponta da G.4). Com ele ligado: pagamento de teste, falha, cancelamento e reembolso; webhook repetido não duplica; dinheiro vai direto para a barbearia.

## Reversão
Desligar o interruptor geral e o da barbearia. Pagamentos já feitos ficam registados e reembolsam-se pelo prestador.

## Registo
D-NN, CLAUDE.md, Partes D, G e H, Termos, grelha D.3, Finanças (comissão do prestador), manual do operador (P-20).
