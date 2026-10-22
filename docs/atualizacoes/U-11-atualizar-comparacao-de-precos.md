# U-11 · Atualizar a comparação «Se comprasses separado»

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo |
| **Depende de** | Fase 0 (landing) |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 0,25 dia |

## Quando se faz
De seis em seis meses, ou quando os preços dos fornecedores mudarem. Última revisão: 21/10/2026.

## Decisões do dono necessárias
Nenhuma, a menos que se queira acrescentar uma categoria.

## O que muda (partes do sistema)
Só a secção `#separado` da landing e `docs/comercial/referencias-de-preco.md`.

## Passos
1. Reabrir **cada fonte** de `referencias-de-preco.md` e confirmar o preço atual; atualizar a taxa do BCE do dia e a data.
2. Recalcular em euros e os intervalos de cada categoria e a soma (só do que o Basic inclui).
3. Se o limite inferior da soma ficar **abaixo** do preço do Basic, o texto já avisa que a diferença é pequena; se ficar muito abaixo, **parar e dizer ao dono** antes de publicar.
4. Atualizar a data no texto, as linhas e a soma; correr a auditoria.
5. Nunca nomear concorrentes na página (D-53).

## Verificação
Cada número da página tem a sua linha no documento de referências, com fonte e data.

## Reversão
`git revert`.

## Registo
`referencias-de-preco.md` (data da revisão), DECISOES só se a metodologia mudar.
