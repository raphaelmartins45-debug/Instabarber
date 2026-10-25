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

test("registo de apoio e comunicado lido pelo gestor", async ({ page, browser }, info) => {
  test.setTimeout(2 * 60_000);
  const projeto = info.project.name;
  const titulo = `Manutenção ${projeto}`;
  await entrarAdmin(page, contas(projeto).adminApoio);

  // Apoio (D-160): regista-se na ficha da barbearia e marca-se resolvido.
  await page.goto(`/admin/barbearias/${BARBEARIA_A.id}/apoio`);
  await page.getByLabel("Assunto").fill(`Dúvida ${projeto}`);
  await page.getByRole("button", { name: "Guardar registo" }).click();
  await expect(page.getByText("Registo guardado.")).toBeVisible();
  const registo = page.getByTestId("apoio").filter({ hasText: `Dúvida ${projeto}` });
  await expect(registo).toContainText("Em aberto");
  await registo.getByRole("button", { name: "Marcar resolvido" }).click();
  await expect(registo).toContainText("Resolvido");

  // Comunicado só para a Barbearia Alfa.
  await page.goto("/admin/comunicados");
  await page.getByLabel("Título").fill(titulo);
  await page.getByLabel("Texto").fill("O sistema fica parado 10 minutos esta noite.");
  await page.getByLabel("Para quem").selectOption("barbearia");
  await page.getByLabel("Barbearia", { exact: true }).selectOption(BARBEARIA_A.id);
  await page.getByRole("button", { name: "Publicar comunicado" }).click();
  await expect(page.getByText("Comunicado publicado.")).toBeVisible();
  const cartao = page.getByTestId("comunicado").filter({ hasText: titulo });
  await expect(cartao).toContainText("Em vigor");
  await expect(cartao).toContainText("Lido por 0 de 1 barbearias");

  // O gestor vê o aviso no Início e carrega em «Li».
  const gestor = await browser.newPage();
  await entrarEquipa(gestor, contas(projeto).dono);
  await gestor.goto("/app");
  const aviso = gestor.getByTestId("comunicado-painel").filter({ hasText: titulo });
  await expect(aviso).toBeVisible();
  await aviso.getByRole("button", { name: "Li" }).click();
  await expect(aviso).toHaveCount(0);
  await gestor.close();

  await page.reload();
  await expect(cartao).toContainText("Lido por 1 de 1 barbearias");
  await cartao.getByRole("button", { name: "Apagar" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Apagar" }).click();
  await expect(cartao).toHaveCount(0);
});
