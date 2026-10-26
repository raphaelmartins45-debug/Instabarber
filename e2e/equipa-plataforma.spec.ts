import { expect, test, type Browser, type Page } from "@playwright/test";
import { contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Equipa InstaBarber (D-161): o comercial só tem o Comercial dos seus leads; o gestor
// administra sem gerir contas; o dono convida e desativa.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(2 * 60_000);

/** Entra com a palavra-passe e inscreve o código de 6 dígitos (primeira entrada da conta). */
async function entrar(browser: Browser, email: string): Promise<Page> {
  const page = await (await browser.newContext()).newPage();
  await entrarEquipa(page, email);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).not.toHaveURL(/dois-passos/);
  return page;
}

test("comercial, gestor e dono: cada um só o que lhe pertence", async ({ browser }, info) => {
  const projeto = info.project.name;
  const c = contas(projeto);
  const lead = `Lead ${projeto} ${Date.now() % 100000}`;

  // Comercial: entra direto no Comercial e não abre mais nada.
  const comercial = await entrar(browser, c.comercialVendas);
  await expect(comercial).toHaveURL("/admin/comercial");
  await comercial.goto("/admin/barbearias");
  await expect(comercial).toHaveURL("/admin/comercial");
  await comercial.goto("/admin/comercial/modelos");
  await expect(comercial).toHaveURL("/admin/comercial");
  await comercial.goto("/admin/financas");
  await expect(comercial).toHaveURL("/admin/comercial");
  await expect(comercial.getByRole("link", { name: "Modelos", exact: true })).toHaveCount(0);

  await comercial.goto("/admin/comercial/leads/novo");
  await comercial.getByLabel("Nome do contacto").fill(`Contacto ${projeto}`);
  await comercial.getByLabel("Barbearia").fill(lead);
  await comercial
    .getByLabel("Telemóvel")
    .fill(`93${String(Date.now() % 10000000).padStart(7, "0")}`);
  await comercial.getByLabel("Próxima ação", { exact: true }).fill("Ligar amanhã");
  await comercial.getByLabel("Data da próxima ação").fill("2030-01-15");
  await comercial.getByRole("button", { name: "Criar lead" }).click();
  await expect(comercial.getByTestId("lead-nome")).toHaveText(lead);
  const fichaLead = comercial.url();
  await expect(comercial.getByRole("button", { name: "Atribuir" })).toHaveCount(0);

  // O comercial faz o briefing e a proposta do seu lead, sem descontos (desligados).
  await comercial.getByRole("link", { name: "Abrir o briefing" }).click();
  await comercial.getByRole("button", { name: "Seguinte" }).click();
  await comercial.getByLabel("N.º de barbeiros *").fill("3");
  await comercial.getByRole("button", { name: "Seguinte" }).click();
  await comercial.getByLabel("WhatsApp", { exact: true }).check();
  await comercial.getByLabel("Clientes ativos (estimativa) *").fill("200");
  await comercial.getByLabel("Valor médio de uma visita (€) *").fill("15");
  await comercial.getByRole("button", { name: "Seguinte" }).click();
  await comercial.getByLabel("Faltas", { exact: true }).check();
  await comercial.getByLabel("Objetivo principal nos próximos três meses *").fill("Menos faltas");
  await comercial.getByRole("button", { name: "Seguinte" }).click();
  await comercial.getByRole("button", { name: "Seguinte" }).click();
  await expect(comercial.getByLabel("Desconto na mensalidade (%)")).toHaveCount(0);
  await comercial.getByRole("button", { name: "Gerar proposta" }).click();
  await expect(comercial.getByTestId("propostas-lead")).toContainText("Rascunho");
  const pdf = await comercial.request.get(
    (await comercial.getByRole("link", { name: "Descarregar PDF" }).getAttribute("href"))!,
  );
  expect(pdf.status()).toBe(200);
  await comercial.getByRole("button", { name: "Marcar como enviada" }).click();
  await expect(comercial.getByTestId("propostas-lead")).toContainText("Enviada");

  // Mensagens prontas (D-162): abre o WhatsApp e confirma à mão; fica no histórico.
  await comercial.goto(fichaLead);
  const [conversa] = await Promise.all([
    comercial.context().waitForEvent("page"),
    comercial.getByRole("link", { name: /Primeiro contacto/ }).click(),
  ]);
  expect(conversa.url()).toMatch(/wa\.me|whatsapp\.com/);
  await conversa.close();
  await comercial.getByRole("button", { name: "Já enviei" }).click();
  await expect(comercial.getByText("Mensagem registada no histórico.")).toBeVisible();
  await expect(comercial.getByTestId("historico-lead")).toContainText("«Primeiro contacto»");

  // Só os leads dele: nunca os que o comercial do outro projeto criou.
  const outro = projeto === "computador" ? "telemovel" : "computador";
  await comercial.goto("/admin/comercial/leads");
  await expect(comercial.getByTestId("lead").filter({ visible: true }).first()).toBeVisible();
  await expect(comercial.getByText(`Contacto ${outro}`)).toHaveCount(0);

  await comercial.goto("/admin/comercial/desempenho");
  await expect(comercial.getByRole("heading", { name: /O meu desempenho/ })).toBeVisible();
  await expect(comercial.getByTestId("desempenho")).toContainText("Leads novos");
  await expect(comercial.getByRole("heading", { name: "Hoje" })).toBeVisible();
  await expect(comercial.getByRole("heading", { name: "Carteira de clientes" })).toBeVisible();
  await comercial.context().close();

  // Gestor: administra, vê o lead e o responsável, mas não gere a equipa.
  const gestor = await entrar(browser, c.gestor);
  await expect(gestor).toHaveURL("/admin");
  await gestor.goto("/admin/equipa");
  await expect(gestor).toHaveURL("/admin");
  await gestor.goto(`/admin/comercial/leads?q=${encodeURIComponent(lead)}`);
  await expect(gestor.getByTestId("lead").filter({ visible: true })).toContainText(
    c.comercialVendas,
  );
  await gestor.goto("/admin/comercial/condicoes");
  await expect(gestor.getByRole("heading", { name: "Condições comerciais" })).toBeVisible();
  await gestor.context().close();

  // Dono: vê a equipa, convida e desativa.
  const dono = await entrar(browser, c.adminEquipa);
  await dono.goto("/admin/equipa");
  await expect(
    dono.getByTestId("membro").filter({ visible: true, hasText: c.gestor }),
  ).toBeVisible();
  const novo = `novo-com-${projeto}-${Date.now() % 100000}@teste.instabarber.pt`;
  await dono.getByLabel("Nome").fill(`Novo ${projeto}`);
  await dono.getByLabel("E-mail (@instabarber.pt)").fill(novo);
  await dono.getByRole("button", { name: "Convidar", exact: true }).click();
  await expect(dono.getByText(/Convite enviado/)).toBeVisible();
  const membro = dono.getByTestId("membro").filter({ visible: true, hasText: novo });
  await expect(membro).toContainText("Ainda não entrou");
  await membro.getByRole("button", { name: "Desativar" }).click();
  await dono.getByRole("alertdialog").getByRole("button", { name: "Desativar" }).click();
  await expect(membro).toContainText("Desativada");

  // Barbearia de demonstração (D-162): uma só para todos, por isso só num dos projetos.
  if (projeto === "computador") {
    await dono.goto("/admin/comercial");
    await dono.getByRole("button", { name: "Preparar dados de hoje" }).click();
    await expect(dono.getByText("Demonstração pronta.")).toBeVisible();
    await dono.getByRole("button", { name: "Abrir o painel da demonstração" }).click();
    await expect(dono).toHaveURL(/\/app/);
    await expect(dono.getByText(/Barbearia Demonstração/).first()).toBeVisible();
    await dono.goto("/admin/equipa");
  }

  await dono.getByLabel("E-mail (@instabarber.pt)").fill("alguem@gmail.com");
  await dono.getByLabel("Nome").fill("Alguém");
  await dono.getByRole("button", { name: "Convidar", exact: true }).click();
  await expect(dono.getByText("Use um e-mail @instabarber.pt.")).toBeVisible();
  await dono.context().close();
});
