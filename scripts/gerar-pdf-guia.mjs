// Gera o PDF do guia de acesso aos painéis a partir de docs/manuais/pdf/guia-de-acesso-gestor.html,
// com o Chromium do Playwright (sem dependências novas). Uso: node scripts/gerar-pdf-guia.mjs
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = path.join(raiz, "docs/manuais/pdf/guia-de-acesso-gestor.html");
const pdf = path.join(raiz, "docs/manuais/pdf/InstaBarber-guia-de-acesso-aos-paineis.pdf");

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: pdf, format: "A4", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(pdf);
