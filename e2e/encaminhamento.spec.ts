import { expect, test } from "@playwright/test";
import { BARBEARIA_A, temSupabase } from "./auxiliares/dados";

// Resolução da barbearia pelo endereço (L.4) e proteção das camadas.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

const subdominio = (slug: string, caminho = "/") => `http://${slug}.localhost:3000${caminho}`;

test("a barbearia abre pelo subdomínio e por /<slug>, nunca por /b/", async ({ page }) => {
  await page.goto(subdominio(BARBEARIA_A.slug));
  await expect(page.getByRole("heading", { name: BARBEARIA_A.nome })).toBeVisible();
  await page.goto(`/${BARBEARIA_A.slug}`);
  await expect(page.getByRole("heading", { name: BARBEARIA_A.nome })).toBeVisible();
  const interna = await page.goto(`/b/${BARBEARIA_A.slug}`);
  expect(interna?.status()).toBe(404);
});

test("slug inexistente e subdomínio reservado: «Barbearia não encontrada»", async ({ page }) => {
  const r = await page.goto("/barbearia-que-nao-existe");
  expect(r?.status()).toBe(404);
  await expect(page.getByText("Barbearia não encontrada")).toBeVisible();
  await page.goto(subdominio("admin"));
  await expect(page.getByText("Barbearia não encontrada")).toBeVisible();
});

test("/admin num endereço de barbearia responde 404, sem redirecionar", async ({ page }) => {
  for (const caminho of ["/admin", "/admin/dois-passos"]) {
    const r = await page.goto(subdominio(BARBEARIA_A.slug, caminho));
    expect(r?.status()).toBe(404);
    expect(new URL(page.url()).pathname).toBe(caminho);
  }
});

test("sem sessão, as camadas protegidas mandam para a entrada certa", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/entrar\?seguinte=%2Fadmin$/);
  await page.goto("/app/sistema");
  await expect(page).toHaveURL(/\/entrar\?seguinte=%2Fapp%2Fsistema$/);
  await page.goto(subdominio(BARBEARIA_A.slug, "/app"));
  await expect(page).toHaveURL(subdominio(BARBEARIA_A.slug, "/app/entrar?seguinte=%2Fapp"));
  await page.goto(subdominio(BARBEARIA_A.slug, "/minha-area"));
  await expect(page).toHaveURL(subdominio(BARBEARIA_A.slug, "/entrar"));
  await page.goto(`/${BARBEARIA_A.slug}/minha-area`);
  await expect(page).toHaveURL(`/${BARBEARIA_A.slug}/entrar`);
});
