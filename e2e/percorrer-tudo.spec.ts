import { test, type Page } from "@playwright/test";
import { BARBEARIA_A, contas, PALAVRA_PASSE, telefones, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Percorrer tudo (pedido do dono, 26/10/2026): com cada papel, abre todas as páginas a que chega
// e carrega em cada botão, no computador e no telemóvel, e regista os erros. Só corre com
// PERCORRER=1, sozinho e um projeto de cada vez (`... e2e/percorrer-tudo.spec.ts --project=computador`),
// porque os botões gravam de verdade.

test.skip(!temSupabase || !process.env.PERCORRER, "Só com PERCORRER=1, sozinho");
test.setTimeout(30 * 60_000);

const NAO_CARREGAR =
  /^(Sair|Sair da vista de apoio|Mais|Pesquisar|Aparência|Menu|Fechar|Eliminar definitivamente|Suspender|Cancelar barbearia|Cancelar a barbearia|Apagar auditoria.*|Preparar a demonstração|Recolher.*|Expandir.*|Vista de apoio)$/i;

type Relatorio = { linhas: string[]; falhas: string[] };

async function entrarStaff(page: Page, email: string) {
  await entrarEquipa(page, email);
  // A equipa InstaBarber passa sempre pelos dois passos; a base é nova, por isso inscreve-se.
  await page.waitForURL(/\/admin\/dois-passos/, { timeout: 30_000 });
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await page.waitForURL((u) => !u.pathname.includes("dois-passos"));
}

const padrao = (url: string) => new URL(url, "http://x").pathname.replace(/[0-9a-f-]{36}/g, ":id");

async function percorrer(
  page: Page,
  papel: string,
  inicio: string,
  prefixos: string[],
  r: Relatorio,
) {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message.slice(0, 120)));
  page.on("dialog", (d) => d.accept());
  const porVisitar = [inicio];
  const vistos = new Map<string, number>();
  const visitados = new Set<string>();
  while (porVisitar.length && visitados.size < 80) {
    const rota = porVisitar.shift()!;
    if (visitados.has(rota)) continue;
    const p = padrao(rota);
    if ((vistos.get(p) ?? 0) >= 2) continue;
    vistos.set(p, (vistos.get(p) ?? 0) + 1);
    visitados.add(rota);
    erros.length = 0;
    const resp = await page.goto(rota).catch(() => null);
    await page.waitForLoadState("networkidle").catch(() => {});
    const estado = resp?.status() ?? 0;
    const corpo = await page
      .locator("body")
      .innerText()
      .catch(() => "");
    if (
      estado >= 400 ||
      /Application error|server-side exception|client-side exception/i.test(corpo)
    ) {
      r.falhas.push(`${papel} ECRÃ ${estado} ${rota}`);
      continue;
    }
    for (const h of await page
      .locator("a[href^='/']")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")!)))
      if (
        prefixos.some((x) => h.startsWith(x)) &&
        !/\/pdf|\/ficheiro|\/assinado|exportar\/|\.zip|\.csv/.test(h)
      )
        porVisitar.push(h.split("#")[0]!);
    // Botões: cada um numa página carregada de novo; confirma os diálogos.
    const nomes = await page
      .locator("main")
      .getByRole("button")
      .evaluateAll((bs) =>
        bs
          .filter((b) => (b as HTMLElement).offsetParent !== null)
          .map((b) =>
            ((b.getAttribute("aria-label") || (b as HTMLElement).innerText) ?? "")
              .trim()
              .replace(/\s+/g, " ")
              .slice(0, 50),
          ),
      );
    const feitos = new Set<string>();
    for (let i = 0; i < nomes.length && feitos.size < 15; i++) {
      const nome = nomes[i]!;
      if (!nome || NAO_CARREGAR.test(nome) || feitos.has(nome)) continue;
      feitos.add(nome);
      erros.length = 0;
      await page.goto(rota).catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
      const b = page.locator("main").getByRole("button").filter({ visible: true }).nth(i);
      if (await b.isDisabled().catch(() => true)) continue;
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
      const dialogo = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      if (await dialogo.count()) {
        const bs = dialogo.last().getByRole("button");
        const n = await bs.count();
        if (n)
          await bs
            .nth(n - 1)
            .click({ timeout: 3000 })
            .catch(() => {});
      }
      await page.waitForTimeout(900);
      const depois = await page
        .locator("body")
        .innerText()
        .catch(() => "");
      if (
        erros.length ||
        /Application error|server-side exception|client-side exception/i.test(depois)
      )
        r.falhas.push(`${papel} BOTÃO ${rota} «${nome}» ${erros.join(" | ")}`);
      else r.linhas.push(`${papel} ok ${rota} «${nome}»`);
    }
  }
  r.linhas.push(`${papel}: ${visitados.size} ecrãs`);
}

test.describe.configure({ mode: "serial" });

async function relatar(info: { project: { name: string } }, papel: string, r: Relatorio) {
  console.log(
    `RELATORIO ${info.project.name} ${papel}\n${r.linhas.join("\n")}\nFALHAS\n${r.falhas.join("\n") || "nenhuma"}`,
  );
}

test("cliente final", async ({ page }, info) => {
  const r: Relatorio = { linhas: [], falhas: [] };
  await page.goto(`/${BARBEARIA_A.slug}/entrar`);
  await page.waitForLoadState("networkidle");
  await page.locator("#telefone").fill(telefones(info.project.name).comConta);
  await page.locator("#palavra_passe").fill(PALAVRA_PASSE);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL(/minha-area/, { timeout: 30_000 });
  await percorrer(page, "cliente", `/${BARBEARIA_A.slug}/minha-area`, [`/${BARBEARIA_A.slug}`], r);
  await relatar(info, "cliente", r);
});

for (const [papel, conta, inicio, staff] of [
  ["barbeiro", "barbeiro", "/app", false],
  ["gestor-barbearia", "dono", "/app", false],
  ["comercial", "comercialVendas", "/admin/comercial", true],
  ["gestor-plataforma", "gestor", "/admin", true],
  ["dono-plataforma", "adminEquipa", "/admin", true],
] as const) {
  test(papel, async ({ page }, info) => {
    const r: Relatorio = { linhas: [], falhas: [] };
    const email = contas(info.project.name)[conta];
    if (staff) await entrarStaff(page, email);
    else await entrarEquipa(page, email);
    await percorrer(page, papel, inicio, [inicio === "/app" ? "/app" : "/admin"], r);
    await relatar(info, papel, r);
  });
}
