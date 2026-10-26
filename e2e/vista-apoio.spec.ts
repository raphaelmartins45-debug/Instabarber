import { expect, test, type Page } from "@playwright/test";
import { BARBEARIA_A, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Vista de apoio (E.1, D-166): o super_admin percorre o painel da barbearia só para ler. Cada ecrã
// abre com a faixa e cada botão responde: os que gravam mostram «Nada foi gravado», nunca um erro.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(10 * 60_000);

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("vista de apoio: todos os ecrãs e botões sem erro", async ({ page }, info) => {
  // Percorre-se uma vez (no computador): o telemóvel usa os mesmos ecrãs e ações.
  test.skip(info.project.name !== "computador");
  let erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror ${e.message.slice(0, 120)}`));
  page.on("dialog", (d) => d.dismiss());
  await entrarAdmin(page, contas(info.project.name).adminVista);
  await page.goto(`/admin/barbearias/${BARBEARIA_A.id}`);
  await page.getByRole("button", { name: "Vista de apoio" }).click();
  await page.getByRole("alertdialog").getByLabel("Justificação").fill("Exploração dos botões");
  await page.getByRole("button", { name: "Abrir a vista de apoio" }).click();
  await expect(page).toHaveURL("/app");
  await page.goto("/app/equipa");
  const prof = (await page.locator('a[href^="/app/equipa/"]').first().getAttribute("href"))!.split(
    "/",
  )[3];
  await page.goto("/app/clientes");
  const cli = (await page.locator('a[href^="/app/clientes/"]').first().getAttribute("href"))!;
  const rotas = [
    "/app",
    "/app/agenda",
    "/app/agenda/qr",
    "/app/clientes",
    cli,
    "/app/equipa",
    ...["", "/acertos", "/agenda", "/clientes", "/metas", "/perfil", "/relatorio"].map(
      (s) => `/app/equipa/${prof}${s}`,
    ),
    "/app/financeiro",
    "/app/financeiro/acertos",
    "/app/loja",
    "/app/relatorio",
    "/app/plano",
    ...[
      "estado",
      "marca",
      "horario",
      "ausencias",
      "equipa",
      "servicos",
      "fidelizacao",
      "aniversario",
      "faltas",
      "ligacoes",
      "clube",
      "periodos",
      "cartoes",
      "orfas",
    ].map((s) => `/app/sistema/${s}`),
  ];
  const ignorar =
    /^(Sair|Sair da vista de apoio|Mais|Pesquisar|Aparência|Menu|Fechar|Recolher.*|Expandir.*)$/i;
  const rel: string[] = [];
  const falhas: string[] = [];
  for (const r of rotas) {
    const resp = await page.goto(r);
    if (resp?.status() !== 200 || !(await page.getByTestId("faixa-apoio").count())) {
      falhas.push(`ecrã ${resp?.status()} ${r}`);
      continue;
    }
    const main = page.locator("main");
    const nomes = await main
      .getByRole("button")
      .evaluateAll((bs) =>
        bs
          .filter((b) => (b as HTMLElement).offsetParent !== null)
          .map((b) =>
            (b.getAttribute("aria-label") || (b as HTMLElement).innerText || "")
              .trim()
              .replace(/\s+/g, " ")
              .slice(0, 50),
          ),
      );
    const vistos = new Set<string>();
    for (let i = 0; i < nomes.length; i++) {
      const nome = nomes[i]!;
      if (ignorar.test(nome) || vistos.has(nome) || vistos.size > 25) continue;
      vistos.add(nome);
      await page.goto(r);
      erros = [];
      const b = page.locator("main").getByRole("button").filter({ visible: true }).nth(i);
      const desativado = await b.isDisabled().catch(() => true);
      if (desativado) {
        rel.push(`  desativado  ${r} «${nome}»`);
        continue;
      }
      await b.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(600);
      const dlg = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      if (await dlg.count()) {
        const bs = dlg.getByRole("button");
        const n = await bs.count();
        if (n)
          await bs
            .nth(n - 1)
            .click({ timeout: 3000 })
            .catch(() => {});
        await page.waitForTimeout(1200);
      } else await page.waitForTimeout(800);
      const corpo = await page.locator("body").innerText();
      const crash = /Application error|client-side exception|server-side exception/i.test(corpo);
      const recusado = await page.getByTestId("apoio-recusado").count();
      const estado = crash || erros.length ? "FALHA" : recusado ? "recusado" : "leitura";
      if (estado === "FALHA") falhas.push(`${r} «${nome}» ${erros.join(" | ")}`);
      rel.push(`${estado.padEnd(9)} ${r} «${nome}»`);
    }
  }
  console.log("RELATORIO\n" + rel.join("\n"));
  expect(falhas).toEqual([]);
  // Marcar é só escrita: volta à agenda com o aviso.
  await page.goto("/app/agenda/marcar");
  await expect(page).toHaveURL(/\/app\/agenda\?so_leitura=1$/);
  await expect(page.getByTestId("apoio-recusado")).toBeVisible();
  await page.getByRole("button", { name: "Fechar o aviso" }).click();
  await expect(page.getByTestId("apoio-recusado")).toHaveCount(0);
});
