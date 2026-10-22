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
- Pedido do dono: o e-mail automático que o visitante recebe fica mais profissional e passa a assinar «Comercial InstaBarber», com o número de WhatsApp por baixo. Substitui, só nos e-mails comerciais enviados para fora, a assinatura única «InstaBarber · Performa LAB» da D-44 (que se mantém nos restantes e-mails).
- O número vem da variável `TELEFONE_COMERCIAL_TXT` (nunca escrito no código). Se a variável faltar, o e-mail sai na mesma, sem a linha do WhatsApp (não é essencial). **Ação do dono:** juntar `TELEFONE_COMERCIAL_TXT` na Vercel (o valor está no `.env.local`).
- O `reply-to` da resposta passa a ser o comercial@, para que «responde a este e-mail» chegue à caixa certa.
- Os avisos internos para o comercial@ não mudam.
