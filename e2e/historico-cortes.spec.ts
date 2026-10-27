import { expect, test } from "@playwright/test";
import { BARBEARIA_A, contas, PALAVRA_PASSE, telefones, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Histórico de cortes (D-179): a barbearia regista a entrada com duas fotografias, a autorização
// do cliente e a nota para ele; o cliente vê-a na sua área, sem a nota interna, e retira a
// autorização (as fotografias saem, a nota fica). No computador e no telemóvel.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(2 * 60_000);

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

test("histórico de cortes: a barbearia regista com fotografias e o cliente vê e retira a autorização", async ({
  page,
  browser,
}, info) => {
  const telefone = telefones(info.project.name).comConta;
  const interna = `Pente 2 nos lados ${info.project.name}`;
  const paraCliente = `Degradê baixo, risca à esquerda ${info.project.name}`;

  // 1. A barbearia regista a entrada na ficha do cliente.
  await entrarEquipa(page, contas(info.project.name).dono);
  await page.goto(`/app/clientes?q=${telefone}`);
  await page
    .getByTestId("linha-cliente")
    .filter({ visible: true })
    .first()
    .getByRole("link", { name: "João Conta" })
    .click();
  await expect(page.getByTestId("ficha-cliente")).toHaveText("João Conta");
  await page.waitForLoadState("networkidle");
  const formulario = page.getByTestId("nova-entrada-historico");
  await formulario.locator('textarea[name="nota"]').fill(interna);
  await formulario.locator('textarea[name="notaCliente"]').fill(paraCliente);
  await formulario.locator('input[name="foto"]').setInputFiles({
    name: "frente.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await formulario.locator('input[name="foto2"]').setInputFiles({
    name: "lado.png",
    mimeType: "image/png",
    buffer: PNG,
  });
  await formulario.getByLabel("O cliente autorizou guardar fotografias do corte").check();
  await formulario.getByLabel("Mostrar ao cliente na área dele").check();
  await formulario.getByRole("button", { name: "Acrescentar ao histórico" }).click();
  const entrada = page.getByTestId("nota-tecnica").filter({ hasText: interna });
  await expect(entrada).toContainText(paraCliente);
  await expect(entrada.locator("img")).toHaveCount(2);

  // 2. O cliente vê a entrada na sua área, com as fotografias e sem a nota interna.
  const cliente = await (await browser.newContext(info.project.use)).newPage();
  await cliente.goto(`/${BARBEARIA_A.slug}/entrar`);
  await cliente.waitForLoadState("networkidle");
  await cliente.locator("#telefone").fill(telefone);
  await cliente.locator("#palavra_passe").fill(PALAVRA_PASSE);
  await cliente.getByRole("button", { name: "Entrar", exact: true }).click();
  await cliente.waitForURL(/minha-area/, { timeout: 30_000 });
  const historico = cliente.getByTestId("historico-cortes");
  const minha = historico.getByTestId("entrada-historico").filter({ hasText: paraCliente });
  await expect(minha).toBeVisible();
  await expect(minha.locator("img")).toHaveCount(2);
  await expect(historico).not.toContainText(interna);

  // 3. O cliente retira a autorização: as fotografias saem, a nota fica.
  await cliente.waitForLoadState("networkidle");
  await historico
    .getByRole("button", { name: "Retirar a autorização e apagar as fotografias" })
    .click();
  await cliente
    .getByRole("alertdialog")
    .getByRole("button", { name: "Retirar a autorização e apagar as fotografias" })
    .click();
  await expect(historico.getByRole("button", { name: "Autorizar" })).toBeVisible();
  await cliente.reload();
  await expect(
    cliente.getByTestId("entrada-historico").filter({ hasText: paraCliente }).locator("img"),
  ).toHaveCount(0);
});
