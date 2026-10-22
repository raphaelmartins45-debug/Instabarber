import { FormularioBarbeiro } from "@/components/barbearia/formulario-barbeiro";
import { ListaEquipa, type LinhaEquipa } from "@/components/barbearia/lista-equipa";
import { MolduraPainel } from "@/components/barbearia/moldura-painel";
import { lerEntradas } from "@/lib/auth/contas";
import { exigirGestor } from "@/lib/equipa/contexto";
import { MENU_GESTAO, montarMenu } from "@/lib/funcionalidades/menus";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { estadoConvite } from "@/lib/regras/convite";
import { contasDosPerfis } from "@/lib/repositorios/perfis";
import { listarEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: `${textos.paineis.menu.sistema} · ${vertical.camadas.gestao}` };

/** Gestão do sistema, só o gestor (E.2). Nesta fase: a equipa e o registo de barbeiros. */
export default async function GestaoSistema() {
  const contexto = await exigirGestor();
  const bd = await criarClienteServidor();
  const [grelha, equipa] = await Promise.all([
    lerGrelha(contexto.barbearia.id),
    listarEquipa(bd, contexto.barbearia.id),
  ]);

  const contas = await contasDosPerfis(
    bd,
    equipa.flatMap((p) => (p.perfil_id ? [p.perfil_id] : [])),
  );
  const entradas = await lerEntradas(criarClienteServico(), [...contas.values()]);
  const linhas: LinhaEquipa[] = equipa.map((p) => {
    const entrada = p.perfil_id ? entradas.get(contas.get(p.perfil_id) ?? "") : undefined;
    return {
      id: p.id,
      nome: p.nome,
      email: p.email,
      estado: estadoConvite(entrada?.convidadoEm ?? null, entrada?.ultimaEntrada ?? null),
    };
  });

  return (
    <MolduraPainel
      contexto={contexto}
      camada={vertical.camadas.gestao}
      vista={textos.paineis.vistaGestor}
      menu={montarMenu(MENU_GESTAO, grelha.ativas, grelha.comUpgrade)}
      atual="sistema"
    >
      <section className="grid gap-4" aria-labelledby="equipa">
        <h2 id="equipa" className="text-lg font-semibold">
          {textos.paineis.equipa.titulo}
        </h2>
        <ListaEquipa linhas={linhas} />
        <FormularioBarbeiro />
      </section>
    </MolduraPainel>
  );
}
