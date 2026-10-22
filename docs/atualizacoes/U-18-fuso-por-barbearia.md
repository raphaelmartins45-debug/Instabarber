# U-18 · Fuso por barbearia (alterar a regra 6)

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Alto |
| **Depende de** | Fases 1 a 5 |
| **Conflita com** | Tem de vir antes de U-04, U-05 e U-07 |
| **Tempo estimado** | 2 a 3 dias |

## Quando se faz
Antes de ativar qualquer país com fuso diferente (P.3, passo 5). Esta atualização altera a regra 6 do dono: **«zero cálculos de data fora de Europe/Lisbon»** passa a **«zero cálculos de data fora do fuso da barbearia, por omissão Europe/Lisbon»**. Só com **ordem expressa do dono**.

## Decisões do dono necessárias
A ordem para alterar a regra 6 e a data de efeito.

## O que muda (partes do sistema)
- `inquilinos.fuso` já existe (dormente, só `Europe/Lisbon`). Alargar o `check` por migração.
- Funções SQL com o fuso escrito à mão (inventário em P.2): `lisboa()`, `lisboa_para_utc()`, `hoje_lisboa()`, a geração de referências por ano, a vista dos vencimentos e as duas vistas de `01_tabelas.sql` (propostas, contas a pagar), mais as seis ocorrências de `'Europe/Lisbon'` em `02_funcoes.sql`.
- `lib/formatacao/datas.ts` (parâmetro de fuso), `lib/regras` que usem datas, feriados por país e região.
- CLAUDE.md (regra do fuso, §5), DECISOES.

## Passos
1. `Grep` por `Europe/Lisbon`, `hoje_lisboa`, `lisboa(`, `lisboa_para_utc(` em SQL e TypeScript, e confirmar o inventário de P.2.
2. **Expandir sem partir**: criar funções novas que recebem o fuso (ou o inquilino) e deixar as antigas como invólucro que chama as novas com `'Europe/Lisbon'`. Nada em produção muda ainda.
3. Mudar os chamadores um a um para as funções novas; testes a cada passo.
4. Testes novos: duas barbearias em fusos diferentes, mudança de hora (março e outubro), marcação à meia-noite, feriados.
5. Só numa entrega posterior, retirar os invólucros (contrair).

## Verificação
Os 396 testes SQL e os de agenda passam **sem alteração**; os novos provam fusos diferentes; Portugal comporta-se exatamente como antes.

## Reversão
Voltar aos chamadores antigos (os invólucros mantêm-se até à entrega de contração).

## Registo
D-NN, CLAUDE.md, Parte B, Parte P (P.2), PROGRESSO.
