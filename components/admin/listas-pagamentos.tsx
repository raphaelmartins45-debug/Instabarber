import { TabelaCartoes } from "@/components/nucleo/tabela-cartoes";
import { dataCurta } from "@/lib/formatacao/datas";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import { estadoFatura } from "@/lib/regras/comprovativos";
import type { Fatura, Recebimento } from "@/lib/repositorios/admin/pagamentos";

const t = textos.admin.pagamentos;

/** Faturas da Performa LAB e recebimentos registados (E.1). */
export function ListasPagamentos({
  faturas,
  recebimentos,
  nomes,
  emAnalise = new Set(),
}: {
  faturas: Fatura[];
  recebimentos: Recebimento[];
  nomes?: Map<string, string>;
  /** Faturas com um comprovativo em análise (D-168). */
  emAnalise?: ReadonlySet<string>;
}) {
  const estados = textos.comprovativos.estadosFatura;
  const numeros = new Map(faturas.map((f) => [f.id, f.numero]));
  const barbearia = nomes
    ? [
        {
          id: "barbearia",
          rotulo: t.colunas.barbearia,
          valor: (l: { inquilino_id: string }) => nomes.get(l.inquilino_id) ?? textos.comum.vazio,
        },
      ]
    : [];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="grid content-start gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.faturas}</h2>
        <TabelaCartoes<Fatura>
          linhas={faturas}
          chave={(f) => f.id}
          vazio={t.vazio}
          testId="fatura"
          colunas={[
            ...barbearia,
            { id: "numero", rotulo: t.colunas.numero, valor: (f) => f.numero },
            {
              id: "periodo",
              rotulo: t.colunas.periodo,
              valor: (f) => `${dataCurta(f.periodo_inicio)} – ${dataCurta(f.periodo_fim)}`,
            },
            {
              id: "valor",
              rotulo: t.colunas.valor,
              valor: (f) => formatarDinheiro(f.valor_centimos),
            },
            { id: "emitida", rotulo: t.colunas.emitida, valor: (f) => dataCurta(f.emitida_em) },
            {
              id: "paga",
              rotulo: t.colunas.paga,
              valor: (f) =>
                f.paga_em ? dataCurta(f.paga_em) : estados[estadoFatura(f, emAnalise)],
            },
          ]}
        />
      </section>
      <section className="grid content-start gap-2">
        <h2 className="text-[15px] font-bold text-ligacao">{t.recebimentos}</h2>
        <TabelaCartoes<Recebimento>
          linhas={recebimentos}
          chave={(r) => r.id}
          vazio={t.vazio}
          testId="recebimento"
          colunas={[
            ...barbearia,
            { id: "data", rotulo: t.colunas.data, valor: (r) => dataCurta(r.data) },
            { id: "metodo", rotulo: t.colunas.metodo, valor: (r) => t.metodos[r.metodo] },
            {
              id: "valor",
              rotulo: t.colunas.valor,
              valor: (r) => formatarDinheiro(r.valor_centimos),
            },
            {
              id: "fatura",
              rotulo: t.colunas.fatura,
              valor: (r) =>
                r.fatura_id ? (numeros.get(r.fatura_id) ?? textos.comum.vazio) : t.semFatura,
            },
          ]}
        />
      </section>
    </div>
  );
}
