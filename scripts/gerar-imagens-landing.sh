#!/usr/bin/env bash
# Gera lib/pdf/imagens-landing.ts: imagens reais da aplicação tal como aparecem na landing
# (landing/index.html), capturadas pelo Playwright e embutidas em JPEG base64 para os PDFs (D-184):
# a página pública no telemóvel (folheto, guia de arranque) e a agenda (guia do barbeiro).
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
  await (await p.$(".pub")).screenshot({ path: process.argv[2] + "/telemovel.png" });
  const agenda = await p.$("#p-agenda");
  await agenda.scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await agenda.screenshot({ path: process.argv[2] + "/agenda.png" });
  await b.close();
})();
' "$PWD/landing/index.html" "$tmp"
saida=lib/pdf/imagens-landing.ts
{
  echo "// Gerado por scripts/gerar-imagens-landing.sh a partir de landing/index.html. Não editar."
  echo "// Imagens reais da aplicação, como na landing, em JPEG base64 (D-184)."
  for nome in telemovel agenda; do
    convert "$tmp/$nome.png" -resize 720x -strip -quality 82 "$tmp/$nome.jpg"
    echo ""
    echo "export const ${nome^^} = {"
    echo "  proporcao: $(identify -format "%[fx:w/h]" "$tmp/$nome.jpg"),"
    echo "  dados: \"$(base64 -w0 "$tmp/$nome.jpg")\","
    echo "};"
  done
} > "$saida"
rm -rf "$tmp"
echo "Gerado: $saida"
