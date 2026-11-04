# Cartão oferta comprado na página pública («Compre aqui») — por fazer

Pedido do dono a 04/11/2026 (D-206). **Não se constrói agora.** Quando o dono mandar avançar, entra
no lugar do botão «Fale connosco» do bloco do cartão oferta, no fim da página pública
(`components/publico/bloco-cartao-oferta.tsx`). Tudo só existe com a funcionalidade
`cartoes_oferta` ligada pelo gestor.

## Como funciona (pedido do dono)

1. **Escolher.** O cliente toca em «Compre aqui» (ou no cartão que aparece como produto na loja) e
   abre uma página simples onde:
   - escolhe o **valor** — no mínimo o preço do serviço mais barato ativo da barbearia;
   - escreve o **nome de quem recebe** (e o seu, de quem oferece);
   - escolhe a **cor do cartão**.
2. **Confirmar.** Vê o resumo e confirma. O pedido fica registado como **por pagar** (nada é
   cobrado pela plataforma; CLAUDE.md §3).
3. **Pedir as instruções de pagamento.** Aparece logo «Enviar no WhatsApp», com a mensagem pronta
   para a barbearia (valor, para quem, de quem, código do pedido), a pedir as instruções de
   pagamento. Envio confirmado à mão (regra 7).
4. **Aprovar no painel.** O gestor vê «Cartão oferta para aprovar» (no Início, em «Precisa de
   atenção», e na Gestão do sistema → Cartões oferta). Quando recebe o dinheiro, carrega em
   **«Pago»**: o cartão passa a válido (usa o `vender_cartao_oferta` que já existe, com o código de
   oito caracteres e a validade de um ano).
5. **Enviar o cartão.** Depois de pago, aparece «Enviar cartão por WhatsApp»: gera a **imagem do
   cartão** e prepara a mensagem para quem comprou.

## A imagem do cartão

- **Para:** nome de quem recebe · **De:** nome de quem oferece.
- O valor, o **código**, o logótipo da barbearia, as instruções curtas («Apresente este código ao
  balcão; vale em qualquer serviço até dd/mm/aaaa»), a morada e o telefone ou WhatsApp.
- «Não é documento fiscal» (CLAUDE.md §3).
- Desenho moderno, na cor escolhida, a partir das skills **UI/UX Pro Max** e **taste**; formato
  vertical para o telemóvel (1080 × 1350) e um PNG partilhável.

## Sugestões para correr bem (minhas, para o dono decidir)

- **Valores rápidos:** botões com três valores sugeridos (o serviço mais barato, o mais pedido e
  um redondo, p. ex. 50 €), além do valor livre; máximo de 500 € para evitar erros.
- **Mensagem pessoal opcional** (até 140 caracteres) impressa no cartão.
- **Quando entregar:** «Enviar já» ou numa data (aniversário) — a barbearia vê a data no pedido e
  prepara o envio nesse dia.
- **Pedido com prazo:** se não for pago em 7 dias, cai sozinho e a barbearia deixa de o ver como
  pendente.
- **Proteção do código:** o código só aparece depois de «Pago»; nunca na página de compra.
- **Cartão também como produto na loja:** um cartão na montra com «Escolher valor», que abre a
  mesma página.
- **Saldo à vista:** quem recebe pode consultar o saldo com o código numa página simples (só o
  saldo e a validade, sem dados pessoais).
- **Relatório:** cartões vendidos online contam à parte no relatório do mês.
- **Base de dados:** uma tabela de pedidos de cartão (valor, de, para, cor, mensagem, data de
  envio, estado por_pagar → pago → enviado / caducado), com RLS como os pedidos da loja, e a
  validação do valor mínimo numa função SQL (regra 4 do CLAUDE.md), com testes.
