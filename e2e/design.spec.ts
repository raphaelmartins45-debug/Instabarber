import { expect, test, type Page } from "@playwright/test";
import { contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Redesenho, lote A (D-134): catálogo de design, aparência guardada no dispositivo (modo e
// destaque), paleta de comandos e casca sem deslocação horizontal em nenhuma largura.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

const semDeslocacao = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

test("catálogo: os componentes nos quatro temas e a paleta de comandos", async ({ page }, info) => {
  await entrarAdmin(page, contas(info.project.name).adminDesign);
  await page.goto("/admin/design");
  await expect(page.getByRole("heading", { name: "Catálogo de design" })).toBeVisible();

  for (const modo of ["escuro", "claro"] as const)
    for (const destaque of ["ouro", "neon"] as const) {
      await page.evaluate((a) => localStorage.setItem("ib_aparencia", JSON.stringify(a)), {
        modo,
        destaque,
      });
      await page.reload();
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-modo", modo);
      await expect(html).toHaveAttribute("data-destaque", destaque);
      await expect(page.getByRole("progressbar", { name: "Objetivo do mês" })).toBeVisible();
      await semDeslocacao(page);
    }

  if (info.project.name === "computador") {
    await page.keyboard.press("Control+k");
    const paleta = page.getByTestId("paleta-comandos");
    await expect(paleta).toBeVisible();
    await paleta.getByRole("textbox").fill("pedidos");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL("/admin/pedidos");
  }
});

test("painel: a aparência escolhida fica no dispositivo e o menu lateral recolhe", async ({
  page,
}, info) => {
  await entrarEquipa(page, contas(info.project.name).dono);
  // O botão só abre o seletor depois de a página ficar interativa.
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Aparência" }).click();
  const seletor = page.getByTestId("seletor-aparencia");
  await seletor.getByRole("radio", { name: "Claro" }).click();
  await seletor.getByRole("radio", { name: "Marca da barbearia" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-modo", "claro");
  await expect(page.locator("html")).toHaveAttribute("data-destaque", "marca");
  await semDeslocacao(page);

  if (info.project.name === "computador") {
    const menu = page.getByRole("navigation", { name: "Menu" }).filter({ visible: true });
    await menu.getByRole("button", { name: "Recolher o menu" }).click();
    await page.reload();
    await expect(menu).toHaveAttribute("data-recolhido", "");
    await menu.getByRole("button", { name: "Expandir o menu" }).click();
  }
});
