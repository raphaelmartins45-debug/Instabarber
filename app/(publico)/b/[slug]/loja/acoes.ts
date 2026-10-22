"use server";

import type { z } from "zod";
import { ipDoPedido } from "@/lib/inquilino/endereco";
import { obterBarbeariaDoEndereco } from "@/lib/publico/barbearia";
import { consumirLimite, LIMITES_MARCACAO } from "@/lib/repositorios/limites";
import { criarEncomenda } from "@/lib/repositorios/loja-publica";
import { criarClienteServico } from "@/lib/supabase/servico";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaEncomenda } from "@/lib/validacao/marcacao";

export type ResultadoEncomenda = { ok: true } | { ok: false; erro: string };

/** Encomenda com levantamento e pagamento ao balcão (F.4.4), com ou sem conta. */
export async function encomendar(
  slug: string,
  dados: z.input<typeof esquemaEncomenda>,
): Promise<ResultadoEncomenda> {
  const b = await obterBarbeariaDoEndereco(slug);
  const v = esquemaEncomenda.safeParse(dados);
  if (!b?.id) return { ok: false, erro: "erro" };
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  if (
    !(await consumirLimite(
      criarClienteServico(),
      `entrada:ip:${await ipDoPedido()}`,
      LIMITES_MARCACAO.entradaIp,
    ))
  )
    return { ok: false, erro: "limite" };
  const r = await criarEncomenda(await criarClienteServidor(), { inquilinoId: b.id, ...v.data });
  return r.ok ? r : { ok: false, erro: r.motivo };
}
