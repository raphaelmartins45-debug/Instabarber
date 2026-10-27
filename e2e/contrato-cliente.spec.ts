import { createHash } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Contrato enviado ao cliente (D-181): a equipa envia, o cliente carrega o PDF assinado pela
// ligação, a equipa recusa com o motivo e depois aprova; e o folheto com os contactos de quem o
// gera. Os e-mails falham nos ensaios (chave errada do Resend): a ligação do cliente põe-se na
// base de dados, como se viesse do e-mail.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

const PDF = {
  name: "assinado.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\n%%EOF"),
};

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

/** A ligação que o cliente receberia por e-mail: guarda-se o hash, como faz o sistema. */
async function ligacaoDoCliente(contratoId: string, sufixo: string): Promise<string> {
  const token = `ensaio-contrato-${sufixo}-`.padEnd(48, "x");
  const hash = createHash("sha256").update(token).digest("hex");
  const { error } = await servico()
    .from("contratos")
    .update({ envio_token_hash: hash })
    .eq("id", contratoId);
  expect(error).toBeNull();
  return token;
}

async function carregarComoCliente(page: Page, token: string) {
  const cliente = await (await page.context().browser()!.newContext()).newPage();
  await cliente.goto(`/adesao/contrato/${token}`);
  await expect(cliente.getByTestId("contrato-numero")).toContainText("CTR-");
  await cliente.waitForLoadState("networkidle");
  await cliente.getByTestId("contrato-ficheiro").setInputFiles(PDF);
  await cliente.getByRole("button", { name: "Carregar o contrato assinado" }).click();
  await expect(cliente.getByText("Recebemos o contrato assinado.")).toBeVisible();
  await cliente.context().close();
}

test("contrato enviado, carregado pelo cliente, recusado e aprovado; folheto", async ({
  page,
}, info) => {
  const sufixo = `${info.project.name}-${Date.now() % 100000}`;
  await entrarAdmin(page, contas(info.project.name).adminContratos);

  // 1. Lead, proposta e contrato pela proposta rápida e pela ficha.
  await page.goto("/admin/documentos/proposta");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Nome do contacto (quem decide)").fill("Judah Silva");
  await page.getByLabel("Nome da barbearia").fill(`Contrato ${sufixo}`);
  await page.getByLabel("Telemóvel").fill("912 345 679");
  await page.getByLabel("O contacto autorizou que o contactássemos").check();
  await page.getByLabel("Barbeiros").fill("3");
  await page.getByLabel("Clientes ativos (estimativa)").fill("200");
  await page.getByLabel("Valor médio da visita (€)").fill("15");
  await page.getByLabel("WhatsApp").check();
  await page.getByLabel("Faltas", { exact: true }).check();
  await page.getByLabel("O objetivo dele, nas palavras dele").fill("Menos faltas.");
  await page.getByLabel("Próxima ação", { exact: true }).fill("Enviar o contrato");
  await page.getByLabel("Data da próxima ação").fill("2026-12-01");
  await page.getByRole("button", { name: "Criar o lead e gerar a proposta" }).click();
  await page.getByRole("link", { name: "Abrir a ficha do lead" }).click();
  await page.waitForURL(/\/admin\/comercial\/leads\/[0-9a-f-]{36}$/);
  await page.getByRole("button", { name: "Marcar como enviada" }).click();
  await expect(page.getByTestId("propostas-lead")).toContainText("Enviada");
  await page.getByRole("button", { name: "Aceite", exact: true }).click();
  await expect(page.getByTestId("propostas-lead")).toContainText("Aceite");
  await page.locator("#contrato-razao_social").fill(`Contrato ${sufixo}, Lda.`);
  await page.locator("#contrato-nif").fill("501964843");
  await page.locator("#contrato-morada").fill("Rua Direita, 1, Viseu");
  await page.locator("#contrato-cargo").fill("Gerente");
  await page.locator("#contrato-email").fill(`contrato-${sufixo}@corte-ensaio.pt`);
  await page.getByRole("button", { name: "Gerar contrato" }).click();
  const contrato = page.getByTestId("contrato");
  await expect(contrato).toContainText("Rascunho");

  // 2. Enviar ao cliente: o e-mail falha nos ensaios, mas o contrato fica enviado.
  await page.waitForLoadState("networkidle");
  await contrato.getByRole("button", { name: "Enviar ao cliente por e-mail" }).click();
  await expect(contrato.getByText("Não foi possível enviar.")).toBeVisible();
  await page.reload();
  await expect(contrato).toContainText("Enviado ao cliente a");
  const { data } = await servico()
    .from("contratos")
    .select("id")
    .eq("dados->>email", `contrato-${sufixo}@corte-ensaio.pt`)
    .single();
  const contratoId = data!.id as string;

  // 3. Uma ligação errada não mostra nada; a certa deixa carregar o PDF assinado.
  const anonimo = await (await page.context().browser()!.newContext()).newPage();
  await anonimo.goto(`/adesao/contrato/${"z".repeat(48)}`);
  await expect(anonimo.getByText("Esta ligação já não é válida")).toBeVisible();
  await anonimo.context().close();
  await carregarComoCliente(page, await ligacaoDoCliente(contratoId, `${sufixo}-a`));

  // 4. A equipa recusa com o motivo; o cliente carrega outra vez; a equipa aprova.
  await page.reload();
  await expect(contrato).toContainText("Por conferir");
  await page.waitForLoadState("networkidle");
  await contrato.getByRole("button", { name: "Recusar", exact: true }).click();
  await contrato.getByLabel("Motivo da recusa (o cliente vê-o)").fill("Falta a assinatura.");
  await contrato.getByRole("button", { name: "Recusar e pedir outra vez" }).click();
  await expect(contrato.getByTestId("contrato-recusado")).toContainText("Falta a assinatura.");
  const token = await ligacaoDoCliente(contratoId, `${sufixo}-b`);
  const cliente = await (await page.context().browser()!.newContext()).newPage();
  await cliente.goto(`/adesao/contrato/${token}`);
  await expect(cliente.getByText("Falta um pormenor: Falta a assinatura.")).toBeVisible();
  await cliente.context().close();
  await carregarComoCliente(page, token);
  await page.reload();
  await page.waitForLoadState("networkidle");
  await contrato.getByRole("button", { name: "Aprovar e enviar a adesão" }).click();
  // Os e-mails falham nos ensaios: o aviso diz para enviar a ligação da adesão à mão.
  await expect(page.getByText(/Contrato aprovado, mas o e-mail ao cliente falhou/)).toBeVisible();
  await page.reload();
  await expect(contrato).toContainText("Assinado a");
  await expect(page.getByTestId("historico-lead")).toContainText("O cliente carregou o contrato");

  // 5. Folheto com o nome e o telefone do registo de quem o gera.
  await page.goto("/admin/documentos");
  await page.waitForLoadState("networkidle");
  const folheto = page.getByTestId("folheto-visita");
  await folheto.getByLabel("O meu telefone").fill("912 000 111");
  await folheto.getByRole("button", { name: "Guardar" }).click();
  await expect(folheto.getByText("Telefone guardado.")).toBeVisible();
  const r = await page.request.get("/admin/documentos/folheto");
  expect(r.headers()["content-type"]).toBe("application/pdf");
  const corpo = (await r.body()).toString("latin1");
  expect(corpo).toContain("Raphael Martins");
  expect(corpo).toContain("912 000 111");
});
