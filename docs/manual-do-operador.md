## Manual do operador — InstaBarber · Performa LAB

Este manual descreve, passo a passo, tudo o que a Performa LAB faz à mão para
operar o InstaBarber. Foi escrito para que qualquer pessoa com os acessos certos
consiga gerir a plataforma sem depender de quem a construiu.

**Estado:** escrito a 21 de outubro de 2026 a partir da especificação 10.1. Na
Fase 8 é revisto com o sistema real: cada procedimento é feito uma vez, os
passos corrigem-se e acrescentam-se capturas de ecrã. Uma mudança no produto
que mexa num procedimento atualiza este manual no mesmo dia.

### Índice dos procedimentos

| N.º | Procedimento | Quando |
| --- | --- | --- |
| P-01 | Rotina do operador | Diária, semanal, mensal, anual |
| P-02 | Enviar uma proposta e o formulário de adesão | Uma barbearia interessada |
| P-03 | Rever e aprovar um pedido de adesão | Pedido novo no painel |
| P-04 | Pôr a barbearia a funcionar (primeira semana) | Depois da aprovação |
| P-05 | Importar clientes e serviços | A barbearia traz dados de outro sistema |
| P-06 | Ligar e desligar funcionalidades | Pedido da barbearia ou bónus |
| P-07 | Mudar de plano, de periodicidade ou de profissionais | Pedido da barbearia |
| P-08 | Faturar e registar recebimentos | Todos os meses |
| P-09 | Mensalidade em atraso, suspensão e reativação | Pagamento falhado |
| P-10 | Ligar o domínio próprio de uma barbearia | Extra contratado |
| P-11 | Apoio a uma barbearia | Pedido de ajuda |
| P-12 | Pedidos de proteção de dados (RGPD) | E-mail no privacidade@ |
| P-13 | Cópia de segurança semanal | Todas as semanas |
| P-14 | Testar um restauro | Antes do primeiro cliente e a cada três meses |
| P-15 | Carregar os feriados do ano seguinte | Até 1 de dezembro |
| P-16 | Alterar o esquema da base de dados em produção | Nova versão com migração |
| P-17 | Contas de administrador e chaves | Nova pessoa na operação, chave exposta |
| P-18 | Saída de uma barbearia: exportar e eliminar | Cancelamento |
| P-19 | Violação de dados | Suspeita de acesso indevido |
| P-20 | Ativar pagamentos ou faturação (futuro) | Plano dos 50 clientes |
| P-21 | Tratar um lead no Comercial | Pedido do site ou contacto novo |
| P-22 | Preparar e enviar uma proposta (briefing e PDF) | Depois da conversa com a barbearia |
| P-23 | Gerar o contrato, assinar e converter em adesão | Proposta aceite |
| P-24 | Apagar leads antigos | Todos os meses |
| P-25 | Lembrar uma barbearia do vencimento (WhatsApp ou e-mail) | Vencimento nos próximos 7 dias |
| P-26 | Registar custos e contas a pagar, rever o resumo e o objetivo | Todos os meses |
| P-27 | Exportar os números para o contabilista | Fim de cada mês ou trimestre |
| P-28 | Monitorizar a disponibilidade (objetivo de 99,5 %) | Uma vez, e ao fim de cada mês |

---

### P-00 · Antes de começar: acessos e regras

**Acessos de que o operador precisa**, todos guardados no gestor de
palavras-passe da Performa LAB, com acesso de emergência:

| Acesso | Para quê |
| --- | --- |
| Painel de administração (`instabarber.pt/admin`) com 2FA | Quase tudo deste manual |
| Supabase (projeto de produção e projeto de ensaio) | Cópias, restauro, feriados, chaves, contas de administrador |
| Vercel | Domínios, variáveis de ambiente, publicações |
| Zoho Mail (geral@ e alias) | Correio da Performa LAB |
| Resend | Estado dos e-mails transacionais |
| Registador de domínios | instabarber.pt e defensivos |
| Programa de faturação certificado da Performa LAB | Emitir as faturas das mensalidades |
| Disco ou nuvem cifrados (na UE) | Guardar as cópias de segurança |

**Regras de ouro**

1. Nunca partilhar palavras-passe, nem com a barbearia, nem entre operadores. Cada pessoa tem a sua conta com 2FA.
2. Nunca colar a chave de serviço do Supabase em lado nenhum fora do painel da Vercel e do gestor de palavras-passe.
3. Tudo o que se faz no painel de administração fica em auditoria. Escrever sempre a justificação quando o painel a pedir.
4. O endereço de correio segue a natureza da mensagem: comercial@ para propostas, apoio@ para ajuda, privacidade@ para RGPD, geral@ para o resto (L.2).
5. Na dúvida sobre dados de clientes finais, lembrar: a barbearia é a responsável pelo tratamento; a Performa LAB só age por instrução escrita dela.

---

### P-01 · Rotina do operador

| Frequência | Tarefa | Procedimento |
| --- | --- | --- |
| Diária | Pedidos de adesão novos (resposta no próprio dia) | P-03 |
| Diária | Leads novos no Comercial | P-21 |
| Semanal | Leads parados e propostas a expirar | P-21, P-22 |
| Mensal | Apagar leads com mais de 12 meses | P-24 |
| Semanal | Vencimentos dos próximos 7 dias | P-25 |
| Mensal | Custos, contas a pagar, resumo e objetivo | P-26 |
| Mensal | Exportar para o contabilista | P-27 |
| Diária | Alertas do painel geral: atrasos, suspensões, sinais de abandono | P-09, M.2 |
| Diária | Correio do apoio@ e do privacidade@ | P-11, P-12 |
| Semanal | Cópia de segurança externa | P-13 |
| Semanal | Barbearias com pouca utilização: contacto pessoal | M.2 |
| Mensal (dia 1) | Emitir faturas e registar recebimentos | P-08 |
| Mensal | Rever mensalidades em atraso | P-09 |
| Trimestral | Testar um restauro; rever preços e planos | P-14 |
| Anual (até 1 de dezembro) | Feriados do ano seguinte | P-15 |
| Anual | Renovar os domínios; rever os documentos legais | L.3, H.4 |

---

### P-02 · Enviar uma proposta e o formulário de adesão

**Quando:** uma barbearia mostra interesse. **De:** comercial@.

> **Antes da Fase 3B** (módulo Comercial), faz-se à mão como abaixo. **Depois**, o passo 1 faz-se com P-22 e o passo 2 com o convite de adesão de P-23.

1. Enviar a proposta: planos (Basic 19,99 €, Pro 39 €, com e sem IVA), plano anual (dez mensalidades), extra de domínio próprio, o que inclui cada plano (grelha D.3) e que não há comissões nem custos por mensagem.
2. Quando o dono aceitar, enviar a ligação do formulário: `instabarber.pt/adesao`.
3. Juntar ao e-mail a lista do que convém ter à mão: logótipo com fundo transparente (PNG ou SVG, mínimo 512 × 512 px), fotografia da fachada, lista de serviços com duração e preço, nomes e e-mails dos barbeiros, e o ficheiro de clientes se vier de outro sistema (P-05).

**Confirmar:** o pedido aparece no separador Pedidos quando o dono o enviar.

---

### P-03 · Rever e aprovar um pedido de adesão

**Quando:** chega o e-mail «Nova adesão» ao geral@ ou o pedido aparece no painel.

1. **Só na primeira barbearia real:** antes de aprovar, passar a empresa Performa LAB no Supabase para o plano Pro (cópias diárias, sem pausas; D-137). Até lá, cópia à mão (P-13).
2. Abrir `Admin → Pedidos` e o pedido pendente.
3. **Verificar os dados:** nome, NIF (nove dígitos), morada, telefone e WhatsApp, horário, serviços (duração e preço), equipa (nomes e e-mails válidos).
4. **Verificar as imagens:** logótipo com fundo transparente e legível em círculo; fachada em 16:9. Se o logótipo tiver fundo branco, pedir uma versão transparente antes de aprovar (ou aprovar e trocar depois no separador Marca).
5. **Verificar a mensalidade:** plano, periodicidade e número de profissionais; o valor tem de bater com os exemplos da D.5.
6. **Escolher o endereço (slug):** curto, minúsculas, sem acentos, com hífenes (`barbearia-central`). O sistema recusa slugs reservados.
7. Decidir:
   - **Aprovar** — cria a barbearia, aplica o pacote, cria a conta do dono e envia-lhe o e-mail de boas-vindas.
   - **Ajustar** — abre a ficha completa para corrigir antes de aprovar.
   - **Rejeitar** — escrever o motivo (obrigatório); o dono recebe a resposta por e-mail.
8. Ver a preferência de pagamento no cartão do pedido e responder como indicado (P-08).

**Confirmar:** a barbearia aparece em `Admin → Barbearias` como ativa; a página pública abre em `instabarber.pt/<slug>`; o dono recebeu o e-mail (ver no Resend se não chegar).

**Se correr mal:** o dono não recebeu o e-mail → verificar o endereço no pedido, ver o estado no Resend e reenviar a ligação de definição de palavra-passe a partir da ficha.

---

### P-04 · Pôr a barbearia a funcionar (primeira semana)

1. Ligar ao dono no dia da aprovação (cinco minutos): confirmar que entrou e definiu a palavra-passe.
2. Na ficha, confirmar a cor da capa, o horário, os dias de descanso e o intervalo de almoço.
3. Se a barbearia trouxer clientes de outro sistema, importá-los (P-05).
4. Pedir ao dono que registe os barbeiros na Gestão do sistema (cada um recebe um convite por e-mail). Confirmar dois dias depois que todos entraram; senão, «Reenviar convite».
5. Gravar e enviar o vídeo de boas-vindas com o painel da própria barbearia (M.5).
6. Pedir ao dono que preencha a ligação de avaliação no Google e a do Livro de Reclamações eletrónico (Gestão do sistema → Ligações).
7. Ao fim de sete dias, ver se há marcações e se o painel foi aberto. Se não, ligar.

---

### P-05 · Importar clientes e serviços

**Quando:** a barbearia vem do Booksy, Fresha ou de outro sistema.

1. Pedir ao dono a exportação de clientes do sistema antigo, em CSV.
2. Preparar o ficheiro de clientes com estas colunas, nesta ordem: `nome`, `telemovel`, `email`, `data_nascimento` (AAAA-MM-DD), `notas`. O telemóvel pode vir com ou sem +351.
3. Preparar o de serviços: `nome`, `duracao_min`, `preco` (preço final ao cliente, com vírgula ou ponto).
4. `Admin → Barbearias → <barbearia> → Importação`: carregar o ficheiro e ver a pré-visualização.
5. Rever as linhas com erro (telemóvel inválido, duplicado). Corrigir no ficheiro e voltar a carregar, ou seguir só com as válidas.
6. Gravar.

**Atenção:** os clientes importados ficam **sem consentimento** para mensagens promocionais, mesmo que o tivessem no sistema antigo: o consentimento não se transfere. Recebem lembretes de marcação; para campanhas, o consentimento dá-se na próxima marcação.

**Confirmar:** o número de clientes na barbearia bate com o ficheiro, menos os rejeitados.

---

### P-06 · Ligar e desligar funcionalidades

**Quando:** a barbearia pede uma funcionalidade, ou a Performa LAB oferece um bónus.

1. `Admin → Funcionalidades`, escolher a barbearia.
2. Marcar ou desmarcar a funcionalidade. Fora do plano, fica como **bónus** (realce dourado) e não muda o preço.
3. A `multilinguagem` não está em nenhum plano: liga-se sempre aqui.
4. «Guardar alterações». Para voltar ao plano contratado, «Repor pacote».

**Confirmar:** o resumo lateral mostra o estado certo; a alteração aparece na auditoria.

---

### P-07 · Mudar de plano, de periodicidade ou de profissionais

**Basic para Pro**

1. Ficha da barbearia → Pagamentos: plano «Pro», profissionais contratados (mínimo 2).
2. `Admin → Funcionalidades` → «Repor pacote».
3. Avisar o dono do novo valor e de que já pode registar o segundo barbeiro.

**Pro para Basic**

1. Combinar com o dono qual o profissional que fica.
2. Na Gestão do sistema da barbearia (vista de apoio, ou pelo dono), desativar os restantes. As marcações futuras deles ficam «sem profissional» para o dono reatribuir.
3. Ficha → Pagamentos: plano «Basic», profissionais contratados 1. O sistema recusa enquanto houver mais de um ativo.
4. «Repor pacote».

**Mais um profissional no Pro:** aumentar os profissionais contratados; a mensalidade recalcula (+10 € por mês).

**Mensal para anual, ou o contrário:** mudar a periodicidade e ajustar a data do próximo vencimento.

**Confirmar:** a mensalidade no painel bate com a D.5; a alteração está na auditoria.

---

### P-08 · Faturar e registar recebimentos

**Quando:** no dia 1 de cada mês (mensais) e nos vencimentos anuais.

1. `Admin → Pagamentos`: ver as barbearias com vencimento no mês e o valor de cada uma.
2. No **programa de faturação certificado da Performa LAB** (fora da plataforma), emitir a fatura de cada uma com o valor com IVA.
3. Na plataforma, registar a fatura: número (o do programa certificado), período, valor e data.
4. Pedir o pagamento segundo a preferência de cada barbearia: pedido MB WAY para o número indicado, IBAN por e-mail (geral@) ou entrega em mão.
5. Quando o dinheiro entrar, registar o recebimento: data, método, valor e a fatura a que corresponde. O estado passa a «em dia».

**Nunca** emitir faturas pela plataforma: ela não é programa certificado (H.3).

---

### P-09 · Mensalidade em atraso, suspensão e reativação

1. **Até 7 dias de atraso:** lembrete amigável por e-mail (apoio@), com o IBAN ou novo pedido MB WAY. Marcar «em atraso». (A partir da Fase 3C, usar o P-25.)
2. **15 dias:** chamada telefónica.
3. **30 dias:** aviso escrito de suspensão, com a data.
4. **Suspender:** ficha → ação rápida «Suspender». A equipa deixa de ver os dados; o dono continua a ver «O meu plano»; a página pública mostra «Temporariamente indisponível para marcações». Os dados ficam intactos.
5. **Reativar:** quando o pagamento entrar, registar o recebimento e «Reativar». Tudo volta como estava.
6. **12 meses suspensa sem contacto:** aviso escrito e, sem resposta, seguir a P-18.

---

### P-10 · Ligar o domínio próprio de uma barbearia

**Quando:** a barbearia contrata o extra (5,00 € por mês sem IVA). Cerca de 15 minutos.

1. A barbearia compra o domínio em nome dela (ex.: `barbeariaexemplo.pt`).
2. No painel da **Vercel**, projeto InstaBarber → Domínios → adicionar `barbeariaexemplo.pt` e `www.barbeariaexemplo.pt`. A Vercel mostra os registos DNS a criar.
3. Enviar à barbearia (ou criar por ela, com o acesso dela) os registos, no painel do registador:
   - raiz (`@`): registo **A** com o endereço IP indicado pela Vercel;
   - `www`: registo **CNAME** com o destino indicado pela Vercel.
   Nunca CNAME na raiz.
4. Esperar que a Vercel mostre o domínio como válido e o HTTPS emitido (minutos a algumas horas).
5. No **Supabase** → Authentication → URL Configuration: acrescentar `https://barbeariaexemplo.pt/**` aos endereços autorizados.
6. No painel de administração → ficha → Identidade: escrever o domínio e ligar o extra. A mensalidade recalcula.
7. Testar: abrir o domínio, ver a página pública, entrar como cliente de ensaio e como dono.

**Para desligar:** retirar o domínio da ficha (o extra sai), da Vercel e do Supabase.

---

### P-11 · Apoio a uma barbearia

**Nível 1 — utilização**

| Pedido | Resposta |
| --- | --- |
| O dono ou um barbeiro esqueceu-se da palavra-passe | Ecrã de entrada → «Esqueci-me da palavra-passe»: recebe uma ligação por e-mail. Nunca definir a palavra-passe por ele |
| Um barbeiro não recebeu o convite | Gestão do sistema → Equipa → «Reenviar convite»; ver o estado no Resend |
| Um cliente não recebe o código de acesso | O código aparece no Início da barbearia, em «Pedidos de acesso»; alguém tem de carregar em «Enviar código por WhatsApp» nos 15 minutos |
| Um cliente quer escolher a palavra-passe | Número novo: na primeira marcação. Número com ficha: pede o código na área de cliente |
| Um cliente foi bloqueado por faltas | Ficha do cliente → «Voltar a permitir marcação online» |
| «Não sei fazer X» | Vídeo de um minuto da página de ajuda, ou chamada de cinco minutos |

**Nível 2 — configuração:** horário, mais um profissional, mudança de plano → P-06, P-07, ou a ficha da barbearia.

**Nível 3 — técnico** (marcação duplicada, erro ao gravar, dados em falta):

1. Abrir a **vista de apoio** da barbearia (ficha → «Vista de apoio»): escrever a justificação; só leitura, 30 minutos, fica em auditoria.
2. Reproduzir o problema e ver a auditoria.
3. Registar o caso (data, barbearia, descrição, causa, correção) e passar a correção ao desenvolvimento.
4. Dizer ao dono o que aconteceu e o que foi feito.

Um problema de nível 3 num sábado à noite passa à frente de tudo.

---

### P-12 · Pedidos de proteção de dados (RGPD)

**Quando:** chega um pedido ao privacidade@ ou a uma barbearia. Prazo de resposta ao titular: **um mês** (RGPD, art. 12.º, n.º 3).

1. **Identificar quem é o responsável.** Para dados de clientes finais, é a barbearia: reencaminhar-lhe o pedido no próprio dia e oferecer ajuda. Para dados da própria barbearia (dono, faturas), é a Performa LAB.
2. **Acesso ou portabilidade:** a barbearia vê tudo na ficha do cliente; se precisar de um ficheiro, a Performa LAB exporta só esse cliente (ficha, marcações, visitas, selos) a pedido escrito da barbearia.
3. **Eliminação:** a barbearia faz «Anonimizar cliente» na ficha. Por instrução escrita da barbearia, o operador pode fazê-lo pela vista de apoio. Os registos financeiros ficam, anonimizados.
4. **Oposição a mensagens:** marcar «Não contactar» na ficha.
5. Registar o pedido, a data, a resposta e a data da resposta.

---

### P-13 · Cópia de segurança semanal

**Quando:** todas as semanas, e sempre antes de uma alteração ao esquema (P-16). Cerca de 10 minutos. O Supabase Pro já faz cópias diárias (7 dias); esta é a cópia **fora** do Supabase, guardada 30 dias.

**Precisa de:** a CLI do Supabase instalada no computador do operador e a ligação à base de dados de produção (Supabase → Connect → «Session pooler»), guardada no gestor de palavras-passe.

1. Num terminal, numa pasta com a data (ex.: `copia-2026-11-02`):

   ```bash
   supabase db dump --db-url "$URL_PRODUCAO" -f roles.sql --role-only
   supabase db dump --db-url "$URL_PRODUCAO" -f schema.sql
   supabase db dump --db-url "$URL_PRODUCAO" -f data.sql --use-copy --data-only
   ```

   No repositório, o mesmo numa linha (os três ficheiros, sem as tabelas internas do Storage, e a soma de verificação `SHA256SUMS`): `SUPABASE_DB_URL="$URL_PRODUCAO" scripts/copia-seguranca.sh` (D-127). A pasta `copias/` nunca vai para o Git.

2. **Ficheiros do Storage** (logótipos, galerias, portfólios, fichas técnicas): o `db dump` não os inclui. Descarregar os buckets `publico` e `fichas` com `supabase storage cp` (comando experimental da CLI) ou pelo painel do Supabase.
3. Comprimir a pasta num ficheiro cifrado com palavra-passe forte (guardada no gestor de palavras-passe).
4. Guardar no disco ou na nuvem cifrados da Performa LAB, na UE.
5. Apagar as cópias com mais de 30 dias.

**Confirmar:** os três ficheiros têm tamanho maior do que zero e o `data.sql` cresce de semana para semana. Registar a data da cópia.

**Alternativa sem a porta 5432 (D-148), a que o Claude Code usa:** `SUPABASE_COPIA_REF=<ref> SUPABASE_COPIA_TOKEN=<token> COPIA_SENHA=<palavra-passe> python3 scripts/copia-api.py copias` lê os dados pela Management API (public, contas, Storage) e gera um único ficheiro `instabarber-copia-<data>.tar.gz.gpg`, cifrado com AES-256. O esquema não vai na cópia: vem das migrações indicadas no manifesto. O ficheiro guarda-se no Google Drive da Performa LAB, pasta **«InstaBarber · Cópias de segurança»**; a palavra-passe (`COPIA_SENHA`) fica no gestor de palavras-passe, nunca na mesma pasta. Primeira cópia: 24/10/2026.

**A cópia contém dados pessoais:** nunca por e-mail, nunca em pastas partilhadas sem cifra.

---

### P-14 · Testar um restauro

**Quando:** antes do primeiro cliente real, e depois a cada três meses. Uma cópia que nunca foi restaurada não é uma cópia.

1. Usar o **projeto de ensaio** do Supabase (nunca o de produção).
2. Decifrar a cópia mais recente (P-13).
3. Restaurar:

   ```bash
   psql --single-transaction --variable ON_ERROR_STOP=1 \
     --file roles.sql --file schema.sql \
     --command 'SET session_replication_role = replica' \
     --file data.sql --dbname "$URL_ENSAIO"
   ```

   No repositório: `ALVO_DB_URL="$URL" scripts/restaurar-copia.sh --completo copias/<data>` num **projeto novo e vazio**; ou, sem `--completo`, num projeto que já tem as mesmas migrações (esvazia primeiro os dados de referência). No fim mostra o RLS (`sem_rls` tem de ser 0) e as contagens das tabelas principais, para comparar com a origem (`scripts/sql/contagens.sql`). Com `PRODUCAO_DB_HOST` definido, recusa restaurar sobre a produção. Ensaiado no Supabase local a 22/10/2026 (D-127).

4. Verificar: número de barbearias, clientes e marcações igual ao da produção; RLS ativo em todas as tabelas; entrar como uma barbearia de ensaio.
5. Registar a data, o tempo que demorou e qualquer problema. Limpar o projeto de ensaio no fim.

**Restauro da cópia feita pela API (D-148):** com o Supabase local acabado de repor (`npx supabase db reset`), `ALVO_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres COPIA_SENHA=… python3 scripts/restaurar-copia-api.py <ficheiro>.gpg`. Decifra, confere as somas, repõe tudo numa transação e compara as contagens com o manifesto; recusa a produção. Ensaiado a 24/10/2026 com a cópia da produção: 64 tabelas, 127 linhas, RLS ativo nas 59.

---

### P-15 · Carregar os feriados do ano seguinte

**Quando:** até 1 de dezembro de cada ano. A base de dados já tem 2026, 2027 e 2028.

1. Supabase → SQL Editor (projeto de produção).
2. Inserir os 13 feriados nacionais obrigatórios. Três mudam com a Páscoa: Sexta-feira Santa (Páscoa − 2 dias), Páscoa, e Corpo de Deus (Páscoa + 60 dias).

   | Ano | Sexta-feira Santa | Páscoa | Corpo de Deus |
   | --- | --- | --- | --- |
   | 2029 | 30/03 | 01/04 | 31/05 |
   | 2030 | 19/04 | 21/04 | 20/06 |
   | 2031 | 11/04 | 13/04 | 12/06 |
   | 2032 | 26/03 | 28/03 | 27/05 |

   ```sql
   insert into feriados (inquilino_id, data, nome) values
     (null, '2029-01-01', 'Ano Novo'),          (null, '2029-03-30', 'Sexta-feira Santa'),
     (null, '2029-04-01', 'Páscoa'),            (null, '2029-04-25', 'Dia da Liberdade'),
     (null, '2029-05-01', 'Dia do Trabalhador'), (null, '2029-05-31', 'Corpo de Deus'),
     (null, '2029-06-10', 'Dia de Portugal'),   (null, '2029-08-15', 'Assunção de Nossa Senhora'),
     (null, '2029-10-05', 'Implantação da República'), (null, '2029-11-01', 'Dia de Todos os Santos'),
     (null, '2029-12-01', 'Restauração da Independência'), (null, '2029-12-08', 'Imaculada Conceição'),
     (null, '2029-12-25', 'Natal');
   ```

3. Lembrar às barbearias, por e-mail, que acrescentem o feriado municipal e o Carnaval se fecharem (Gestão do sistema → Ausências e feriados).

**Confirmar:** `select count(*) from feriados where inquilino_id is null and extract(year from data) = 2029;` devolve 13.

---

### P-16 · Alterar o esquema da base de dados em produção

**Quando:** uma nova versão traz uma migração.

1. Confirmar que a alteração entrou primeiro em `docs/esquema/` e que os testes SQL passam no projeto de ensaio.
2. Fazer a cópia de segurança (P-13) e confirmar os ficheiros.
3. Escolher a hora de menor uso (por exemplo, segunda-feira de manhã cedo, quando a maioria das barbearias está fechada).
4. Aplicar a migração (`npm run db:migrate` contra a produção).
5. Confirmar: RLS ativo em todas as tabelas; entrar como barbearia de ensaio e fazer uma marcação.
6. Se algo correr mal: parar, avisar as barbearias se houver impacto, e restaurar a partir da cópia (P-14, agora na produção).

---

### P-17 · Contas de administrador e chaves

**Nova pessoa na operação**

1. Supabase → Authentication → criar o utilizador com o e-mail da pessoa.
2. SQL Editor: `insert into perfis (user_id, papel, nome) values ('<id do utilizador>', 'super_admin', '<nome>');`
3. A pessoa entra, define a palavra-passe e **ativa o 2FA** (aplicação de autenticação). Sem 2FA, não vê nada.
4. Dar-lhe acesso ao gestor de palavras-passe só com o que precisa.

**Pessoa que sai:** `update perfis set ativo = false where user_id = '<id>';` e retirar-lhe os acessos externos (Vercel, Supabase, Zoho, gestor de palavras-passe).

**Chave exposta** (chave de serviço num e-mail, num repositório, num ecrã partilhado):

1. Supabase → definições da API: gerar uma chave nova e revogar a antiga.
2. Vercel → variáveis de ambiente: substituir `SUPABASE_SERVICE_ROLE_KEY` e publicar outra vez.
3. Atualizar o `.env.local` de quem desenvolve.
4. Ver a auditoria e os registos do Supabase à procura de uso indevido; se houver, seguir a P-19.


**Atenção (D-147):** ao copiar a configuração do Auth de um projeto do Supabase para outro pela API, a palavra-passe do SMTP não vem (a API devolve um resumo). Põe-se à parte, com a chave do Resend, e testa-se logo um «Esqueci-me da palavra-passe».
---

### P-18 · Saída de uma barbearia: exportar e eliminar

**Quando:** a barbearia cancela, ou ao fim de 12 meses suspensa sem contacto (P-09).

1. **Cancelar:** ficha → ação rápida «Cancelar». A página pública e o painel deixam de funcionar.
2. **Exportar:** ficha → «Exportar dados». Gera um ficheiro comprimido com os CSV de clientes, marcações, visitas, serviços, equipa, financeiro, clube e loja.
3. **Entregar** o ficheiro ao dono por ligação segura (cifrada, com prazo), nunca em anexo simples. Registar a data da entrega.
4. **Esperar o prazo** combinado no Acordo de Subcontratação (por omissão, 30 dias depois da entrega), para o dono confirmar que recebeu tudo.
5. **Eliminar:** ficha → «Eliminar definitivamente». O painel pede o slug da barbearia como confirmação, chama `eliminar_inquilino()` e apaga a seguir as contas de autenticação que ficaram sem uso.
6. **Storage:** apagar as pastas da barbearia nos buckets `publico` e `fichas`.
7. **Domínio próprio**, se existia: retirá-lo da Vercel e do Supabase (P-10).
8. Registar a eliminação (data, quem, o que foi apagado). As cópias de segurança antigas apagam-se sozinhas ao fim de 30 dias (P-13).

---

### P-19 · Violação de dados

Seguir a M.6. Resumo para o operador:

1. **Conter já:** revogar chaves (P-17), suspender contas suspeitas, fechar a exposição.
2. **Registar:** hora da descoberta, o que se sabe, quem descobriu.
3. **Avaliar:** que dados, de que barbearias, quantas pessoas, que risco.
4. **Informar as barbearias afetadas sem demora** (privacidade@): elas são as responsáveis e têm 72 horas para notificar a CNPD. Dar-lhes toda a informação.
5. Corrigir a causa e registar o que mudou.

---

### P-20 · Ativar pagamentos ou faturação (futuro)

**Quando:** no plano dos 50 clientes (M.7), e só depois do parecer do contabilista.

1. Escolher o fornecedor de pagamentos e assinar o contrato; cada emitente abre a sua conta no programa de faturação.
2. Colar as chaves do fornecedor no painel da Vercel e publicar.
3. `Admin → Módulos`: ligar o interruptor geral (o painel diz se falta alguma chave).
4. Ligar o módulo para uma barbearia piloto; acompanhar uma semana.
5. Só depois, alargar às outras, uma a uma.

---

### P-21 · Tratar um lead no Comercial

**Quando:** chega o e-mail «Novo pedido de contacto» ao comercial@, ou há alguém novo para registar. **Disponível a partir da Fase 3B.**

1. Abrir `Admin → Comercial → Leads` e o lead novo (ou criar um à mão: nome, barbearia, telefone ou e-mail, origem).
2. Responder no próprio dia (pelo telefone, WhatsApp ou comercial@) e registar na ficha o que foi dito: nota, chamada ou mensagem. Definir a **próxima ação** e a data.
3. Mudar o estado: Novo → Contactado → Demonstração → Proposta. Perdido pede sempre o motivo.
4. À semana, abrir o Funil e tratar os cartões com a ação vencida e as propostas a expirar.

**Confirmar:** o lead tem estado, último contacto e próxima ação atualizados.

---

### P-22 · Preparar e enviar uma proposta (briefing e PDF)

**Quando:** depois da conversa com a barbearia. **De:** comercial@.

1. Na ficha do lead, abrir o **Briefing** e preencher os sete passos (N.4) durante ou logo a seguir à conversa. Os números do passo 3 são estimativas e assim aparecem na proposta.
2. Conferir o plano recomendado e o preço (com e sem IVA) no passo 5. Se a barbearia é piloto, escrever as condições de lançamento no passo 6.
3. **Gerar proposta**, abrir o PDF e ler-o inteiro (nome, NIF, valores, validade).
4. Enviar o PDF por e-mail ou WhatsApp (o ecrã dá o texto pronto) e carregar em **Marcar como enviada**: só então começa a validade.
5. Quando a barbearia responder, marcar **Aceite** ou **Recusada** (com motivo). Se for preciso mudar algo, gerar uma versão nova: a enviada nunca se edita.

**Confirmar:** a proposta está «enviada» com a data de validade e o lead no estado Proposta.

---

### P-23 · Gerar o contrato, assinar e converter em adesão

**Quando:** a proposta foi aceite. **Pré-requisito:** existe um modelo de contrato **aprovado** (N.8) com parecer jurídico.

0. Só da primeira vez (ou quando o jurista rever o texto): em `Admin → Gestão do negócio → Comercial → Modelos`, **Importar o rascunho base** de cada tipo (vem de `docs/comercial/`), ler a pré-visualização, corrigir no rascunho se for preciso e **Aprovar**. O aprovado anterior fica arquivado; para mudar um aprovado, «Nova versão a partir desta».
1. Na ficha do lead, secção **Contratos**, confirmar os dados do contratante (vêm do briefing): firma, NIF, morada, representante, cargo, e-mail e data de início. **Gerar contrato.**
2. Abrir o PDF, ler-o e enviá-lo; **Marcar como enviado**.
3. Assinar fora do sistema (Chave Móvel Digital ou impressão e digitalização). Receber o PDF assinado.
4. **Registar assinatura**: data e PDF assinado. O lead passa a Ganho.
5. **Criar convite de adesão** e enviar a ligação ao dono (copiar ou abrir o WhatsApp com o texto pronto): o formulário abre preenchido e ele completa o resto. A ligação só aparece uma vez, vale 14 dias e serve uma só vez; se se perder, criar outra (a anterior deixa de valer).
6. Quando o pedido chegar, seguir o P-03. Na aprovação, o contrato fica ligado à barbearia.

**Confirmar:** contrato «assinado» com PDF, lead «ganho», pedido de adesão ligado ao contrato.

---

### P-24 · Apagar leads antigos

**Quando:** todos os meses, no dia 1. **Disponível a partir da Fase 3B.**

1. Em `Admin → Comercial → Leads`, no fim da lista, **Apagar leads inativos (12 meses)** e confirmar. Só se apagam os leads sem contacto há mais de 12 meses, que não estão ganhos nem têm contrato (a base de dados confere).
2. Anotar quantos foram apagados (o ecrã diz o número).
3. Para um pedido de apagamento de um lead, ver o P-12.

**Confirmar:** o número apagado está registado na auditoria.

---

### P-25 · Lembrar uma barbearia do vencimento (WhatsApp ou e-mail)

**Quando:** uma vez por semana, ou quando o alerta do painel geral mostrar vencimentos próximos. **Disponível a partir da Fase 3C.**

1. `Admin → Finanças → Vencimentos`: o filtro «próximos 7 dias» mostra quem vence; «em atraso» mostra quem já venceu.
2. Escolher a barbearia e ler o texto proposto (muda com os dias que faltam). Corrigir o que for preciso.
3. **WhatsApp:** carregar em «WhatsApp», enviar a mensagem na conversa que abre e voltar para carregar em «Confirmei o envio».
4. **E-mail:** carregar em «E-mail». O sistema envia de apoio@ no momento e mostra «enviado» ou «falhou». Se falhar, tentar de novo ou usar o WhatsApp.
5. Em atraso, seguir os escalões da P-09 (7 dias, 15 dias, 30 dias com aviso escrito).
6. Quando o dinheiro entrar, registar o recebimento (P-08).

**Confirmar:** a linha mostra a data do último lembrete e o estado «confirmado» ou «enviado». Sem WhatsApp ou e-mail na ficha da barbearia, o sistema recusa: completar a ficha primeiro.

---

### P-26 · Registar custos e contas a pagar, rever o resumo e o objetivo

**Quando:** no início de cada mês. **Disponível a partir da Fase 3C.**

1. `Admin → Gestão do negócio → Finanças → Custos e contas`: confirmar os custos fixos ativos e acrescentar os novos (valor **sem IVA**, em euros). Da primeira vez, «Carregar os custos de partida (L.6)» e corrigir cada valor pela fatura. Quando um serviço muda de plano (por exemplo, Vercel Hobby → Pro), «Dar fim hoje» no antigo e criar o novo.
2. Carregar em «Gerar as contas do próximo mês» e conferir os valores com as faturas dos fornecedores.
3. «Marcar paga hoje» nas contas pagas (ou editar a conta para outra data).
4. Abrir o **Resumo**: ler receita recorrente, custos, lucro estimado e lucro de caixa; verificar o que está em atraso.
5. Em **Objetivo e previsões**: definir ou ajustar o objetivo do mês, rever os pressupostos e anotar quantas barbearias faltam.

**Confirmar:** nenhuma conta vencida por pagar sem motivo, e a meta do mês definida.

---

### P-27 · Exportar os números para o contabilista

**Quando:** no fim de cada mês ou trimestre. **Disponível a partir da Fase 3C.**

1. `Admin → Finanças → Exportar`, escolher o período.
2. Descarregar o CSV (abre no Excel) e o PDF de resumo.
3. Enviar ao contabilista por e-mail (geral@). Os ficheiros dizem «Não é documento fiscal»: as faturas continuam a ser as do programa certificado.

**Confirmar:** a exportação aparece na auditoria.

---

### P-28 · Monitorizar a disponibilidade (objetivo de 99,5 %)

**Quando:** uma vez, para ligar; depois, no início de cada mês, para registar o valor do mês anterior. **Porquê:** os Termos e o contrato prometem um objetivo de 99,5 % por mês (cerca de 3 h 40 min de falha, no máximo), e o jurista pediu que só se publique o que se consegue medir (D-156).

1. Criar uma conta gratuita num serviço de monitorização com relatório mensal de disponibilidade (por exemplo, UptimeRobot ou Better Stack), com o e-mail geral@instabarber.pt.
2. Criar três verificações HTTP, de 5 em 5 minutos, a partir de um ponto na Europa:
   - `https://instabarber.pt/api/saude` (responde 200 só quando a aplicação **e** a base de dados funcionam; 503 quando não);
   - `https://instabarber.pt/entrar` (a entrada da equipa);
   - a página pública de uma barbearia de ensaio, quando existir.
3. Avisos por e-mail para apoio@ e por telemóvel ao fim de 2 falhas seguidas.
4. Não marcar como falha as manutenções comunicadas com antecedência: no serviço, pôr a janela de manutenção antes de começar.
5. No início de cada mês, anotar a disponibilidade do mês anterior (e as falhas, com a causa) numa nota interna. Se ficar abaixo de 99,5 %, rever a causa e, se a falha foi da Performa LAB, avisar as barbearias afetadas.

**Confirmar:** as três verificações estão verdes e chega um e-mail de teste do serviço.

