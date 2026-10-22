# Fase 2 — Autenticação e papéis

| | |
| --- | --- |
| **Foco** | Autenticação e papéis |
| **Resultado verificável** | Cinco papéis a entrar, cada um no seu painel; convite do barbeiro; código de acesso do cliente; 2FA do super_admin; uma conta em duas barbearias. |
| **Dias estimados** | 4 |

## Ler nesta fase

Lê **apenas** isto. Não leias o documento mestre.

- `CLAUDE.md` (todo)
- `docs/parte-b-arquitetura-tecnica.md` — B.6
- `docs/parte-c-modelo-de-dados.md` — C.5
- `docs/parte-d-planos-funcionalidades-e-pacotes.md` — D.3 (quem liga, o que sai)
- `docs/parte-e-especificacao-das-quatro-camadas.md` — E.3 (registo do barbeiro) e E.4 (acesso à área de cliente)
- `docs/parte-f-regras-de-negocio.md` — F.6 e F.9
- `docs/parte-l-publicacao-dominios-e-custos.md` — L.4
- `docs/parte-a-contexto-e-visao-do-produto.md` — A.3

## Antes de começar

Apresenta o resumo do que vais construir, os ficheiros que vais criar e o que **não** vais fazer nesta fase. Espera pela minha confirmação antes de escrever código.

## O que construir

- [ ] Entrada da equipa (e-mail e palavra-passe), recuperação por e-mail, definir palavra-passe por convite.
- [ ] Resend como SMTP do Supabase Auth (pede a chave se faltar).
- [ ] 2FA TOTP do super_admin: inscrição e exigência de `aal2` nas rotas `/admin`.
- [ ] Acesso do cliente por código: ecrã de pedido, «Pedidos de acesso» com o botão wa.me, rota `api/acesso` com a chave de serviço e conta técnica por barbearia.
- [ ] `middleware.ts` com a resolução do inquilino da L.4 e a proteção das camadas; `/admin` só no domínio principal (404 nos endereços das barbearias).
- [ ] `lib/funcionalidades`: chaves ativas do inquilino e menus montados a partir delas; verificação no servidor.
- [ ] Troca de barbearia para quem tem perfis em várias.
- [ ] Limites de pedidos com `consumir_limite()` nas entradas públicas.

## Verificação

- [ ] Testes Playwright: os cinco papéis entram e cada um vê só o seu painel; `/admin` num subdomínio de barbearia responde 404.
- [ ] Convite do barbeiro de ponta a ponta.
- [ ] Código de acesso do cliente de ponta a ponta, incluindo código errado e expirado.
- [ ] Super_admin sem 2FA não entra em `/admin`.

## No fim da fase

Corre `npm run typecheck`, `lint`, `test`, `test:sql` e `build` sem erros. Mostra o resultado verificável, atualiza o `PROGRESSO.md` e espera pela minha confirmação antes da fase seguinte.
