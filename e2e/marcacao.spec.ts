import { expect, test, type Browser, type Page } from "@playwright/test";
import { BARBEARIA_A, servico, temSupabase } from "./auxiliares/dados";

// Resultado verificável da Fase 5: um cliente entra pela página pública e marca sem conta; duas
// reservas da mesma vaga, uma recusada; política de faltas. Cada projeto usa o seu barbeiro.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");
test.setTimeout(2 * 60_000);

const barbeiroDe = (projeto: string) => (projeto === "computador" ? "Carlos" : "Tiago");

/** Da página pública até às vagas de amanhã do barbeiro do projeto. */
async function ateVagas(page: Page, barbeiro: string) {
  await page.goto("/barbearia-a");
  await page.getByTestId("acao-marcar").click();
  await expect(page).toHaveURL(/\/barbearia-a\/marcar$/);
  await page.getByTestId("escolher-servico").filter({ hasText: "Corte" }).click();
  await page.getByTestId("escolher-barbeiro").filter({ hasText: barbeiro }).click();
  await page.getByRole("tab").nth(1).click();
  await expect(page.getByTestId("vaga").first()).toBeVisible();
}

async function novaPagina(browser: Browser, projeto: Parameters<Browser["newContext"]>[0]) {
  return (await browser.newContext(projeto)).newPage();
}

test("marcação completa sem conta, pela página pública", async ({ page }, info) => {
  const barbeiro = barbeiroDe(info.project.name);
  const telefone = info.project.name === "computador" ? "936100001" : "936100002";
  await ateVagas(page, barbeiro);
  // Uma vaga ao fim da tarde, longe das dos outros ensaios.
  await page.getByTestId("vaga").filter({ hasText: "18:00" }).click();
  await expect(page.getByTestId("contagem")).toContainText(/Hora reservada durante (09|10):\d\d/);
  await page.getByLabel("Nome").fill(`Público ${barbeiro}`);
  await page.getByLabel("Telemóvel").fill(telefone);
  await page.getByRole("button", { name: "Confirmar marcação" }).click();
  const feita = page.getByTestId("marcacao-confirmada");
  await expect(feita).toContainText(`Corte com ${barbeiro}`);
  await expect(feita).toContainText("às 18:00");
  await expect(feita).toContainText("Pode cancelar até 2 horas antes");

  // Na base de dados, a marcação ficou agendada para o cliente novo.
  const { data } = await servico()
    .from("marcacoes")
    .select("estado, origem, clientes!inner(telefone)")
    .eq("inquilino_id", BARBEARIA_A.id)
    .eq("clientes.telefone", `+351${telefone}`);
  expect(data).toEqual([expect.objectContaining({ estado: "agendada", origem: "online" })]);
});

test("duas reservas da mesma vaga: uma passa, a outra é recusada", async ({
  page,
  browser,
}, info) => {
  const barbeiro = barbeiroDe(info.project.name);
  const outra = await novaPagina(browser, info.project.use);
  await Promise.all([ateVagas(page, barbeiro), ateVagas(outra, barbeiro)]);
  const hora = "19:30";
  // Ao mesmo tempo: a restrição sem_sobreposicao deixa passar uma.
  await Promise.all([
    page.getByTestId("vaga").filter({ hasText: hora }).click(),
    outra.getByTestId("vaga").filter({ hasText: hora }).click(),
  ]);
  const ocupado = "Esta hora acabou de ser ocupada. Escolha outra.";
  await expect
    .poll(async () => {
      const a = await page.getByTestId("contagem").count();
      const b = await outra.getByTestId("contagem").count();
      const ea = await page.getByText(ocupado).count();
      const eb = await outra.getByText(ocupado).count();
      return `${a + b} reservada · ${ea + eb} recusada`;
    })
    .toBe("1 reservada · 1 recusada");
});

test("com duas faltas, a marcação online fica bloqueada", async ({ page }, info) => {
  const barbeiro = barbeiroDe(info.project.name);
  const telefone = info.project.name === "computador" ? "936200001" : "936200002";
  // Cliente de ensaio com duas faltas nos últimos dias (o limite por omissão é 2).
  const bd = servico();
  const { data: cliente } = await bd
    .from("clientes")
    .insert({
      inquilino_id: BARBEARIA_A.id,
      nome: "Faltoso",
      telefone: `+351${telefone}`,
      origem: "balcao",
    })
    .select("id")
    .single();
  const { data: s } = await bd
    .from("servicos")
    .select("id")
    .eq("inquilino_id", BARBEARIA_A.id)
    .eq("nome", "Barba")
    .single();
  const { data: p } = await bd
    .from("profissionais")
    .select("id")
    .eq("inquilino_id", BARBEARIA_A.id)
    .eq("nome_apresentado", barbeiro)
    .single();
  for (const dias of [3, 5]) {
    const inicio = new Date(Date.now() - dias * 86_400_000);
    inicio.setUTCHours(6, 0, 0, 0);
    const { error } = await bd.from("marcacoes").insert({
      inquilino_id: BARBEARIA_A.id,
      cliente_id: cliente!.id,
      profissional_id: p!.id,
      servico_id: s!.id,
      inicio: inicio.toISOString(),
      fim: inicio.toISOString(),
      fim_bloqueio: inicio.toISOString(),
      valor_tabela: 10,
      valor_cobrado: 10,
      origem: "balcao",
      estado: "falta",
    });
    expect(error).toBeNull();
  }

  await ateVagas(page, barbeiro);
  await page.getByTestId("vaga").filter({ hasText: "16:00" }).click();
  await page.getByLabel("Nome").fill("Faltoso");
  await page.getByLabel("Telemóvel").fill(telefone);
  await page.getByRole("button", { name: "Confirmar marcação" }).click();
  await expect(page.getByText("Para marcar, fale com a barbearia.")).toBeVisible();
  await expect(page.getByTestId("marcacao-confirmada")).toHaveCount(0);
});
