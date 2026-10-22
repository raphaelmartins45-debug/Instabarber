# Fases

Nove fases, de 0 a 8. Cada fase termina com um resultado verificável e não se
avança sem ele confirmado pelo dono.

| Fase | Foco | Resultado verificável | Dias |
| --- | --- | --- | --- |
| 0 | Preparação | Repositório com o `package.json` da B.3, `npm audit` sem vulnerabilidades altas, `.env*` no `.gitignore`, deploy em branco na Vercel. | 2 |
| 1 | Base de dados | Esquema de `docs/esquema` aplicado no Supabase local e no projeto de ensaio; os 389 testes SQL a passar; tipos gerados. | 2 |
| 2 | Autenticação e papéis | Cinco papéis a entrar, cada um no seu painel; convite do barbeiro; código de acesso do cliente; 2FA do super_admin; uma conta em duas barbearias. | 4 |
| 3 | Administração e adesão | Uma barbearia criada de ponta a ponta pela interface: formulário, pedido, aprovação, pacote, convite do dono, importação CSV. | 6 |
| 4 | Painel da barbearia | O dia a dia gerido no sistema: agenda ao balcão, clientes, radar, ficha técnica, ausências, equipa, financeiro, comissões e acertos, Gestão do sistema, O meu plano. | 10 |
| 5 | Motor de agenda e cliente | Um cliente entra pela página pública e marca sem conta; duas reservas simultâneas não ocupam o mesmo horário; política de faltas; área de cliente. | 7 |
| 6 | Mensagens, módulos e relatório | Mensagens abertas e registadas; e-mails de confirmação; filas; clube, loja e cartões oferta do lado público; relatório mensal; módulos de pagamentos e faturação desligados e invisíveis. | 11 |
| 7 | Publicação | Produção com domínio, HTTPS, subdomínios, cópias de segurança e documentos legais publicados. | 3 |
| 8 | Operação | Barbearia real em uso, rotina de operação em curso, restauro testado. | 2 |
| | **Total** | | **47** |

**Extensões:** a [Fase 3B](fase-3b.md) (Comercial: CRM, propostas e contratos, Parte N, 6 dias) e a [Fase 3C](fase-3c.md) (Finanças da Performa LAB, Parte O, 5 dias) entram depois da Fase 3, fora dos 47. A [Fase 9](fase-9-manuais.md) (manuais operacionais, 7 dias) é a última e só começa depois da Fase 8.

## Ficheiros

- [`fase-0.md`](fase-0.md) — Preparação
- [`fase-1.md`](fase-1.md) — Base de dados
- [`fase-2.md`](fase-2.md) — Autenticação e papéis
- [`fase-3.md`](fase-3.md) — Administração e adesão
- [`fase-3b.md`](fase-3b.md) — Comercial (extensão, depois da Fase 3)
- [`fase-3c.md`](fase-3c.md) — Finanças da Performa LAB (extensão, depois da 3B)
- [`fase-4.md`](fase-4.md) — Painel da barbearia
- [`fase-5.md`](fase-5.md) — Motor de agenda e cliente
- [`fase-6.md`](fase-6.md) — Mensagens, módulos e relatório
- [`fase-7.md`](fase-7.md) — Publicação
- [`fase-8.md`](fase-8.md) — Operação
- [`fase-9-manuais.md`](fase-9-manuais.md) — Manuais operacionais (final, depois da Fase 8)
- [`criterios-de-aceitacao.md`](criterios-de-aceitacao.md) — critérios globais (cópia da J.1)

## Mapa de manutenção

Cada fase termina com o `docs/mapa-do-sistema.md` atualizado (CLAUDE.md, regra 15), para que, com o sistema no ar, qualquer pedido de alteração se resolva sem reexplorar o código.

## Regra de economia

Cada fase lê só as secções que lhe são indicadas. Os ficheiros das fases não
copiam texto das Partes: apontam para ele. Assim, uma correção numa Parte vale
logo para todas as fases.
