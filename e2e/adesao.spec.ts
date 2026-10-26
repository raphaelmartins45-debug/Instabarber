import { expect, test, type Page } from "@playwright/test";
import { contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Resultado verificável da Fase 3: uma barbearia criada de ponta a ponta pela interface —
// formulário, pedido, aprovação, pacote, conta do dono, entrada do dono e importação CSV.

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

test("adesão, aprovação, entrada do dono e importação CSV", async ({ page, browser }, info) => {
  const c = contas(info.project.name);
  const nome = `Barbearia Ensaio ${info.project.name}`;

  // 1. O dono preenche os quatro passos.
  await page.goto("/adesao");
  await page.getByLabel("Nome da barbearia").fill(nome);
  await page.getByLabel("Responsável").fill("Marta Ensaio");
  await page.getByLabel("NIF da barbearia").fill("509999999");
  await page.getByTestId("imagem-logo").setInputFiles("public/marca/ib-512.png");
  await expect(page.getByText("Carregado")).toBeVisible();
  await page.getByRole("button", { name: "Seguinte" }).click();

  await page.getByLabel("Telefone da barbearia").fill("232 000 000");
  await page.getByLabel("E-mail da barbearia").fill("geral@ensaio.pt");
  await page.getByLabel("Cidade ou concelho").fill("Viseu");
  await page.getByLabel("Morada", { exact: true }).fill("Rua Direita, 1");
  await page.getByRole("button", { name: "Seguinte" }).click();

  await page.getByLabel("Serviço").first().fill("Corte");
  await page.getByLabel("Preço (€)").first().fill("15,00");
  await page.getByRole("button", { name: "Seguinte" }).click();

  // Pro com 4 profissionais: 49,00 € / 60,27 € (D.5).
  await page.getByRole("button", { name: "Mais um profissional" }).click();
  await expect(page.getByTestId("profissionais")).toHaveText("4");
  await expect(page.getByTestId("caixa-preco")).toContainText("60,27");
  await expect(page.getByTestId("caixa-preco")).toContainText("49,00");
  await page.getByLabel("E-mail de acesso do proprietário").fill(c.donoAdesao);
  await page.getByRole("checkbox").last().check();
  await page.getByRole("button", { name: "Enviar para a Performa LAB" }).click();
  await expect(page.getByTestId("pedido-enviado")).toBeVisible();
  const pdf = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descarregar o resumo da contratação (PDF)" }).click();
  expect((await pdf).suggestedFilename()).toBe("resumo-da-contratacao-instabarber.pdf");

  // 2. A Performa LAB aprova.
  const admin = await (await browser.newContext()).newPage();
  await entrarAdmin(admin, c.adminAdesao);
  // O painel geral lista o pedido pendente, com «Aprovar» ao lado (D-165).
  const noPainel = admin.getByTestId("painel-pedido").filter({ hasText: nome });
  await expect(noPainel.getByRole("button", { name: "Aprovar" })).toBeVisible();
  await admin.goto("/admin/pedidos");
  await admin.getByRole("link", { name: nome }).first().click();
  await expect(admin.getByText("Dados do pedido")).toBeVisible();
  await admin.getByRole("button", { name: "Aprovar", exact: true }).click();
  await admin
    .getByRole("alertdialog")
    .getByRole("button", { name: "Aprovar", exact: true })
    .click();
  await expect(admin).toHaveURL(/\/admin\/barbearias\/[0-9a-f-]{36}$|\/identidade$/, {
    timeout: 20_000,
  });
  await expect(admin.getByTestId("ficha-nome")).toHaveText(nome);
  await expect(admin.getByTestId("ficha-mensalidade")).toContainText("60,27");

  // O pacote Pro ficou aplicado (a grelha mostra todas menos a multilinguagem).
  // No telemóvel os separadores são passos: navega-se pelo endereço.
  const ficha = new URL(admin.url()).pathname.replace(/\/identidade$/, "");
  await admin.goto(`${ficha}/funcionalidades`);
  await expect(admin.getByTestId("contador-ativas")).toContainText(/de \d+ ativas/);

  // 3. O dono define a palavra-passe pela ligação segura e entra no painel.
  const { data } = await servico().auth.admin.generateLink({
    type: "recovery",
    email: c.donoAdesao,
    options: { redirectTo: "http://localhost:3000/entrar/confirmar" },
  });
  const dono = await (await browser.newContext()).newPage();
  await dono.goto(`/entrar/confirmar?token_hash=${data.properties!.hashed_token}&type=recovery`);
  await dono.getByLabel("Palavra-passe", { exact: true }).fill("Dono-Ensaio-2026");
  await dono.getByLabel("Repita a palavra-passe").fill("Dono-Ensaio-2026");
  await dono.getByRole("button", { name: "Guardar e entrar" }).click();
  await expect(dono).toHaveURL("/app");
  await expect(dono.getByTestId("vista")).toHaveText("Vista do gestor");
  await expect(dono.getByText(nome)).toBeVisible();

  // 4. Importação CSV de clientes: duas válidas, uma com erro.
  await admin.goto(`${ficha}/importacao`);
  const clientes = admin.getByTestId("importar-clientes");
  await clientes.locator('input[type="file"]').setInputFiles({
    name: "clientes.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "nome;telemovel;email\nAna;912345001;ana@x.pt\nBruno;123;\nCarla;912345002;\n",
    ),
  });
  await expect(clientes).toContainText("2 linha(s) válida(s) · 1 com erro");
  await expect(clientes).toContainText("Linha 3: telemóvel inválido");
  await clientes.getByRole("button", { name: "Gravar 2 linha(s) válida(s)" }).click();
  await expect(clientes).toContainText("2 linha(s) gravada(s).");

  // 5. Exportação dos dados em ZIP e vista de apoio só de leitura, com faixa e saída.
  const zip = admin.waitForEvent("download");
  await admin.getByRole("link", { name: "Exportar dados (CSV)" }).click();
  expect((await zip).suggestedFilename()).toMatch(/^dados-barbearia-ensaio-.*\.zip$/);
  await admin.getByRole("button", { name: "Vista de apoio" }).click();
  await admin
    .getByRole("alertdialog")
    .getByLabel("Justificação")
    .fill("Pedido de apoio do dono por telefone");
  await admin.getByRole("button", { name: "Abrir a vista de apoio" }).click();
  await expect(admin).toHaveURL("/app");
  await expect(admin.getByTestId("faixa-apoio")).toContainText(nome);
  await admin.getByRole("button", { name: "Sair da vista de apoio" }).click();
  await expect(admin).toHaveURL(/\/admin\/barbearias\//);
});
