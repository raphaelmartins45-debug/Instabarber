import type { ReactNode } from "react";
import { exigirGestor } from "@/lib/equipa/contexto";
import { MENU_GESTAO, montarMenu } from "@/lib/funcionalidades/menus";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { vertical } from "@/lib/vertical/barbearia";
import { MolduraPainel } from "./moldura-painel";

/** Moldura das páginas do gestor (E.2): só o proprietário; o barbeiro vai para a sua área. */
export async function PainelGestor({ atual, children }: { atual: string; children: ReactNode }) {
  const contexto = await exigirGestor();
  const grelha = await lerGrelha(contexto.barbearia.id);
  return (
    <MolduraPainel
      contexto={contexto}
      camada={vertical.camadas.gestao}
      vista={textos.paineis.vistaGestor}
      menu={montarMenu(MENU_GESTAO, grelha.ativas, grelha.comUpgrade)}
      atual={atual}
    >
      {children}
    </MolduraPainel>
  );
}
