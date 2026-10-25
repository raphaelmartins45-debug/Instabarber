import type { ReactNode } from "react";
import { NavComercial } from "@/components/admin/comercial/nav-comercial";
import { eAdministrador } from "@/lib/admin/acesso";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { textos } from "@/lib/i18n/pt-PT";

// Comercial (Parte N): só no domínio principal e só para a equipa InstaBarber com dois fatores.
// O comercial vê só os seus leads (RLS) e não tem os modelos nem as condições (D-161).

export default async function LayoutComercial({ children }: { children: ReactNode }) {
  const { papel } = await exigirEquipaPlataforma();
  return (
    <section className="grid gap-5">
      <h1 className="text-[22px] font-extrabold tracking-tight">{textos.comercial.titulo}</h1>
      <NavComercial administrador={eAdministrador(papel)} />
      {children}
    </section>
  );
}
