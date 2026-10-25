import { z } from "zod";

// Convite de uma pessoa para a equipa InstaBarber (D-161). O mesmo esquema valida o formulário
// e a ação; o domínio do e-mail confere-se no servidor (todos são @instabarber.pt).

export const PAPEIS_CONVIDAVEIS = ["gestor_plataforma", "comercial"] as const;

export const esquemaConviteEquipa = z.object({
  nome: z.string().trim().min(2, "nome").max(120, "nome"),
  email: z.string().trim().toLowerCase().email("email"),
  papel: z.enum(PAPEIS_CONVIDAVEIS),
});
export type DadosConviteEquipa = z.input<typeof esquemaConviteEquipa>;

/** O e-mail tem de ser do domínio da InstaBarber (ou de um subdomínio, como o dos ensaios). */
export function doDominio(email: string, dominio: string): boolean {
  const depois = email.toLowerCase().split("@")[1] ?? "";
  const d = dominio.toLowerCase();
  return depois === d || depois.endsWith(`.${d}`);
}
