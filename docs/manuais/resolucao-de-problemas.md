# Resolução de problemas

Organizado **pelo sintoma**, como chega ao apoio: o que a barbearia diz, não o módulo. Cada entrada
tem: **confirmar** (é mesmo isto?), **causa provável**, **resolver** passo a passo, **evitar** e
**escalar** (quando parar e pedir ajuda).

Antes de tudo, a árvore de incidentes: há três situações em que **não se resolve, para-se**.

---

## Árvore de incidentes graves

```
Alguém vê dados de OUTRA barbearia?
├── Sim → PARAR TUDO. Ver «Dados de outra barbearia visíveis» abaixo.
└── Não
    Houve acesso indevido, chave exposta ou dados enviados a quem não devia?
    ├── Sim → VIOLAÇÃO DE DADOS: P-19 (conter, registar, avaliar, avisar em 72 h).
    └── Não
        O site ou o painel estão em baixo para todos?
        ├── Sim → «O site está lento ou em baixo».
        └── Não → procurar o sintoma abaixo.
```

### Dados de outra barbearia visíveis

É a regra que não se quebra: **nenhuma consulta devolve registos de outro inquilino**.

1. **Conter:** suspender as barbearias envolvidas (Admin → ficha → «Suspender») e, se não se
   souber a extensão, pôr todas as barbearias fechadas à marcação online.
2. **Registar:** hora, quem viu, o ecrã, o que apareceu (captura sem a divulgar).
3. **Não corrigir à pressa.** Pedir ao Claude Code: «dados de outra barbearia visíveis no ecrã X»;
   ele corre os testes de isolamento e a verificação do RLS antes de mexer.
4. Se houve dados pessoais vistos por quem não devia, é também uma violação: P-19.

---

## A barbearia não consegue entrar

**Confirmar:** que endereço usa e que mensagem aparece. O gestor entra em
**&lt;barbearia&gt;.instabarber.pt/gestor**, o barbeiro em **/barbeiro** (ou ambos em
**instabarber.pt/entrar**). A página pública só leva à entrada dos clientes (D-180).

| Mensagem ou situação | Causa provável | Resolver |
| --- | --- | --- |
| E-mail ou palavra-passe errados | Esqueceu-se da palavra-passe | «Esqueci-me da palavra-passe» no ecrã de entrada. **Nunca** definir a palavra-passe pela pessoa |
| Entra, mas vê «Temporariamente indisponível» ou só «O meu plano» | Barbearia suspensa (mensalidade em atraso) | Ver «Mensalidade em dúvida». Ao aprovar o pagamento, a barbearia volta a ficar ativa |
| Barbeiro: entra e não vê nada da barbearia | Acesso cancelado pelo gestor, ou ainda não aceitou o convite | Gestão do sistema → Equipa: «Repor acesso» ou «Reenviar convite» |
| Barbeiro nunca recebeu o convite | E-mail errado ou no spam | Ver «O e-mail não chegou» |
| Equipa InstaBarber: pede o código de 6 dígitos e o telemóvel não está à mão | Dois passos obrigatórios | Só o dono repõe os dois passos (P-17) |

**Evitar:** na formação, pôr o atalho no ecrã do telemóvel e testar o «Esqueci-me da palavra-passe».
**Escalar:** se a recuperação também falhar para várias pessoas, ver o estado do Supabase Auth
(Supabase → Authentication → Logs) e do Resend.

---

## A agenda mostra uma vaga ocupada que está livre (ou o contrário)

**Confirmar:** abrir a agenda do dia com o filtro «Todos os profissionais» e recarregar a página.

**Causas prováveis, por ordem:**

1. **Reserva em curso:** quando um cliente escolhe uma hora na página pública, a hora fica
   **reservada durante 10 minutos** enquanto preenche os dados. Se ele desistir, a hora volta a
   ficar livre sozinha ao fim desse tempo.
2. **Ausência ou feriado:** Gestão do sistema → Ausências e feriados (do barbeiro ou da barbearia).
3. **Horário:** almoço, pausa entre marcações, horário próprio do barbeiro, antecedência mínima ou
   janela de marcação (Gestão do sistema → Horário e Equipa).
4. **Página desatualizada:** o telemóvel mostra a versão de quando a página foi aberta.

**A base de dados é a autoridade final:** a função `validar_vaga()` e a restrição
`sem_sobreposicao` não deixam gravar duas marcações sobrepostas para o mesmo profissional, venha a
marcação do balcão ou da página pública. Se a agenda mostrar duas marcações sobrepostas do mesmo
profissional, **é um erro grave**: escalar.

**Escalar:** sobreposição real, ou uma hora livre que a página pública recusa sem motivo nos quatro
pontos acima. Abrir a vista de apoio (P-11, nível 3), registar o dia, a hora e o profissional, e
pedir ao Claude Code.

---

## A mensagem não abre o WhatsApp

**Confirmar:** o botão não aparece, ou abre o WhatsApp sem a conversa certa.

| Situação | Causa | Resolver |
| --- | --- | --- |
| Não há botão de WhatsApp | O cliente (ou a barbearia, ou o lead) não tem telemóvel, ou o número não é válido | Corrigir o telemóvel na ficha: 9 dígitos portugueses ou formato internacional com `+` |
| Abre o WhatsApp, mas noutra conta | O telemóvel tem duas contas (WhatsApp e WhatsApp Business) | Escolher a conta certa quando o telemóvel perguntar |
| No computador não abre nada | O WhatsApp não está instalado | Abre o WhatsApp Web no browser; entrar com o telemóvel |
| O cliente diz que não recebeu | **O sistema não envia mensagens:** prepara-as e abre a conversa. O envio é no WhatsApp | Confirmar na conversa do WhatsApp que a mensagem foi mesmo enviada |

**Evitar:** na formação, explicar que «Lembrete» e «Mensagem» abrem a conversa e que o envio se
confirma no WhatsApp.

---

## O e-mail não chegou

O sistema envia e-mails em três situações: contas (convite, recuperar a palavra-passe), avisos
(adesão, comprovativos, vencimentos) e a confirmação da marcação ao cliente.

1. **Spam e promoções:** pedir à pessoa para procurar por «InstaBarber».
2. **Endereço certo?** Ver o e-mail na ficha (barbearia, barbeiro, cliente).
3. **Resend → Emails:** procurar o endereço. Estados: *delivered* (chegou ao servidor dela: é spam
   ou filtro), *bounced* (endereço errado ou caixa cheia), *complained* (marcou como spam).
4. **E-mails das contas** (convite, recuperar): saem pelo Supabase Auth com o Resend. Ver também
   Supabase → Authentication → Logs.
5. Reenviar: «Reenviar convite», ou a pessoa pede outra vez «Esqueci-me da palavra-passe».

**Evitar:** não mexer nos registos DNS do correio (SPF, DKIM, DMARC) sem saber: estão na zona da
Vercel e foram conferidos a 24/10/2026.
**Escalar:** vários e-mails *bounced* ou nenhum e-mail a sair: suporte do Resend; ver no painel do
Resend se o domínio continua verificado.

---

## O domínio próprio da barbearia não funciona

**Confirmar:** o domínio abre? Dá erro de certificado? Abre outra coisa?

| Situação | Causa provável | Resolver |
| --- | --- | --- |
| Não abre nada | Registos DNS em falta ou ainda a propagar (até 48 h) | Vercel → projeto → Domínios: ver o que a Vercel pede. Raiz: registo **A**; `www`: **CNAME**. Nunca CNAME na raiz |
| Erro de certificado | A Vercel ainda não emitiu o HTTPS | Esperar que fique «Valid»; se não ficar em 24 h, remover e voltar a acrescentar o domínio na Vercel |
| Abre, mas não entra ninguém | Falta o domínio nos endereços autorizados do Supabase Auth | Supabase → Authentication → URL Configuration: `https://dominio/**` |
| Abre a página «não encontrada» | O domínio não está na ficha da barbearia | Admin → ficha → Identidade: escrever o domínio |

Procedimento completo: P-10.

---

## O cliente não recebe o código de acesso

O código **não é enviado pelo sistema**: aparece no Início da barbearia, em «Pedidos de acesso», e
alguém da barbearia carrega em «Enviar código por WhatsApp» e depois em «Já enviei».

1. **Confirmar:** o pedido aparece no Início? Está «Expirado»? O código vale **15 minutos**.
2. Se expirou: o cliente pede outra vez na página da barbearia → «Entrar» (ou em **/cliente**).
3. Fora do horário da barbearia, o cliente é avisado de que o código chega quando a barbearia
   abrir.
4. «Demasiadas tentativas»: a mesma rede pediu códigos muitas vezes (10 por hora). Esperar uma
   hora.

**Evitar:** na formação, mostrar ao gestor onde aparecem os pedidos de acesso.

---

## O formulário do site não envia

**Confirmar:** que mensagem vê o visitante, e se o lead aparece em Comercial → Leads (origem «Site»).

| Situação | Causa | Resolver |
| --- | --- | --- |
| Mensagem de limite («tente mais tarde») | Limite contra abuso: 10 envios por hora por endereço de rede, 3 por hora pelo mesmo e-mail ou telemóvel | Esperar uma hora. Se for um cliente real, contactá-lo pelo WhatsApp |
| Erro ao enviar, mas **o lead está no CRM** | O lead grava-se primeiro; o erro foi no e-mail de aviso ao comercial@ (Resend) | Tratar o lead normalmente; ver «O e-mail não chegou» |
| Erro e o lead **não** está no CRM | A aplicação ou a base de dados falharam | Ver «O site está lento ou em baixo» |

---

## Mensalidade em dúvida

**A barbearia diz que pagou e o sistema diz que não** (ou o contrário).

1. **O meu plano** da barbearia (vista de apoio) ou Admin → Pagamentos: há comprovativo enviado?
   Em que estado (em análise, confirmado, recusado)?
2. **Comprovativo em análise:** conferir com o extrato ou o MB WAY e aprovar (P-08).
3. **Comprovativo recusado:** o motivo foi por e-mail à barbearia. Explicar e pedir novo.
4. **Pagou sem comprovativo:** confirmar no extrato e registar o recebimento à mão em
   Admin → Pagamentos.
5. **Valor diferente da mensalidade:** confirmar o plano, os profissionais contratados, a
   periodicidade e se há extras (domínio). A fórmula é única; se o valor do painel não bater com a
   tabela de preços, escalar.

**Nunca** dar a barbearia como paga sem o dinheiro ter entrado.

---

## A cópia de segurança falhou

| Mensagem | Causa | Resolver |
| --- | --- | --- |
| `Cannot POST /v1/projects//database/query` (404) | Falta o identificador do projeto (`SUPABASE_COPIA_REF`) | Usar o identificador da produção (`SUPABASE_PRODUCAO_REF`) |
| 401 ou 403 | Chave de acesso expirada ou revogada | Criar uma chave nova em Supabase → Account → Access Tokens e guardá-la no `.env.local` e no gestor de palavras-passe |
| Pede a palavra-passe ou falha a cifra | Falta `COPIA_SENHA` | Pô-la no ambiente (vem do gestor de palavras-passe) |
| A verificação `sha256sum -c` falha | Ficheiro corrompido | Apagar e fazer outra cópia; nunca guardar uma cópia que não passou na verificação |

**Evitar:** fazer a cópia sempre à segunda-feira e anotar a data. **Escalar:** duas semanas
seguidas sem cópia válida é um risco sério: resolver antes de qualquer outra tarefa.

---

## O site está lento ou em baixo

**Confirmar:**

1. `https://instabarber.pt/api/saude`: **200** = aplicação e base de dados bem; **503** = a base de
   dados não responde; sem resposta = a aplicação está em baixo.
2. O serviço de monitorização (P-28) diz desde quando.

| Resultado | Causa provável | Resolver |
| --- | --- | --- |
| 503 | Projeto do Supabase **pausado** (o plano gratuito pausa ao fim de uma semana sem atividade) ou incidente do Supabase | Supabase → projeto: se estiver pausado, «Restore». Ver status.supabase.com |
| Sem resposta, ou erro em todas as páginas | Incidente da Vercel ou publicação com defeito | Ver vercel-status.com. Se começou depois de uma publicação: Vercel → Deployments → a versão anterior → «Promote» (volta atrás em segundos) |
| Só lento | Muitos acessos ou um ecrã pesado | Anotar o ecrã e a hora; pedir ao Claude Code para ver os registos da Vercel |

**Comunicar:** se a falha passar de 30 minutos, avisar as barbearias (apoio@) e registar na nota
mensal da disponibilidade.
**Escalar:** suporte da Vercel ou do Supabase; com o plano gratuito o suporte é limitado, por isso
o marco «Supabase Pro» do calendário.

---

## Contactos para escalar

| Quem | Para quê |
| --- | --- |
| Claude Code (este repositório) | Erros no sistema, mudanças, dúvidas técnicas. Começar sempre pelo sintoma e pelo ecrã |
| Suporte da Vercel | Site em baixo, domínios, certificados |
| Suporte do Supabase | Base de dados, contas, pausas |
| Suporte do Resend | E-mails que não saem ou são devolvidos |
| Jurista | Pedidos de dados, violação de dados, contratos |
| Contabilista | Faturas, IVA, limite da isenção |

InstaBarber · Performa LAB
