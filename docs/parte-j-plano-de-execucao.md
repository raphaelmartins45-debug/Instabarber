## Parte J · Plano de execução

Nove fases, de 0 a 8. Cada fase termina com um resultado verificável, e não se
avança sem ele confirmado pelo dono. Cada fase entrega os seus ecrãs já
adaptados ao telemóvel: a responsividade não é uma fase nem trabalho do fim.

| Fase | Foco | Resultado verificável | Dias |
| --- | --- | --- | --- |
| 0 | Preparação | Repositório com o `package.json` da B.3, `npm audit` limpo, `.env*` no `.gitignore`, deploy em branco na Vercel | 2 |
| 1 | Base de dados | Esquema de `docs/esquema` aplicado no Supabase local e no projeto de ensaio; os 389 testes SQL a passar; tipos gerados | 2 |
| 2 | Autenticação e papéis | Cinco papéis a entrar, cada um no seu painel; convite do barbeiro; código de acesso do cliente; 2FA do super_admin; uma conta em duas barbearias | 4 |
| 3 | Administração e adesão | Uma barbearia criada de ponta a ponta pela interface: formulário, pedido, aprovação, pacote, convite do dono, importação CSV | 6 |
| 4 | Painel da barbearia | O dia a dia gerido no sistema: agenda ao balcão, clientes, radar, ficha técnica, ausências, equipa, financeiro, comissões e acertos, Gestão do sistema, O meu plano | 10 |
| 5 | Motor de agenda e cliente | Um cliente entra pela página pública e marca sem conta; duas reservas simultâneas não ocupam o mesmo horário; política de faltas; área de cliente | 7 |
| 6 | Mensagens, módulos e relatório | Mensagens abertas e registadas; e-mails de confirmação; filas; clube, loja e cartões oferta; relatório mensal; módulos de pagamentos e faturação desligados e invisíveis | 11 |
| 7 | Publicação | Produção com domínio, HTTPS, subdomínios, cópias de segurança e documentos legais publicados | 3 |
| 8 | Operação | Barbearia real em uso, rotina de operação, restauro testado | 2 |
| | **Total** | | **47** |

**Extensões:** a Fase 3B (Comercial, Parte N) e a Fase 3C (Finanças da Performa LAB, Parte O) entram depois da Fase 3: 6 e 5 dias, fora do total acima. A Fase 9 (manuais operacionais, 7 dias) vem depois da Fase 8. A 3C entrega: custos e contas a pagar, lucro, ponto de equilíbrio, objetivo com «quantas barbearias faltam», previsões e lembretes de vencimento. Resultado: um lead percorre o funil, recebe proposta em PDF, o contrato sai da proposta aceite e o convite de adesão chega ao dono preenchido.

Cada ficheiro de `fases/` diz que secções ler e o que entregar. Os critérios
abaixo são copiados para `fases/criterios-de-aceitacao.md` pelo
`scripts/gerar-mestre.sh`.

### J.1 · Critérios de aceitação

O sistema está concluído quando todos os pontos abaixo estiverem verificados,
cada um testado com o utilizador do papel certo.

**Segurança e isolamento**
- Os 389 testes de `docs/esquema/testes` passam no Supabase local e num projeto de ensaio com as mesmas migrações da produção (nunca na produção: criam dados de teste).
- Uma barbearia nunca lê dados de outra, mesmo com o identificador correto.
- Um profissional vê só as marcações, os clientes e os valores dele; não altera a própria comissão.
- O dono não liga funcionalidades nem muda o plano, nem por pedido direto à base de dados.
- O cliente final vê apenas o que é seu e não escreve em nenhuma tabela.
- O super_admin sem segundo fator não vê nada.
- O InstaBarber Admin só abre em `instabarber.pt/admin`; nos endereços das barbearias, `/admin` responde «página não encontrada».
- A chave de serviço não aparece em nenhum ficheiro que chegue ao browser.
- `.env.local` está no `.gitignore` e nenhuma chave está no repositório.

**Comercial (Fase 3B)**
- O módulo Comercial só abre ao super_admin com segundo fator, em `instabarber.pt/admin`.
- O formulário do site cria um lead; um contacto repetido não cria outro e o abuso é limitado.
- A proposta usa a fórmula da D.7, com e sem IVA, e depois de enviada não se altera.
- O contrato só se gera de uma proposta aceite e de um modelo aprovado; assinado, não se altera; o lead passa a ganho só por assinatura.
- O convite de adesão pré-preenche o formulário sem palavra-passe e liga o contrato ao inquilino na aprovação.
- Os PDFs dizem «Não é documento fiscal».

**Finanças da Performa LAB (Fase 3C)**
- O módulo Finanças só abre ao super_admin com segundo fator, em `instabarber.pt/admin`.
- Todos os indicadores, o lucro, o ponto de equilíbrio e as metas calculam-se sem IVA, e batem com um exemplo feito à mão.
- O objetivo mostra quantas barbearias Basic, quantas Pro e quantas da mistura atual faltam.
- As previsões mostram os pressupostos e dizem que não são promessa.
- O lembrete de vencimento por WhatsApp só fica confirmado depois de o operador confirmar; o de e-mail fica enviado ou falhou; nada é automático nem agendado.
- Os ficheiros exportados dizem «Não é documento fiscal».

**Administração e adesão**
- O administrador cria uma barbearia nova em menos de cinco minutos, com logótipo, serviços e equipa.
- O formulário calcula a mensalidade em tempo real, com e sem IVA, mensal e anual, e a conta bate com a D.5.
- O formulário mostra o que está contratado e recalcula quando muda o plano, a periodicidade ou os profissionais.
- O formulário nunca recolhe palavra-passe; o resumo da contratação em PDF nunca a imprime e diz «Não é documento fiscal».
- O pedido aparece em Pedidos sem intervenção manual; a notificação indica barbearia, plano, profissionais, mensalidade e preferência de pagamento.
- Aprovar cria o inquilino ativo com a marca e o pacote aplicados, num só clique; o dono define a palavra-passe pela ligação recebida.
- A importação CSV grava os clientes válidos, mostra os inválidos e não dá consentimento a ninguém.

**Painel da barbearia e do profissional**
- A barbearia vê a sua marca e a sua cor sem intervenção técnica.
- Uma funcionalidade inativa não aparece (menu, botão, rota), exceto as marcadas «Upgrade», que aparecem desativadas com a chamada.
- No Basic, o lembrete individual e os selos funcionam; as mensagens de recuperação e em lote mostram a chamada de upgrade e não abrem por endereço direto.
- No Basic, não é possível ter mais de um profissional ativo.
- O barbeiro registado recebe o convite por e-mail e define a sua palavra-passe; o NIF nunca é palavra-passe.
- A classificação no painel do barbeiro usa só o histórico com ele; no painel do gestor, o histórico com a barbearia.
- Os objetivos definidos no Financeiro aparecem na área do profissional.
- Comissões: a percentagem por serviço substitui a de omissão; hora morta → comissão sobre o preço com desconto; crédito do clube → comissão sobre o valor de tabela; alterar percentagens não muda o passado.
- Os acertos seguem os três modelos e um acerto liquidado não se reescreve.
- Loja: margem sobre o preço sem IVA; margem negativa avisa e não bloqueia; o stock só desconta ao levantar; alterar o custo não muda vendas registadas.
- Ausências e férias tiram as vagas do barbeiro na página pública.

**Agenda e cliente final**
- Um cliente marca pela página pública sem criar conta; a vaga fica reservada 10 minutos com contagem visível.
- Um número novo escolhe a palavra-passe na primeira marcação e entra logo na área de cliente; um número que já tem ficha só cria acesso pelo código.
- Duas reservas simultâneas na mesma vaga: uma é recusada.
- Uma marcação cancelada ou falta liberta o horário.
- Nos dias de mudança de hora, as vagas aparecem às horas locais certas.
- O cliente cria ou recupera o acesso pelo código enviado pela barbearia; sem o código, ninguém define a palavra-passe de outro.
- Com a política de faltas, o cliente acima do limite não confirma marcações online até o gestor o permitir.
- Uma marcação criada pelo cliente aparece de imediato na agenda da barbearia e do profissional.

**Mensagens e relatório**
- O envio em lote abre o WhatsApp do cliente certo, com a mensagem personalizada e o registo gravado; o mesmo mecanismo na recuperação, nos lembretes e nas filas.
- Clientes sem consentimento ou com «não contactar» nunca entram em mensagens promocionais.
- A confirmação por e-mail chega ao cliente que deu e-mail.
- O relatório mostra os nove blocos e percorre os últimos doze meses; os valores coincidem com os do Início e do Financeiro.
- O PDF do relatório sai com a cor e o logótipo da barbearia, e o do profissional com o nome dele.

**Módulos desligados**
- Com os módulos desligados, nenhum ecrã da barbearia mostra pagamentos ou faturas, e a rota do webhook responde 404.
- Ligar e desligar um módulo faz-se no painel de administração e fica em auditoria.

**Operação**
- O administrador exporta os dados de uma barbearia em CSV e elimina uma barbearia cancelada, com as contas que ficam sem uso.
- Ligar o domínio próprio acrescenta 5,00 € à mensalidade, pela fórmula da D.7.
- O manual do operador foi revisto com o sistema real: cada procedimento feito uma vez, com capturas de ecrã.

**Interface**
- As quatro camadas foram testadas num telemóvel real, iOS e Android, com criar, consultar, alterar e apagar.
- Nenhuma ação existe no computador e falta no telemóvel; abaixo de 768 px, as tabelas são cartões.
- O painel de administração funciona no telemóvel, com os dez separadores por passos.
- A página pública abre no endereço da barbearia, com a capa a servir de cabeçalho, as três ações fixas no fundo e contraste mínimo de 4,5 para 1.
- A página pública é indexável com dados estruturados; a área de cliente e os painéis não.
- Um bloco sem conteúdo não ocupa espaço.
- Com `multilinguagem` desligada, só português e sem seletor; ligada, a língua do dispositivo, o seletor PT · EN · FR sem recarregar, e os nomes dos serviços em inglês ou francês quando o dono os escreveu.
- Os painéis não têm vestígios de inglês ou francês; nenhum texto está em português do Brasil.
- Preços finais ao cliente iguais em qualquer regime de IVA da Prestadora: com a isenção, a taxa é 0 % e a fatura diz «IVA – Regime de Isenção».

**Processo**
- O `PROGRESSO.md` reflete o estado real de cada fase.
- Antes de cada entrega: `typecheck`, `lint`, `test`, `test:sql` e `build` sem erros; sem código morto (com a exceção da regra 13); uma funcionalidade, um só gerador.
- Uma restauração de cópia de segurança foi testada antes do primeiro cliente real.

### J.2 · Alteração do plano

- **Basic para Pro:** a Performa LAB muda o plano e o número de profissionais contratados no painel e chama «Repor pacote». Ficam disponíveis os três profissionais incluídos, as metas, as mensagens de recuperação, aniversário e avaliação, o envio em lote e os módulos de receita.
- **Pro para Basic:** no painel de administração, a Performa LAB escolhe com o dono o profissional que fica como titular; os restantes são desativados antes da mudança (a base de dados não aceita mais profissionais ativos do que os contratados). Perdem o acesso ao painel; os dados, o histórico e o nome nos registos ficam. As marcações futuras deles passam para a lista de marcações sem profissional.
- **Mensal para anual, ou o contrário:** muda a periodicidade e a próxima fatura; não mexe nas funcionalidades.
- Toda a alteração fica em auditoria com data e autor. Não há cobrança automática: a Performa LAB emite a fatura pelos seus meios.

### J.3 · O ficheiro PROGRESSO.md

Mantido na raiz e atualizado no fim de cada fase: estado (Pendente, Em curso,
Concluída), data, resultado verificado e testes. Uma fase só passa a Concluída
quando o resultado foi observado e o dono confirmou — não quando o código foi
escrito.

### J.4 · O que o assistente reporta em cada fase

- **No início:** o que vai construir, os ficheiros que vai criar e o que não vai fazer nesta fase. Espera a confirmação.
- **Durante:** um aviso curto sempre que uma decisão não estiver prevista. Decisões de produto nunca se tomam sozinhas.
- **No fim:** o resultado verificável, o resultado dos testes e o que ficou por fazer.
- **Em caso de falha:** o erro, a causa, a correção, e se a fase fica concluída ou volta a Em curso.
- **Sempre:** atualizar o `PROGRESSO.md` antes de começar a fase seguinte.

### Nota sobre a marca — ler antes de publicar

O nome InstaBarber refere-se ao instante: marca-se num instante, encontra-se o
cliente perdido num instante, fecha-se a conta num instante. Não tem relação
com o Instagram nem com a Meta.

Existe uma marca INSTA registada na União Europeia, detida pela Meta. O registo
português da marca InstaBarber não foi pedido, deliberadamente, e não deve ser
pedido durante a versão 1: é no pedido de registo que uma oposição aparece.
Antes de investir em publicidade paga, pedir parecer a um advogado de marcas.

Três regras para todo o material, digital e impresso:

- Não imitar nada do Instagram: nem o gradiente, nem a câmara, nem a tipografia, nem o tom.
- Não usar a palavra em contextos que sugiram rede social ou partilha de fotografias. O produto é um sistema de gestão para barbearias.
- Escrever sempre «InstaBarber», com as duas maiúsculas, e nunca «Insta».

O código não depende do nome: o domínio vive nas variáveis de ambiente e os
rótulos em `lib/vertical`.
