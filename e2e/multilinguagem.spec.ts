import { expect, test } from "@playwright/test";
import { BARBEARIA_A, contas, servico, temSupabase } from "./auxiliares/dados";
import { entrarEquipa } from "./auxiliares/entrar";

// Multilinguagem (I.3.2, D-176): a página pública abre na língua do telemóvel — português em
// português, francês em qualquer francês, inglês em todas as outras — e o gestor tem os campos de
// inglês e francês nos serviços. Sem DEEPL_CHAVE, o botão de tradução automática não aparece.
// A multilinguagem fica ligada na Barbearia Alfa até à reposição seguinte da base: os outros ensaios
// correm com o browser em português (playwright.config.ts), por isso não mudam de língua.

test.skip(!temSupabase, "Precisa do Supabase local (scripts/e2e-local.sh)");

test.beforeAll(async () => {
  const { error } = await servico()
    .from("inquilino_funcionalidades")
    .upsert(
      { inquilino_id: BARBEARIA_A.id, chave: "multilinguagem", ativa: true },
      { onConflict: "inquilino_id,chave" },
    );
  if (error) throw new Error(error.message);
});

for (const [locale, titulo] of [
  ["pt-PT", "Faça a sua marcação"],
  ["pt-BR", "Faça a sua marcação"],
  ["fr-FR", "Prendre rendez-vous"],
  ["fr-CA", "Prendre rendez-vous"],
  ["de-DE", "Book an appointment"],
  ["en-US", "Book an appointment"],
] as const)
  test(`página pública num telemóvel em ${locale}`, async ({ browser }, info) => {
    test.skip(info.project.name !== "telemovel");
    const contexto = await browser.newContext({ ...info.project.use, locale });
    const page = await contexto.newPage();
    await page.goto(`/${BARBEARIA_A.slug}`);
    await expect(page.getByText(titulo).first()).toBeVisible();
    await contexto.close();
  });

test("serviços: campos de inglês e francês, sem tradução automática sem a chave", async ({
  page,
}, info) => {
  await entrarEquipa(page, contas(info.project.name).dono);
  await page.goto("/app/sistema/servicos");
  await expect(page.getByText("Inglês (opcional)").first()).toBeVisible();
  await expect(page.getByText("Francês (opcional)").first()).toBeVisible();
  await expect(page.getByTestId("traduzir-servico")).toHaveCount(0);
});
