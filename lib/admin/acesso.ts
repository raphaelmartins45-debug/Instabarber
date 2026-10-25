// Papéis da equipa InstaBarber no /admin (D-161). O dono (super_admin) vê tudo; o gestor é
// administrador sem a gestão de contas; o comercial só o Comercial, sem os modelos de contrato
// nem as condições comerciais. A base de dados volta a verificar tudo (RLS e funções).

export const PAPEIS_PLATAFORMA = ["super_admin", "gestor_plataforma", "comercial"] as const;
export type PapelPlataforma = (typeof PAPEIS_PLATAFORMA)[number];

export const ePapelPlataforma = (p: string): p is PapelPlataforma =>
  (PAPEIS_PLATAFORMA as readonly string[]).includes(p);

/** Administrador da plataforma: o dono ou o gestor. */
export const eAdministrador = (p: PapelPlataforma) => p !== "comercial";

const dentro = (caminho: string, prefixo: string) =>
  caminho === prefixo || caminho.startsWith(`${prefixo}/`);

/** Só dos administradores dentro do Comercial. */
const SO_ADMIN_NO_COMERCIAL = ["/admin/comercial/modelos", "/admin/comercial/condicoes"];

/** Onde cada papel começa: o comercial no Comercial, os administradores no painel geral. */
export const inicioDoPapel = (papel: PapelPlataforma) =>
  papel === "comercial" ? "/admin/comercial" : "/admin";

/** Para onde vai quem abre um caminho do /admin que o seu papel não usa; nulo se pode abrir. */
export function desvioAdmin(papel: PapelPlataforma, caminho: string): string | null {
  if (dentro(caminho, "/admin/dois-passos")) return null;
  if (papel === "comercial") {
    const permitido =
      dentro(caminho, "/admin/comercial") && !SO_ADMIN_NO_COMERCIAL.some((p) => dentro(caminho, p));
    return permitido ? null : "/admin/comercial";
  }
  if (papel === "gestor_plataforma" && dentro(caminho, "/admin/equipa")) return "/admin";
  return null;
}
