import { expect, test, type Page } from "@playwright/test";
import { contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Fase 3B: o pedido do site entra no CRM (incompleto até ao passo 2); o super_admin cria um
// lead à mão, regista uma chamada, muda o estado, faz o briefing e a proposta, gera e assina o
// contrato, e o convite leva à adesão já preenchida, que na aprovação fica ligada ao contrato.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(5 * 60_000);

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
  await expect(page.getByTestId("preco-briefing")).toContainText("39,99");
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

  // Camadas 3 e 4: contrato do modelo aprovado, PDF, enviado, assinado, convite e adesão.
  const fichaLead = page.url();
  const nif = sufixo === "1" ? "501964843" : "502011475";
  const emailDono = `contrato${sufixo}@corte-ensaio.pt`;
  await page.locator("#contrato-razao_social").fill(`Navalha ${sufixo}, Lda.`);
  await page.locator("#contrato-nif").fill(nif);
  await page.locator("#contrato-morada").fill("Rua do Souto, 10, Braga");
  await page.locator("#contrato-representante").fill(`Ana Manual${sufixo}`);
  await page.locator("#contrato-cargo").fill("Gerente");
  await page.locator("#contrato-email").fill(emailDono);
  await page.getByRole("button", { name: "Gerar contrato" }).click();
  const contrato = page.getByTestId("contrato");
  await expect(contrato).toContainText("Rascunho");
  const pdfContrato = await page.request.get(
    (await contrato.getByRole("link", { name: "Descarregar PDF" }).getAttribute("href"))!,
  );
  expect(pdfContrato.status()).toBe(200);
  expect(pdfContrato.headers()["content-type"]).toBe("application/pdf");
  await contrato.getByRole("button", { name: "Marcar como enviado" }).click();
  await expect(contrato).toContainText("Enviado");
  await contrato.getByLabel("Data da assinatura").fill("2026-10-20");
  await contrato.getByLabel("PDF assinado").setInputFiles({
    name: "assinado.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n%ensaio\n"),
  });
  await contrato.getByRole("button", { name: "Registar assinatura" }).click();
  await expect(contrato).toContainText("Assinado a");
  await expect(page.getByText("Ganho").first()).toBeVisible();
  const assinado = await page.request.get(
    (await contrato.getByRole("link", { name: "PDF assinado" }).getAttribute("href"))!,
  );
  expect(assinado.status()).toBe(200);

  await contrato.getByRole("button", { name: "Criar convite de adesão" }).click();
  const ligacao = (await page.getByTestId("convite-ligacao").locator("code").textContent())!;
  expect(ligacao).toMatch(/\/adesao\?convite=[\w-]{43}$/);

  // O dono abre a ligação: o formulário vem preenchido com os dados do contrato. Os ensaios
  // de adesão saem todos do mesmo IP: repõe-se o limite de 3 por hora antes de enviar.
  await servico().from("limites_pedidos").delete().like("chave", "adesao:ip:%");
  await page.goto(ligacao.replace(/^https?:\/\/[^/]+/, ""));
  await expect(page.getByLabel("Nome da barbearia")).toHaveValue(`Navalha ${sufixo}, Lda.`);
  await expect(page.getByLabel("NIF da barbearia")).toHaveValue(nif);
  await page.getByTestId("imagem-logo").setInputFiles("public/marca/ib-512.png");
  await expect(page.getByText("Carregado")).toBeVisible();
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByLabel("Telefone da barbearia").fill("253 000 000");
  await page.getByLabel("Cidade ou concelho").fill("Braga");
  await expect(page.getByLabel("Morada", { exact: true })).toHaveValue("Rua do Souto, 10, Braga");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await page.getByLabel("Serviço").first().fill("Corte");
  await page.getByLabel("Preço (€)").first().fill("15,00");
  await page.getByRole("button", { name: "Seguinte" }).click();
  await expect(page.getByLabel("E-mail de acesso do proprietário")).toHaveValue(emailDono);
  await page.getByRole("checkbox").last().check();
  await page.getByRole("button", { name: "Enviar para a Performa LAB" }).click();
  await expect(page.getByTestId("pedido-enviado")).toBeVisible();

  // A aprovação cria a barbearia e liga-a ao contrato e ao lead.
  await page.goto("/admin/pedidos");
  await page
    .getByRole("link", { name: `Navalha ${sufixo}, Lda.` })
    .first()
    .click();
  await page.getByRole("button", { name: "Aprovar", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Aprovar", exact: true }).click();
  await expect(page.getByTestId("ficha-nome")).toHaveText(`Navalha ${sufixo}, Lda.`, {
    timeout: 20_000,
  });
  await page.goto(fichaLead);
  await expect(page.getByTestId("contrato")).toContainText("Barbearia criada e ligada");
  await expect(page.getByTestId("historico-lead")).toContainText("Barbearia criada e ligada");

  // Modelos: o contrato aprovado lê-se com pré-visualização; as condições importam-se do base.
  await page.goto("/admin/comercial/modelos");
  await expect(page.getByTestId("modelo").first()).toContainText("Aprovado");
  if (info.project.name === "computador") {
    await page.getByRole("button", { name: /Importar o rascunho base: Condições/ }).click();
    await expect(page.getByTestId("modelo").last()).toContainText("Rascunho");
  }
  await page.getByTestId("modelo").first().getByRole("link").click();
  await expect(page.getByText("Pré-visualização com dados de exemplo")).toBeVisible();
  await expect(page.getByText("Barbearia Exemplo, Lda.").first()).toBeVisible();

  // Rotina mensal (P-24): nenhum lead está parado há 12 meses, nada se apaga.
  await page.goto("/admin/comercial/leads");
  await page.getByRole("button", { name: "Apagar leads inativos (12 meses)" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Apagar leads inativos (12 meses)" })
    .click();
  await expect(page.getByText("0 leads apagados.")).toBeVisible();
});
