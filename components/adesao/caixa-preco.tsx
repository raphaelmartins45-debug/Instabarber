import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import { textos } from "@/lib/i18n/pt-PT";
import type { Preco } from "@/lib/regras/mensalidade";

const t = textos.adesao.contratacao;

/** Total com e sem IVA, periodicidade e decomposição (D.6). */
export function CaixaPreco({
  preco,
  anual,
  regimeIsento,
  linhas,
}: {
  preco: Preco;
  anual: boolean;
  regimeIsento: boolean;
  linhas: { rotulo: string; valorCent: number }[];
}) {
  return (
    <div
      className="grid gap-2 rounded-lg border border-destaque/40 bg-accent p-4"
      data-testid="caixa-preco"
    >
      <p className="text-2xl font-extrabold">
        {formatarDinheiro(preco.comIva)}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {t.comIva} · {anual ? t.porAno : t.porMes}
        </span>
      </p>
      <p className="text-sm">
        {formatarDinheiro(preco.semIva)} {t.semIva} ·{" "}
        {regimeIsento ? t.isento : t.ivaIncluido(formatarDinheiro(preco.comIva - preco.semIva))}
      </p>
      <ul className="grid gap-1 border-t pt-2 text-sm">
        {linhas.map((l) => (
          <li key={l.rotulo} className="flex justify-between gap-3">
            <span className="text-muted-foreground">{l.rotulo}</span>
            <span>{formatarDinheiro(l.valorCent)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
