import { expect, test, type Page } from "@playwright/test";
import { BARBEARIA_A, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Gestão do negócio (D-159): saúde das barbearias, arranque das novas e crescimento.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("saúde, arranque e crescimento a partir da pasta Gestão do negócio", async ({
  page,
}, info) => {
  await entrarAdmin(page, contas(info.project.name).adminGestao);

  // No telemóvel a pasta já aparece aberta dentro de «Mais» (barra de baixo).
  if (info.project.name === "telemovel")
    await page.getByRole("button", { name: "Mais", exact: true }).click();
  else
    await page.getByRole("button", { name: "Gestão do negócio" }).filter({ visible: true }).click();
  await page.getByRole("link", { name: "Saúde das barbearias" }).filter({ visible: true }).click();
  await expect(page).toHaveURL("/admin/saude");
  await expect(page.getByTestId("saude-contagem")).toContainText("em risco");
  await expect(
    page.getByTestId("saude").filter({ visible: true, hasText: BARBEARIA_A.nome }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Arranque das barbearias novas" })).toBeVisible();

  await page.goto("/admin/metricas");
  await expect(page.getByRole("heading", { name: "Crescimento", level: 1 })).toBeVisible();
  await expect(page.getByTestId("metricas")).toContainText("Barbearias ativas");
  await expect(page.getByTestId("origens")).toBeVisible();
  await expect(page.getByTestId("conversao")).toContainText("ganhos");
});
