import "server-only";
import { notFound } from "next/navigation";
import { cache } from "react";
import { listarChavesAtivas, listarFuncionalidades } from "@/lib/repositorios/funcionalidades";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Verificação no servidor (D.3): uma funcionalidade inativa sai — menu, ecrã, botão e rota.
// A base de dados volta a verificar (RLS e funcionalidade_ativa()).

export type Grelha = { ativas: ReadonlySet<string>; comUpgrade: ReadonlySet<string> };

/** As chaves ativas da barbearia e as que mostram a chamada de upgrade, uma vez por pedido. */
export const lerGrelha = cache(async (inquilinoId: string): Promise<Grelha> => {
  const bd = await criarClienteServidor();
  const [ativas, catalogo] = await Promise.all([
    listarChavesAtivas(bd, inquilinoId),
    listarFuncionalidades(bd),
  ]);
  return {
    ativas: new Set(ativas),
    comUpgrade: new Set(catalogo.filter((f) => f.mostra_upgrade).map((f) => f.chave)),
  };
});

/** Para no servidor quando a funcionalidade não está ativa: quem escreve o endereço à mão recebe 404. */
export async function exigirFuncionalidade(inquilinoId: string, chave: string): Promise<void> {
  const { ativas } = await lerGrelha(inquilinoId);
  if (!ativas.has(chave)) notFound();
}
