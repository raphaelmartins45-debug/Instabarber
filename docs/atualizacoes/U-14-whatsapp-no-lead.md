# U-14 · Botão de WhatsApp no cartão do lead

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo |
| **Depende de** | Fase 3B |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 0,5 dia |

## Quando se faz
Quando o dono quiser falar com o lead com um toque, a partir do funil.

## Decisões do dono necessárias
O texto da mensagem inicial (por omissão: «Olá <nome>, aqui é da InstaBarber. Recebemos o teu pedido de contacto. Falamos hoje?»; assinatura «InstaBarber · Performa LAB», D-44).

## O que muda (partes do sistema)
Cartão e ficha do lead (Comercial, Parte N): botão que abre `wa.me/<telemóvel do lead>` com a mensagem preparada. Segue a regra 7: **o sistema prepara e abre; o envio é confirmado à mão** («Confirmei o envio» regista). O evento entra no histórico do lead com os tipos de evento já existentes, acrescentando `whatsapp_aberto` e `whatsapp_confirmado`.

## Passos
1. Ler a N (leads, histórico) e `lib/regras/mensagens.ts` (montagem do `wa.me`).
2. Acrescentar os tipos de evento por migração em tempos (README, protocolo 2).
3. Botão e confirmação; nunca dar como enviado sem confirmar.
4. Testes: número em E.164 sem «+» na ligação; o histórico regista abrir e confirmar.

## Verificação
Abrir o botão numa ficha de ensaio abre o WhatsApp com o texto certo; sem confirmação, o estado não muda.

## Reversão
Remover o botão; os eventos já gravados ficam inofensivos.

## Registo
PROGRESSO, manual (P-21).
