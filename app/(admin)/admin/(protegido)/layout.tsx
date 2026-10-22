import type { ReactNode } from "react";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import { exigirSuperAdmin } from "@/lib/admin/contexto";
import { vertical } from "@/lib/vertical/barbearia";

// Camada 1: só o super_admin com sessão aal2 (B.6, H). Os outros recebem 404.

export default async function LayoutAdmin({ children }: { children: ReactNode }) {
  const estado = await exigirSuperAdmin();
  return (
    <>
      <CabecalhoPainel camada={vertical.camadas.admin} vista={estado.email} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
