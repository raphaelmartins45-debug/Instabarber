# U-13 · Painel «Hoje» no Admin

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo |
| **Depende de** | Fases 3, 3B e 3C |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 1 dia |

## Quando se faz
Quando o dono quiser abrir o Admin e ver, num só ecrã, o que pede ação hoje.

## Decisões do dono necessárias
Nenhuma. Por omissão: mostra só **leitura**, sem ações novas.

## O que muda (partes do sistema)
Um ecrã novo no Admin (super_admin com 2FA) que **lê** vistas e funções já existentes, sem tabelas novas: leads novos e sem resposta, propostas a vencer, pedidos de adesão pendentes, mensalidades a vencer e atrasadas (`vencimentos_proximos`), contas a pagar em 7 dias e atrasadas (`contas_pagar_com_estado`), lembretes preparados e não confirmados, leads incompletos (aba «Incompletos» da Fase 3B, D-50).

## Passos
1. `Grep` pelas vistas e funções no esquema; **não duplicar lógica**: cada contagem usa a função ou vista da sua Parte.
2. Repositório `lib/repositorios/admin-hoje.ts`; componente com cartões que levam ao ecrã de origem.
3. Paridade mobile (cartões abaixo de 768 px).
4. Testes: só o super_admin vê; zero dados de barbearias no painel além do nome e do estado.

## Verificação
Os números do painel coincidem com os dos ecrãs de origem; um utilizador sem 2FA não acede.

## Reversão
Remover a rota e o item de menu. Sem alterações à base de dados.

## Registo
PROGRESSO, manual (P-01).
