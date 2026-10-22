import type { ReactNode } from "react";
import { MenuAdmin } from "@/components/admin/menu-admin";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { MENU_ADMIN } from "@/lib/admin/menu";
import { vertical } from "@/lib/vertical/barbearia";

// Camada 1: só o super_admin com sessão aal2 (B.6, H). Os outros recebem 404.

export default async function LayoutAdmin({ children }: { children: ReactNode }) {
  const estado = await exigirSuperAdmin();
  return (
    <>
      <CabecalhoPainel camada={vertical.camadas.admin} vista={estado.email} comandos={MENU_ADMIN} />
      <div className="flex">
        <MenuAdmin />
        <main className="mx-auto grid w-full max-w-6xl min-w-0 content-start gap-6 px-4 pt-6 pb-28 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
    </>
  );
}
