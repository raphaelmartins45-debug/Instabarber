import { expect, test } from "@playwright/test";
import { BARBEARIA_SUSPENSA, contas, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Suspender sem perder dados (M.4): a página pública mostra um aviso neutro e o gestor só vê o
// plano e as faturas, para regularizar.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

test("barbearia suspensa: aviso neutro na página e o gestor só vê o plano", async ({
  page,
}, info) => {
  for (const caminho of ["", "/marcar"]) {
    await page.goto(`/${BARBEARIA_SUSPENSA.slug}${caminho}`);
    await expect(page.getByTestId("barbearia-indisponivel")).toHaveText(
      /Temporariamente indisponível para marcações/,
    );
  }
  await entrarEquipa(page, contas(info.project.name).donoSuspenso);
  await expect(page).toHaveURL("/app/suspensa");
  await expect(page.getByTestId("acesso-suspenso")).toHaveText("Acesso suspenso");
  await expect(page.getByTestId("meu-plano")).toBeVisible();
  await page.goto("/app/clientes");
  await expect(page).toHaveURL("/app/suspensa");
});
