import { expect, test, type Page } from "@playwright/test";
import { contas, PALAVRA_PASSE, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Campanhas comerciais (D-190): a Performa LAB liga o «Anual 14» do Pro; ao registar uma barbearia
// pelo painel escolhe essa condição especial; a barbearia fica no anual com a Implementação
// Essencial de oferta e o dono vê a condição e o primeiro período de 14 meses.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("ligar o Anual 14 e registar uma barbearia com ele", async ({ page, browser }, info) => {
  const c = contas(info.project.name);
  const nome = `Barbearia Campanha ${info.project.name}`;

  // 1. Ligar a campanha em Comercial → Campanhas.
  await entrarAdmin(page, c.adminCampanhas);
  await page.goto("/admin/comercial/campanhas");
  const cartao = page.locator('[data-testid="campanha"][data-chave="anual14_pro"]');
  await expect(cartao).toContainText("+2 meses de oferta no primeiro período");
  await cartao.getByLabel("Ligada").check();
  await cartao.getByRole("button", { name: "Guardar" }).click();
  await expect(cartao.getByText("Guardado.")).toBeVisible();

  // 2. Registar a barbearia com a condição especial.
  await page.goto("/admin/barbearias/nova");
  const form = page.getByTestId("registo-barbearia");
  await form.getByLabel("Nome da barbearia *").fill(nome);
  await form.getByLabel("Nome do dono *").fill("Rita Campanha");
  await form.getByLabel("E-mail do dono (entrada no painel) *").fill(c.donoCampanhas);
  await form.getByLabel("Condição especial").selectOption({ label: "Anual 14" });
  await form.getByRole("button", { name: "Registar e enviar as boas-vindas" }).click();
  await expect(page.getByText(/Barbearia registada/)).toBeVisible();

  const bd = servico();
  const { data: b } = await bd
    .from("inquilinos")
    .select("id, periodicidade, campanha_id, implementacao, implementacao_sem_iva")
    .eq("nome", nome)
    .single();
  expect(b).toMatchObject({ periodicidade: "anual", implementacao: "essencial" });
  expect(b!.campanha_id).not.toBeNull();
  expect(Number(b!.implementacao_sem_iva)).toBe(0);

  // 3. O dono vê a condição e o primeiro período de 14 meses.
  const { data: ligacao } = await bd.auth.admin.generateLink({
    type: "recovery",
    email: c.donoCampanhas,
    options: { redirectTo: "http://localhost:3000/entrar/confirmar" },
  });
  const dono = await (await browser.newContext(info.project.use)).newPage();
  await dono.goto(`/entrar/confirmar?token_hash=${ligacao.properties!.hashed_token}&type=recovery`);
  await dono.getByLabel("Palavra-passe", { exact: true }).fill(PALAVRA_PASSE);
  await dono.getByLabel("Repita a palavra-passe").fill(PALAVRA_PASSE);
  await dono.getByRole("button", { name: "Guardar e entrar" }).click();
  await expect(dono).toHaveURL("/app");
  await dono.goto("/app/plano");
  const pagar = dono.getByTestId("enviar-comprovativo");
  await expect(pagar).toContainText("Condição especial «Anual 14»");
  await expect(pagar).toContainText("399,90");
  const texto = (await pagar.textContent()) ?? "";
  const [, d1, m1, a1, d2, m2, a2] = texto
    .match(/(\d{2})\/(\d{2})\/(\d{4}) – (\d{2})\/(\d{2})\/(\d{4})/)!
    .map(Number);
  // O primeiro período vai do início ao dia antes de passarem 14 meses (12 + 2 de oferta).
  const fim = new Date(Date.UTC(a1!, m1! - 1 + 14, d1!) - 86_400_000);
  expect([fim.getUTCDate(), fim.getUTCMonth() + 1, fim.getUTCFullYear()]).toEqual([d2, m2, a2]);
});
