import "server-only";
import { textos } from "@/lib/i18n/pt-PT";
import { gerarPdfContrato } from "@/lib/pdf/contrato";
import type { DadosPdfProposta } from "@/lib/pdf/proposta";
import { type Contrato, obterContrato } from "@/lib/repositorios/comercial/contratos";
import { obterProposta } from "@/lib/repositorios/comercial/propostas";
import type { ClienteBD } from "@/lib/supabase/tipos";

// O PDF do contrato (N.6), do texto fixado na geração e da fotografia da proposta aceite. Uma só
// função para a rota do Admin, o anexo do e-mail ao cliente e a página do cliente (D-181).

const b = textos.comercial.briefing;

export async function pdfDoContrato(
  bd: ClienteBD,
  id: string,
): Promise<{ nome: string; conteudo: Buffer; contrato: Contrato } | null> {
  const c = await obterContrato(bd, id);
  if (!c) return null;
  const p = await obterProposta(bd, c.proposta_id);
  if (!p?.numero) return null;
  const dados = p.dados as DadosPdfProposta["dados"];
  const pdf = gerarPdfContrato({
    texto: c.texto,
    proposta: {
      numero: p.numero,
      plano: b.planos[p.plano!] ?? p.plano!,
      periodicidade: b.periodicidades[p.periodicidade!] ?? p.periodicidade!,
      profissionais: p.profissionais!,
      valorSemIva: String(p.valor_periodo_sem_iva),
      valorComIva: String(p.valor_periodo_com_iva),
      decomposicao: dados.decomposicao,
      incluidas: dados.incluidas,
    },
  });
  return { nome: `${c.numero}.pdf`, conteudo: Buffer.from(pdf.output("arraybuffer")), contrato: c };
}
