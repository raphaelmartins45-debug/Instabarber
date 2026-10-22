import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { listarMeusPerfis } from "@/lib/repositorios/perfis";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// O InstaBarber Admin só abre ao super_admin com sessão de dois fatores (aal2). As políticas
// da base de dados exigem o mesmo (e_super_admin()); sem aal2 não se vê nada (H).

export type EstadoSuperAdmin = { userId: string; email: string; aal2: boolean; temFator: boolean };

/** Quem não é super_admin recebe 404: o /admin não se anuncia. */
export const lerSuperAdmin = cache(async (): Promise<EstadoSuperAdmin> => {
  const bd = await criarClienteServidor();
  const {
    data: { user },
  } = await bd.auth.getUser();
  if (!user) redirect("/entrar?seguinte=/admin");
  const perfis = await listarMeusPerfis(bd, user.id);
  if (!perfis.some((p) => p.papel === "super_admin")) notFound();
  const { data } = await bd.auth.mfa.getAuthenticatorAssuranceLevel();
  return {
    userId: user.id,
    email: user.email ?? "",
    aal2: data?.currentLevel === "aal2",
    temFator: data?.nextLevel === "aal2",
  };
});

/** Para as páginas do /admin: sem aal2, vai para a verificação em dois passos. */
export async function exigirSuperAdmin(): Promise<EstadoSuperAdmin> {
  const estado = await lerSuperAdmin();
  if (!estado.aal2) redirect("/admin/dois-passos");
  return estado;
}
