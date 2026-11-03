import "server-only";
import { implementacaoCent, mensalidadeCent, periodoDe } from "@/lib/admin/comprovativos";
import { dataCurta, hojeIso } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { emCortesia } from "@/lib/regras/cortesia";
import { listarComprovativos, periodoAPagar } from "@/lib/repositorios/comprovativos";
import type { ConfiguracaoBarbearia } from "@/lib/repositorios/painel/barbearia";
import type { ClienteBD } from "@/lib/supabase/tipos";

// O que «O meu plano» e o acesso suspenso mostram sobre pagar a mensalidade (D-168): o período a
// pagar, o valor (o da fatura, ou a mensalidade com IVA, mais a implementação por pagar no
// primeiro pagamento, D-189), o comprovativo em análise e o histórico. Em cortesia, nada a pagar.

const t = textos.comprovativos;
export type DadosPagamento = Awaited<ReturnType<typeof dadosPagamento>>;

export async function dadosPagamento(bd: ClienteBD, b: ConfiguracaoBarbearia) {
  const hoje = hojeIso();
  const [periodo, comprovativos] = await Promise.all([
    periodoAPagar(bd, b.id),
    listarComprovativos(bd, { inquilinoId: b.id }),
  ]);
  const implementacao = implementacaoCent(b);
  const valorCent = (periodo.valorFaturaCent ?? mensalidadeCent(b)) + implementacao;
  const texto = periodoDe({ periodo_inicio: periodo.inicio, periodo_fim: periodo.fim });
  const pendente = comprovativos.find(
    (c) => c.estado === "pendente" && c.periodo_inicio === periodo.inicio,
  );
  const plano = textos.admin.planos[b.plano as "basic" | "pro"] ?? b.plano;
  const nome = t.implementacoes[b.implementacao];
  return {
    comprovativos,
    valorCent,
    hoje,
    cortesia: emCortesia(b, hoje)
      ? b.cortesia_ate
        ? t.cortesiaAte(plano, dataCurta(`${b.cortesia_ate}T12:00:00Z`))
        : t.cortesia(plano)
      : null,
    ajuda: [
      t.ajuda(texto, formatarDinheiro(valorCent)),
      implementacao && nome ? t.comImplementacao(nome, formatarDinheiro(implementacao)) : null,
    ]
      .filter(Boolean)
      .join(" "),
    emAnalise: pendente ? t.emAnalise(texto) : null,
    faturasEmAnalise: new Set(
      comprovativos.filter((c) => c.estado === "pendente" && c.fatura_id).map((c) => c.fatura_id!),
    ),
  };
}
