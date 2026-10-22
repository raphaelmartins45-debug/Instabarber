import { notFound } from "next/navigation";
import { MolduraPainel } from "@/components/barbearia/moldura-painel";
import { obterContextoEquipa } from "@/lib/equipa/contexto";
import { menuEquipa, montarMenu } from "@/lib/funcionalidades/menus";
import { exigirFuncionalidade, lerGrelha } from "@/lib/funcionalidades/servidor";
import { textos } from "@/lib/i18n/pt-PT";
import { obterProfissional } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { vertical } from "@/lib/vertical/barbearia";

export const metadata = { title: vertical.camadas.equipa };

/**
 * Painel do profissional (E.3). O barbeiro vê só a sua área; o gestor vê a de qualquer
 * barbeiro, com «Vista do gestor». Os indicadores e a agenda própria chegam na Fase 4.
 */
export default async function PainelProfissional({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contexto = await obterContextoEquipa();
  await exigirFuncionalidade(contexto.barbearia.id, "painel_profissional");
  if (!contexto.eGestor && contexto.profissionalId !== id) notFound();

  const profissional = /^[0-9a-f-]{36}$/.test(id)
    ? await obterProfissional(await criarClienteServidor(), contexto.barbearia.id, id)
    : null;
  if (!profissional) notFound();

  const grelha = await lerGrelha(contexto.barbearia.id);
  const proprio = contexto.profissionalId === id;
  return (
    <MolduraPainel
      contexto={contexto}
      camada={vertical.camadas.equipa}
      vista={
        proprio ? textos.paineis.vistaDe(profissional.nome_apresentado) : textos.paineis.vistaGestor
      }
      menu={montarMenu(menuEquipa(id), grelha.ativas, grelha.comUpgrade)}
      atual="inicio"
    >
      <h1 className="text-2xl font-semibold">{profissional.nome_apresentado}</h1>
    </MolduraPainel>
  );
}
