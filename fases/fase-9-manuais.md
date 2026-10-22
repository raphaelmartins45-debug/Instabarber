# Fase 9 — Manuais operacionais (final)

| | |
| --- | --- |
| **Foco** | Os manuais que permitem a qualquer pessoa operar o InstaBarber: do primeiro contacto com a barbearia a um ano de pós-venda, resolução de problemas e expansões |
| **Resultado verificável** | Uma pessoa que não construiu o sistema, seguindo só os manuais, conduz um cenário completo (lead, proposta, contrato, adesão, primeira semana, um problema simulado) sem pedir ajuda; e o dono opera uma ativação de ensaio da Parte P só com o manual de expansões |
| **Dias estimados** | 7 (extensão final; não conta para os 47 das nove fases) |

## Quando

**Só depois da Fase 8 e de tudo estar construído e conferido**, com o sistema pronto, publicado e testado numa barbearia real. Os manuais descrevem os ecrãs e os problemas **reais**, com capturas do sistema a funcionar. Não se escrevem antes (D-52). Não depende de nenhuma fase nova de código.

## Antes de começar

Apresenta o resumo do que vais escrever, a estrutura dos manuais e as capturas que vais fazer, e espera pela minha confirmação.

## Ler nesta fase

- `CLAUDE.md` (todo)
- `docs/manual-do-operador.md` (a base: P-00 a P-27; é reorganizado, não descartado)
- `docs/parte-m-operacao-e-suporte.md`, `parte-n-…`, `parte-o-…`, `parte-p-roteiro-de-expansoes.md`
- `docs/parte-l-publicacao-dominios-e-custos.md` (chaves, domínios, cópias de segurança)
- `DECISOES.md` e `PROGRESSO.md` (o que de facto foi construído)
- O que aconteceu no piloto (problemas, perguntas do cliente, apoio prestado)

## O que escrever

Tudo em `docs/manuais/`, um ficheiro por manual, em português de Portugal, com a assinatura «InstaBarber · Performa LAB» (D-44). Cada passo diz **onde clicar**, **o que se vê** e **o que fazer se for diferente**.

**1. Manual do ciclo de vida da barbearia (do 1.º contacto a 12 meses)**
- [ ] Linha do tempo: primeiro contacto, qualificação, demonstração, proposta, contrato, adesão, primeira semana, 30 dias, 90 dias (desafio, D-36), 6 meses, renovação aos 12 meses, saída.
- [ ] Em cada etapa: objetivo, ecrãs do sistema, mensagens modelo (WhatsApp e e-mail), checklist e o que medir.
- [ ] Pós-venda: contactos de acompanhamento, relatório mensal explicado à barbearia, quando propor Pro, domínio próprio ou mais profissionais, mensalidade em atraso, pedido de testemunho, saída e exportação.

**2. Manual comercial**
- [ ] Guião de conversa de 20 minutos; como usar a calculadora; resposta às objeções mais comuns; como ler o funil e as taxas; o que se promete e o que nunca se promete (desafio, preços, IVA, «Feito em Portugal»).

**3. Guia de resolução de problemas**
- [ ] Por sintoma, não por módulo: «a barbearia não consegue entrar», «a agenda mostra uma vaga ocupada que está livre», «a mensagem não abre o WhatsApp», «o e-mail não chegou», «o domínio próprio não funciona», «o cliente não recebe o código», «o formulário do site não envia», «mensalidade em dúvida», «cópia de segurança falhou», «o site está lento ou em baixo».
- [ ] Cada entrada: como confirmar, causa provável, solução passo a passo, como evitar, quando parar e escalar (suporte da Vercel, da Supabase, do Resend, jurista, contabilista).
- [ ] Árvore de decisão de incidentes: dados de outra barbearia visíveis (parar tudo), violação de dados (P-19), serviço em baixo.

**4. Manual de apoio ao cliente**
- [ ] Perguntas frequentes por perfil: gestor, barbeiro, cliente final. Respostas curtas, prontas a copiar. Horários e prazos de resposta.

**5. Calendário de operação (semanal, mensal, anual)**
- [ ] Tudo o que tem data: cópia de segurança, testes de restauro, feriados do ano, renovação de domínios e certificados, contas a pagar, vencimentos e lembretes, relatórios mensais, apagar leads antigos, limite de faturação isenta, revisão de preços, revisão jurídica.

**6. Manual de expansões (para o dono)**
- [ ] Versão operacional da Parte P: o que dizer para ativar cada expansão, que perguntas esperar, que profissionais contratar e que documentos pedir-lhes, o que verificar antes e depois, como correr o piloto, e como saber se correu bem. Cobre Espanha, Brasil, outros países e MB Way online, e explica como pedir atualizações por número (`docs/atualizacoes/`).

**7. Manual de passagem de testemunho**
- [ ] Para quem entra na operação: acessos e como os pedir, regras que não se quebram, o que nunca fazer, como escrever em nome da marca, onde está cada coisa. Pode ser seguido por alguém que nunca viu o projeto.

**8. Manual de atualizações e alterações (para o dono)**
- [ ] Como pedir mudanças em linguagem corrente («muda a cor da página tal») e por número («executa as atualizações 1, 7 e 9»), com exemplos reais do sistema no ar.
- [ ] O catálogo `docs/atualizacoes/catalogo.md` em linguagem simples: o que cada atualização faz, quanto custa em tempo e risco, o que ele tem de decidir antes, e o que vê no fim.
- [ ] O que esperar de cada pedido: o resumo, o antes e depois, o «ok», a publicação e como se repõe a versão anterior.
- [ ] O que é configuração (faz-se no painel, sem pedir nada) e o que é código (pede-se).

**9. Manual do desenvolvedor (para o Claude Code)**
- [ ] `docs/mapa-do-sistema.md` **final**: todos os caminhos «confirmar» resolvidos com o código real; `docs/mapa-gerado.md` regenerado.
- [ ] **Cada receita da secção 3 do mapa executada de verdade** num ambiente de ensaio (mudar uma cor, um texto, um campo, uma funcionalidade…), com o resultado anotado. Uma receita que não funcionou é corrigida ou marcada «não verificada».
- [ ] **Cada procedimento `U-NN` reconciliado com o código real**: nomes de ficheiros, funções e tabelas corrigidos; passos que já não se aplicam, retirados; o estado do `catalogo.md` atualizado (por exemplo, «Verificado a dd/mm/aaaa»). Os que não se podem ensaiar (por exemplo, ativar um país) ficam «Reconciliado, não ensaiado».
- [ ] Índice das armadilhas conhecidas: o que partiu durante a construção, e como se evitou.
- [ ] Teste de arranque: uma sessão nova, só com o `CLAUDE.md` e o mapa, resolve um pedido pequeno sem perguntar onde está nada.

**10. Capturas e vídeos**
- [ ] Capturas dos ecrãs reais (Playwright, dados fictícios), sem dados pessoais.
- [ ] O vídeo de 30 s da landing (D-50), gravado no painel real, com autorização por escrito da barbearia piloto.
- [ ] Vídeos curtos de «como fazer» só para as tarefas mais frequentes (decisão do dono nessa altura).

## Formato de entrega

Ficheiros Markdown em `docs/manuais/`, como fonte de verdade. A forma de os partilhar (documento publicado, PDF ou área de ajuda no sistema) decide-se nessa altura. Se for uma área de ajuda dentro do sistema, é trabalho de código e precisa da sua própria fase.

## Verificação

- [ ] **Teste do estranho:** alguém que não construiu o sistema segue os manuais e conclui o cenário sem ajuda; as dúvidas dele entram nos manuais.
- [ ] O **teste de arranque** do manual do desenvolvedor passa: uma sessão nova resolve um pedido pequeno só com o `CLAUDE.md` e o mapa.
- [ ] Cada instrução tem um ecrã ou comando real que existe (sem referências a funções inexistentes).
- [ ] Auditoria de escrita: português de Portugal, sem erros, sem nome pessoal do dono, sem chaves nem dados reais.
- [ ] Cada problema do guia de resolução foi reproduzido, ou marcado como «não reproduzido».
- [ ] Ligações internas todas válidas.

## No fim da fase

Atualiza o `PROGRESSO.md` e espera pela minha confirmação.
