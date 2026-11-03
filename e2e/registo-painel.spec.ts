import { expect, test, type Page } from "@playwright/test";
import { contas, PALAVRA_PASSE, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Registo de uma barbearia pelo painel, implementação e cortesia (D-189): a Performa LAB regista a
// barbearia com a Implementação Essencial; o dono vê-a no primeiro pagamento; depois a Performa
// LAB põe-na em cortesia e o dono deixa de ter nada a pagar.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("registar pelo painel com implementação; cortesia tira o pagamento", async ({
  page,
  browser,
}, info) => {
  const c = contas(info.project.name);
  const nome = `Barbearia Registo ${info.project.name}`;

  // 1. A Performa LAB regista a barbearia, com a Implementação Essencial sugerida (50,00 €).
  await entrarAdmin(page, c.adminRegisto);
  await page.goto("/admin/barbearias");
  await page.getByRole("link", { name: "Registar barbearia" }).click();
  const form = page.getByTestId("registo-barbearia");
  await form.getByLabel("Nome da barbearia *").fill(nome);
  await form.getByLabel("Nome do dono *").fill("Rui Registo");
  await form.getByLabel("E-mail do dono (entrada no painel) *").fill(c.donoRegisto);
  await form.getByLabel("Plano").selectOption("basic");
  await expect(form.getByLabel("Profissionais")).toHaveValue("1");
  await expect(form.getByLabel("Valor da implementação, sem IVA (€)")).toHaveValue("50,00");
  await form.getByRole("button", { name: "Registar e enviar as boas-vindas" }).click();
  // Nos ensaios o Resend tem uma chave inválida: regista, mas avisa que o e-mail não saiu.
  await expect(page.getByText(/Barbearia registada/)).toBeVisible();

  const bd = servico();
  const { data: b } = await bd
    .from("inquilinos")
    .select("id, plano, implementacao, implementacao_sem_iva, estado")
    .eq("nome", nome)
    .single();
  expect(b).toMatchObject({ plano: "basic", implementacao: "essencial", estado: "ativo" });
  expect(Number(b!.implementacao_sem_iva)).toBe(50);

  // 2. O dono define a palavra-passe pela ligação segura e vê a implementação no 1.º pagamento.
  const { data: ligacao } = await bd.auth.admin.generateLink({
    type: "recovery",
    email: c.donoRegisto,
    options: { redirectTo: "http://localhost:3000/entrar/confirmar" },
  });
  const painel = await (await browser.newContext(info.project.use)).newPage();
  await painel.goto(
    `/entrar/confirmar?token_hash=${ligacao.properties!.hashed_token}&type=recovery`,
  );
  await painel.getByLabel("Palavra-passe", { exact: true }).fill(PALAVRA_PASSE);
  await painel.getByLabel("Repita a palavra-passe").fill(PALAVRA_PASSE);
  await painel.getByRole("button", { name: "Guardar e entrar" }).click();
  await expect(painel).toHaveURL("/app");
  await painel.goto("/app/plano");
  await expect(painel.getByTestId("enviar-comprovativo")).toContainText(
    "inclui a Implementação Essencial (50,00",
  );

  // 3. Na ficha (Pagamentos), a Performa LAB põe-na em cortesia por 30 dias.
  await page.goto(`/admin/barbearias/${b!.id}/pagamentos`);
  await expect(page.getByTestId("implementacao")).toContainText("Implementação");
  const cortesia = page.getByTestId("cortesia");
  await cortesia.getByLabel("Em cortesia").check();
  const fim = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  await cortesia.getByLabel("Até (opcional)").fill(fim);
  await cortesia.getByRole("button", { name: "Guardar cortesia" }).click();
  await expect(cortesia.getByText("Guardado.")).toBeVisible();
  const { data: depois } = await bd
    .from("inquilinos")
    .select("cortesia, cortesia_ate, proximo_vencimento")
    .eq("id", b!.id)
    .single();
  expect(depois).toMatchObject({ cortesia: true, cortesia_ate: fim });

  // 4. Em cortesia, o dono não tem nada a pagar.
  await painel.reload();
  await expect(painel.getByTestId("plano-cortesia")).toContainText("cortesia até");
  await expect(painel.getByTestId("enviar-comprovativo")).toHaveCount(0);
});
