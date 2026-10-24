import { BarraProgresso } from "@/components/nucleo/barra-progresso";
import { pontoDeEquilibrio, valorDoPlano } from "@/lib/financas/indicadores";
import { textos } from "@/lib/i18n/pt-PT";
import type { RegimeIva } from "@/lib/regras/mensalidade";

const t = textos.financas.equilibrio;

/**
 * Ponto de equilíbrio (O.6) em três respostas: a mistura (real ou escolhida), só Basic e só
 * Pro, com a barra de quantas faltam. Sem margem por barbearia, diz que não existe.
 */
export function PontoEquilibrio({
  fixos,
  variavelPorBarbearia,
  valorMedio,
  ativas,
  percentBasic,
  regime,
  mesPrevisto,
}: {
  fixos: number;
  variavelPorBarbearia: number;
  valorMedio: number;
  ativas: number;
  percentBasic: number | null;
  regime: RegimeIva;
  /** O mês em que a previsão base (O.8) chega ao equilíbrio, por extenso, ou nulo. */
  mesPrevisto: string | null;
}) {
  const respostas = [
    {
      id: "mistura",
      rotulo: percentBasic === null ? t.mistura : t.misturaEscolhida(percentBasic),
      n: pontoDeEquilibrio(fixos, valorMedio, variavelPorBarbearia),
    },
    {
      id: "basic",
      rotulo: t.soBasic,
      n: pontoDeEquilibrio(fixos, valorDoPlano("basic", regime), variavelPorBarbearia),
    },
    {
      id: "pro",
      rotulo: t.soPro,
      n: pontoDeEquilibrio(fixos, valorDoPlano("pro", regime), variavelPorBarbearia),
    },
  ];
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">{t.formula}</p>
      <ul className="grid gap-3 md:grid-cols-3">
        {respostas.map((r) => (
          <li
            key={r.id}
            className="cartao grid content-start gap-2 rounded-2xl p-4"
            data-testid={`equilibrio-${r.id}`}
          >
            <span className="rotulo">{r.rotulo}</span>
            {r.n === null ? (
              <p className="text-sm">{t.naoExiste}</p>
            ) : (
              <>
                <span className="numero text-2xl font-bold">{t.barbearias(r.n)}</span>
                <BarraProgresso
                  percentagem={r.n > 0 ? (ativas / r.n) * 100 : 100}
                  rotulo={r.rotulo}
                />
                <span className="text-sm text-muted-foreground">{t.faltam(r.n - ativas)}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="text-sm" data-testid="equilibrio-previsto">
        {mesPrevisto ? t.previsto(mesPrevisto) : t.previstoNunca}
      </p>
    </div>
  );
}
