import { expect, test } from "@playwright/test";
import { contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Placa do balcão (Gestão do sistema → Placa do balcão, D-185): os textos vêm sugeridos, o gestor
// escolhe o modelo, muda o título e descarrega o PDF. No computador e no telemóvel.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

test("o gestor escolhe o modelo, muda o título e descarrega a placa em PDF", async ({
  page,
}, info) => {
  await entrarEquipa(page, contas(info.project.name).dono);
  await page.goto("/app/sistema/placa");
  const placa = page.getByTestId("placa");
  await expect(placa.getByLabel("Título")).not.toHaveValue("");
  await expect(placa.getByLabel("Frase de apoio")).not.toHaveValue("");
  await placa.getByLabel("Escuro e dourado").check();
  await placa.getByLabel("Título").fill("Marque online e ganhe selos");
  const [descarga] = await Promise.all([
    page.waitForEvent("download"),
    placa.getByRole("button", { name: "Descarregar PDF" }).click(),
  ]);
  expect(descarga.suggestedFilename()).toMatch(/^placa-do-balcao-.+\.pdf$/);

  // Textos inválidos não geram PDF.
  const longo = encodeURIComponent("x".repeat(61));
  const r = await page.request.get(`/api/placa?modelo=cor&titulo=${longo}&frase=&vantagem=`);
  expect(r.status()).toBe(400);
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(page.viewportSize()!.width);
});
