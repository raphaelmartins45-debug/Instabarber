# Passo 0 · O que fazes tu (e o que faço eu)

Para a Fase 0 (Preparação) e para pôr a landing em **www.instabarber.pt**. Os nomes dos botões nos painéis podem mudar um pouco; o que conta é o resultado de cada passo.

**Regra de ouro:** nunca me mandes chaves nem palavras-passe no chat. Elas ficam no teu computador (`.env.local`) e, para a produção, coladas por ti no painel da Vercel.

Ordem recomendada: **A → B → C → D → E**. Gasta cerca de 1h30 no total, com a espera do DNS (pode demorar de minutos a algumas horas).

---

## A. Contas que precisas de criar (30 min)

| Conta | Para quê | O que fazes |
| --- | --- | --- |
| **GitHub** | Guardar o código | Cria um repositório **privado** chamado `instabarber`, vazio (sem README). Depois diz-me o endereço (`utilizador/instabarber`) e eu ligo-o à sessão. |
| **Vercel** | Publicar o site | Cria conta com o teu GitHub (entrar com GitHub). Não precisas de criar o projeto já: faço-o contigo no passo C. |
| **Resend** | E-mails da landing (avisos ao comercial e resposta ao visitante) | Cria conta com o e-mail comercial ou o teu. |
| **Zoho Mail** | Caixas `geral@`, `comercial@`, `apoio@`… | Plano Mail Lite (cerca de 1 €/mês). Podes deixar para o passo E se quiseres publicar a landing primeiro. |
| **Registador do domínio** | Já tens: instabarber.pt, .es, .eu, .online (registados a 20/10) | Apenas precisas de entrar no painel dele (para o DNS). |

Supabase **não** é preciso agora: entra na Fase 1.

## B. O teu computador: o `.env.local` (10 min)

1. Vai buscar a pasta do projeto (o repositório). Dentro, a pasta `dados-locais/` tem os ficheiros `contactos.env` e `prestadora.env`. Ficam **fora do Git**.
2. Cria, na raiz do projeto, um ficheiro chamado `.env.local` com este modelo:

```
ROOT_DOMAIN=instabarber.pt
RESEND_API_KEY=            # cola aqui a chave do passo D
EMAIL_REMETENTE=nao-responder@instabarber.pt
EMAIL_COMERCIAL=comercial@instabarber.pt
# copiar de dados-locais/contactos.env:
TELEFONE_COMERCIAL=
TELEFONE_COMERCIAL_TXT=
# copiar de dados-locais/prestadora.env:
PRESTADORA_NOME=
PRESTADORA_NIF=
PRESTADORA_MORADA=
PRESTADORA_QUALIDADE=
PRESTADORA_ASSINANTE=
PRESTADORA_REGIME_IVA=isento
```

3. Preenche o que já sabes. A `RESEND_API_KEY` fica para depois do passo D.
4. Confirma que o ficheiro **não** está no Git (o `.gitignore` já tem `.env*`; eu confirmo antes do primeiro commit).

## C. Publicar a landing em www.instabarber.pt (30 min + espera do DNS)

Isto publica a landing **já**, como página estática. Na Fase 0 faço depois a versão final (Next.js, com a rota de contacto).

1. **Eu já preparei a pasta `landing/publicar/`**: a landing como página completa (com `doctype`, ecrã móvel, ícone, imagem de partilha `og.png`) e a pasta `marca/` com os logótipos. Testei em computador (1440 px) e telemóvel (390 px), sem rolagem lateral nem erros. Falta só o teu repositório do passo A: diz-me o endereço e eu envio-lhe esta pasta.
2. Na **Vercel**: *Add New → Project* → escolhe o repositório `instabarber` → em *Root Directory* escolhe `landing/publicar` → *Framework Preset*: **Other** → *Deploy*. A Vercel dá-te um endereço provisório (`algo.vercel.app`). Abre-o e vê se a landing aparece.
3. Na Vercel, projeto → *Settings → Domains* → adiciona **os dois**: `instabarber.pt` e `www.instabarber.pt`.
4. A Vercel mostra os registos de DNS a criar. Vai ao **painel do registador** e cria exatamente o que a Vercel indicar. Em regra:
   - **raiz (`@`)**: registo **A** com o IP que a Vercel indicar;
   - **`www`**: registo **CNAME** com o destino que a Vercel indicar.
   (Um CNAME na raiz não é válido na maioria dos registadores: na raiz usa-se sempre o registo A.)
5. Espera. Na Vercel, o domínio passa a «Valid Configuration» e o HTTPS é emitido sozinho.
6. **Qual dos dois é o principal?** Na lista de domínios, define que um redireciona para o outro. Recomendo:
   - **`instabarber.pt` é o principal** e `www.instabarber.pt` redireciona para ele. É o que a especificação prevê (as páginas das barbearias são `instabarber.pt/nome` e o admin só abre em `instabarber.pt/admin`). Quem escrever `www.` chega à landing na mesma.
   - Se preferires que o endereço visível seja `www.instabarber.pt`, diz-mo: é uma decisão a registar (afeta o admin e as páginas das barbearias) e atualizo o documento.
7. Teste: abre `https://www.instabarber.pt` e `https://instabarber.pt` no telemóvel e no computador.

**Importante:** não mudes os *nameservers* do domínio agora. Isso só é preciso na Fase 7 (domínios por barbearia), e quando mudares, os registos de e-mail (Zoho, Resend) têm de ser recriados na Vercel. Até lá, deixa o DNS no registador.

Nota sobre a Vercel: a decisão D-15 é usar o plano **Hobby**. Os termos do Hobby reservam-no a uso não comercial; antes da primeira barbearia a pagar, passa-se ao Pro (L.1).

## D. Resend: e-mail da landing (30 min)

1. No Resend: *Domains → Add Domain* → `instabarber.pt` (se der a escolher a região, a da UE).
2. O Resend mostra registos DNS (SPF e DKIM, e por vezes um MX/DMARC). Cria-os no painel do registador, tal como no passo C.
3. Espera pela verificação («Verified»).
4. *API Keys → Create API Key*, permissão só de envio, restrita ao domínio. **Copia a chave uma vez** e cola-a no `.env.local` (`RESEND_API_KEY=`). Não a coles no chat.

## E. Zoho Mail (30 min, pode ficar para depois da landing)

1. Cria a organização Zoho com o domínio `instabarber.pt`, plano Mail Lite.
2. Verifica o domínio com o registo TXT que o Zoho indicar e cria os registos MX.
3. Cria a caixa `geral@` e os alias `raphaelmartins@`, `comercial@`, `apoio@` e `privacidade@`, que entregam na caixa `geral@`.
4. Enquanto isto não estiver feito, o formulário da landing envia para `comercial@` e o e-mail ficaria sem destino. Por isso, o passo E precisa de estar feito **antes** de ligar o formulário ao servidor (Fase 0).

---

## Como me dizes que está pronto

Escreve «Passo 0 pronto» e diz-me só: o endereço do repositório (`utilizador/instabarber`) e quais dos passos A a E já fizeste. Eu:
1. verifico que o `.env.local` tem **os nomes** das variáveis preenchidos (não leio os valores);
2. ligo o repositório e preparo a landing para a Vercel;
3. começo a Fase 0 (construção do projeto) quando confirmares o resumo da fase.

## Resumo para decidir o que fazer já

- **Só quero a landing no ar:** A (GitHub, Vercel) + C. Sem Resend nem Zoho. O formulário abre o WhatsApp (a landing já está pronta para isso nos endereços instabarber.pt) e o telefone comercial.
- **Quero a landing com o formulário a funcionar por e-mail:** A + B + C + D + E, e a Fase 0 (rota de contacto).
