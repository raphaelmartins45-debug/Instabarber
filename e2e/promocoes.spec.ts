import { expect, test } from "@playwright/test";
import { BARBEARIA_A, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Promoções (Gestão do sistema → Promoções): o gestor cria uma, aparece na página pública;
// desligada, sai da página. No computador e no telemóvel.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

test("o gestor cria uma promoção, aparece na página pública e sai ao desligar", async ({
  page,
  browser,
}, info) => {
  const titulo = `Terça do pai e filho ${info.project.name}`;
  await entrarEquipa(page, contas(info.project.name).dono);
  await page.goto("/app/sistema/promocoes");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Texto (opcional)").fill("Dois cortes com 20 % de desconto.");
  await page.getByRole("button", { name: "Criar promoção" }).click();
  await expect(page.getByText("Promoção criada.")).toBeVisible();
  const linha = page.getByTestId("promocao").filter({ hasText: titulo });
  await expect(linha).toContainText("Sem datas");

  const visitante = await (await browser.newContext(info.project.use)).newPage();
  await visitante.goto(`/${BARBEARIA_A.slug}`);
  await expect(visitante.getByText(titulo)).toBeVisible();

  await linha.getByLabel("Ativa").uncheck();
  await page.waitForLoadState("networkidle");
  await visitante.reload();
  await expect(visitante.getByText(titulo)).toHaveCount(0);

  await page.reload();
  await page
    .getByTestId("promocao")
    .filter({ hasText: titulo })
    .getByRole("button", { name: "Remover" })
    .click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remover" }).click();
  await expect(page.getByTestId("promocao").filter({ hasText: titulo })).toHaveCount(0);
});
