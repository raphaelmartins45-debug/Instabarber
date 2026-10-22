# Atualizações (dormente)

> **Não se lê nem se executa nada daqui sem ordem do dono.** Faz parte do roteiro de
> expansões (Parte P) e do manual de expansões da Fase 9. Cada atualização tem um número
> **fixo** (nunca reutilizado) e um procedimento escrito em `U-NN-….md`.

## Como o dono pede

> «Executa as atualizações 1, 7, 9 e 32.»

## O que o Claude Code faz quando recebe esse pedido

1. **Ler só**: este ficheiro, `catalogo.md` (as linhas dos números pedidos) e os ficheiros `U-NN` pedidos, mais o que eles mandam ler. Nada mais (CLAUDE.md, §1).
2. **Validar o pedido.** Se um número não existe, está «Bloqueado» ou «Esboço», ou tem decisões do dono por responder, **parar e dizer qual e porquê**. Não adivinhar.
3. **Ordenar.** Dependências primeiro; depois menor risco primeiro. Verificar conflitos entre os itens pedidos (coluna «Conflita com» de cada ficheiro) e dizê-los.
4. **Resumo curto ao dono**: itens, ordem, risco, o que será tocado. Itens de risco **Alto**, ou que mexam em dados reais ou em chaves, esperam um «sim». Os de risco **Baixo** ou **Médio**, sem decisões pendentes, avançam sem parar (o dono já os pediu).
5. **Executar um item de cada vez**, com o protocolo de segurança abaixo, um commit por item.
6. **Registar** no fim de cada item (passo 7 do protocolo) e atualizar a coluna «Estado» do `catalogo.md`.

## Protocolo de segurança (vale para todos os itens)

A plataforma **nunca** fica inoperante nem a meio de uma alteração.

1. **Antes de começar:** repositório limpo e a passar `typecheck`, `lint`, `test`, `test:sql` e `build`. Se não passar, parar: o problema é anterior.
2. **Se toca na base de dados:** cópia de segurança fresca (P-13) e restauro testável (P-14). O esquema só muda por **migração nova**, em três tempos: *expandir* (acrescentar sem partir o antigo) → *migrar os dados* → *contrair* (só numa entrega posterior, nunca na mesma). Nunca apagar uma coluna ou função em uso na mesma entrega.
3. **Sítio de ensaio primeiro:** Supabase local e projeto de ensaio; depois deploy de pré-visualização na Vercel; só então produção, com ordem do dono para o que mexe na base de produção.
4. **Interruptor** para tudo o que é novo e visível, sempre que possível: entra desligado e liga-se depois de verificado.
5. **Plano de reversão** escrito e testado em ensaio antes de ir a produção (cada item tem a sua secção «Reversão»).
6. **Verificação final:** `typecheck`, `lint`, `test`, `test:sql`, `build`, mais os testes Playwright dos fluxos críticos (marcação sem conta, adesão, entrada de cada papel, painel). Se algum falhar: **reverter** e dizer ao dono. Não se deixa a meio.
7. **Registo:** `DECISOES.md` (decisão nova), `PROGRESSO.md` (linha da atualização), manual do operador se o processo mudou, versão no índice, estado no `catalogo.md`.

## Nunca

- Escrever chaves em código ou no repositório; usar a `service_role` fora do servidor.
- Instalar dependências fora da stack sem autorização escrita.
- Mexer em dados reais de barbearias sem ordem do dono.
- Executar um item cujos pré-requisitos falhem, ou saltar a validação do passo 2.
- Quebrar as regras do CLAUDE.md (§3) para fazer uma atualização «caber». Se um item o exigir, está escrito no item e precisa da ordem do dono.

## Reconciliação final (Fase 9)

Depois de o sistema estar completo, a Fase 9 confere cada procedimento com o código real, executa as receitas do mapa em ensaio e marca o estado de cada atualização. Até lá, são rascunhos fiéis à especificação.

## Aviso sobre os nomes de ficheiros

Estes procedimentos foram escritos **antes** de o código existir e referem a estrutura da B.4 e o esquema de `docs/esquema/`. Ao executar, confirmar os nomes reais com Glob e Grep. Se divergirem, seguir o código e **corrigir o procedimento** no mesmo commit.

## Modelo para uma atualização nova

Copiar `U-modelo.md`, dar-lhe o próximo número livre do `catalogo.md` e escrever o procedimento antes de a pedir.
