#!/usr/bin/env bash
# Gera lib/pdf/imagens-folheto.ts: a página pública no telemóvel tal como aparece na landing
# (landing/index.html), capturada pelo Playwright e embutida em JPEG base64 para o folheto (D-184).
# Precisa do Playwright (dependência de ensaios) e do ImageMagick. Correr de novo se a landing mudar.
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
node -e '
const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto("file://" + process.argv[1], { waitUntil: "load" });
  await p.waitForTimeout(1500);
  await (await p.$(".pub")).screenshot({ path: process.argv[2] });
  await b.close();
})();
' "$PWD/landing/index.html" "$tmp/telemovel.png"
convert "$tmp/telemovel.png" -resize 640x -strip -quality 82 "$tmp/telemovel.jpg"
saida=lib/pdf/imagens-folheto.ts
{
  echo "// Gerado por scripts/gerar-imagens-folheto.sh a partir de landing/index.html. Não editar."
  echo "// A página pública no telemóvel, como na landing, em JPEG base64 (D-184)."
  echo ""
  echo "export const TELEMOVEL = {"
  echo "  proporcao: $(identify -format "%[fx:w/h]" "$tmp/telemovel.jpg"),"
  echo "  dados: \"$(base64 -w0 "$tmp/telemovel.jpg")\","
  echo "};"
} > "$saida"
rm -rf "$tmp"
echo "Gerado: $saida"
