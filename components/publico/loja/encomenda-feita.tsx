import { Check } from "lucide-react";
import Link from "next/link";
import { formatarDinheiro } from "@/lib/formatacao/dinheiro";
import type { TextosPublicos } from "@/lib/i18n/publico";
import type { LinhaSaco } from "./saco";

/** A encomenda feita (D-205): confirmação, o resumo e o que fazer a seguir. */
export function EncomendaFeita({
  t,
  linhas,
  totalCent,
  marcar,
  voltar,
}: {
  t: TextosPublicos;
  linhas: LinhaSaco[];
  totalCent: number;
  marcar: string | null;
  voltar: string;
}) {
  const l = t.loja;
  return (
    <div
      className="mx-auto grid w-full max-w-md justify-items-center gap-4 py-6 text-center"
      data-testid="encomenda-feita"
    >
      <span className="grid size-20 place-items-center rounded-full bg-accent text-primary animate-in zoom-in-50 duration-300">
        <Check aria-hidden className="size-10" />
      </span>
      <h2 className="text-2xl font-bold">{l.feita}</h2>
      <p className="text-sm text-muted-foreground">{l.feitaAjuda}</p>
      <ul className="cartao-modelo grid w-full divide-y rounded-[var(--raio)] border bg-card p-4 text-left text-sm">
        {linhas.map((x) => (
          <li key={x.produto.id} className="flex justify-between gap-3 py-2">
            <span>
              {x.produto.nome} × {x.quantidade}
            </span>
            <span className="numero font-semibold">
              {formatarDinheiro(x.produto.precoCent * x.quantidade)}
            </span>
          </li>
        ))}
        <li className="flex justify-between gap-3 pt-3 font-bold">
          <span>{l.totalCurto}</span>
          <span className="numero">{formatarDinheiro(totalCent)}</span>
        </li>
      </ul>
      <div className="grid w-full gap-2">
        {marcar ? (
          <Link
            href={marcar}
            className="grid h-12 place-items-center rounded-[var(--raio-botao)] bg-primary font-semibold text-primary-foreground"
          >
            {l.marcarTambem}
          </Link>
        ) : null}
        <Link
          href={voltar}
          className="grid h-12 place-items-center rounded-[var(--raio-botao)] border font-semibold"
        >
          {l.voltar}
        </Link>
      </div>
    </div>
  );
}
