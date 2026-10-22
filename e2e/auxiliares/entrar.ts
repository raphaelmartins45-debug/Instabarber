import { expect, type Page } from "@playwright/test";
import { PALAVRA_PASSE } from "./dados";

/** Entrada da equipa com e-mail e palavra-passe, no endereço indicado. */
export async function entrarEquipa(
  page: Page,
  email: string,
  endereco = "/entrar",
  palavraPasse = PALAVRA_PASSE,
) {
  await page.goto(endereco);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Palavra-passe").fill(palavraPasse);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).not.toHaveURL(/\/entrar(\?|$)/);
}
