// Captura imagens da landing para os PDFs (D-184): chamado por scripts/gerar-imagens-landing.sh.
// Argumentos: o caminho de landing/index.html e a pasta de saída.
import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto("file://" + process.argv[2], { waitUntil: "load" });
  await p.waitForTimeout(1500);
  // A página pública dentro de um telemóvel moderno (aro de metal, vidro preto e a ilha no topo,
  // nada desenhado sobre o ecrã), com a mesma inclinação da landing, sobre fundo transparente.
  await p.addStyleTag({
    content: `
      html,body{background:transparent!important}
      body *{visibility:hidden!important}
      .pub,.pub *{visibility:visible!important}
      .pub{position:relative;border:11px solid #000!important;border-radius:54px!important;
        padding:46px 16px 26px!important;box-shadow:0 0 0 2.5px #3a3a3f!important;
        background:#141416!important;overflow:visible}
      .pub::before{content:"";position:absolute;top:12px;left:50%;width:96px;height:28px;
        margin-left:-48px;border-radius:14px;background:#000}
      .pub-top{margin-top:-6px}`,
  });
  await p.waitForTimeout(500);
  const caixa = await (await p.$(".pub")).boundingBox();
  await p.screenshot({
    path: process.argv[3] + "/telemovel.png",
    omitBackground: true,
    fullPage: true,
    clip: {
      x: caixa.x - 80,
      y: caixa.y - 80,
      width: caixa.width + 160,
      height: caixa.height + 160,
    },
  });
  await p.reload();
  await p.waitForTimeout(1500);
  const agenda = await p.$("#p-agenda");
  await agenda.scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await agenda.screenshot({ path: process.argv[3] + "/agenda.png" });
  await b.close();
})();
