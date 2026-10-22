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
| «o formulário de adesão» | Pedido de adesão em quatro passos | `app/(adesao)/adesao/` e `components/adesao/`; validação em `lib/validacao/adesao.ts`; rotas `app/api/adesoes/` (pedido e URL assinado das imagens); PDF em `lib/pdf/resumo-contratacao.ts` | — |
| «os termos», «a política de privacidade», «o acordo de subcontratação» | Documentos legais (H.4, D-117) | Texto em `lib/i18n/pt-PT/legal/`; páginas `app/(institucional)/termos/`, `privacidade/`, `termos/subcontratacao/`; identificação da Prestadora pelas variáveis `PRESTADORA_*` | — |
| «a mensalidade», «o preço do plano» | Fórmula única (D.7) | `lib/regras/mensalidade.ts` (com testes); receita do Admin em `lib/regras/receita.ts` | — |
| «a entrada», «o login da equipa», «esqueci-me da palavra-passe» | Entrada da equipa, recuperação, definir palavra-passe por convite | `app/(auth)/entrar/` (ações em `acoes.ts`; ligação dos e-mails em `confirmar/route.ts`); no endereço de uma barbearia a equipa entra em `/app/entrar` (D-112) | — |
| «os e-mails de convite e de recuperação» | Modelos do Supabase Auth | `supabase/templates/convite.html` e `recuperacao.html` (local, `config.toml`); no ensaio e na produção, *Auth → Email templates* (aplicado pela Management API, D-115) | — |
| «o admin», «o meu painel» | Painel da Performa LAB | `app/(admin)/admin/(protegido)/` (só com aal2; guarda em `lib/admin/contexto.ts`; menu em `lib/admin/menu.ts`) | 1 |
| «a ficha da barbearia», «os separadores» | Dez separadores (E.1) | `app/(admin)/admin/(protegido)/barbearias/[id]/` (`[separador]/page.tsx`, ações em `acoes.ts`); campos em `lib/admin/ficha.ts`; validação em `lib/validacao/ficha-barbearia.ts`; componentes em `components/admin/` | 1 |
| «os pedidos de adesão», «aprovar» | Lista, detalhe, aprovar, ajustar, rejeitar | `app/(admin)/admin/(protegido)/pedidos/`; lógica em `lib/admin/aprovacao.ts`; e-mails em `lib/email/adesao-decisao.ts` | 1 |
| «a grelha de funcionalidades» | Pacote, bónus, inativa (D.3, D.4) | `app/(admin)/admin/(protegido)/funcionalidades/`; `components/admin/grelha-funcionalidades.tsx` | 1 |
| «os pagamentos», «as faturas», «os recebimentos» | Registados à mão (E.1) | `app/(admin)/admin/(protegido)/pagamentos/` | 1 |
| «a importação», «o CSV» | Clientes e serviços (E.1) | `lib/regras/importacao.ts` (com testes); separador Importação | 1 |
| «exportar os dados», «eliminar a barbearia» | ZIP de CSV; `eliminar_inquilino()` | `barbearias/[id]/exportar/route.ts`; `lib/exportacao/`; ações rápidas da ficha | 1 |
| «a vista de apoio» | Painel da barbearia só de leitura, 30 minutos (E.1) | `lib/admin/apoio.ts`, `lib/equipa/contexto.ts`, `components/barbearia/faixa-apoio.tsx` | 1 e 2 |
| «a verificação em dois passos», «o 2FA» | Inscrição e código TOTP do super_admin | `app/(admin)/admin/dois-passos/`; `components/admin/formulario-dois-passos.tsx` | 1 |
| «o painel da barbearia», «o Início», «o gestor» | Início do gestor: faixa de ação, quatro indicadores, marcações de hoje, pedidos de acesso, contas, clientes a contactar (E.2) | `app/(app)/app/(painel)/page.tsx`; moldura em `components/barbearia/painel-gestor.tsx`; indicadores em `lib/painel/indicadores.ts` (a mesma origem do Financeiro); contexto em `lib/equipa/contexto.ts` | 2 |
| «a agenda», «marcar ao balcão», «registar serviço», «concluir», «faltou», «lembrete» | Agenda do dia por profissional (E.2, F.7) | `app/(app)/app/(painel)/agenda/` (`marcar/page.tsx`; ações em `acoes.ts`); dia em `lib/painel/agenda.ts`; repositório `lib/repositorios/painel/agenda.ts`; componentes `components/barbearia/agenda/`; texto do lembrete em `lib/regras/mensagens.ts` e `lib/i18n/pt-PT/agenda.ts` | 2 e 3 |
| «os clientes», «o radar», «a ficha do cliente», «a ficha técnica», «os aniversários» | Radar (F.1), ficha, ficha técnica com fotografias, faltas (E.2) | `app/(app)/app/(painel)/clientes/` (`[id]/page.tsx`; ações em `acoes.ts`); radar em `lib/painel/radar.ts` e `lib/regras/classificacao.ts`; componentes `components/barbearia/clientes/`; fotografias no bucket `fichas` (`lib/repositorios/painel/ficha-cliente.ts`) | 2 e 3 |
| «a equipa» | Um separador por profissional (E.2) | `app/(app)/app/(painel)/equipa/page.tsx` | 2 |
| «o financeiro», «os objetivos», «os custos», «as despesas» | Objetivo do mês e por profissional, contas, resumo (E.2, F.3) | `app/(app)/app/(painel)/financeiro/` (ações em `acoes.ts`); mês em `lib/painel/financeiro.ts`; regras em `lib/regras/financeiro.ts` e `lib/regras/objetivos.ts`; componentes `components/barbearia/financeiro/` | 2 |
| «as comissões», «os acertos» | Comissões e acertos (F.4.11) | `app/(app)/app/(painel)/financeiro/acertos/`; `lib/painel/acertos.ts`; `lib/regras/acertos.ts`; repositório `lib/repositorios/painel/acertos.ts` | 2 e 3 |
| «a loja», «os produtos», «os pedidos» | Loja (F.4.4), pagamento ao balcão | `app/(app)/app/(painel)/loja/` (ações em `acoes.ts`); margem em `lib/regras/loja.ts`; `components/barbearia/loja/` | 2 |
| «o meu plano» | Plano, mensalidade, faturas, incluído (E.2) | `app/(app)/app/(painel)/plano/page.tsx` | 2 |
| «a Gestão do sistema» e as suas secções | Estado, marca, horário, ausências, equipa, serviços, fidelização, aniversário, faltas, ligações, clube, períodos, cartões, órfãs (E.2) | `app/(app)/app/(painel)/sistema/[seccao]/page.tsx`; lista e funcionalidade de cada secção em `lib/painel/sistema.ts`; campos simples em `lib/painel/campos-sistema.ts` e `lib/validacao/sistema.ts`; ações em `sistema/acoes.ts` (equipa), `acoes-configuracao.ts` (campos, ausências, feriados, períodos, serviços, imagens), `acoes-clube.ts` (clube e cartões); componentes `components/barbearia/sistema/` | 2 |
| «registar barbeiro», «reenviar convite», «a ficha do barbeiro», «o modelo de caixa» | Equipa por convite e ficha do barbeiro (E.3, F.4.8) | Secção Equipa (`/app/sistema/equipa?p=<id>`); `components/barbearia/sistema/ficha-barbeiro.tsx` e `horario-barbeiro.tsx`; contas em `lib/auth/contas.ts` | 2 |
| «o clube», «os cartões oferta» | Clube (F.4.2) e cartões (F.4.9) | Funções SQL `inscrever_clube()`, `renovar_subscricao()`, `vender_cartao_oferta()`, `usar_cartao_oferta()` (D-121, D-122); `lib/repositorios/painel/clube.ts` e `cartoes.ts`; PDF em `lib/pdf/cartao-oferta.ts` | 2 |
| «o formulário por separadores» | Bloco de campos que grava sozinho (Admin e Gestão do sistema) | `components/nucleo/formulario-ficha.tsx` e `campo-ficha.tsx`; esquemas em `lib/validacao/formularios.ts` | 1 e 2 |
| «o ícone da barbearia», «o atalho no telemóvel» | Ícone e manifesto por barbearia (D-123) | `app/api/icone/[slug]/route.tsx`, `app/api/manifesto/[slug]/route.ts`, `lib/inquilino/icones.ts`; usados em `app/(app)/app/(painel)/layout.tsx` | 2, 3 e 4 |
| «trocar de barbearia» | Escolha para quem tem perfis em várias | `app/(app)/app/escolher/` (cookie `ib_barbearia`) | 2 e 3 |
| «o painel do barbeiro», «as metas», «a folha de acerto», «o perfil», «o portfólio» | Área do profissional (E.3) | `app/(app)/app/(painel)/equipa/[id]/` (`agenda`, `clientes`, `metas`, `acertos`, `perfil`); acesso em `lib/painel/area-profissional.ts`; moldura `components/barbearia/painel-profissional.tsx`; componentes `components/barbearia/profissional/` | 3 |
| «o menu do painel» | Menus montados pelas funcionalidades (D.3) | `lib/funcionalidades/menus.ts`; verificação no servidor em `lib/funcionalidades/servidor.ts` | 2 e 3 |
| «o endereço da barbearia», «o subdomínio», «o domínio próprio» | Resolução do inquilino (L.4) | `middleware.ts`, `lib/inquilino/` (`host.ts`, `encaminhar.ts`, `endereco.ts`) | — |
| «a página da barbearia X», «a página pública» | Página pública (E.6): capa, ações, blocos, rodapé, dados estruturados | `app/(publico)/b/[slug]/page.tsx` (língua em `acoes.ts`); componentes `components/publico/` (`capa.tsx`, `blocos*.tsx`, `rodape.tsx`, `escolha-entrar.tsx`); leitura em `lib/repositorios/barbearias-publicas.ts` (só vistas `publico_*`); JSON-LD em `lib/publico/dados-estruturados.ts`; contraste em `lib/regras/contraste.ts` | 4 |
| «o inglês», «o francês», «as línguas da página» | Multilinguagem (I.3.2), só com a funcionalidade `multilinguagem` | `lib/i18n/publico/` (`pt.ts`, `en.ts`, `fr.ts`); escolha em `lib/publico/lingua.ts` (cookie `ib_lingua`) | 4 |
| «o código de acesso do cliente», «entrar como cliente» | Telemóvel e palavra-passe; pedir código; criar acesso | `app/(publico)/b/[slug]/entrar/`; `app/api/acesso/route.ts`; `components/cliente/` | 4 |
| «a marcação», «marcar», «a reserva de 10 minutos» | Marcação em passos (E.4, F.7, F.9) | `app/(publico)/b/[slug]/marcar/` (ações em `acoes.ts`); `lib/repositorios/marcacao-publica.ts` (`vagas_livres`, `reservar_vaga`, `confirmar_reserva`); validação `lib/validacao/marcacao.ts`; componentes `components/publico/marcacao/`; ficheiro de calendário em `lib/regras/calendario.ts` | 4 |
| «a área do cliente», «o cartão de selos», «o código de convite» | Selos, próxima marcação com cancelamento, histórico, clube, encomendas, convite, repetir (E.4) | `app/(publico)/b/[slug]/minha-area/` (cancelar em `acoes.ts`); `lib/repositorios/minha-area.ts`; funções SQL `meu_codigo_convite()`, `meu_cartao_selos()` (D-125); componentes `components/publico/area/` | 4 |
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
| Mudar um **texto legal** (Termos, Privacidade, Subcontratação) | `lib/i18n/pt-PT/legal/*.ts` e a «versão» com a data. **Pedir parecer** se mudar o sentido | As três páginas no telemóvel |
| Mudar o **esquema** da base de dados (tabela, coluna, função, política) | Primeiro `docs/esquema/` e os testes (regra 3); depois uma migração nova em `supabase/migrations/` (as quatro primeiras são cópias exatas dos ficheiros 01 a 04); `npm run db:types` atualiza `types/database.ts` (gerado, não se edita) | `supabase db reset`, `npm run test:sql` (446 testes) e `typecheck` |
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
