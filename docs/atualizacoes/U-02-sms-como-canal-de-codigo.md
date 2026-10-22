# U-02 · SMS como canal de código (extra pago)

| | |
| --- | --- |
| **Estado** | Pronto após decisões |
| **Risco** | Alto |
| **Depende de** | Fases 2 e 5; U-01 recomendada antes |
| **Conflita com** | U-01 (mesma estrutura de canais) |
| **Tempo estimado** | 2 a 3 dias |

## Quando se faz
Só se um cliente do piloto o exigir e o dono aceitar um custo por mensagem. Por defeito, **não** (regra 5; D-06 «não há OTP por SMS»).

## Decisões do dono necessárias
1. Aceitar **abrir uma exceção à regra 5**: o SMS tem custo por mensagem. Quem paga: a barbearia, com créditos comprados, ou a plataforma?
2. Fornecedor de SMS (**fora da stack**: precisa de autorização escrita; avaliar custo por SMS em Portugal, entrega e contrato).
3. Limite diário por barbearia e por número (anti-abuso).

## O que muda (partes do sistema)
- CLAUDE.md §8 e regra de «nenhum custo variável por mensagem»: passam a ter uma exceção escrita, **só** para o código de acesso.
- `lib/sms/` (interface + fornecedor + adaptador simulado para testes), no mesmo padrão dos módulos desligados da G.4, atrás de interruptor por barbearia.
- Esquema: canal `sms` no código de acesso; contador de créditos por barbearia; auditoria de cada envio.
- Chaves do fornecedor só em `.env.local` e no cofre da Vercel. **Se faltarem, parar e pedir.**
- Anti-abuso: limites por IP, por número e por barbearia (`consumir_limite()`), campo honeypot, bloqueio de países/números atípicos se o fornecedor o permitir.

## Passos
1. Fazer a U-01 primeiro (a estrutura de canais já existe).
2. Obter a autorização do fornecedor e as chaves; escrever em `DECISOES.md` a exceção à regra 5.
3. Implementar o adaptador, os créditos e os limites; testes com o adaptador simulado.
4. Interruptor por barbearia, desligado; ligar numa barbearia de ensaio.
5. Observar custos reais durante uma semana antes de abrir a mais barbearias.

## Verificação
Com o interruptor desligado, nada muda (teste). Com ele ligado, um SMS só sai com crédito e dentro dos limites; um pedido em massa para números falsos é bloqueado.

## Reversão
Desligar o interruptor geral. Sem outros efeitos.

## Registo
D-NN com a exceção à regra 5, CLAUDE.md §8, Parte G, custos em Finanças (custo variável novo), manual do operador.
