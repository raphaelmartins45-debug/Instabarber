# U-19 · Pedido pequeno de alteração (cor, texto, layout, campo)

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo (sobe para Médio se tocar em esquema ou em regras) |
| **Depende de** | Sistema no ar; `docs/mapa-do-sistema.md` preenchido |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 0,25 a 1 dia |

## Quando se faz
Sempre que o dono pedir uma alteração pequena em linguagem corrente: «muda a cor da página tal», «troca este texto», «põe este botão ali», «acrescenta este campo».

## Decisões do dono necessárias
Só se o pedido for ambíguo (qual página, qual cor). Perguntar **uma vez**.

## O que muda (partes do sistema)
Depende do tipo. A classificação e a tabela de receitas estão em `docs/mapa-do-sistema.md` (secções 1 a 3). **Configuração de uma barbearia nunca é código** (regra 2).

## Passos
1. Ler `docs/mapa-do-sistema.md`. Classificar o pedido e localizar o sítio (secções 1 a 3).
2. Se o pedido for **configuração de uma barbearia**, fazer pelo painel ou função existente, não por código.
3. Mudar **ao nível certo** (token, chave de texto, configuração), nunca com um valor copiado por vários ficheiros.
4. Deploy de pré-visualização e capturas antes e depois (computador, 390 e 360 px) das camadas afetadas.
5. `typecheck`, `lint`, `test`, `build`; `test:sql` se mexeu no esquema; `scripts/auditar-landing.py` se mexeu na landing.
6. Mostrar o antes e o depois ao dono e esperar o «ok» (dispensado em mudanças triviais que ele já tenha mandado fazer).
7. Publicar. Se algo correr mal, repor o deploy anterior na Vercel (imediato).
8. Atualizar o mapa se o pedido mudou uma estrutura; `DECISOES.md` se for decisão (cor da marca, regra).

## Verificação
O antes e o depois confirmam só o que foi pedido, sem outras páginas alteradas; todos os testes passam; sem scroll horizontal.

## Reversão
Repor o deploy anterior na Vercel e `git revert` do commit.

## Registo
Commit com a mudança; `DECISOES.md` se aplicável; mapa atualizado.
