# U-10 · Alterar os preços dos planos

| | |
| --- | --- |
| **Estado** | Pronto após decisões |
| **Risco** | Médio |
| **Depende de** | Fases 3 e 4 |
| **Conflita com** | U-09 (fazer primeiro se também mudar o IVA) |
| **Tempo estimado** | 0,5 a 1 dia |

## Quando se faz
Quando o dono decidir mudar o preço do Basic, do Pro, do barbeiro adicional ou do domínio próprio.

## Decisões do dono necessárias
1. Os valores novos (**sem IVA** e **finais**: o final é sempre sem IVA × 1,23, D-45).
2. A partir de quando, e se vale **só para novas barbearias** ou também para as existentes (com o pré-aviso que o contrato exigir).
3. O que acontece ao desafio dos 90 dias e à comparação de preços.

## O que muda (partes do sistema)
- **Fonte única:** `BASE_CENT`, `EXTRA_CENT` e `DOMINIO_PROPRIO_CENT` em `lib/regras/mensalidade.ts` (D.7). Nunca duplicar a fórmula.
- Testes Vitest com os valores esperados.
- Parte D (D.1, D.7), CLAUDE.md §6 (tabela), `docs/comercial/` (condições da proposta), landing: preços, «desde X por dia», a calculadora (`24,59` no texto e no cálculo) e a comparação `#separado`.
- Propostas e contratos **existentes**: não se alteram (imutáveis). Barbearias existentes: só com aviso e data, por processo manual (P-07).

## Passos
1. `Grep` pelos preços antigos em todo o repositório (sem IVA e com IVA, e «por dia»).
2. Alterar `lib/regras/mensalidade.ts` e os testes; correr `test`.
3. Atualizar a landing e os documentos com os valores novos (finais com «IVA incluído»).
4. Rodar a auditoria (`scripts/auditar-landing.py`) e o teste de formulário.
5. Deploy de pré-visualização, conferir um orçamento e uma proposta de teste, depois produção.

## Verificação
`Grep` pelos valores antigos devolve zero; propostas novas com o preço novo; contratos antigos intactos.

## Reversão
`git revert`; nada na base de dados muda.

## Registo
D-NN, D.1, CLAUDE.md §6, landing, PROGRESSO.
