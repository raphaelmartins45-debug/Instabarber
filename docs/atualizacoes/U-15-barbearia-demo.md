# U-15 · Barbearia de demonstração

| | |
| --- | --- |
| **Estado** | Pronto após decisões |
| **Risco** | Médio |
| **Depende de** | Fases 3, 4 e 5 |
| **Conflita com** | U-16 (a página pode apontar para ela) |
| **Tempo estimado** | 1 a 2 dias |

## Quando se faz
Quando o dono quiser que um visitante experimente o **sistema real** (não a demonstração da landing).

## Decisões do dono necessárias
1. O visitante só **vê**, ou também pode marcar e mexer? (Recomendo marcar com dados que se repõem.)
2. Com que frequência se repõe? (Sem tarefas agendadas, D-16: reposição **à mão**, por função, pelo super_admin.)
3. Onde se liga: botão da landing, página própria.

## O que muda (partes do sistema)
- Inquilino com `slug` `demo` (não consta da lista reservada), marcado como demonstração por uma coluna nova (`e_demo boolean not null default false`), por migração em tempos (README, protocolo 2).
- **Exclusão obrigatória** das barbearias de demonstração de Finanças (receita, MRR, ponto de equilíbrio, objetivo), do Comercial (conversões) e de qualquer relatório da plataforma.
- Função `repor_demo()` (só super_admin, 2FA): apaga e recarrega os dados fictícios; script de dados fictícios em `docs/esquema/`.
- Limites por IP na marcação da demonstração; nenhum dado pessoal real aceite (aviso visível e validação).
- Sem WhatsApp nem e-mail reais a partir da demonstração.

## Passos
1. Migração e função; testes SQL: a demo não entra em nenhuma soma da plataforma; o isolamento com as barbearias reais não se altera.
2. Dados fictícios coerentes (equipa, serviços, clientes, selos, marcações).
3. Criar o inquilino em ensaio, depois em produção; botão na landing.

## Verificação
Testes de isolamento a passar; as Finanças e o Comercial não mudam com a demonstração; reposição devolve o estado inicial.

## Reversão
Eliminar o inquilino demo (P-18) e remover o botão; a coluna `e_demo` pode ficar.

## Registo
D-NN, Partes C e O, manual (nova rotina de reposição).
