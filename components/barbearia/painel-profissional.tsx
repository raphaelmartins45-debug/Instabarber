import type { ReactNode } from "react";
import { menuEquipa, montarMenu } from "@/lib/funcionalidades/menus";
import { textos } from "@/lib/i18n/pt-PT";
import type { AreaProfissional } from "@/lib/painel/area-profissional";
import { vertical } from "@/lib/vertical/barbearia";
import { MolduraPainel } from "./moldura-painel";

/** Moldura da área do barbeiro (E.3): «Vista do Carlos» ou, para o gestor, «Vista do gestor». */
export function PainelProfissional({
  area,
  atual,
  children,
}: {
  area: AreaProfissional;
  atual: string;
  children: ReactNode;
}) {
  const { contexto, profissional, grelha, proprio } = area;
  return (
    <MolduraPainel
      contexto={contexto}
      camada={vertical.camadas.equipa}
      vista={
        proprio ? textos.paineis.vistaDe(profissional.nome_apresentado) : textos.paineis.vistaGestor
      }
      menu={montarMenu(menuEquipa(profissional.id), grelha.ativas, grelha.comUpgrade)}
      atual={atual}
    >
      {children}
    </MolduraPainel>
  );
}
