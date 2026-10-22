# U-03 · Multilinguagem (PT, EN, FR) incluída no plano Pro

| | |
| --- | --- |
| **Estado** | Pronto após decisões |
| **Risco** | Baixo |
| **Depende de** | Fases 4 e 5 |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 0,5 dia |

## Quando se faz
Se o dono decidir que a página em três línguas passa a vir no Pro, em vez de ser ativada à parte pela Performa LAB (hoje: `multilinguagem` não está em nenhum pacote).

## Decisões do dono necessárias
1. As barbearias Pro **já existentes** recebem a funcionalidade automaticamente, ou só as novas? (O pacote pré-marca; o interruptor decide: quem já existe não é alterado por omissão.)
2. Mantém-se também no Basic como «não»?

## O que muda (partes do sistema)
- `docs/esquema/04_dados_iniciais.sql`: o pacote Pro deixa de excluir `multilinguagem` (a linha `where chave <> 'multilinguagem'`). Esta é a fonte única da grelha; a tabela D.3 gera-se a partir dela.
- Migração nova com `insert into pacote_funcionalidades (plano, chave) values ('pro','multilinguagem') on conflict do nothing`, e, se a decisão 1 for «sim», o `insert` correspondente em `inquilino_funcionalidades` para as barbearias Pro (com auditoria).
- Landing: o bloco «Página em vários idiomas» passa de «Ativamos a pedido» para «Incluído no plano Pro».
- D.3, CLAUDE.md §6 se mencionar a grelha, comparação de preços (a linha dos idiomas, se existir).

## Passos
1. Alterar `04_dados_iniciais.sql` e criar a migração; correr os testes SQL (a grelha tem testes de contagem: atualizar os valores esperados no mesmo commit).
2. Regenerar D.3 (`scripts/gerar-mestre.sh`).
3. Atualizar a landing e o texto do plano.
4. Verificar numa barbearia Pro de ensaio: a página pública mostra o seletor de idioma; no Basic não.

## Verificação
Testes SQL da grelha a passar; Pro com a chave, Basic sem ela; a página pública em PT, EN e FR (I.3.2) sem textos em falta.

## Reversão
Migração inversa (`delete` das linhas inseridas) e repor a linha do `04_dados_iniciais.sql`.

## Registo
D-NN, D.3, landing, PROGRESSO.
