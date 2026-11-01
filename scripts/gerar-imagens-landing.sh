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
  // O telemóvel com fundo transparente, para servir no folheto preto e no branco.
  await p.addStyleTag({ content: "html,body,section,main,header,.hero,.wrap{background:transparent!important}" });
  await (await p.$(".pub")).screenshot({ path: process.argv[2] + "/telemovel.png", omitBackground: true });
  await p.reload();
  await p.waitForTimeout(1500);
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
  # O telemóvel em PNG (transparente); a agenda em JPEG.
  convert "$tmp/telemovel.png" -resize 720x -strip -colors 160 "PNG8:$tmp/telemovel-final.png"
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
