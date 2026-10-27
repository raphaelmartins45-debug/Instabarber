import { expect, test, type Page } from "@playwright/test";
import { BARBEARIA_A, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Gerador de documentos (D-181): a proposta rápida cria o lead e gera a proposta; os documentos
// personalizados da barbearia descarregam-se em PDF, com a assinatura de quem os gera.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("proposta rápida e documentos personalizados da barbearia", async ({ page }, info) => {
  const sufixo = `${info.project.name} ${Date.now() % 100000}`;
  await entrarAdmin(page, contas(info.project.name).adminDocumentos);

  // 1. Proposta para um lead novo: o formulário pede o que falta e depois gera.
  await page.goto("/admin/documentos");
  await page.getByRole("link", { name: "Proposta para um lead novo" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Criar o lead e gerar a proposta" }).click();
  await expect(page.getByText("Preencha este campo.").first()).toBeVisible();
  await page.getByLabel("Nome do contacto (quem decide)").fill("Judah Silva");
  await page.getByLabel("Nome da barbearia").fill(`Judah ${sufixo}`);
  await page.getByLabel("Cidade").fill("Viseu");
  await page.getByLabel("Telemóvel").fill("912 345 678");
  await page.getByLabel("O contacto autorizou que o contactássemos").check();
  await page.getByLabel("Barbeiros").fill("3");
  await page.getByLabel("Clientes ativos (estimativa)").fill("250");
  await page.getByLabel("Valor médio da visita (€)").fill("15");
  await page.getByLabel("WhatsApp").check();
  await page.getByLabel("Faltas", { exact: true }).check();
  await page.getByLabel("O objetivo dele, nas palavras dele").fill("Menos faltas.");
  await page.getByLabel("Próxima ação", { exact: true }).fill("Ligar sobre a proposta");
  await page.getByLabel("Data da próxima ação").fill("2026-12-01");
  await page.getByRole("button", { name: "Criar o lead e gerar a proposta" }).click();
  await expect(page.getByTestId("proposta-rapida-feita")).toContainText("Proposta gerada.");
  const pdf = page.getByRole("link", { name: "Descarregar a proposta" });
  const resposta = await page.request.get((await pdf.getAttribute("href"))!);
  expect(resposta.headers()["content-type"]).toBe("application/pdf");

  // 2. O lead aparece no Gerador, com a proposta.
  await page.getByRole("link", { name: "Abrir a ficha do lead" }).click();
  await page.waitForURL(/\/admin\/comercial\/leads\/[0-9a-f-]{36}$/);
  const leadId = page.url().split("/").pop()!;
  await page.goto(`/admin/documentos?lead=${leadId}`);
  await expect(page.getByTestId("documentos-do-lead")).toContainText(/PRP-/);

  // 3. Documentos da barbearia: os quatro PDFs; o guia leva os endereços e a assinatura.
  await page.goto(`/admin/documentos?barbearia=${BARBEARIA_A.id}`);
  const cartoes = page.getByTestId("documentos-barbearia");
  await expect(cartoes.getByRole("link", { name: "Descarregar PDF" })).toHaveCount(4);
  for (const tipo of ["guia", "barbeiro", "cartaz", "resumo"]) {
    const r = await page.request.get(`/admin/documentos/barbearia/${BARBEARIA_A.id}/${tipo}`);
    expect(r.status(), tipo).toBe(200);
    expect(r.headers()["content-type"]).toBe("application/pdf");
    const corpo = (await r.body()).toString("latin1");
    if (tipo === "guia") {
      expect(corpo).toContain(`${BARBEARIA_A.slug}.localhost:3000/gestor`);
      expect(corpo).toContain("Raphael Martins");
    }
    if (tipo === "resumo") expect(corpo).toContain("documento fiscal");
  }
  // Um tipo que não existe, ou sem sessão de administrador: 404.
  expect((await page.request.get(`/admin/documentos/barbearia/${BARBEARIA_A.id}/x`)).status()).toBe(
    404,
  );
  const largura = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(largura).toBeLessThanOrEqual(page.viewportSize()!.width);
});
