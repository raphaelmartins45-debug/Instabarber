import { lerSuperAdmin } from "@/lib/admin/contexto";
import type { DadosPdfProposta } from "@/lib/pdf/proposta";
import { gerarPdfContrato } from "@/lib/pdf/contrato";
import { textos } from "@/lib/i18n/pt-PT";
import { obterContrato } from "@/lib/repositorios/comercial/contratos";
import { obterProposta } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// PDF do contrato (N.6), do texto fixado na geração e da fotografia da proposta aceite. Só o
// super_admin com dois fatores; os outros recebem 404, como o resto do Admin.

const b = textos.comercial.briefing;

export async function GET(_pedido: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await lerSuperAdmin()).aal2) return new Response(null, { status: 404 });
  const bd = await criarClienteServidor();
  const c = await obterContrato(bd, (await params).id);
  if (!c) return new Response(null, { status: 404 });
  const p = await obterProposta(bd, c.proposta_id);
  if (!p?.numero) return new Response(null, { status: 404 });
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
  return new Response(pdf.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${c.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
