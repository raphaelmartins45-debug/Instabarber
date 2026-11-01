#!/usr/bin/env bash
# Gera lib/pdf/logos-marca.ts: os logótipos oficiais (public/marca) reduzidos e embutidos em base64,
# para os PDFs os desenharem sem ler ficheiros nem fazer pedidos (D-184). Precisa do ImageMagick.
# Correr de novo sempre que um destes logótipos mudar.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
saida=lib/pdf/logos-marca.ts
{
  echo "// Gerado por scripts/gerar-logos-pdf.sh a partir de public/marca. Não editar à mão."
  echo "// Logótipos horizontais oficiais (D-106), reduzidos a 600 px, em PNG base64 (D-184)."
  echo ""
  echo "/** Largura sobre altura, para desenhar sem deformar. */"
  for nome in preto dourado branco; do
    convert "public/marca/logo-horizontal-$nome.png" -resize 600x -strip -colors 48 \
      -define png:compression-level=9 "$tmp/$nome.png"
    proporcao=$(identify -format "%[fx:w/h]" "$tmp/$nome.png")
    echo "export const LOGO_${nome^^} = {"
    echo "  proporcao: ${proporcao},"
    echo "  dados: \"$(base64 -w0 "$tmp/$nome.png")\","
    echo "};"
  done
} > "$saida"
rm -rf "$tmp"
echo "Gerado: $saida"
