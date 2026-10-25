import type { ReactNode } from "react";
import { MenuAdmin } from "@/components/admin/menu-admin";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import { exigirEquipaPlataforma } from "@/lib/admin/contexto";
import { menuDoPapel } from "@/lib/admin/menu";
import { vertical } from "@/lib/vertical/barbearia";

// Camada 1: só a equipa InstaBarber com sessão aal2 (B.6, H, D-161). Os outros recebem 404.
// Cada papel vê o seu menu; o middleware desvia o que o papel não usa (lib/admin/acesso.ts).

export default async function LayoutAdmin({ children }: { children: ReactNode }) {
  const estado = await exigirEquipaPlataforma();
  return (
    <>
      <CabecalhoPainel
        camada={vertical.camadas.admin}
        vista={estado.email}
        comandos={menuDoPapel(estado.papel)}
      />
      <div className="flex">
        <MenuAdmin papel={estado.papel} />
        <main className="mx-auto grid w-full max-w-6xl min-w-0 content-start gap-6 px-4 pt-6 pb-28 md:px-8 md:pb-10">
          {children}
        </main>
      </div>
    </>
  );
}
