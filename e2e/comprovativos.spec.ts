import { expect, test, type Page } from "@playwright/test";
import { BARBEARIA_A, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Comprovativos de pagamento (D-168): o dono envia o comprovativo em «O meu plano»; a Performa LAB
// vê-o no painel geral, confere e aprova; o dono vê-o confirmado. Corre no telemóvel, onde o dono
// usa o sistema; a barbearia é a mesma nos dois projetos e só pode ter um em análise por período.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("comprovativo enviado pelo dono, conferido e aprovado pela Performa LAB", async ({
  page,
  browser,
}, info) => {
  test.skip(info.project.name !== "telemovel");
  const c = contas(info.project.name);

  // 1. O dono envia o comprovativo do MB WAY.
  await entrarEquipa(page, c.dono);
  await page.goto("/app/plano");
  const formulario = page.getByTestId("enviar-comprovativo");
  await expect(formulario).toContainText("Período a pagar");
  await formulario.getByLabel("Valor pago (€)").fill("39,99");
  await page.getByTestId("comprovativo-ficheiro").setInputFiles({
    name: "mbway.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await formulario.getByRole("button", { name: "Enviar comprovativo" }).click();
  await expect(page.getByTestId("comprovativo-em-analise")).toBeVisible();
  await expect(page.getByTestId("comprovativo").first()).toContainText("Em análise");

  // 2. A Performa LAB vê-o no painel geral, confere e aprova.
  const admin = await (await browser.newContext(info.project.use)).newPage();
  await entrarAdmin(admin, c.adminPagamentos);
  const linha = admin.getByTestId("painel-comprovativo").filter({ hasText: BARBEARIA_A.nome });
  await expect(linha).toContainText("39,99");
  await linha.getByRole("link", { name: "Conferir" }).click();
  await expect(admin.getByTestId("comprovativo-dados")).toContainText(BARBEARIA_A.nome);
  await expect(admin.getByRole("img", { name: "Comprovativo de pagamento" })).toBeVisible();
  // O botão só abre a confirmação depois de a página ficar interativa.
  await admin.waitForLoadState("networkidle");
  await admin.getByRole("button", { name: "Aprovar pagamento" }).click();
  await admin.getByRole("alertdialog").getByRole("button", { name: "Aprovar pagamento" }).click();
  // Nos ensaios o Resend tem uma chave inválida: aprova, mas avisa que o e-mail não saiu.
  await expect(admin.getByText(/Pagamento aprovado/)).toBeVisible();
  await expect(admin.getByTestId("comprovativo-dados")).toContainText("Confirmado");

  // 3. O dono vê-o confirmado e o recebimento registado.
  await page.reload();
  await expect(page.getByTestId("comprovativo").first()).toContainText("Confirmado");
  await expect(page.getByTestId("recebimento").first()).toContainText("39,99");
});
