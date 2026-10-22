import type { ReactNode } from "react";
import { MenuAdmin } from "@/components/admin/menu-admin";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { vertical } from "@/lib/vertical/barbearia";

// Camada 1: só o super_admin com sessão aal2 (B.6, H). Os outros recebem 404.

export default async function LayoutAdmin({ children }: { children: ReactNode }) {
  const estado = await exigirSuperAdmin();
  return (
    <>
      <CabecalhoPainel camada={vertical.camadas.admin} vista={estado.email} />
      <MenuAdmin />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-24 md:pb-6">{children}</main>
    </>
  );
}
