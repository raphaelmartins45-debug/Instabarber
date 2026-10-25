import { expect, test, type Page } from "@playwright/test";
import { BARBEARIA_B, contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Fase 3C: custos e contas a pagar da Performa LAB. As tabelas são da plataforma (não de uma
// barbearia), por isso o que depende de totais corre só no computador.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(2 * 60_000);

/** Hoje em Lisboa mais n dias de calendário (sem somar horas, por causa da mudança da hora). */
const lisboa = (deslocamentoDias: number) => {
  const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Lisbon" });
  const d = new Date(`${hoje}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deslocamentoDias);
  return d.toISOString().slice(0, 10);
};

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
  await expect(page).toHaveURL(/\/admin\/financas\/custos/);
  await page.getByRole("button", { name: "Carregar os custos de partida (L.6)" }).click();
  // 17 € + 1 € por mês e quatro domínios a 10 € por ano (83 cêntimos por mês cada).
  await expect(page.getByTestId("custos-mes")).toHaveText(
    "Fixos 21,32 € · variáveis 0,00 € por mês",
  );

  // Resumo: os indicadores aparecem e o ponto de equilíbrio bate com a conta à mão
  // (21,32 € de fixos ÷ 39,00 € = 1 barbearia Pro; ÷ 19,99 € = 2 Basic).
  await page.getByRole("link", { name: "Resumo", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/financas$/);
  await expect(page.getByTestId("resumo")).toContainText("Custos do mês");
  await expect(page.getByTestId("resumo")).toContainText("21,32 €");
  await expect(page.getByTestId("equilibrio-pro")).toContainText("1 barbearia");
  await expect(page.getByTestId("equilibrio-basic")).toContainText("2 barbearias");
  await expect(page.getByTestId("equilibrio-previsto")).toContainText("previsão base");

  // Objetivo e previsões: meta do mês, quantas faltam e a projeção que recalcula sem gravar.
  await page.getByRole("link", { name: "Objetivo e previsões" }).click();
  await expect(page).toHaveURL(/\/admin\/financas\/objetivo/);
  await expect(page.getByTestId("meta-atual")).toHaveText("Ainda sem objetivo definido.");
  await page.getByText("Definir o objetivo").click();
  await page.getByLabel("Valor sem IVA (€)").fill("1000");
  await page.getByRole("button", { name: "Guardar objetivo" }).click();
  await expect(page.getByTestId("meta-atual")).toContainText("1000,00 € de receita recorrente");
  await expect(page.getByTestId("faltam-pro")).toContainText("barbearias");
  await expect(page.getByTestId("previsao")).toContainText("Não é uma promessa.");
  await page.getByLabel("Número de barbearias Pro").fill("10");
  await expect(page.getByTestId("previsao-ese")).toContainText("MRR 390,00 €");
  await page.getByLabel("Novas barbearias por mês").fill("0");
  await page.getByLabel("Saídas mensais (%)").fill("0");
  const base = await page.getByTestId("previsao-base").textContent();
  await expect(page.getByTestId("previsao-otimista")).toHaveText(base!);
  await page.getByRole("link", { name: "Custos e contas" }).click();
  await expect(page).toHaveURL(/\/admin\/financas\/custos/);

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

  // Vencimentos: a Barbearia Beta vence daqui a 3 dias. WhatsApp aberto e confirmado à mão;
  // o e-mail falha nos ensaios (chave do Resend errada), pode tentar-se outra vez ou cancelar.
  await servico()
    .from("inquilinos")
    .update({ proximo_vencimento: lisboa(3), whatsapp: "+351912000111", email: "beta@ensaio.pt" })
    .eq("id", BARBEARIA_B.id);
  await page.getByRole("link", { name: "Vencimentos", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/financas\/vencimentos/);
  const beta = page.getByTestId("vencimento").filter({ hasText: "Barbearia Beta" });
  await expect(beta).toContainText("Faltam 3 dias");
  await expect(beta.getByLabel("Texto da mensagem")).toHaveValue(/vence a .*MB WAY/s);
  const ligacao = beta.getByRole("link", { name: "WhatsApp" });
  await expect(ligacao).toHaveAttribute("href", /^https:\/\/wa\.me\/351912000111\?text=/);
  const conversa = page.context().waitForEvent("page");
  await ligacao.click();
  await (await conversa).close();
  await expect(beta).toContainText("WhatsApp aberto · por confirmar");
  await beta.getByRole("button", { name: "Confirmei o envio" }).click();
  await expect(beta).toContainText("WhatsApp confirmado");
  await expect(beta).toContainText("Último lembrete:");
  await beta.getByRole("button", { name: "E-mail", exact: true }).click();
  await expect(beta).toContainText("E-mail falhou");
  await expect(beta.getByRole("button", { name: "Tentar outra vez" })).toBeVisible();
  await beta.getByRole("button", { name: "Cancelar lembrete" }).click();
  await expect(beta).toContainText("Cancelado");
  await page.getByRole("link", { name: "Custos e contas" }).click();
  await expect(page).toHaveURL(/\/admin\/financas\/custos/);

  // Exportar: CSV com BOM e «;» e PDF, ambos com «Não é documento fiscal».
  await page.getByRole("link", { name: "Exportar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/financas\/exportar/);
  const csv = await page.request.get(
    (await page.getByRole("link", { name: "Descarregar CSV" }).getAttribute("href"))!,
  );
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  const texto = await csv.text();
  expect(texto.charCodeAt(0)).toBe(0xfeff);
  expect(texto).toContain("Não é documento fiscal.");
  expect(texto).toContain("Contabilista Ensaio;");
  const pdf = await page.request.get(
    (await page.getByRole("link", { name: "Descarregar PDF" }).getAttribute("href"))!,
  );
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  await page.getByRole("link", { name: "Custos e contas" }).click();
  await expect(page).toHaveURL(/\/admin\/financas\/custos/);

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
