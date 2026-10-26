import { expect, test } from "@playwright/test";
import { contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Ficha de prospeção (D-174): o comercial regista um lead da visita ou do Instagram, com o
// consentimento, a próxima ação e a situação atual; o duplicado é avisado, o fim do contrato
// atual entra na agenda «Hoje» e o briefing já começa preenchido.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(2 * 60_000);

test("lead de prospeção: consentimento, duplicado, agenda e briefing", async ({ page }, info) => {
  const projeto = info.project.name;
  const sufixo = `${projeto === "computador" ? "1" : "2"}${Date.now() % 100000}`;
  const instagram = `barbeariateste${sufixo}`;
  const fimContrato = new Date(Date.now() + 10 * 86_400_000).toISOString().slice(0, 10);

  await entrarEquipa(page, contas(projeto).comercialProspecao);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin/comercial");

  // 1. Sem consentimento, o lead do Instagram não se regista.
  await page.goto("/admin/comercial/leads/novo");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Nome do contacto").fill(`Rui ${sufixo}`);
  await page.getByLabel("Barbearia").fill(`Barbearia Prospeção ${sufixo}`);
  await page.getByLabel("Telemóvel").fill(`936${sufixo.padStart(6, "0").slice(-6)}`);
  await page.locator("#lead-origem").selectOption("instagram");
  await page.getByLabel("Instagram").fill(`@${instagram}`);
  await page.getByLabel("Cargo de quem atendeu").fill("Dono");
  await page.getByLabel("Falei com quem decide").check();
  await page.getByLabel("N.º de cadeiras").fill("4");
  await page.getByLabel("Avaliação no Google (0 a 5)").fill("4,7");
  await page.getByLabel("N.º de avaliações no Google").fill("123");
  await page.locator("#lead-como_marcam").selectOption("whatsapp");
  await page.getByLabel("Sistema que usa hoje").fill("Booksy");
  await page.getByLabel("Quanto paga hoje por mês (€)").fill("29,90");
  await page.getByLabel("Fim do contrato atual").fill(fimContrato);
  await page.locator("#lead-temperatura").selectOption("quente");
  await page.getByLabel("Próxima ação", { exact: true }).fill("Demonstração na barbearia");
  await page.getByLabel("Data da próxima ação").fill("2030-01-15");
  await page.getByRole("button", { name: "Criar lead" }).click();
  await expect(page.getByText("Sem o consentimento do contacto")).toBeVisible();

  // 2. Com o consentimento, cria e mostra a temperatura e a ficha preenchida.
  await page.getByLabel("O contacto aceitou ser contactado pela InstaBarber").check();
  await page.getByRole("button", { name: "Criar lead" }).click();
  await expect(page.getByTestId("lead-nome")).toHaveText(`Barbearia Prospeção ${sufixo}`);
  const ficha = page.url();
  await expect(page.locator("#lead-temperatura")).toHaveValue("quente");
  await expect(page.locator("span").filter({ hasText: /^Quente$/ })).toBeVisible();
  await expect(page.getByLabel("Instagram")).toHaveValue(`@${instagram}`);
  await expect(page.getByLabel("Quanto paga hoje por mês (€)")).toHaveValue("29,90");

  // 3. Um lead novo com o mesmo Instagram avisa do duplicado.
  await page.goto("/admin/comercial/leads/novo");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Instagram").fill(instagram.toUpperCase());
  await page.getByLabel("Morada").click();
  await expect(page.getByTestId("leads-semelhantes")).toContainText(
    `Barbearia Prospeção ${sufixo}`,
  );

  // 4. O fim do contrato atual entra na agenda «Hoje».
  await page.goto("/admin/comercial/desempenho");
  await expect(page.getByTestId("agenda")).toContainText(
    "O contrato com o sistema atual acaba em 10 dias",
  );

  // 5. O briefing começa com a ficha de prospeção.
  await page.goto(`${ficha}/briefing`);
  await expect(page.getByLabel("N.º de cadeiras")).toHaveValue("4");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByRole("button", { name: "Seguinte" }).click();
  await expect(page.getByLabel("Sistema atual", { exact: true })).toHaveValue("Booksy");
});
