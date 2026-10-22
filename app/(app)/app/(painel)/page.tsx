import { MolduraPainel } from "@/components/barbearia/moldura-painel";
import { PedidosAcesso } from "@/components/barbearia/pedidos-acesso";
import { exigirGestor } from "@/lib/equipa/contexto";
import { MENU_GESTAO, montarMenu } from "@/lib/funcionalidades/menus";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { listarPedidosAcesso } from "@/lib/repositorios/codigos-acesso";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: `${textos.paineis.menu.inicio} · ${vertical.camadas.gestao}` };

/** Início do gestor (E.2). Nesta fase: pedidos de acesso; o resumo do dia chega na Fase 4. */
export default async function InicioGestor() {
  const contexto = await exigirGestor();
  const grelha = await lerGrelha(contexto.barbearia.id);
  const pedidos = await listarPedidosAcesso(await criarClienteServidor(), contexto.barbearia.id);
  return (
    <MolduraPainel
      contexto={contexto}
      camada={vertical.camadas.gestao}
      vista={textos.paineis.vistaGestor}
      menu={montarMenu(MENU_GESTAO, grelha.ativas, grelha.comUpgrade)}
      atual="inicio"
    >
      <PedidosAcesso pedidos={pedidos} barbearia={contexto.barbearia.nome} />
    </MolduraPainel>
  );
}
