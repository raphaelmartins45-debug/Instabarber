import { expect, test, type Page } from "@playwright/test";

async function preencherPasso1(page: Page) {
  await page.locator("#f-nome").fill("Miguel Sousa");
  await page.locator("#f-tel").fill("912 345 678");
  await page.locator("#f-mail").fill("miguel@barbearia.pt");
  await page.locator("#send").click();
}

test("a landing abre na raiz, sem rolagem lateral", async ({ page }) => {
  const resposta = await page.goto("/");
  expect(resposta?.status()).toBe(200);
  await expect(page).toHaveTitle(/InstaBarber/);
  const largura = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(largura).toBeLessThanOrEqual(0);
});

test("pedido aceite: passo 2 e «Pedido enviado»", async ({ page }) => {
  const enviados: unknown[] = [];
  await page.route("/api/contacto", async (rota) => {
    enviados.push(rota.request().postDataJSON());
    const fase = (rota.request().postDataJSON() as { fase: number }).fase;
    await rota.fulfill({ json: fase === 1 ? { ok: true, ref: "IB-ABCD2345" } : { ok: true } });
  });
  await page.goto("/#contacto");
  await preencherPasso1(page);
  await expect(page.locator("#passo2")).toBeVisible();
  await page.locator("#f-barb").fill("Barbearia Central");
  await page.locator("#send").click();
  await expect(page.locator("#done-t")).toHaveText("Pedido enviado.");
  expect(enviados).toHaveLength(2);
  expect(enviados[1]).toMatchObject({
    fase: 2,
    ref: "IB-ABCD2345",
    barbearia: "Barbearia Central",
    website: "",
  });
});

test("pedido recusado pelo servidor: «Não conseguimos enviar» e botão de WhatsApp", async ({
  page,
}) => {
  // Sem RESEND_API_KEY válida, a rota real responde 502.
  await page.goto("/#contacto");
  await preencherPasso1(page);
  await expect(page.locator("#done-t")).toHaveText("Não conseguimos enviar o pedido.");
  await expect(page.locator("#wa")).toHaveAttribute("href", /^https:\/\/wa\.me\//);
});
