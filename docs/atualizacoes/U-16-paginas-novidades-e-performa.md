# U-16 · Páginas «Novidades» e «Performa LAB»

| | |
| --- | --- |
| **Estado** | Pronto |
| **Risco** | Baixo |
| **Depende de** | Fase 7 |
| **Conflita com** | U-15 (opcional) |
| **Tempo estimado** | 1 dia |

## Quando se faz
Quando o dono quiser mostrar movimento (novidades) e a Performa LAB como estúdio criativo.

## Decisões do dono necessárias
O texto e as novidades iniciais. **Sem nome pessoal do dono** (D-44) e sem prometer o que não existe.

## O que muda (partes do sistema)
Duas rotas estáticas na aplicação (`app/(publico)/novidades`, `app/(publico)/performa-lab`), textos em `lib/i18n/`, sem base de dados. Ligações no rodapé. `sitemap` atualizado.

## Passos
1. Páginas com a identidade da Parte I; mobile primeiro.
2. Novidades: lista de itens datados, mais recente primeiro; cada item verificável (nunca anunciar o que não está no ar).
3. Correr `scripts/auditar-landing.py` adaptado às rotas novas.

## Verificação
Páginas sem erros, sem scroll horizontal, em português de Portugal, sem nome pessoal.

## Reversão
Remover as rotas e as ligações.

## Registo
PROGRESSO, manual (quem atualiza as Novidades e quando).
