"use server";

import { z } from "zod";
import { exigirGestorParaEscrever } from "@/lib/equipa/contexto";
import { lerGrelha } from "@/lib/funcionalidades/servidor";
import { consumirLimite, LIMITES } from "@/lib/repositorios/limites";
import { criarClienteServico } from "@/lib/supabase/servico";
import { type ServicoTraduzido, traduzirServico } from "@/lib/traducao";

// Tradução automática do nome e da descrição de um serviço (D-176). Só para o gestor, com a
// multilinguagem ligada e o DeepL configurado; o resultado volta ao formulário para rever e guardar.

const esquema = z.object({
  nome: z.string().trim().min(1, "nome").max(120),
  descricao: z.string().trim().max(600).default(""),
});

export async function traduzirServicoAcao(
  dados: z.input<typeof esquema>,
): Promise<{ ok: true; traducao: ServicoTraduzido } | { ok: false; erro: string }> {
  const contexto = await exigirGestorParaEscrever();
  const v = esquema.safeParse(dados);
  if (!v.success) return { ok: false, erro: v.error.issues[0]?.message ?? "erro" };
  const { ativas } = await lerGrelha(contexto.barbearia.id);
  if (!ativas.has("multilinguagem")) return { ok: false, erro: "erro" };
  if (
    !(await consumirLimite(
      criarClienteServico(),
      `traduzir:${contexto.barbearia.id}`,
      LIMITES.traduzirBarbearia,
    ))
  )
    return { ok: false, erro: "limite" };
  const traducao = await traduzirServico(v.data.nome, v.data.descricao);
  return traducao ? { ok: true, traducao } : { ok: false, erro: "traducao" };
}
