import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { MENU_GESTAO, menuEquipa, montarMenu } from "@/lib/funcionalidades/menus";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { obterProfissional } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";
import { MolduraPainel } from "./moldura-painel";

/**
 * Moldura das páginas que o gestor e o barbeiro partilham (marcar ao balcão, ficha do cliente):
 * o gestor vê o menu da Gestão; o barbeiro, o da sua área (E.3).
 */
export async function PainelEquipa({ atual, children }: { atual: string; children: ReactNode }) {
  const contexto = await obterContextoEquipa();
  const grelha = await lerGrelha(contexto.barbearia.id);
  if (contexto.eGestor) {
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
  if (!contexto.profissionalId) notFound();
  const eu = await obterProfissional(
    await criarClienteServidor(),
    contexto.barbearia.id,
    contexto.profissionalId,
  );
  return (
    <MolduraPainel
      contexto={contexto}
      camada={vertical.camadas.equipa}
      vista={textos.paineis.vistaDe(eu?.nome_apresentado ?? "")}
      menu={montarMenu(menuEquipa(contexto.profissionalId), grelha.ativas, grelha.comUpgrade)}
      atual={atual}
    >
      {children}
    </MolduraPainel>
  );
}
