# CLAUDE.md — InstaBarber

Regras fixas do projeto, lidas em cada sessão. Versão 10.5 da especificação.

---

## 1 · Regra de economia — lê isto primeiro

Não leias o documento mestre (`instabarber-documento-mestre.md`). É gerado a
partir das Partes e gasta o contexto sem necessidade.

**Em cada fase, lê apenas:**

1. Este ficheiro.
2. O ficheiro da fase atual, em `fases/fase-N.md`.
3. As secções de `docs/` que essa fase indica, e nada mais.

**Pedidos de manutenção** (o sistema já está no ar e o dono pede «muda a cor da página tal», «troca este texto»…): lê este ficheiro e depois `docs/mapa-do-sistema.md`. Ele diz onde está cada coisa e como mexer sem partir nada. Só depois abres o código.

Se precisares de detalhe que não está nesses ficheiros, pede antes de abrir mais
Partes. O `DECISOES.md` lê-se quando uma regra parecer contradizer outra: é lá
que está a decisão que prevalece.

**Não abras a Parte P** (`docs/parte-p-roteiro-de-expansoes.md`), nem `docs/atualizacoes/`, nem as suas fases. É o roteiro
de expansões (outros países, MB Way online) e só se lê quando o dono mandar ativar uma delas.
Quando o dono disser **«executa as atualizações N, M…»**, lê `docs/atualizacoes/README.md` e os
ficheiros `U-NN` pedidos, e segue o protocolo de segurança de lá.

---

## 2 · Stack fixa

| Peça | Tecnologia |
| --- | --- |
| Runtime | Node.js 22 LTS |
| Linguagem | TypeScript 5.7, modo estrito |
| Framework | Next.js **15.5.7 ou superior** da série 15, App Router |
| React | **19.2.1 ou superior** |
| Estilo | Tailwind CSS 4 e shadcn/ui |
| Base de dados | PostgreSQL 15 via Supabase, região eu-central-1 (Frankfurt) |
| Autenticação | Supabase Auth |
| Ficheiros | Supabase Storage |
| Alojamento | Vercel, funções em fra1 (plano: ver §8) |
| Estado de servidor | TanStack Query 5 |
| Estado de interface | Zustand 5 |
| Formulários | React Hook Form 7 com Zod 3 |
| Gráficos | Recharts 2 |
| Datas | date-fns 4 e date-fns-tz 3, fuso Europe/Lisbon |
| PDF | jsPDF 2 |
| E-mail | Resend 4 |
| Testes | Vitest 2 e Playwright 1 |
| Qualidade | ESLint 9 e Prettier 3 |

React abaixo de 19.2.1 tem a CVE-2025-55182 (execução remota de código).
Next.js abaixo de 15.5.7 tem a CVE-2025-66478. As versões exatas estão na B.4;
na Fase 0 corre-se `npm audit` e não se avança com vulnerabilidades altas.

Nenhuma dependência fora da B.4 sem autorização escrita.

---

## 3 · Regras que não se quebram

**Isolamento entre barbearias.** Nenhuma consulta devolve registos de outro
inquilino. O isolamento está na base de dados (RLS e chaves compostas). Se um
teste de isolamento falhar, **para tudo**.

**A chave de serviço do Supabase nunca no browser.** Só em ficheiros de
servidor, e só para o que o RLS não pode fazer: criar contas de autenticação,
verificar o código de acesso do cliente, contar os limites de pedidos e criar os
URLs de carregamento da adesão.

**A agenda valida-se na base de dados.** A função `validar_vaga()` e a
restrição `sem_sobreposicao` são a autoridade final. A interface só mostra.

**O cliente final nunca herda acesso de equipa.** O cliente não tem perfil; é
identificado por `clientes.auth_user_id`.

**A classificação de clientes é por profissional.** No painel do barbeiro, um
cliente classifica-se só pelo histórico com esse barbeiro. No painel do gestor,
pelo histórico com a barbearia inteira: quem mudou de barbeiro não está perdido (F.1).

**Nenhuma palavra-passe em PDF, e-mail, formulário ou tabela.** Contas novas
definem a palavra-passe por ligação segura ou por código (B9).

**A plataforma não processa pagamentos nem emite documentos fiscais.** Todo o
dinheiro é **registado**, nunca cobrado. Nenhum PDF se chama «recibo» ou
«fatura»: todos dizem «Não é documento fiscal». Os módulos de pagamentos e de
faturação existem desligados (G.4) e não aparecem à barbearia.

**Paridade mobile nas quatro camadas.** Nenhuma ação existe no computador e
não no telemóvel. Abaixo de 768 px, as tabelas passam a cartões.

---

## 4 · Regras de execução

1. Executar as nove fases por ordem. Não avançar sem o resultado verificável da anterior **e a minha confirmação**.
2. No início de cada fase, apresentar o resumo do que vai ser construído e esperar confirmação antes de escrever código.
3. O esquema da base de dados é o de `docs/esquema/`, copiado tal como está para `supabase/migrations/`. Não se reescreve: altera-se primeiro lá, com testes.
4. As regras que decidem o que se grava (vaga, preço, comissão, selos, stock) vivem em funções SQL do `docs/esquema/02_funcoes.sql`. As regras de cálculo e apresentação (classificação, objetivos, mensalidade, recomendações) são funções puras em `lib/regras`, com testes Vitest. Uma regra vive num só sítio.
5. Grelha de funcionalidades: o pacote pré-marca, o interruptor decide, os bónus ficam em auditoria e nunca alteram o preço. Só a Performa LAB liga e desliga (§6).
6. Seguir a especificação de ecrãs da Parte E ao nível do detalhe, nas quatro camadas.
7. Mensagens por ligação `wa.me`: o sistema **prepara** a mensagem e abre a conversa; o envio é confirmado à mão. Nada é dado como enviado sem confirmação. O único envio automático é o e-mail transacional (Resend).
8. Identidade visual com os hexadecimais exatos da Parte I. Não inventar cores.
9. Todo o texto em português de Portugal, Acordo Ortográfico de 1990. Nas páginas do cliente com a funcionalidade `multilinguagem`, também inglês e francês escritos à mão (I.3.2).
10. O núcleo não tem vocabulário de barbearia: os rótulos vivem em `lib/vertical`, desde o primeiro dia.
11. Decisão de produto não especificada: **perguntar**. Decisão técnica menor: escolher a mais simples e registar no `DECISOES.md`.
12. Antes de cada entrega: `npm run typecheck`, `lint`, `test` e `build` sem erros, e os testes SQL de `docs/esquema/testes` a passar.
13. Nunca deixar código morto. **Exceção:** código desligado por interruptor, com testes e registado no `DECISOES.md` (os módulos da G.4), não é código morto e não se apaga.
14. No fim de cada fase, atualizar o `PROGRESSO.md` com a data, o resultado verificado e os testes.
15. No fim de cada fase, correr `scripts/gerar-mapa.sh`, confirmar no `docs/mapa-do-sistema.md` os caminhos marcados «confirmar» e acrescentar o que a fase criou. A fase não fecha se houver uma rota em `app/` fora do mapa.

---

## 5 · Como escrever código aqui

- Cada consulta passa por um repositório em `lib/repositorios/`. Nenhum componente fala diretamente com o Supabase.
- Toda a escrita passa por Server Action ou rota de servidor, com validação Zod. O mesmo esquema Zod valida o formulário.
- Dinheiro: `numeric(10,2)` na base de dados; cêntimos inteiros no TypeScript, convertidos só em `lib/formatacao/dinheiro.ts`.
- Datas: `timestamptz` na base de dados; conversão para hora de Lisboa só em `lib/formatacao/datas.ts` ou nas funções SQL. Aritmética manual de horas é proibida.
- Uma funcionalidade, um só gerador. Nunca duplicar uma fórmula.
- Ao remover uma funcionalidade, remover tudo o que só servia essa funcionalidade (com a exceção da regra 13).
- Um componente por ficheiro; acima de 200 linhas, dividir.
- Rotas e pastas só em ASCII (`servicos/`, nunca `serviços/`).
- Nenhum texto visível em literais de componentes: tudo em `lib/i18n/` (base `pt-PT`). Nunca `€`, taxa de IVA, fuso ou formato de data escritos à mão: vêm da configuração e de `lib/formatacao` (preparação das expansões, Parte P).
- A qualidade da interface é parte do requisito, não um acabamento.

---

## 6 · Funcionalidades e planos

A fonte única da grelha é `docs/esquema/04_dados_iniciais.sql`. A tabela D.3 é
gerada a partir dela. **Nunca escrever à mão quantas funcionalidades tem cada
plano**: dizer «a grelha D.3».

| Plano | Mensal (sem IVA / com IVA) | Anual (10 meses) | Profissionais |
| --- | --- | --- | --- |
| Basic | 19,99 € / 24,59 € | 199,90 € / 245,88 € | 1 |
| Pro | 39,00 € / 47,97 € | 390,00 € / 479,70 € | 3 incluídos; +10,00 € (12,30 € com IVA) por mês, ou +100,00 € por ano, a partir do 4.º |
| Extra: domínio próprio | +5,00 € / +6,15 € | +50,00 € / +61,50 € | Em qualquer plano |

O **preço final** ao cliente é o da coluna «com IVA» e não muda com o regime de IVA da Prestadora. Desde 22/10/2026 a Prestadora já não está isenta (D-85): `PRESTADORA_REGIME_IVA=normal`, o IVA a 23 % está incluído no preço final e o valor sem IVA é o preço final ÷ 1,23, arredondado (39,00 € + 8,97 € = 47,97 €). Se o regime mudar outra vez, muda só a variável (D-45).

Só a Performa LAB liga e desliga funcionalidades, no painel de administração.
A verificação é no servidor e na base de dados, nunca só na interface.

Quando uma funcionalidade não está ativa, **sai** do painel: menu, ecrã, botão
e rota. A exceção são as chaves com `mostra_upgrade` (mensagens, avaliação e
metas): aparecem desativadas com a chamada de upgrade (D.2).

---

## 7 · Onde está cada coisa

| Onde | O que tem |
| --- | --- |
| `CLAUDE.md` | Este ficheiro |
| `DECISOES.md` | Decisões tomadas, com data. Prevalece sobre o resto em caso de dúvida |
| `PROGRESSO.md` | Estado real de cada fase |
| `fases/README.md` | A tabela das nove fases |
| `fases/fase-0…8.md`, `fase-3b.md`, `fase-3c.md`, `fase-9-manuais.md` | Uma fase por ficheiro, com as secções a ler (3B: Comercial, Parte N; 3C: Finanças, Parte O; 9: manuais, só depois da Fase 8) |
| `fases/criterios-de-aceitacao.md` | Os critérios globais (J.1) |
| `docs/00-indice.md` | Índice das Partes A a P |
| `docs/parte-*.md` | A especificação, uma Parte por ficheiro |
| `docs/esquema/` | O esquema SQL e os testes (fonte única da base de dados) |
| `docs/parte-p-roteiro-de-expansoes.md` | **Dormente.** Roteiro das expansões (Espanha, Brasil, outros países, MB Way online). Só se lê por ordem do dono |
| `docs/mapa-do-sistema.md`, `docs/mapa-gerado.md` | O mapa de manutenção: classifica um pedido, diz onde mexer e como verificar (o gerado vem de `scripts/gerar-mapa.sh`; não se edita) |
| `docs/atualizacoes/` | **Dormente.** Catálogo de atualizações numeradas, cada uma com procedimento escrito. Pedem-se por número: «executa as atualizações 1, 7 e 9» |
| `docs/manual-do-operador.md` | Os processos manuais da Performa LAB, passo a passo |
| `instabarber-documento-mestre.md` | Gerado por `scripts/gerar-mestre.sh`. Não editar nem ler |

---

## 8 · Alojamento e custos variáveis

Nenhum custo variável por mensagem: o WhatsApp é por ligação `wa.me`.

A Vercel começa no plano Hobby, por decisão do dono (DECISOES.md, D-15). O
plano Hobby não permite uso comercial nos termos da Vercel; a passagem para o
Pro é só configuração e faz-se quando a receita o permitir. Nada no código
depende do plano.

---

## 9 · Marca

O nome InstaBarber refere-se ao instante. Não imitar nada do Instagram: nem
gradiente, nem câmara, nem tipografia. Escrever sempre «InstaBarber», com as
duas maiúsculas. Ver a nota da marca na Parte J.

---

## 10 · Endereços de correio

| Endereço | Tipo | Para quê |
| --- | --- | --- |
| geral@instabarber.pt | Caixa | O principal. Faturas e o que vem de fora |
| raphaelmartins@instabarber.pt | Alias | Correio que o dono envia em nome próprio |
| comercial@instabarber.pt | Alias | Propostas, prospeção e negociação |
| apoio@instabarber.pt | Alias | Suporte às barbearias |
| privacidade@instabarber.pt | Alias | Exercício de direitos do RGPD |

O endereço segue a natureza da mensagem, não quem escreve. Assinatura única:
«InstaBarber · Performa LAB», sem nome pessoal (D-44). Exceção: os e-mails comerciais enviados a visitantes e clientes assinam «Comercial InstaBarber», com o WhatsApp por baixo (D-101). Detalhe na L.2.

## 11 · Redes sociais: o que não se diz

Nas publicações, legendas, bios e vídeos do Instagram **não se menciona a Performa LAB nem «feito em Viseu»**. A marca fala só como InstaBarber (decisão de 21/10/2026, D-67). A assinatura «InstaBarber · Performa LAB» do correio (secção 10) mantém-se.

Também **não aparece «piloto»** («vagas piloto», «barbearias piloto», palavra-chave PILOTO) em nenhuma publicação nem na landing (D-68, D-73). O CTA das publicações é «Experimenta online já» / «link na bio».
A promessa central nas publicações é «tudo o que a barbearia precisa, reunido num só sistema, sem pagar por cada serviço». Não usar «sem pagar por cada mensagem» como mensagem principal.

## 12 · Tom das legendas

As legendas e textos das publicações usam português falado de Portugal, com expressões e calão leve naturais («a sério que ainda…?», «bora», «fogo», «pá», «deixa-te de…», «é só…», «tás», «gajo» com moderação), como um barbeiro falaria com outro. Nada de tom de anúncio, de listas em tríade nem de frases que soem a texto gerado («feito para quem…», «pensado para…», «reunidos num só sistema»). Frases curtas, uma provocação ou pergunta por legenda. Exemplo do dono: «A sério que ainda usas lista no telemóvel para gerir a tua barbearia?» (D-69). Evitar brasileirismos (regra 4).

As legendas levam emojis com critério (2 a 5 por legenda, um no início da primeira linha e os restantes a separar ideias; nunca em fila). Pedido do dono, 21/10/2026.

O guia completo está em `marketing/instagram/GUIA-DE-VOZ-E-LINGUAGEM.md` (D-70).
