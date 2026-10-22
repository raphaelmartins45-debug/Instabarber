# U-01 · Login do cliente por código por e-mail e lido pelo barbeiro

| | |
| --- | --- |
| **Estado** | Pronto após decisões |
| **Risco** | Alto |
| **Depende de** | Fases 2 e 5 |
| **Conflita com** | U-02 (o SMS usa a mesma estrutura de canais; fazer esta primeiro) |
| **Tempo estimado** | 1 a 2 dias |

## Quando se faz
Se o piloto mostrar clientes que querem conta mas não recuperam a palavra-passe (sem WhatsApp). Decisão de 21/10/2026: **não mudar agora**; esta é a primeira opção se for preciso.

## Decisões do dono necessárias
1. A palavra-passe fica como **opção** ou **deixa de existir** (login só por código)?
2. O código por e-mail é para qualquer cliente com e-mail na ficha, ou só depois de o confirmar uma vez?
3. O texto do e-mail (assinatura «InstaBarber · Performa LAB», remetente apoio@).

## O que muda (partes do sistema)
- **Esquema** (`docs/esquema/`, primeiro lá, com testes): canal do código (`whatsapp`, `email`, `balcao`) na tabela dos códigos de acesso; o e-mail do cliente tem de estar em `clientes`. Funções do código de acesso (geração, verificação, `pode_criar_acesso_direto()`): aceitar o canal. Mantêm-se 6 dígitos, 15 minutos, 5 tentativas e 3 pedidos por hora (D-06), com `consumir_limite()`.
- **Servidor**: rota de envio do código por e-mail (Resend, `lib/email/`, nunca agendada); ecrã **«Código de acesso do cliente»** no painel do gestor, que mostra o código para ser dito ao balcão (canal `balcao`).
- **Página pública e área de cliente**: «Entrar» passa a oferecer «Receber código por e-mail».
- **Documentos**: Partes B (B.6) e F (F.9), D-06 e D-28, manual do operador, Política de Privacidade (o e-mail do cliente é usado para o código).

## Passos
1. Ler B.6, F.9, D-06, D-28 e o código real de autenticação (Glob/Grep em `lib/supabase`, `lib/repositorios`, funções SQL do código de acesso).
2. Migração em tempos (README, protocolo 2): acrescentar a coluna do canal com valor por omissão `whatsapp`; **não** tocar nos códigos em curso.
3. Funções SQL e testes SQL novos: código por e-mail expira aos 15 min; 5 tentativas; 3 pedidos por hora; um código de uma barbearia **não** entra noutra (isolamento); o e-mail técnico `@clientes.instabarber.pt` (D-06) continua a nunca receber correio.
4. Rota, e-mail e ecrãs, atrás de um interruptor desligado.
5. Playwright: marcar sem conta continua a funcionar; criar acesso por e-mail; recuperar acesso; código dito ao balcão.
6. Ligar o interruptor em ensaio, verificar, e só depois em produção.

## Verificação
Testes SQL de isolamento sem falhas (se falhar, parar tudo). Marcação sem conta intacta. O cliente sem e-mail nem WhatsApp continua a marcar com nome e telemóvel.

## Reversão
Desligar o interruptor (efeito imediato). A coluna do canal fica (inofensiva). Reverter o commit se for preciso.

## Registo
D-NN (substitui em parte a D-06 e a D-28), Partes B e F, PROGRESSO, manual do operador.
