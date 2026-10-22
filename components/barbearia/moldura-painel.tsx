import Link from "next/link";
import type { ReactNode } from "react";
import { CabecalhoPainel } from "@/components/nucleo/cabecalho-painel";
import type { ContextoEquipa } from "@/lib/equipa/contexto";
import type { ItemMontado } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import { MenuPainel } from "@/components/nucleo/menu-painel";
import { horaCurta } from "@/lib/formatacao/datas";
import { FaixaApoio } from "./faixa-apoio";

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
      {contexto.apoio ? (
        <FaixaApoio barbearia={contexto.barbearia.nome} hora={horaCurta(contexto.apoio.expira)} />
      ) : null}
      <CabecalhoPainel
        camada={`${camada} · ${contexto.barbearia.nome}`}
        vista={vista}
        extra={trocar}
      />
      <MenuPainel itens={menu} atual={atual} />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 pt-6 pb-24 md:pb-6">{children}</main>
    </>
  );
}
