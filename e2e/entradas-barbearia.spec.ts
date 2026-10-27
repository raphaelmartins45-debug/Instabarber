import { expect, test } from "@playwright/test";
import { BARBEARIA_A, BARBEARIA_B, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Entradas por barbearia (D-180): cada barbearia tem /gestor, /barbeiro e /cliente no seu
// endereço, com o mesmo aspeto e a marca dela. A página pública só mostra a do cliente.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

const subdominio = (slug: string, caminho = "/") => `http://${slug}.localhost:3000${caminho}`;

test("as três entradas levam a marca da barbearia, no subdomínio e no caminho", async ({
  page,
}) => {
  for (const [caminho, titulo] of [
    ["/gestor", "Entrar como gestor"],
    ["/barbeiro", "Entrar como barbeiro"],
    ["/cliente", null],
  ] as const) {
    await page.goto(subdominio(BARBEARIA_A.slug, caminho));
    await expect(page.getByTestId("marca-barbearia")).toContainText(BARBEARIA_A.nome);
    if (titulo) await expect(page.getByText(titulo)).toBeVisible();
  }
  // A mesma página noutra barbearia leva a marca dessa.
  await page.goto(subdominio(BARBEARIA_B.slug, "/gestor"));
  await expect(page.getByTestId("marca-barbearia")).toContainText(BARBEARIA_B.nome);
  // Em instabarber.pt/<slug>/gestor também.
  await page.goto(`/${BARBEARIA_A.slug}/barbeiro`);
  await expect(page.getByTestId("marca-barbearia")).toContainText(BARBEARIA_A.nome);
  // Barbearia que não existe: 404.
  const r = await page.goto(subdominio("nao-existe-nada", "/gestor"));
  expect(r?.status()).toBe(404);
});

test("a página pública só mostra a entrada do cliente; /entrar antigo vai para /cliente", async ({
  page,
}) => {
  await page.goto(`/${BARBEARIA_A.slug}`);
  const entrar = page.locator("#capa").getByRole("link", { name: "Entrar", exact: true });
  await expect(entrar).toHaveAttribute("href", `/${BARBEARIA_A.slug}/cliente`);
  await expect(page.getByRole("link", { name: "Área de cliente" })).toHaveAttribute(
    "href",
    `/${BARBEARIA_A.slug}/cliente`,
  );
  await expect(page.getByText("Sou o gestor")).toHaveCount(0);
  await page.goto(`/${BARBEARIA_A.slug}/entrar`);
  await expect(page).toHaveURL(`/${BARBEARIA_A.slug}/cliente`);
  await page.goto(subdominio(BARBEARIA_A.slug, "/entrar"));
  await expect(page).toHaveURL(subdominio(BARBEARIA_A.slug, "/cliente"));
});

test("sem sessão, a área do barbeiro manda para /barbeiro e o painel para /gestor", async ({
  page,
}) => {
  const area = "/app/equipa/00000000-0000-4000-8000-000000000000";
  await page.goto(subdominio(BARBEARIA_A.slug, area));
  await expect(page).toHaveURL(
    subdominio(BARBEARIA_A.slug, `/barbeiro?seguinte=${encodeURIComponent(area)}`),
  );
  await page.goto(subdominio(BARBEARIA_A.slug, "/app/agenda"));
  await expect(page).toHaveURL(subdominio(BARBEARIA_A.slug, "/gestor?seguinte=%2Fapp%2Fagenda"));
});

test("o gestor entra por /gestor e o barbeiro por /barbeiro, cada um no seu painel", async ({
  browser,
}, info) => {
  const c = contas(info.project.name);
  const gestor = await (await browser.newContext(info.project.use)).newPage();
  await entrarEquipa(gestor, c.dono, subdominio(BARBEARIA_A.slug, "/gestor"));
  await expect(gestor).toHaveURL(subdominio(BARBEARIA_A.slug, "/app"));
  await expect(gestor.getByTestId("vista")).toHaveText("Vista do gestor");

  const barbeiro = await (await browser.newContext(info.project.use)).newPage();
  await entrarEquipa(barbeiro, c.barbeiro, subdominio(BARBEARIA_A.slug, "/barbeiro"));
  await expect(barbeiro).toHaveURL(/\/app\/equipa\/[0-9a-f-]{36}$/);
});
