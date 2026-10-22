# U-09 · Passar o regime de IVA da Prestadora de isento a normal

| | |
| --- | --- |
| **Estado** | Pronto após decisões |
| **Risco** | Médio |
| **Depende de** | Fases 3, 3B e 3C |
| **Conflita com** | U-10 (se se mudarem preços ao mesmo tempo, fazer esta primeiro) |
| **Tempo estimado** | 1 a 2 dias |

## Quando se faz
Quando a Prestadora perder a isenção do art. 53.º do CIVA (por exemplo, ao ultrapassar o limite de volume de negócios) ou optar por sair dela. **O contabilista confirma a data de efeito.**

## Decisões do dono necessárias
1. Data em que o regime normal passa a valer.
2. **Absorver o IVA** (preço final igual: o valor sem IVA passa a ser o final a dividir por 1,23, como a fórmula já faz) ou **subir o preço** (ver U-10).
3. Como avisar as barbearias com contrato em curso (a cláusula 6.4 do contrato prevê o IVA se a isenção cessar).

## O que muda (partes do sistema)
- Variável `PRESTADORA_REGIME_IVA` (`isento` → `normal`), na Vercel e no `.env.local`. A fórmula `calcularPrecoCent(..., regime)` (D.7, `lib/regras/mensalidade.ts`) já trata os dois regimes e **mantém o preço final**.
- `propostas.iva_taxa` (0 ou 23): as propostas novas passam a 23 por esta via; as antigas **não** se tocam (propostas enviadas são imutáveis).
- Contratos: `{{iva_texto}}` e o aviso da cláusula 6.4 para os contratos em curso.
- Finanças (Parte O): os indicadores usam valores sem IVA no regime normal e o valor final no isento; a mudança tem de valer **a partir da data**, sem reescrever o passado.
- Landing e documentos: manter «IVA incluído».

## Passos
1. Ler D-45, D.7, Parte O (notas de IVA) e a cláusula 6.4 do contrato.
2. Confirmar nos testes Vitest de `calcularPrecoCent` que os dois regimes dão o mesmo preço final.
3. Verificar se as Finanças guardam o regime por data; se não, acrescentar por migração em tempos (README, protocolo 2) a data de efeito e aplicar só daí em diante.
4. Mudar a variável em ensaio, gerar uma proposta e um contrato de teste e conferir o texto de IVA.
5. Mudar em produção na data de efeito.
6. Enviar o aviso às barbearias com contrato em curso (modelo no `docs/comercial/`).

## Verificação
Uma proposta nova mostra 23 % com o mesmo preço final; uma antiga continua igual; o Resumo das Finanças não muda o passado.

## Reversão
Repor `PRESTADORA_REGIME_IVA=isento` (só faz sentido antes da data de efeito).

## Registo
D-NN, D-45, CLAUDE.md §6, manual (P-08, P-27), aviso às barbearias.
