import { expect, test, type Page } from "@playwright/test";
import {
  BARBEARIA_A,
  contas,
  PALAVRA_PASSE,
  servico,
  telefones,
  temSupabase,
} from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Acesso do cliente (E.4, F.9): telemóvel e palavra-passe; código pedido pelo cliente,
// enviado pela barbearia por wa.me e verificado pela rota api/acesso.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

const entrada = `/${BARBEARIA_A.slug}/cliente`;

/** «Sair» só responde depois de a página ficar interativa. */
async function sairDaArea(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Sair" }).click();
}

async function pedirCodigo(page: Page, telefone: string) {
  await page.goto(entrada);
  // O formulário só responde depois de a página ficar interativa.
  await page.waitForLoadState("networkidle");
  await page.locator("#telefone-codigo").fill(telefone);
  await page.getByRole("button", { name: "Pedir código" }).click();
  await expect(page.getByText("Pedido registado.")).toBeVisible();
}

test("o cliente com conta entra com telemóvel e palavra-passe, também pelo subdomínio", async ({
  page,
}, info) => {
  const { comConta } = telefones(info.project.name);
  await page.goto(`http://${BARBEARIA_A.slug}.localhost:3000/cliente`);
  await page.waitForLoadState("networkidle");
  await page.locator("#telefone").fill("912 000 999");
  await page.locator("#palavra_passe").fill("errada-123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("Telemóvel ou palavra-passe errados.")).toBeVisible();

  await page.locator("#telefone").fill(comConta);
  await page.locator("#palavra_passe").fill(PALAVRA_PASSE);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(`http://${BARBEARIA_A.slug}.localhost:3000/minha-area`);
  await expect(page.getByTestId("vista")).toHaveText("Olá, João Conta");
  // A conta do cliente não abre o painel da equipa.
  await page.goto(`http://${BARBEARIA_A.slug}.localhost:3000/app`);
  await expect(page).toHaveURL(/\/gestor\?erro=sem_acesso$/);
});

test("código de acesso de ponta a ponta: errado, certo e expirado", async ({
  page,
  browser,
}, info) => {
  const { semConta } = telefones(info.project.name);
  await pedirCodigo(page, semConta);

  // A barbearia vê o pedido e abre o WhatsApp com o código escrito.
  const gestor = await (await browser.newContext()).newPage();
  await entrarEquipa(gestor, contas(info.project.name).dono);
  // As duas contas de gestor de teste são da mesma barbearia: o telefone distingue o pedido.
  const pedido = gestor.getByTestId("pedido-acesso").filter({ hasText: `+351${semConta}` });
  await expect(pedido).toContainText("Expira em");
  const wa = pedido.getByRole("link", { name: "Enviar código por WhatsApp" });
  const href = (await wa.getAttribute("href"))!;
  expect(href).toContain(`https://wa.me/351${semConta}?text=`);
  const codigo = /é (\d{6})\./.exec(decodeURIComponent(href))![1]!;
  // «Já enviei» só aparece depois do clique tratado pela página: esperar que fique interativa.
  await gestor.waitForLoadState("networkidle");
  await wa.click();
  await pedido.getByRole("button", { name: "Já enviei" }).click();
  await expect(pedido).toContainText("Enviado");

  // Código errado: recusado.
  const errado = codigo === "000000" ? "111111" : "000000";
  await page.locator("#codigo").fill(errado);
  await page.locator("#palavra_passe_nova").fill("Cliente-Novo-2026");
  await page.getByRole("button", { name: "Criar acesso" }).click();
  await expect(page.getByText("Código errado ou expirado.")).toBeVisible();

  // Código certo: conta criada e sessão iniciada.
  await page.locator("#codigo").fill(codigo);
  await page.getByRole("button", { name: "Criar acesso" }).click();
  await expect(page).toHaveURL(`/${BARBEARIA_A.slug}/minha-area`);
  await expect(page.getByTestId("vista")).toHaveText("Olá, Rita Balcão");

  // Daqui em diante entra com o telemóvel e a palavra-passe que escolheu.
  await sairDaArea(page);
  await expect(page).toHaveURL(entrada);
  // O formulário só responde depois de a página ficar interativa.
  await page.waitForLoadState("networkidle");
  await page.locator("#telefone").fill(semConta);
  await page.locator("#palavra_passe").fill("Cliente-Novo-2026");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page).toHaveURL(`/${BARBEARIA_A.slug}/minha-area`);

  // Código expirado: recusado, mesmo certo.
  await sairDaArea(page);
  await pedirCodigo(page, semConta);
  const bd = servico();
  const { data: cliente } = await bd
    .from("clientes")
    .select("id")
    .eq("telefone", `+351${semConta}`)
    .single();
  const { data } = await bd
    .from("codigos_acesso")
    .select("id, codigo")
    .eq("cliente_id", cliente!.id)
    .is("usado_em", null)
    .gt("expira_em", new Date().toISOString())
    .order("criado_em", { ascending: false })
    .limit(1)
    .single();
  await bd
    .from("codigos_acesso")
    .update({ expira_em: new Date(Date.now() - 60_000).toISOString() })
    .eq("id", data!.id);
  await page.locator("#codigo").fill(data!.codigo);
  await page.locator("#palavra_passe_nova").fill("Outra-Palavra-2026");
  await page.getByRole("button", { name: "Criar acesso" }).click();
  await expect(page.getByText("Código errado ou expirado.")).toBeVisible();
});

test("o pedido de código responde igual para um número que não é cliente", async ({ page }) => {
  await pedirCodigo(page, "939999999");
});
