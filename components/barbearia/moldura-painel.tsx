import Link from "next/link";
import type { ReactNode } from "react";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import type { ContextoEquipa } from "@/lib/equipa/contexto";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { MenuPainel } from "./menu-painel";

/** Cabeçalho, menu e conteúdo dos painéis da barbearia (camadas 2 e 3). */
export function MolduraPainel({
  contexto,
  camada,
  vista,
  menu,
  atual,
  children,
}: {
  contexto: ContextoEquipa;
  camada: string;
  vista: string;
  menu: ItemMontado[];
  atual: string;
  children: ReactNode;
}) {
  const trocar =
    contexto.barbearias.length > 1 ? (
      <Link href="/app/escolher" className="text-xs text-white/80 underline underline-offset-4">
        {textos.paineis.trocar}
      </Link>
    ) : null;
  return (
    <>
      <CabecalhoPainel
        camada={`${camada} · ${contexto.barbearia.nome}`}
        vista={vista}
        extra={trocar}
      />
      <MenuPainel itens={menu} atual={atual} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6">{children}</main>
    </>
  );
}
