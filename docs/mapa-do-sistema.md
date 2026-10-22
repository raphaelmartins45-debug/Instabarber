# Mapa do sistema (manutenção)

> **Para quê:** depois de o sistema estar no ar, o dono pede coisas como «muda a cor da página
> tal» ou «troca este texto». Este ficheiro diz **onde está cada coisa e como mexer sem partir
> nada**. O Claude Code não guarda memória entre sessões: **este mapa e o `CLAUDE.md` são a
> memória**. Em pedidos de manutenção, ler primeiro este ficheiro (depois do `CLAUDE.md`), e só
> então abrir o código.
>
> **Estado:** estrutura e receitas escritas a partir da especificação (B.4). Cada fase, ao
> acabar, confirma os caminhos reais e preenche o que está marcado **«confirmar»**. A parte
> gerada (rotas, chaves de texto, variáveis de cor, tabelas, funções) está em
> `docs/mapa-gerado.md`, produzida por `scripts/gerar-mapa.sh`: **não se edita à mão**.

## 1 · Primeiro, classificar o pedido

Antes de tocar em qualquer ficheiro, dizer a que tipo pertence. O tipo decide **onde** se muda.

| Tipo | Exemplos | Onde se muda | Precisa de deploy? |
| --- | --- | --- | --- |
| **Configuração de uma barbearia** | cor da capa, horário, serviços, logótipo, funcionalidades ligadas | Painel (Gestão do sistema, ou Admin → ficha da barbearia). **Nunca em código por barbearia** (regra 2) | Não |
| **Aparência da plataforma** | cor da marca, tipografia, espaçamento, botões | Variáveis de `app/globals.css` e `components/ui` | Sim |
| **Texto** | rótulos, mensagens, avisos | `lib/i18n/` (uma chave por texto) e `lib/vertical/barbearia.ts` (vocabulário) | Sim |
| **Regra de cálculo ou de apresentação** | preço, classificação de clientes, objetivos | `lib/regras/` com testes | Sim |
| **Regra que decide o que se grava** | vaga, comissão, selos, faltas | Funções SQL (`docs/esquema/02_funcoes.sql`) **por migração**, com testes SQL | Sim, e **risco alto** |
| **Landing** | página de apresentação | `landing/index.html` (ficheiro único, servido tal como está por `app/(institucional)/route.ts`, D-99) | Sim |
| **Dados** | corrigir um registo | Só por função ou ecrã existente, com ordem do dono. Nunca `update` direto em produção | Não |

Se não der para classificar, **perguntar uma vez** ao dono, sem adivinhar.

## 2 · Os nomes do dono → ficheiros

O dono fala em «página tal». Tradução (confirmar os caminhos reais na fase respetiva):

| O dono diz | O que é | Rota (B.4) | Camada |
| --- | --- | --- | --- |
| «a página da landing», «o site» | Apresentação da InstaBarber | `landing/index.html`, servido em `/` por `app/(institucional)/route.ts` | — |
| «o formulário de contacto da landing» | Pedido de contacto em dois passos (D-50) | `app/api/contacto/route.ts`; validação em `lib/validacao/contacto.ts`; e-mails em `lib/email/contacto.ts`; textos em `lib/i18n/pt-PT.ts` | — |
| «o SEO», «o Google», «o sitemap» | Título e descrição em `landing/index.html`; sitemap e robots (D-105) | `landing/index.html` (title, description, JSON-LD); `app/sitemap.ts`; `app/robots.ts` | — |
| «as contagens da landing» | Visitas, radar e «Continuar» (D-100) | `app/api/medicao/route.ts` (registos da Vercel até à Fase 3B) | — |
| «o formulário de adesão» | Pedido de adesão em quatro passos | `app/(adesao)/adesao/` | — |
| «a entrada», «o login da equipa», «esqueci-me da palavra-passe» | Entrada da equipa, recuperação, definir palavra-passe por convite | `app/(auth)/entrar/` (ações em `acoes.ts`; ligação dos e-mails em `confirmar/route.ts`); no endereço de uma barbearia a equipa entra em `/app/entrar` (D-112) | — |
| «os e-mails de convite e de recuperação» | Modelos do Supabase Auth | `supabase/templates/convite.html` e `recuperacao.html` (local, `config.toml`); no ensaio e na produção, *Auth → Email templates* (aplicado pela Management API, D-115) | — |
| «o admin», «o meu painel» | Painel da Performa LAB | `app/(admin)/admin/(protegido)/` (só com aal2; guarda em `lib/admin/contexto.ts`) | 1 |
| «a verificação em dois passos», «o 2FA» | Inscrição e código TOTP do super_admin | `app/(admin)/admin/dois-passos/`; `components/admin/formulario-dois-passos.tsx` | 1 |
| «o painel da barbearia», «o gestor» | Painel do gestor | `app/(app)/app/(painel)/` (Início com «Pedidos de acesso»); contexto em `lib/equipa/contexto.ts` | 2 |
| «a Gestão do sistema», «registar barbeiro», «reenviar convite» | Equipa e convites (E.3) | `app/(app)/app/(painel)/sistema/` (ações em `acoes.ts`; contas em `lib/auth/contas.ts`) | 2 |
| «trocar de barbearia» | Escolha para quem tem perfis em várias | `app/(app)/app/escolher/` (cookie `ib_barbearia`) | 2 e 3 |
| «o painel do barbeiro» | Painel do profissional | `app/(app)/app/(painel)/equipa/[id]/` | 3 |
| «o menu do painel» | Menus montados pelas funcionalidades (D.3) | `lib/funcionalidades/menus.ts`; verificação no servidor em `lib/funcionalidades/servidor.ts` | 2 e 3 |
| «o endereço da barbearia», «o subdomínio», «o domínio próprio» | Resolução do inquilino (L.4) | `middleware.ts`, `lib/inquilino/` (`host.ts`, `encaminhar.ts`, `endereco.ts`) | — |
| «a página da barbearia X», «a página pública» | Página pública | `app/(publico)/b/[slug]/` | 4 |
| «o código de acesso do cliente», «entrar como cliente» | Telemóvel e palavra-passe; pedir código; criar acesso | `app/(publico)/b/[slug]/entrar/`; `app/api/acesso/route.ts`; `components/cliente/` | 4 |
| «a marcação», «marcar» | Fluxo de marcação | `app/(publico)/b/[slug]/marcar/` | 4 |
| «a área do cliente» | Selos, histórico, próxima marcação | `app/(publico)/b/[slug]/minha-area/` | 4 |
| «o Comercial», «o CRM» | Funil, propostas, contratos | `app/(admin)/admin/comercial/` **confirmar** (Fase 3B) | 1 |
| «as Finanças» | Custos, contas, objetivo, previsões | `app/(admin)/admin/financas/` **confirmar** (Fase 3C) | 1 |

## 3 · Receitas de pedidos comuns

Cada receita: **onde mexer → como verificar → como desfazer**.

| Pedido | Onde mexer | Verificar |
| --- | --- | --- |
| Mudar a cor da **marca** (afeta tudo) | Variáveis em `app/globals.css`; hexadecimais exatos da Parte I (regra 8). **Só com ordem expressa**, e atualizar a Parte I | Capturas antes e depois de cada camada, contraste mínimo AA |
| Mudar a cor de **uma barbearia** | `inquilinos.capa_cor` pelo painel. Não é código | A página pública dessa barbearia no telemóvel e no computador |
| Mudar a cor de **uma página** da plataforma | O token do componente, **não** um hexadecimal escrito no componente. Se não houver token, criá-lo em `globals.css` | As quatro camadas, mobile e computador |
| Trocar um **texto** | A chave em `lib/i18n/pt-PT.ts` (e `en.ts`, `fr.ts` onde existam). Nunca texto literal no componente | Teste das chaves em falta; português de Portugal |
| Trocar um **rótulo de barbearia** (ex.: «Barbeiro») | `lib/vertical/barbearia.ts` | Nenhum rótulo do núcleo fica fora deste ficheiro |
| Trocar um **preço** | **Atualização 10** (`docs/atualizacoes/`) | Passos da U-10 |
| Trocar o **telefone** | **Atualização 8** | Passos da U-8 |
| Mudar o **logótipo** ou o favicon | `public/marca/` (D-35) e a Parte I | Cabeçalho, rodapé, favicon, PDF |
| Mudar a **ordem ou o nome** de um item de menu | A montagem do menu em `lib/funcionalidades/` (o menu sai das funcionalidades ligadas) | Cada papel vê só o que lhe pertence |
| **Acrescentar um campo** a um formulário | Esquema Zod em `lib/validacao/` + coluna por migração + repositório + componente + testes (a mesma validação no formulário e no servidor) | Teste de cada camada e migração em ensaio |
| Mudar uma **mensagem de WhatsApp** | `lib/regras/mensagens.ts` (modelos) e os testes | O `wa.me` abre com o texto certo, número em E.164 |
| Mudar um **e-mail transacional** | Textos em `lib/i18n/pt-PT.ts`; montagem em `lib/email/` (`contacto.ts` para a landing; endereços em `enderecos.ts`) | Testes de `app/api/contacto` e envio de ensaio |
| Mudar um **PDF** | Relatório: `app/api/relatorios` e a biblioteca de PDF (**confirmar**); propostas e contratos: `modelos_documento` na base de dados, pelo Comercial | Gerar um PDF de ensaio; continua a dizer «Não é documento fiscal» |
| **Ligar ou desligar uma funcionalidade** de uma barbearia | Admin → Funcionalidades. Sem código | A barbearia vê (ou deixa de ver) o menu |
| Mudar o **esquema** da base de dados (tabela, coluna, função, política) | Primeiro `docs/esquema/` e os testes (regra 3); depois uma migração nova em `supabase/migrations/` (as quatro primeiras são cópias exatas dos ficheiros 01 a 04); `npm run db:types` atualiza `types/database.ts` (gerado, não se edita) | `supabase db reset`, `npm run test:sql` (396 testes) e `typecheck` |
| **Ler dados** num ecrã novo | Uma função em `lib/repositorios/` que recebe o cliente (`ClienteBD`, de `lib/supabase/tipos.ts`); dinheiro sai em cêntimos (`*_centimos`). Leitura pública só pelas vistas `publico_*` | Teste Vitest do repositório; `integracao.test.ts` contra o Supabase local |
| Mudar uma **regra da agenda** (vaga, sobreposição, antecedência) | Funções SQL por migração, nunca na interface (CLAUDE.md §3) | Testes SQL da agenda e Playwright de duas reservas em simultâneo |
| Mudar um **limite de pedidos** | Os números em `lib/repositorios/limites.ts` (`LIMITES`); a contagem é de `consumir_limite()` | Teste de limite |
| Mudar o **texto dos e-mails do Auth** (convite, recuperação) | `supabase/templates/*.html` e os assuntos em `supabase/config.toml`; depois aplicar ao ensaio e à produção pela Management API (D-115) | Convite de ensaio no Mailpit local (`npm run test:e2e:local`) |
| Mudar um **texto legal** (termos, privacidade) | A página correspondente e a Parte H. **Pedir parecer** se mudar o sentido | Ligações no rodapé e no formulário |
| Mudar o **domínio** de uma barbearia | Manual do operador P-10 | Certificado e redirecionamentos |
| **Corrigir um erro** reportado | Reproduzir; escrever primeiro o teste que falha; corrigir; manter o teste | O teste passa; os outros também |

## 4 · Protocolo de um pedido pequeno

1. **Classificar** (secção 1) e localizar (secções 2 e 3).
2. **Mudar ao nível certo**: no token, na chave, na configuração. Nunca copiar e colar um valor por vários sítios.
3. **Ver antes de publicar**: deploy de pré-visualização e capturas antes e depois (Playwright), em computador e telemóvel (390 e 360 px), nas camadas que o pedido toca.
4. **Verificar**: `typecheck`, `lint`, `test`, `test:sql` (se mexeu no esquema) e `build`; para a landing, `scripts/auditar-landing.py`.
5. **Mostrar ao dono** o antes e o depois e esperar o «ok», **exceto** em mudanças triviais (um texto, uma cor de uma só página) em que ele já tenha dito para avançar.
6. **Publicar**; se algo correr mal, **repor o deploy anterior** na Vercel (imediato) e só depois investigar.
7. **Registar**: commit com a mudança; se for decisão (cor da marca, regra), `DECISOES.md`. **Atualizar este mapa** se o pedido mudou uma estrutura.

## 5 · Regras de manutenção do próprio mapa

- No **fim de cada fase**, correr `scripts/gerar-mapa.sh`, confirmar os caminhos marcados «confirmar» e atualizar as secções 2 e 3 com o que a fase criou.
- A auditoria final de cada fase falha se existir uma rota em `app/` que não conste de `docs/mapa-gerado.md`.
- Ao fazer uma atualização do catálogo (`docs/atualizacoes/`), atualizar o mapa se mudar uma estrutura.
- O **manual do operador** (Fase 9) explica ao dono como pedir mudanças; este mapa é para o Claude Code.
