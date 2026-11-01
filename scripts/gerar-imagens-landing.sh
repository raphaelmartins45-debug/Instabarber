#!/usr/bin/env bash
# Gera lib/pdf/imagens-landing.ts: imagens reais da aplicação tal como aparecem na landing
# (landing/index.html), capturadas pelo Playwright e embutidas em base64 para os PDFs (D-184):
# a página pública num telemóvel inclinado (folheto, guia de arranque) e a agenda (guia do barbeiro).
# Precisa do Playwright (dependência de ensaios) e do ImageMagick. Correr de novo se a landing mudar.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
node scripts/capturar-landing.mjs "$PWD/landing/index.html" "$tmp"
saida=lib/pdf/imagens-landing.ts
{
  echo "// Gerado por scripts/gerar-imagens-landing.sh a partir de landing/index.html. Não editar."
  echo "// Imagens reais da aplicação, como na landing, em JPEG base64 (D-184)."
  convert "$tmp/telemovel.png" -trim +repage -resize 520x -strip -define png:compression-level=9 "$tmp/telemovel-final.png"
  convert "$tmp/agenda.png" -resize 720x -strip -quality 82 "$tmp/agenda-final.jpg"
  for par in "telemovel:telemovel-final.png:PNG" "agenda:agenda-final.jpg:JPEG"; do
    IFS=: read -r nome ficheiro formato <<< "$par"
    echo ""
    echo "export const ${nome^^} = {"
    echo "  formato: \"$formato\" as const,"
    echo "  proporcao: $(identify -format "%[fx:w/h]" "$tmp/$ficheiro"),"
    echo "  dados: \"$(base64 -w0 "$tmp/$ficheiro")\","
    echo "};"
  done
} > "$saida"
rm -rf "$tmp"
echo "Gerado: $saida"
