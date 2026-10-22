import "server-only";
import { notFound } from "next/navigation";
import { obterContextoEquipa, type ContextoEquipa } from "@/lib/equipa/contexto";
import { exigirFuncionalidade, lerGrelha, type Grelha } from "@/lib/funcionalidades/servidor";
import { obterProfissional, type MembroEquipa } from "@/lib/repositorios/profissionais";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// A área de um barbeiro (E.3): o próprio vê a sua; o gestor vê a de qualquer barbeiro.

export type AreaProfissional = {
  contexto: ContextoEquipa;
  profissional: MembroEquipa;
  grelha: Grelha;
  /** É o próprio barbeiro (não o gestor a ver). */
  proprio: boolean;
};

export async function abrirAreaProfissional(id: string): Promise<AreaProfissional> {
  const contexto = await obterContextoEquipa();
  await exigirFuncionalidade(contexto.barbearia.id, "painel_profissional");
  if (!contexto.eGestor && contexto.profissionalId !== id) notFound();
  const profissional = /^[0-9a-f-]{36}$/.test(id)
    ? await obterProfissional(await criarClienteServidor(), contexto.barbearia.id, id)
    : null;
  if (!profissional) notFound();
  return {
    contexto,
    profissional,
    grelha: await lerGrelha(contexto.barbearia.id),
    proprio: contexto.profissionalId === id,
  };
}
