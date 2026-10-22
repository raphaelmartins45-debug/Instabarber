## Parte A · Contexto e visão do produto

O InstaBarber é uma plataforma SaaS multi-inquilino que serve barbearias, operada
pela Performa LAB. Cada barbearia recebe uma aplicação web com a sua própria
marca, com níveis de acesso distintos, e o cliente final dessa barbearia acede
por telemóvel sem instalar nada.

### A.1 · O problema que resolve

- O barbeiro guarda centenas de clientes na memória e no telefone, mas não sabe quem parou de aparecer. Cada cliente perdido é receita parada, sem que ele tenha como medir o tamanho dessa perda.
- Os marketplaces de beleza cobram comissões de 20 a 25 por cento sobre clientes novos, além da subscrição, o que pesa no estabelecimento pequeno.
- Os sistemas de agenda existentes oferecem calendário e contactos, mas raramente transformam o dado em ação comercial — não mostram quanto dinheiro está parado, nem escrevem a mensagem que o traz de volta.
- O estabelecimento independente não tem orçamento para uma agência, e o resultado é conteúdo fraco, sem fotografia profissional e sem presença digital consistente.

### A.2 · A proposta

O InstaBarber entrega à barbearia uma aplicação com a sua marca, que faz três
coisas que o mercado não junta: identifica automaticamente os clientes em risco
de se perderem, calcula em euros quanto isso representa, e escreve a mensagem
que os convida a voltar. A isso acrescenta a gestão do dia — agenda, equipa,
comissões, despesas e objetivos — e uma página pública que o cliente final usa
para marcar sem telefonar.

As mensagens abrem-se por ligação direta ao WhatsApp, sem intermediários e sem
custo por mensagem. É uma decisão deliberada de produto: mantém o serviço
acessível a um estabelecimento pequeno e evita uma despesa variável que cresce
com o sucesso.

Sem comissões sobre clientes, sem custo por mensagem, preço fixo por plano.

### A.3 · As quatro camadas: nomes e endereços

| Camada | Nome no produto | Para quem | Função principal |
| --- | --- | --- | --- |
| 1 | **InstaBarber Admin** | Performa LAB | Aprovar barbearias, configurar, ligar funcionalidades, registar pagamentos |
| 2 | **InstaBarber Gestão** | Dono / gestor da barbearia | Agenda, clientes, equipa, financeiro, comunicações e Gestão do sistema |
| 3 | **InstaBarber Equipa** | Cada barbeiro | A agenda, os clientes, a faturação e as metas dele |
| 4 | **Página pública** e **Minha área** | Cliente da barbearia | Marcar, ver serviços, selos, histórico, clube e contactos |

As camadas distinguem-se pelo papel do utilizador autenticado e pelas políticas
de acesso da base de dados, nunca por aplicações separadas.

#### Como cada um chega lá

| Quem | Link direto | Pela página pública da barbearia | Entra com |
| --- | --- | --- | --- |
| Performa LAB | `instabarber.pt/admin` (só no domínio principal) | Nunca | E-mail, palavra-passe e 2FA |
| Dono | `instabarber.pt/app`, ou o endereço da barbearia + `/app` | «Entrar → Sou o gestor» | E-mail e palavra-passe |
| Barbeiro | O mesmo `/app`; abre a área dele (`/app/equipa/[id]`) | «Entrar → Sou o barbeiro» | E-mail e palavra-passe |
| Cliente | O endereço da barbearia; a área dele em `…/minha-area` | «Entrar → Sou cliente» | Telemóvel e palavra-passe (marcar não exige entrar) |

- **O endereço da barbearia** tem três formas (L.3): `instabarber.pt/barbearia-central`, `barbearia-central.instabarber.pt` ou um domínio próprio.
- **O dono e o barbeiro usam o mesmo ecrã de entrada.** O sistema identifica o papel pelo perfil e abre o painel certo. Quem tem perfis em várias barbearias escolhe em qual entra.
- **O InstaBarber Admin só existe no domínio principal.** Em qualquer endereço de barbearia (subdomínio ou domínio próprio), `/admin` responde «página não encontrada». O link não está publicado em lado nenhum (DECISOES D-33).
- **A Minha área tem a marca da barbearia.** O cliente vê o logótipo, a cor e o nome da barbearia; o InstaBarber aparece só numa linha discreta no rodapé.
- Os nomes vivem em `lib/vertical/barbearia.ts`, como todo o texto dos painéis.

### A.4 · Visão futura — Insta Beauty (não é requisito de construção)

A arquitetura é deliberadamente vertical-agnóstica. O núcleo comum —
autenticação, agenda, clientes, fidelização, mensagens, objetivos e financeiro —
serve qualquer negócio de serviços com marcação. O que muda entre verticais é
configuração e apresentação.

A segunda marca prevista, Insta Beauty, dirige-se numa fase futura a estúdios de
estética, cabeleireiras e nail designers. Fica fora da versão 1. Quando avançar,
exigirá:

- Vocabulário: «serviço» passa a «tratamento», «profissional» a «técnica», «corte» a «sessão».
- Catálogo por categorias: cabelo, unhas, estética facial, estética corporal, depilação, massagem.
- Gestão de recursos e salas, não apenas de profissionais.
- Fidelização por pacotes de sessões e cartões de valor.
- Preços por zona do corpo e por combinação de tratamentos.
- Consentimento de imagem para publicações de antes e depois.
- Histórico de preferências: produtos, sensibilidade, tonalidade formulada.
- Lembretes de manutenção por periodicidade do tratamento.

**Regra de implementação, já na versão 1:** o núcleo não contém vocabulário de
barbearia. Os rótulos vivem em `lib/vertical/barbearia.ts`, e o campo
`inquilinos.vertical` determina que conjunto de rótulos a aplicação carrega.
