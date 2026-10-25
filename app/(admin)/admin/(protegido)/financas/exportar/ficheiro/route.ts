import { type NextRequest } from "next/server";
import { lerSuperAdmin } from "@/lib/admin/contexto";
import { seccoesParaCsv } from "@/lib/exportacao/csv";
import {
  cabecalhoDaExportacao,
  mesesDoPeriodo,
  seccoesDaExportacao,
  type TipoPeriodo,
} from "@/lib/financas/exportacao";
import { diasDoMes, mesAtual } from "@/lib/formatacao/datas";
import { gerarPdfFinancas } from "@/lib/pdf/financas";
import { lerRegimeIva } from "@/lib/regras/mensalidade";
import { registarAcaoAdmin } from "@/lib/repositorios/admin/auditoria";
import {
  barbeariasParaFinancas,
  listarContas,
  listarCustos,
  listarMetas,
  recebimentosComBarbearia,
} from "@/lib/repositorios/financas";
import { criarClienteServidor } from "@/lib/supabase/servidor";

// Exportação das Finanças (O.10) em CSV («;», UTF-8 com BOM) ou PDF, por mês, trimestre ou ano.
// Só o super_admin com dois fatores (os outros recebem 404); fica em auditoria.

const TIPOS: TipoPeriodo[] = ["mes", "trimestre", "ano"];

export async function GET(pedido: NextRequest) {
  const admin = await lerSuperAdmin();
  if (!admin.aal2) return new Response(null, { status: 404 });
  const q = pedido.nextUrl.searchParams;
  const tipo = (TIPOS.find((x) => x === q.get("periodo")) ?? "mes") as TipoPeriodo;
  const ref = /^\d{4}-\d{2}$/.test(q.get("ref") ?? "") ? q.get("ref")! : mesAtual();
  const formato = q.get("formato") === "pdf" ? "pdf" : "csv";
  const meses = mesesDoPeriodo(tipo, ref);
  const ultimo = meses.at(-1)!;
  const bd = await criarClienteServidor();
  const [barbearias, recebimentos, custos, contas, metas] = await Promise.all([
    barbeariasParaFinancas(bd),
    recebimentosComBarbearia(bd, `${meses[0]}-01`, `${ultimo}-${diasDoMes(ultimo).length}`),
    listarCustos(bd),
    listarContas(bd),
    listarMetas(bd),
  ]);
  const cabecalho = cabecalhoDaExportacao(meses);
  const seccoes = seccoesDaExportacao({
    tipo,
    meses,
    regime: lerRegimeIva(process.env.PRESTADORA_REGIME_IVA),
    barbearias,
    recebimentos,
    custos,
    contas,
    metas,
  });
  await registarAcaoAdmin(bd, {
    inquilinoId: null,
    accao: "exportacao_financas",
    detalhes: { formato, periodo: tipo, de: meses[0]!, ate: ultimo },
  });
  const nome = `financas-${meses[0]}${meses.length > 1 ? `-a-${ultimo}` : ""}.${formato}`;
  const corpo =
    formato === "pdf"
      ? gerarPdfFinancas(cabecalho, seccoes).output("arraybuffer")
      : seccoesParaCsv(cabecalho, seccoes);
  return new Response(corpo, {
    headers: {
      "Content-Type": formato === "pdf" ? "application/pdf" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
