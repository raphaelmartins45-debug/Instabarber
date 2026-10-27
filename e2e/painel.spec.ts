import { expect, test, type Page } from "@playwright/test";
import { contas, telefones, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Resultado verificável da Fase 4: um dia completo gerido no sistema — balcão, agenda, concluir,
// clientes e ficha técnica, financeiro, comissões e acertos, Gestão do sistema e a área do
// barbeiro. Cada projeto (computador, telemóvel) usa o seu barbeiro e os seus clientes.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(3 * 60_000);

/** Só o que está visível (as tabelas existem duas vezes: tabela e cartões). */
const visivel = (page: Page, testId: string) => page.getByTestId(testId).locator("visible=true");

test("um dia completo na barbearia", async ({ page, browser }, info) => {
  const c = contas(info.project.name);
  const tel = telefones(info.project.name);
  const barbeiro = info.project.name === "computador" ? "Carlos" : "Tiago";
  const novo = info.project.name === "computador" ? "913700001" : "913700002";
  await entrarEquipa(page, c.dono);
  await expect(page).toHaveURL("/app");

  // 1. Serviço feito agora, ao balcão, para um cliente que já existe (com extra pago ao balcão).
  await page.getByRole("link", { name: "Registar serviço ao balcão" }).click();
  await page.getByLabel("Telemóvel do cliente").fill(tel.semConta);
  await page.getByRole("button", { name: "Procurar" }).click();
  await expect(page.getByTestId("cliente-encontrado")).toContainText("Rita Balcão");
  await page.getByLabel("Profissional").selectOption({ label: barbeiro });
  await page.getByLabel("Hora").fill("00:30");
  await page.getByLabel("Valor cobrado (€)").fill("17,50");
  await page.getByRole("button", { name: "Registar e concluir" }).click();
  await expect(page).toHaveURL(/\/app\/agenda\?dia=/);

  // 2. Marcar um cliente novo na primeira vaga do barbeiro.
  await page.goto("/app/agenda/marcar");
  await page.getByLabel("Telemóvel do cliente").fill(novo);
  await page.getByRole("button", { name: "Procurar" }).click();
  await page.getByLabel("Nome do cliente").fill(`Novo ${barbeiro}`);
  await page.getByLabel("O cliente aceita receber mensagens").check();
  await page.getByLabel("Profissional").selectOption({ label: barbeiro });
  const hora = page.getByLabel("Hora");
  await expect(hora.locator("option")).not.toHaveCount(1);
  await hora.selectOption({ index: 1 });
  await page.getByRole("button", { name: "Marcar", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/agenda\?dia=/);

  // 3. Concluir na agenda: a marcação passa a verde.
  const coluna = page.locator("section", {
    has: page.getByRole("heading", { name: barbeiro, exact: true }),
  });
  const marcada = coluna.getByTestId("marcacao").filter({ hasText: `Novo ${barbeiro}` });
  await expect(marcada).toHaveAttribute("data-estado", "agendada");
  await expect(marcada.getByRole("link", { name: "Lembrete" })).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/351/,
  );
  // O botão só abre a confirmação depois de a página ficar interativa.
  await page.waitForLoadState("networkidle");
  await marcada.getByRole("button", { name: "Concluir" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Concluir" }).click();
  await expect(marcada).toHaveAttribute("data-estado", "concluida");

  // 4. Ficha do cliente com uma nota técnica.
  await page.goto(`/app/clientes?q=Novo ${barbeiro}`);
  await visivel(page, "linha-cliente")
    .getByRole("link", { name: `Novo ${barbeiro}` })
    .click();
  await expect(page.getByTestId("ficha-cliente")).toHaveText(`Novo ${barbeiro}`);
  await page.locator('textarea[name="nota"]').fill("Máquina 2 nos lados, tesoura em cima.");
  await page.getByRole("button", { name: "Acrescentar à ficha" }).click();
  await expect(page.getByTestId("nota-tecnica")).toContainText("Máquina 2");

  // 5. Comissões e acertos: a linha do barbeiro tem os dois serviços e regista-se o acerto.
  await page.goto("/app/financeiro/acertos");
  const linha = visivel(page, "linha-acerto").filter({ hasText: barbeiro });
  await expect(linha).toContainText("32,50 €");
  await page.getByLabel("Barbeiro").selectOption({ label: barbeiro });
  await page.getByRole("button", { name: "Registar acerto" }).click();
  await expect(page.getByText("Acerto registado.")).toBeVisible();
  await expect(linha).toContainText("Liquidado");

  // 6. O Financeiro abre com o resumo do mês; uma despesa entra nas contas.
  await page.goto("/app/financeiro");
  await expect(page.getByTestId("resumo-mes")).toBeVisible();
  await page.getByLabel("Tipo").selectOption("despesa");
  await page.getByLabel("Descrição").fill(`Toalhas ${barbeiro}`);
  await page.getByLabel("Valor (€)").fill("12,00");
  await page.getByRole("button", { name: "Acrescentar" }).click();
  await expect(visivel(page, "conta").filter({ hasText: `Toalhas ${barbeiro}` })).toContainText(
    "Por pagar",
  );

  // 7. Gestão do sistema: uma ausência do barbeiro fica na agenda.
  await page.goto("/app/sistema/ausencias");
  await page.getByLabel("Quem").selectOption({ label: barbeiro });
  await page.getByRole("button", { name: "Acrescentar ausência" }).click();
  await expect(
    page.locator("li").filter({ hasText: barbeiro }).filter({ hasText: "Férias" }),
  ).toBeVisible();

  // 8. O barbeiro vê a sua folha de acerto, com a mesma receita, e não entra na Gestão do sistema.
  const b = await (await browser.newContext(info.project.use)).newPage();
  await entrarEquipa(b, c.barbeiro);
  await expect(b).toHaveURL(/\/app\/equipa\/[0-9a-f-]{36}$/);
  const area = b.url();
  await b.goto(`${area}/acertos`);
  await expect(b.getByTestId("folha-acerto")).toContainText("32,50 €");
  await b.goto("/app/sistema/estado");
  await expect(b).toHaveURL(area);
});
