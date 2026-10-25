# DECISOES.md — InstaBarber

Decisões tomadas e porquê. Em caso de contradição entre ficheiros, **prevalece a
decisão mais recente deste registo**. Cada decisão nova acrescenta-se no fim,
com data; uma decisão revista não se apaga, marca-se como substituída.

> Nota: o ficheiro recebido para a revisão 10.1 começava na secção 8. As
> secções 1 a 7 da versão anterior não estavam no ficheiro; se existirem noutra
> cópia, acrescentar aqui com a data original.

---

## Anteriores à versão 10.1

### 8 · Endereços de correio — 20 de outubro de 2026

Cinco endereços, uma caixa e quatro alias: geral@, raphaelmartins@, comercial@,
apoio@, privacidade@. O endereço segue a natureza da mensagem, não quem escreve.
Zoho Mail Lite a cerca de 1 EUR/mês. O privacidade@ vai para a Política de Privacidade.

### 9 · Lacunas fechadas no documento — 20 de outubro de 2026

- **L.2** — os cinco endereços de correio e a regra que decide qual usar
- **D.3** — quem liga as funcionalidades: só a Performa LAB, e o que desaparece quando se desliga
- **F.4.4** — os ecrãs da loja: os dois separadores, os quatro estados dos pedidos e a regra do stock

---

## Versão 10.1 — auditoria de 21 de outubro de 2026

Decisões do dono (Raphael Martins) marcadas «dono»; decisões técnicas da
revisão marcadas «técnica».

### D-01 · Sem pagamentos nem faturação na versão 1 — dono
A plataforma não processa pagamentos nem emite documentos fiscais. Todo o
dinheiro é registado, nunca cobrado. O tema volta a ser avaliado aos 50 clientes.
Consequências: «recibo» passa a «resumo» (D.11, F.4.2) e todos os PDF dizem
«Não é documento fiscal».

### D-02 · Pagamentos e faturação preparados e desligados — dono
Os módulos existem na versão 1 (G.4), testados, desligados ao nível da
plataforma e invisíveis para a barbearia. Liga-os o super_admin no painel de
administração, barbearia a barbearia, sem mexer no código. As chaves dos
fornecedores colam-se uma vez no painel da Vercel. Não entram na grelha D.3.

### D-03 · Emitente por profissional — dono
Na maioria das barbearias o barbeiro é independente e emite a sua fatura-recibo.
O emitente decide-se pelo modelo de caixa do profissional (A → barbearia;
B e C → barbeiro) e fica gravado em cada visita. Três modos de emissão:
programa certificado ligado, Portal das Finanças à mão (o sistema prepara os
dados e regista o número) ou nenhum. A validar com um contabilista certificado
antes de qualquer ativação.

### D-04 · Faturação por programa certificado — técnica (recomendação aceite)
A via preparada é a integração com Moloni ou InvoiceXpress, uma conta por
emitente. Certificar o próprio InstaBarber na AT fica para depois dos 50 clientes.

### D-05 · Fornecedor de pagamentos por decidir — pendente
O módulo usa um adaptador; na versão 1 só existe o adaptador «simulado».
Escolher entre ifthenpay, Eupago e Stripe antes de ativar.

### D-06 · Acesso do cliente por código enviado pela barbearia — dono
O cliente prova que o telemóvel é dele com um código de 6 dígitos que o sistema
gera e a barbearia envia por wa.me (válido 15 minutos, 5 tentativas, 3 pedidos
por hora). Serve para criar e para recuperar a palavra-passe.
Consequências técnicas:
- **Marcar não exige conta.** Como o código depende de alguém da barbearia, uma
  marcação às 23h não pode esperar por ele. A marcação pede nome e telemóvel; a
  conta (área de cliente, selos, histórico) é opcional e ativa-se pelo código.
- **Uma conta por cliente e por barbearia.** A conta de autenticação usa um
  e-mail técnico `<telefone>.<inquilino_id>@clientes.instabarber.pt`, que nunca
  recebe correio. Assim, quem trabalha numa barbearia não consegue usar um
  código para entrar na conta do mesmo cliente noutra barbearia.
- Não há OTP por SMS.

### D-07 · Funcionalidade fora do plano — dono
Desaparece do painel (menu, ecrã, botão, rota), exceto as chaves com
`mostra_upgrade`: `envio_mensagens`, `envio_lote`, `pedido_avaliacao` e
`metas_profissional`, que aparecem desativadas com a chamada de upgrade.

### D-08 · O Basic ganha o lembrete individual e os selos — dono
`lembretes_marcacao` (lembrete individual por wa.me) e `fidelizacao_selos`
passam para o Basic. O envio em lote, a recuperação e os módulos de receita
continuam no Pro.

### D-09 · Multilinguagem fica na versão 1 — dono
Passa a ser a chave `multilinguagem` da grelha, fora dos dois pacotes, ligada
pela Performa LAB. Prevalece a versão com campos opcionais por língua no
formulário de serviços (F.3.2, J.1); a frase da I.3.2 que os dava como
«futuros» foi retirada.

### D-10 · Preços com IVA e plano anual — dono
Mostrar sempre o preço com IVA ao lado do preço sem IVA. Plano anual a 10
mensalidades (dois meses grátis).

### D-11 · Relatório mensal só para descarregar — dono
Não segue por e-mail. A tarefa mensal da M.1 «enviar o relatório» foi retirada.

### D-12 · Clube não ligado a um barbeiro — dono (confirmado a 21/10/2026)
A frase «o clube está sempre ligado a um barbeiro» foi retirada: o serviço com
crédito fica atribuído a quem o fez, e a comissão é de quem o fez.

### D-13 · Regras que gravam vivem na base de dados — técnica
Validação de vaga, preço com desconto, comissão, selos e stock são funções SQL
(`docs/esquema/02_funcoes.sql`) com testes. Motivo: o cliente JS do Supabase
não faz transações, e só assim a marcação é atómica e as mudanças de hora são
tratadas pelo Postgres. O TypeScript chama estas funções e não as reimplementa.

### D-14 · O esquema tem uma fonte única — técnica
`docs/esquema/` (quatro ficheiros SQL e testes). Identificadores só em ASCII.
Referências entre tabelas do mesmo inquilino por chaves compostas
`(inquilino_id, id)`. Substitui a regra «as tabelas vivem na Parte F».

### D-15 · Vercel Hobby até ao ponto de equilíbrio — dono
Risco registado: os termos da Vercel não permitem uso comercial no plano Hobby,
e a Vercel pode suspender a conta. A passagem para o Pro é só configuração. O
Supabase Pro continua necessário desde a primeira barbearia real (cópias de
segurança e o projeto gratuito pausa por inatividade).

### D-16 · Sem tarefas agendadas — dono (21/10/2026)
A plataforma não usa tarefas agendadas (Vercel Cron). O lembrete é por WhatsApp,
que chega melhor aos clientes em Portugal; não há lembrete por e-mail. O
e-mail de confirmação sai no momento da marcação. A cópia externa da base de
dados faz-se à mão, semanalmente (manual do operador, P-13), além das cópias
diárias automáticas do Supabase Pro. A funcionalidade `lembretes_email` passou
a `confirmacao_email`.

### D-17 · Barbeiro entra por convite — técnica (B8)
A conta do barbeiro cria-se com convite por e-mail (Supabase Auth, enviado pelo
Resend). O NIF deixa de ser palavra-passe. Reposição pela mesma via.

### D-18 · Uma conta de equipa, vários perfis — técnica
Um utilizador pode ter perfis em várias barbearias. O RLS verifica a pertença
(`inquilinos_onde()`), não um «inquilino ativo»; a interface escolhe a
barbearia pelo endereço.

### D-19 · Endereço público — técnica
Três formas, por esta ordem: domínio próprio, subdomínio
(`exemplo.instabarber.pt`) e caminho (`instabarber.pt/exemplo`). O middleware
reescreve as três para a rota interna `/b/[slug]`, que nunca aparece ao
público. Há uma lista de slugs reservados na base de dados.

### D-20 · Grelha de funcionalidades — técnica
Chaves novas: `ficha_tecnica`, `politica_faltas`, `confirmacao_email`,
`pedido_avaliacao`, `multilinguagem`, `cartoes_oferta`, `portfolio_barbeiro`.
`comissoes` passa a `comissoes_acertos`. A fonte é
`docs/esquema/04_dados_iniciais.sql`.

### D-21 · Preço dos serviços — técnica
`servicos.preco` é o preço final ao cliente (com IVA, se o houver). Muitas
barbearias estão isentas; a plataforma não calcula IVA de serviços.

### D-22 · Radar e clientes com poucas visitas — técnica (L8)
Com menos de três visitas, a frequência é 30 dias por omissão; o cliente que
veio uma vez e não voltou passa a aparecer como em risco e depois perdido.

### D-23 · Faturado — técnica (L6)
«Faturado» é a soma de `valor_cobrado` das visitas. O relatório e o Início
separam: receita própria (modelo A), receita que passou pelos barbeiros
(modelos B e C, informativa) e rendas de cadeira. Uma só função calcula os três.

### D-24 · Selos em livro — técnica (C6)
Os selos são movimentos (`movimentos_selos`); o saldo é a soma. O resgate
consome os selos necessários e o excedente transita.

### D-25 · Base da comissão — técnica (C5)
Base = valor de tabela quando o serviço sai do crédito do clube; senão, o valor
cobrado (com o desconto de hora morta). A percentagem fica gravada na visita.

### D-26 · Filas sem tarefas agendadas — técnica (L3, L4)
A reserva de 10 minutos e o prazo de 30 minutos da fila de espera expiram por
cálculo (`reservada_ate`, `expira_em`), sem tarefa agendada. As reservas
expiradas libertam-se na marcação seguinte.

### D-27 · Notificações push fora da versão 1 — técnica
Exigiriam uma dependência nova (`web-push`). Ficam para depois do lançamento.

### D-28 · Palavra-passe na primeira marcação — dono (substitui em parte a D-06)
O cliente com número novo na barbearia escolhe a palavra-passe na primeira
marcação, sem código. O número que já tem ficha (balcão, QR, importação) cria o
acesso pelo código, uma vez. Quem se esquece da palavra-passe recupera-a pelo
código. Se alguém registar o número de outra pessoa, o dono do número recupera a
conta pelo código. Verificação: `pode_criar_acesso_direto()`.

### D-29 · Domínio próprio como extra — dono (confirmado a 21/10/2026)
5,00 € por mês sem IVA (6,15 € com IVA), em qualquer plano; 50,00 € no plano
anual. Liga-se na ficha da barbearia, no painel de administração, e entra na
fórmula da D.7 (`DOMINIO_PROPRIO_CENT`). A ligação técnica do domínio segue o
manual do operador (P-10).

### D-30 · Exportação dos dados de uma barbearia — técnica
O super_admin (com dois fatores) lê todas as tabelas e exporta os dados de uma
barbearia em CSV quando ela sai, como obriga o art. 28.º, n.º 3, alínea g) do
RGPD. Políticas `*_admin_ler` em todas as tabelas.

### D-31 · Manual do operador — dono
`docs/manual-do-operador.md` descreve todos os processos manuais da Performa
LAB. Escreve-se a partir da especificação e revê-se na Fase 8 com o sistema real.

### D-32 · Nomes das camadas — dono (21/10/2026)
InstaBarber Admin (Performa LAB), InstaBarber Gestão (dono), InstaBarber Equipa
(barbeiro), Página pública e Minha área (cliente, com a marca da barbearia).

### D-33 · O Admin só no domínio principal — dono (21/10/2026)
`/admin` só funciona em `instabarber.pt`. Nos endereços das barbearias
(subdomínio ou domínio próprio) responde 404, para que a entrada da Performa LAB
não se descubra a partir de uma barbearia.

### D-34 · Página de apresentação no domínio principal — dono (21/10/2026)
`instabarber.pt` mostra uma página de apresentação com botão de contacto, em vez de ficar vazio. O ficheiro de partida está em `landing/index.html` (HTML único, sem cookies nem análise). Na Fase 0 passa a `app/page.tsx` do domínio principal, com os mesmos textos e preços (preços com IVA, H.2). O e-mail de contacto é `comercial@instabarber.pt` (L.2), numa só constante. O flyer em PDF está desatualizado (preço 39,99 €, garantia de 30 dias e desafio de 90 dias não fazem parte da especificação) e não é fonte de preços.

### D-35 · Ficheiros da marca — dono (21/10/2026)
Os logótipos entregues pelo dono vivem em `public/marca/`: versões com fundo transparente (horizontal, vertical e símbolo, em dourado, branco, preto e cor), favicons e `originais/` com os 12 ficheiros recebidos. Dourado e branco são para fundo escuro; preto e cor para fundo claro. São imagens PNG, não vetoriais: se for preciso ampliar (impressão, fachada), pedir o SVG ao designer ou mandar vetorizar. O dourado sobre preto é a versão principal (I.1).

### D-36 · Desafio de 90 dias do plano Pro — dono (21/10/2026), condições por aprovar
Mantém-se o desafio do flyer: no plano Pro, se nenhum cliente for recuperado nos primeiros 90 dias, devolve-se uma mensalidade. Condições escritas na landing, ancoradas nas regras do sistema: (1) o barbeiro contacta pelo sistema pelo menos 20 clientes classificados como perdidos (mensagem de recuperação aberta e envio confirmado, D-07/F.5); (2) «recuperado» é a definição da E.8 (visita registada até 30 dias depois da mensagem aberta); (3) a contagem sai dos registos do sistema; (4) o valor devolvido é o de uma mensalidade do Pro. O envio é por `wa.me` e confirmado à mão, por isso o flyer deixa de dizer «mensagens automatizadas». O exemplo «22 contactados, 9 regressam, 15 €» é ilustrativo e usa o fator 0,4 da F.1; com 47,97 € de mensalidade paga quase 3 mensalidades (o flyer dizia mais de 3 com 39,99 €). **Por aprovar:** o prazo exato, o que acontece se houver menos de 20 clientes perdidos, e a redação para os Termos, que um jurista deve rever. A devolução faz-se à mão (D-01).

### D-37 · Landing em modo «barbearia piloto» — dono (21/10/2026)
Enquanto o sistema não existir (antes da Fase 4), a página não promete demonstração nem datas: convida as primeiras barbearias a serem piloto e fala em «condições de lançamento», sem números. O contacto é um formulário que não guarda nada no site: monta a mensagem e abre o WhatsApp ou o e-mail do visitante. Política de Privacidade do site dentro da página, sem cookies nem análise. Quando houver demonstração real, voltar ao texto «mostramos o sistema a funcionar» e trocar o painel de exemplo por capturas. O telemóvel está num só sítio (constantes `PHONE` e `PHONE_TXT` no fim do ficheiro) e muda quando o novo chip existir.

### D-38 · Módulo Comercial (CRM, propostas e contratos) — dono (21/10/2026)
O Admin ganha o separador Comercial: funil de leads, briefing, propostas em PDF e contratos gerados da proposta aceite (Parte N). Vive só no Admin (super_admin com 2FA, domínio principal). Sem dependências novas (jsPDF; preços pela fórmula da D.7). Os textos jurídicos são modelos em `modelos_documento`: os de `docs/comercial/` são **rascunhos** e só se aprovam no sistema depois do parecer de um jurista. A assinatura faz-se fora do sistema (por exemplo, Chave Móvel Digital) e carrega-se o PDF assinado. Um lead só passa a «ganho» ao assinar o contrato.

### D-39 · Fase 3B e retenção dos leads — técnica (21/10/2026)
O módulo é a Fase 3B, a seguir à Fase 3 (estimativa de 6 dias, fora dos 47 das nove fases). Retenção: lead sem contrato é apagado 12 meses depois do último contacto, por procedimento mensal manual (`apagar_leads_inativos`, P-24), sem tarefas agendadas (D-16). Contratos e propostas ligadas a contratos guardam-se pelos prazos legais. Até à Fase 3B, o formulário da landing continua a não guardar nada (D-37).

### D-40 · Módulo de Finanças da Performa LAB — dono (21/10/2026)
O Admin ganha o separador Finanças (Parte O): custos fixos e variáveis, contas a pagar, indicadores sem IVA, ponto de equilíbrio, objetivo de faturação com «quantas barbearias faltam», previsões a 12 meses em três cenários e exportação para o contabilista. Regista, não cobra nem fatura (D-01): é controlo interno e nada do que exporta é documento fiscal. Sem ligação ao banco nem leitura de faturas. Os valores dos fornecedores em dólares registam-se em euros, à mão. As previsões mostram sempre os pressupostos e dizem que não são promessa. É a Fase 3C, depois da 3B (5 dias, fora dos 47).

### D-41 · Lembretes de vencimento aos inquilinos — dono (21/10/2026)
O Admin lembra as barbearias de que a mensalidade vence, com o modelo dos lembretes da barbearia (E.2): o sistema prepara o texto; o operador abre o WhatsApp por `wa.me` e confirma o envio à mão; ou carrega no botão de e-mail e o servidor envia pelo Resend, de apoio@, no momento do clique. Nunca agendado nem automático (D-16). São mensagens de serviço B2B: não precisam de consentimento promocional. O estado do lembrete só muda por funções da base de dados.

### D-42 · Contrato e Acordo de Subcontratação baseados na lei portuguesa — dono (21/10/2026)
Os rascunhos de `docs/comercial/` (contrato, Acordo de Subcontratação e condições da proposta) apoiam-se na lei portuguesa e europeia aplicável: Código Civil, cláusulas contratuais gerais (Decreto-Lei n.º 446/85), pagamentos em atraso (Decreto-Lei n.º 62/2013), RGPD art. 28.º, Regulamento dos Dados (mudança de prestador), eIDAS e Decreto-Lei n.º 12/2021. Procuram dar garantias às duas partes: sem fidelização e saída fácil, exportação gratuita dos dados em 30 dias, nenhum dado apagado na suspensão, responsabilidade sem limite por dolo, culpa grave e danos pessoais, limite de 12 mensalidades nos restantes casos, juros e 40 € em atraso. Continuam a ser **rascunhos**: `notas-para-o-jurista.md` lista os pontos a rever e os prazos entre parênteses retos. O contrato só se aprova no sistema depois do parecer.

### D-43 · Decisões sobre as Finanças — dono (21/10/2026)
Saídas mensais de 3 % como pressuposto enquanto houver menos de 10 barbearias; remetente dos lembretes por e-mail: apoio@; faturas e recebimentos com valor com IVA (os indicadores dividem por 1,23).

### D-44 · Quem é a Prestadora enquanto não houver sociedade — titular decidida, regime de IVA por confirmar (21/10/2026)
Os dados de quem presta o serviço entram no contrato por configuração (`prestadora.*`), nunca escritos no modelo. Enquanto não existir Lda., a Prestadora é o titular da atividade em nome individual sob a qual a Performa LAB opera: é ele quem assina, fatura e responde. **Por decidir pelo dono, com contabilista:** quem é o titular (a namorada, ou o próprio dono abrindo atividade), o CAE, o regime de IVA (os preços com IVA a 23 % pressupõem IVA normal) e o acordo escrito entre o titular e quem desenvolve o trabalho. A cláusula 19 do contrato já prevê a cessão à futura sociedade.

**Atualização (21/10/2026):** a titular é a companheira do dono, que assina o contrato. Não há cláusula de exclusividade nem concorrência no contrato de trabalho dela, e não é função pública. Falta confirmar com o contabilista o CAE, o regime de IVA e a Segurança Social, e escrever o acordo entre os dois.

**Dados recebidos (21/10/2026):** o comprovativo de início de atividade da titular mostra regime simplificado de IRS, isenção de IVA (art. 53.º, desde 24/09/2025), CAE principal 61200 (telecomunicações) e volume previsto de 1.500 €. Entram no contrato só nome, NIF, domicílio e qualidade, pelas variáveis `PRESTADORA_*` (valores em `dados-locais/prestadora.env`, fora do Git). Telefone e e-mail comerciais entram só na proposta e na landing. O Raphael é sócio de facto, gere e vende: não assina nem aparece em documentos, e a assinatura de todas as mensagens passa a ser «InstaBarber · Performa LAB». **Por decidir:** CAE de software, e o regime de preços com a isenção de IVA (ver D-45).

### D-45 · Preços e regime de IVA da Prestadora — dono (21/10/2026)
O dono escolheu a opção B: o **preço final** ao cliente mantém-se em 24,59 € (Basic) e 47,97 € (Pro), com os extras de 12,30 € e 6,15 €, quer a Prestadora esteja isenta de IVA (art. 53.º do CIVA) ou no regime normal. Com a isenção, o IVA é 0 %, a fatura diz «IVA – Regime de Isenção» e o valor sem IVA é igual ao preço final. Com o regime normal, o preço final inclui o IVA a 23 % (19,99 € e 39,00 € sem IVA). O regime é a variável `PRESTADORA_REGIME_IVA` (`isento` por omissão, segundo o comprovativo de início de atividade); a fórmula da D.7 e a coluna `propostas.iva_taxa` (0 ou 23, com teste) suportam os dois. **Por confirmar com o contabilista:** se a isenção do art. 53.º continua (não tem prazo próprio: depende do volume de negócios; o «primeiro ano de isenção» é o da Segurança Social, não o do IVA), e o que fazer quando o volume passar de 15.000 € (absorver o IVA no preço final, ou subir o preço por aviso).

### D-46 · O formulário da landing envia ao servidor — dono (21/10/2026)
Fica superada a parte da D-37 que dizia que o formulário não guarda nada. Quando a rota de contacto existir, o botão de enviar (e o do WhatsApp) faz primeiro um pedido ao servidor: valida (Zod), aplica honeypot e limite por IP, chama `submeter_lead()` (que grava o lead e aplica o limite por contacto) e envia o aviso por e-mail para comercial@ pelo Resend. O fluxo é um só botão, «Enviar pedido de contacto», com a nota «Em breve vais receber um contacto». Depois de enviar, o formulário desaparece e dá lugar a uma mensagem grande («Pedido enviado»), com o título «Não queres esperar?» e um botão verde «Falar agora no WhatsApp», que abre a conversa com a mensagem preparada. Se o pedido ao servidor falhar, a mensagem diz que não foi possível e oferece o mesmo botão, para o lead não se perder. Nome e um contacto (telemóvel ou e-mail) são obrigatórios. Enquanto a rota não existir (constante `ENDPOINT` vazia), o botão não finge que enviou: mostra «Quase lá» e pede o envio pelo WhatsApp; fora de instabarber.pt (pré-visualização) mostra-se o fluxo final como demonstração, com aviso, para se poder rever o desenho. Até lá, a landing só prepara a mensagem de WhatsApp e não guarda nada. O formulário passa a dizer, junto ao botão, que os dados são guardados para contactar o visitante, e a Política de Privacidade é atualizada (12 meses, H.1). **Confirmado pelo dono (21/10/2026):** a rota de contacto, só com o aviso por e-mail ao comercial@ e sem base de dados, entra já na **Fase 0**, para o «Pedido enviado» ser verdadeiro desde o primeiro deploy. A gravação no CRM (`submeter_lead`, limite por contacto e por IP, 12 meses) fica na camada 1A da Fase 3B. A Fase 0 passa a precisar da chave do Resend e do domínio verificado (SPF e DKIM).

### D-47 · Posicionamento: «Feito em Portugal», sem superlativos por provar — dono (21/10/2026)
A landing diz «Feito em Portugal» e mostra o que é verdade hoje: português de Portugal, hora de Lisboa e feriados, dados na União Europeia, WhatsApp sem custo por mensagem, desenvolvimento e apoio a partir de Viseu. Não diz «100 % português» (a infraestrutura usa fornecedores estrangeiros, mesmo com dados na UE) nem «o mais completo do mercado» (sem estudo da concorrência e sem pagamentos, faturação certificada ou aplicação nativa, que outros oferecem). Poderá dizer-se «um dos mais completos» quando houver uma comparação feita e atualizada.

## D-48 · Atalhos, demonstração e calculadora na landing (21/10/2026)

- Três atalhos no topo: «Vê quanto dinheiro estás a perder todos os meses» (→ #calculadora), «Experimenta o InstaBarber já» (→ #demo), «Quanto custa?» (→ #planos).
- Demonstração dentro da landing (Agenda, Clientes perdidos, Selos), com dados fictícios e aviso visível. O fluxo WhatsApp é preparar, abrir, confirmar: nada se envia sozinho (regra 7).
- Calculadora: estimativa feita no browser, sem guardar nada; fator de recuperação 40 % (o mesmo do radar); compara com o Basic (24,59 €). O resumo segue no campo `calculadora` do pedido de contacto e na mensagem de WhatsApp.
- Fase 0: ao portar a landing, a rota `/api/contacto` aceita o campo opcional `calculadora` (texto, máx. 300 caracteres) e grava-o no lead.

## D-49 · Ajustes à landing e auditoria (21/10/2026)

- Os atalhos passam para o hero, logo abaixo do texto introdutório.
- O selo do hero passa a «100% Feito em Portugal», com bandeira em SVG. Substitui a redação cautelosa de D-47 por decisão do dono. Nota: a base de dados e o alojamento ficam em Frankfurt/Vercel; manter o texto referido à origem do produto e da operação, nunca à infraestrutura.
- A calculadora passa a falar de perda («Estás a perder» e «Poderias receber a mais»).
- Erro corrigido: a classe `.lab` da demonstração colidia com a etiqueta `.lab` do quadro de contacto. Renomeada para `.box`.
- Auditoria: `scripts/auditar-landing.py` (ids duplicados, classes repetidas, âncoras sem destino, brasileirismos, pontuação, elementos fora do ecrã a 1280/768/390/360 px). Corre-se antes de cada publicação.

## D-50 · Formulário em dois passos, leads incompletos e vídeo (21/10/2026)

- **Passo 1** (obrigatório): nome completo, telemóvel português (9 dígitos) e e-mail, com validação. O botão «Continuar» grava o lead (fase 1). O aviso de privacidade está por baixo do botão.
- **Passo 2** (opcional): distrito (lista dos 18 distritos e das 2 regiões autónomas), cidade ou concelho, nome da barbearia, barbeiros e maior dificuldade hoje. «Enviar pedido» completa o lead (fase 2, com a `ref` do passo 1); «Agora não» termina sem enviar mais nada.
- **Não se guarda o que foi escrito e não enviado.** Sem pedido do titular não há base legal nem informação prévia (RGPD, arts. 6.º e 13.º), e contactá-lo seria comunicação não solicitada. Os leads que fizeram o passo 1 e não o 2 aparecem no CRM numa aba «Incompletos» (Fase 3B).
- Medição sem dados pessoais: contadores no servidor (visitas, abertura da calculadora, cliques em «Continuar»), sem cookies nem IP guardado. Registado na Fase 0.
- Desafio dos 90 dias: gancho junto da calculadora, com ligação às condições da secção #desafio. Texto por validar pelo jurista (D-36).
- Vídeo de 30 s: só depois de o sistema estar lançado e testado (piloto), gravado no painel real com legendas. Até lá, vale a demonstração interativa da landing, que diz ser fictícia. Fica na Fase 8, com o cliente piloto a autorizar por escrito o uso do nome e das imagens.
- Prova real: testemunho e foto do barbeiro piloto, só com consentimento por escrito.

## D-51 · Preparação para outros países e Parte P dormente — dono (21/10/2026)

- O dono quer poder vender noutros países da Europa e no Brasil (a empresa de TI do pai é a entidade candidata) e ativar mais tarde o MB Way online, sem refazer a base.
- **Feito agora:** `inquilinos.pais`, `fuso`, `moeda` e `idioma`, dormentes (cada restrição só aceita hoje o valor de Portugal), com 7 testes (`60_expansao.sql`); regra nova em CLAUDE.md §5 (textos só em `lib/i18n/`, nada de moeda, IVA, fuso ou formato escritos à mão).
- **Parte P (`docs/parte-p-roteiro-de-expansoes.md`):** roteiro dormente com o inventário dos pontos ainda portugueses (P.2), o procedimento comum para ativar um país (P.3) e as secções Espanha (P.4), Brasil (P.5), outros países da Europa (P.6), MB Way online (P.7) e outros métodos (P.8). Fica fora das nove fases, das 3B e 3C e do documento mestre, e só se lê por ordem do dono (CLAUDE.md §1).
- **Regra 6 (fuso):** mantém-se «Europe/Lisbon» enquanto só existir Portugal. Passa a «fuso da barbearia, por omissão Europe/Lisbon» só na ativação de um país (P.3, passo 5), com ordem do dono.
- **Tradução:** dicionário próprio em `lib/i18n/`, sem dependência nova (a stack mantém-se fechada). Se a Parte P vier a exigir uma biblioteca, pede-se autorização nessa altura.
- **Confirmada pelo dono em 21/10/2026**, assumindo o risco: a regra 6 só muda na ativação, o dicionário é nosso e a Parte P fica como está. As dúvidas jurídicas e contabilísticas ficam para a fase de expansão de cada país.
- **Pareceres jurídicos e fiscais** dos países e da relação entre a Performa LAB e a empresa do pai são de profissionais locais; a Parte P só os lista.

## D-52 · Fase 9: manuais operacionais no fim — dono (21/10/2026)

Os manuais completos escrevem-se **depois** de o sistema estar pronto, publicado e testado numa barbearia real (Fase 9, `fases/fase-9-manuais.md`, 7 dias, fora dos 47), para descreverem os ecrãs e os problemas reais, com capturas verdadeiras. Cobrem: ciclo de vida da barbearia (do 1.º contacto a 12 meses de pós-venda), manual comercial, guia de resolução de problemas por sintoma, apoio ao cliente, calendário de operação, manual de expansões para o dono (versão operacional da Parte P) e passagem de testemunho a quem entre na operação. Verificação pelo teste do estranho. O `manual-do-operador.md` atual (P-00 a P-27) é a base e continua a ser atualizado em cada fase.

## D-53 · Comparação «Se comprasses separado» sem nomear concorrentes — dono/técnica (21/10/2026)

O dono sugeriu comparar com o custo de comprar cada sistema separado e, no limite, nomear concorrentes com o nome desfocado. Decisão: **categorias, sem nomes**. Um nome desfocado continua a identificar o concorrente (publicidade comparativa: tem de ser objetiva, verificável e não enganosa) e o texto fica no código da página. Os valores têm fonte, data e taxa de câmbio em `docs/comercial/referencias-de-preco.md`, revistos de seis em seis meses. A secção só soma o que o Basic inclui e diz que, no valor mais baixo, a diferença é pequena (23 € a 62 € contra 24,59 €). Gestão financeira, comissões e página própria não têm preço comparável com fonte: aparecem como «incluído», sem valor. Antes de publicar em instabarber.pt, o jurista confirma o texto (D-36).

## D-54 · Landing: idiomas, «IVA incluído» e lembrete ilustrado — dono (21/10/2026)

- O bloco «Português de Portugal» da landing passa a «Página em vários idiomas» (português, inglês e francês, ativados a pedido: a funcionalidade `multilinguagem` não vem em nenhum pacote, só a Performa LAB a liga). «De Viseu para o país» passa a «De Portugal para o mundo».
- Todo o preço da InstaBarber na landing leva «IVA incluído». Enquanto a Prestadora estiver isenta (art. 53.º do CIVA), não se acresce IVA e o preço final não muda se o regime mudar (D-45): o contabilista confirma a expressão.
- Lembrete de marcação: separador «Lembrete» na demonstração, com a mensagem como chega ao cliente. A mensagem passa a incluir serviço, data, hora, barbeiro e, no próprio dia, quantos minutos faltam (calculado em Europe/Lisbon ao preparar). Continua a ser por `wa.me`, aberto e confirmado à mão (regra 7), nos dois planos.

## D-55 · Catálogo de atualizações numeradas — dono (21/10/2026)

O dono quer pedir mudanças futuras por número («executa as atualizações 1, 7, 9 e 32»), cada uma com procedimento escrito para o Claude Code executar sem deixar a plataforma inoperante. Criado `docs/atualizacoes/`: `README.md` (como se pede, o que o Claude Code faz e o protocolo de segurança: repositório limpo, cópia de segurança, migrações em três tempos, ensaio primeiro, interruptor, reversão testada, verificação completa, registo), `catalogo.md` (18 itens, números fixos e nunca reutilizados, próximo livre: 19) e um ficheiro `U-NN` por item. Itens de risco Alto, ou que toquem em dados reais ou chaves, esperam um «sim» do dono; os de risco Baixo ou Médio sem decisões pendentes avançam. Dormente: fora das fases e do documento mestre, só se lê por ordem do dono. Os procedimentos foram escritos antes do código existir e referem a estrutura da B.4: ao executar, confirmam-se os nomes reais e corrige-se o procedimento. Decisão de 21/10/2026 sobre o login do cliente: **não mudar agora** (U-01 fica como opção).

## D-56 · Mapa do sistema para manutenção — dono (21/10/2026)

O Claude Code não guarda memória entre sessões, por isso a memória do sistema é o repositório. Criados `docs/mapa-do-sistema.md` (classifica o pedido, traduz «página tal» para ficheiro, receitas de pedidos comuns com como verificar e desfazer, protocolo de pedido pequeno) e `scripts/gerar-mapa.sh` (gera `docs/mapa-gerado.md` do código real: rotas, variáveis de cor, chaves de texto, tabelas, funções e funcionalidades; falha se uma rota de `app/` ficar fora do mapa). Regra 15 do CLAUDE.md: cada fase termina com o mapa atualizado e confirmado. O `CLAUDE.md` manda ler o mapa em pedidos de manutenção. Atualização 19 do catálogo: pedido pequeno de alteração. Princípio: a cor, o horário ou o logótipo **de uma barbearia** são configuração no painel, não código (regra 2); a cor **da marca** só muda com ordem expressa e atualiza a Parte I.

## D-57 · Manuais de atualizações e do desenvolvedor só no fim — dono (21/10/2026)

O procedimento de pedidos pequenos e o catálogo de atualizações passam a ter dois manuais, produzidos na Fase 9, **depois** de tudo construído e conferido: o **manual de atualizações para o dono** (como pedir, o que esperar, o que é configuração e o que é código) e o **manual do desenvolvedor para o Claude Code** (mapa final, receitas executadas em ensaio, procedimentos `U-NN` reconciliados com o código real, armadilhas conhecidas, teste de arranque com uma sessão nova). Até lá, o mapa e o catálogo são rascunhos fiéis à especificação (D-55, D-56). A Fase 9 só fecha se o teste de arranque passar.

## D-58 · Mini loja visível na landing (21/10/2026)

A loja de produtos (`loja_produtos`, F.4.4, plano Pro) tinha só uma linha na lista de funcionalidades. Passa a ter secção própria (`#loja`), com demonstração interativa: o visitante encomenda como cliente e atende como dono (Novo → Pronto → Levantado; o stock só desce ao levantar; margem calculada sobre o preço sem IVA). Diz sempre que o pagamento é ao balcão, sem cobrança online e sem comissões (CLAUDE.md §3), e que os dados são fictícios.

## D-59 · Clube de assinatura e cartões oferta visíveis na landing (21/10/2026)

Secção própria `#receita` com duas demonstrações interativas, como a loja (D-58): **clube** (F.4.2: receita previsível por subscritores, crédito só vale depois de «Pago», crédito usado cobra 0 e o valor de tabela mantém-se, sem crédito cobra-se normalmente) e **cartão oferta** (F.4.9: código de oito caracteres, cartão com a marca e «Não é documento fiscal», validade de um ano, uso com saldo e recusa se o saldo não chega). Diz sempre que o pagamento é registado ao balcão e que o sistema não cobra (CLAUDE.md §3). Dados fictícios assinalados.

## D-60 · Hero com página pública de exemplo e painel mais abaixo (21/10/2026)

O hero passa a mostrar, à direita, um exemplo ilustrativo de **página pública de barbearia** (nome e logótipo fictícios: marcação, fila digital, serviços, loja, clube, selos, cartões oferta, idiomas e Livro de Reclamações), que mostra os diferenciais logo ao abrir. O quadro «Hoje na cadeira» (painel do gestor) foi para a secção `#painel`, antes de «Experimenta já». É um desenho em HTML e CSS, não uma fotografia: quando houver capturas reais da barbearia piloto, substituem-se (Fase 9).

## D-61 · Quadro «Hoje na cadeira» retirado da landing (21/10/2026)
O dono considerou a secção «O teu painel» redundante (a demo e o exemplo do topo já mostram agenda, clientes perdidos e mensagem). Removida a secção e o CSS associado.

## D-62 · Instagram: peças e plano de lançamento (21/10/2026)
Criados o esboço do perfil, 6 publicações, um Reel de 30 s e o plano de 30 dias (documento «InstaBarber · Plano de Instagram»). Fontes editáveis em `marketing/instagram/fontes/`, peças prontas em `marketing/instagram/saida/`. Todos os ecrãs são desenhos marcados «Exemplo ilustrativo»; dizem «primeiras vagas piloto» e não anunciam o desafio dos 90 dias (D-36 por validar). Proposta pendente: registar a origem `?origem=instagram` no formulário (nova entrada U-20 do catálogo, se o dono autorizar).

## D-63 · Instagram: posts 7 e 8, vídeo 2 e fotografia de fundo (21/10/2026)
Acrescentados o post 7 (faltas), o post 8 (cliente com 52 dias sem vir, versões feed e story com a mensagem como notificação de WhatsApp) e o vídeo 2 (fim do mês). O fundo do post 8 é uma fotografia de banco de imagens escolhida pelo dono: **confirmar e guardar a licença** (uso comercial e redes sociais) antes de publicar; se a imagem for gerada por IA ou tiver pessoas, rever a autorização. O fundo desenhado por código foi descartado. A fonte é `marketing/instagram/fontes/posts3.html`.

## D-64 · Instagram: post 9, fila digital (21/10/2026)
O post/story 9 apresenta a entrada por QR code e a fila digital (F.4.3, plano Pro): o cliente vê a posição e a estimativa de espera em tempo real. **Não promete aviso automático** («serás avisado quando for a tua vez»): a especificação não o prevê e a regra 5/7 impede mensagens automáticas. Se o dono quiser o aviso, é uma nova funcionalidade (abrir a conversa de WhatsApp com um clique para o barbeiro avisar o cliente), a pedir como atualização. A fotografia de fundo tem um letreiro de terceiros, que foi desfocado; confirmar a licença da imagem.

## D-65 · Vocabulário PT-PT: «em direto» e «fila digital» (21/10/2026)
«Ao vivo» é brasileirismo (regra 4). Em Portugal diz-se «em direto». O nome da funcionalidade passa a **Fila digital** (F.4.3, Pro) na landing, nos posts e nos textos de Instagram; o estado do cartão no post 9 diz «Em direto». Corrigidos landing, posts 5 e 9, story 9, legendas e planos.

## D-66 · Landing sem rótulos de «exemplo/fictício» nos ecrãs (21/10/2026)
Removidos das capturas e demos da landing os rótulos «Exemplo ilustrativo» e «Demonstração com dados fictícios», e «(demonstração)» nos botões. Mantidos apenas o aviso da calculadora («Exemplo com números ilustrativos», porque é uma estimativa) e «Preços de exemplo, com IVA» na loja. Os dados continuam a ser da barbearia fictícia «Barbearia Central»; antes de qualquer campanha paga, o jurista confirma se a ausência de rótulo é aceitável.

## D-67 · Instagram sem Performa LAB nem «Viseu» (21/10/2026)
Pedido do dono: as publicações não mencionam a Performa LAB nem «feito em Viseu». Removido do post 1 e do rodapé do post 6; o plano v2 deixa de ter o pilar «autoridade da Performa LAB» e a assinatura passa a InstaBarber apenas. O post 1 foi redesenhado como lançamento tipográfico («Agenda. Clientes. Equipa. Contas.»). Regra registada no CLAUDE.md, secção 11.

## D-68 · Instagram sem «piloto»; promessa «tudo num só sistema» (21/10/2026)
Removido «piloto» do post 1, do post 6, do reel 1, do esboço do perfil (destaque «Demo») e das legendas. CTA: «Experimenta a demo». Mensagem central do post 1: «Tudo o que a tua barbearia precisa, reunido num só sistema. Sem pagar por cada serviço.» («sem custo por mensagem» continua verdadeiro, mas passa a argumento secundário.)

## D-69 · Tom das legendas: português falado, com gíria natural (21/10/2026)
As legendas deixam o registo institucional e passam a soar a conversa entre barbeiros portugueses, com expressões naturais e calão leve, sem forçar. Pedido do dono depois de as primeiras versões soarem «a IA». Regra no CLAUDE.md, secção 12. Aplica-se a legendas, ecrãs de texto dos reels e respostas aos comentários.

## D-70 · Guia de voz e linguagem das redes sociais (21/10/2026)
Escrito `marketing/instagram/GUIA-DE-VOZ-E-LINGUAGEM.md`: persona («o colega do ofício»), cinco traços, lista de expressões proibidas (sinais de texto de IA), tabela Brasil/Portugal, dosagem de gíria (nível 2 de 5), vocabulário da casa, humor, emojis, receitas de gancho, antes e depois, respostas a comentários e teste de voz. É a referência final das legendas.

## D-71 · Landing publicável e endereço www (21/10/2026)
Criada `landing/publicar/` (index.html completo com doctype, viewport, ícones, canonical e og.png, mais `marca/`) para publicar já na Vercel como página estática, com Root Directory `landing/publicar`. O fonte de trabalho continua em `landing/index.html`; a pasta `publicar` regenera-se a partir dele. Domínios: `instabarber.pt` principal e `www.instabarber.pt` a redirecionar (L.8, passo 7). O dono pediu www.instabarber.pt: se quiser o www como principal, decidir antes (afeta `/admin` e `instabarber.pt/<slug>`). Nameservers da Vercel só na Fase 7. Na Fase 0 a landing passa para o Next.js e esta pasta é substituída.

## D-72 · Plano Pro inclui 3 profissionais (22/10/2026)
O Pro passa de 2 para 3 profissionais incluídos, sem referência ao gestor em nenhum texto (landing incluída). Preço base mantido (39,00 € / 47,97 € com IVA). O profissional adicional continua a 10,00 € por mês (12,30 € com IVA), ou 100,00 € por ano, mas só a partir do 4.º. Novos exemplos: 4 profissionais 49,00 € / 60,27 €; 5 → 59,00 € / 72,57 €; 8 → 89,00 € / 109,47 €. Alterados: landing, CLAUDE.md §6, Parte D (D.1, D.2, D.5, D.6, exemplo do e-mail), Parte J, documento mestre, esquema (`check profissionais_contratados >= 3` no Pro) e dados de teste (Barbearia B com 3). Testes SQL repetidos: 396 verificações, sem falhas. Preço do adicional e base por confirmar pelo dono.

## D-73 · Sem «piloto» também na landing (22/10/2026)
A palavra «piloto» sai da landing (botão do topo, nota dos preços e texto do contacto), além das publicações (D-68). O botão passa a «Quero experimentar».

## D-74 · «Objetivos» em vez de «metas»; comparação com valor único (22/10/2026)
Em Portugal diz-se «objetivos», não «metas»: a landing passa a dizer «objetivos» (equipa, grelha de funcionalidades e plano Pro). Na comparação «E se comprasses cada coisa separada?», cada categoria mostra um só valor, o mais alto da referência (agenda 27 €, fidelização 35 €), e o total dá 62 € por mês, contra 24,59 € do Basic. A nota de rodapé deixa de falar do «valor mais baixo». Antes de campanhas, confirmar os valores de mercado e a data de consulta (publicidade comparativa deve ser verificável).

## D-75 · Comparação sem «comissões» (22/10/2026)
Na linha «InstaBarber Basic» da comparação, deixa de aparecer «comissões» (o Basic tem 1 profissional, não faz sentido como argumento). Passa a descrever o produto: página com marcação online, lembretes por WhatsApp, ficha técnica, painel financeiro com objetivos e custos, relatório mensal em PDF e radar de clientes perdidos. A funcionalidade «Comissões e acertos» continua na lista completa e no Pro.

## D-76 · Botão do Instagram na landing (22/10/2026)
A secção de contacto ganha «Seguir-nos no Instagram» (@instabarberpt, abre em novo separador) e o rodapé uma ligação «Instagram». Sem imitar o Instagram: botão da própria marca, sem logótipo nem gradiente.

## D-77 · Revisão final da landing (22/10/2026)
Teste completo (desktop 1440 e telemóvel 390): sem erros na consola, sem rolagem lateral, âncoras e formulário a funcionar. Alterações: «Dashboard do dia» passa a «Painel do dia»; o rótulo «Gestor» passa a «Dono»; a comparação ganha a linha «Poupas, por mês» (37,41 €, 448,92 € por ano); o título da página publicada (`landing/publicar`) passa a «InstaBarber · Agenda, clientes e fidelização para barbearias» (melhor para pesquisa e separadores).

## D-78 · Topo da landing com três chamadas (22/10/2026)
O topo tinha cinco chamadas (três caixas e dois botões) e dois botões com o mesmo verbo para destinos diferentes. Passa a: botão principal «Experimentar a demo» (#demo), secundário «Falar connosco» (#contacto) e ligação «Calcula quanto estás a perder por mês» (#calculadora). Removidas as três caixas de atalhos e o CSS respetivo. «Ver planos» fica no corpo da página.

## D-79 · Botão «Compara os planos» no topo (22/10/2026)
O topo ganha «Compara os planos» (#planos) ao lado de «Experimentar a demo». Ordem: demo, planos, falar connosco. Em ecrãs estreitos os botões empilham.

## D-80 · Ícone e descrição da página (22/10/2026)
Ícone do separador refeito (barbeiro dourado sobre fundo da marca, a ocupar 90 % da altura): favicon.ico (16, 32 e 48 px), PNG 32, 192 e 512, apple-touch-icon. Descrição para pesquisa: «Agenda, clientes, equipa e financeiro num só sistema, com marcação online e WhatsApp para recuperar clientes. Para barbearias em Portugal. Experimenta a demo.» Acrescentados og:image:alt e as etiquetas twitter:title, description e image. As ligações de partilha apontam para instabarber.pt: a pré-visualização só aparece depois de o domínio estar ligado.

## D-81 · Botão «Experimenta on-line já» (22/10/2026)
O botão principal do topo passa de «Experimentar a demo» para «Experimenta on-line já» (mesmo destino, #demo). O CTA das publicações no CLAUDE.md §11 e no guia de voz acompanha: «Experimenta on-line já» / «link na bio». As imagens e legendas do Instagram já feitas podem ainda dizer «demo»: rever no novo trabalho de redes.

## D-82 · Título da demo (22/10/2026)
«Testa o InstaBarber aqui, sem registo.» passa a «Testa o InstaBarber aqui e vê o que ele pode fazer pela tua barbearia.» Foca no benefício e não no registo.

## D-83 · Fundo personalizável na demonstração (22/10/2026)
No topo da janela «Experimenta já» há dois botões redondos (escuro e claro) com a nota «Muda o fundo», para mostrar que a página da barbearia é personalizável. Só visual: nada é guardado e não afeta o resto da página. O telemóvel de WhatsApp do separador Lembrete mantém o aspeto escuro. Botões com 44 px de toque.

## D-84 · Domínios ligados à Vercel (22/10/2026)
`instabarber.pt` e `www.instabarber.pt` estão ligados ao projeto `instabarber-landing` (Root Directory `landing/publicar`, preset Other) e a abrir com HTTPS. Registador: Arsys, com a gestão de DNS em «Gestión libre». Registos do site: A `@` → 216.198.79.1 e CNAME `www` para a Vercel; apagados os A/AAAA de estacionamento (217.160.0.48 e 2001:8d8:100f:f000::200). Mantidos os MX, SPF, DKIM e verificação do Zoho (`mx`, `mx2`, `mx3.zoho.eu`). O `www` ficou como Production, não como redirecionamento: o redirecionamento 308 para `instabarber.pt` deu erro SSL enquanto o certificado se refazia. Repetir mais tarde, com calma (melhora a pesquisa e evita dois endereços iguais). Nameservers da Arsys inalterados até à Fase 7.

## D-85 · A Prestadora passa ao regime normal de IVA (22/10/2026)
O dono informou que já não está isenta de IVA. `PRESTADORA_REGIME_IVA=normal` no `.env.local` (e na Vercel quando for preciso). O preço final ao cliente não muda (24,59 €, 47,97 €, 12,30 € e 6,15 € com IVA); o valor sem IVA é o preço final ÷ 1,23 (19,99 €, 39,00 €, 10,00 € e 5,00 €), que já era a base das tabelas. As faturas saem com IVA a 23 % e a menção «IVA – Regime de Isenção» deixa de se usar. Rever com o contabilista: o modelo de contrato (cláusula 6.4, que já previa a mudança), as notas para o jurista e a data em que o regime mudou. Código e esquema não mudam: o regime vive na variável (D-45).

Nota a D-84 (22/10/2026): a Vercel estava a servir `landing/index.html` (sem viewport, ícone nem descrição nova) porque o Root Directory ainda não tinha efeito; depois de guardar `landing/publicar` é preciso um deploy novo (um commit dentro dessa pasta chega). Confirmado no telemóvel, pelo link da bio do Instagram, em 22/10/2026.

## D-86 · Secção «Clube de assinatura» na landing (22/10/2026)
Nova secção antes de «Clientes todos os meses e dinheiro que entra antes do corte.», com título do mesmo tamanho dos outros, uma descrição do que é o clube e quatro vantagens (receita certa, clientes que voltam, plano definido pela barbearia, o sistema faz as contas; o pagamento regista-se ao balcão, o sistema não cobra). A secção seguinte passa a ter o rótulo «Experimenta · plano Pro».

## D-87 · Títulos de função na loja e na calculadora (22/10/2026)
A secção da loja passa a chamar-se «Loja de produtos», com a descrição do que é e como funciona (escolhe produtos e preços, o sistema controla o stock e a margem, pagamento ao balcão). A secção da calculadora passa a «Recupera clientes perdidos», com a descrição do radar e das mensagens de WhatsApp (estas no plano Pro) e o convite a fazer a conta logo abaixo. Tratamento por «tu», como no resto da página.

## D-88 · Calculadora mais pequena e clara, com aspeto de aplicação (22/10/2026)
O módulo da calculadora passa a ter fundo claro, barra de aplicação no topo («InstaBarber · Radar de clientes»), largura máxima de 880 px, campos e números mais pequenos. Sai a caixa do «Desafio dos 90 dias» de dentro do módulo (o desafio continua na sua secção, mais abaixo). Removido o CSS que só ela usava.

## D-89 · 22/10/2026 · Calculadora em cinza médio e cartão fixo do Clube
- A calculadora passa de clara a cinza médio (mais claro que os módulos escuros, sem destoar).
- Rótulos: «Deixa de perder clientes para a concorrência» (calculadora) e «O que vais ter no sistema».
- O cabeçalho do bloco «Experimenta · plano Pro» foi substituído por um cartão fixo com a conta de 10 clientes × 25 € = 250 € por mês e a vantagem «Enche os teus dias mais fracos». As caixas interativas do Clube e do Cartão oferta mantêm-se por baixo.

## D-90 · 22/10/2026 · Clube: só o cartão fixo, exemplo de 35 €
- Removida a caixa interativa do Clube (e o seu JavaScript). Fica o cartão fixo: 10 clientes × 35 € = 350 € por mês, com até 4 cortes incluídos.
- O cartão diz que é um exemplo ilustrativo e que o plano é totalmente personalizável (nome, preço, cortes, serviços). O exemplo do Plano Cabelo passou de 25 € para 35 € em todos os sítios da landing.
- O Cartão oferta interativo mantém-se por baixo, numa só coluna.

## D-91 · 22/10/2026 · Calculadora substituída pelo card do Radar
- A calculadora (campos e contas) foi retirada. No seu lugar, um card fixo «Radar de clientes» com as abas «Em risco» e «Perdidos», cada cliente com o valor e o botão «Enviar mensagem» (abre o radar da demonstração). Cores iguais às dos outros cards.
- Removidos o JavaScript e o CSS da calculadora e o campo «calculadora» do formulário de contacto. A âncora #calculadora mantém-se; a ligação do topo passou a «Vê como recuperas clientes perdidos».

## D-92 · 22/10/2026 · Demonstração: «Painel financeiro» no lugar de «Clientes perdidos»
- O separador «Clientes perdidos» da demonstração passou a «Painel financeiro»: objetivo do período com barra de progresso, faturado, lucro estimado, despesas, serviços feitos e ticket médio, com escolha entre Hoje, Esta semana e Este mês. Valores de exemplo; o texto lembra que o dinheiro é registado, nunca cobrado, e que não é documento fiscal.
- Os clientes perdidos continuam no card «Radar de clientes» mais abaixo. O botão «Enviar mensagem» desse card passou a mostrar a mensagem preparada no próprio card (o envio real é sempre confirmado à mão).

## D-93 · 22/10/2026 · Título e subtítulo da demonstração
- Título: «Experimenta aqui um pouco do que o sistema te oferece.»
- Subtítulo: «Marca uma vaga, traz um cliente de volta e controla o dinheiro todo: é assim que funciona no dia a dia, com a gestão da barbearia na palma da mão.»

## D-94 · 22/10/2026 · «online» e «Percentagens e acertos por barbeiro»
- Grafia única «online» (o botão passa de «Experimenta on-line já» a «Experimenta online já»; CLAUDE.md §11 e o guia de voz atualizados). Substitui a grafia da D-81.
- Na lista de funcionalidades, «Comissões e acertos com a equipa» passa a «Percentagens e acertos por barbeiro», para não parecer que a plataforma cobra comissões.
- Mantidas, por decisão do dono, «100 % feito em Portugal» e «E o que mais ninguém junta».

## D-95 · 22/10/2026 · Cartão oferta: card estático
- O Cartão oferta interativo foi substituído por um card estático: descrição do serviço («Uma prenda que traz clientes novos», com três pontos) e, ao lado, a ilustração do cartão (exemplo de 30,00 €, código de exemplo, «Válido por 12 meses», «Não é documento fiscal»).
- Removidos o JavaScript e o CSS da versão interativa (incluindo as regras `.calc` e `#receitabox`, que já não tinham uso).

## D-96 · 22/10/2026 · Agenda da demonstração: contagem e botão «Avisar cliente»
- Na aba Agenda da demonstração, cada cliente marcado mostra uma contagem decrescente («Começa em 29:58», e «Começa em 1 h 16 min» quando falta mais de uma hora) e um botão verde «Avisar cliente».
- O botão segue a regra do WhatsApp (CLAUDE.md, regra 7): primeiro prepara a mensagem, depois «Confirmei o envio», e só então fica «Cliente avisado». Nada se dá como enviado sem confirmação.
- As horas da demonstração partem da hora atual de Lisboa (primeiro cliente daqui a cerca de 30 minutos), para a contagem parecer sempre «ao vivo».

## D-97 · 22/10/2026 · Demonstração: «Gestor do barbeiro» no lugar de «Lembrete»
- A aba «Lembrete» (redundante com o botão «Avisar cliente» da Agenda) passou a «Gestor do barbeiro»: o resumo que o barbeiro vê ao entrar (objetivo de hoje e do mês, faturado hoje, percentagem do mês, próximo cliente e os clientes dele: regulares, em risco e perdidos). Valores de exemplo, estáticos.
- Removidos o código e o CSS do lembrete e a ligação «Ver exemplo» da lista de funcionalidades que apontava para ele.

## D-98 · 22/10/2026 · Versões da B.3 ajustadas por segurança (Fase 0) — técnica
Com as versões exatas da B.3, o `npm audit` dava 21 vulnerabilidades (8 altas, 4 críticas). Ajustes, todos registados no `package.json` sem intervalos:
- `next` e `eslint-config-next` 15.5.28, `react` e `react-dom` 19.2.9: as correções mais recentes das mesmas séries (regra da B.3).
- `@playwright/test` 1.49.1 → 1.56.1: o Next 15.5.28 exige ≥ 1.51.1, e a 1.56 corresponde ao Chromium instalado no ambiente.
- `vitest` 2.1.8 → 5.0.5: todas as versões até à 4.1.10 têm falhas críticas (tinypool, execução remota), e a 4.1.11/4.1.12 não instala (erro do npm 10). Com o vitest 5, `@types/node` passa a 22.20.5 (ainda Node 22).
- `jspdf` 2.5.2 → 4.2.1 (falhas críticas e altas até à 4.2.0). Ainda não há código que o use; a Fase 6 escreve-se já para a versão 4.
- `supabase` (CLI) 2.6.8 → 2.121.0 (`tar` vulnerável), `eslint` 9.18.0 → 9.39.5, `@supabase/supabase-js` 2.47.12 → 2.118.0, `postcss` 8.4.49 → 8.5.31, com `overrides` para o `postcss` interno do Next.
- **Resta uma vulnerabilidade alta sem correção publicada:** `braces` ≤ 3.0.3 (negação de serviço por padrões muito encaixados), puxada por `eslint-config-next` → `fast-glob` → `micromatch`. É só ferramenta de desenvolvimento (lint), não vai para o site nem para o servidor, e os padrões são escritos por nós. `npm audit --omit=dev` dá 0 vulnerabilidades. **Decisão do dono (22/10/2026):** mantém-se o `eslint-config-next` e aceita-se esta exceção, só para o `braces` e só enquanto não houver correção. O `npm audit` corre em cada fase; quando sair a correção, atualiza-se e a exceção acaba. Qualquer outra vulnerabilidade alta ou crítica continua a parar a fase.

## D-99 · 22/10/2026 · A landing é servida tal como está pelo Next.js (Fase 0) — técnica
- A D-34 dizia `app/page.tsx` com os mesmos textos. A landing tem 225 KB de HTML, CSS e JavaScript próprios; passá-la a componentes React seria reescrevê-la (com risco de a estragar), fora dos 2 dias da fase. Fica um só ficheiro, `landing/index.html` (agora com `doctype`, `head` completo e ícones), servido em `/` por `app/(institucional)/route.ts`, estático (lido no build).
- A pasta `landing/publicar/` foi retirada: deixa de haver duas cópias. Os ícones mais recentes dela (D-80) passaram para `public/marca/`, e `favicon.ico` para `public/`.
- **Ação do dono na Vercel:** no projeto `instabarber-landing`, *Settings → Build and Deployment → Root Directory* passa de `landing/publicar` para vazio (raiz) e o *Framework Preset* de Other para **Next.js**. Em *Environment Variables*, colar `RESEND_API_KEY`, `EMAIL_REMETENTE` e `EMAIL_COMERCIAL` (os mesmos do `.env.local`). Até lá, a landing estática anterior continua no ar.
- Funções na região `fra1` (`vercel.json`).

## D-100 · 22/10/2026 · Rota de contacto e medição sem base de dados (Fase 0) — técnica
- `/api/contacto` (D-46, D-50): fase 1 devolve a `ref` (`IB-` e 8 caracteres), envia o aviso ao comercial@ (remetente `EMAIL_REMETENTE`, `reply-to` o visitante) e a resposta automática ao visitante, de apoio@. Se o aviso ao comercial falhar (chave errada, variável em falta, Resend em baixo), responde 502 e a landing mostra «Não conseguimos enviar» e o botão de WhatsApp. A falha da resposta ao visitante não muda o resultado. A fase 2 envia ao comercial os dados do passo 2 com a mesma `ref`.
- Campo-isco `website`, escondido na landing: se vier preenchido, responde `ok` e não envia nada. Os textos não aceitam caracteres de controlo (entram no assunto do e-mail).
- `/api/medicao`: aceita só `visita`, `calculadora` (a secção do radar entrar no ecrã) e `continuar`. Sem cookies nem IP: cada evento é uma linha `{"medicao":"…"}` nos registos da Vercel. **Limite:** no plano Hobby os registos duram pouco tempo, por isso as contagens só ficam guardadas quando houver base de dados (Fase 3B).
- Modo de demonstração e modo «manual» retirados da landing: «Pedido enviado» só quando a rota responde `ok`.
- Política de Privacidade da landing: o pedido chega ao comercial por e-mail e fica guardado na caixa de correio; enviamos um e-mail com a referência; contamos visitas e cliques sem dados pessoais; os prestadores (alojamento, envio de e-mail, caixa de correio) aparecem como subcontratantes.
- A fonte Inter (I.2) entra com o primeiro ecrã da aplicação (Fase 2/3): na Fase 0 não há nenhuma página React visível.

## D-101 · 22/10/2026 · E-mail de resposta ao visitante: texto profissional e assinatura comercial
- Pedido do dono: o e-mail automático que o visitante recebe fica mais profissional e passa a assinar «Comercial InstaBarber», com o número de WhatsApp por baixo, sem o rótulo «WhatsApp:». Substitui, só nos e-mails comerciais enviados para fora, a assinatura única «InstaBarber · Performa LAB» da D-44 (que se mantém nos restantes e-mails).
- O número vem da variável `TELEFONE_COMERCIAL_TXT` (nunca escrito no código). Se a variável faltar, o e-mail sai na mesma, sem a linha do WhatsApp (não é essencial). **Ação do dono:** juntar `TELEFONE_COMERCIAL_TXT` na Vercel (o valor está no `.env.local`).
- O `reply-to` da resposta passa a ser o comercial@, para que «responde a este e-mail» chegue à caixa certa.
- Os avisos internos para o comercial@ não mudam.

## D-102 · 22/10/2026 · E-mail de resposta timbrado
A resposta ao visitante passa a levar versão HTML (cabeçalho preto com a logo dourada, corpo claro, linha em branco após «Com os melhores cumprimentos,», assinatura «Comercial InstaBarber» e número a negrito, rodapé preto com comercial@instabarber.pt e o Instagram @instabarberpt). Layout em tabelas e estilos em linha (`lib/email/timbrado.ts`); texto do visitante escapado. O texto simples segue como alternativa. A logo é servida de instabarber.pt/marca. Os avisos internos continuam só em texto.

## D-103 · 22/10/2026 · E-mail timbrado fixo em modo escuro
O Gmail do iPhone em modo escuro inverteu a faixa preta do cabeçalho (logo ilegível). As faixas do e-mail timbrado levam `bgcolor` e um gradiente da mesma cor, mais `color-scheme: light only`, para o desenho ficar igual nos dois modos. Não há como testar o Gmail daqui: confirma-se com um e-mail real.

## D-104 · 22/10/2026 · Ícones no rodapé do e-mail timbrado
O rodapé passa a duas linhas alinhadas (ícone + texto): envelope junto do e-mail comercial e ícone do Instagram junto de @instabarberpt. Os ícones são PNG dourados (`public/marca/icone-email-dourado.png` e `icone-instagram-dourado.png`), porque os clientes de e-mail não suportam SVG.

## D-105 · 22/10/2026 · SEO da landing
Título, descrição e og:description passam a levar as palavras que as pessoas pesquisam («sistema de gestão para barbearias em Portugal», «software para barbeiros», agenda e marcação online). Sem «clientes perdidos» na descrição, por pedido do dono. Acrescentados JSON-LD (SoftwareApplication, sem preços), `app/sitemap.ts` e `app/robots.ts` (bloqueia só `/api/`). Cabe ao dono registar o domínio no Google Search Console e submeter o sitemap.

## D-106 · 22/10/2026 · Ícone «IB» só para favicon e ícones simples
O «IB» com tesoura e poste (branco e dourado sobre preto) **não é a logo oficial**: usa-se apenas no favicon e nos ícones simples (`favicon-512`, `favicon-192`, `apple-touch-icon`). Nunca em cabeçalhos, e-mails, documentos nem na landing como logo; a logo oficial continua a ser a horizontal (`logo-horizontal-*`). No separador do navegador (`favicon-32.png` e `favicon.ico`, 16 a 48 px) vai uma versão simplificada, sem poste nem moldura (IB maior e só a tesoura), porque o detalhe se perde abaixo de 32 px. O poste vermelho e azul foi posto de parte por não seguir as cores da marca.

## D-107 · 22/10/2026 · Ícone do atalho no iPhone
O iOS guarda o `apple-touch-icon.png` em cache pelo nome e o atalho continuava com o ícone antigo. Os ícones grandes passam a `ib-180.png`, `ib-192.png` e `ib-512.png` (nomes novos para furar a cache; mesmo desenho do D-106, só ícones simples). Acrescentados o `manifest.webmanifest` e o nome curto «InstaBarber» (`apple-mobile-web-app-title`), para o atalho não levar o título inteiro da página. `favicon-192/512.png` mantêm-se; `apple-touch-icon.png` foi retirado por já não ser usado.

## D-108 · 22/10/2026 · Teste do bucket comercial verificado como dono da base (Fase 1)
- No Supabase verdadeiro, `storage.buckets` tem RLS ativo e nenhuma política para `authenticated`: um utilizador da aplicação não lista buckets. O teste «N: o bucket comercial é privado» (`40_comercial.sql`) consultava a tabela já como super_admin e via 0 buckets. Passava antes porque o `00_shim` não ativa RLS no Storage.
- Correção, autorizada pelo dono: só o teste muda. A verificação faz-se como dono da base (`reset role`) e volta-se a entrar como super_admin logo a seguir. O esquema não muda. Verificado: 396 testes no Supabase local (PostgreSQL 15.19) e no PostgreSQL 16.15 com o shim.

## D-109 · 22/10/2026 · Supabase local, migrações e repositórios (Fase 1) — técnica
- `supabase/config.toml` com `major_version = 15` (stack, CLAUDE.md §2). O projeto de ensaio tem de ter a mesma versão; se o Supabase o criar em 17, muda-se esta linha e repete-se a verificação.
- As migrações são cópias exatas de `docs/esquema/01…04`, com o nome que o Supabase exige: `20261022000001_tabelas.sql` a `20261022000004_dados_iniciais.sql`. Alterações futuras ao esquema entram como migrações novas, depois de mudarem `docs/esquema/` e os testes.
- `scripts/gerar-mapa.sh` lê os dados iniciais por `*dados_iniciais.sql`, para servir tanto `docs/esquema/` como `supabase/migrations/`.
- `npm run test:sql` deixa os dados de teste do ficheiro 05 na base: antes de cada corrida, `supabase db reset`.
- `npm run db:types` gera `types/database.ts` e formata-o com o Prettier (o gerador sai sem formatação).
- Repositórios (`lib/repositorios/`): funções que recebem o cliente do Supabase por parâmetro (`ClienteBD`), devolvem as linhas com os nomes das colunas e trocam o dinheiro por cêntimos inteiros (`preco` → `preco_centimos`). O PostgREST devolve `numeric` como número JSON; `centimosDeNumeric` passa a aceitar número além de texto. Um id que entra num filtro `or()` valida-se com Zod antes.
- `lib/repositorios/integracao.test.ts` corre os repositórios contra o Supabase local como anónimo, só quando `SUPABASE_TESTE_URL` e `SUPABASE_TESTE_ANON_KEY` estão definidas; sem elas fica saltado e o `npm test` não precisa de base de dados.

## D-110 · 22/10/2026 · PostgreSQL 17 no Supabase local e no ensaio (Fase 1) — técnica
- O projeto de ensaio que o Supabase criou (`instabarber-ensaio`) usa PostgreSQL 17, e os projetos novos já não escolhem a versão. Como a D-109 previa, o `supabase/config.toml` passa a `major_version = 17`, para o local ser igual ao ensaio. Isto substitui o «PostgreSQL 15» da stack (CLAUDE.md §2) na base de dados.
- Verificação repetida em 17.11: migrações 01 a 04 aplicadas sem erros, RLS ativo nas 59 tabelas de `public`, 396 testes SQL a passar, `types/database.ts` igual ao gerado em 15.
- Esse projeto ficou em eu-west-2 (Londres), fora da região da stack (eu-central-1, Frankfurt), e não deixa mudar de região. Ver D-111.
- O Supabase CLI lê o `.env.local` da raiz: um `SUPABASE_DB_PASSWORD` lá dentro passa a ser usado também na base local e o `npm run db:types` falha («password authentication failed»). A palavra-passe do ensaio fica no `.env.local` como `SUPABASE_ENSAIO_DB_PASSWORD`.

## D-111 · 22/10/2026 · O projeto de ensaio fica em Londres (Fase 1)
- Decisão do dono: o `instabarber-ensaio` fica em eu-west-2 (Londres). O Supabase não muda a região de um projeto e o token recebido não cria projetos. O ensaio só guarda dados de teste.
- **A produção nasce em eu-central-1 (Frankfurt)** na Fase 7, como manda a stack (CLAUDE.md §2). Se um dia o ensaio tiver de ir para Frankfurt, cria-se um projeto novo e reaplicam-se as migrações, porque não há dados para levar.
- Esta sessão não tem ligação TCP à porta 5432. As migrações e os testes correram pela Management API do Supabase (`POST /v1/projects/<ref>/database/query`), um ficheiro por pedido, sem as linhas `\set`/`\echo` do psql. Uma falha de teste devolve o erro `FALHOU: …` e interrompe o ficheiro (verificado com uma falha propositada). A API não devolve os `NOTICE`: o número de testes de cada ficheiro é o de verificações que ele contém.
- O histórico de migrações (`supabase_migrations.schema_migrations`) foi preenchido com as quatro versões, para um `supabase db push` futuro só aplicar as migrações novas.
- Os dados de teste do ficheiro 05 ficam na base de ensaio (o esquema `teste` foi apagado), como no Supabase local.

## D-112 · 22/10/2026 · Endereços e encaminhamento (Fase 2) — técnica
- O `middleware.ts` segue a L.4 com funções puras em `lib/inquilino/` (testadas): domínio principal (raiz, `www.` e pré-visualizações `*.vercel.app`), `<slug>.<raiz>` e domínio próprio (procurado na vista `publico_inquilinos`, com cache de 5 minutos). Um subdomínio inválido ou reservado (`admin.instabarber.pt`) é tratado como barbearia: dá «Barbearia não encontrada», nunca o domínio principal.
- `/admin` num endereço de barbearia e qualquer pedido de fora a `/b/…` respondem 404 sem redirecionar (reescrita para uma rota que não existe).
- No endereço de uma barbearia, `/entrar` é a entrada do **cliente** (`/b/<slug>/entrar`, como na B.4) e a equipa entra em **`/app/entrar`** (o mesmo ecrã de `/entrar` do domínio principal). Assim o «endereço da barbearia + /app» da A.3 funciona tal como está. As ligações dos e-mails de convite e recuperação seguem o mesmo prefixo.
- O middleware põe em cada pedido `x-ib-slug` e `x-ib-base` e apaga-os se vierem do browser. Só encaminha e renova a sessão; a autorização é do servidor e do RLS.
- As Server Actions de entrar e sair devolvem o destino e o browser navega para lá (não usam `redirect()`): o redirecionamento de uma Server Action é resolvido pelo próprio servidor pelo host do pedido, e assim o destino passa sempre pelo middleware.
- Uma funcionalidade inativa responde 404 na rota (`exigirFuncionalidade`), como o `/admin`: o painel não anuncia o que não existe.

## D-113 · 22/10/2026 · Contas, convites e acesso do cliente (Fase 2) — técnica
- E-mail técnico do cliente: `<telefone sem +>.<inquilino_id>@clientes.instabarber.pt` (B.6). As contas com este domínio nunca entram pela entrada da equipa.
- Registo do barbeiro (E.3): primeiro a linha em `profissionais` com a sessão do gestor (o RLS e o gatilho do limite de profissionais decidem antes de se criar qualquer conta); depois, com a chave de serviço, o convite e o perfil (`perfis` só aceita escrita do super_admin ou da chave de serviço); por fim a ligação `perfil_id`. Se o convite falhar, a linha é apagada. Se a pessoa já tiver conta de equipa noutra barbearia (encontrada pelo e-mail dos perfis), acrescenta-se o perfil sem enviar convite: entra com a palavra-passe que já tem.
- «Reenviar convite» aparece 24 horas depois do convite a quem nunca entrou (`lib/regras/convite.ts`); o estado lê-se no Supabase Auth com a chave de serviço (parte da gestão das contas que essa chave cria).
- Pedidos de acesso: «Enviar código por WhatsApp» abre o wa.me com o código; o pedido só fica «Enviado» depois de «Já enviei» (regra 7, `codigos_acesso.enviado_em`).
- Limites por IP, contados por `consumir_limite()` (`lib/repositorios/limites.ts`): pedir código 10 por hora (o limite por número, 3 por hora, é da própria função SQL), criar acesso 20 por hora, entrada do cliente 30 por hora. A entrada da equipa usa os limites do Supabase Auth.
- O registo aberto do Supabase Auth está desligado (`enable_signup = false`): todas as contas nascem no servidor. Palavra-passe com pelo menos 8 caracteres. As ligações de convite e recuperação valem 24 horas (o convite tem de durar o tempo do «Reenviar convite»).
- Barbearia suspensa: nesta fase o painel trata-a como sem acesso. A ficha e as faturas para regularizar (C.5) chegam com o «O meu plano» (Fase 4), e a mensagem «Temporariamente indisponível» da página pública com a M.4.

## D-114 · 22/10/2026 · Componentes e dependências da Fase 2 — técnica
- shadcn/ui: `button`, `input`, `label`, `card`. O CLI quis instalar `radix-ui` (pacote agregado, com intervalo `^`) e um pacote `cn`; foram recusados. Ficaram só `@radix-ui/react-slot` 1.3.3 e `@radix-ui/react-label` 2.1.15 (autorizados pela B.3), com versões fixas de julho de 2026.
- O lockfile da Fase 0 misturava `@tailwindcss/postcss` 4.0.0 com `@tailwindcss/oxide` e `@tailwindcss/node` 4.3.3, e a build falhava («Missing field `negated`»). `overrides` fixa os dois em 4.0.0, a versão da B.3.
- O `@supabase/ssr` 0.5.2 (B.3) declara os genéricos do supabase-js antigo: os clientes de servidor convertem-se para o `ClienteBD` dos repositórios (é o mesmo objeto).
- Fonte Inter pelo `next/font/google`, descarregada no build e servida pelo próprio site (D-100).
- Ensaios de ponta a ponta: `npm run test:e2e:local` repõe o Supabase local, constrói com as chaves locais (e uma chave do Resend inválida, para nenhum e-mail real sair) e corre o Playwright; `e2e/semear.ts` cria duas barbearias e os cinco papéis. Os e-mails do Auth leem-se no Mailpit local.

## D-115 · 22/10/2026 · Auth do projeto de ensaio (Fase 2)
- Configurado pela Management API: registo aberto desligado, SMTP do Resend (`smtp.resend.com`, remetente `nao-responder@instabarber.pt`, nome «InstaBarber»), TOTP ligado, palavra-passe com 8 caracteres, ligações de 24 horas, modelos de convite e recuperação em português (os mesmos de `supabase/templates/`).
- Endereços de retorno permitidos: `localhost` e subdomínios locais, e `https://instabarber-*.vercel.app/**` (pré-visualizações da Vercel). O `site_url` fica em `localhost` até haver endereço de ensaio.
- Conta do super_admin criada no ensaio (`raphaelmartins@instabarber.pt`, perfil `super_admin`), **sem palavra-passe**: define-a por ligação segura (B9) quando houver uma aplicação de ensaio publicada a apontar para este projeto.
- Atualização (22/10/2026): as variáveis do Supabase de ensaio (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ROOT_DOMAIN`) foram postas na Vercel **só para Preview**, pela API, com o token do dono. A produção continua sem elas até à Fase 7. As pré-visualizações estão protegidas pela Vercel (só abre quem tem sessão na conta). O e-mail para o super_admin definir a palavra-passe saiu pelo Resend, com a ligação para a pré-visualização deste ramo.

## D-116 · 22/10/2026 · Esquema do InstaBarber Admin (Fase 3, migração 05)
Alterado primeiro em `docs/esquema/02_funcoes.sql` e `03_rls.sql`, com 16 testes novos (`testes/70_admin.sql`). Depois entrou como migração nova, `20261022000005_admin.sql`. Aplicado no Supabase local e no ensaio, com 412 testes SQL a passar nos dois.
- `registar_auditoria_admin()`: as ações do Admin (aprovação, rejeição, vista de apoio, importação, exportação) ficam em auditoria com o autor da sessão. Só para o super_admin com dois fatores, e o nome da ação é validado.
- `clientes_admin_criar`: o super_admin com dois fatores cria clientes de qualquer barbearia (importação CSV, E.1), mas não os altera nem apaga.
- `storage_publico_admin`: o super_admin carrega o logótipo, a capa e a galeria (separador Marca e aprovação da adesão).
- `funcionalidades_ler_publico` e `pacotes_ler_publico`: o catálogo e os pacotes leem-se sem conta, porque o formulário de adesão é público e mostra o que cada plano inclui (D.9). A grelha de cada barbearia continua fechada.
- Tudo isto evita usar a chave de serviço para coisas que o RLS pode fazer (CLAUDE.md §3).

## D-117 · 22/10/2026 · Documentos legais publicados (Fase 3)
- Por decisão do dono, os três documentos ficam como versão definitiva. O dono informou que estão aprovados juridicamente. São os Termos de Uso (`/termos`), a Política de Privacidade (`/privacidade`) e o Acordo de Subcontratação (`/termos/subcontratacao`; o caminho fica debaixo de `/termos`, que é reservado, porque «subcontratacao» não é um slug reservado).
- Texto em `lib/i18n/pt-PT/legal/`, coerente com `docs/comercial/modelo-contrato.md` e `modelo-acordo-subcontratacao.md`. Os valores que lá estavam entre parênteses retos ficaram com o valor proposto (30 dias, 48 horas, 2 dias úteis, 60 dias, 12 meses).
- Zoho: centro de dados europeu (os MX do domínio são `zoho.eu`). Foro: os tribunais portugueses competentes nos termos da lei, depois de 30 dias de tentativa de acordo.
- A identificação da Prestadora vem de `PRESTADORA_NOME`, `PRESTADORA_NIF` e `PRESTADORA_MORADA` (D-44). **Ação do dono:** pôr estas variáveis na Vercel. Sem elas, as três páginas dão erro.

## D-118 · 22/10/2026 · Adesão e aprovação (Fase 3) — técnica
- O Pro tem 3 profissionais incluídos e mínimo de 3 (D-72), em `lib/regras/mensalidade.ts`. O exemplo de código da D.7 ainda dizia 2.
- Imagens da adesão: verificadas no browser (formato, tamanho, dimensões e fundo branco do logótipo) e carregadas por URL assinado para o bucket privado `comercial`, em `adesoes/<pasta>/`. A rota volta a verificar o formato e o tamanho. Na aprovação são copiadas para `publico/<inquilino>/`, e a fachada passa a ser a primeira foto da galeria.
- `mensalidade_calculada` grava a mensalidade sem IVA, sem domínio próprio, calculada no servidor pela fórmula única.
- A equipa indicada no pedido não cria profissionais: o proprietário convida cada barbeiro na Gestão do sistema (E.3), com o limite de profissionais da base de dados.
- Boas-vindas: e-mail próprio pelo Resend, de apoio@, com o endereço da página, o do painel, a instrução completa das imagens e a ligação segura para definir a palavra-passe. A ligação é gerada sem enviar o convite do Supabase (`generateLink`, tipo convite). O reenvio usa uma ligação de recuperação. Quem já tinha conta recebe as boas-vindas sem ligação.
- Se um passo da aprovação falhar, a barbearia criada é apagada e o pedido continua pendente.
- Os formulários com React Hook Form enviam `getValues()`: o servidor valida o que a pessoa escreveu, com o mesmo esquema Zod. O resolver do formulário entregava os valores já transformados.
- Os componentes do formulário ficam em `components/adesao/`: a adesão não pertence a nenhuma das quatro camadas.
- Limites: adesão 3 por hora por IP e por e-mail; carregamento de imagens 40 por hora por IP.

## D-119 · 22/10/2026 · Painel de administração (Fase 3) — técnica
- Receita recorrente mensal: soma das barbearias ativas pela fórmula única; um plano anual conta como o valor do ano a dividir por 12 (`lib/regras/receita.ts`).
- O extra do domínio próprio cobra-se quando `inquilinos.dominio_proprio` está preenchido. Não há interruptor à parte: gravar o domínio é ligar o extra.
- Vista de apoio: cookie `ib_apoio` com a barbearia e a hora de fim (30 minutos). Só vale com sessão aal2. O painel mostra uma faixa e as ações de escrita da equipa recusam (`exigirGestorParaEscrever`). A entrada e a saída ficam em auditoria.
- Exportação: ZIP de CSV (separador «;», UTF-8 com BOM), escrito com o `zlib` do Node, sem dependências. As tabelas exportadas são as da barbearia. As da plataforma (faturação da Performa LAB, adesão, auditoria, comercial, módulos, códigos de acesso) ficam de fora. Um teste confere a classificação com `01_tabelas.sql`. Um cliente é exportado pelo telemóvel.
- Eliminar definitivamente: `eliminar_inquilino()` e depois as contas sem uso são apagadas com a chave de serviço (P-18).
- No telemóvel, a ficha com dez separadores passa a passos com indicador de posição. Os painéis passam a ter navegação inferior (no máximo 5 entradas mais «Mais»), as tabelas passam a cartões e as ações destrutivas pedem confirmação (Parte I, I.3.1).
- Os alertas «sinais de abandono» (M.2) dependem de dados de uso e ficam para a Fase 8.
- shadcn/ui: `alert-dialog` sobre `@radix-ui/react-alert-dialog` 1.1.23 (julho de 2026, autorizado pela B.3).

## D-120 · 22/10/2026 · Avançar sem esperar pela confirmação — dono
- O dono vai estar ausente e mandou avançar sem parar: fechar a Fase 3 e seguir para a Fase 4. Isto suspende, enquanto ele estiver ausente, a espera entre fases da regra 4.1 e o resumo com confirmação da regra 4.2. O resumo de cada fase fica escrito no `PROGRESSO.md`.
- Tudo o que precise da aprovação do dono (permissões, contas externas, decisões de produto não especificadas) entra na lista numerada «Pendentes do dono» do `PROGRESSO.md`. Uma decisão de produto em falta resolve-se com a opção mais simples e conservadora, fica aplicada e marcada como pendente, e o trabalho continua.
- A 3B e a 3C ficam para depois da Fase 4 (pendente 3).
- Ordem do dono, mais tarde no mesmo dia: continuar pelas Fases 5, 6 e 7 sem parar. Quando voltar, pede a lista de pendentes para aprovar. Na Fase 7, o que mexe em produção ou em contas externas (DNS, projeto de Frankfurt, planos pagos) fica preparado e entra na lista.

## D-121 · 22/10/2026 · Cartões oferta na base de dados (Fase 4) — técnica
- A venda e o uso dos cartões oferta passam por funções SQL (regra 4: o que decide o que se grava vive em SQL): `vender_cartao_oferta()` gera o código de oito caracteres, único na barbearia, sem letras e números confundíveis (I, O, 0, 1), com validade de um ano por omissão; `usar_cartao_oferta()` bloqueia o cartão, recusa anulados, expirados e usos acima do saldo, grava o movimento e liga a marcação.
- `marcacao_online_bloqueada()`: a ficha do cliente pergunta se a política de faltas o bloqueou, sem copiar a regra para o TypeScript (a regra continua em `pode_marcar_online()`); só a equipa da barbearia do cliente.
- Migração 06, as mesmas funções em `docs/esquema/02_funcoes.sql`, 16 testes em `docs/esquema/testes/80_painel.sql`.


## D-122 · 22/10/2026 · Clube de assinatura na base de dados (Fase 4) — técnica
- Inscrever e renovar passam por funções SQL (os créditos decidem o que se grava): `inscrever_clube()` cria a subscrição e o primeiro ciclo por pagar, com os créditos do plano; `renovar_subscricao()` abre o ciclo seguinte; `abrir_ciclo_clube()` é interna (sem permissão de execução).
- A renovação é no mesmo dia do mês da inscrição: a próxima data calcula-se a partir do início (início + n meses), para que o dia 31 volte a 31 depois de fevereiro.
- Com «transitar crédito», o que ficou por usar num ciclo pago soma-se aos créditos do ciclo seguinte.
- Sem tarefas agendadas (D-26): as subscrições com renovação automática renovam quando o gestor abre o clube; as manuais, com «Renovar ciclo».
- 8 testes em `docs/esquema/testes/80_painel.sql` (436 no total).

## D-123 · 22/10/2026 · Ícone e manifesto por barbearia — técnica
- Os painéis da barbearia levam o ícone e o manifesto dela: `/api/icone/<slug>?t=<32|180|192|512>&v=<versão>` desenha o logótipo sobre a cor da capa (com `next/og`, que já vem com o Next) ou, sem logótipo, o «IB» da marca; `/api/manifesto/<slug>` dá o nome e os ícones ao atalho. Só dados públicos (vista `publico_inquilinos`).
- O endereço do ícone leva uma versão que muda com o logótipo, para furar a cache do iOS (D-107). O logótipo em SVG fica com o «IB» no ícone (o desenho do ícone só aceita imagens).
- A página pública (Fase 5) usa as mesmas rotas.

## D-124 · 22/10/2026 · Painel da barbearia (Fase 4) — técnica
- Uma só origem para os números: `lib/painel/indicadores.ts` (Início, Equipa, área do barbeiro) e `lib/painel/financeiro.ts` usam a mesma faturação de serviços (`lib/regras/financeiro.ts`); os acertos vêm todos de `lib/painel/acertos.ts`. O ensaio de ponta a ponta confere a mesma receita no Financeiro do gestor e na folha do barbeiro.
- A marcação ao balcão grava diretamente em `marcacoes` (RLS); o gatilho calcula o fim, valida a vaga e aplica o preço. Concluir e faltou só pelas funções SQL. Com cartão oferta, confirma-se o saldo antes de concluir e desconta-se depois.
- O bloco de campos do Admin passou a componente comum (`components/nucleo/formulario-ficha.tsx`), com a ação de gravar recebida do servidor: o horário usa o mesmo esquema Zod nos dois painéis.
- Fotografias da ficha técnica no bucket privado `fichas` (URL assinado de 10 minutos); fotografia e portfólio do barbeiro, logótipo, fachada, galeria e produtos no bucket `publico`. As Server Actions aceitam até 4 MB por pedido (imagens até 3 MB).
- As mensagens individuais (lembrete, pós-venda, recuperação, aniversário, aviso da loja) ficam registadas em `mensagens` com o estado `ligacao_aberta` (F.4.10). O envio em lote fica para a Fase 6.
- A paleta da Marca calcula-se no browser a partir do logótipo (`lib/regras/paleta.ts`, com testes); o dono escolhe.
- A barbearia de ensaio dos testes de ponta a ponta abre o dia todo, todos os dias, para os ensaios da agenda correrem a qualquer hora.

## D-125 · 22/10/2026 · Página pública, marcação e área de cliente (Fase 5) — técnica
- Migração 07: a vista `publico_inquilinos` passa a mostrar `antecedencia_cancelamento_min` e `janela_marcacao_dias` (a confirmação diz a regra de cancelamento, H.2, e o calendário só abre os dias permitidos). `meu_codigo_convite()` e `meu_cartao_selos()` dão ao cliente com sessão só o que é dele, na barbearia pedida, sem abrir as tabelas por RLS. As mesmas funções em `docs/esquema/02_funcoes.sql`; 10 testes em `docs/esquema/testes/90_cliente.sql` (446 no total).
- A marcação pública passa só pelas funções da agenda: `vagas_livres()`, `reservar_vaga()` (reserva de 10 minutos com contagem no ecrã) e `confirmar_reserva()`; os códigos de erro traduzem-se em frases em `lib/i18n/publico`. Os pedidos de vagas, de reserva e de confirmação contam nos limites (`LIMITES_MARCACAO`).
- Multilinguagem: os textos públicos em `lib/i18n/publico/{pt,en,fr}.ts`, com um teste que confere as mesmas chaves nas três línguas. A língua escolhe-se pelo cookie `ib_lingua` ou pelo dispositivo; sem a funcionalidade `multilinguagem`, só português. Os componentes do cliente recebem a língua, não o dicionário (funções não passam do servidor para o browser).
- O texto da capa usa a cor com contraste de pelo menos 4,5:1 sobre a cor da barbearia (`lib/regras/contraste.ts`): branco, preto de marca ou preto puro.
- Livro de Reclamações: sem ligação própria configurada, o rodapé aponta para `https://www.livroreclamacoes.pt` (pendente).
- O nome da barbearia é o título principal (`h1`) da página pública.
- «Repetir o último serviço» procura o primeiro horário livre do mesmo serviço com o mesmo barbeiro, até 30 dias (ou a janela de marcação, se for menor), e reserva-o; o cliente confirma os dados.

## D-126 · 22/10/2026 · Mensagens, filas, loja pública, relatório e módulos desligados (Fase 6) — técnica
- **Migração 08** (`20261022000008_mensagens_filas.sql`, as mesmas alterações em `docs/esquema/02_funcoes.sql`, 21 testes em `docs/esquema/testes/95_mensagens_filas.sql`, 467 no total): `posicao_fila_espera()`; `avisar_fila_espera()` grava o prazo de 30 minutos no momento do aviso e só com `envio_mensagens` (Pro); `estado_fila_presencial()` devolve a posição e os números da estimativa (o cálculo vive em `lib/regras/fila.ts`); `reclamar_email_confirmacao()` e `registar_email_confirmacao()`; vista `publico_clubes`; gatilho de auditoria no interruptor geral dos módulos (`modulos_plataforma`). As posições desempatam pelo id quando duas entradas têm a mesma hora.
- **E-mail de confirmação** (F.4.12): quem acabou de confirmar pede os dados uma só vez, nos 15 minutos seguintes à reserva, sem chave de serviço (o id da marcação é a chave); a data fica na marcação antes do envio, para não haver dois envios; o resultado fica em `mensagens` (canal `email`). Remetente técnico com o nome da barbearia, resposta para o e-mail dela, na língua da página, com o `.ics` em anexo.
- **Fila presencial**: a entrada guarda-se num cookie do caminho `/fila` (14 horas) e a página volta a ler sozinha a cada 15 segundos (sem canal em tempo real: não há dependência nova nem custo). «Chamar» fica com quem carrega no botão. «Criar acesso» na fila usa a mesma regra da primeira marcação (F.9, `lib/publico/acesso-direto.ts`).
- **Código QR**: codificador próprio em `lib/regras/qr*.ts` (modo byte, correção M, versões 1 a 10), para não acrescentar dependência fora da B.4. Verificado com um leitor externo (OpenCV, num ambiente à parte, fora do projeto) nas versões 1, 3, 4, 8 e 10; os testes guardam a forma.
- **Fila de espera** na agenda (gestor e barbeiro), ao lado das vagas: o aviso leva o primeiro horário livre do serviço nesse dia; «expirado» calcula-se na leitura; «Ficou com a vaga», «Passar ao seguinte» e «Tirar da fila».
- **Loja pública**: página `/<slug>/loja` com quantidades e o total mostrado (o que conta é o de `criar_pedido_loja()`); clube e cartões oferta aparecem na página pública só como informação (compra ao balcão).
- **Mensagens**: lote a partir do radar e lembretes em lote do dia (Pro, `envio_lote`) — uma fila que abre uma conversa de cada vez; pedido de avaliação nas marcações concluídas, com consentimento, ligação de avaliação configurada e no máximo um a cada 90 dias (`podePedirAvaliacao`). Todas registadas em `mensagens`.
- **Relatório** (E.5): um só motor (`lib/painel/relatorio.ts`) e um só gerador de PDF (`lib/pdf/relatorio.ts`, jsPDF no servidor). Definições: recuperado = cliente que chega «em risco» ou «perdido» com o histórico anterior à visita; recuperada (caixa «pagou-se sozinho») = valor das visitas desses clientes até 30 dias depois de uma mensagem de recuperação aberta; a classificação do bloco 5 é a do fim do mês; ocupação do mês corrente só até hoje; melhor e pior dia pela faturação por dia da semana; receita adicional estimada de um dia fraco = minutos que faltam para 50 % × receita média por minuto marcado; subscrição = preço mensal com IVA. No painel do barbeiro, os blocos renumeram-se sem o financeiro.
- **Módulos G.4**: `lib/pagamentos` e `lib/faturacao` são **código desligado, não código morto** (regra 13): interface (`registarRecebimento`, `prepararDocumento`), adaptadores «manual» e «simulado», modos de emissão, testes. O «Pago» do clube passa por `registarRecebimento` (manual: regista, como antes); concluir um serviço chama `prepararDocumento` (desligado: nada). `/admin/modulos` com interruptor geral (não liga sem as chaves do fornecedor) e por barbearia, ambos em auditoria. `api/webhooks/pagamentos` responde 404 enquanto o geral estiver desligado; ligado, só aceita eventos assinados e é idempotente pelo id externo, usando a chave de serviço (pendente do dono, porque a CLAUDE.md §3 não lista este uso).

## D-127 · 22/10/2026 · Publicação: suspensão, cópias e testes no ensaio (Fase 7) — técnica
- **Suspensão sem perder dados (M.4):** migração 09 (`barbearia_suspensa(slug)`, só diz se há uma barbearia suspensa com esse slug, sem dados) e 9 testes em `docs/esquema/testes/97_suspensao.sql` (476 no total), que confirmam também o que o RLS já fazia: a equipa deixa de ver os dados; o gestor continua a ver o plano e as faturas; ao reativar, tudo volta. A página pública de uma barbearia suspensa mostra «Temporariamente indisponível para marcações» (em todas as rotas `/<slug>/…`). O gestor de uma barbearia só suspensa entra em `/app/suspensa`: o plano, a mensalidade e as faturas, para regularizar. O resumo do plano passou a componente comum (`components/barbearia/resumo-plano.tsx`). Um domínio próprio suspenso continua a dar «não encontrada» (o middleware resolve-o pela vista pública).
- **Cópias de segurança (L.7, P-13, P-14):** `scripts/copia-seguranca.sh` (papéis, esquema e dados, sem as tabelas internas do Storage e das funções, com `SHA256SUMS`) e `scripts/restaurar-copia.sh` (completo num projeto vazio, ou só dados num projeto com as mesmas migrações; confere o RLS e mostra as contagens; recusa a produção com `PRODUCAO_DB_HOST`). Restauro ensaiado no Supabase local: dados de teste → cópia → base reposta vazia → restauro → contagens iguais e RLS ativo nas 59 tabelas. `copias/` no `.gitignore`.
- **Testes SQL no ensaio (L.8, passo 2):** `scripts/testar-sql-ensaio.py` corre os ficheiros de teste pela Management API (sem a porta 5432, D-111), com as funções de apoio criadas e apagadas no fim. Migrações 06 a 09 aplicadas no ensaio; **476 verificações a passar** e RLS ativo nas 59 tabelas (`scripts/sql/verificar-rls.sql`, a única verificação a correr em produção).
- Um teste do `80_painel.sql` dependia da hora a que corria (movia uma marcação agendada para há dois dias e a validação do horário recusava à noite): a falta passa a gravar-se na mesma instrução. O que o teste verifica não mudou.

## D-128 · 22/10/2026 · Respostas do dono à lista de pendentes — dono
- Fases 3, 4, 5 e 6 confirmadas; a preparação da Fase 7 aceite. A 3B e a 3C ficam depois da Fase 4 (pendente 3).
- Todas as decisões que tomei sem especificação nas Fases 4 a 6 mantêm-se tal como estão (pendentes 6 a 11, 14, 16, 17, 21 a 23, 25, 27 a 33): textos do WhatsApp, fórmulas do Financeiro, custos recorrentes, cancelar na agenda, «Passar para o Pro» por e-mail, registar ao balcão, taxa de regresso, clube, promoções sem ecrã, Livro de Reclamações genérico, textos EN/FR, repetir até 30 dias, webhook com a chave de serviço quando o módulo for ativado, fila presencial, regra dos 90 dias, definições do relatório, remetente do e-mail de confirmação e cartões oferta só informativos.
- A revogação das chaves que passaram pelo chat faz-se no fim do projeto (pendente 4).
- O dono autorizou escrever as variáveis de ambiente na Vercel com os valores do `.env.local`. Escritas pela API (pendente 2): dados da Prestadora, `EMAIL_NOTIFICACOES` e `TELEFONE_COMERCIAL` em Preview e Production; `RESEND_API_KEY` (como sensível), `EMAIL_REMETENTE`, `EMAIL_COMERCIAL` e `TELEFONE_COMERCIAL_TXT` em Preview. As do Supabase de Production só depois do projeto de Frankfurt.

## D-129 · 22/10/2026 · Páginas do cliente com layout de computador — dono
- O dono testou a marcação no computador e a coluna de telemóvel (460 px, I.3 camada 4) prejudicava a experiência. **Prevalece sobre a I.3:** no telemóvel tudo fica igual (460 px, um passo por ecrã); a partir de 768 px as páginas do cliente alargam.
- Marcação, loja e área de cliente usam a largura de uma página (`MolduraCliente larga`, até 1024 px): serviços e barbeiros em duas colunas, horas em seis, e um resumo «A sua marcação» fixo à direita (barbearia, serviço, barbeiro, dia e hora, preço); a loja põe o total e os dados fixos ao lado dos produtos; a área de cliente fica em duas colunas. Entrada, fila e páginas de um só cartão alargam até 576 px.

## D-130 · 22/10/2026 · SEO da landing: título, descrição e palavras de pesquisa — dono
- Título aprovado pelo dono: «Sistema Completo para Gestão de Barbearias | InstaBarber» (56 caracteres, a palavra-chave primeiro e a marca no fim). Descrição (152 caracteres): «Sistema completo para gestão de barbearias em Portugal: marcação online, agenda, clientes, equipa e financeiro num só sítio. Experimenta a demonstração.» As partilhas (Open Graph e Twitter) seguem a mesma mensagem.
- Linha «Sistema de gestão para barbearias» dentro do H1, por cima do slogan, em letra pequena: a pesquisa encontra-a e o desenho quase não muda.
- Sem `meta keywords` (o Google ignora-a): as variações de pesquisa vão nos dados estruturados (`alternateName`, `keywords`) e no texto (a primeira resposta das perguntas frequentes diz «programa para barbearias… como uma app»).
- Dados estruturados: `SoftwareApplication` com os preços (de 24,59 € a 47,97 € por mês, com IVA) e `FAQPage` com as seis perguntas da página. O sitemap passa a levar a data da publicação (`lastmod`).
- Feito no `main` com autorização do dono (a outra sessão tinha terminado).
- Com autorização do dono, `www.instabarber.pt` redireciona para `instabarber.pt` (308, nas definições de domínio da Vercel): uma só morada para o Google, sem conteúdo duplicado.

## D-134 · 22/10/2026 · Redesenho, lote A: sistema de design, aparência e casca — dono e técnica
- O dono enviou o prompt do redesenho (`docs/redesenho/prompt-redesenho-v4.md`) e escolheu começar já pelo lote A, com o grupo D (produção) à espera do item 35. Só front-end: esquema, migrações, repositórios, regras de negócio, rotas de API, middleware, ações de servidor e esquemas Zod ficam intactos.
- **Tokens únicos** em `app/globals.css` (variáveis CSS ligadas ao Tailwind 4 por `@theme inline`): superfícies escuras por omissão, modo claro desenhado à parte, três destaques (Ouro por omissão, Neon e Marca da barbearia), semânticas, raios, sombras, curva de movimento; `prefers-reduced-motion` desliga o que não é essencial. `lib/design/tokens.test.ts` lê o CSS e comprova o contraste AA nas combinações.
- **Contrastes corrigidos face ao prompt** (os valores pedidos não davam AA): terciário escuro `#8B8B94` (o `#71717A` dá 4,1 sobre o cartão), terciário claro `#65656E`, ligações Ouro no claro `#945C00` (o `#B8760A` dá 3,4 sobre branco) e Neon no claro `#087A40`.
- **Marca da barbearia:** `lib/design/cor.ts` (função pura com testes) ajusta a cor da capa até ao contraste mínimo (3:1 para botões, 4,5:1 para texto) em cada modo; o layout dos painéis injeta as variáveis `--marca-*`. Como `capa_cor` tem sempre valor (por omissão `#F5A623`), a opção «Marca» aparece sempre.
- **Aparência no dispositivo** (`lib/design/aparencia.ts`): modo (Escuro, Claro, Sistema; por omissão Sistema) e destaque, em `localStorage` (`ib_aparencia`, com try/catch), aplicados por um script mínimo no `<head>` antes da primeira pintura. Não há campo de preferência no perfil, por isso não se guarda na base de dados.
- **Casca:** cabeçalho em vidro (logótipo dourado no escuro, preto no claro), paleta de comandos Ctrl/Cmd K feita à mão (ecrãs ativos, «Nova marcação», «Procurar o cliente»), seletor «Aparência»; barra lateral recolhível a partir de 768 px (240 ou 72 px, `ib_menu_recolhido`); navegação inferior em vidro com a área segura no telemóvel. As entradas «upgrade» continuam desativadas com a etiqueta Pro.
- **Componentes:** `components/ui` e `components/nucleo` restilizados sem mudar as propriedades; novos `AnelProgresso`, `Esqueleto`, `EstadoVazio` e `Etiqueta`. Os rótulos das etiquetas são os do esquema: «Pago»/«Por pagar» (contas e clube), «A pagar»/«A receber»/«Liquidado» (acertos), «Em atraso» (mensalidades).
- **Catálogo** em `/admin/design` (o prompt dizia `/administracao/design`; o Admin vive em `/admin`), só para o super_admin com 2FA, com dados de demonstração. Ensaio Playwright em `e2e/design.spec.ts`.
- **Fica para os lotes seguintes:** botão central «Nova marcação» na navegação inferior, folhas inferiores e gestos, números que contam, gráficos Recharts restilizados e os restantes componentes da lista 3.4 (interruptor, separadores, tooltip, toast, avatar, linha temporal), à medida que cada ecrã os usa.
- **Logótipos novos do dono (22/10/2026):** dourado `#F5A623` com «Insta Barber» a branco, branco e preto, guardados em `public/marca/originais/` e preparados com fundo transparente: `logo-escuro`, `logo-claro`, `logo-branco-mono` e os ícones correspondentes (`icone-escuro`, `icone-claro`, `icone-branco-mono`). O cabeçalho dos painéis usa-os (no telemóvel, só o ícone). Os ficheiros antigos (`logo-horizontal-*`) ficam: ainda servem a adesão, os documentos legais, o cartão de acesso e os e-mails já em produção; trocam-se nos lotes desses ecrãs.
- Numeração: as decisões da landing feitas no `main` (lá D-108 a D-111) renumeraram-se no merge para D-138 a D-141.

## D-135 · 23/10/2026 · Respostas do dono sobre o lote A do redesenho — dono
- **Merge do lote A: aprovado.** Executa-se quando a produção estiver pronta (itens 35 a 38). O `main` ainda só tem a landing e a Production da Vercel não tem as variáveis do Supabase, por isso um merge agora levaria a aplicação para `instabarber.pt` sem base de dados. No merge, as decisões da landing no `main` (D-108 a D-111 de lá) renumeraram-se para D-138 a D-141.
- **Contrastes corrigidos face ao prompt: aceites** (terciário escuro `#8B8B94`, terciário claro `#65656E`, ligações Ouro no claro `#945C00`, Neon no claro `#087A40`; D-134).
- **Catálogo de design em `/admin/design`: aceite.** O prompt dizia `/administracao/design`; o Admin vive em `/admin` e o catálogo segue-o. Só o super_admin com 2FA o vê, como o resto do Admin. Registado no mapa do sistema.
- **Etiquetas financeiras com os nomes do esquema: aceites.** «Pago» e «Por pagar» (contas e ciclos do clube), «A pagar», «A receber» e «Liquidado» (acertos), «Em atraso» (mensalidades). Não se usam «Pendente», «A acertar» nem «Acertado». «Pago» quer sempre dizer registado ao balcão: o sistema nunca cobra.

## D-136 · 23/10/2026 · `llms.txt` na raiz do domínio — técnica
- `public/llms.txt` (formato de llmstxt.org): o que o InstaBarber faz, planos com o preço final, o que não faz (não cobra nem fatura), dados na UE, ligações e contactos. Serve-se em `https://instabarber.pt/llms.txt`; não se submete no Search Console (o Google não o lê: é para os assistentes de IA).
- Os preços repetem a tabela da CLAUDE.md §6; se os preços mudarem, muda-se também este ficheiro (está no mapa do sistema).
- No `main` (produção) vai sem as ligações aos Termos e à Privacidade, que ainda só existem neste ramo; voltam com o merge.

## D-137 · 23/10/2026 · Supabase de produção no plano gratuito até à primeira barbearia — dono
- O projeto de produção (Frankfurt, empresa Performa LAB) começa no plano gratuito; passa a Pro **antes** de a primeira barbearia real entrar (prevalece sobre o item 35, que pedia Pro desde o início).
- Riscos aceites enquanto for gratuito: o projeto pausa após uma semana sem uso (volta ao reativar no painel) e não há cópias diárias. Enquanto isso, a cópia faz-se à mão com `scripts/copia-seguranca.sh` antes de cada alteração de esquema (P-13). O plano gratuito permite dois projetos ativos por empresa: ensaio e produção ocupam os dois.
- Passar a Pro faz parte da lista da entrada da primeira barbearia (manual do operador).

> As quatro decisões seguintes foram tomadas no `main` (landing) com os números D-108 a D-111, que no ramo da aplicação já eram de outras decisões. Renumeradas no merge de 24/10/2026.

## D-138 · 22/10/2026 · Ícone do atalho: PNG sem transparência e cópia na raiz
O atalho no iPhone mostrava o nome certo mas não o ícone (um «I» sobre preto), embora o ficheiro abrisse no Safari. Os ícones `ib-*.png` passam a RGB, sem canal alfa, e há uma cópia na raiz (`/apple-touch-icon.png` e `-precomposed`), que é onde o iOS também procura; a landing e o layout apontam para a raiz. O `middleware.ts` deixa de intercetar `apple-touch-icon`. Se mesmo assim falhar, o próximo passo é testar sem o manifesto.

## D-139 · 22/10/2026 · Landing redesenhada: dois temas, um só destaque
A landing passa a cinzentos profundos (#09090B, #121214, bordas a branco 8 %) com **um só destaque**: ouro da marca (#F5A623, tema «Ouro», por defeito) ou verde neon (#2DFF8A, tema «Neon»). O verde e o vermelho semânticos (sucesso, perda) mantêm-se; no Neon o sucesso passa a ser o próprio verde neon. Chave de tema no cabeçalho, escolha guardada no navegador (`ib-tema`). **Exceção só para a landing**: a identidade da Parte I mantém-se nos restantes ecrãs até o dono decidir alargar. O logótipo oficial não muda de cor. Sem novas dependências: CSS e JS à mão, com o script de animações isolado do da demonstração. O bento mostra Agenda, Painel financeiro, Selos e Gestor em simultâneo (os separadores ficam ocultos).

## D-140 · 22/10/2026 · Novo favicon: «I» como poste de barbeiro
O favicon e os ícones simples passam a um «IB» em que o «I» é um poste de barbeiro (corpo branco com listras vermelhas e azuis, tampas em barra) e o «B» usa o dourado dos botões da landing (#F5A623), sobre #09090B. As letras vêm do logótipo original (recortadas), não de uma fonte. Continua a **não ser a logo oficial** (D-106). O vermelho e o azul das listras são uma exceção pontual à paleta, pedida pelo dono. Ficheiros novos para furar a cache do iOS: `ib2-180/192/512.png`, `favicon2-32.png`, e `favicon.ico`, `apple-touch-icon*.png` na raiz atualizados.

## D-141 · 22/10/2026 · Fotos de produto na loja de demonstração
A loja de demonstração da landing mostra uma foto por produto (`public/marca/loja/`, JPEG 360 px), numa moldura clara com cantos redondos, sombra suave e brilho, dentro do cartão em vidro do redesenho (D-139). Produto esgotado fica a preto e branco. Atenção: as três fotos (pomada Kemon, óleo Proraso, champô Dr.EA) são imagens de terceiros com marcas visíveis, fornecidas pelo dono como exemplo. Antes de manter na página pública, confirmar o direito de uso ou trocar por fotos próprias ou genéricas; basta substituir os três ficheiros, sem mexer no código.

## D-142 · 24/10/2026 · Produção do Supabase configurada (itens 36, 37, 38 e 41) — técnica
- Projeto `mzorsfvbkhazzchqmtlv` («Insta Barber», eu-central-1, PostgreSQL 17.11, empresa Performa LAB), acedido pela Management API com um token próprio da produção (`SUPABASE_PRODUCAO_ACCESS_TOKEN`, só no `.env.local`; a revogar no fim, pendente 4).
- **Migrações 01 a 09** aplicadas pela ordem, sem erros, e registadas em `supabase_migrations.schema_migrations` (um `supabase db push` futuro só aplica as novas). Verificação **só** com `scripts/sql/verificar-rls.sql`: RLS ativo nas 59 tabelas; 31 funcionalidades, 39 feriados, buckets `publico` (público), `fichas` e `comercial` (privados). Nenhum teste SQL correu na produção.
- **Auth** copiado do ensaio (D-115): registo fechado, TOTP, palavra-passe com 8 caracteres, SMTP do Resend (`nao-responder@instabarber.pt`, «InstaBarber»), modelos de convite e recuperação em português. `site_url` `https://instabarber.pt`; retornos permitidos `https://instabarber.pt/**` e `https://*.instabarber.pt/**`.
- **Super_admin** `raphaelmartins@instabarber.pt` (perfil `super_admin`, nome «Performa LAB») criado sem palavra-passe conhecida: define-a pela ligação segura (B9) e inscreve o TOTP na primeira entrada.
- **Chaves novas do Supabase:** a produção usa a chave publicável (`sb_publishable_…`) como `NEXT_PUBLIC_SUPABASE_ANON_KEY` e a secreta (`sb_secret_…`) como `SUPABASE_SERVICE_ROLE_KEY`; o supabase-js aceita as duas. A secreta foi lida pela API e nunca passou pelo chat.
- **Vercel (Production):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (sensível) e `ROOT_DOMAIN=instabarber.pt`. Com as que já lá estavam, a Production tem todas as variáveis que a aplicação lê.

## D-143 · 24/10/2026 · Botão fixo da landing no telemóvel: texto por secção — dono

- O botão fixo (só abaixo de 768 px) deixa de repetir «Experimenta online já», que já é o botão do topo. O texto acompanha a secção que está a meio do ecrã: «Quero ver como funciona» (início e reserva), «Quero isto na minha» (loja, clube, receita), «Quero recuperar clientes» (calculadora), «Quanto estou a perder?» (radar), «Começar com o Pro» (planos), «Aceito o desafio» (desafio), «Tenho uma dúvida» (perguntas). Destino sempre `#contacto`.
- Troca com texto a subir e a desvanecer, uma pulsação de brilho e variantes de estilo (`hot`, `go`, `calm`). Sem movimento com `prefers-reduced-motion`. Segue o tema Ouro/Neon.
- Correção: o botão estava no HTML depois do script, que não o encontrava; por isso nunca se escondia no topo nem no formulário. Passou para antes do script. Esconde-se no topo e quando o formulário de contacto aparece.

## D-144 · 24/10/2026 · Skills do redesenho e ordem dos lotes — dono
- O dono autorizou instalar skills de desenho no repositório. Entra `ui-ux-pro-max` (MIT, consulta local em Python, sem dependências nem rede) em `.claude/skills/`, como **verificador** de acessibilidade, toque e estados; não manda em cores nem tipografia. O `impeccable` (Apache 2.0) instala-se com o instalador oficial no Code, que o revê; não se copiou à mão.
- Ordem dos lotes: Equipa (barbeiro) → Gestão e financeiro → Minha área → páginas públicas → Administração → transversais. Prioridade entre skills e regra de desempate na secção 14 do `docs/redesenho/prompt-redesenho-v4.md`.
- O histórico de cortes por serviço (até duas fotos, visível ao barbeiro e ao cliente) mexe no esquema: aguarda decisão do dono antes de construir.

## D-145 · 25/10/2026 · Botão fixo a cores e correções da auditoria da landing — dono
- O botão fixo passa a ter seta em todos os textos e uma cor por mensagem, só com as cores da página: Ouro (início e planos), claro (loja, clube, receita e desafio), vermelho (calculadora: «Quero saber quanto perco»), verde (radar: «Quero recuperar clientes») e vidro (perguntas). No tema Neon o verde e o Ouro coincidem, como o resto da landing. A escolha do texto passou a medir a posição das secções ao rolar, mais fiável do que o observador anterior (que falhava no radar, dentro da calculadora). Substitui os textos da D-143.
- Auditoria (método Impeccable, 16/20): nome acessível nos botões Ouro e Neon, ligação «Saltar para o conteúdo», área de toque de 44 px no seletor de tema e nas ligações pequenas do rodapé e «Ver exemplo», e o logótipo do lema passa de duas cópias em base64 no HTML para o ficheiro `public/marca/ib-lema.png` (a página desce de cerca de 250 KB para metade). Fica por fazer, por ser P3: níveis de título e transições de largura.

## D-146 · 25/10/2026 · Páginas públicas: auditoria e catálogo de modelos — dono
- O dono quer as páginas públicas auditadas com as skills do redesenho (secção 14 do v4) e um catálogo bem maior: Noir, Atelier, Vivo com 3 variações de cor (Sólido, Duo, Noite), Clássico restilizado como cartaz retro, e novos modelos para outros estilos de negócio (propostos: Street, Maison, Oficina e Industrial), mais formas de o inquilino personalizar. Prompt: `docs/redesenho/prompt-paginas-publicas-v1.md`; substitui o setor F do v4.
- Pendentes que o Code deve perguntar: (1) onde guardar o modelo e as opções de personalização (hoje só existem cor e logótipo; se faltar, é alteração de esquema); (2) autorização para uma fonte de exibição própria no Clássico (hoje só Inter).

## D-147 · 24/10/2026 · Palavra-passe do super_admin definida a pedido do dono; SMTP da produção corrigido — dono e técnica
- **Exceção à B9, só para a conta do dono:** o dono escreveu a palavra-passe da sua conta (`raphaelmartins@instabarber.pt`) no chat e pediu que fosse posta «por minha conta e risco». Definida pela API de administração do Auth e testada (entrada aceite). Não ficou em nenhum ficheiro nem commit. Recomendação registada: trocá-la pelo «Esqueci-me da palavra-passe» quando puder, porque ficou no histórico da conversa. As outras contas continuam a definir a palavra-passe por ligação segura (B9). O TOTP inscreve-se na primeira entrada no `/admin`.
- **SMTP da produção:** a Management API devolve um resumo (hash) no lugar da palavra-passe do SMTP, por isso a cópia do Auth do ensaio (D-142) deixou na produção um valor que o Resend recusava, e a recuperação de palavra-passe dava erro 500. Corrigido com a chave do Resend do `.env.local`; a recuperação passou a sair (`recovery_sent_at` preenchido). Lição para o manual: ao copiar a configuração do Auth entre projetos, a palavra-passe do SMTP põe-se sempre à parte.

## D-148 · 24/10/2026 · Cópias da produção pela API, guardadas no Google Drive (item 44) — dono e técnica
- O contentor de trabalho não chega à porta 5432 da produção (testado: base direta e pooler fechados), por isso a cópia faz-se pela Management API: `scripts/copia-api.py` lê em JSON as tabelas de public, as contas (`auth.users`, `identities`, `mfa_factors`) e o Storage (buckets e metadados), com um manifesto (contagens, migrações) e somas SHA-256, e cifra tudo num único ficheiro GPG (AES-256). O esquema não vai na cópia: as migrações do repositório recriam-no. Os ficheiros do Storage ainda não entram (não há nenhum); quando houver, copiam-se à parte.
- `scripts/restaurar-copia-api.py` repõe a cópia numa base vazia com as mesmas migrações, numa transação, sem gatilhos nem chaves estrangeiras durante a carga, e compara as contagens com o manifesto. Recusa a produção.
- Por escolha do dono, as cópias guardam-se no **Google Drive** dele, pasta «InstaBarber · Cópias de segurança» (sem herdar partilhas). A palavra-passe da cifra (`COPIA_SENHA`) foi gerada aleatoriamente, está no `.env.local` e é entregue ao dono para o gestor de palavras-passe; nunca fica no Drive.
- **Restauro testado** (P-14): cópia da produção de 24/10/2026 reposta no Supabase local com as migrações 01 a 09; 64 tabelas e 127 linhas iguais ao manifesto, a conta do super_admin e o perfil repostos, RLS ativo nas 59 tabelas.

## D-149 · 24/10/2026 · Admin: «Funcionalidades» só na ficha, pasta «Gestão do negócio», 3B a seguir e sugestões A a J — dono
- **Funcionalidades só dentro de cada barbearia** (escolha b): sai do menu lateral e a página `/admin/funcionalidades` deixa de existir; a grelha D.3 fica no separador «Funcionalidades» da ficha, que já tinha tudo (pacote do plano marcado, inativas, bónus em auditoria, «Repor pacote»). As ações passaram para `barbearias/[id]/acoes-funcionalidades.ts`.
- **Menu lateral do Admin com uma pasta «Gestão do negócio»**: o que é gestão da empresa InstaBarber (Comercial/CRM, Finanças, barbearias em risco, métricas, apoio, comunicados…) fica dentro dela, como subpastas; fora fica a gestão da plataforma e das barbearias (Painel geral, Barbearias, Pedidos de adesão, Pagamentos, Módulos).
- **Fase 3B começa já** (Comercial, Parte N), por camadas; depois a 3C.
- **Sugestões aceites, todas (A a J)**, a entrar no plano depois da 3B e da 3C: A — saúde de cada barbearia (risco de cancelar); B — arranque das barbearias novas (lista de passos e percentagem); C — registo de apoio por barbearia; D — comunicados no painel das barbearias; E — métricas de crescimento (cancelamentos, tempo de vida, origem); F — indicações (a recompensa é decisão do dono, porque os bónus não mudam o preço); G — fecho de caixa diário (só registo); H — alertas de stock; I — mapa das horas mortas com sugestão de promoção; J — seguimento das avaliações no Google. As de A a F vivem na «Gestão do negócio»; as de G a J são funcionalidades das barbearias e entram na grelha D.3 (chaves novas no `04_dados_iniciais.sql`, com testes), por isso cada uma pede a decisão do plano em que fica (Basic ou Pro) antes de ser construída.

## D-150 · 24/10/2026 · Fase 3B, camada 1A: o formulário do site grava no CRM — técnica
- `/api/contacto` passa a gravar cada pedido no CRM com `submeter_lead()` (o visitante pode chamá-la) e conta o limite por IP com a chave de serviço (`contactoIp`, 10 por hora, porque os dois passos contam). Com o limite esgotado responde 429 sem gravar nem enviar; se a base falhar, o e-mail ao comercial segue na mesma, para não se perder o pedido. O aviso ao comercial leva a ligação para os leads do CRM.
- **Migração 10** (`20261024000010_comercial_site.sql`, a mesma alteração em `docs/esquema/02_funcoes.sql`, 10 testes em `testes/98_comercial_site.sql`, 486 no total): `submeter_lead()` aceita o passo 2 do formulário (`"passo": "2"`), que completa **só os campos ainda vazios** do lead aberto (barbearia, cidade, barbeiros) e regista a dificuldade e o distrito no histórico. Um lead do site sem o evento do passo 2 é «incompleto» (aba «Incompletos», D-50).
- O telemóvel do passo 2 normaliza-se como o do passo 1 (E.164), para os dois passos caírem no mesmo lead.
- A landing deixa de dizer que o pedido fica só na caixa de correio: fica no registo comercial, em servidores na UE, 12 meses sem contrato (N.9). A Política de Privacidade da plataforma já o dizia.

## D-151 · 24/10/2026 · Fase 3B, camada 2: briefing e proposta — técnica
- **Briefing** (N.4) em `lib/comercial/briefing.ts`, um esquema Zod para o formulário e o servidor; pode ficar a meio e só os campos com * são precisos para gerar a proposta. O valor da visita guarda-se em cêntimos. Acrescentei o campo «Clientes que deixaram de vir (estimativa)», porque a conta «o que isto vale para si» da N.4 (perdidos × visita × 0,4, F.1) precisa dele; sem ele a conta não aparece.
- **Proposta** (N.5) em `lib/comercial/proposta.ts`: preços pela fórmula única (`mensalidade.ts`), o Basic com 1 profissional e o Pro com pelo menos 2 (restrição da tabela), o desafio de 90 dias só no Pro, a solução ligada às dores só com o que o plano inclui (mapa `SOLUCAO_POR_DOR`), e a fotografia completa em `propostas.dados`. A versão, a numeração `PRP-AAAA-NNNN`, o «substituída», a validade e a imutabilidade depois de enviada ficam nas funções e nos gatilhos da base de dados.
- **PDF gerado na hora** a partir da fotografia (`/admin/comercial/propostas/[id]/pdf`, só super_admin com 2FA), em vez de guardado no bucket: é sempre igual ao enviado, porque a fotografia não muda depois de enviada. A coluna `pdf_path` fica para o PDF **assinado** dos contratos (N.7).
- As **condições** da proposta vêm do modelo `condicoes_proposta` aprovado (N.8). Enquanto não houver nenhum aprovado, o PDF diz «Condições por aprovar» em vez de inventar texto jurídico; o ecrã Modelos chega na camada 3.
- Envio: o sistema não envia; a ficha oferece o PDF, o texto pronto por `wa.me` e por `mailto`, e «Marcar como enviada» (só aí começa a validade). Decisão: «Aceite» ou «Recusada» com motivo.

## D-152 · 24/10/2026 · Fase 3B, camadas 3 e 4: modelos, contrato, assinatura e convite de adesão — técnica
- **Modelos** (N.8): os rascunhos base vivem só em `docs/comercial/` (revistos pelo jurista). O ecrã Modelos importa-os como versão nova em rascunho (`lib/comercial/modelos-base.ts`, ficheiros incluídos no build pela `outputFileTracingIncludes`), em vez de os pôr na semente SQL: a semente colidia com os testes SQL existentes, que não se mudam sem autorização. Editar só o rascunho, com pré-visualização com dados de exemplo; aprovar com confirmação (o aprovado anterior do mesmo tipo fica arquivado); um aprovado ou arquivado só gera «nova versão». Nada é aprovado pelo sistema: a aprovação é do dono, depois do parecer do jurista.
- **Contrato** (N.6): gera-se da proposta aceite com o modelo aprovado; os dados do contratante vêm do briefing e o operador confirma-os. **Cargo e e-mail passam a obrigatórios**, porque o modelo base os usa nas Partes, nas comunicações e nas assinaturas. Um marcador desconhecido ou obrigatório sem valor impede a geração e diz qual; os opcionais (domínio próprio, condições de lançamento, desafio) passam a «Não aplicável». O **número** do contrato dá-o `gerar_contrato()` e entra no texto logo a seguir; a **data de assinatura** fica como espaço em branco para preencher à mão ou ficar na assinatura digital.
- **PDF do contrato** gerado na hora do texto fixado, com o Anexo I (a fotografia da proposta aceite); os anexos II a IV são referidos no texto do modelo (Termos e Privacidade e o Acordo de Subcontratação estão publicados no site). O **PDF assinado** carrega-se do browser diretamente para o bucket privado `comercial` por URL assinado (caminho `leads/<lead>/contratos/<id>-assinado.pdf`) e só depois `assinar_contrato()` marca «assinado» e o lead «ganho». Descarrega-se por um URL temporário de 10 minutos.
- **Convite de adesão** (N.7): código aleatório de 32 bytes, só o hash na base de dados, válido 14 dias e de uso único, mostrado uma vez com «Copiar» e o texto pronto por `wa.me`. `/adesao?convite=` abre o formulário já preenchido (identidade, contactos e contratação; o resto preenche-se como sempre); no envio, `usar_convite_adesao()` liga o pedido ao contrato (um convite inválido não impede o pedido) e, na aprovação, `ligar_contrato_inquilino()` liga o contrato e o lead à barbearia criada.
- Ensaios: os e2e semeiam o modelo de contrato base já aprovado (os dois projetos geram contratos sem corrida na aprovação) e ensaiam a importação com o das condições; antes de enviar a adesão do convite, repõem o limite de adesões por IP (os ensaios saem todos do mesmo IP).

## D-153 · 25/10/2026 · Fase 3C: Finanças da Performa LAB — técnica
- Separador **Finanças** dentro da pasta «Gestão do negócio» (D-149), com os cinco separadores da O.2. Sem alteração ao esquema: tudo assenta nas tabelas, na vista e nas funções da secção 18/8C já em produção.
- **Custos de partida (L.6)** num botão, só com a lista vazia: entram com início no dia e o operador corrige-os pela fatura (os valores em dólares registam-se já em euros). As contas do próximo mês geram-se de cada custo mensal ativo e de cada anual no mês em que faz anos, no mesmo dia do início (ou no último do mês), sem duplicar.
- **Saídas (churn)** e o histórico de 12 meses: a auditoria regista que o estado da barbearia mudou, não para quê; numa barbearia cancelada, a última mudança de estado é a saída. O gráfico usa o plano atual de cada barbearia, porque o histórico de planos não se guarda (dito no ecrã).
- **Textos dos lembretes** de vencimento em `lib/i18n/pt-PT/financas.ts` (regra dos textos visíveis, CLAUDE.md §5); `lib/financas/mensagens.ts` escolhe o modelo pelos dias e monta-o. Em atraso, o pedido segue o escalão da P-09 (até 7, 15 e 30 dias).
- **Previsões**: os pressupostos por omissão (média das novas dos 3 meses anteriores; saídas observadas ou 3 % declarados) saem de um só gerador, `lib/financas/previsao-base.ts`, usado pelo Resumo (mês em que a previsão base chega ao equilíbrio) e pelo Objetivo e previsões.
- **Exportar**: as mesmas secções no CSV («;», UTF-8 com BOM, valores em «12,30») e no PDF; o ficheiro diz «Não é documento fiscal» e o período, e fica em auditoria (`exportacao_financas`).
- **Numeração:** na junção com o `main` (25/10/2026), as decisões deste ramo D-143 a D-149 passaram a D-147 a D-153, porque o `main` já tinha publicado D-143 a D-146 (landing e redesenho). As referências no código e nos documentos foram atualizadas.

## D-154 · 25/10/2026 · Contrato: análise preliminar do jurista aplicada ao rascunho base — dono, jurista e técnica
- O jurista não aprova ainda o modelo. O rascunho base (`docs/comercial/modelo-contrato.md`, versão 2) foi revisto segundo as indicações dele: 6.1 e 6.4 (preço final com e sem IVA; a cláusula de IVA deixa de falar em isenção e segue a redação proposta pelo jurista), 9.2 (quando a denúncia produz efeitos e quando acaba a faturação), 11 (dados exportáveis, formato, pedido, entrega e transição, recuperação, eliminação; a saída deixa de prolongar o contrato; enquadramento no Regulamento dos Dados a confirmar), 14 (sem exclusão de responsabilidade por dolo, culpa grave e nos casos do artigo 18.º do DL 446/85; danos diretos, indiretos e segurança/dados separados), 16 (atualizações técnicas vs alterações materiais), 17 (receção do e-mail sem presunção automática), 18 (sem declarações pré-preenchidas de leitura e esclarecimento; data de envio e versão registadas), 19 (cessão só com consentimento dado no momento), 21.3 e 21.4 (meio de assinatura e conservação do exemplar), Anexo II (versões publicadas) e Anexo IV («Incluído, nos termos da proposta aceite»).
- **Nenhum contrato sai com campos em aberto:** o texto gerado com um campo entre [ ] é recusado e o ecrã diz quais faltam; o editor de modelos mostra quantos há. A data de envio fica no histórico do lead («Marcar como enviado») e a versão no `modelo_id` do contrato.
- Ficam por decidir pelo dono (valores entre [ ]): prazos (aviso de bónus, preço, pagamento, contestação, suspensão, resolução, denúncia, transição, força maior, confidencialidade, alterações), horário e prazo do suporte, objetivo de disponibilidade, limite da responsabilidade, forma dos avisos formais e meio de assinatura.
- Por decisão do dono, saíram do texto os campos que eram do jurista: o foro (20.3; sem cláusula, aplicam-se as regras legais de competência), o limite próprio para segurança e dados (14.5; segue a regra geral da cláusula 14), a nota sobre o Regulamento dos Dados (11.8) e a confirmação das versões do Anexo II. Continua a ser do jurista o parecer final, com os Anexos II e III, antes de o dono aprovar o modelo.
- **Decisões do dono (25/10/2026), já no texto:** bónus retirados com 30 dias de aviso; suporte de segunda a sábado das 8h00 às 20h00 e, ao domingo, só emergências; aviso de mudança de preço 60 dias; vencimento da fatura a 15 dias da emissão (o «usual no mercado», escolha técnica) e contestação em 15 dias; suspensão aos 10 dias de atraso (aviso de 8 dias) e resolução aos 40 (aviso de 15 dias); denúncia com 30 dias; incumprimento grave sanável em 15 dias; entrega, transição e recuperação dos dados em 30 dias cada; confidencialidade 2 anos; objetivo de disponibilidade mensal de 99,5 % (cláusula 14.1 do dono); limite de 12 meses; força maior e comunicações com a redação do dono (cláusulas 15 e 17); alterações materiais com 60 dias; assinatura qualificada ou manuscrita, à escolha. O modelo deixa de ter campos em aberto e passa a poder ser aprovado no ecrã Modelos depois do parecer final do jurista.

## D-155 · 25/10/2026 · Anexos II e III revistos com o jurista; contrato e landing alinhados — dono, jurista e técnica
- Por ordem do dono («faça como pede»), os Termos de Uso, a Política de Privacidade e o Acordo de Subcontratação (`lib/i18n/pt-PT/legal/`, versão de 25/10/2026) passam a ter o texto proposto pelo jurista: hierarquia contrato > proposta > Termos e registo da versão aceite; funcionalidades da proposta ou do resumo da contratação (um bónus nunca retira o que foi contratado); plano anual pago antecipadamente; suspensão (10 dias), resolução (40 dias) e suporte iguais ao contrato; exportação, recuperação e eliminação com os mesmos prazos (30 + 30 + 30 dias) nos três documentos; disponibilidade 99,5 % com exclusões objetivas; comunicações formais iguais à cláusula 17 do contrato; cookies e estatísticas descritos como estão implementados; prestadores e transferências sem afirmar mais do que a configuração prova; no Acordo, operações de tratamento, instruções ilegais, confidencialidade depois do fim, medidas de segurança, informação sobre subcontratantes, anonimização efetiva, violação de dados em 24 horas, devolução ou eliminação à escolha, auditorias com aviso razoável e responsabilidade sem excluir o que a lei não permite.
- **Plano anual (escolha técnica coerente com o contrato, sem fidelização):** paga-se antecipadamente; a denúncia produz efeitos no fim do período anual pago e os valores já pagos não se reembolsam, salvo alteração de preço não aceite ou incumprimento da Performa LAB. O dono pode mudar esta regra; se mudar, muda nos três documentos e na proposta.
- O Anexo III do contrato (`docs/comercial/modelo-acordo-subcontratacao.md`) passa a ser gerado do mesmo texto do Acordo publicado, com os marcadores do contratante. O contrato alinha 9.2 (plano anual), 10.3 (transferências) e 11 (devolução ou eliminação; nada se apaga durante a recuperação). A nota de privacidade da landing descreve o contador de eventos e a preferência de tema guardada no dispositivo.
- **Factos verificados no código:** o contador da landing grava só o nome do evento (sem cookies, IP ou identificadores); as preferências de aparência ficam no `localStorage`; a exportação por cliente e `anonimizar_cliente()` existem e a anonimização é irreversível; o pedido de adesão guarda a data da aceitação e as versões dos documentos são datadas, com histórico no repositório; as palavras-passe ficam só como hash (Supabase Auth); as cópias externas guardam-se 30 dias (P-13).
- **Por confirmar fora do código (operação):** contratos de tratamento (DPA) e regiões efetivas de Supabase, Vercel, Resend e Zoho; monitorização da disponibilidade para medir os 99,5 %; prazo da política interna de retenção dos registos de segurança.

## D-156 · 25/10/2026 · Verificação dos prestadores e da disponibilidade (ponto 4 da operação) — técnica
- **Regiões verificadas:** Supabase na região da UE (Frankfurt, eu-central-1); funções da Vercel em Frankfurt (`fra1`, `vercel.json`), com a rede de distribuição global da Vercel; correio da Zoho na UE (MX `mx.zoho.eu`). **O envio do Resend sai dos Estados Unidos:** o subdomínio `send.instabarber.pt` aponta para a infraestrutura de envio do Resend com endereços da AWS em us-east-1. Os documentos publicados diziam «União Europeia» para o Resend; passam a dizer a verdade (Política de Privacidade, Acordo de Subcontratação, Anexo III do contrato e nota da landing), com as garantias do capítulo V do RGPD do acordo de tratamento de dados do prestador.
- Alternativa que o dono pode escolher: recriar o domínio no Resend na região da UE (Irlanda) e mudar os registos de DNS; depois disso, os documentos voltam a dizer «União Europeia».
- **Disponibilidade:** novo `/api/saude` (200 quando a aplicação e a base de dados respondem, 503 quando não, sem dados nem detalhes do erro) para um serviço de monitorização externo, de 5 em 5 minutos, com relatório mensal (P-28). O serviço só faz pedidos ao site; não recebe dados pessoais.
- Continuam do dono: aceitar ou assinar os acordos de tratamento de dados (DPA) dos quatro prestadores nos respetivos painéis, criar a conta de monitorização (P-28) e decidir o prazo de conservação dos registos de segurança.

## D-157 · 25/10/2026 · Retenção da auditoria em 24 meses; Supabase fica no plano gratuito; respostas do dono sobre a operação — dono e técnica
- **Registos de segurança:** a auditoria da plataforma guarda-se 24 meses e apaga-se numa rotina mensal à mão (P-24), pela função `apagar_auditoria_antiga()` (só super_admin com dois fatores, nunca menos de 12 meses, o apagamento fica registado). Migração 11, 6 testes SQL novos (`99_retencao.sql`, 492 no total). Os registos técnicos da Vercel e da Supabase ficam o tempo que o plano de cada um guarda. É esta a «política interna de retenção» da Política de Privacidade.
- **Resend:** o dono mantém o envio como está (Estados Unidos), já declarado nos documentos (D-156).
- **Supabase fica no plano gratuito**, também com a primeira barbearia (substitui a D-137). Consequências aceites: sem cópias diárias do Supabase (a cópia semanal da P-13 é a única) e o projeto pausa ao fim de 7 dias sem pedidos; a monitorização da P-28 consulta `/api/saude` (que lê a base de dados) de 5 em 5 minutos e evita a pausa.
- **Vercel Hobby:** a pesquisa indica que o acordo de tratamento de dados (DPA) da Vercel é para clientes com contrato (Enterprise, possivelmente Pro); no Hobby, que também não permite uso comercial (D-15), não há DPA. Fica registado como risco a resolver pelo dono com a passagem ao Pro.
