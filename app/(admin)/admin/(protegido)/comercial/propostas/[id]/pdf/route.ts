import { lerSuperAdmin } from "@/lib/admin/contexto";
import { variavelOpcional } from "@/lib/configuracao/ambiente";
import type { DadosPdfProposta } from "@/lib/pdf/proposta";
import { gerarPdfProposta } from "@/lib/pdf/proposta";
import { enderecos } from "@/lib/email/enderecos";
import { textos } from "@/lib/i18n/pt-PT";
import { modeloAprovado, obterProposta } from "@/lib/repositorios/comercial/propostas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// PDF da proposta (N.5), gerado da fotografia guardada. A equipa InstaBarber com dois fatores;
// o RLS só devolve ao comercial as propostas dos seus leads (D-161). Os outros recebem 404.

const b = textos.comercial.briefing;

export async function GET(_pedido: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await lerSuperAdmin()).aal2) return new Response(null, { status: 404 });
  const bd = await criarClienteServidor();
  const p = await obterProposta(bd, (await params).id);
  if (!p?.numero) return new Response(null, { status: 404 });
  const condicoes = await modeloAprovado(bd, "condicoes_proposta");
  const pdf = gerarPdfProposta({
    numero: p.numero,
    versao: p.versao!,
    criadaEm: p.criado_em!,
    validaAte: p.valida_ate,
    validadeDias: p.validade_dias!,
    plano: b.planos[p.plano!] ?? p.plano!,
    periodicidade: b.periodicidades[p.periodicidade!] ?? p.periodicidade!,
    profissionais: p.profissionais!,
    dominioProprio: !!p.dominio_proprio,
    desafio: !!p.desafio_90,
    valorSemIva: String(p.valor_periodo_sem_iva),
    valorComIva: String(p.valor_periodo_com_iva),
    ivaTaxa: Number(p.iva_taxa),
    condicoesLancamento: p.condicoes_lancamento,
    descontoPct: Number(p.desconto_mensalidade_pct ?? 0),
    taxaSemIva: String(p.taxa_migracao_sem_iva ?? 0),
    dados: p.dados as DadosPdfProposta["dados"],
    condicoes: condicoes?.corpo ?? null,
    contacto: {
      email: enderecos.comercial(),
      telefone: variavelOpcional("TELEFONE_COMERCIAL_TXT") ?? "",
    },
  });
  return new Response(pdf.output("arraybuffer"), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${p.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
