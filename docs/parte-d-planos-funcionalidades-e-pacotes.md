## Parte D · Planos, funcionalidades e pacotes

Existem dois planos, o Basic e o Pro. O Basic é o produto completo para quem
trabalha sozinho. O Pro acrescenta três ideias: mais do que um profissional
(com metas por barbeiro), a abertura de mensagens pelo sistema (individual de
recuperação, aniversário e avaliação, e todas as mensagens em lote) e os
módulos de receita (clube, loja, QR, preços por período, cartões oferta). O que
cada plano inclui está na grelha D.3, que é a única fonte.

### D.1 · Os planos

| | Basic | Pro |
| --- | --- | --- |
| Mensalidade sem IVA | 19,99 € | 39,00 € |
| Mensalidade com IVA (23 %) | 24,59 € | 47,97 € |
| Plano anual (10 mensalidades) | 199,90 € (245,88 € com IVA) | 390,00 € (479,70 € com IVA) |
| Profissionais incluídos | 1 | 3 |
| Profissional adicional | Não disponível | 10,00 € por mês (12,30 € com IVA), ou 100,00 € por ano, a partir do 4.º |
| Domínio próprio (extra) | 5,00 € por mês (6,15 € com IVA), ou 50,00 € por ano | Igual |
| Radar de clientes perdidos | Vê a lista e o valor em euros | Igual, e abre as mensagens |
| Lembrete de marcação | Individual, por wa.me | Individual e em lote |
| Fidelização por selos | Sim | Sim |
| Lista de aniversariantes | Sim | Sim |
| Mensagens de recuperação, aniversário e avaliação | Não (aparece a chamada de upgrade) | Sim, individual e em lote |
| Metas por profissional | Não (aparece a chamada de upgrade) | Sim |

O **preço final** que a barbearia paga é o da linha «com IVA (23 %)»: 24,59 € e
47,97 €. Enquanto a Prestadora estiver isenta de IVA (artigo 53.º do CIVA,
D-45), não se acrescenta IVA: a fatura diz «IVA – Regime de Isenção» e o valor
«sem IVA» é igual ao preço final. Quando passar ao regime normal, o IVA a 23 %
passa a estar incluído no preço final, ou o preço sobe por aviso (contrato,
cláusula 6.3), conforme o dono decidir nessa altura. O regime vem da variável
`PRESTADORA_REGIME_IVA` (`isento` ou `normal`). A Performa LAB fatura fora da
plataforma.

**A regra do upgrade.** No Basic o radar funciona: mostra quem se está a perder
e quanto vale. O que falta é abrir a mensagem que o traz de volta. A chamada de
upgrade fala de tempo e de clientes recuperados, nunca de funcionalidades técnicas.

### D.2 · Texto da chamada de upgrade

```
DISPONÍVEL NO PLANO PRO

No Pro, o WhatsApp abre com a mensagem pronta — o cliente certo, com o nome
e o tempo sem vir já preenchidos — e só tens de carregar em enviar.
Recuperas quem se está a perder sem escrever uma linha.

Com 3 profissionais incluídos e todas as funções ativas.

Passar para o Pro — 39 €/mês (47,97 € com IVA)
```

No radar, onde o número dói, uma chamada mais curta: «42 clientes perdidos ·
630 € a recuperar. As mensagens de recuperação fazem parte do plano Pro.» Os
dois números são sempre calculados, nunca escritos à mão.

A chamada aparece só nas funcionalidades marcadas «Upgrade» na grelha D.3.

### D.3 · Grelha de funcionalidades

#### Quem liga

Só a Performa LAB liga e desliga funcionalidades, no painel de administração.
A barbearia vê, em «O meu plano», o que está incluído e o que não está, em modo
de leitura. A base de dados recusa qualquer escrita da barbearia na grelha.

#### O que acontece quando uma funcionalidade não está ativa

- **«Sai»:** desaparece do painel — menu, ecrã, botão e rota. Quem escrever o endereço à mão recebe erro de acesso. Não fica cinzenta.
- **«Upgrade»:** o botão aparece desativado, com a chamada da D.2. Só nas mensagens e nas metas.
- Desligar não apaga dados. Os registos voltam a aparecer quando se ligar outra vez.
- A verificação faz-se no servidor e na base de dados. O menu de cada painel monta-se a partir das funcionalidades ativas, nunca de uma lista fixa no código (`lib/funcionalidades`).

| Aba do painel | Chave necessária |
| --- | --- |
| Clientes | `gestao_clientes` |
| Agenda | `agenda_basica` |
| Equipa | `painel_profissional` |
| Financeiro | `financeiro_objetivos` |
| Comissões e acertos | `comissoes_acertos` |
| Loja | `loja_produtos` |
| Relatório | `relatorio_mensal` |
| O meu plano | Sempre visível |

#### Os três estados no painel de administração

| Estado | Significado |
| --- | --- |
| No pacote | Vem do plano contratado. Só muda com mudança de plano |
| Bónus | Ligada fora do pacote. Fica em auditoria e não altera o preço |
| Inativa | Desligada. Sai do painel da barbearia (ou mostra o upgrade) |

#### A grelha

Gerada a partir de `docs/esquema/04_dados_iniciais.sql`. A `multilinguagem` não
pertence a nenhum pacote: a Performa LAB liga-a como bónus.

| Chave | Funcionalidade | Grupo | Basic | Pro | Fora do plano |
| --- | --- | --- | --- | --- | --- |
| `agenda_basica` | Agenda e marcações | Operação | Sim | Sim | Sai |
| `gestao_clientes` | Gestão de clientes | Operação | Sim | Sim | Sai |
| `profissionais_adicionais` | Vários profissionais | Operação | Não | Sim | Sai |
| `painel_profissional` | Painel por profissional | Operação | Sim | Sim | Sai |
| `metas_profissional` | Metas por profissional | Operação | Não | Sim | Upgrade |
| `ficha_tecnica` | Ficha técnica do cliente | Operação | Sim | Sim | Sai |
| `politica_faltas` | Política de faltas | Operação | Sim | Sim | Sai |
| `qr_entrada` | Entrada por QR code na loja | Operação | Não | Sim | Sai |
| `pagina_publica` | Página pública | Presença | Sim | Sim | Sai |
| `lembretes_marcacao` | Lembrete individual por WhatsApp | Presença | Sim | Sim | Sai |
| `confirmacao_email` | Confirmação por e-mail | Presença | Sim | Sim | Sai |
| `portfolio_barbeiro` | Portfólio do barbeiro | Presença | Sim | Sim | Sai |
| `pedido_avaliacao` | Pedido de avaliação no Google | Presença | Não | Sim | Upgrade |
| `multilinguagem` | Página em PT, EN e FR | Presença | Não | Não | Sai |
| `clientes_perdidos` | Radar de clientes perdidos | Retenção | Sim | Sim | Sai |
| `envio_mensagens` | Abrir mensagem individual | Retenção | Não | Sim | Upgrade |
| `envio_lote` | Abrir mensagens em lote | Retenção | Não | Sim | Upgrade |
| `campanha_aniversario` | Campanha de aniversário | Retenção | Sim | Sim | Sai |
| `fila_espera` | Fila de espera | Retenção | Não | Sim | Sai |
| `marcacao_rapida` | Repetir o último serviço | Retenção | Sim | Sim | Sai |
| `fidelizacao_selos` | Fidelização por selos | Retenção | Sim | Sim | Sai |
| `financeiro_objetivos` | Painel financeiro | Financeiro | Sim | Sim | Sai |
| `contas_a_pagar` | Contas a pagar | Financeiro | Sim | Sim | Sai |
| `painel_gestao` | Painel de gestão | Financeiro | Sim | Sim | Sai |
| `comissoes_acertos` | Comissões e acertos | Financeiro | Sim | Sim | Sai |
| `relatorios_por_profissional` | Relatórios por profissional | Financeiro | Sim | Sim | Sai |
| `relatorio_mensal` | Relatório mensal | Financeiro | Sim | Sim | Sai |
| `clube_assinatura` | Clube de assinatura | Receita | Não | Sim | Sai |
| `loja_produtos` | Loja de produtos | Receita | Não | Sim | Sai |
| `precos_dinamicos` | Preços por período de ocupação | Receita | Não | Sim | Sai |
| `cartoes_oferta` | Cartões oferta | Receita | Não | Sim | Sai |

### D.4 · Comportamento da grelha

- Na aprovação, `aplicar_pacote()` marca as funcionalidades do plano, com bónus a falso.
- O super_admin pode ligar ou desligar qualquer funcionalidade sem mudar o plano. Fora do plano, grava bónus, fica realçada a dourado e entra em auditoria com autor e data.
- Uma funcionalidade do plano desligada pelo administrador continua no preço e aparece no resumo como «desativada pela Performa LAB».
- O preço segue sempre o plano, o número de profissionais contratados e o domínio próprio, quando existe. Os bónus nunca alteram a mensalidade.
- «Repor pacote» chama `aplicar_pacote()` outra vez.

### D.5 · Cálculo da mensalidade

```
Basic   19,99 € por mês, sempre 1 profissional
Pro     39,00 € por mês, 3 profissionais incluídos
        + 10,00 € por mês por cada profissional a partir do 4.º
Extra   + 5,00 € por mês com domínio próprio, em qualquer plano

extras      = max(0, profissionais − incluídos)
mensalidade = base + extras × valor_por_extra + (domínio próprio ? 5,00 : 0)
anual       = mensalidade × 10
preço final = valor × 1,23, arredondado ao cêntimo (igual em qualquer regime)
regime normal:  sem IVA = valor; IVA = preço final − valor
regime isento:  sem IVA = preço final; IVA = 0

Exemplos (sem IVA / com IVA):
  Basic, 1 profissional ......... 19,99 € / 24,59 €
  Pro, 3 profissionais .......... 39,00 € / 47,97 €
  Pro, 4 profissionais .......... 49,00 € / 60,27 €
  Pro, 5 profissionais .......... 59,00 € / 72,57 €
  Pro, 8 profissionais .......... 89,00 € / 109,47 €
```

O número de profissionais ativos nunca passa o contratado: a base de dados
recusa (gatilho `limitar_profissionais`). Para acrescentar um barbeiro, a
Performa LAB aumenta o número contratado.

### D.6 · O seletor de profissionais no formulário de adesão

- No Basic, o contador fica fixo em 1, com a nota de que o plano admite um profissional.
- No Pro, os botões de mais e menos sobem e descem o número, com o mínimo de 3.
- Por baixo, a conta em linguagem corrente: «3 incluídos + 2 extra a 10,00 € = 20,00 € a mais» (para 5 profissionais).
- A caixa de preço mostra o total com e sem IVA, a periodicidade (mensal ou anual) e a decomposição.
- O número de profissionais e a mensalidade entram no resumo da contratação e na notificação à Performa LAB.

### D.7 · Uma só fórmula em todo o sistema

A fórmula vive em `lib/regras/mensalidade.ts` e é usada pelo formulário, pelo
painel de administração e pelo registo de recebimentos. Trabalha em cêntimos.

```ts
export type Plano = "basic" | "pro";
export type Periodicidade = "mensal" | "anual";

const BASE_CENT: Record<Plano, number> = { basic: 1999, pro: 3900 };
const INCLUIDOS: Record<Plano, number> = { basic: 1, pro: 2 };
const EXTRA_CENT: Record<Plano, number> = { basic: 0, pro: 1000 };
export const DOMINIO_PROPRIO_CENT = 500;
export const TAXA_IVA = 0.23;
export type RegimeIva = "normal" | "isento"; // PRESTADORA_REGIME_IVA (D-45)

export function calcularMensalidadeCent(plano: Plano, nProfissionais: number, dominioProprio = false): number {
  if (plano === "basic" && nProfissionais !== 1) throw new Error("basic_um_profissional");
  if (plano === "pro" && nProfissionais < 2) throw new Error("pro_minimo_dois");
  const extras = Math.max(0, nProfissionais - INCLUIDOS[plano]);
  return BASE_CENT[plano] + extras * EXTRA_CENT[plano] + (dominioProprio ? DOMINIO_PROPRIO_CENT : 0);
}

export function calcularPrecoCent(
  plano: Plano, nProfissionais: number, periodicidade: Periodicidade, dominioProprio = false, regime: RegimeIva = "normal",
) {
  const mensal = calcularMensalidadeCent(plano, nProfissionais, dominioProprio);
  const valor = periodicidade === "anual" ? mensal * 10 : mensal;
  const final = Math.round(valor * (1 + TAXA_IVA)); // o que o cliente paga, em qualquer regime
  return regime === "isento"
    ? { semIva: final, comIva: final, ivaTaxa: 0 }
    : { semIva: valor, comIva: final, ivaTaxa: 23 };
}
```

Duplicar esta fórmula é a forma mais rápida de o sistema começar a cobrar
valores diferentes conforme o ecrã.

### D.8 · O formulário de adesão

Quatro passos: identidade; contactos e horário; serviços e equipa; confirmação
da contratação. Também pergunta o modelo de caixa (F.4.11).

- O pedido grava-se pela rota `api/adesoes`, que aplica o limite por IP e por e-mail e o campo honeypot, e chama `submeter_pedido_adesao()`. Não há modo de demonstração no fluxo de produção.
- O formulário nunca recolhe palavra-passe. A função recusa o pedido se encontrar um campo desses.
- O dono aceita os Termos de Uso, a Política de Privacidade e o Acordo de Subcontratação; a data fica gravada.

#### D.8.1 · Imagens

O logótipo é obrigatório; a fachada e a galeria são opcionais. Carregam-se por
URL assinado criado pela rota.

```
LOGÓTIPO            PNG, SVG ou WEBP · fundo transparente · até 1 MB · mínimo 512 × 512 px · 1
FOTOGRAFIA DE FACHADA  JPG ou WEBP · até 3 MB · mínimo 1600 × 900 px (16:9) · 1
GALERIA             JPG ou WEBP · até 3 MB cada · mínimo 1200 × 800 px · até 6, incluindo a fachada
```

- O fundo transparente da logo é o requisito mais importante. Se vier com fundo branco, o formulário avisa e deixa continuar: explica que vai aparecer um quadrado branco sobre a capa.
- A primeira posição da galeria é sempre a fachada. Sem fachada, a capa usa a cor da logo num gradiente.
- Debaixo do botão de carregamento, uma linha com o essencial; no e-mail de boas-vindas, a instrução completa.

#### D.8.2 · O que acontece quando o dono confirma

```
1. O dono clica em «Enviar para a Performa LAB».
2. O pedido grava-se em pedidos_adesao, com estado pendente. Não se cria conta nenhuma.
3. A Performa LAB recebe um e-mail curto:
     Nova adesão: Barbearia Central · Pro · 3 profissionais · 39,00 € (47,97 € com IVA)/mês · prefere MB WAY
   com a ligação para o separador Pedidos.
4. O administrador abre o pedido e decide:
     Aprovar  → cria o inquilino ativo, aplica a marca e o pacote, cria a conta do dono
     Ajustar  → abre a ficha completa antes de aprovar
     Rejeitar → arquiva com motivo obrigatório e responde por e-mail
5. Na aprovação, o dono recebe o e-mail de boas-vindas com o endereço da
   barbearia e a ligação para definir a palavra-passe.
```

### D.9 · O que está a contratar

O passo final mostra a lista completa do que fica incluído, gerada a partir da
grelha D.3 para o plano escolhido, com o nome do plano e o preço no topo. No
Basic, o que é só do Pro aparece esbatido, com a nota «disponível no Pro». A
lista recalcula quando muda o plano, a periodicidade ou o número de profissionais.

### D.10 · Credenciais de acesso

O formulário recolhe apenas o e-mail de acesso, validado no momento. A conta
do dono cria-se só na aprovação, no Supabase Auth, e o dono define a
palavra-passe pela ligação segura que recebe por e-mail. A aprovação, a
ativação e as falhas ficam em auditoria. Nenhuma conta se considera operacional
antes de o primeiro acesso ter sido testado.

### D.11 · Resumo da contratação

O formulário gera um PDF para o dono guardar: o «Resumo da contratação».

- Contém o contratante, o plano, a periodicidade, o número de profissionais com a decomposição do preço (com e sem IVA), a lista de funcionalidades incluídas e o e-mail de acesso.
- Nunca contém palavra-passe.
- Identidade da Performa LAB: cabeçalho escuro, dourado, paginação no rodapé.
- Leva no rodapé: **«Não é documento fiscal. A fatura é emitida pela Performa LAB pelos seus meios.»**

### D.12 · Fluxo completo da adesão

```
1. A Performa LAB envia a proposta ao dono da barbearia.
2. O dono aceita e recebe a ligação do formulário.
3. Preenche os quatro passos, escolhe o plano, a periodicidade e os profissionais, e confirma.
4. Recebe o resumo da contratação em PDF; a Performa LAB recebe a notificação.
5. O pedido entra no separador Pedidos, pendente.
6. A Performa LAB revê e aprova: inquilino ativo, pacote aplicado, conta do dono criada.
7. O dono define a palavra-passe pela ligação recebida e entra.
8. A Performa LAB importa os clientes e os serviços, se o dono os trouxer de outro sistema (E.1).
```

### D.13 · Preferência de pagamento

No fim do formulário, o dono escolhe como prefere pagar. Não é uma cobrança: diz
à Performa LAB como responder.

| Escolha | O que a Performa LAB faz |
| --- | --- |
| MB WAY | Envia o pedido de pagamento para o número indicado |
| Transferência bancária | Envia o IBAN por e-mail |
| Dinheiro | Combina a entrega em mão |

Não se recolhem dados de cartão nem de conta. A preferência entra no pedido, no
resumo e na notificação, e aparece em destaque no cartão do pedido.
