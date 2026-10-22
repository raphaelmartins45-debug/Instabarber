# U-17 · Nova funcionalidade na grelha D.3 (modelo)

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Médio |
| **Depende de** | Fase 4 |
| **Conflita com** | Nenhum |
| **Tempo estimado** | Varia |

## Quando se faz
Sempre que se acrescenta uma funcionalidade que a Performa LAB liga e desliga (CLAUDE.md §6). Este é o procedimento-modelo.

## Decisões do dono necessárias
Nome, grupo, plano em que vem pré-marcada (Basic, Pro ou nenhum), se aparece com «upgrade» quando desligada (`mostra_upgrade`), preço (se mudar um plano: U-10).

## O que muda (partes do sistema)
- `docs/esquema/04_dados_iniciais.sql`: nova linha em `funcionalidades` e em `pacote_funcionalidades`; migração equivalente.
- Verificação **no servidor e na base de dados**, nunca só na interface: função SQL que diz se a barbearia tem a funcionalidade, usada por RLS ou funções do que ela protege.
- Menu, ecrã, botão e rota **saem** quando desligada (exceto `mostra_upgrade`); `lib/funcionalidades`.
- D.3 (regenerada), landing (lista de funcionalidades), manual (P-06).

## Passos
1. Escrever a funcionalidade **atrás da chave**, desligada por omissão.
2. Testes SQL: com a chave desligada, a escrita é recusada pela base de dados; testes Playwright: sem a chave, o ecrã e a rota não existem (404).
3. Atualizar a grelha, o pacote e a documentação.
4. Ligar numa barbearia de ensaio, verificar, e só depois no pacote.

## Verificação
Testes de contagem da grelha atualizados; chave desligada = zero efeitos; ligada = funciona e fica em auditoria.

## Reversão
Desligar a chave no pacote; o código desligado não é código morto (regra 13) e fica registado.

## Registo
D-NN, D.3, landing, PROGRESSO.
