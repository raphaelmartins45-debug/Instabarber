import { expect, test, type Page } from "@playwright/test";
import { contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Comunicados à equipa InstaBarber (D-191): o dono publica um aviso para um comercial; esse
// comercial vê-o no Comercial e marca-o como lido; a lista do Admin conta a leitura.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

async function entrarComDoisPassos(page: Page, email: string, destino: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(destino);
}

test("comunicado a um comercial, lido no Comercial", async ({ page, browser }, info) => {
  const c = contas(info.project.name);
  const titulo = `Reunião de vendas ${info.project.name} ${Date.now() % 100000}`;
  const { data: perfil } = await servico()
    .from("perfis")
    .select("user_id")
    .eq("email", c.comercialComunicados)
    .single();

  // 1. O dono publica para um comercial.
  await entrarComDoisPassos(page, c.adminComunicados, "/admin");
  await page.goto("/admin/comunicados");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Texto").fill("Amanhã às 10h, por videochamada.");
  await page.getByLabel("Para quem").selectOption("comerciais");
  await page.getByLabel("Pessoa").selectOption(perfil!.user_id);
  await page.getByRole("button", { name: "Publicar comunicado" }).click();
  await expect(page.getByText("Comunicado publicado.")).toBeVisible();
  const cartao = page.getByTestId("comunicado").filter({ hasText: titulo });
  await expect(cartao).toContainText("Lido por 0 de 1 pessoa");

  // 2. O comercial vê-o no Comercial e marca-o como lido.
  const comercial = await (await browser.newContext(info.project.use)).newPage();
  await entrarComDoisPassos(comercial, c.comercialComunicados, "/admin/comercial");
  const aviso = comercial.getByTestId("comunicado-painel").filter({ hasText: titulo });
  await expect(aviso).toBeVisible();
  await aviso.getByRole("button", { name: "Li" }).click();
  await expect(aviso).toHaveCount(0);

  // 3. A lista do Admin conta a leitura.
  await page.reload();
  await expect(page.getByTestId("comunicado").filter({ hasText: titulo })).toContainText(
    "Lido por 1 de 1 pessoa",
  );
});
