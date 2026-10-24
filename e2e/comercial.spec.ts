import { expect, test, type Page } from "@playwright/test";
import { contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Fase 3B, camadas 1A e 1: o pedido do site entra no CRM (incompleto até ao passo 2); o
// super_admin cria um lead à mão, regista uma chamada, muda o estado e vê-o no funil.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("pedido do site no CRM, lead à mão, contacto, estado e funil", async ({ page }, info) => {
  const sufixo = info.project.name === "computador" ? "1" : "2";
  const email = `site${sufixo}@corte-ensaio.pt`;
  const passo1 = {
    fase: 1,
    nome: `Rui Ensaio${sufixo}`,
    telemovel: `91200011${sufixo}`,
    email,
    website: "",
  };
  // O Resend dos ensaios tem a chave errada: o e-mail falha, mas o lead fica gravado.
  await page.request.post("/api/contacto", { data: passo1 });

  await entrarAdmin(page, contas(info.project.name).adminComercial);
  await page.goto("/admin/comercial/leads?vista=incompletos");
  await expect(page.getByText(`Rui Ensaio${sufixo}`).filter({ visible: true })).toBeVisible();

  await page.request.post("/api/contacto", {
    data: {
      ...passo1,
      fase: 2,
      ref: "IB-ABCD2345",
      barbearia: `Corte Ensaio ${sufixo}`,
      cidade: "Braga",
    },
  });
  await page.reload();
  await expect(page.getByText(`Rui Ensaio${sufixo}`)).toHaveCount(0);

  await page.goto("/admin/comercial/leads/novo");
  await page.getByLabel("Nome do contacto").fill(`Ana Manual${sufixo}`);
  await page.getByLabel("Barbearia").fill(`Navalha ${sufixo}`);
  await page.getByLabel("Telemóvel").fill(`93300022${sufixo}`);
  await page.getByRole("button", { name: "Criar lead" }).click();
  await expect(page.getByTestId("lead-nome")).toHaveText(`Navalha ${sufixo}`);

  await page.getByLabel("O que aconteceu").fill("Ligou a pedir demonstração.");
  await page.getByLabel("Próxima ação", { exact: true }).fill("Marcar demonstração");
  await page.getByRole("button", { name: "Registar", exact: true }).click();
  await expect(page.getByText("Contacto registado.")).toBeVisible();
  await expect(page.getByTestId("historico-lead")).toContainText("Ligou a pedir demonstração.");

  await page.getByRole("combobox", { name: "Estado", exact: true }).selectOption("demonstracao");
  await page.getByRole("button", { name: "Mudar estado" }).click();
  await expect(page.getByTestId("historico-lead")).toContainText("De «Novo» para «Demonstração».");

  await page.goto("/admin/comercial");
  await expect(page.getByTestId("coluna-demonstracao")).toContainText(`Navalha ${sufixo}`);
  await expect(page.getByTestId("coluna-novo")).toContainText(`Corte Ensaio ${sufixo}`);

  // Camada 2: briefing em passos, proposta em PDF, enviada e aceite.
  await page.getByTestId("coluna-demonstracao").getByText(`Navalha ${sufixo}`).click();
  await page.getByRole("link", { name: "Abrir o briefing" }).click();
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByLabel("N.º de barbeiros *").fill("3");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByLabel("WhatsApp", { exact: true }).check();
  await page.getByLabel("Clientes ativos (estimativa) *").fill("400");
  await page.getByLabel("Valor médio de uma visita (€) *").fill("15");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByLabel("Faltas", { exact: true }).check();
  await page.getByLabel("Objetivo principal nos próximos três meses *").fill("Reduzir as faltas");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await expect(page.getByTestId("preco-briefing")).toContainText("47,97");
  await page.getByRole("button", { name: "Gerar proposta" }).click();

  await expect(page.getByTestId("propostas-lead")).toContainText("Rascunho");
  const pdf = await page.request.get(
    (await page.getByRole("link", { name: "Descarregar PDF" }).getAttribute("href"))!,
  );
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  await page.getByRole("button", { name: "Marcar como enviada" }).click();
  await expect(page.getByTestId("propostas-lead")).toContainText("Enviada");
  await page.getByRole("button", { name: "Aceite", exact: true }).click();
  await expect(page.getByTestId("propostas-lead")).toContainText("Aceite");
  await expect(page.getByTestId("historico-lead")).toContainText("aceite.");
});
