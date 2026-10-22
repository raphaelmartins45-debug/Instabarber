# U-05 · Ativar o Brasil

| | |
| --- | --- |
| **Estado** | Pronto após P.5 |
| **Risco** | Alto |
| **Depende de** | U-18 (fuso por barbearia) e Fases 1 a 8 |
| **Conflita com** | U-18 tem de vir antes; não fazer dois países ao mesmo tempo |
| **Tempo estimado** | 5 a 10 dias, mais pareceres |

## Quando se faz
Quando o dono mandar ativar o país, depois de responder às perguntas da secção **P.5** da Parte P.

## Decisões do dono necessárias
As perguntas ao dono da secção P.5 da Parte P (entidade que fatura, preço, piloto, quem escreve os textos, apoio).

## O que muda (partes do sistema)
Tudo o que a **Parte P** lista em P.2 e P.3, para pt-BR. Esta atualização **não duplica** o procedimento: executa-o.

## Passos
1. Ler `docs/parte-p-roteiro-de-expansoes.md`: P.0, P.1, P.2, P.3 e a secção P.5.
2. Executar primeiro a **U-18** (fuso por barbearia), se ainda não estiver feita.
3. Criar `fases/fase-x-<pais>.md` no formato das outras fases e **esperar a confirmação do dono** (CLAUDE.md §4). Esta atualização é sempre de risco Alto: não avança sem «sim».
4. Seguir P.3 do passo 1 ao 10, com o teste de não regressão de Portugal.
5. Pareceres do jurista e do contabilista do país arquivados em `docs/expansao/<pais>/` antes de abrir.

## Verificação
Os critérios de saída de cada passo de P.3. Suite SQL de Portugal e critérios J.1 sem alterações.

## Reversão
Reverter a migração que alargou os `check` de país, fuso, moeda e idioma: só é possível enquanto nenhuma barbearia do país novo existir. Depois disso, a reversão é suspender o país (as barbearias passam a «suspensas», P-09), nunca apagar dados.

## Registo
D-NN, PROGRESSO, `docs/expansao/<pais>/`, manual de expansões.
