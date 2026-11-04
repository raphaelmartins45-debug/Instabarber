import { ArrowLeft } from "lucide-react";
import { horaCurta } from "@/lib/formatacao/datas";
import type { TextosPublicos } from "@/lib/i18n/publico";

/**
 * O progresso da marcação (D-205): uma barra por passo e «Passo 2 de 4 · Barbeiro»; e, no
 * telemóvel, o resumo do que já se escolheu, fixo no fundo.
 */
export function ProgressoMarcacao({
  t,
  passos,
  atual,
}: {
  t: TextosPublicos;
  /** Os nomes dos passos, pela ordem (sem o do barbeiro, quando só há um). */
  passos: string[];
  /** O índice do passo atual, de 0. */
  atual: number;
}) {
  return (
    <div className="grid gap-2">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${passos.length}, 1fr)` }}
      >
        {passos.map((p, i) => (
          <span
            key={p}
            aria-hidden
            className={`h-1 rounded-full transition-colors ${i <= atual ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-mini font-semibold tracking-wide text-muted-foreground uppercase">
        {t.marcacao.passoDe(atual + 1, passos.length, passos[atual] ?? "")}
      </p>
    </div>
  );
}

/** Os passos que existem (com um só barbeiro, o do barbeiro não existe) e onde se está. */
export function progressoDe(
  passo: string,
  umSo: boolean,
  rotulos: { servico: string; barbeiro: string; hora: string; dados: string },
): { nomes: string[]; indice: number } {
  const ordem = umSo
    ? (["servico", "hora", "dados"] as const)
    : (["servico", "barbeiro", "hora", "dados"] as const);
  return {
    nomes: ordem.map((p) => rotulos[p]),
    indice: Math.max(0, (ordem as readonly string[]).indexOf(passo)),
  };
}

export function ResumoMovel({
  servico,
  barbeiro,
  inicio,
}: {
  servico: string;
  barbeiro?: string;
  inicio?: string;
}) {
  return (
    <div className="cartao-modelo fixed inset-x-3 bottom-3 z-20 grid gap-0.5 rounded-[var(--raio)] border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg animate-in slide-in-from-bottom duration-200 md:hidden">
      <span className="truncate font-bold">{servico}</span>
      <span className="truncate text-muted-foreground">
        {[barbeiro, inicio ? horaCurta(inicio) : null].filter(Boolean).join(" · ") || " "}
      </span>
    </div>
  );
}

/** Voltar ao passo anterior (D-205). */
export function BotaoVoltar({ rotulo, aoVoltar }: { rotulo: string; aoVoltar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoVoltar}
      className="inline-flex h-11 items-center gap-2 justify-self-start text-sm font-semibold underline-offset-4 hover:underline"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {rotulo}
    </button>
  );
}
