import { expect, test, type Page } from "@playwright/test";
import { contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Fase 3C: custos e contas a pagar da Performa LAB. As tabelas são da plataforma (não de uma
// barbearia), por isso o que depende de totais corre só no computador.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

const lisboa = (deslocamentoDias: number) =>
  new Date(Date.now() + deslocamentoDias * 86_400_000).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Lisbon",
  });

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

async function novaConta(page: Page, fornecedor: string, vencimento: string) {
  await page.getByText("Nova conta", { exact: true }).click();
  const f = page.getByTestId("formulario-conta").last();
  await f.getByLabel("Fornecedor").fill(fornecedor);
  await f.getByLabel("Valor sem IVA (€)").fill("100");
  await f.getByLabel("Valor com IVA (€)").fill("123");
  await f.getByLabel("Vencimento").fill(vencimento);
  await f.getByRole("button", { name: "Guardar conta" }).click();
  await expect(f.getByText("Conta guardada.")).toBeVisible();
}

test("custos de partida, contas do próximo mês, conta atrasada e paga", async ({ page }, info) => {
  await entrarAdmin(page, contas(info.project.name).adminFinancas);
  const conta = (nome: string) =>
    page.getByTestId("conta").filter({ visible: true, hasText: nome });

  if (info.project.name === "telemovel") {
    await page.goto("/admin/financas/custos");
    await novaConta(page, "Fornecedor Telemóvel", lisboa(3));
    await expect(conta("Fornecedor Telemóvel")).toContainText("Pendente");
    await conta("Fornecedor Telemóvel").getByRole("button", { name: "Marcar paga hoje" }).click();
    await expect(conta("Fornecedor Telemóvel")).toHaveCount(0);
    return;
  }

  // A entrada no menu fica dentro da pasta «Gestão do negócio», que abre ao carregar.
  await page.getByRole("button", { name: "Gestão do negócio" }).filter({ visible: true }).click();
  await page.getByRole("link", { name: "Finanças" }).filter({ visible: true }).click();
  await expect(page).toHaveURL("/admin/financas");
  await page.getByRole("link", { name: "Custos e contas" }).click();
  await page.getByRole("button", { name: "Carregar os custos de partida (L.6)" }).click();
  // 17 € + 1 € por mês e quatro domínios a 10 € por ano (83 cêntimos por mês cada).
  await expect(page.getByTestId("custos-mes")).toHaveText(
    "Fixos 21,32 € · variáveis 0,00 € por mês",
  );

  // Resumo: os indicadores aparecem e o ponto de equilíbrio bate com a conta à mão
  // (21,32 € de fixos ÷ 39,00 € = 1 barbearia Pro; ÷ 19,99 € = 2 Basic).
  await page.getByRole("link", { name: "Resumo" }).click();
  await expect(page.getByTestId("resumo")).toContainText("Custos do mês");
  await expect(page.getByTestId("resumo")).toContainText("21,32 €");
  await expect(page.getByTestId("equilibrio-pro")).toContainText("1 barbearia");
  await expect(page.getByTestId("equilibrio-basic")).toContainText("2 barbearias");
  await page.getByRole("link", { name: "Custos e contas" }).click();

  await page.getByRole("button", { name: "Gerar as contas do próximo mês" }).click();
  await expect(page.getByText("2 contas geradas.")).toBeVisible();
  await expect(conta("Claude Code (Pro)")).toContainText("20,91 €");
  await page.getByRole("button", { name: "Gerar as contas do próximo mês" }).click();
  await expect(page.getByText("Nenhuma conta nova")).toBeVisible();

  await novaConta(page, "Contabilista Ensaio", lisboa(-1));
  await expect(conta("Contabilista Ensaio")).toContainText("Atrasada");
  await page.goto("/admin");
  await expect(page.getByText("1 conta a pagar atrasada")).toBeVisible();

  await page.goto("/admin/financas/custos");
  await conta("Contabilista Ensaio").getByRole("button", { name: "Marcar paga hoje" }).click();
  await expect(conta("Contabilista Ensaio")).toHaveCount(0);
  await page.getByRole("link", { name: "Todas" }).click();
  await expect(conta("Contabilista Ensaio")).toContainText("Paga");

  // Dar fim a um custo tira-o do total do mês seguinte, mas fica no histórico.
  await page
    .getByTestId("custo")
    .filter({ visible: true, hasText: "Zoho Mail" })
    .getByRole("button", { name: "Dar fim hoje" })
    .click();
  await expect(
    page.getByTestId("custo").filter({ visible: true, hasText: "Zoho Mail" }),
  ).toContainText("Terminado");
});
