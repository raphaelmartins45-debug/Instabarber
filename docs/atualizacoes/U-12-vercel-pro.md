# U-12 · Passar a Vercel de Hobby a Pro

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo |
| **Depende de** | Fase 7 |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 0,25 dia |

## Quando se faz
Quando a receita o permitir (CLAUDE.md §8, D-15). O plano Hobby não permite uso comercial.

## Decisões do dono necessárias
A data da mudança e o cartão de pagamento (ação do dono na Vercel; Claude Code não paga nem cria contas).

## O que muda (partes do sistema)
Só configuração. Nada no código depende do plano.

## Passos
1. O dono passa o projeto a Pro no painel da Vercel.
2. Confirmar que as funções continuam em `fra1`, os domínios e as variáveis de ambiente.
3. Registar o novo custo em Finanças (custo fixo, categoria infraestrutura).
4. Remover a nota do plano Hobby do CLAUDE.md §8 e da Parte L, se existir.
5. Verificar os limites de duração e de tamanho das funções (rota de contacto, exportações) e ajustar se o Pro os alargar.

## Verificação
Deploy de produção normal; o painel mostra o plano Pro; o custo aparece nas Finanças.

## Reversão
O dono pode voltar ao Hobby no painel (se ainda o permitir).

## Registo
D-NN, CLAUDE.md §8, Parte L, Finanças.
