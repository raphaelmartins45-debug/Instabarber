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
