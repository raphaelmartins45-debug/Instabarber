## Parte L · Publicação, domínios e custos

O que acontece depois de o sistema estar construído: onde vive, como cada
barbearia ganha o seu endereço, e quanto custa manter tudo a funcionar.

### L.1 · As peças de infraestrutura

| Peça | Para que serve | Plano |
| --- | --- | --- |
| Supabase | Base de dados, autenticação e ficheiros | Free durante a construção; **Pro desde a primeira barbearia real** (cópias de segurança diárias; o projeto gratuito pausa por inatividade) |
| Vercel | Alojamento, HTTPS, publicação a cada alteração, funções em fra1 | **Hobby** até ao ponto de equilíbrio, por decisão do dono (DECISOES D-15); Pro quando a receita o permitir |
| Domínio | `instabarber.pt` e os defensivos | Anual |
| Resend | E-mail transacional | Gratuito até 3.000 e-mails por mês |
| Zoho Mail | Correio da Performa LAB | Mail Lite |

**Risco registado sobre a Vercel:** os termos da Vercel reservam o plano Hobby
a uso pessoal e não comercial. Com barbearias a pagar, a Vercel pode suspender
o projeto. A passagem para o Pro é só configuração (mudar o plano e confirmar a
região das funções); nada no código depende do plano. Os valores e termos dos
planos mudam: confirmar diretamente no Supabase e na Vercel antes de decidir.

### L.2 · As chaves e as variáveis de ambiente

#### Como as chaves circulam

```
A TUA MÁQUINA — .env.local
  As chaves verdadeiras. O Claude Code lê-as daqui para correr a aplicação, as
  migrações e os testes. Nunca sai da máquina.

O REPOSITÓRIO — .env.example
  Os nomes das variáveis com valores falsos, como modelo. É este que vai para o Git.

A PRODUÇÃO — painel da Vercel
  As chaves verdadeiras, coladas à mão, uma vez.
```

Regras:

- O Claude Code lê as chaves do `.env.local`. Não as pede no chat, não as escreve no código, não as guarda em ficheiros do repositório.
- Se faltar uma variável, o Claude Code para e pede o valor. Não inventa nem usa um valor de exemplo.
- Todas as chaves passam por `process.env`, lidas em ficheiros de servidor. Só as `NEXT_PUBLIC_` chegam ao browser.
- A chave de serviço do Supabase só existe em `lib/supabase/servico.ts` (com `import "server-only"`). Se aparecer num componente de cliente, a construção para.
- O `.gitignore` tem `.env*` e `!.env.example` antes do primeiro commit. A Fase 0 confirma-o.

```
# .env.example (vai para o Git; valores falsos)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx          # só no servidor
RESEND_API_KEY=xxxxx                     # e-mails transacionais
ROOT_DOMAIN=instabarber.pt               # domínio raiz da plataforma
EMAIL_REMETENTE=nao-responder@instabarber.pt
EMAIL_NOTIFICACOES=geral@instabarber.pt  # onde chegam as adesões
EMAIL_COMERCIAL=comercial@instabarber.pt # onde chegam os pedidos de contacto da landing
# Dados mínimos da Prestadora para o contrato (D-44). Valores reais só no .env.local e na Vercel
PRESTADORA_NOME=xxxxx
PRESTADORA_NIF=999999999
PRESTADORA_MORADA=xxxxx
PRESTADORA_QUALIDADE=xxxxx
PRESTADORA_ASSINANTE=xxxxx
PRESTADORA_REGIME_IVA=normal             # normal (IVA a 23 % incluído) ou isento (art. 53.º do CIVA) (D-45, D-85)
# Módulos desligados (G.4): só quando forem ativados
# PAGAMENTOS_FORNECEDOR=…  PAGAMENTOS_CHAVE=…  PAGAMENTOS_SEGREDO_WEBHOOK=…

# .gitignore (obrigatório)
.env*
!.env.example
dados-locais/
node_modules/
.next/
```

O que é preciso, e quando:

```
Fase 0 ... a chave do Resend e o domínio verificado (SPF e DKIM), para o formulário de contacto da landing (D-46). O resto monta-se com o .env.example.
Fase 1 ... o projeto Supabase e a palavra-passe da base de dados.
Fase 2 ... a chave do Resend (convites e recuperação de palavra-passe).
Fase 7 ... o domínio apontado e as chaves no painel da Vercel.
```

**Regra absoluta:** a chave de serviço ignora todas as regras de isolamento.
Nunca no browser, nunca no código do cliente.

#### Os endereços de correio da plataforma

Cinco endereços no domínio da marca: uma caixa e quatro alias que entregam
nessa caixa.

```
geral@instabarber.pt ............ caixa ..... o principal. Faturas e o que vem de fora
raphaelmartins@instabarber.pt ... alias ..... correio que o dono envia em nome próprio
comercial@instabarber.pt ........ alias ..... propostas, prospeção e negociação
apoio@instabarber.pt ............ alias ..... suporte às barbearias
privacidade@instabarber.pt ...... alias ..... exercício de direitos do RGPD
```

O endereço segue a natureza da mensagem, não quem a escreve: matéria comercial
sai do comercial@; a palavra do dono, do raphaelmartins@; operação corrente, do
geral@; problema de uma barbearia, do apoio@; proteção de dados, do privacidade@.

- Assinatura única nos cinco: «InstaBarber · Performa LAB», sem nome pessoal (D-44).
- O raphaelmartins escreve-se junto e em minúsculas, nunca com ponto.
- O privacidade@ consta da Política de Privacidade publicada antes da primeira barbearia real.
- Serviço: Zoho Mail, plano Mail Lite (cerca de 1 € por mês), com o domínio verificado por registo TXT. O plano gratuito foi descartado: só dá webmail e pode não estar disponível em Portugal.
- O e-mail transacional (`EMAIL_REMETENTE`) sai pelo Resend, com o domínio verificado (SPF e DKIM).

### L.3 · O endereço de cada barbearia

#### Domínios registados

Registados a 20 de outubro de 2026, com renovação anual:

| Domínio | Referência | Uso |
| --- | --- | --- |
| instabarber.pt | 5311150 | O domínio da plataforma. O único que serve a aplicação |
| instabarber.es | 5311151 | Defensivo, sem uso |
| instabarber.eu | 5311152 | Defensivo, sem uso |
| instabarber.online | 5311153 | Defensivo, sem uso |

#### As três formas

A plataforma suporta as três ao mesmo tempo; o middleware decide pela ordem da
L.4. Internamente, todas servem a rota `/b/[slug]`, que nunca aparece ao público.

**Forma 1 · Caminho no domínio da plataforma** — `instabarber.pt/barbearia-exemplo`

Zero configuração: funciona no instante da aprovação. É a forma recomendada
para começar. O slug não pode ser um dos reservados (`admin`, `app`, `api`,
`b`, `adesao`, `entrar`, `termos`, `privacidade`…); a base de dados recusa-os.

**Forma 2 · Subdomínio** — `barbearia-exemplo.instabarber.pt`

Com um registo wildcard, qualquer subdomínio novo funciona sem tocar no DNS.
**Na Vercel, um domínio wildcard exige que o domínio use os nameservers da
Vercel** (método de nameservers); o certificado de cada subdomínio é emitido
automaticamente. Configura-se uma vez, na Fase 7.

**Forma 3 · Domínio próprio da barbearia** — `barbeariaexemplo.pt`

```
A barbearia compra o domínio em seu nome. No painel do registador:
  raiz (@) ... registo A com o endereço IP que a Vercel indicar ao adicionar o domínio
  www ........ CNAME para o destino que a Vercel indicar
Um CNAME na raiz não é válido na maioria dos registadores: usa-se sempre o registo A.

Depois, o administrador:
  1. grava o domínio em inquilinos.dominio_proprio;
  2. adiciona o domínio ao projeto na Vercel;
  3. acrescenta-o aos endereços de retorno do Supabase Auth;
  4. confirma o HTTPS e testa.
```

É a forma que faz a barbearia sentir que tem uma aplicação feita para ela. É um
extra de 5,00 € por mês (6,15 € com IVA), ligado na ficha da barbearia (D.1).
O procedimento completo está no manual do operador (P-10).

### L.4 · Como o sistema sabe qual barbearia carregar

Um único `middleware.ts` resolve o inquilino antes de qualquer página:

```
1. Ler o host do pedido.
2. Se o host for um dominio_proprio registado     → esse inquilino.
3. Senão, se for <slug>.instabarber.pt            → o inquilino com esse slug
   (ex.: barbearia-exemplo.instabarber.pt → slug = barbearia-exemplo).
4. Senão, se for instabarber.pt/<slug>            → o primeiro segmento do caminho
   (ex.: instabarber.pt/barbearia-exemplo → slug = barbearia-exemplo),
   desde que não seja um caminho reservado.
5. instabarber.pt sem slug                         → página institucional da Performa LAB.
6. Slug inexistente ou barbearia não ativa         → «Barbearia não encontrada»
   (suspensa: «Temporariamente indisponível para marcações», M.4).
7. Reescrever para /b/<slug>/… e deixar /app e /api seguirem o seu caminho.
8. /admin só no domínio principal (instabarber.pt). Em qualquer host de barbearia
   (subdomínio ou domínio próprio) responde 404 — nunca redireciona.
```

O middleware só encaminha. A autorização está no servidor e no RLS.

### L.5 · Ligar uma barbearia nova — procedimento

```
Forma 1 (caminho):       aprovar o pedido; confirmar o slug. Fica acessível.
Forma 2 (subdomínio):    aprovar; com o wildcard ativo, nada mais. Testar e enviar o endereço.
Forma 3 (domínio próprio): pedir à barbearia os registos DNS (L.3); gravar o domínio;
                         adicioná-lo na Vercel e no Supabase Auth; confirmar HTTPS; testar.
Em todas: enviar à barbearia o endereço da página pública e o do painel.
```

### L.6 · Custos ao longo do crescimento

#### Mensais

| Serviço | Plano | Custo mensal | Quando começa |
| --- | --- | --- | --- |
| Claude Code | Pro | 17 € | Já |
| Zoho Mail | Mail Lite | 1 € | Já |
| Vercel | Hobby | 0 € | Já (decisão D-15) |
| Supabase | Free → Pro | 0 € → cerca de 25 USD | Pro com a primeira barbearia real |
| Programa de faturação da Performa LAB | Moloni ou equivalente certificado | 6,49 a 15,90 € | Com a primeira fatura emitida |
| Contabilista certificado | — | A orçamentar | Com a atividade da Performa LAB |
| Vercel | Pro | cerca de 20 USD | Quando a receita o permitir |
| Resend | Pago | cerca de 20 USD | Acima de 3.000 e-mails por mês |

#### Anuais

| Domínio | Custo anual | Nota |
| --- | --- | --- |
| instabarber.pt | cerca de 10 € | Indispensável |
| instabarber.es, .eu, .online | cerca de 10 € cada | Defensivos, renovação opcional |

#### Ponto de equilíbrio

Com Claude Code, Zoho, Supabase Pro e o programa de faturação, os custos fixos
ficam perto de 50 a 60 € por mês, antes do contabilista e da Vercel Pro. Com
uma mensalidade média de cerca de 35 € sem IVA, duas barbearias pagam a
infraestrutura. O contabilista é, em regra, o maior custo fixo: se custar 200 a
250 € por mês, o ponto de equilíbrio fica entre **8 e 10 barbearias**, e a
Vercel Pro entra a seguir. Nenhum destes
valores cresce com as mensagens, porque o WhatsApp é por ligação direta.

### L.7 · Cópias de segurança e recuperação

- Supabase Pro: cópias diárias nativas, com 7 dias de retenção.
- Cópia externa com 30 dias de retenção: `supabase db dump` guardado fora do Supabase, feita à mão todas as semanas e antes de qualquer alteração de esquema em produção (DECISOES D-16). O procedimento está no manual do operador (P-13).
- Testar uma restauração completa antes do primeiro cliente real. Uma cópia que nunca foi restaurada não é uma cópia.
- Chaves de acesso num gestor de palavras-passe, com acesso de emergência.

### L.8 · Publicação passo a passo

```
1.  Projeto Supabase na região eu-central-1 (Frankfurt).
2.  Aplicar docs/esquema/01…04. Correr os testes de docs/esquema/testes num projeto de ensaio com as
    mesmas migrações (nunca na produção: criam dados de teste). Não avançar com falhas.
3.  Ativar o 2FA (TOTP) no Supabase Auth e criar a conta do super_admin.
4.  Configurar o Resend como SMTP do Supabase Auth e verificar o domínio de envio.
5.  Projeto na Vercel ligado ao repositório; funções em fra1.
6.  Variáveis de ambiente no painel da Vercel (L.2).
7.  Domínio instabarber.pt com os nameservers da Vercel; HTTPS; www para o domínio principal.
8.  Wildcard *.instabarber.pt, se se usar a Forma 2.
9.  Endereços de retorno do Supabase Auth: domínio principal e subdomínios.
10. Publicar os Termos, a Política de Privacidade e o Acordo de Subcontratação, revistos por um jurista.
11. Ciclo completo com uma barbearia de ensaio: formulário, pedido, aprovação, convite,
    marcação sem conta, código de acesso, conclusão, relatório.
12. Testar uma restauração de cópia de segurança.
13. Só depois, abrir a primeira barbearia real.
```
