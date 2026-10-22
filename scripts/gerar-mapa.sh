#!/usr/bin/env bash
# Gera docs/mapa-gerado.md a partir do código real: rotas, chaves de texto, variáveis de cor,
# tabelas, funções SQL e funcionalidades. Nunca editar o resultado à mão.
# Uso: scripts/gerar-mapa.sh [raiz]   (por omissão, a raiz do repositório)
set -euo pipefail
raiz="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$raiz"
saida=docs/mapa-gerado.md
esq=docs/esquema; [ -d supabase/migrations ] && esq=supabase/migrations
{
  echo "# Mapa gerado"
  echo
  echo "Gerado por \`scripts/gerar-mapa.sh\`. **Não editar.** O mapa escrito à mão é \`docs/mapa-do-sistema.md\`."
  echo
  echo "## Rotas (app/)"
  echo
  if [ -d app ]; then
    find app \( -name 'page.tsx' -o -name 'route.ts' \) | LC_ALL=C sort | while read -r f; do echo "- \`$f\`"; done
  else echo "_Ainda não existe \`app/\`._"; fi
  echo
  echo "## Variáveis CSS (app/globals.css)"
  echo
  if [ -f app/globals.css ]; then
    grep -oE '^\s*--[a-z0-9-]+:\s*[^;]+;' app/globals.css | sed -E 's/^\s+//' | while read -r l; do echo "- \`$l\`"; done
  else echo "_Ainda não existe \`app/globals.css\`._"; fi
  echo
  echo "## Textos (lib/i18n)"
  echo
  if [ -d lib/i18n ]; then
    for f in lib/i18n/*.ts; do [ -e "$f" ] || continue; echo "- \`$f\`: $(grep -cE '^\s*[A-Za-z0-9_]+\s*:' "$f") chaves"; done
  else echo "_Ainda não existe \`lib/i18n\`._"; fi
  echo
  echo "## Tabelas"
  echo
  grep -hoE '^create table (public\.)?[a-z_]+' $esq/*.sql 2>/dev/null | sed -E 's/create table (public\.)?//' | LC_ALL=C sort -u | while read -r t; do echo "- \`$t\`"; done
  echo
  echo "## Funções SQL"
  echo
  grep -hoE '^create (or replace )?function (public\.)?[a-z_0-9]+' $esq/*.sql 2>/dev/null | sed -E 's/create (or replace )?function (public\.)?//' | LC_ALL=C sort -u | while read -r t; do echo "- \`$t()\`"; done
  echo
  echo "## Funcionalidades (grelha)"
  echo
  grep -hoE "^\s*\('[a-z_]+'," $esq/*dados_iniciais.sql 2>/dev/null | sed -E "s/^\s*\('//; s/',//" | LC_ALL=C sort -u | while read -r t; do echo "- \`$t\`"; done
} > "$saida"
# Verificação: toda a rota de app/ tem de constar do mapa gerado (falha se não constar)
if [ -d app ]; then
  falta=0
  while read -r f; do grep -qF "\`$f\`" "$saida" || { echo "Rota fora do mapa: $f" >&2; falta=1; }; done < <(find app \( -name 'page.tsx' -o -name 'route.ts' \))
  [ "$falta" = 0 ] || exit 1
fi
echo "Gerado: $saida"
