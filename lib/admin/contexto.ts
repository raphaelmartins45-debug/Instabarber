import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { listarMeusPerfis } from "@/lib/repositorios/perfis";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { eAdministrador, ePapelPlataforma, type PapelPlataforma } from "./acesso";

// O InstaBarber Admin abre à equipa InstaBarber com sessão de dois fatores (aal2): o dono, o
// gestor e o comercial (D-161). As políticas da base de dados exigem o mesmo (e_super_admin(),
// e_comercial()); sem aal2 não se vê nada (H).

export type EstadoSuperAdmin = {
  userId: string;
  email: string;
  aal2: boolean;
  temFator: boolean;
  papel: PapelPlataforma;
};

/** Quem não é da equipa InstaBarber recebe 404: o /admin não se anuncia. */
export const lerSuperAdmin = cache(async (): Promise<EstadoSuperAdmin> => {
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  if (!user) redirect("/entrar?seguinte=/admin");
  const papel = (await listarMeusPerfis(bd, user.id))
    .map((p) => p.papel as string)
    .find(ePapelPlataforma);
  if (!papel) notFound();
  const { data } = await bd.auth.mfa.getAuthenticatorAssuranceLevel();
  return {
    userId: user.id,
    email: user.email ?? "",
    aal2: data?.currentLevel === "aal2",
    temFator: data?.nextLevel === "aal2",
    papel,
  };
});

/** Qualquer pessoa da equipa InstaBarber com dois fatores (o layout do /admin). */
export async function exigirEquipaPlataforma(): Promise<EstadoSuperAdmin> {
  const estado = await lerSuperAdmin();
  if (!estado.aal2) redirect("/admin/dois-passos");
  return estado;
}

/** Páginas e ações de administração (dono ou gestor). O comercial vai para o Comercial. */
export async function exigirSuperAdmin(): Promise<EstadoSuperAdmin> {
  const estado = await exigirEquipaPlataforma();
  if (!eAdministrador(estado.papel)) redirect("/admin/comercial");
  return estado;
}

/** Só o dono: as contas da equipa InstaBarber. */
export async function exigirDono(): Promise<EstadoSuperAdmin> {
  const estado = await exigirSuperAdmin();
  if (estado.papel !== "super_admin") redirect("/admin");
  return estado;
}
