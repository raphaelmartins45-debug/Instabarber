import { expect, test } from "@playwright/test";
import { ligacaoDoUltimoEmail } from "./auxiliares/correio";
import { BARBEARIA_A, BARBEARIA_B, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Os papéis da equipa e da plataforma, cada um no seu painel (B.6), o convite do barbeiro
// (E.3), o segundo fator do super_admin e uma conta em duas barbearias.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

test("o gestor entra no painel da barbearia e não vê o /admin", async ({ page }, info) => {
  await entrarEquipa(page, contas(info.project.name).dono);
  await expect(page).toHaveURL("/app");
  await expect(page.getByTestId("vista")).toHaveText("Vista do gestor");
  await expect(page.getByText(BARBEARIA_A.nome)).toBeVisible();
  // Menu montado pelas funcionalidades do Pro: a Loja está; as mensagens não são abas.
  // No telemóvel a Loja fica no «Mais» da navegação inferior: conta-se a presença, não a visibilidade.
  await expect(page.locator('[data-menu="loja"]')).not.toHaveCount(0);
  await expect(page.locator('[data-menu="sistema"]')).not.toHaveCount(0);
  const admin = await page.goto("/admin");
  expect(admin?.status()).toBe(404);
});

test("o barbeiro entra na sua área e não abre a Gestão do sistema", async ({ page }, info) => {
  const nome = info.project.name === "computador" ? "Carlos" : "Tiago";
  await entrarEquipa(page, contas(info.project.name).barbeiro);
  await expect(page).toHaveURL(/\/app\/equipa\/[0-9a-f-]{36}$/);
  await expect(page.getByTestId("vista")).toHaveText(`Vista do ${nome}`);
  const area = page.url();
  await page.goto("/app/sistema");
  await expect(page).toHaveURL(area);
  // A área de outro barbeiro não existe para ele.
  const outro = await page.goto("/app/equipa/00000000-0000-4000-8000-000000000000");
  expect(outro?.status()).toBe(404);
});

test("o super_admin sem segundo fator não entra no /admin; com ele, entra", async ({
  page,
}, info) => {
  await entrarEquipa(page, contas(info.project.name).admin);
  await expect(page).toHaveURL("/admin/dois-passos");
  await page.goto("/admin");
  await expect(page).toHaveURL("/admin/dois-passos");

  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
  await expect(page.getByRole("heading", { name: "Painel geral" })).toBeVisible();
});

test("uma conta em duas barbearias escolhe e troca de barbearia", async ({ page }, info) => {
  await entrarEquipa(page, contas(info.project.name).duplo);
  await expect(page).toHaveURL("/app/escolher");
  await page.getByRole("button", { name: new RegExp(BARBEARIA_B.nome) }).click();
  await expect(page).toHaveURL("/app");
  await expect(page.getByTestId("vista")).toHaveText("Vista do gestor");
  await expect(page.getByText(BARBEARIA_B.nome)).toBeVisible();
  // O Basic não tem Loja: a aba sai do menu.
  await expect(page.locator('[data-menu="loja"]')).toHaveCount(0);

  await page.getByRole("link", { name: "Trocar de barbearia" }).click();
  await page.getByRole("button", { name: new RegExp(BARBEARIA_A.nome) }).click();
  await expect(page).toHaveURL(/\/app\/equipa\//);
  await expect(page.getByTestId("vista")).toHaveText("Vista do Duplo");
});

test("convite do barbeiro de ponta a ponta", async ({ page, browser }, info) => {
  const c = contas(info.project.name);
  await entrarEquipa(page, c.dono);
  await page.goto("/app/sistema/equipa");
  const nome = `Nuno Novo ${info.project.name}`;
  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("E-mail").fill(c.novo);
  await page.getByLabel("NIF (opcional)").fill("123456789");
  await page.getByRole("button", { name: "Registar e enviar convite" }).click();
  await expect(page.getByText(`Convite enviado para ${c.novo}.`)).toBeVisible();
  await expect(page.getByTestId("membro-equipa").filter({ hasText: nome })).toContainText(
    "Ainda não entrou",
  );

  // O barbeiro abre a ligação do e-mail noutro browser e define a palavra-passe.
  const ligacao = await ligacaoDoUltimoEmail(c.novo);
  const barbeiro = await (await browser.newContext()).newPage();
  await barbeiro.goto(ligacao);
  await expect(barbeiro).toHaveURL(/\/entrar\/definir$/);
  await barbeiro.getByLabel("Palavra-passe", { exact: true }).fill("Nova-Palavra-2026");
  await barbeiro.getByLabel("Repita a palavra-passe").fill("Nova-Palavra-2026");
  await barbeiro.getByRole("button", { name: "Guardar e entrar" }).click();
  await expect(barbeiro).toHaveURL(/\/app\/equipa\//);
  await expect(barbeiro.getByTestId("vista")).toHaveText("Vista do Nuno");

  // A ligação só serve uma vez.
  await barbeiro.goto(ligacao);
  await expect(barbeiro.getByText("A ligação expirou ou já foi usada")).toBeVisible();
});
