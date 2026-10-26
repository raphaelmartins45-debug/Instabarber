import "server-only";
import { mensalidadeCent, periodoDe } from "@/lib/admin/comprovativos";
import { hojeIso } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { listarComprovativos, periodoAPagar } from "@/lib/repositorios/comprovativos";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import type { ClienteBD } from "@/lib/supabase/tipos";

// O que «O meu plano» e o acesso suspenso mostram sobre pagar a mensalidade (D-168): o período a
// pagar, o valor (o da fatura, ou a mensalidade com IVA), o comprovativo em análise e o histórico.

export type DadosPagamento = Awaited<ReturnType<typeof dadosPagamento>>;

export async function dadosPagamento(bd: ClienteBD, b: ConfiguracaoBarbearia) {
  const [periodo, comprovativos] = await Promise.all([
    periodoAPagar(bd, b.id),
    listarComprovativos(bd, { inquilinoId: b.id }),
  ]);
  const valorCent = periodo.valorFaturaCent ?? mensalidadeCent(b);
  const texto = periodoDe({ periodo_inicio: periodo.inicio, periodo_fim: periodo.fim });
  const pendente = comprovativos.find(
    (c) => c.estado === "pendente" && c.periodo_inicio === periodo.inicio,
  );
  return {
    comprovativos,
    valorCent,
    hoje: hojeIso(),
    ajuda: textos.comprovativos.ajuda(texto, formatarDinheiro(valorCent)),
    emAnalise: pendente ? textos.comprovativos.emAnalise(texto) : null,
    faturasEmAnalise: new Set(
      comprovativos.filter((c) => c.estado === "pendente" && c.fatura_id).map((c) => c.fatura_id!),
    ),
  };
}
