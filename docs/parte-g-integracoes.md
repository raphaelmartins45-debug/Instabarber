## Parte G · Integrações

| Serviço | Função | Configuração |
| --- | --- | --- |
| Supabase | Base de dados, autenticação, ficheiros | Região eu-central-1. Chaves em variáveis de ambiente, nunca no repositório |
| Resend | E-mails transacionais | Convites da equipa, boas-vindas, notificação de adesão à Performa LAB, confirmação de marcação ao cliente. Região de envio na UE. Também configurado como SMTP do Supabase Auth |
| WhatsApp por ligação | Comunicação com clientes | `wa.me`, sem API e sem custo. O clique abre o WhatsApp com o texto pronto |
| Google | Mapa e avaliações | Só ligações (Google Maps e página de avaliação). Sem API, sem chave |
| Livro de Reclamações | Obrigação legal | Ligação para o livro eletrónico, configurada por barbearia |
| Pagamentos | Nenhum ativo | Módulo preparado e desligado (G.4) |
| Faturação | Nenhuma ativa | Módulo preparado e desligado (G.4) |

### G.1 · Cobrança da plataforma (registo manual)

A Performa LAB emite as suas faturas fora da plataforma, no seu programa de
faturação certificado, e regista na plataforma o número, o valor e o
recebimento (dinheiro, MB WAY ou transferência). Tabelas: `faturas_plataforma`
e `recebimentos`; o estado vive em `inquilinos.estado_pagamento` e
`proximo_vencimento`, alterados só pelo super_admin.

### G.2 · E-mail (Resend)

| E-mail | Quando | Para quem |
| --- | --- | --- |
| Nova adesão | Pedido submetido | Performa LAB (geral@) |
| Boas-vindas e definir palavra-passe | Pedido aprovado | Dono da barbearia |
| Resposta de rejeição | Pedido rejeitado | Dono da barbearia |
| Convite de barbeiro | Barbeiro registado na Gestão do sistema | Barbeiro |
| Recuperar palavra-passe | Pedido da equipa | Dono ou barbeiro |
| Confirmação de marcação | Marcação confirmada, com e-mail e `confirmacao_email` | Cliente |

Os modelos vivem em `lib/email/`, em português de Portugal. Nenhum leva
palavra-passe. Não há lembrete por e-mail: o lembrete é por WhatsApp (F.7) e a
plataforma não tem tarefas agendadas (DECISOES D-16).

### G.3 · WhatsApp

Regras na F.4.10. A ligação monta-se em `lib/regras/mensagens.ts`, com o
número do cliente em E.164 sem o «+».

### G.4 · Pagamentos e faturação: preparados e desligados

Os dois módulos são construídos e testados na versão 1, mas ficam desligados ao
nível da plataforma e são invisíveis para as barbearias. Nada nas outras
funções depende deles (DECISOES D-01, D-02).

#### Como fica separado do resto

| Camada | Garantia |
| --- | --- |
| Código | Dois módulos isolados, `lib/pagamentos` e `lib/faturacao`. O núcleo chama só uma interface (`registarRecebimento`, `prepararDocumento`). Desligado, a interface usa o adaptador «manual», que faz exatamente o que a versão 1 faz: regista |
| Interruptor | No painel de administração, sem mexer no código: um interruptor geral por módulo (`modulos_plataforma`) e uma ligação por barbearia (`inquilino_modulos`). Desligados por omissão. Toda a alteração fica em auditoria |
| Grelha D.3 | Os módulos **não** entram na grelha: a barbearia vê a grelha em leitura, e o que lá estiver aparece-lhe |
| Base de dados | `pagamentos`, `documentos_fiscais` e `ligacoes_externas` com RLS só para o super_admin. Nenhuma tabela existente depende delas |
| Rotas | `api/webhooks/pagamentos` responde 404 enquanto o módulo estiver desligado |
| Chaves | Nenhuma chave real na versão 1. Os testes usam o adaptador «simulado». O interruptor geral não liga se faltarem as chaves do fornecedor; o painel diz quais faltam |
| Testes | Um teste ponta a ponta prova que, com tudo desligado, adesão, agenda, clube, loja e acertos se comportam como sem o módulo; outro prova que nenhum ecrã da barbearia mostra pagamentos ou faturas |

O código desligado não é código morto (CLAUDE.md, regra 13).

#### Pagamentos (MB WAY)

- Operações: pedido de pagamento, consulta de estado, webhook com verificação de assinatura e idempotência (`pagamentos.id_externo` único), reembolso.
- Finalidades previstas: sinal da marcação, ciclo do clube, mensalidade InstaBarber.
- **O dinheiro tem de chegar a quem fatura**: no modelo A, à conta da barbearia; nos modelos B e C, só se o barbeiro tiver conta própria no fornecedor (`ligacoes_externas` por profissional). A alternativa — a barbearia receber e acertar no fim do mês — mistura dinheiro de quem não fatura e precisa de parecer de um contabilista antes de ser ativada.
- O fornecedor fica atrás de um adaptador (ifthenpay, Eupago ou Stripe). Por escolher (DECISOES D-05). As APIs chamam-se com `fetch`, sem SDK.

#### Faturação

**Quem emite** decide-se por profissional, pelo modelo de caixa, e fica
gravado em cada visita (`visitas.emitente`):

| Modelo | Fatura ao cliente | Documento entre barbeiro e barbearia, que o acerto prepara |
| --- | --- | --- |
| A | A barbearia | O barbeiro independente fatura à barbearia a sua comissão |
| B | O barbeiro | A barbearia fatura ao barbeiro a parte da casa |
| C | O barbeiro | A barbearia fatura ao barbeiro a renda da cadeira |

**Três modos de emissão**, escolhidos na ativação para cada emitente
(`profissionais.modo_emissao`, e o equivalente da barbearia):

1. **Programa certificado ligado** (Moloni ou InvoiceXpress): o emitente liga a sua conta e o documento sai ao concluir o serviço. Os trabalhadores independentes podem usar programa certificado em vez do Portal das Finanças.
2. **Portal das Finanças, à mão**: não se conhece forma oficial de emitir faturas-recibo do Portal por API (a confirmar com o contabilista). O sistema prepara os dados (NIF do cliente, serviço, valor, isenção de IVA quando aplicável), o barbeiro emite no Portal e regista o número; o sistema mostra o que falta emitir (`documentos_fiscais` em «por emitir»).
3. **Nenhum**: tudo como na versão 1.

Dados guardados desde já, invisíveis enquanto o módulo estiver desligado:
regime de IVA e modo de emissão do profissional, emitente de cada visita, NIF
opcional do cliente.

**Certificar o próprio InstaBarber** como programa de faturação (assinatura
encadeada, SAF-T, ATCUD, QR code, comunicação à AT) fica para depois dos 50
clientes (DECISOES D-04).

**Antes de ativar para qualquer barbearia:** parecer de um contabilista
certificado sobre o desenho, porque quem fatura depende do contrato real entre
a barbearia e cada barbeiro.

#### Ativação, quando chegar a altura

1. Contrato com o fornecedor de pagamentos e, por emitente, conta no programa de faturação.
2. As chaves do fornecedor coladas uma vez no painel da Vercel (L.2). É configuração, não código.
3. No painel de administração: ligar o interruptor geral; depois, barbearia a barbearia.
4. Na faturação, a barbearia (ou o barbeiro) liga a sua conta no ecrã que lhe aparece só depois da ativação.
