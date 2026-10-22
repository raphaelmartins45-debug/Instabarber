import { expect, test, type Page } from "@playwright/test";
import { fromZonedTime } from "date-fns-tz";
import { BARBEARIA_A, BARBEARIA_B, contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";
import { codigoTotp } from "./auxiliares/totp";

// Resultado verificável da Fase 6: filas, loja do lado público, mensagens registadas, relatório
// igual ao Início, e módulos de pagamentos e faturação desligados e invisíveis.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

const FUNCIONALIDADES = [
  "fila_espera",
  "qr_entrada",
  "envio_mensagens",
  "loja_produtos",
  "relatorio_mensal",
];

test.beforeAll(async () => {
  const { error } = await servico()
    .from("inquilino_funcionalidades")
    .upsert(
      FUNCIONALIDADES.map((chave) => ({ inquilino_id: BARBEARIA_A.id, chave, ativa: true })),
      { onConflict: "inquilino_id,chave" },
    );
  if (error) throw new Error(error.message);
});

const sufixo = (projeto: string) => (projeto === "computador" ? "1" : "2");
// Dias de calendário a partir de hoje em Lisboa (somar 24 h falha perto da meia-noite nas
// semanas da mudança da hora).
const lisboa = (deslocamento: number) => {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());
  const d = new Date(`${hoje}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deslocamento);
  return d.toISOString().slice(0, 10);
};

test("fila de espera: sem vagas o cliente entra; abre a vaga e a barbearia avisa por wa.me", async ({
  page,
  browser,
}, info) => {
  const bd = servico();
  const desloca = info.project.name === "computador" ? 5 : 6;
  const dia = lisboa(desloca);
  const { data: ausencia } = await bd
    .from("ausencias")
    .insert({
      inquilino_id: BARBEARIA_A.id,
      tipo: "folga",
      inicio: fromZonedTime(`${dia}T00:00:00`, "Europe/Lisbon").toISOString(),
      fim: fromZonedTime(`${lisboa(desloca + 1)}T00:00:00`, "Europe/Lisbon").toISOString(),
    })
    .select("id")
    .single();
  const nome = `Fila Espera ${info.project.name}`;
  await page.goto(`/${BARBEARIA_A.slug}/marcar`);
  await page.getByRole("button", { name: /Corte/ }).first().click();
  const semPreferencia = page.getByRole("button", { name: /Sem preferência/ });
  if (await semPreferencia.isVisible()) await semPreferencia.click();
  await page.getByRole("tab").nth(desloca).click();
  await page.getByRole("button", { name: "Entrar na fila de espera" }).click();
  await page.locator("#fe-nome").fill(nome);
  await page.locator("#fe-telefone").fill(`93${sufixo(info.project.name)}000777`);
  await page.getByRole("button", { name: "Entrar na fila", exact: true }).click();
  await expect(page.getByTestId("na-fila-espera")).toContainText("1.º lugar");

  const gestor = await (await browser.newContext()).newPage();
  await entrarEquipa(gestor, contas(info.project.name).dono);
  await gestor.goto(`/app/agenda?dia=${dia}`);
  const entrada = gestor.getByTestId("fila-espera").locator("li", { hasText: nome });
  await expect(entrada).toContainText("Ainda não há vaga neste dia.");

  await bd.from("ausencias").delete().eq("id", ausencia!.id);
  await gestor.reload();
  const avisar = entrada.getByRole("link", { name: "Avisar da vaga" });
  expect(await avisar.getAttribute("href")).toMatch(/^https:\/\/wa\.me\/3519\d+\?text=/);
  const popup = gestor.context().waitForEvent("page");
  await avisar.click();
  await (await popup).close();
  await expect(entrada).toContainText("Avisado · responde até às");
  const { count } = await bd
    .from("mensagens")
    .select("id", { count: "exact", head: true })
    .eq("inquilino_id", BARBEARIA_A.id)
    .eq("tipo", "fila")
    .eq("estado", "ligacao_aberta");
  expect(count).toBeGreaterThan(0);
});

test("fila presencial por QR: o cliente vê a posição e a barbearia chama-o", async ({
  page,
  browser,
}, info) => {
  const nome = `Fila QR ${info.project.name}`;
  await page.goto(`/${BARBEARIA_A.slug}/fila`);
  await page.locator("#fp-nome").fill(nome);
  await page.locator("#fp-telefone").fill(`93${sufixo(info.project.name)}000888`);
  await page.getByRole("button", { name: "Entrar na fila" }).click();
  await expect(page.getByTestId("estado-fila")).toContainText(/\d+\.º lugar/);

  const gestor = await (await browser.newContext()).newPage();
  await entrarEquipa(gestor, contas(info.project.name).dono);
  await gestor.goto("/app/agenda");
  const entrada = gestor.getByTestId("fila-presencial").locator("li", { hasText: nome });
  await entrada.getByRole("button", { name: "Chamar" }).click();
  await expect(entrada).toContainText("Em atendimento");
  await page.reload();
  await expect(page.getByTestId("estado-fila")).toHaveText("Chegou a sua vez.");

  await gestor.goto("/app/agenda/qr");
  await expect(gestor.getByTestId("endereco-fila")).toHaveText(/\/fila$/);
  await expect(gestor.getByRole("img", { name: "Código QR da fila" })).toBeVisible();
});

test("loja na página pública: encomenda com pagamento ao balcão", async ({ page }, info) => {
  const bd = servico();
  const produto = `Pomada Ensaio ${info.project.name}`;
  await bd.from("produtos").insert({
    inquilino_id: BARBEARIA_A.id,
    nome: produto,
    custo: 5,
    preco_venda: 12,
    stock: 10,
  });
  await page.goto(`/${BARBEARIA_A.slug}`);
  await page.getByTestId("encomendar").click();
  await page.getByRole("button", { name: `Juntar um: ${produto}` }).click();
  await page.getByRole("button", { name: `Juntar um: ${produto}` }).click();
  await expect(page.getByTestId("total-encomenda")).toContainText("24,00 €");
  const telefone = `93${sufixo(info.project.name)}000999`;
  await page.locator("#lj-nome").fill(`Cliente Loja ${info.project.name}`);
  await page.locator("#lj-telefone").fill(telefone);
  await page.getByRole("button", { name: "Fazer encomenda" }).click();
  await expect(page.getByTestId("encomenda-feita")).toBeVisible();
  const { data } = await bd
    .from("pedidos_loja")
    .select("total, estado, clientes!inner(telefone)")
    .eq("clientes.telefone", `+351${telefone}`);
  expect(data?.[0]).toMatchObject({ total: 24, estado: "novo" });
});

test("o relatório mostra a mesma faturação do Início", async ({ page }, info) => {
  await entrarEquipa(page, contas(info.project.name).dono);
  await expect
    .poll(async () => {
      await page.goto("/app/relatorio");
      const relatorio = await page.getByTestId("bloco-1").locator("text=/€/").first().textContent();
      await page.goto("/app");
      const inicio = await page.getByTestId("indicadores").locator("text=/€/").nth(2).textContent();
      return relatorio === inicio;
    })
    .toBe(true);
});

async function entrarAdmin(page: Page, email: string) {
  await entrarEquipa(page, email);
  await expect(page).toHaveURL("/admin/dois-passos");
  const segredo = (await page.getByTestId("segredo-totp").textContent())!.trim();
  await page.getByLabel("Código de 6 dígitos").fill(codigoTotp(segredo));
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL("/admin");
}

test("módulos desligados: invisíveis à barbearia; ligar e desligar fica em auditoria", async ({
  page,
  browser,
}, info) => {
  const webhook = await page.request.post("/api/webhooks/pagamentos", { data: "{}" });
  expect(webhook.status()).toBe(404);

  const gestor = await (await browser.newContext()).newPage();
  await entrarEquipa(gestor, contas(info.project.name).dono);
  expect((await gestor.goto("/admin/modulos"))?.status()).toBe(404);
  for (const ecra of [
    "/app",
    "/app/agenda",
    "/app/clientes",
    "/app/financeiro",
    "/app/loja",
    "/app/relatorio",
    "/app/plano",
    "/app/sistema/clube",
  ]) {
    await gestor.goto(ecra);
    const texto = await gestor.locator("body").innerText();
    for (const proibido of [
      "Módulos preparados",
      "Pedir pagamento",
      "Emitir fatura",
      "Documentos fiscais",
    ])
      expect(texto, `${ecra}: ${proibido}`).not.toContain(proibido);
  }

  await entrarAdmin(page, contas(info.project.name).adminModulos);
  await page.goto("/admin/modulos");
  await page.getByTestId("interruptor-pagamentos").click();
  await page.getByRole("button", { name: "Ligar" }).click();
  await expect(page.getByText(/Faltam as chaves do fornecedor/).first()).toBeVisible();

  const modulo = info.project.name === "computador" ? "pagamentos" : "faturacao";
  // A tabela também se desenha em cartões (telemóvel): conta só a que está à vista.
  const botao = page
    .getByTestId(`interruptor-${modulo}-${BARBEARIA_B.id}`)
    .filter({ visible: true });
  await botao.click();
  await page.getByRole("button", { name: "Ligar" }).click();
  await expect(botao).toHaveText("Ligado");
  await botao.click();
  await page.getByRole("button", { name: "Desligar" }).click();
  await expect(botao).toHaveText("Desligado");
  const { data } = await servico()
    .from("auditoria")
    .select("accao, detalhes")
    .eq("inquilino_id", BARBEARIA_B.id)
    .like("accao", "inquilino_modulos_%");
  const deste = (data ?? []).filter((a) => (a.detalhes as { chave?: string })?.chave === modulo);
  expect(deste.length).toBeGreaterThanOrEqual(2);
});
