import "server-only";
import { cache } from "react";
import { slugValido } from "@/lib/inquilino/host";
import {
  obterBarbeariaPublica,
  type BarbeariaPublica,
} from "@/lib/repositorios/barbearias-publicas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

/** A barbearia ativa do endereço, uma vez por pedido. Nulo dá «Barbearia não encontrada». */
export const obterBarbeariaDoEndereco = cache(
  async (slug: string): Promise<BarbeariaPublica | null> => {
    if (!slugValido(slug)) return null;
    return obterBarbeariaPublica(await criarClienteServidor(), slug);
  },
);

/** A barbearia deste slug está suspensa (M.4)? Só isso: nenhum dado dela. */
export async function barbeariaSuspensa(slug: string): Promise<boolean> {
  if (!slugValido(slug)) return false;
  const { data } = await (await criarClienteServidor()).rpc("barbearia_suspensa", { p_slug: slug });
  return data === true;
}
