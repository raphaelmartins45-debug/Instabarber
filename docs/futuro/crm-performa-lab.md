# Painel comercial da Performa LAB (CRM multisserviço) · para construir mais tarde

Estado: **planeado, não construído** (dono, 27/10/2026). Por agora o comercial trabalha no CRM do
InstaBarber (Admin → Comercial), com um comercial e leads da landing e da prospeção. Este
documento guarda a ideia para quando a Performa LAB vender mais serviços.

## Objetivo

Uma ferramenta para os comerciais da Performa LAB prospetarem, fazerem o briefing e guardarem os
leads de **todos os serviços** da Performa, não só do InstaBarber. É um painel separado do
InstaBarber, com a marca da Performa LAB.

## Arquitetura proposta

- **Endereço próprio** (por exemplo `crm.performalab.pt`; enquanto não houver domínio,
  `crm.instabarber.pt`). Só entram os comerciais e os gestores da Performa, com dois fatores.
- **Mesmo código e mesma base de dados, numa área própria.** Reaproveita o CRM do InstaBarber, que
  já está feito e testado: funil, leads, histórico, agenda «Hoje», mensagens prontas, ficha de
  prospeção, propostas, contratos, comissões, carteira e desempenho. As contas da equipa são as
  mesmas.
- **Catálogo de serviços** (tabela própria): nome, descrição, forma de cobrança (preço fixo,
  mensalidade ou orçamento), preço base, modelo de proposta e de contrato. Cada lead liga-se a um ou
  mais serviços; o funil, os relatórios e as comissões filtram por serviço.
- **Ficha de prospeção comum** a todos os serviços (a mesma do InstaBarber, ver «Ficha de
  prospeção» em `docs/mapa-do-sistema.md`): empresa, morada, Instagram, avaliação do Google, quem
  atendeu e se decide, origem e consentimento, serviços de interesse, situação atual (o que usa,
  quanto paga, fim do contrato), temperatura, próxima ação com data.
- **Perguntas por serviço:** cada serviço tem o seu modelo de briefing, editável no painel sem
  programar. O InstaBarber mantém o briefing de 7 passos atual.
- **Propostas e contratos por serviço:** o InstaBarber mantém a fórmula da D.7; os outros
  serviços usam o preço e os modelos do catálogo.
- **Ligação ao InstaBarber:** o formulário do site do InstaBarber cria leads no CRM marcados
  «InstaBarber»; ganhar um lead do InstaBarber gera o convite de adesão e a aprovação como hoje. O
  Admin do InstaBarber fica só com a operação (barbearias, pagamentos, finanças, saúde).
- **Migração:** os leads, briefings, propostas e contratos do CRM do InstaBarber passam para o
  CRM da Performa sem se perder o histórico.

## Decisões que faltam

1. Que serviços da Performa entram no catálogo e como se cobra cada um.
2. O endereço (a Performa LAB tem domínio próprio?).
3. Se o Comercial sai por completo do Admin do InstaBarber (recomendado: um só sítio para todos os leads).
4. Se os comerciais vendem todos os serviços ou cada um tem os seus (muda a distribuição dos leads e as comissões).
5. As comissões por serviço.

## Quando avançar

Quando houver um segundo serviço da Performa para vender ou um segundo comercial. Estimativa:
uma fase própria, depois do guia do gestor da barbearia e da formação dos comerciais.
