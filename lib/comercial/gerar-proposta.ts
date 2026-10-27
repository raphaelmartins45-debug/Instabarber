import "server-only";
import { aplicarCondicoes } from "@/lib/comercial/condicoes";
import { emFaltaParaProposta } from "@/lib/comercial/briefing";
import { montarProposta } from "@/lib/comercial/proposta";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { lerCondicoes } from "@/lib/repositorios/comercial/condicoes";
import { criarProposta, lerBriefing } from "@/lib/repositorios/comercial/propostas";
import { listarFuncionalidades, listarPacotes } from "@/lib/repositorios/funcionalidades";
import type { ClienteBD } from "@/lib/supabase/tipos";

// Gerar uma versão nova da proposta a partir do briefing guardado (N.5). Uma só função para a
// ficha do lead e para a proposta rápida do Gerador de documentos (D-181).

export type ResultadoProposta =
  | { ok: true; id: string }
  | { ok: false; erro: string; campos?: string[] };

/** O código de erro da base de dados (raise exception 'codigo'). */
export const codigoErro = (mensagem: string) =>
  /^[a-z_]+$/.test(mensagem) ? mensagem : "generico";

export async function gerarPropostaDoLead(
  bd: ClienteBD,
  leadId: string,
  administrador: boolean,
): Promise<ResultadoProposta> {
  const briefing = await lerBriefing(bd, leadId);
  const falta = emFaltaParaProposta(briefing);
  if (falta.length) return { ok: false, erro: "em_falta", campos: falta };
  const [catalogo, pacotes, condicoes] = await Promise.all([
    listarFuncionalidades(bd),
    listarPacotes(bd),
    lerCondicoes(bd),
  ]);
  // Descontos e taxa de migração (D-161): a base de dados confere outra vez os limites.
  const descontos = aplicarCondicoes(
    { mensalidade: briefing.desconto_mensalidade_pct, taxa: briefing.desconto_taxa_pct },
    condicoes,
    administrador,
  );
  if (!descontos.ok) return { ok: false, erro: descontos.erro };
  const proposta = montarProposta(
    briefing,
    catalogo,
    pacotes,
    lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
    descontos,
  );
  const r = await criarProposta(bd, leadId, proposta);
  if ("erro" in r) return { ok: false, erro: codigoErro(r.erro) };
  return { ok: true, id: r.id };
}
