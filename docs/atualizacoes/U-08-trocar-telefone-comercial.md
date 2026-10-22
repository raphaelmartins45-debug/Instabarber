# U-08 · Trocar o telefone comercial

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo |
| **Depende de** | Fase 0 |
| **Conflita com** | Nenhum |
| **Tempo estimado** | 0,25 dia |

## Quando se faz
Quando o número muda. Hoje: +351 920 084 411.

## Decisões do dono necessárias
O número novo, no formato +351 9XX XXX XXX.

## O que muda (partes do sistema)
- `dados-locais/contactos.env`, `.env.local` e as variáveis da Vercel: `TELEFONE_COMERCIAL` (sem espaços, com +) e `TELEFONE_COMERCIAL_TXT` (com espaços).
- Landing: constantes `PHONE` (só dígitos, com 351) e `PHONE_TXT`.
- Propostas (`modelos_documento`, cabeçalho) e e-mails com o telefone, se existirem.
- Documentos que o mencionem.

## Passos
1. `Grep` pelo número **antigo** (nos dois formatos) em todo o repositório, exceto `.git` e `instabarber-documento-mestre.md`.
2. Substituir; atualizar as variáveis na Vercel e redeployar.
3. Testar que o botão de WhatsApp abre `wa.me/<número novo>` e que o formulário mostra o número novo.

## Verificação
`Grep` pelo número antigo devolve zero resultados; o botão «Falar agora no WhatsApp» abre a conversa com o número novo.

## Reversão
`git revert` e as variáveis anteriores.

## Registo
`dados-locais/contactos.env`, DECISOES se houver motivo relevante.
