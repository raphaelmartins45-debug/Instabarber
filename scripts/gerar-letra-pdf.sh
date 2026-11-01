#!/usr/bin/env bash
# Gera lib/pdf/letra-inter.ts: a Inter (a letra da landing e da aplicação, Parte I), em três pesos,
# reduzida aos carateres do português e embutida em base64 para os PDFs (D-184). A Inter tem a
# licença SIL Open Font License, que permite embuti-la. Descarrega-a da Google Fonts e reduz com o
# pyftsubset (fonttools, num ambiente Python temporário; não é dependência do projeto).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
python3 -m venv "$tmp/py" >/dev/null && "$tmp/py/bin/pip" -q install fonttools >/dev/null
saida=lib/pdf/letra-inter.ts
{
  echo "// Gerado por scripts/gerar-letra-pdf.sh. Não editar. Inter: SIL Open Font License 1.1."
  echo "// Reduzida aos carateres do português, em base64, para os PDFs (D-184)."
  for peso in 400 700 800; do
    url=$(curl -s -A "" "https://fonts.googleapis.com/css2?family=Inter:wght@$peso" | grep -o "https://[^)]*" | head -1)
    curl -s -o "$tmp/$peso.ttf" "$url"
    "$tmp/py/bin/pyftsubset" "$tmp/$peso.ttf" --output-file="$tmp/$peso-sub.ttf" --layout-features='' \
      --no-hinting --desubroutinize \
      --unicodes="U+0020-007E,U+00A0-00FF,U+0152-0153,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2192,U+2212"
    echo ""
    echo "export const INTER_${peso} = \"$(base64 -w0 "$tmp/$peso-sub.ttf")\";"
  done
} > "$saida"
rm -rf "$tmp"
echo "Gerado: $saida"
